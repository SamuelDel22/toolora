const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function validSignature(request, secret, dataId) {
  if (!secret) return false;
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!parts.ts || !parts.v1 || !requestId || !dataId) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)));
  if (digest.length !== parts.v1.length) return false;
  let diff = 0; for (let i = 0; i < digest.length; i++) diff |= digest.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}
export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || body?.data?.id;
    if (!await validSignature(request, env.MP_WEBHOOK_SECRET, dataId)) return json({ error: 'Firma no válida.' }, 401);
    const topic = url.searchParams.get('type') || body.type || body.topic || '';
    if (!['subscription_preapproval', 'subscription_authorized_payment'].includes(topic)) return json({ received: true, ignored: true });

    // Consultar el objeto directamente a Mercado Pago; no confiar en el estado del webhook.
    const endpoint = topic === 'subscription_preapproval'
      ? `https://api.mercadopago.com/preapproval/${encodeURIComponent(dataId)}`
      : `https://api.mercadopago.com/authorized_payments/${encodeURIComponent(dataId)}`;
    const providerRes = await fetch(endpoint, { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
    if (!providerRes.ok) return json({ error: 'No se pudo verificar el evento con Mercado Pago.' }, 502);
    const item = await providerRes.json();
    if (topic === 'subscription_preapproval') {
      const external = String(item.external_reference || '');
      const match = external.match(/^toolora-premium-monthly-([0-9a-f-]{36})$/i);
      if (!match) return json({ received: true, ignored: true });
      const status = item.status === 'authorized' ? 'authorized' : item.status === 'cancelled' ? 'cancelled' : item.status === 'paused' ? 'paused' : 'pending';
      const upsert = await fetch(`${env.SUPABASE_URL}/rest/v1/subscriptions?on_conflict=provider_subscription_id`, {
        method: 'POST', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: match[1], provider: 'mercadopago', provider_subscription_id: String(item.id), plan_code: 'premium_monthly', status, amount_cop: 9900, currency: 'COP', payer_email: item.payer_email || null, external_reference: external, next_payment_at: item.next_payment_date || null, updated_at: new Date().toISOString() })
      });
      if (!upsert.ok) return json({ error: 'No se pudo sincronizar la suscripción.' }, 502);
    }
    // Los eventos de factura se registran para auditoría; la concesión de acceso se basa en
    // el estado autorizado de la suscripción consultada al proveedor, nunca en el body recibido.
    return json({ received: true });
  } catch (_) { return json({ error: 'Error procesando la notificación.' }, 500); }
}
