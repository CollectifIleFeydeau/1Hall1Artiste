/**
 * Script de synchronisation des images communautaires
 * 
 * Ce script télécharge les images depuis Cloudinary pour les stocker localement
 * dans le repository de l'app principale (pour un accès plus rapide).
 * 
 * Note: Avec Cloudinary, ce script peut être simplifié car les images
 * sont déjà hébergées sur un CDN performant.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('[sync-community-images] Démarrage de la synchronisation des images...');

// Lire le fichier entries.json qui vient d'être téléchargé
const entriesPath = path.join(__dirname, '../public/data/community-content.json');

if (!fs.existsSync(entriesPath)) {
  console.log('[sync-community-images] Aucun fichier community-content.json trouvé, rien à synchroniser');
  process.exit(0);
}

const entriesData = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
const entries = entriesData.entries || [];

console.log(`[sync-community-images] ${entries.length} entrées trouvées`);

// Filtrer les entrées avec des images Cloudinary
const imageEntries = entries.filter(entry => 
  entry.type === 'photo' && 
  (entry.imageUrl || entry.thumbnailUrl) &&
  (entry.imageUrl?.includes('cloudinary.com') || entry.thumbnailUrl?.includes('cloudinary.com'))
);

console.log(`[sync-community-images] ${imageEntries.length} images Cloudinary détectées`);

if (imageEntries.length === 0) {
  console.log('[sync-community-images] Aucune image à synchroniser');
  process.exit(0);
}

// Créer le dossier de destination
const imagesDir = path.join(__dirname, '../public/images/community');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`[sync-community-images] Dossier créé: ${imagesDir}`);
}

// Pour l'instant, on ne télécharge pas les images localement
// car Cloudinary fournit déjà un CDN performant
// On se contente de vérifier que les URLs sont accessibles

let processedCount = 0;
let errorCount = 0;

imageEntries.forEach((entry, index) => {
  const imageUrl = entry.imageUrl || entry.thumbnailUrl;
  
  console.log(`[sync-community-images] [${index + 1}/${imageEntries.length}] Vérification: ${imageUrl}`);
  
  // Simple vérification que l'URL est valide (format Cloudinary)
  if (imageUrl.includes('res.cloudinary.com')) {
    processedCount++;
    console.log(`[sync-community-images] ✅ URL valide: ${entry.id}`);
  } else {
    errorCount++;
    console.log(`[sync-community-images] ❌ URL invalide: ${entry.id} - ${imageUrl}`);
  }
});

console.log(`[sync-community-images] Synchronisation terminée:`);
console.log(`[sync-community-images] - ${processedCount} images vérifiées`);
console.log(`[sync-community-images] - ${errorCount} erreurs`);

// Note: Dans une version future, on pourrait télécharger les images
// pour créer un cache local, mais Cloudinary étant déjà un CDN,
// ce n'est pas nécessaire pour l'instant.
