/**
 * Vinotipos — Service Worker
 * Estrategia: Cache-first para assets estaticos, Network-first para navegacion.
 * En modo offline sirve el shell (index.html) para todas las rutas.
 */

const CACHE_NAME = 'vinotipos-v2';

// Assets del shell que se cachean en la instalacion
const SHELL_ASSETS = [
  '/',
  '/index.html'
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  // Activar inmediatamente sin esperar al cierre de pestanas anteriores
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Tomar control de todas las pestanas abiertas inmediatamente
  self.clients.claim();
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Solo interceptar peticiones al mismo origen
  if (!request.url.startsWith(self.location.origin)) return;

  // Para peticiones de navegacion (HTML): network-first, fallback al shell cacheado
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Actualizar el cache del shell con la respuesta mas reciente
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Para assets estaticos (JS, CSS, imagenes, fuentes): cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Solo cachear respuestas validas del mismo origen
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
