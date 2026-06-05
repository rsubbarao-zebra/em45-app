// Incremented cache name to force the browser to update
const CACHE_NAME = 'em45-app-v6';

// The exact, case-sensitive list of files to cache
const ASSETS = [
  './index.html',
  './manifest.json',
  './sw.js',
  './EM45-RFID.jpg' // Updated to the correct, hyphenated file name
];

// Install Service Worker and cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // If a file is missing (like a 404), don't crash the whole install
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.error('Failed to cache asset:', asset, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Clean up old caches (clears the blank screen locks)
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

// Serve cached content when offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
