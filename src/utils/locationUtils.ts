import { FEYDEAU_CENTER, FEYDEAU_CORNERS, FEYDEAU_DIMENSIONS } from "@/data/gpsCoordinates";
import { createLogger } from "@/utils/logger";

// Créer un logger pour le module
const logger = createLogger('locationUtils');

/**
 * Type représentant une position géographique
 */
export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

/**
 * Vérifie si une position GPS est à l'intérieur des limites de l'Île Feydeau
 * avec une tolérance augmentée pour une meilleure expérience utilisateur
 * @param position Position GPS à vérifier
 * @returns true si la position est dans les limites (avec tolérance), false sinon
 */
export function isPositionWithinFeydeau(position: GeoPosition): boolean {
  const { latitude, longitude } = position;
  
  // Augmenter la marge de tolérance (environ 100 mètres)
  const toleranceLatitude = 0.001; // Environ 100 mètres en latitude
  const toleranceLongitude = 0.0014; // Environ 100 mètres en longitude à cette latitude
  
  // Limites de l'Île avec tolérance
  const minLat = Math.min(FEYDEAU_CORNERS.bottomLeft.latitude, FEYDEAU_CORNERS.bottomRight.latitude) - toleranceLatitude;
  const maxLat = Math.max(FEYDEAU_CORNERS.topLeft.latitude, FEYDEAU_CORNERS.topRight.latitude) + toleranceLatitude;
  const minLng = Math.min(FEYDEAU_CORNERS.topLeft.longitude, FEYDEAU_CORNERS.bottomLeft.longitude) - toleranceLongitude;
  const maxLng = Math.max(FEYDEAU_CORNERS.topRight.longitude, FEYDEAU_CORNERS.bottomRight.longitude) + toleranceLongitude;
  
  // Vérification avec tolérance: nous considérons l'Île comme un rectangle avec marge
  const isWithinLatitude = latitude >= minLat && latitude <= maxLat;
  const isWithinLongitude = longitude >= minLng && longitude <= maxLng;
  
  // Si la position est très proche du centre de l'Île, la considérer comme valide
  const distanceToCenter = calculateDistanceToCenter(latitude, longitude);
  if (distanceToCenter < 150) { // 150 mètres du centre
    return true;
  }
  
  return isWithinLatitude && isWithinLongitude;
}

/**
 * Calcule la distance approximative au centre de l'Île Feydeau
 * @param latitude Latitude de la position
 * @param longitude Longitude de la position
 * @returns Distance en mètres
 */
export function calculateDistanceToCenter(latitude: number, longitude: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const lat1 = latitude * Math.PI / 180;
  const lat2 = FEYDEAU_CENTER.latitude * Math.PI / 180;
  const deltaLat = (FEYDEAU_CENTER.latitude - latitude) * Math.PI / 180;
  const deltaLng = (FEYDEAU_CENTER.longitude - longitude) * Math.PI / 180;
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance en mètres
}

/**
 * Calcule la direction vers l'Île Feydeau depuis une position extérieure
 * @param position Position GPS actuelle
 * @returns Direction en texte (nord, sud-est, etc.)
 */
export function getDirectionToFeydeau(position: GeoPosition): string {
  const { latitude, longitude } = position;
  
  // Calcul de l'angle par rapport au centre de l'Île
  const y = Math.sin(FEYDEAU_CENTER.longitude - longitude) * Math.cos(FEYDEAU_CENTER.latitude);
  const x = Math.cos(latitude) * Math.sin(FEYDEAU_CENTER.latitude) - 
            Math.sin(latitude) * Math.cos(FEYDEAU_CENTER.latitude) * 
            Math.cos(FEYDEAU_CENTER.longitude - longitude);
  let angle = Math.atan2(y, x) * 180 / Math.PI;
  
  // Convertir en angle positif (0-360°)
  angle = (angle + 360) % 360;
  
  // Convertir l'angle en direction cardinale
  if (angle >= 337.5 || angle < 22.5) return "nord";
  if (angle >= 22.5 && angle < 67.5) return "nord-est";
  if (angle >= 67.5 && angle < 112.5) return "est";
  if (angle >= 112.5 && angle < 157.5) return "sud-est";
  if (angle >= 157.5 && angle < 202.5) return "sud";
  if (angle >= 202.5 && angle < 247.5) return "sud-ouest";
  if (angle >= 247.5 && angle < 292.5) return "ouest";
  return "nord-ouest";
}

/**
 * Détermine si une notification de position doit être affichée
 * en fonction de différents critères pour éviter de spammer l'utilisateur
 * @param isWithinFeydeau Si l'utilisateur est dans l'Île Feydeau
 * @param isFirstPosition Si c'est la première position reçue
 * @param isRecentlyActivated Si la localisation vient d'être activée
 * @param isFarFromCenter Si l'utilisateur est loin du centre
 * @returns true si une notification peut être affichée, false sinon
 */
export function shouldShowLocationNotification(
  isWithinFeydeau: boolean,
  isFirstPosition: boolean,
  isRecentlyActivated: boolean,
  isFarFromCenter: boolean
): boolean {
  // Ne pas afficher de notification si:
  // - L'utilisateur est dans l'Île Feydeau
  // - C'est la première position reçue
  // - La localisation vient d'être activée
  // - L'utilisateur n'est pas assez loin du centre
  return !isWithinFeydeau && !isFirstPosition && !isRecentlyActivated && isFarFromCenter;
}

/**
 * Génère un offset aléatoire pour la simulation de position
 * @returns Un offset aléatoire pour la latitude et la longitude
 */
export function generateRandomPositionOffset(): { latOffset: number, lngOffset: number } {
  return {
    latOffset: (Math.random() - 0.5) * 0.0002, // Environ ±10 mètres en latitude
    lngOffset: (Math.random() - 0.5) * 0.0002  // Environ ±10 mètres en longitude
  };
}

