
const json = (body, status = 200) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  }
);

async function getUser(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: auth
    }
  });

  if (!response.ok) return null;
  return response.json();
}

export async function onRequestPost({ request, env }) {
  try {
    if (env.PREMIUM_LAUNCH_ENABLED !== 'true') {
      return json({
        error: 'Toolora Premium todavía no está habilitado.'
      }, 503);
    }

    const requiredVariables = [
      'MP_ACCESS_TOKEN',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVariables = requiredVariables.filter(name =>
      typeof env[name] !== 'string' || !env[name].trim()
    );

    if (missingVariables.length) {
      return json({
        error: 'Faltan variables de configuración en Cloudflare.',
        missing: missingVariables
      }, 503);
    }

    const user = await getUser(request, env);

    if (!user?.id || !user?.email) {
      return json({ error: 'Inicia sesión para contratar Premium.' }, 401);
    }

    const externalReference = `toolora-premium-monthly-${user.id}`;
    const origin = new URL(request.url).origin;

    const mpResponse = await fetch(
      'https://api.mercadopago.com/preapproval',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID()
        },
        body: JSON.stringify({
          reason: 'Toolora Premium - suscripción mensual',
          external_reference: externalReference,
          payer_email: user.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 9900,
            currency_id: 'COP'
          },
          back_url: `${origin}/pro.html?checkout=return`,
          notification_url: `${origin}/api/mercadopago-webhook`,
          status: 'pending'
        })
      }
    );

    const subscription = await mpResponse.json().catch(() => ({}));

    if (!mpResponse.ok || !subscription.init_point || !subscription.id) {
      return json({
        error: 'Mercado Pago no pudo iniciar la suscripción.',
        provider_status: mpResponse.status
      }, 502);
    }

    const save = await fetch(
      `${env.SUPABASE_URL}/rest/v1/subscriptions`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user.id,
          provider: 'mercadopago',
          provider_subscription_id: String(subscription.id),
          plan_code: 'premium_monthly',
          status: 'pending',
          amount_cop: 9900,
          currency: 'COP',
          payer_email: user.email,
          external_reference: externalReference
        })
      }
    );

    if (!save.ok) {
      return json({
        error: 'No se pudo guardar la solicitud en Supabase.'
      }, 502);
    }

    return json({ checkout_url: subscription.init_point });

  } catch {
    return json({
      error: 'No fue posible iniciar el proceso de pago.'
    }, 500);
  }
}
