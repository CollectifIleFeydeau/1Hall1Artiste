// Service Worker for Collectif Feydeau App
// Version 1.0.0

const CACHE_NAME = 'collectif-feydeau-cache-v1';

// Détecter si nous sommes en production (GitHub Pages) ou en développement
const isProduction = self.location.hostname !== 'localhost' && !self.location.hostname.includes('127.0.0.1');

// Préfixe pour les chemins en production (GitHub Pages)
const BASE_PATH = isProduction ? '/Collectif-Feydeau---app' : '';

// Fonction pour obtenir le chemin correct d'une ressource
const getPath = (path) => {
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};

const OFFLINE_PAGE = getPath('/offline.html');

// Assets to cache immediately on service worker installation
const PRECACHE_ASSETS = [
  getPath('/'),
  getPath('/index.html'),
  OFFLINE_PAGE,
  getPath('/favicon.ico'),
  getPath('/placeholder.svg'),
  getPath('/assets/feydeau-share.jpg'),
  getPath('/map-feydeau.png'),
  getPath('/onboarding-image.webp'),
  getPath('/Logo.png')
];

// Install event - precache key resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests differently (no caching)
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // For HTML pages, use a "network-first" strategy
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }
  
  // For other assets, use a "cache-first" strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache the fetched resource
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(error => {
            // For image requests, return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
              return caches.match(getPath('/placeholder.svg'));
            }
            throw error;
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
