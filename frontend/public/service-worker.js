/* eslint-disable no-restricted-globals */
// Arth-Verse Service Worker — minimal offline shell + stale-while-revalidate for static assets
const CACHE_VERSION = 'arthverse-v1';
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache API calls — always hit network for fresh data
  if (url.pathname.startsWith('/api/')) return;

  // Static assets: stale-while-revalidate
  if (
    req.destination === 'image' ||
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'font'
  ) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML navigations: network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
  }
});
