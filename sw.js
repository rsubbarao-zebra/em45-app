// Incremented to v8 to forcefully clear any old locked-up caches
const CACHE_NAME = 'em45-app-v8';

// Use relative paths specifically formatted for GitHub Pages subdirectories
const ASSETS = [
  'index.html',
  'manifest.json',
  'EM45-RFID.jpg'
];

// Installs the Service Worker using a non-blocking cache loop
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Loop through assets individually so a single fail never crashes the app
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

// Clears out any bad or old cached versions that caused the blank screen
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

// NETWORK-FIRST Strategy: Always request the fresh page from the internet first.
// If you are completely offline (e.g. out of service), fall back to the saved cache.
self.addEventListener('fetch', (e) => {
  // Only handle standard HTTP/HTTPS requests (ignores internal chrome-extension fetches)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If the request succeeds, save a fresh copy to the cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If offline or request fails, load instantly from local cache
        return caches.match(e.request);
      })
  );
});
