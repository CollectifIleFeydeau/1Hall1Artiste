/**
 * Utilitaire pour calculer les coordonnées x,y sur la carte à partir des coordonnées GPS
 * en utilisant une fonction affine
 */

/**
 * Calcule la coordonnée x sur la carte à partir de la longitude GPS
 * en utilisant une fonction affine f(x) = ax + b
 * @param longitude La longitude GPS
 * @returns La coordonnée x sur la carte
 */
export function calculateXFromLongitude(longitude: number): number {
  // Coefficients de la fonction affine pour la longitude -> x
  // Ces coefficients sont calculés à partir des points de référence existants
  const a = -1200; // Coefficient directeur
  const b = -1600; // Ordonnée à l'origine
  
  return Math.round(a * longitude + b);
}

/**
 * Calcule la coordonnée y sur la carte à partir de la latitude GPS
 * en utilisant une fonction affine f(x) = ax + b
 * @param latitude La latitude GPS
 * @returns La coordonnée y sur la carte
 */
export function calculateYFromLatitude(latitude: number): number {
  // Coefficients de la fonction affine pour la latitude -> y
  // Ces coefficients sont calculés à partir des points de référence existants
  const a = 40000; // Coefficient directeur
  const b = -1887000; // Ordonnée à l'origine
  
  return Math.round(a * latitude + b);
}

/**
 * Calcule les coordonnées x,y sur la carte à partir des coordonnées GPS
 * @param latitude La latitude GPS
 * @param longitude La longitude GPS
 * @returns Les coordonnées {x, y} sur la carte
 */
export function calculateMapCoordinates(latitude: number, longitude: number): {x: number, y: number} {
  return {
    x: calculateXFromLongitude(longitude),
    y: calculateYFromLatitude(latitude)
  };
}
