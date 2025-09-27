/**
 * Service Worker Registration Utility
 * 
 * Ce fichier est temporairement simplifié pour éviter les erreurs dans la console.
 * L'enregistrement du service worker est désactivé jusqu'à ce que les problèmes soient résolus.
 */

import { createLogger } from './logger';

const logger = createLogger('ServiceWorker');

/**
 * Register the service worker
 * 
 * Temporairement désactivé pour éviter les erreurs dans la console.
 */
export const registerServiceWorker = () => {
  // L'enregistrement du service worker est temporairement désactivé
  logger.info('Service worker registration is temporarily disabled');
  return;
};

/**
 * Unregister the service worker
 * 
 * Fonction simplifiée pour éviter les erreurs.
 */
export const unregisterServiceWorker = () => {
  // Désactivé temporairement
  return;
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
  // Désactivé temporairement
  return;
};

/**
 * Précharge l'image de la carte dans le service worker
 */
export const cacheMapImageInServiceWorker = (): void => {
  // Désactivé temporairement
  return;
};

