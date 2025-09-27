import sharp from 'sharp';
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
}

const backgrounds = [
  'Historical Parchment Background Portrait.jpg',
  'Historical Parchment Background.jpg',
  'Artistic Brush Stroke Background.jpg',
  'Detailed Historical Background.jpg',
  'Textured Cream Background.jpg'
];

async function optimizeBackgrounds() {
  console.log('🎨 Optimisation des backgrounds...');
  
  for (const filename of backgrounds) {
    const inputPath = path.join(backgroundsDir, filename);
    const outputPath = path.join(outputDir, filename.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .webp({ 
            quality: 80,
            effort: 6 
          })
          .toFile(outputPath);
        
        const originalSize = fs.statSync(inputPath).size;
        const optimizedSize = fs.statSync(outputPath).size;
        const reduction = Math.round((1 - optimizedSize / originalSize) * 100);
        
        console.log(`✅ ${filename} → ${path.basename(outputPath)}`);
        console.log(`   Taille: ${Math.round(originalSize/1024)}KB → ${Math.round(optimizedSize/1024)}KB (-${reduction}%)`);
      } catch (error) {
        console.error(`❌ Erreur avec ${filename}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Fichier non trouvé: ${filename}`);
    }
  }
  
  console.log('🎉 Optimisation terminée !');
}

optimizeBackgrounds().catch(console.error);
