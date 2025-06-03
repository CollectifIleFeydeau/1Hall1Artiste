// Script pour corriger les chemins d'images dans le build pour GitHub Pages
const fs = require('fs');
const path = require('path');

// Chemin vers le répertoire de build
const distDir = path.join(__dirname, 'dist');

// Fonction pour parcourir récursivement un répertoire
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

// Fonction pour corriger les chemins d'images dans les fichiers HTML et CSS
function fixImagePaths(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Ne traiter que les fichiers HTML, CSS et JS
  if (!['.html', '.css', '.js'].includes(ext)) {
    return;
  }
  
  console.log(`Traitement du fichier: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer les chemins d'images absolus par des chemins relatifs à GitHub Pages
  content = content.replace(
    /(['"])\/([^'"]*\.(png|jpg|jpeg|gif|svg|webp))(['"])/g, 
    '$1/Collectif-Feydeau---app/$2$4'
  );
  
  // Écrire le contenu modifié
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Correction des chemins d\'images pour GitHub Pages...');

// Parcourir tous les fichiers du répertoire de build
walkDir(distDir, fixImagePaths);

console.log('Correction des chemins d\'images terminée.');
