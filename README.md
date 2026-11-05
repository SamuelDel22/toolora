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


## Toolora 4.0 — actualización de experiencia

- Modal de herramientas rediseñado como espacio de trabajo adaptable a móvil.
- Introducciones breves por herramienta y controles visuales unificados.
- Texto: formato título y descarga TXT.
- Contraseñas: mostrar/ocultar y estimación visual de fortaleza.
- Imágenes: selección y arrastrar/soltar con validación de tamaño y tipo.
- QR: vista previa presentada en un escenario dedicado.
- Espacio personal: refresca favoritos e historial al restaurar datos de una sesión.
- Service Worker actualizado a `toolora-static-v7`.

Las herramientas siguen procesando los datos localmente en el navegador, salvo la autenticación y sincronización de cuenta que usan Supabase.
