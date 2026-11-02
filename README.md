# Toolora

Plataforma estática de herramientas gratuitas. No necesita backend ni base de datos para la versión actual.

## Herramientas
1. Calculadora de porcentajes.
2. Utilidades de texto.
3. Generador de contraseñas.
4. Conversor de imágenes.
5. Generador de códigos QR (QRCode.js desde CDN).
6. Calculadora de precios.
7. Generador de ideas de nombres.
8. Creador de hoja de vida.

## Publicar en Cloudflare Pages
- Framework preset: **None**.
- Build command: vacío.
- Build output directory: `.` si `index.html` está en la raíz configurada.
- Si subes la carpeta `toolora` completa al repositorio y no sus contenidos, configura Root directory como `toolora`.
- Production branch: `main` o la rama principal real del repositorio.

## SEO incluido
- Títulos y descripciones en español.
- URL canónica y metadatos Open Graph.
- Datos estructurados básicos de WebSite.
- `robots.txt` y sitemap XML con las páginas públicas.
- Texto introductorio útil para explicar el contenido de la plataforma.

## Páginas públicas
- `privacidad.html`
- `terminos.html`
- `acerca.html`
- `contacto.html`

## Monetización
No hay anuncios activos ni identificadores publicitarios ficticios. Consulta `ADSENSE_SETUP.md` para completar la configuración cuando tengas una cuenta de AdSense y el sitio cumpla los requisitos. Configura un correo real de soporte antes de solicitar revisión.

## Privacidad y dependencias
- No hay cuentas ni backend propio que almacene resultados.
- La preferencia de tema se guarda localmente en el navegador.
- QRCode.js se carga desde cdnjs y las fuentes desde Google Fonts.
- Las páginas legales son una base informativa, no asesoría jurídica; actualízalas si cambias los servicios o el tratamiento de datos.

## Ejecutar localmente
Abre `index.html` o ejecuta `python -m http.server 8000` y visita `http://localhost:8000`.
