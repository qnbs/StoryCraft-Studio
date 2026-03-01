// StoryCraft Studio Service Worker
// Offline-First PWA mit Cache-Strategie

const CACHE_NAME = 'storycraft-v1';
const BASE = self.location.pathname.replace(/sw\.js$/, '');

// Zu cachende Assets
const STATIC_ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
];

// Install Event - Static Assets cachen
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-First für Assets, Network-First für API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Nur GET-Requests cachen
  if (request.method !== 'GET') return;

  // API-Calls nicht cachen (Gemini API)
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Navigation Requests - Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  // Static Assets - Cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Hintergrund-Update
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {});
          
          return cachedResponse;
        }

        // Nicht im Cache - von Network holen und cachen
        return fetch(request)
          .then((response) => {
            if (!response.ok) return response;

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache));

            return response;
          });
      })
  );
});
