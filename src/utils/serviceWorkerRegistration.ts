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
  // Temporairement désactivé pour éviter les erreurs dans la console
  console.log('Service worker registration is temporarily disabled');
  return;
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

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
