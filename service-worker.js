const CACHE_NAME = 'smart-travel-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/data.js',
    '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // For API calls (Groq), always try network first
    if (event.request.url.includes('api.groq.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If API fails and offline, return a cached fallback
                return new Response('API unavailable. Using local data.', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
        );
        return;
    }

    // For app files, use cache-first strategy
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((response) => {
                // Cache new requests
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            });
        })
    );
});
