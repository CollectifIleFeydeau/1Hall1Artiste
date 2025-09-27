const fs = require('fs');
const path = require('path');

// Dossiers source et destination
const baseDir = path.join(__dirname, '..', 'public', 'images', 'background');
const archiveDir = path.join(baseDir, 'archive');

// Liste des images utilisées (d'après l'analyse du code)
const usedImages = new Set([
  'historical-parchment-background-portrait.jpg',
  'historical-parchment-background.jpg',
  'artistic-brush-stroke-background.jpg',
  'detailed-historical-background.jpg',
  'detailed-historical-background-portrait.jpg',
  'textured-cream-background.jpg',
  'Pinceaux.png',
  'Pinceaux-Touche.png',
  'Pinceaux-Concert.png' // Référencé mais non trouvé - à vérifier
]);

// Fonction pour déplacer un fichier
function moveFile(source, targetDir) {
  const filename = path.basename(source);
  const target = path.join(targetDir, filename);
  
  // Créer le répertoire de destination s'il n'existe pas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  try {
    fs.renameSync(source, target);
    console.log(`✓ Déplacé: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`✗ Erreur lors du déplacement de ${source}:`, error.message);
    return false;
  }
}

// Fonction pour traiter un répertoire
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Le répertoire n'existe pas: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);
  let movedCount = 0;
  let errorCount = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Ignorer les dossiers spéciaux et le dossier archive
    if (item === 'archive' || item === 'webp' || item === 'small') {
      continue;
    }

    if (stat.isFile()) {
      const filename = path.basename(item);
      const normalizedFilename = filename.replace(/_/g, '-').toLowerCase();
      
      // Vérifier si le fichier est utilisé
      if (!Array.from(usedImages).some(used => 
        normalizedFilename.includes(used.toLowerCase())
      )) {
        console.log(`\nTraitement de: ${filename}`);
        console.log(`Raison: Non référencé dans le code`);
        
        // Créer le sous-dossier d'archive correspondant
        const relativeDir = path.relative(baseDir, path.dirname(fullPath));
        const targetArchiveDir = path.join(archiveDir, relativeDir);
        
        if (moveFile(fullPath, targetArchiveDir)) {
          movedCount++;
        } else {
          errorCount++;
        }
      }
    }
  }

  return { movedCount, errorCount };
}

// Exécution
console.log('Début de l\'archivage des images inutilisées...');
const { movedCount, errorCount } = processDirectory(baseDir);

// Créer un fichier README dans le dossier d'archive
const readmePath = path.join(archiveDir, 'README.md');
const readmeContent = `# Images archivées

Ce dossier contient des images qui ne sont plus utilisées dans le code.
Elles ont été déplacées ici le ${new Date().toLocaleDateString()}.

## Raison de l'archivage
- Ces images n'étaient plus référencées dans le code source
- Elles ont été conservées au cas où elles seraient nécessaires ultérieurement

## Comment restaurer
Pour restaurer une image, déplacez-la depuis ce dossier vers son emplacement d'origine dans le dossier 'background'.
`;

if (movedCount > 0 || errorCount > 0) {
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`\nRapport d'archivage :`);
  console.log(`- Images déplacées: ${movedCount}`);
  console.log(`- Erreurs: ${errorCount}`);
  console.log(`\nUn fichier README.md a été créé dans le dossier d'archive.`);
} else {
  console.log('Aucune image à archiver.');
}

console.log('\nTerminé !');
