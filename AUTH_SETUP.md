# Toolora — conexión de autenticación

## Antes de probar
En `supabase-config.js` deben existir los datos reales del proyecto:
- `url`: Project URL, por ejemplo `https://xxxxx.supabase.co`
- `anonKey`: clave pública `anon` o `sb_publishable_...`

No uses `service_role` ni una secret key en el navegador.

## Registro por correo
Supabase → Authentication → Sign In / Providers → Email: habilitado.
En Authentication → URL Configuration:
- Site URL: `https://toolora-9jq.pages.dev`
- Redirect URLs: `https://toolora-9jq.pages.dev/**`

El usuario se registra con correo y contraseña. Si está activa la confirmación de correo, debe abrir el enlace recibido antes de iniciar sesión.

## Google OAuth
El botón Google no puede autenticar hasta que Google OAuth esté configurado en ambos lados:
1. Supabase → Authentication → Sign In / Providers → Google: activar.
2. En Google Cloud Console, crear credenciales OAuth de tipo Web.
3. En Google Cloud, agregar como Authorized redirect URI la URL exacta que Supabase muestra en el proveedor Google (normalmente `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Copiar Client ID y Client Secret de Google en el proveedor Google de Supabase y guardar.
5. En Supabase → Authentication → URL Configuration, mantener `https://toolora-9jq.pages.dev/**` como Redirect URL permitida.

## Comprobación
- Abrir `/registro.html`, registrar un correo real y verificar el mensaje de estado.
- Si se exige confirmación, abrir el correo y luego entrar por `/entrar.html`.
- Abrir `/entrar.html` y probar Google solo después de completar el apartado OAuth.

El código ahora muestra errores concretos en pantalla cuando falta configuración o no se puede cargar el SDK; no oculta los fallos.
