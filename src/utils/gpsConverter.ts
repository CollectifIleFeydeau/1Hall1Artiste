/**
 * Utilitaire pour convertir les coordonnées GPS en coordonnées de carte
 * en utilisant les coins de l'île Feydeau comme référence
 */

import { FEYDEAU_CORNERS } from '@/data/gpsCoordinates';

// Définition des coins de la carte (coordonnées x,y)
const MAP_CORNERS = {
  topLeft: { x: 100, y: 50 },     // Cours Olivier de Clisson (Nord-Ouest)
  topRight: { x: 300, y: 50 },    // Quai Turenne (Nord-Est)
  bottomLeft: { x: 100, y: 550 }, // Allée Duguay Trouin (Sud-Ouest)
  bottomRight: { x: 300, y: 550 } // Quai Turenne (Sud-Est)
};

// Points de référence existants (GPS -> coordonnées carte)
export const referenceLocations = [
  { 
    name: "8 quai Turenne",
    gps: { latitude: 47.212746973313344, longitude: -1.5547571895170953 },
    map: { x: 300, y: 108 }
  },
  { 
    name: "9 quai Turenne",
    gps: { latitude: 47.21230600, longitude: -1.55698600 },
    map: { x: 260, y: 150 }
  },
  { 
    name: "10 quai Turenne",
    gps: { latitude: 47.213066264735716, longitude: -1.5555775290702223 },
    map: { x: 260, y: 224 }
  },
  { 
    name: "17 rue Kervégan",
    gps: { latitude: 47.21247281536768, longitude: -1.5562154487439073 },
    map: { x: 220, y: 407 }
  },
  { 
    name: "11 allée Duguay Trouin",
    gps: { latitude: 47.213066264735716, longitude: -1.5555775290702223 },
    map: { x: 150, y: 186 }
  },
  { 
    name: "15 allée Duguay Trouin",
    gps: { latitude: 47.21274016472948, longitude: -1.5567136782622693 },
    map: { x: 105, y: 407 }
  },
  { 
    name: "16 allée Duguay Trouin",
    gps: { latitude: 47.21265104842529, longitude: -1.5568766504416809 },
    map: { x: 105, y: 450 }
  },
  { 
    name: "32 rue Kervégan",
    gps: { latitude: 47.2123232, longitude: -1.5570202 },
    map: { x: 185, y: 507 }
  },
  { 
    name: "Rue Duguesclin",
    gps: { latitude: 47.21299917260203, longitude: -1.556253314217484 },
    map: { x: 130, y: 310 }
  },
  {
    name: "Maison Jules Verne",
    gps: { latitude: 47.213307, longitude: -1.554879 },
    map: { x: 170, y: 50 } // Coordonnées corrigées manuellement
  }
];

/**
 * Calcule la distance entre deux points GPS
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
 * Convertit les coordonnées GPS en coordonnées de carte (x, y)
 * en utilisant une transformation affine complète qui prend en compte l'inclinaison de l'île
 */
