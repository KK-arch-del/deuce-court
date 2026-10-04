// Offline cache for Deuce Court. The cache name changes on every build so new versions replace old ones.
const CACHE = 'deuce-court-20261004212820';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// game files: network first (so updates arrive), cache as fallback; fonts & libraries: cache first
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isLib = /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (isLib) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
  }
});
