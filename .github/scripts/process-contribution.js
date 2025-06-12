/**
 * Script de traitement des contributions pour la galerie communautaire
 * Appelé par le workflow GitHub Actions
 */
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

// Chemins des fichiers et dossiers
const DATA_DIR = path.join(process.cwd(), 'data');
const IMAGES_DIR = path.join(process.cwd(), 'images');
const THUMBNAILS_DIR = path.join(process.cwd(), 'thumbnails');
const CONTENT_FILE = path.join(DATA_DIR, 'community-content.json');

// Création des dossiers s'ils n'existent pas
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(IMAGES_DIR);
fs.ensureDirSync(THUMBNAILS_DIR);

// Récupération des variables d'environnement
const contributionId = process.env.CONTRIBUTION_ID;
const contributionType = process.env.CONTRIBUTION_TYPE;
const imageUrl = process.env.IMAGE_URL;
const displayName = process.env.DISPLAY_NAME || 'Anonyme';
const eventId = process.env.EVENT_ID || null;
const locationId = process.env.LOCATION_ID || null;
const content = process.env.CONTENT || '';
const timestamp = process.env.TIMESTAMP || new Date().toISOString();

async function main() {
  console.log(`Traitement de la contribution: ${contributionId} (${contributionType})`);
  
  // Charger le fichier JSON existant ou créer un nouveau
  let contentData = { entries: [] };
  if (fs.existsSync(CONTENT_FILE)) {
    try {
      contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier JSON:', error);
    }
  }
  
  // Créer l'objet de contribution
  const newEntry = {
    id: contributionId,
    type: contributionType,
    displayName,
    eventId,
    locationId,
    timestamp,
    likes: 0,
    likedBy: [],
    moderation: {
      status: 'approved',
      moderatedAt: new Date().toISOString()
    }
  };
  
  // Ajouter les champs spécifiques selon le type de contribution
  if (contributionType === 'photo' && imageUrl) {
    try {
      // Télécharger l'image
      console.log(`Téléchargement de l'image: ${imageUrl}`);
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);
      
      // Sauvegarder l'image originale
      const imagePath = path.join(IMAGES_DIR, `${contributionId}.jpg`);
      fs.writeFileSync(imagePath, imageBuffer);
      console.log(`Image sauvegardée: ${imagePath}`);
      
      // Créer une miniature
      const thumbnailPath = path.join(THUMBNAILS_DIR, `${contributionId}.jpg`);
      await sharp(imageBuffer)
        .resize(300, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      console.log(`Miniature créée: ${thumbnailPath}`);
      
      // Ajouter les URLs des images à l'entrée
      newEntry.imageUrl = `https://github.com/CollectifIleFeydeau/community-content/raw/main/images/${contributionId}.jpg`;
      newEntry.thumbnailUrl = `https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/${contributionId}.jpg`;
      
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return false;
    }
  } else if (contributionType === 'testimonial') {
    newEntry.content = content;
  }
  
  // Ajouter la nouvelle entrée au tableau
  contentData.entries.push(newEntry);
  
  // Sauvegarder le fichier JSON mis à jour
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(contentData, null, 2));
    console.log(`Fichier JSON mis à jour: ${CONTENT_FILE}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture du fichier JSON:', error);
    return false;
  }
}

// Exécuter le script
main()
  .then(success => {
    if (success) {
      console.log('Contribution traitée avec succès!');
      process.exit(0);
    } else {
      console.error('Échec du traitement de la contribution');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  });
