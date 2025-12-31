// Service Worker for caching static assets
const CACHE_VERSION = 'odyssey-v2-2024-12-30'; // Update this when deploying
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Only cache truly static assets - NOT HTML pages
const urlsToCache = [
  '/placeholder.svg',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing new version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating new version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // NEVER cache HTML pages or API calls
  if (
    request.method !== 'GET' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('vercel')
  ) {
    // Network only for HTML and API
    event.respondWith(fetch(request));
    return;
  }
  
  // Cache-first for static assets (images, fonts, etc)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Not in cache - fetch and cache if successful
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
