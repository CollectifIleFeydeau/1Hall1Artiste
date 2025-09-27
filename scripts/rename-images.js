import { readdirSync, renameSync, existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour normaliser les noms de fichiers
function normalizeFilename(filename) {
  // Remplacer les espaces par des tirets et mettre en minuscules
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-\.]/g, ''); // Supprimer les caractères spéciaux sauf tirets et points
}

// Dossiers à traiter
const directories = [
  'public/images/background',
  'public/images/background/small',
  'public/images/background/webp'
];

// Objet pour stocker les correspondances entre anciens et nouveaux noms
const renamedFiles = {};

// Parcourir les dossiers et renommer les fichiers
directories.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const oldPath = path.join(dir, file);
    
    // Ne traiter que les fichiers (pas les dossiers)
    if (statSync(oldPath).isFile()) {
      const ext = extname(file);
      const baseName = basename(file, ext);
      const newName = normalizeFilename(baseName) + ext;
      const newPath = path.join(dir, newName);
      
      // Si le nom a changé
      if (file !== newName) {
        // Stocker l'ancien et le nouveau nom (chemin relatif)
        const relativePath = relative('public', dir);
        const oldFullPath = join(relativePath, file).replace(/\\/g, '/');
        const newFullPath = join(relativePath, newName).replace(/\\/g, '/');
        
        renamedFiles[oldFullPath] = newFullPath;
        
        // Renommer le fichier
        console.log(`Renaming: ${oldPath} -> ${newPath}`);
        renameSync(oldPath, newPath);
      }
    }
  };
})

// Mettre à jour les références dans les fichiers
const filesToUpdate = [
  'src/utils/backgroundUtils.ts',
  'src/components/EventCardModern.tsx',
  'src/components/EventCardSimple.tsx',
  'src/components/EventDetailsModern.tsx',
  'src/components/LocationDetailsModern.tsx'
];

filesToUpdate.forEach(filePath => {
  if (existsSync(filePath)) {
    let content = readFileSync(filePath, 'utf8');
    let updated = false;
    
    Object.entries(renamedFiles).forEach(([oldPath, newPath]) => {
      // Créer des versions avec et sans le préfixe /public
      const oldPathWithPublic = `/${oldPath}`;
      const newPathWithPublic = `/${newPath}`;
      
      if (content.includes(oldPath) || content.includes(oldPathWithPublic)) {
        content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        content = content.replace(new RegExp(oldPathWithPublic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPathWithPublic);
        updated = true;
      }
    });
    
    if (updated) {
      console.log(`Updating references in ${filePath}`);
      writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('\nRenaming complete!');
console.log('A summary of changes has been saved to renamed-files.json');

// Sauvegarder un résumé des changements
writeFileSync('renamed-files.json', JSON.stringify(renamedFiles, null, 2));
