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
 * Utilise une transformation affine pour une précision optimale
 */
export function gpsToMapCoordinates(lat: number, lng: number): { x: number, y: number } {
  // Points de référence connus avec leurs coordonnées GPS et de carte précises
  const referencePoints = [
    // Nord-Ouest
    {
      gps: { latitude: 47.21345, longitude: -1.55715 },
      map: { x: 140, y: 180 }
    },
    // Nord-Est
    {
      gps: { latitude: 47.21345, longitude: -1.55515 },
      map: { x: 260, y: 180 }
    },
    // Sud-Ouest
    {
      gps: { latitude: 47.21245, longitude: -1.55715 },
      map: { x: 140, y: 420 }
    },
    // Sud-Est
    {
      gps: { latitude: 47.21245, longitude: -1.55515 },
      map: { x: 260, y: 420 }
    },
    // Centre de l'île
    {
      gps: { latitude: 47.21295, longitude: -1.55615 },
      map: { x: 200, y: 300 }
    }
  ];
  
  // Coefficients de la transformation affine (calculés à partir des points de référence)
  const affineCoeffs = {
    a: 0.0009170025842492867,
    b: 60000.000024211105,
    c: 93568.95674327895,
    d: -240000.0774556037,
    e: -0.0009183939047143717,
    f: 11331411.655478384
  };
  
  // Appliquer la transformation affine
  const x = affineCoeffs.a * lat + affineCoeffs.b * lng + affineCoeffs.c;
  const y = affineCoeffs.d * lat + affineCoeffs.e * lng + affineCoeffs.f;
  
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
