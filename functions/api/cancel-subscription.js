const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export async function onRequestPost({ request, env }) {
  try {
    const auth = request.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return json({ error: 'Inicia sesión.' }, 401);
    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: auth } });
    if (!userRes.ok) return json({ error: 'Sesión no válida.' }, 401);
    const user = await userRes.json();
    const rowsRes = await fetch(`${env.SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&status=in.(authorized,pending)&select=provider_subscription_id&order=created_at.desc&limit=1`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } });
    const rows = await rowsRes.json();
    const id = rows?.[0]?.provider_subscription_id;
    if (!id) return json({ error: 'No encontramos una suscripción activa para cancelar.' }, 404);
    const mp = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, { method: 'PUT', headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
    if (!mp.ok) return json({ error: 'Mercado Pago no pudo cancelar la suscripción. Inténtalo de nuevo.' }, 502);
    const updated = await fetch(`${env.SUPABASE_URL}/rest/v1/subscriptions?provider_subscription_id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() }) });
    if (!updated.ok) return json({ error: 'Cancelación recibida por el proveedor, pero falta sincronizar el estado. Contacta soporte.' }, 502);
    return json({ ok: true, message: 'Suscripción cancelada.' });
  } catch (_) { return json({ error: 'No fue posible cancelar la suscripción.' }, 500); }
}
