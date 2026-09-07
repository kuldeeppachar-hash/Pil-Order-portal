// Minimal service worker for the Receivables Dashboard ONLY.
// Named and scoped deliberately (see registration call in the HTML, which
// passes {scope:'./receivables-dashboard.html'}) so it can never claim
// control of, or be overwritten by, the PIL Order Portal's own sw.js living
// in the same folder. Do not rename this back to "sw.js" or drop the
// explicit scope in the registration call — that reintroduces the collision.
const CACHE_NAME = 'pil-receivables-v1';
const SHELL_FILES = [
  './receivables-dashboard.html',
  './receivables-manifest.json',
  './receivables-icon-192.png',
  './receivables-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
