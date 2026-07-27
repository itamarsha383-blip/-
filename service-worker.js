// KIN service worker — enables installability + offline use.
const CACHE = 'kin-v8';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './cloud.js',
  './app.js',
  './features.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Let the page trigger an immediate activation of a freshly-installed version.
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations + code/styles (so deploys show up immediately),
// cache-first for other static assets (icons). Always fall back to cache offline.
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const fresh = request.mode === 'navigate' || /\.(js|css|json|html)$/.test(url.pathname);
  if (fresh) {
    e.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }).catch(() => caches.match(request).then((c) => c || caches.match('./index.html')))
    );
  } else {
    // static assets + remote demo images: cache-first, then fetch & cache for offline reuse
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached))
    );
  }
});
