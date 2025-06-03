import { cacheManager } from '@/utils/cacheManager';
import { getSavedEvents } from './savedEvents';
import { Event, getEventById } from '@/data/events';
import { Location, getLocationNameById, getLocations } from '@/data/locations';
import { getArtistById } from '@/data/artists';

// Fonction pour obtenir la base URL de l'application
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.BASE_URL) {
    return window.APP_CONFIG.BASE_URL;
  }
  return '/';
};

// Fonction pour construire un chemin complet avec la base URL
const getFullPath = (path: string): string => {
  const baseUrl = getBaseUrl();
  // Si le chemin commence déjà par la base URL, le retourner tel quel
  if (path.startsWith(baseUrl)) {
    return path;
  }
  // Si le chemin commence par un slash, le supprimer pour éviter les doubles slashs
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}${cleanPath}`;
};

// Constantes pour les clés de cache
const CACHE_KEYS = {
  SAVED_EVENTS: 'offline_saved_events',
  LOCATIONS: 'offline_locations',
  MAP_IMAGE: 'offline_map_image',
  LOCATION_IMAGES: 'offline_location_images',
  HISTORY_IMAGES: 'offline_history_images',
};

// Durée de validité du cache en millisecondes (7 jours)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * Précharge les détails des événements sauvegardés pour une utilisation hors-ligne
 * @returns Promise<Event[]> Les événements sauvegardés préchargés
 */
export const preloadSavedEvents = async (): Promise<Event[]> => {
  try {
    console.log('[OfflineService] Préchargement des événements sauvegardés');
    
    // Récupérer les événements sauvegardés
    const savedEvents = getSavedEvents();
    
    if (savedEvents.length === 0) {
      console.log('[OfflineService] Aucun événement sauvegardé à précharger');
      return [];
    }
    
    // Stocker les événements dans le cache
    cacheManager.set(CACHE_KEYS.SAVED_EVENTS, savedEvents, CACHE_EXPIRY);
    console.log(`[OfflineService] ${savedEvents.length} événements sauvegardés mis en cache`);
    
    return savedEvents;
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement des événements:', error);
    return [];
  }
};

/**
 * Récupère les événements sauvegardés depuis le cache ou les précharge si nécessaire
 * @returns Promise<Event[]> Les événements sauvegardés
 */
export const getOfflineSavedEvents = async (): Promise<Event[]> => {
  return cacheManager.getOrSet(
    CACHE_KEYS.SAVED_EVENTS,
    async () => preloadSavedEvents(),
    CACHE_EXPIRY
  );
};

/**
 * Précharge les lieux associés aux événements sauvegardés
 * @returns Promise<Location[]> Les lieux préchargés
 */
export const preloadLocations = async (): Promise<Location[]> => {
  try {
    console.log('[OfflineService] Préchargement des lieux');
    
    // Récupérer les événements sauvegardés
    const savedEvents = await getOfflineSavedEvents();
    
    if (savedEvents.length === 0) {
      console.log('[OfflineService] Aucun lieu à précharger (pas d\'événements sauvegardés)');
      return [];
    }
    
    // Récupérer tous les lieux
    const allLocations = getLocations();
    
    // Filtrer les lieux associés aux événements sauvegardés
    const locationIds = savedEvents.map(event => event.locationId);
    const uniqueLocationIds = [...new Set(locationIds)];
    const relevantLocations = allLocations.filter(location => 
      uniqueLocationIds.includes(location.id)
    );
    
    // Stocker les lieux dans le cache
    cacheManager.set(CACHE_KEYS.LOCATIONS, relevantLocations, CACHE_EXPIRY);
    console.log(`[OfflineService] ${relevantLocations.length} lieux mis en cache`);
    
    return relevantLocations;
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement des lieux:', error);
    return [];
  }
};

/**
 * Récupère les lieux depuis le cache ou les précharge si nécessaire
 * @returns Promise<Location[]> Les lieux
 */
export const getOfflineLocations = async (): Promise<Location[]> => {
  return cacheManager.getOrSet(
    CACHE_KEYS.LOCATIONS,
    async () => preloadLocations(),
    CACHE_EXPIRY
  );
};

/**
 * Précharge les images des lieux pour une utilisation hors-ligne
 * @returns Promise<string[]> Les URLs des images préchargées
 */
export const preloadLocationImages = async (): Promise<string[]> => {
  try {
    console.log('[OfflineService] Préchargement des images des lieux');
    
    // Récupérer les lieux
    const locations = await getOfflineLocations();
    
    if (locations.length === 0) {
      console.log('[OfflineService] Aucune image de lieu à précharger');
      return [];
    }
    
    // Récupérer les URLs des images
    const imageUrls = locations
      .filter(location => location.image)
      .map(location => {
        const imagePath = location.image as string;
        // Si l'URL est déjà absolue (commence par http ou https), la laisser telle quelle
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // Sinon, ajouter la base URL
        return getFullPath(imagePath);
      });
    
    // Précharger chaque image
    const preloadPromises = imageUrls.map(async (url) => {
      try {
        // Utiliser fetch pour précharger l'image et la mettre en cache
        const response = await fetch(url, { 
          cache: 'force-cache',
          headers: {
            'Cache-Control': 'max-age=31536000', // 1 an
          },
          mode: 'no-cors' // Permet le chargement même en cas de problèmes CORS
        });
        
        if (!response.ok && response.type !== 'opaque') {
          throw new Error(`Erreur lors du chargement de l'image: ${response.status}`);
        }
        
        // Créer un blob à partir de la réponse pour garantir que l'image est complètement téléchargée
        const blob = await response.blob();
        
        // Stocker les métadonnées de l'image dans le cache
        cacheManager.set(`${CACHE_KEYS.LOCATION_IMAGES}_${url}`, {
          url,
          size: blob.size,
          type: blob.type,
          timestamp: Date.now()
        }, CACHE_EXPIRY);
        
        console.log(`[OfflineService] Image préchargée: ${url} (${blob.size} octets)`);
        
        // Également mettre en cache dans le cache du navigateur via le service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_LOCATION_IMAGE',
            url
          });
        }
        
        return url;
      } catch (error) {
        console.error(`[OfflineService] Erreur lors du préchargement de l'image ${url}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(preloadPromises);
    const successfulUrls = results.filter(url => url !== null) as string[];
    
    console.log(`[OfflineService] ${successfulUrls.length}/${imageUrls.length} images préchargées`);
    
    return successfulUrls;
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement des images:', error);
    return [];
  }
};

/**
 * Précharge les images des historiques des lieux pour une utilisation hors-ligne
 * @returns Promise<string[]> Les URLs des images préchargées
 */
export const preloadHistoryImages = async (): Promise<string[]> => {
  try {
    console.log('[OfflineService] Préchargement des images des historiques');
    
    // Récupérer tous les lieux (pas seulement ceux liés aux événements sauvegardés)
    const allLocations = getLocations();
    
    // Filtrer les lieux qui ont un historique et une image
    const locationsWithHistory = allLocations.filter(location => 
      location.history && location.image
    );
    
    if (locationsWithHistory.length === 0) {
      console.log('[OfflineService] Aucune image d\'historique à précharger');
      return [];
    }
    
    // Récupérer les URLs des images
    const imageUrls = locationsWithHistory.map(location => {
      const imagePath = location.image as string;
      // Si l'URL est déjà absolue (commence par http ou https), la laisser telle quelle
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // Sinon, ajouter la base URL
      return getFullPath(imagePath);
    });
    
    // Précharger chaque image
    const preloadPromises = imageUrls.map(async (url) => {
      try {
        // Vérifier si l'image est déjà en cache
        if (cacheManager.has(`${CACHE_KEYS.HISTORY_IMAGES}_${url}`)) {
          console.log(`[OfflineService] Image d'historique déjà en cache: ${url}`);
          return url;
        }
        
        // Utiliser fetch pour précharger l'image et la mettre en cache
        const response = await fetch(url, { 
          cache: 'force-cache',
          headers: {
            'Cache-Control': 'max-age=31536000', // 1 an
          },
          mode: 'no-cors' // Permet le chargement même en cas de problèmes CORS
        });
        
        if (!response.ok && response.type !== 'opaque') {
          throw new Error(`Erreur lors du chargement de l'image d'historique: ${response.status}`);
        }
        
        // Créer un blob à partir de la réponse pour garantir que l'image est complètement téléchargée
        const blob = await response.blob();
        
        // Stocker les métadonnées de l'image dans le cache
        cacheManager.set(`${CACHE_KEYS.HISTORY_IMAGES}_${url}`, {
          url,
          size: blob.size,
          type: blob.type,
          timestamp: Date.now()
        }, CACHE_EXPIRY);
        
        console.log(`[OfflineService] Image d'historique préchargée: ${url} (${blob.size} octets)`);
        
        // Également mettre en cache dans le cache du navigateur via le service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_HISTORY_IMAGE',
            url
          });
        }
        
        return url;
      } catch (error) {
        console.error(`[OfflineService] Erreur lors du préchargement de l'image d'historique ${url}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(preloadPromises);
    const successfulUrls = results.filter(url => url !== null) as string[];
    
    console.log(`[OfflineService] ${successfulUrls.length}/${imageUrls.length} images d'historique préchargées`);
    
    return successfulUrls;
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement des images d\'historique:', error);
    return [];
  }
};

