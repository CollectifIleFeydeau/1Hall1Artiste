/**
 * Utilitaire de navigation pour convertir les coordonnées GPS en coordonnées de carte
 * et calculer les distances, directions, etc.
 */

import { Location } from "@/data/locations";
import { referenceLocations } from "./gpsConverter";

/**
 * Convertit les coordonnées GPS en coordonnées de carte (x, y)
 * en utilisant la transformation affine précise qui prend en compte l'inclinaison de l'île
 * @deprecated Utiliser directement gpsToMapCoordinatesAffine de gpsConverter.ts
 */
export function gpsToMapCoordinates(
  latitude: number, 
  longitude: number
): { x: number; y: number } {
  // Importer la fonction affine depuis gpsConverter
  const { gpsToMapCoordinatesAffine } = require('./gpsConverter');
  
  // Utiliser directement la transformation affine
  return gpsToMapCoordinatesAffine(latitude, longitude);
}

/**
 * Calcule la distance entre deux points GPS en mètres
 */
export function calculateGPSDistanceInMeters(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Calcule la distance euclidienne entre deux points GPS
 * (utile pour comparer des distances relatives, pas en mètres)
 */
export function calculateGPSDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  return Math.sqrt(
    Math.pow(point1.latitude - point2.latitude, 2) +
    Math.pow(point1.longitude - point2.longitude, 2)
  );
}

/**
 * Calcule la distance entre deux points sur la carte
 */
export function calculateMapDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + 
    Math.pow(point1.y - point2.y, 2)
  );
}

/**
 * Trouve le lieu le plus proche d'une position GPS donnée
 */
export function findNearestLocation(
  latitude: number,
  longitude: number,
  locations: Location[]
): Location | null {
  if (!locations || locations.length === 0) return null;

  let nearestLocation: Location | null = null;
  let minDistance = Number.MAX_VALUE;

  for (const location of locations) {
    if (location.gps) {
      const distance = calculateGPSDistance(
        { latitude, longitude },
        { latitude: location.gps.latitude, longitude: location.gps.longitude }
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = location;
      }
    }
  }

  return nearestLocation;
}

/**
 * Calcule la direction entre deux points GPS (en degrés, 0 = Nord, 90 = Est)
 */
export function calculateBearing(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): number {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLng = (end.longitude * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

/**
 * Convertit une direction en degrés en texte (N, NE, E, etc.)
 */
export function bearingToText(bearing: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Vérifie si un utilisateur est proche d'un lieu
 */
export function isNearLocation(
  userLatitude: number,
  userLongitude: number,
  location: Location,
  thresholdMeters: number = 50
): boolean {
  if (!location.gps) return false;

  const distance = calculateGPSDistanceInMeters(
    { latitude: userLatitude, longitude: userLongitude },
    { latitude: location.gps.latitude, longitude: location.gps.longitude }
  );

  return distance <= thresholdMeters;
}

/**
 * Génère des instructions de navigation textuelles
 */
export function generateNavigationInstructions(
  userLatitude: number,
  userLongitude: number,
  targetLocation: Location
): string {
  if (!targetLocation.gps) return "Destination inconnue";

  const distance = calculateGPSDistanceInMeters(
    { latitude: userLatitude, longitude: userLongitude },
    { latitude: targetLocation.gps.latitude, longitude: targetLocation.gps.longitude }
  );

  const bearing = calculateBearing(
    { latitude: userLatitude, longitude: userLongitude },
    { latitude: targetLocation.gps.latitude, longitude: targetLocation.gps.longitude }
  );

  const direction = bearingToText(bearing);

  if (distance < 20) {
    return `Vous êtes arrivé à ${targetLocation.name}`;
  } else if (distance < 50) {
    return `${targetLocation.name} est tout proche, direction ${direction}`;
  } else if (distance < 100) {
    return `${targetLocation.name} est à ${Math.round(distance)} mètres, direction ${direction}`;
  } else {
    return `${targetLocation.name} est à ${Math.round(distance / 10) * 10} mètres, direction ${direction}`;
  }
}

