/**
 * Système de coordonnées unifié pour l'Île Feydeau
 * Ce module centralise toutes les fonctions de conversion et de calcul
 */

// Importer les coins de l'Île Feydeau depuis le fichier de coordonnées GPS
import { FEYDEAU_CORNERS } from '../data/gpsCoordinates';

// Dimensions de la carte en pixels
export const MAP_DIMENSIONS = {
  width: 455,
  height: 600
};

// Dimensions réelles de l'Île Feydeau en mètres
export const FEYDEAU_DIMENSIONS = {
  width: 77,    // Largeur est-ouest
  height: 172,  // Longueur nord-sud
  diagonal: 216 // Diagonale
};

/**
 * Convertit des coordonnées GPS en coordonnées de carte
 * Méthode directe basée sur la position du 8 quai Turenne
 */
export function gpsToMapCoordinates(lat: number, lng: number): { x: number, y: number } {
  // Points de référence connus avec leurs coordonnées GPS et de carte précises
  const referencePoints = [
    // 8 quai Turenne
    {
      gps: { latitude: 47.212775, longitude: -1.554741 },
      map: { x: 300, y: 108 }
    },
    // 9 quai Turenne
    {
      gps: { latitude: 47.212650, longitude: -1.554600 },
      map: { x: 320, y: 150 }
    },
    // 10 quai Turenne
    {
      gps: { latitude: 47.212623596191406, longitude: -1.5549430847167969 },
      map: { x: 340, y: 200 }
    },
    // 32 Rue Kervégan
    {
      gps: { latitude: 47.212306, longitude: -1.556986 },
      map: { x: 150, y: 350 }
    },
    // Centre de l'Île
    {
      gps: { latitude: 47.212600, longitude: -1.555900 },
      map: { x: 200, y: 300 }
    }
  ];
  
  // Vérifier si les coordonnées correspondent exactement à un point de référence connu
  for (const point of referencePoints) {
    if (lat === point.gps.latitude && lng === point.gps.longitude) {
      return point.map;
    }
  }
  
  // Si aucune correspondance exacte, utiliser une interpolation pondérée basée sur les points de référence
  
  // Trouver les deux points de référence les plus proches
  let closestPoints = referencePoints.map(point => {
    // Calculer la distance entre le point de référence et les coordonnées d'entrée
    const latDiff = lat - point.gps.latitude;
    const lngDiff = lng - point.gps.longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    return { ...point, distance };
  }).sort((a, b) => a.distance - b.distance);
  
  // Si nous avons au moins deux points de référence, utiliser une interpolation pondérée
  if (closestPoints.length >= 2) {
    // Utiliser les trois points les plus proches pour une meilleure précision
    const numPoints = Math.min(3, closestPoints.length);
    closestPoints = closestPoints.slice(0, numPoints);
    
    // Calculer les poids inverses (plus le point est proche, plus son poids est élevé)
    const totalWeight = closestPoints.reduce((sum, point) => {
      // Éviter la division par zéro
      const weight = point.distance === 0 ? 1000 : 1 / point.distance;
      return sum + weight;
    }, 0);
    
    // Calculer les coordonnées de carte pondérées
    let x = 0;
    let y = 0;
    
    closestPoints.forEach(point => {
      const weight = point.distance === 0 ? 1000 : 1 / point.distance;
      const normalizedWeight = weight / totalWeight;
      
      x += point.map.x * normalizedWeight;
      y += point.map.y * normalizedWeight;
    });
    
    return { x, y };
  }
  
  // Si l'interpolation échoue pour une raison quelconque, utiliser la méthode de base avec le 8 quai Turenne
  const referenceGps = referencePoints[0].gps;
  const referenceMap = referencePoints[0].map;
  
  // Facteurs de conversion (déterminés empiriquement)
  const latPixelsPerDegree = 5000;
  const lngPixelsPerDegree = 5000;
  
  // Calcul des différences en degrés
  const latDiff = lat - referenceGps.latitude;
  const lngDiff = lng - referenceGps.longitude;
  
  // Conversion en pixels et ajout à la position de référence
  const x = referenceMap.x + lngDiff * lngPixelsPerDegree;
  const y = referenceMap.y - latDiff * latPixelsPerDegree; // Inversion car y augmente vers le bas sur la carte
  
  return { x, y };
}

/**
 * Convertit des coordonnées de carte en coordonnées GPS
 */
export function mapToGpsCoordinates(x: number, y: number): { latitude: number, longitude: number } {
  // Calculer les ratios ajustés
  const adjustedLngRatio = x / MAP_DIMENSIONS.width;
  const adjustedLatRatio = y / MAP_DIMENSIONS.height;
  
  // Inverser l'ajustement
  const lngRatio = adjustedLngRatio / 0.72;
  const latRatio = adjustedLatRatio / 0.42;
  
  // Calculer les différences de coordonnées
  const latRange = FEYDEAU_CORNERS.topLeft.latitude - FEYDEAU_CORNERS.bottomRight.latitude;
  const lngRange = FEYDEAU_CORNERS.topRight.longitude - FEYDEAU_CORNERS.bottomLeft.longitude;
  
  // Convertir en coordonnées GPS
  const latitude = FEYDEAU_CORNERS.topLeft.latitude - (latRatio * latRange);
  const longitude = FEYDEAU_CORNERS.bottomLeft.longitude + (lngRatio * lngRange);
  
  return { latitude, longitude };
}

/**
 * Calcule la distance entre deux points sur la carte (en pixels)
 */
export function calculateMapDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Convertit une distance en pixels en mètres
 */
export function pixelsToMeters(pixels: number): number {
  // Facteur de conversion basé sur la diagonale
  const diagonalPixels = Math.sqrt(Math.pow(MAP_DIMENSIONS.width, 2) + Math.pow(MAP_DIMENSIONS.height, 2));
  const conversionFactor = FEYDEAU_DIMENSIONS.diagonal / diagonalPixels;
  
  return pixels * conversionFactor;
}

/**
 * Calcule l'angle entre deux points sur la carte
 */
export function calculateMapAngle(x1: number, y1: number, x2: number, y2: number): number {
  // Calculer l'angle en radians puis convertir en degrés
  const angleRadians = Math.atan2(y2 - y1, x2 - x1);
  let angleDegrees = angleRadians * 180 / Math.PI;
  
  // Normaliser l'angle (0-360)
  if (angleDegrees < 0) {
    angleDegrees += 360;
  }
  
  return angleDegrees;
}

/**
 * Teste la conversion des coordonnées GPS en coordonnées de carte
 * pour le 8 quai Turenne
 */
export function testCoordinateConversion() {
  const testGps = {
    latitude: 47.212775,
    longitude: -1.554741
  };
  
  const mapCoords = gpsToMapCoordinates(testGps.latitude, testGps.longitude);
  console.log('Test de conversion pour 8 quai Turenne:');
  console.log('Coordonnées GPS:', testGps);
  console.log('Coordonnées de carte calculées:', mapCoords);
  console.log('Coordonnées de carte attendues: { x: 300, y: 108 }');
  
  return mapCoords;
}