/**
 * Précharge l'image de la carte pour une utilisation hors-ligne
 * @returns Promise<boolean> true si l'image a été préchargée avec succès
 */
export const preloadMapImage = async (): Promise<boolean> => {
  try {
    console.log('[OfflineService] Préchargement de l\'image de la carte');
    
    const mapImageUrl = getFullPath('map-feydeau.png');
    
    // Utiliser fetch pour précharger l'image et la mettre en cache
    const response = await fetch(mapImageUrl, { 
      cache: 'force-cache',
      // Ajouter des options pour éviter les problèmes de cache
      headers: {
        'Cache-Control': 'max-age=31536000', // 1 an
        'Pragma': 'no-cache' // Force le rechargement
      },
      mode: 'no-cors' // Permet le chargement même en cas de problèmes CORS
    });
    
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`Erreur lors du chargement de l'image de la carte: ${response.status}`);
    }
    
    // Créer un blob à partir de la réponse pour garantir que l'image est complètement téléchargée
    const blob = await response.blob();
    
    // Stocker l'URL de l'image et le blob dans le cache
    cacheManager.set(CACHE_KEYS.MAP_IMAGE, {
      url: mapImageUrl,
      size: blob.size,
      type: blob.type,
      timestamp: Date.now()
    }, CACHE_EXPIRY);
    
    console.log(`[OfflineService] Image de la carte préchargée (${blob.size} octets)`);
    
    // Également mettre en cache dans le cache du navigateur via le service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_MAP_IMAGE',
        url: mapImageUrl
      });
    }
    
    return true;
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement de l\'image de la carte:', error);
    return false;
  }
};

