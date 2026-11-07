/* =====================================================================
   Service worker de la app Herederas del Reino
   - Páginas, estilos y código: primero internet (siempre lo más nuevo);
     sin conexión se usa la última copia guardada.
   - Imágenes y fuentes: se guardan para que la app abra rápido.
   - NO toca: formularios ni envíos (POST), la hoja del Muro de oración,
     Google Forms, la canción (audio), el portal original /bienvenida/
     ni ningún otro sitio externo.
   Al publicar cambios en este archivo, sube VERSION: la app mostrará
   «Hay una versión nueva» y limpiará la caché anterior.
   ===================================================================== */
const VERSION = 'hr-app-v3';
const CACHE_PAGINAS = `${VERSION}-paginas`;
const CACHE_RECURSOS = `${VERSION}-recursos`;
const MAX_RECURSOS = 180;

const ESENCIALES = [
  '/offline.html',
  '/assets/app/app.css?v=3',
  '/assets/app/app.js?v=3',
  '/assets/app/offline.js',
  '/assets/app/iconos/icono-192.png',
  '/assets/img/logo-oficial.webp',
];

const FUENTES = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_PAGINAS).then((c) => c.addAll(ESENCIALES)));
  // No se activa solo: la página pregunta antes (aviso «Actualizar»),
  // salvo en la primera instalación, que no tiene versión anterior.
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n.startsWith('hr-app-') && !n.startsWith(VERSION)).map((n) => caches.delete(n)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'ACTUALIZAR') self.skipWaiting();
});

const esRecurso = (url) => /\.(?:webp|png|jpe?g|gif|svg|ico|woff2?|ttf)$/i.test(url.pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // formularios y envíos: directo a internet
  if (req.headers.has('range')) return;                   // audio y video por partes
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    if (FUENTES.includes(url.hostname)) e.respondWith(guardadoYRenovar(e, req));
    return;                                               // Google Forms, hoja del Muro, redes: sin tocar
  }
  if (url.pathname === '/bienvenida' || url.pathname.startsWith('/bienvenida/')) return;  // portal original (otro repositorio)
  if (url.pathname === '/sw.js' || /\.(?:mp3|m4a|ogg|wav|mp4|webm)$/i.test(url.pathname)) return;

  if (req.mode === 'navigate') e.respondWith(paginaPrimeroInternet(e));
  else if (esRecurso(url)) e.respondWith(guardadoYRenovar(e, req));
  else e.respondWith(primeroInternet(req));               // css, js, manifiesto, datos propios
});

async function paginaPrimeroInternet(e) {
  const cache = await caches.open(CACHE_PAGINAS);
  try {
    const respuesta = (await e.preloadResponse) || await fetch(e.request);
    if (respuesta.ok && respuesta.type === 'basic') cache.put(sinParametrosApp(e.request.url), respuesta.clone());
    return respuesta;
  } catch {
    return (await cache.match(sinParametrosApp(e.request.url), { ignoreSearch: false }))
      || (await cache.match(sinParametrosApp(e.request.url), { ignoreSearch: true }))
      || (await caches.match('/offline.html'));
  }
}

// /?origen=app y / son la misma página
function sinParametrosApp(direccion) {
  const u = new URL(direccion); u.hash = ''; u.searchParams.delete('origen'); return u.href;
}

async function primeroInternet(req) {
  const cache = await caches.open(CACHE_PAGINAS);
  try {
    const respuesta = await fetch(req);
    if (respuesta.ok && respuesta.type === 'basic') cache.put(req, respuesta.clone());
    return respuesta;
  } catch {
    const guardada = await caches.match(req);
    if (guardada) return guardada;
    throw new Error('sin conexión');
  }
}

async function guardadoYRenovar(e, req) {
  const cache = await caches.open(CACHE_RECURSOS);
  const guardada = await caches.match(req);
  const renovar = fetch(req).then(async (respuesta) => {
    if (respuesta.ok || respuesta.type === 'opaque') {
      await cache.put(req, respuesta.clone());
      recortar(cache);
    }
    return respuesta;
  }).catch(() => guardada || Response.error());
  if (guardada) { e.waitUntil(renovar.catch(() => {})); return guardada; }
  return renovar;
}

async function recortar(cache) {
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - MAX_RECURSOS; i++) await cache.delete(claves[i]);
}
