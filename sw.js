/* =========================================================
   PORTFOLIO SERVICE WORKER
   Moses Olayinka | moyinks.dev

   Strategy: network-first with cache fallback for the app shell.
   Images are excluded from pre-cache (size) but served from
   cache-as-you-go after the first visit.

   Cache versioning: bump CACHE_VERSION on each deploy to
   invalidate stale assets and force re-download.
   ========================================================= */

const CACHE_VERSION  = 'portfolio-v11.1';
const SHELL_ASSETS   = [
    '/',
    '/styles.css',
    '/script.js',
    '/manifest.json',
];

/* ── Install: pre-cache the shell ──────────────────────────────────────── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting()) // don't block install if one asset 404s
    );
});

/* ── Activate: purge caches from previous versions ─────────────────────── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_VERSION)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ── Fetch: network-first, fall back to cache ───────────────────────────── */
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Only handle GET requests for same-origin assets
    if (req.method !== 'GET') return;

    let url;
    try { url = new URL(req.url); } catch { return; }
    if (url.origin !== self.location.origin) return;

    // Skip Cloudflare email protection and analytics scripts
    if (url.pathname.startsWith('/cdn-cgi/')) return;

    event.respondWith(
        fetch(req)
            .then(response => {
                // Cache successful same-origin responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION)
                        .then(cache => cache.put(req, clone))
                        .catch(() => {}); // cache write failures are non-fatal
                }
                return response;
            })
            .catch(() =>
                // Network failed — serve from cache if available
                caches.match(req).then(cached => {
                    if (cached) return cached;
                    // For navigation requests, serve the cached index as offline fallback
                    if (req.mode === 'navigate') {
                        return caches.match('/');
                    }
                    // Nothing we can do
                    return new Response('', { status: 408 });
                })
            )
    );
});
