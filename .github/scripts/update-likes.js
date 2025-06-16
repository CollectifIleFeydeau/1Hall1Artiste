/**
 * Script pour mettre à jour les likes d'une entrée de la galerie communautaire
 * Ce script est exécuté par GitHub Actions lorsqu'un utilisateur ajoute ou retire un like
 */
const fs = require('fs-extra');
const path = require('path');

// Configuration
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'community-content.json');

// Récupération des variables d'environnement
const entryId = process.env.ENTRY_ID;
const action = process.env.ACTION; // 'add' ou 'remove'
const sessionId = process.env.SESSION_ID;

async function main() {
  console.log(`Mise à jour des likes pour l'entrée: ${entryId} (action: ${action})`);
  
  // Vérifier que les paramètres sont valides
  if (!entryId || !action || !sessionId) {
    console.error('Paramètres manquants: entryId, action ou sessionId');
    return false;
  }
  
  // Vérifier que l'action est valide
  if (action !== 'add' && action !== 'remove') {
    console.error(`Action non valide: ${action}. Doit être 'add' ou 'remove'`);
    return false;
  }
  
  // Charger le fichier JSON existant
  let contentData;
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
    } else {
      console.error(`Fichier de contenu non trouvé: ${CONTENT_FILE}`);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON:', error);
    return false;
  }
  
  // Trouver l'entrée à mettre à jour
  const entryIndex = contentData.entries.findIndex(entry => entry.id === entryId);
  if (entryIndex === -1) {
    console.error(`Entrée non trouvée: ${entryId}`);
    return false;
  }
  
  // Récupérer l'entrée
  const entry = contentData.entries[entryIndex];
  
  // Initialiser le tableau likedBy s'il n'existe pas
  if (!entry.likedBy) {
    entry.likedBy = [];
  }
  
  // Initialiser le compteur de likes s'il n'existe pas
  if (typeof entry.likes !== 'number') {
    entry.likes = 0;
  }
  
  // Mettre à jour les likes
  if (action === 'add') {
    // Vérifier si l'utilisateur a déjà liké cette entrée
    if (!entry.likedBy.includes(sessionId)) {
      entry.likedBy.push(sessionId);
      entry.likes += 1;
      console.log(`Like ajouté pour l'entrée ${entryId} par la session ${sessionId}`);
    } else {
      console.log(`La session ${sessionId} a déjà liké l'entrée ${entryId}`);
      return true; // Pas d'erreur, mais pas de modification
    }
  } else if (action === 'remove') {
    // Vérifier si l'utilisateur a liké cette entrée
    const sessionIndex = entry.likedBy.indexOf(sessionId);
    if (sessionIndex !== -1) {
      entry.likedBy.splice(sessionIndex, 1);
      entry.likes = Math.max(0, entry.likes - 1); // Éviter les likes négatifs
      console.log(`Like retiré pour l'entrée ${entryId} par la session ${sessionId}`);
    } else {
      console.log(`La session ${sessionId} n'a pas liké l'entrée ${entryId}`);
      return true; // Pas d'erreur, mais pas de modification
    }
  }
  
  // Mettre à jour l'entrée dans le tableau
  contentData.entries[entryIndex] = entry;
  
  // Mettre à jour la date de dernière modification
  contentData.lastUpdated = new Date().toISOString();
  
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
      console.log('Mise à jour des likes effectuée avec succès!');
      process.exit(0);
    } else {
      console.error('Échec de la mise à jour des likes');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  });