export function gpsToMapCoordinatesAffine(latitude: number, longitude: number): { x: number; y: number } {
  // Définition des points de référence (coins de l'île Feydeau)
  // Coordonnées GPS des quatre coins
  const gpsPoints = [
    { x: FEYDEAU_CORNERS.topLeft.longitude, y: FEYDEAU_CORNERS.topLeft.latitude },       // Nord-Ouest
    { x: FEYDEAU_CORNERS.topRight.longitude, y: FEYDEAU_CORNERS.topRight.latitude },      // Nord-Est
    { x: FEYDEAU_CORNERS.bottomLeft.longitude, y: FEYDEAU_CORNERS.bottomLeft.latitude },  // Sud-Ouest
    { x: FEYDEAU_CORNERS.bottomRight.longitude, y: FEYDEAU_CORNERS.bottomRight.latitude } // Sud-Est
  ];
  
  // Coordonnées correspondantes sur la carte
  const mapPoints = [
    { x: MAP_CORNERS.topLeft.x, y: MAP_CORNERS.topLeft.y },         // Nord-Ouest
    { x: MAP_CORNERS.topRight.x, y: MAP_CORNERS.topRight.y },       // Nord-Est
    { x: MAP_CORNERS.bottomLeft.x, y: MAP_CORNERS.bottomLeft.y },   // Sud-Ouest
    { x: MAP_CORNERS.bottomRight.x, y: MAP_CORNERS.bottomRight.y }  // Sud-Est
  ];
  
  // Calcul des coefficients de la transformation affine
  // Pour une transformation affine complète, nous avons besoin de résoudre:
  // x' = a*x + b*y + c
  // y' = d*x + e*y + f
  // où (x,y) sont les coordonnées GPS et (x',y') sont les coordonnées de la carte
  
  // Nous allons utiliser les quatre coins pour calculer les coefficients
  // en résolvant un système d'équations linéaires
  
  // Première étape : calculer les coefficients pour la transformation de x
  // Nous utilisons les trois premiers points pour créer un système 3x3
  const matrixX = [
    [gpsPoints[0].x, gpsPoints[0].y, 1],
    [gpsPoints[1].x, gpsPoints[1].y, 1],
    [gpsPoints[2].x, gpsPoints[2].y, 1]
  ];
  
  const vectorX = [
    mapPoints[0].x,
    mapPoints[1].x,
    mapPoints[2].x
  ];
  
  // Deuxième étape : calculer les coefficients pour la transformation de y
  const matrixY = [
    [gpsPoints[0].x, gpsPoints[0].y, 1],
    [gpsPoints[1].x, gpsPoints[1].y, 1],
    [gpsPoints[2].x, gpsPoints[2].y, 1]
  ];
  
  const vectorY = [
    mapPoints[0].y,
    mapPoints[1].y,
    mapPoints[2].y
  ];
  
  // Résoudre les systèmes d'équations pour obtenir les coefficients
  const coeffX = solveLinearSystem(matrixX, vectorX);
  const coeffY = solveLinearSystem(matrixY, vectorY);
  
  // Si nous n'avons pas pu résoudre le système, utiliser une approche de secours
  if (!coeffX || !coeffY) {
    // Approche de secours : interpolation linéaire simple
    const lonMin = Math.min(...gpsPoints.map(p => p.x));
    const lonMax = Math.max(...gpsPoints.map(p => p.x));
    const latMin = Math.min(...gpsPoints.map(p => p.y));
    const latMax = Math.max(...gpsPoints.map(p => p.y));
    
    const xMin = Math.min(...mapPoints.map(p => p.x));
    const xMax = Math.max(...mapPoints.map(p => p.x));
    const yMin = Math.min(...mapPoints.map(p => p.y));
    const yMax = Math.max(...mapPoints.map(p => p.y));
    
    const relX = (longitude - lonMin) / (lonMax - lonMin);
    const relY = 1 - ((latitude - latMin) / (latMax - latMin)); // Inversion pour Y
    
    const x = xMin + relX * (xMax - xMin);
    const y = yMin + relY * (yMax - yMin);
    
    return { x: Math.round(x), y: Math.round(y) };
  }
  
  // Appliquer la transformation affine aux coordonnées GPS d'entrée
  const x = coeffX[0] * longitude + coeffX[1] * latitude + coeffX[2];
  const y = coeffY[0] * longitude + coeffY[1] * latitude + coeffY[2];
  
  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Résout un système d'équations linéaires 3x3 en utilisant la règle de Cramer
 * @param matrix Matrice 3x3 des coefficients
 * @param vector Vecteur des termes constants
 * @returns Vecteur solution [a, b, c] ou null si le système n'a pas de solution unique
 */
function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  // Calcul du déterminant de la matrice principale
  const det = determinant3x3(matrix);
  
  // Si le déterminant est proche de zéro, le système n'a pas de solution unique
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  
  // Créer les matrices pour chaque inconnue en remplaçant une colonne par le vecteur
  const matrix1 = [
    [vector[0], matrix[0][1], matrix[0][2]],
    [vector[1], matrix[1][1], matrix[1][2]],
    [vector[2], matrix[2][1], matrix[2][2]]
  ];
  
  const matrix2 = [
    [matrix[0][0], vector[0], matrix[0][2]],
    [matrix[1][0], vector[1], matrix[1][2]],
    [matrix[2][0], vector[2], matrix[2][2]]
  ];
  
  const matrix3 = [
    [matrix[0][0], matrix[0][1], vector[0]],
    [matrix[1][0], matrix[1][1], vector[1]],
    [matrix[2][0], matrix[2][1], vector[2]]
  ];
  
  // Calculer les déterminants des matrices modifiées
  const det1 = determinant3x3(matrix1);
  const det2 = determinant3x3(matrix2);
  const det3 = determinant3x3(matrix3);
  
  // Calculer les coefficients selon la règle de Cramer
  return [det1 / det, det2 / det, det3 / det];
}

