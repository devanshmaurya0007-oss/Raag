const SHELL = 'raag-shell-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('raag-shell-') && k !== SHELL).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // App shell: cache first, fall back to network
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).catch(() => caches.match('./index.html')))
    );
  }
  // Everything else (Jamendo API, audio, images) goes straight to the network.
  // Offline audio is read from the 'raag-audio' cache by the page itself.
});
