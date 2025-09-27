/**
 * Analyse des coordonnées pour trouver la relation entre GPS et coordonnées de la carte
 */

// Points de référence existants (GPS -> coordonnées carte)
const referencePoints = [
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
  }
];

// Maison Jules Verne
const julesVerneGPS = { latitude: 47.213307, longitude: -1.554879 };

// Analyse visuelle des points pour trouver les plus proches en GPS
console.log("Points de référence les plus proches de la maison Jules Verne par coordonnées GPS:");
const sortedByGPSDistance = [...referencePoints].sort((a, b) => {
  const distA = Math.sqrt(
    Math.pow(a.gps.latitude - julesVerneGPS.latitude, 2) + 
    Math.pow(a.gps.longitude - julesVerneGPS.longitude, 2)
  );
  const distB = Math.sqrt(
    Math.pow(b.gps.latitude - julesVerneGPS.latitude, 2) + 
    Math.pow(b.gps.longitude - julesVerneGPS.longitude, 2)
  );
  return distA - distB;
});

sortedByGPSDistance.forEach((point, index) => {
  if (index < 3) {
    console.log(`${index + 1}. ${point.name} - GPS: (${point.gps.latitude}, ${point.gps.longitude}), Carte: (${point.map.x}, ${point.map.y})`);
  }
});

// Estimation basée sur le point le plus proche
const closestPoint = sortedByGPSDistance[0];
console.log(`\nPoint le plus proche: ${closestPoint.name}`);
console.log(`Coordonnées estimées pour la maison Jules Verne: (${closestPoint.map.x}, ${closestPoint.map.y})`);

// Estimation basée sur une moyenne pondérée des 3 points les plus proches
const top3Points = sortedByGPSDistance.slice(0, 3);
const weights = [0.6, 0.3, 0.1]; // Poids décroissants pour les 3 points les plus proches

let weightedX = 0;
let weightedY = 0;

top3Points.forEach((point, index) => {
  weightedX += point.map.x * weights[index];
  weightedY += point.map.y * weights[index];
});

console.log(`\nEstimation pondérée basée sur les 3 points les plus proches:`);
console.log(`Coordonnées estimées pour la maison Jules Verne: (${Math.round(weightedX)}, ${Math.round(weightedY)})`);

// Analyse des relations entre longitude et x
console.log("\nAnalyse longitude -> x:");
referencePoints.forEach(point => {
  console.log(`${point.name}: longitude ${point.gps.longitude} -> x ${point.map.x}`);
});

// Analyse des relations entre latitude et y
console.log("\nAnalyse latitude -> y:");
referencePoints.forEach(point => {
  console.log(`${point.name}: latitude ${point.gps.latitude} -> y ${point.map.y}`);
});

// Conclusion
console.log("\nConclusion: Les coordonnées les plus probables pour la maison Jules Verne sont:");
console.log(`x: ${Math.round(weightedX)}, y: ${Math.round(weightedY)}`);