/**
 * Calcule le déterminant d'une matrice 3x3
 */
function determinant3x3(matrix: number[][]): number {
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
}

/**
 * Convertit les coordonnées GPS en coordonnées de carte (x, y)
 * en utilisant une triangulation basée sur les points de référence connus
 */
export function gpsToMapCoordinates(
  latitude: number, 
  longitude: number
): { x: number; y: number; nearestPoints: Array<{name: string, distance: number}> } {
  // Trouver les trois points les plus proches
  const sortedPoints = [...referenceLocations]
    .map(point => ({
      ...point,
      distance: calculateGPSDistance(
        { latitude, longitude },
        point.gps
      )
    }))
    .sort((a, b) => a.distance - b.distance);
    
  const nearestPoints = sortedPoints.slice(0, 3);

  // Si un point est très proche, utiliser directement ses coordonnées
  const veryClosePoint = nearestPoints.find(p => p.distance < 0.00005); // ~5m
  if (veryClosePoint) {
    return { 
      x: veryClosePoint.map.x, 
      y: veryClosePoint.map.y,
      nearestPoints: nearestPoints.map(p => ({
        name: p.name,
        distance: p.distance
      }))
    };
  }

  // Calculer les poids inversement proportionnels à la distance
  const totalDistance = nearestPoints.reduce((sum, p) => sum + p.distance, 0);
  const weights = nearestPoints.map(p => {
    // Éviter la division par zéro
    if (p.distance === 0) return 1;
    // Plus la distance est petite, plus le poids est grand
    return (totalDistance - p.distance) / totalDistance;
  });

  // Normaliser les poids pour qu'ils somment à 1
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  // Calculer les coordonnées pondérées
  let x = 0;
  let y = 0;

  for (let i = 0; i < nearestPoints.length; i++) {
    x += nearestPoints[i].map.x * normalizedWeights[i];
    y += nearestPoints[i].map.y * normalizedWeights[i];
  }

  return { 
    x: Math.round(x), 
    y: Math.round(y),
    nearestPoints: nearestPoints.map(p => ({
      name: p.name,
      distance: p.distance
    }))
  };
}

/**
 * Fonction de test pour convertir des coordonnées GPS en coordonnées de carte
 */
export function testGPSConversion(latitude: number, longitude: number): string {
  const resultTriangulation = gpsToMapCoordinates(latitude, longitude);
  const resultAffine = gpsToMapCoordinatesAffine(latitude, longitude);
  
  let output = `Coordonnées GPS (${latitude}, ${longitude})\n\n`;
  output += `Méthode triangulation: (${resultTriangulation.x}, ${resultTriangulation.y})\n`;
  output += `Méthode affine: (${resultAffine.x}, ${resultAffine.y})\n\n`;
  output += "Points les plus proches:\n";
  
  resultTriangulation.nearestPoints.forEach((point, index) => {
    output += `${index + 1}. ${point.name} - Distance: ${point.distance.toFixed(8)}\n`;
  });
  
  return output;
}

