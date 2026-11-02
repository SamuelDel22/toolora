# Toolora

Toolora es una plataforma estática de herramientas gratuitas. La primera versión no necesita backend ni base de datos y puede publicarse en un hosting estático.

## Herramientas incluidas

- Calculadora de porcentajes.
- Utilidades de texto.
- Generador de contraseñas con `crypto.getRandomValues`.
- Conversor y redimensionador de imágenes en el navegador.
- Generador de códigos QR (requiere conexión para cargar la biblioteca QRCode.js desde CDN).
- Calculadora de precios para pequeños negocios.
- Generador local de ideas de nombres.
- Creador de hoja de vida con impresión / Guardar PDF.

## Ejecutar localmente

Abre `index.html` en un navegador moderno. Para evitar restricciones del navegador y probar como en producción, se recomienda usar un servidor estático local, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Publicar gratis en Cloudflare Pages

1. Sube los archivos de este directorio a un repositorio de GitHub.
2. En Cloudflare, abre Workers & Pages y crea una aplicación Pages conectada al repositorio.
3. Como no se necesita compilación, deja el comando de build vacío y establece el directorio de salida en `/` o en el directorio raíz del repositorio, según el formulario actual.
4. Despliega y prueba la URL generada en móvil y escritorio.
5. Cambia el dominio de ejemplo de `robots.txt` y `sitemap.xml` por el dominio público real antes de promocionar el sitio.

Los paneles de Cloudflare pueden cambiar; revisa las opciones vigentes durante la configuración.

## Notas importantes

- La función QR carga una biblioteca desde cdnjs; requiere conexión a internet. Si el CDN no está disponible, la función muestra un mensaje.
- Se cargan fuentes de Google Fonts por CSS. Si no están disponibles, se usan fuentes de sistema.
- No se integra publicidad real ni hay IDs publicitarios ficticios.
- Los enlaces de privacidad, acerca de y contacto del pie de página son puntos de partida; antes del lanzamiento deben convertirse en páginas reales con contenido correcto. El correo `hola@toolora.example` es un marcador y debe reemplazarse o quitarse.
- No hay analítica ni envío de los datos de las herramientas a un backend. La preferencia de tema se guarda localmente en el navegador.
- La página no incluye cuentas de usuario ni guarda resultados de herramientas.

## Antes del lanzamiento público

- [ ] Reemplazar `TU-DOMINIO.example` en `robots.txt` y `sitemap.xml`.
- [ ] Corregir o retirar el correo de contacto de ejemplo.
- [ ] Crear páginas reales para privacidad, términos, acerca de y contacto.
- [ ] Probar funciones y diseño en Safari iOS, Chrome Android y escritorio.
- [ ] Ejecutar pruebas de accesibilidad, rendimiento y seguridad.
- [ ] Confirmar los requisitos legales y de publicidad aplicables.
