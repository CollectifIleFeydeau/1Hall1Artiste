/**
 * Coordonnées GPS précises pour les points d'intérêt de l'Île Feydeau
 * Ces coordonnées sont utilisées pour la localisation et la navigation
 */

// Fonction pour convertir les coordonnées DMS (Degrés, Minutes, Secondes) en décimal
const dmsToDecimal = (degrees: number, minutes: number, seconds: number, direction: string): number => {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W' || direction === 'O') {
    decimal = -decimal;
  }
  return decimal;
};

// Fonction pour parser une chaîne de coordonnées DMS
const parseDMS = (dmsString: string): number => {
  // Format attendu: 47°12'48.5"N ou similaire
  const regex = /(\d+)°(\d+)'([\d.]+)"([NSWE])/;
  const match = dmsString.match(regex);
  
  if (match) {
    const degrees = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);
    const direction = match[4];
    
    return dmsToDecimal(degrees, minutes, seconds, direction);
  }
  
  // Si le format ne correspond pas, essayer de parser comme un nombre décimal
  return parseFloat(dmsString);
};

// Coins de l'Île Feydeau avec coordonnées précises
export const FEYDEAU_CORNERS = {
  topLeft: {
    latitude: parseDMS("47°12'48.5\"N"),
    longitude: parseDMS("1°33'18.2\"W") * -1 // Convertir en valeur négative pour l'ouest
  },
  topRight: {
    latitude: parseDMS("47°12'46.2\"N"),
    longitude: parseDMS("1°33'16.2\"W") * -1
  },
  bottomLeft: {
    latitude: parseDMS("47°12'45.0\"N"),
    longitude: parseDMS("1°33'26.8\"W") * -1
  },
  bottomRight: {
    latitude: 47.2118506776877,
    longitude: -1.556968915695518
  }
};

// Centre calculé de l'Île Feydeau basé sur les coins
export const FEYDEAU_CENTER = {
  latitude: (FEYDEAU_CORNERS.topLeft.latitude + FEYDEAU_CORNERS.topRight.latitude + 
             FEYDEAU_CORNERS.bottomLeft.latitude + FEYDEAU_CORNERS.bottomRight.latitude) / 4,
  longitude: (FEYDEAU_CORNERS.topLeft.longitude + FEYDEAU_CORNERS.topRight.longitude + 
              FEYDEAU_CORNERS.bottomLeft.longitude + FEYDEAU_CORNERS.bottomRight.longitude) / 4
};

// Calcul des dimensions approximatives de l'Île Feydeau en mètres
const EARTH_RADIUS = 6371000; // Rayon de la Terre en mètres

// Calcul de la distance entre deux points GPS en mètres
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS * c;
};

// Calcul de la largeur et de la hauteur de l'Île
const width = calculateDistance(
  FEYDEAU_CORNERS.topLeft.latitude,
  FEYDEAU_CORNERS.topLeft.longitude,
  FEYDEAU_CORNERS.topRight.latitude,
  FEYDEAU_CORNERS.topRight.longitude
);

const height = calculateDistance(
  FEYDEAU_CORNERS.topLeft.latitude,
  FEYDEAU_CORNERS.topLeft.longitude,
  FEYDEAU_CORNERS.bottomLeft.latitude,
  FEYDEAU_CORNERS.bottomLeft.longitude
);

export const FEYDEAU_DIMENSIONS = {
  width,  // mètres (est-ouest)
  height  // mètres (nord-sud)
};

// Type pour les coordonnées GPS d'un lieu
export type GpsCoordinate = {
  id: string;      // ID du lieu (doit correspondre à l'ID dans locations.ts)
  latitude: number;
  longitude: number;
};

/**
 * Coordonnées GPS des points d'intérêt
 * Ces coordonnées sont calculées en fonction des coins de l'Île Feydeau
 * et de la position des points sur la carte
 */

