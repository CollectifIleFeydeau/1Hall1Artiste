// Service Worker for Collectif Feydeau App
// Version 1.2.1 - Fixed EmailJS CORB issue

const CACHE_NAME = 'collectif-feydeau-cache-v2';
const SAVED_EVENTS_CACHE_NAME = 'collectif-feydeau-saved-events-v1';
const IMAGES_CACHE_NAME = 'collectif-feydeau-images-v1';
const NOTIFICATIONS_STORE = 'collectif-feydeau-notifications';

// Détecter si nous sommes en production (GitHub Pages) ou en développement
const isProduction = self.location.hostname !== 'localhost' && !self.location.hostname.includes('127.0.0.1');
const isNetlify = self.location.hostname.includes('netlify.app');

// Déterminer le bon chemin de base en fonction du déploiement
let BASE_PATH = '';
if (isProduction && !isNetlify) {
  // Vérifier quel déploiement est utilisé
  if (self.location.hostname === 'collectifilefeydeau.github.io') {
    BASE_PATH = '/1Hall1Artiste';
  } else if (self.location.hostname === 'julienfritsch44.github.io') {
    BASE_PATH = '/Collectif-Feydeau---app';
  }
}

console.log(`Service Worker: Using BASE_PATH: ${BASE_PATH} on ${self.location.hostname}`);

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
  getPath('/Logo.png'),
  // Ajouter les routes importantes de l'application
  getPath('/events'),
  getPath('/map'),
  getPath('/saved'),
  getPath('/about')
];

// Install event - precache key resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache principal pour les ressources statiques
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching static files');
          return cache.addAll(PRECACHE_ASSETS);
        }),
      // Cache pour les événements sauvegardés
      caches.open(SAVED_EVENTS_CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Initializing saved events cache');
          return Promise.resolve();
        }),
      // Cache pour les images
      caches.open(IMAGES_CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Initializing images cache');
          return Promise.resolve();
        })
    ])
    .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, SAVED_EVENTS_CACHE_NAME, IMAGES_CACHE_NAME];
  
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
  
  // Skip EmailJS CDN requests (prevent CORB issues)
  if (event.request.url.includes('cdn.emailjs.com') || event.request.url.includes('email.min.js')) {
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

// Gérer les notifications programmées
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, timestamp } = event.data.payload;
    
    // Stocker la notification dans IndexedDB pour la récupérer même après redémarrage
    storeNotification(id, title, body, timestamp);
    
    // Programmer la notification
    scheduleNotification(id, title, body, timestamp);
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    const { id } = event.data.payload;
    cancelNotification(id);
  }
});

// Fonction pour stocker une notification dans IndexedDB
function storeNotification(id, title, body, timestamp) {
  // Ouvrir ou créer la base de données IndexedDB
  const request = indexedDB.open('collectif-feydeau-db', 1);
  
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    
    // Créer un object store pour les notifications si nécessaire
    if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
      db.createObjectStore(NOTIFICATIONS_STORE, { keyPath: 'id' });
    }
  };
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    
    // Stocker la notification
    store.put({
      id,
      title,
      body,
      timestamp,
      scheduled: true
    });
    
    console.log(`Service Worker: Notification stockée pour ${new Date(timestamp).toLocaleString()}`);
  };
  
  request.onerror = function(event) {
    console.error('Service Worker: Erreur lors du stockage de la notification', event.target.error);
  };
}

// Fonction pour programmer une notification
function scheduleNotification(id, title, body, timestamp) {
  const now = Date.now();
  const delay = timestamp - now;
  
  if (delay <= 0) {
    console.log(`Service Worker: La notification ${id} est déjà passée`);
    return;
  }
  
  // Utiliser setTimeout pour programmer la notification
  // Note: Cette approche fonctionne uniquement si le service worker reste actif
  setTimeout(() => {
    // Vérifier si la notification est toujours valide avant de l'afficher
    checkNotificationValidity(id).then(isValid => {
      if (isValid) {
        self.registration.showNotification(title, {
          body,
          icon: getPath('/icon-192x192.png'),
          badge: getPath('/badge-96x96.png'),
          data: { id },
          actions: [
            {
              action: 'open',
              title: 'Voir l\'événement'
            }
          ]
        }).then(() => {
          console.log(`Service Worker: Notification affichée: ${id}`);
          
          // Marquer la notification comme affichée
          updateNotificationStatus(id, false);
        });
      }
    });
  }, delay);
  
  console.log(`Service Worker: Notification programmée pour ${new Date(timestamp).toLocaleString()}`);
}