/**
 * Précharge toutes les données nécessaires pour le mode hors-ligne
 * @returns Promise<void>
 */
export const preloadAllOfflineData = async (): Promise<void> => {
  try {
    console.log('[OfflineService] Démarrage du préchargement des données hors-ligne');
    
    // Précharger l'image de la carte en premier (priorité élevée)
    const mapPreloaded = await preloadMapImage();
    console.log(`[OfflineService] Préchargement de la carte: ${mapPreloaded ? 'réussi' : 'échoué'}`);
    
    // Précharger les événements sauvegardés
    await preloadSavedEvents();
    
    // Précharger les lieux
    await preloadLocations();
    
    // Précharger les images des lieux
    await preloadLocationImages();
    
    // Précharger les images des historiques des lieux
    await preloadHistoryImages();
    
    // Si le préchargement de la carte a échoué, réessayer
    if (!mapPreloaded) {
      console.log('[OfflineService] Nouvelle tentative de préchargement de la carte');
      await preloadMapImage();
    }
    
    console.log('[OfflineService] Préchargement des données hors-ligne terminé');
  } catch (error) {
    console.error('[OfflineService] Erreur lors du préchargement des données hors-ligne:', error);
  }
};

/**
 * Vérifie si les données hors-ligne sont disponibles
 * @returns boolean true si les données sont disponibles
 */
export const hasOfflineData = (): boolean => {
  return cacheManager.has(CACHE_KEYS.SAVED_EVENTS) && 
         cacheManager.has(CACHE_KEYS.LOCATIONS) &&
         cacheManager.has(CACHE_KEYS.MAP_IMAGE);
};

/**
 * Récupère l'image de la carte depuis le cache
 * @returns L'URL de l'image de la carte ou null si elle n'est pas en cache
 */
export const getOfflineMapImage = (): string | null => {
  const mapImageData = cacheManager.get<{url: string}>(CACHE_KEYS.MAP_IMAGE);
  return mapImageData ? mapImageData.url : null;
};

/**
 * Vérifie si une image d'historique est disponible dans le cache
 * @param url L'URL de l'image à vérifier
 * @returns boolean true si l'image est disponible dans le cache
 */
export const isHistoryImageCached = (url: string): boolean => {
  return cacheManager.has(`${CACHE_KEYS.HISTORY_IMAGES}_${url}`);
};

/**
 * Précharge une image d'historique spécifique
 * @param url L'URL de l'image à précharger
 * @returns Promise<boolean> true si l'image a été préchargée avec succès
 */
export const preloadSingleHistoryImage = async (url: string): Promise<boolean> => {
  try {
    // Vérifier si l'image est déjà en cache
    if (isHistoryImageCached(url)) {
      console.log(`[OfflineService] Image déjà en cache: ${url}`);
      return true;
    }
    
    console.log(`[OfflineService] Préchargement de l'image: ${url}`);
    
    // Utiliser fetch pour précharger l'image et la mettre en cache
    const response = await fetch(url, { 
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'max-age=31536000', // 1 an
      },
      mode: 'no-cors' // Permet le chargement même en cas de problèmes CORS
    });
    
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`Erreur lors du chargement de l'image: ${response.status}`);
    }
    
    // Créer un blob à partir de la réponse pour garantir que l'image est complètement téléchargée
    const blob = await response.blob();
    
    // Stocker les métadonnées de l'image dans le cache
    cacheManager.set(`${CACHE_KEYS.HISTORY_IMAGES}_${url}`, {
      url,
      size: blob.size,
      type: blob.type,
      timestamp: Date.now()
    }, CACHE_EXPIRY);
    
    console.log(`[OfflineService] Image préchargée: ${url} (${blob.size} octets)`);
    
    // Également mettre en cache dans le cache du navigateur via le service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_HISTORY_IMAGE',
        url
      });
    }
    
    return true;
  } catch (error) {
    console.error(`[OfflineService] Erreur lors du préchargement de l'image ${url}:`, error);
    return false;
  }
};
