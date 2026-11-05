const CACHE_NAME = 'toolora-static-v6';
const APP_SHELL = [
  '/', '/index.html', '/entrar.html', '/registro.html',
  '/styles.css', '/app.js', '/auth.js', '/supabase-config.js',
  '/favicon.svg', '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate' || /\.html$/i.test(url.pathname);
  const isAppCode = /\.(?:js|css)$/i.test(url.pathname);

  // Always prefer current HTML and app code; fall back to cache only when offline.
  if (isDocument || isAppCode) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) ||
          (isDocument ? await caches.match('/index.html') : Response.error());
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
