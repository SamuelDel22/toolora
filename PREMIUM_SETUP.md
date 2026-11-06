# Toolora Premium — configuración y puesta en marcha

## Decisiones del producto
- Plan gratuito: $0 COP.
- Toolora Premium mensual: $9.900 COP.
- Proveedor: Mercado Pago Suscripciones (`POST /preapproval`).
- Dominio actual: `https://toolora-9jq.pages.dev`.

## Estado de este paquete
La página Premium, la estructura de base de datos y las funciones Cloudflare Pages para iniciar/cancelar suscripciones y recibir notificaciones están preparadas. **Los cobros están bloqueados por defecto** (`PREMIUM_LAUNCH_ENABLED` no debe configurarse como `true` todavía). El paquete no incluye credenciales privadas y no activa Premium hasta recibir confirmación verificada del servidor.

Las prestaciones Premium descritas en la página son el alcance comercial propuesto. Antes de empezar a cobrar, implementar y probar cada una de ellas y actualizar la descripción para que solo prometa funciones realmente disponibles.

## 1. Crear cuenta de vendedor
1. Entra a https://www.mercadopago.com.co/ y crea/valida una cuenta de vendedor a nombre de la persona o empresa que operará Toolora.
2. Completa la verificación de identidad y los datos bancarios/fiscales solicitados por Mercado Pago.
3. En https://www.mercadopago.com.co/developers/panel crea una aplicación para Toolora.
4. Configura primero credenciales de prueba. No compartas el Access Token por chat ni lo pegues en archivos del repositorio.

## 2. Configurar Supabase
1. Abre el proyecto Supabase conectado a Toolora.
2. En SQL Editor ejecuta el archivo `supabase/premium.sql`.
3. En Project Settings → API, copia la Project URL, anon/publishable key y service_role key. La service_role key es secreta.

## 3. Variables de entorno de Cloudflare Pages
En Workers & Pages → tu proyecto → Settings → Variables and Secrets, añade estas variables como secretos donde corresponda:

- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave pública anon/publishable del proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: clave service_role de Supabase (secreto, solo backend).
- `MP_ACCESS_TOKEN`: Access Token de Mercado Pago (secreto, primero de prueba).
- `MP_WEBHOOK_SECRET`: clave secreta de firma Webhooks de la aplicación de Mercado Pago.
- `PREMIUM_LAUNCH_ENABLED`: dejar sin configurar o `false` durante desarrollo.

No uses `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN` ni `MP_WEBHOOK_SECRET` en JavaScript del navegador, HTML o GitHub.

## 4. Configurar notificaciones en Mercado Pago
En el panel de desarrolladores, configura la URL:

`https://toolora-9jq.pages.dev/api/mercadopago-webhook`

Selecciona los eventos de suscripciones:
- `subscription_preapproval`
- `subscription_authorized_payment`

Copia la clave secreta de firma al secreto `MP_WEBHOOK_SECRET`. La función verifica la firma y consulta el objeto directamente a Mercado Pago antes de sincronizar el estado.

## 5. Pruebas obligatorias antes de cobrar
- Crear suscripción con cuenta de prueba y confirmar que redirige al checkout de prueba.
- Probar pago autorizado, pendiente, rechazado y cancelado.
- Probar webhook con firma inválida (debe responder 401).
- Probar webhook repetido y comprobar que no duplica la suscripción.
- Confirmar que un usuario no puede leer la suscripción de otro.
- Confirmar que no hay activación Premium antes de estado `authorized`.
- Probar cancelación desde Toolora y comprobarla en Mercado Pago.
- Probar que si Mercado Pago o Supabase fallan, no se concede acceso.

## 6. Habilitar producción
Solo después de implementar y probar las prestaciones reales, revisar términos, política de privacidad, precio, renovación, cancelación, reembolsos y obligaciones legales/fiscales aplicables en Colombia. Cambiar las credenciales por las de producción y habilitar `PREMIUM_LAUNCH_ENABLED=true`.

## Nota técnica importante
La tabla `subscriptions` registra el estado del proveedor y permite al usuario autenticado consultar solo sus propias filas. Las escrituras se realizan desde funciones backend con `service_role`. Para cualquier función premium futura, el servidor debe verificar el estado autorizado de la suscripción; no confiar en flags de `localStorage`, metadatos editables del usuario ni parámetros enviados por el navegador.
