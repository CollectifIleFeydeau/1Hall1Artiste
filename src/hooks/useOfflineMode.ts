import { useState, useEffect, useCallback } from 'react';
import { isOnline, addOnlineStatusListener, cacheEventsInServiceWorker, cacheMapImageInServiceWorker } from '@/utils/serviceWorkerRegistration';
import { preloadAllOfflineData, getOfflineSavedEvents, getOfflineLocations, preloadMapImage } from '@/services/offlineService';
import { getSavedEvents } from '@/services/savedEvents';
import { getLocations } from '@/data/locations';

/**
 * Hook pour gérer le mode hors-ligne et le préchargement des données
 */
export const useOfflineMode = () => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  const [preloadingData, setPreloadingData] = useState<boolean>(false);

  // Fonction pour précharger toutes les données nécessaires
  const preloadData = useCallback(async () => {
    if (preloadingData) return;
    
    try {
      setPreloadingData(true);
      console.log('[useOfflineMode] Démarrage du préchargement des données');
      
      // Précharger les données via le service offlineService
      await preloadAllOfflineData();
      
      // Récupérer les événements sauvegardés et les lieux pour les mettre en cache dans le service worker
      const savedEvents = getSavedEvents();
      const locations = getLocations().filter(location => 
        savedEvents.some(event => event.locationId === location.id)
      );
      
      // Mettre en cache les événements et les lieux dans le service worker
      if (savedEvents.length > 0) {
        cacheEventsInServiceWorker(savedEvents, locations);
      }
      
      // Précharger l'image de la carte
      await preloadMapImage();
      cacheMapImageInServiceWorker();
      
      setOfflineReady(true);
      console.log('[useOfflineMode] Préchargement des données terminé');
    } catch (error) {
      console.error('[useOfflineMode] Erreur lors du préchargement des données:', error);
    } finally {
      setPreloadingData(false);
    }
  }, [preloadingData]);

  // Écouter les changements d'état de connexion
  useEffect(() => {
    const cleanup = addOnlineStatusListener((isOnline) => {
      setOnline(isOnline);
      
      // Si l'utilisateur vient de se reconnecter, vérifier si les données hors-ligne sont prêtes
      if (isOnline && !offlineReady && !preloadingData) {
        preloadData();
      }
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [offlineReady, preloadingData, preloadData]);

  // Précharger les données au premier chargement si l'utilisateur est en ligne
  useEffect(() => {
    if (online && !offlineReady && !preloadingData) {
      preloadData();
    }
  }, [online, offlineReady, preloadingData, preloadData]);

  return {
    online,
    offlineReady,
    preloadingData,
    preloadData
  };
};

