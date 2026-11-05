(() => {
  const $ = (selector) => document.querySelector(selector);
  const form = $('#guideForm');
  if (!form) return;
  const prompt = $('#guidePrompt');
  const result = $('#guideResult');
  const routes = [
    {id:'porcentajes', keys:['porcentaje','descuento','aumento','rebaja','variacion','iva','interes'], title:'Calculadora de porcentajes', reason:'Sirve para calcular descuentos, aumentos, proporciones y variaciones.'},
    {id:'precios', keys:['precio','ganancia','margen','costo','coste','comision','vender','venta','rentable'], title:'Calculadora de precios', reason:'Te ayuda a estimar un precio de venta considerando costos, margen y comisión.'},
    {id:'texto', keys:['texto','palabras','caracteres','contar','mayuscula','minuscula','limpiar','parrafo'], title:'Utilidades de texto', reason:'Cuenta palabras y caracteres, limpia espacios y cambia el formato.'},
    {id:'password', keys:['contrasena','contraseña','password','clave','segura','seguridad'], title:'Generador de contraseñas', reason:'Crea una contraseña aleatoria ajustando longitud y caracteres.'},
    {id:'imagenes', keys:['imagen','foto','jpg','png','webp','comprimir','convertir','formato','redimensionar'], title:'Conversor de imágenes', reason:'Convierte formatos y ajusta dimensiones desde el navegador.'},
    {id:'qr', keys:['qr','codigo','código','enlace','link','escane','compartir'], title:'Generador de códigos QR', reason:'Transforma un enlace o texto en un código QR descargable.'},
    {id:'nombres', keys:['nombre','marca','branding','emprendimiento','idea','negocio','proyecto'], title:'Ideas de nombres', reason:'Genera combinaciones creativas para explorar nombres de proyectos y marcas.'},
    {id:'cv', keys:['hoja de vida','curriculum','currículum','curriculum vitae','cv','empleo','trabajo','perfil profesional'], title:'Creador de hoja de vida', reason:'Organiza perfil, formación, experiencia y habilidades en un documento imprimible.'}
  ];
  const normalize = (s) => s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = normalize(prompt.value.trim());
    if (!query) { prompt.focus(); return; }
    const match = routes.map(item => ({...item, score:item.keys.reduce((n,key)=>n+(query.includes(normalize(key))? (normalize(key).includes(' ') ? 3 : 1):0),0)}))
      .sort((a,b)=>b.score-a.score)[0];
    if (!match || match.score === 0) {
      result.innerHTML = '<div class="guide-result-mark">t<span>.</span></div><span class="guide-result-label">TOOLORA GUIDE</span><h3>Vamos a encontrar el camino.</h3><p>No identifiqué una herramienta exacta. Prueba describiendo si necesitas calcular, escribir, convertir una imagen, crear un QR o preparar una hoja de vida.</p><a class="guide-result-link" href="#herramientas">Ver todas las herramientas <span>↗</span></a>';
      return;
    }
    result.innerHTML = `<div class="guide-result-mark">✓</div><span class="guide-result-label">RECOMENDACIÓN PARA TU TAREA</span><h3>${match.title}</h3><p>${match.reason}</p><a class="guide-result-link" href="/?tool=${encodeURIComponent(match.id)}#herramientas">Abrir esta herramienta <span>↗</span></a>`;
  });
  document.querySelectorAll('[data-guide-example]').forEach(button => button.addEventListener('click',()=>{prompt.value=button.dataset.guideExample;form.requestSubmit()}));
})();