// Vérifier si une notification est toujours valide
function checkNotificationValidity(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('collectif-feydeau-db', 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      
      // Vérifier si l'object store existe
      if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
        resolve(false);
        return;
      }
      
      const transaction = db.transaction([NOTIFICATIONS_STORE], 'readonly');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = function(event) {
        const notification = event.target.result;
        resolve(notification && notification.scheduled);
      };
      
      getRequest.onerror = function() {
        resolve(false);
      };
    };
    
    request.onerror = function() {
      resolve(false);
    };
  });
}

// Mettre à jour le statut d'une notification
function updateNotificationStatus(id, scheduled) {
  const request = indexedDB.open('collectif-feydeau-db', 1);
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    
    if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
      return;
    }
    
    const transaction = db.transaction([NOTIFICATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(NOTIFICATIONS_STORE);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = function(event) {
      const notification = event.target.result;
      
      if (notification) {
        notification.scheduled = scheduled;
        store.put(notification);
      }
    };
  };
}

// Annuler une notification programmée
function cancelNotification(id) {
  updateNotificationStatus(id, false);
  console.log(`Service Worker: Notification annulée: ${id}`);
}

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    // Ouvrir l'application sur la page des événements sauvegardés
    const urlToOpen = new URL(getPath('/saved'), self.location.origin);
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Vérifier si une fenêtre est déjà ouverte
          for (const client of clientList) {
            if (client.url.includes('/saved') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Sinon, ouvrir une nouvelle fenêtre
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  // Traiter les messages pour les notifications
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Déjà traité dans l'autre gestionnaire d'événements
    return;
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    // Déjà traité dans l'autre gestionnaire d'événements
    return;
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Message pour précharger les événements sauvegardés
  if (event.data && event.data.type === 'CACHE_SAVED_EVENTS') {
    const { events, locations } = event.data;
    
    if (events && events.length > 0) {
      caches.open(SAVED_EVENTS_CACHE_NAME)
        .then(cache => {
          // Stocker les données des événements sauvegardés
          cache.put(
            new Request(getPath('/saved-events-data')),
            new Response(JSON.stringify(events), {
              headers: { 'Content-Type': 'application/json' }
            })
          );
          
          console.log(`Service Worker: Cached ${events.length} saved events`);
        });
    }
    
    if (locations && locations.length > 0) {
      caches.open(SAVED_EVENTS_CACHE_NAME)
        .then(cache => {
          // Stocker les données des lieux
          cache.put(
            new Request(getPath('/locations-data')),
            new Response(JSON.stringify(locations), {
              headers: { 'Content-Type': 'application/json' }
            })
          );
          
          console.log(`Service Worker: Cached ${locations.length} locations`);
          
          // Précharger les images des lieux si elles ne sont pas déjà en cache
          caches.open(IMAGES_CACHE_NAME)
            .then(imageCache => {
              locations.forEach(location => {
                if (location.image) {
                  const imageUrl = getPath(location.image);
                  
                  // Vérifier si l'image est déjà en cache
                  imageCache.match(imageUrl)
                    .then(cachedResponse => {
                      if (!cachedResponse) {
                        // Si l'image n'est pas en cache, la télécharger
                        fetch(imageUrl)
                          .then(response => {
                            if (response.ok) {
                              imageCache.put(imageUrl, response);
                              console.log(`Service Worker: Cached location image: ${imageUrl}`);
                            }
                          })
                          .catch(error => {
                            console.error(`Service Worker: Failed to cache location image: ${imageUrl}`, error);
                          });
                      }
                    });
                }
              });
            });
        });
    }
  }
  
  // Message pour précharger l'image de la carte
  if (event.data && event.data.type === 'CACHE_MAP_IMAGE') {
    const mapImageUrl = getPath('/map-feydeau.png');
    
    caches.open(IMAGES_CACHE_NAME)
      .then(cache => {
        fetch(mapImageUrl)
          .then(response => {
            if (response.ok) {
              cache.put(mapImageUrl, response);
              console.log('Service Worker: Cached map image');
            }
          })
          .catch(error => {
            console.error('Service Worker: Failed to cache map image', error);
          });
      });
  }
});
