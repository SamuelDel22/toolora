# Activar registro e inicio de sesión

La interfaz está preparada para Supabase Auth. Para activar las cuentas reales:

1. Crea un proyecto en Supabase.
2. Copia Project URL y anon/public key desde Project Settings → API.
3. Pégalos en `supabase-config.js`. La anon key puede estar en el navegador; nunca uses service_role.
4. En Authentication → URL Configuration, configura Site URL con el dominio Cloudflare Pages y añade también `https://TU-DOMINIO/*` a Redirect URLs.
5. En Authentication → Providers, habilita Email. Los registros aceptan cualquier proveedor de correo, incluidos Gmail e iCloud. El usuario crea una contraseña para Toolora y confirma su correo si la confirmación está activa.
6. Para Google, configura el OAuth Client ID/Secret en Google Cloud y Supabase.
7. Para Google, configura Sign in with Google en Google Developer y añade Service ID, Team ID, Key ID y la clave privada en Supabase. Google requiere cuenta de desarrollador y configuración del dominio/callback.
8. Configura SMTP personalizado en Supabase para que los mensajes de verificación no dependan del servicio de prueba.

Los botones Google y Google no pueden autenticar hasta que se completen sus credenciales en los paneles respectivos. Email/contraseña sí funciona al configurar Supabase.


Toolora utiliza pantallas separadas: `entrar.html` para iniciar sesión y `registro.html` para crear una cuenta. El único proveedor OAuth visible es Google. Los correos Gmail, iCloud, Outlook y otros se pueden registrar con correo y contraseña.
