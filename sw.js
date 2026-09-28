const CACHE = 'moses-portfolio-v6-2';
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/project-links.js',
  '/script.js',
  '/manifest.json',
  '/moses.jpg',
  '/icon.svg',
  '/pwa-192.png',
  '/pwa-512.png',
  '/nextrade-home.webp',
  '/nextrade-market.webp',
  '/quickshop-offline.webp',
  '/quickshop-storefront.webp',
  '/obsidian-key.webp',
  '/obsidian-unlock.webp',
  '/flowlab-workspace.webp',
  '/betabot-signal.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    } catch (_) {
      const cached = await caches.match(request);
      if (cached) return cached;

      // Only document navigations may fall back to the app shell. Returning
      // index.html for a missing image/script creates misleading MIME failures.
      if (request.mode === 'navigate') {
        const shell = await caches.match('/index.html');
        if (shell) return shell;
      }

      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
