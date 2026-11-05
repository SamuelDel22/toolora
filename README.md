# Toolora

Plataforma estática de herramientas gratuitas. No necesita backend ni base de datos para la versión actual.

## Herramientas incluidas
1. Calculadora de porcentajes.
2. Utilidades de texto.
3. Generador de contraseñas.
4. Conversor de imágenes.
5. Generador de códigos QR (QRCode.js desde CDN).
6. Calculadora de precios.
7. Ideas de nombres.
8. Creador de hoja de vida.

## Mi Toolora
- Favoritos y herramientas recientes se guardan en `localStorage` del navegador.
- No hay cuenta, sincronización entre dispositivos ni envío de esos datos a un servidor.
- El usuario puede borrar estos datos desde la configuración del navegador.

## PWA y funcionamiento sin conexión
- Incluye `manifest.webmanifest` y `sw.js` para instalación en dispositivos compatibles y caché del shell estático.
- Debe servirse por HTTPS (Cloudflare Pages ya lo proporciona) o localhost.
- La función QR depende de una biblioteca externa y requiere conexión si no está disponible en caché.
- La caché offline no garantiza que todas las herramientas o recursos externos funcionen sin internet.

## Publicar en Cloudflare Pages
- Framework preset: **None**.
- Build command: vacío.
- Build output directory: `.` si `index.html` está en la raíz configurada.
- Si el repositorio contiene la carpeta `toolora`, configura Root directory como `toolora`.
- Production branch: la rama principal real, normalmente `main`.

## SEO incluido
- Títulos, descripciones y canonical.
- Metadatos Open Graph y datos estructurados básicos.
- `robots.txt` y sitemap XML.
- Texto descriptivo útil en la página principal.

## Páginas públicas
- `privacidad.html`
- `terminos.html`
- `acerca.html`
- `contacto.html` (correo: TooloraSupport@gmail.com)

## AdSense
El identificador de editor integrado es `ca-pub-5937829012707992`. El script de AdSense por sí solo no crea espacios publicitarios ni garantiza que se publiquen anuncios. Antes de monetizar, verifica el estado de aprobación, agrega unidades de anuncio donde corresponda y configura el consentimiento/cookies exigido para los países de tus visitantes. No declares que existe consentimiento gestionado si no has integrado una CMP o una solución válida.

## Ejecutar localmente
Abre `index.html` o ejecuta `python -m http.server 8000` y visita `http://localhost:8000`. Para probar service workers, utiliza localhost o HTTPS.


## Cuentas Toolora (Supabase Auth)
La interfaz admite registro con cualquier correo válido (por ejemplo Gmail o iCloud) y contraseña, además de acceso con Google y Google. La autenticación real requiere configurar Supabase:

1. Crea un proyecto en https://supabase.com/.
2. En Authentication → URL Configuration, añade el dominio publicado de Toolora a Site URL y Redirect URLs.
3. Copia Project URL y anon/public key en `supabase-config.js`. Nunca uses la `service_role` key en el navegador.
4. En Authentication → Providers, activa Email. Para los botones Google y Google, configura sus credenciales OAuth en Supabase y en cada proveedor.
5. Configura el envío de correos SMTP en Supabase para confirmaciones fiables en producción.

La cuenta con email y contraseña acepta direcciones Gmail, iCloud y otros proveedores; no es necesario que el usuario use OAuth. Google y Google son accesos externos opcionales y solo funcionarán tras configurar sus credenciales. La sincronización de favoritos e historial usa metadatos del usuario autenticado.

**Antes de publicar:** reemplaza los valores de ejemplo en `supabase-config.js`, prueba confirmación de correo, inicio/cierre de sesión y OAuth en el dominio final, y revisa los textos legales según los servicios finalmente habilitados.


## Toolora 5.0 — descubrimiento y crecimiento
- Se añadieron páginas HTML individuales para las ocho herramientas, con canonical, metadatos Open Graph y datos estructurados `SoftwareApplication`.
- El sitemap incluye las páginas públicas y las ocho páginas de herramientas. `robots.txt` declara el sitemap y evita indexar las pantallas de acceso/registro.
- Los botones de las páginas SEO abren la herramienta correspondiente mediante enlaces profundos `/?tool=<id>`.
- Toolora Guide es un asistente de orientación local basado en reglas y palabras clave. No es un modelo generativo ni envía consultas a un proveedor de IA.
- El buscador admite el atajo `/` y `Ctrl/Cmd + K`.
- Toolora Pro es una página informativa de producto en desarrollo. No procesa pagos ni ofrece suscripciones activas.
- Favoritos e historial continúan en localStorage y pueden sincronizarse mediante los metadatos del usuario autenticado, según la configuración y políticas de Supabase. No se garantiza sincronización hasta probarla en el proyecto publicado.

## Publicación y validación
1. Sube el contenido de `toolora-main/` a la raíz de la carpeta configurada como raíz del proyecto en Cloudflare Pages.
2. Comprueba la página principal, las ocho rutas `/herramientas/*.html`, la apertura directa de herramientas y registro/inicio de sesión.
3. En Search Console envía `https://toolora-9jq.pages.dev/sitemap.xml`. La inclusión y el posicionamiento en Google no son inmediatos ni están garantizados.
4. Revisa que el dominio de producción siga siendo `toolora-9jq.pages.dev`; si cambia, actualiza canonical, Open Graph, sitemap y robots.
5. No añadas claves secretas de Supabase ni claves de proveedores de IA al JavaScript del navegador. Para IA generativa real se requiere un backend/Worker con secretos configurados como variables protegidas.
