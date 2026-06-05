// Incremented cache name to force the browser to update cleanly
const CACHE_NAME = 'em45-app-v9';

const ASSETS = [
  './index.html',
  './manifest.json',
  './sw.js',
  './EM45-RFID.jpg' // Updated filename with hyphen
];

// Universal safe installation
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn('Non-fatal pre-cache skip:', asset, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Clears out any bad or old cached versions
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Serve cached content when offline, pull from network first when online
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
