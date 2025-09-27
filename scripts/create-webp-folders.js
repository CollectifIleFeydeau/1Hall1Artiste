import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backgroundsDir = path.join(__dirname, '../public/images/background');
const outputDir = path.join(backgroundsDir, 'webp');

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Dossier webp créé:', outputDir);
} else {
  console.log('ℹ️  Dossier webp existe déjà:', outputDir);
}

console.log('📁 Structure créée pour les backgrounds WebP optimisés');
console.log('💡 Vous pouvez maintenant utiliser un outil externe comme:');
console.log('   - https://squoosh.app (en ligne)');
console.log('   - cwebp (ligne de commande)');
console.log('   - Photoshop/GIMP avec export WebP');
console.log('');
console.log('🎯 Fichiers à optimiser:');
console.log('   - Historical Parchment Background Portrait.jpg');
console.log('   - Historical Parchment Background.jpg');
console.log('   - Artistic Brush Stroke Background.jpg');
console.log('   - Detailed Historical Background.jpg');
console.log('   - Textured Cream Background.jpg');
