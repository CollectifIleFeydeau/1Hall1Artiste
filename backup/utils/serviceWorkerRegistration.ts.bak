/**
 * Service Worker Registration Utility
 * 
 * This utility handles the registration and lifecycle management of the service worker
 * for offline support and improved performance.
 */

// Check if service workers are supported
const isServiceWorkerSupported = 'serviceWorker' in navigator;

/**
 * Register the service worker
 */
export const registerServiceWorker = () => {
  if (!isServiceWorkerSupported) {
    console.log('Service workers are not supported by this browser');
    return;
  }

  // Utiliser la configuration globale définie dans index.html
  const BASE_PATH = (window as any).APP_CONFIG?.BASE_URL || '/';
  
  console.log(`Service Worker: Using BASE_PATH from global config: ${BASE_PATH}`);
  const swUrl = `${BASE_PATH}service-worker.js`;

  console.log(`Registering service worker from: ${swUrl}`);

  try {
    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        console.log('Service worker registered successfully:', registration.scope);
        
        // Vérifier si le service worker est actif
        if (registration.active) {
          console.log('Service worker is active');
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Une nouvelle version du service worker est disponible
                console.log('New service worker available');
              } else {
                // Le service worker est installé pour la première fois
                console.log('Service worker installed for the first time');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      });
  } catch (error) {
    console.error('Error during service worker registration:', error);
  }
};

/**
 * Unregister the service worker
 */
export const unregisterServiceWorker = () => {
  if (!isServiceWorkerSupported) return;

  navigator.serviceWorker.ready
    .then(registration => {
      registration.unregister();
    })
    .catch(error => {
      console.error('Error during service worker unregistration:', error);
    });
};

/**
 * Check if the user is online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
};

/**
 * Add an online status listener
 * @returns A cleanup function to remove the listeners
 */
export const addOnlineStatusListener = (callback: (online: boolean) => void): (() => void) | undefined => {
  if (typeof window === 'undefined') return undefined;

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Appeler le callback immédiatement avec l'état actuel
  callback(isOnline());

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Précharge les événements sauvegardés dans le service worker
 * @param events Les événements à précharger
 * @param locations Les lieux associés aux événements
 */
export const cacheEventsInServiceWorker = (events: any[], locations: any[]): void => {
  if (!isServiceWorkerSupported || !navigator.serviceWorker.controller) {
    console.log('Service worker not active, cannot cache events');
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_SAVED_EVENTS',
    events,
    locations
  });
};

/**
 * Précharge l'image de la carte dans le service worker
 */
export const cacheMapImageInServiceWorker = (): void => {
  if (!isServiceWorkerSupported || !navigator.serviceWorker.controller) {
    console.log('Service worker not active, cannot cache map image');
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_MAP_IMAGE'
  });
};