// Fonction pour interpoler les coordonnées GPS en fonction de la position relative sur la carte
const interpolateCoordinates = (relX: number, relY: number): { latitude: number, longitude: number } => {
  // relX et relY sont des valeurs entre 0 et 1 représentant la position relative sur la carte
  // 0,0 = coin supérieur gauche, 1,1 = coin inférieur droit
  
  // Interpolation linéaire pour la latitude (axe Y)
  const latTop = FEYDEAU_CORNERS.topLeft.latitude * (1 - relX) + FEYDEAU_CORNERS.topRight.latitude * relX;
  const latBottom = FEYDEAU_CORNERS.bottomLeft.latitude * (1 - relX) + FEYDEAU_CORNERS.bottomRight.latitude * relX;
  const latitude = latTop * (1 - relY) + latBottom * relY;
  
  // Interpolation linéaire pour la longitude (axe X)
  const lngLeft = FEYDEAU_CORNERS.topLeft.longitude * (1 - relY) + FEYDEAU_CORNERS.bottomLeft.longitude * relY;
  const lngRight = FEYDEAU_CORNERS.topRight.longitude * (1 - relY) + FEYDEAU_CORNERS.bottomRight.longitude * relY;
  const longitude = lngLeft * (1 - relX) + lngRight * relX;
  
  return { latitude, longitude };
};

export const gpsCoordinates: GpsCoordinate[] = [
  {
    id: "quai-turenne-8",
    // Quai Turenne 8 est en haut à droite sur la carte
    ...interpolateCoordinates(0.8, 0.15)
  },
  {
    id: "quai-turenne-9",
    // Quai Turenne 9 est sur le côté droit, un peu plus bas
    ...interpolateCoordinates(0.75, 0.25)
  },
  {
    id: "quai-turenne-9-concert",
    // Quai Turenne 9 Concert est sur le côté droit, un peu plus bas
    ...interpolateCoordinates(0.75, 0.35)
  },
  {
    id: "quai-turenne-10",
    // Quai Turenne 10 est sur le côté droit, au milieu
    ...interpolateCoordinates(0.75, 0.45)
  },
  {
    id: "rue-kervegan-17",
    // Rue Kervegan 17 est sur le côté droit, en bas
    ...interpolateCoordinates(0.75, 0.65)
  },
  {
    id: "allee-duguay-trouin-11",
    // Allée Duguay Trouin 11 est sur le côté gauche, au milieu
    ...interpolateCoordinates(0.25, 0.45)
  },
  {
    id: "allee-duguay-trouin-15",
    // Allée Duguay Trouin 15 est sur le côté gauche, en bas
    ...interpolateCoordinates(0.25, 0.65)
  },
  {
    id: "allee-duguay-trouin-16",
    // Allée Duguay Trouin 16 est sur le côté gauche, tout en bas
    ...interpolateCoordinates(0.25, 0.75)
  },
  {
    id: "rue-kervegan-32",
    // Rue Kervegan 32 est au milieu, en bas
    ...interpolateCoordinates(0.5, 0.85)
  },
  {
    id: "rue-duguesclin",
    // Rue Duguesclin est au milieu
    ...interpolateCoordinates(0.5, 0.5)
  }
];

/**
 * Fonction pour obtenir les coordonnées GPS d'un lieu par son ID
 */
export function getGpsCoordinateById(locationId: string): GpsCoordinate | undefined {
  return gpsCoordinates.find(coord => coord.id === locationId);
}

/**
 * Fonction pour convertir les coordonnées de la carte (x, y) en coordonnées GPS
 * Cette fonction est l'inverse de gpsToMapCoordinates dans UserLocation.tsx
 */
export function mapToGpsCoordinates(
  x: number,
  y: number,
  mapWidth: number,
  mapHeight: number
): { latitude: number, longitude: number } {
  // Calculer la distance en mètres par rapport au centre
  const eastWestMeters = ((x - mapWidth / 2) / mapWidth) * FEYDEAU_DIMENSIONS.width;
  const northSouthMeters = ((mapHeight / 2 - y) / mapHeight) * FEYDEAU_DIMENSIONS.height;
  
  // Conversion approximative de mètres en degrés (à cette latitude)
  const metersPerLatDegree = 111000;
  const metersPerLngDegree = 111000 * Math.cos(FEYDEAU_CENTER.latitude * Math.PI / 180);
  
  // Calculer les différences en degrés
  const latDiff = northSouthMeters / metersPerLatDegree;
  const lngDiff = eastWestMeters / metersPerLngDegree;
  
  // Calculer les coordonnées GPS
  const latitude = FEYDEAU_CENTER.latitude + latDiff;
  const longitude = FEYDEAU_CENTER.longitude + lngDiff;
  
  return { latitude, longitude };
}
