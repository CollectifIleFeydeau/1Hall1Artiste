/**
 * Script pour traiter les contributions en attente de la galerie communautaire
 * Ce script est exécuté par GitHub Actions pour :
 * 1. Récupérer les contributions en attente depuis l'API
 * 2. Traiter les images (redimensionnement, optimisation)
 * 3. Mettre à jour les fichiers JSON de contenu
 * 4. Sauvegarder les images dans le dépôt
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configuration
const CONFIG = {
  // Dossier où sont stockées les données
  dataDir: path.join(process.cwd(), 'public', 'data'),
  
  // Dossier où sont stockées les images
  imagesDir: path.join(process.cwd(), 'public', 'images', 'community'),
  
  // URL de l'API pour récupérer les contributions en attente (en mode développement, utiliser des données mock)
  pendingContributionsUrl: process.env.PENDING_CONTRIBUTIONS_URL || 'mock',
  
  // Configuration GitHub
  github: {
    owner: 'CollectifIleFeydeau',
    repo: '1Hall1Artiste',
    branch: 'main',
    dataPath: 'public/data/pending-contributions.json'
  },
  
  // Token d'authentification pour l'API
  apiToken: process.env.API_TOKEN,
  
  // Tailles des images
  imageSizes: {
    full: { width: 1200, height: 900 },
    thumbnail: { width: 300, height: 300 }
  }
};

/**
 * Point d'entrée principal du script
 */
async function main() {
  try {
    console.log('Démarrage du traitement des contributions...');
    
    // S'assurer que les dossiers existent
    await ensureDirectoriesExist();
    
    // Charger les données existantes
    const communityData = await loadCommunityData();
    
    // Récupérer les contributions en attente
    const pendingContributions = await fetchPendingContributions();
    
    if (pendingContributions.length === 0) {
      console.log('Aucune contribution en attente.');
      return;
    }
    
    console.log(`${pendingContributions.length} contributions en attente trouvées.`);
    
    // Traiter chaque contribution
    for (const contribution of pendingContributions) {
      try {
        // Générer un ID unique pour la contribution
        contribution.id = contribution.id || `entry-${uuidv4()}`;
        
        // Traiter l'image si présente
        if (contribution.type === 'photo' && contribution.imageUrl) {
          const processedImage = await processImage(contribution.imageUrl);
          contribution.imageUrl = processedImage.fullUrl;
          contribution.thumbnailUrl = processedImage.thumbnailUrl;
        }
        
        // Ajouter la contribution aux données
        communityData.entries.push({
          ...contribution,
          createdAt: contribution.createdAt || new Date().toISOString(),
          moderation: {
            status: 'approved',
            moderatedAt: new Date().toISOString()
          }
        });
        
        console.log(`Contribution ${contribution.id} traitée avec succès.`);
      } catch (error) {
        console.error(`Erreur lors du traitement de la contribution:`, error);
      }
    }
    
    // Trier les entrées par date de création (plus récentes en premier)
    communityData.entries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Sauvegarder les données mises à jour
    await saveCommunityData(communityData);
    
    // Marquer les contributions comme traitées
    await markContributionsAsProcessed(pendingContributions.map(c => c.id));
    
    console.log('Traitement des contributions terminé avec succès.');
  } catch (error) {
    console.error('Erreur lors du traitement des contributions:', error);
    process.exit(1);
  }
}

/**
 * S'assure que les dossiers nécessaires existent
 */
async function ensureDirectoriesExist() {
  try {
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
    await fs.mkdir(CONFIG.imagesDir, { recursive: true });
    await fs.mkdir(path.join(CONFIG.imagesDir, 'thumbnails'), { recursive: true });
  } catch (error) {
    console.error('Erreur lors de la création des dossiers:', error);
    throw error;
  }
}

/**
 * Charge les données communautaires existantes
 */
async function loadCommunityData() {
  const filePath = path.join(CONFIG.dataDir, 'community-content.json');
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas, créer une structure vide
    if (error.code === 'ENOENT') {
      return {
        lastUpdated: new Date().toISOString(),
        entries: []
      };
    }
    throw error;
  }
}

/**
 * Sauvegarde les données communautaires
 */
async function saveCommunityData(data) {
  const filePath = path.join(CONFIG.dataDir, 'community-content.json');
  
  // Mettre à jour la date de dernière modification
  data.lastUpdated = new Date().toISOString();
  
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Données communautaires sauvegardées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
    throw error;
  }
}

/**
 * Récupère les contributions en attente depuis le fichier GitHub
 */
async function fetchPendingContributions() {
  try {
    // En mode développement, utiliser des données fictives
    if (process.env.NODE_ENV === 'development' || CONFIG.pendingContributionsUrl === 'mock') {
      return getMockPendingContributions();
    }
    
    // Lire le fichier pending-contributions.json depuis le système de fichiers
    const pendingFilePath = path.join(CONFIG.dataDir, 'pending-contributions.json');
    
    try {
      const data = await fs.readFile(pendingFilePath, 'utf8');
      const parsedData = JSON.parse(data);
      return parsedData.contributions || [];
    } catch (error) {
      // Si le fichier n'existe pas, retourner un tableau vide
      if (error.code === 'ENOENT') {
        console.log('Aucun fichier de contributions en attente trouvé.');
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des contributions en attente:', error);
    return [];
  }
}

/**
 * Traite une image (téléchargement, redimensionnement, optimisation)
 */
async function processImage(imageUrl) {
  try {
    // Générer un nom de fichier unique
    const fileName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
    const fullPath = path.join(CONFIG.imagesDir, fileName);
    const thumbnailPath = path.join(CONFIG.imagesDir, 'thumbnails', fileName);
    
    // Télécharger l'image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const buffer = await response.buffer();
    
    // Traiter l'image pour la version complète
    await sharp(buffer)
      .resize(CONFIG.imageSizes.full.width, CONFIG.imageSizes.full.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(fullPath);
    
    // Créer la miniature
    await sharp(buffer)
      .resize(CONFIG.imageSizes.thumbnail.width, CONFIG.imageSizes.thumbnail.height, {
        fit: 'cover',
        position: 'centre'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Retourner les chemins relatifs pour les URLs
    return {
      fullUrl: `/images/community/${fileName}`,
      thumbnailUrl: `/images/community/thumbnails/${fileName}`
    };
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
}

/**
 * Marque les contributions comme traitées en supprimant le fichier pending-contributions.json
 */
async function markContributionsAsProcessed(contributionIds) {
  try {
    if (process.env.NODE_ENV === 'development' || CONFIG.pendingContributionsUrl === 'mock') {
      console.log('Mode développement: les contributions ne sont pas marquées comme traitées');
      return;
    }
    
    // Supprimer le fichier pending-contributions.json
    const pendingFilePath = path.join(CONFIG.dataDir, 'pending-contributions.json');
    
    try {
      await fs.unlink(pendingFilePath);
      console.log(`Fichier pending-contributions.json supprimé. ${contributionIds.length} contributions marquées comme traitées.`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('Aucun fichier pending-contributions.json à supprimer.');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Erreur lors du marquage des contributions comme traitées:', error);
  }
}

/**
 * Données fictives pour le développement
 */
function getMockPendingContributions() {
  return [
    {
      id: `entry-${uuidv4()}`,
      type: 'testimonial',
      content: 'Ceci est un témoignage de test généré automatiquement.',
      displayName: 'Utilisateur Test',
      createdAt: new Date().toISOString(),
      sessionId: `session-${uuidv4()}`
    }
  ];
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});
