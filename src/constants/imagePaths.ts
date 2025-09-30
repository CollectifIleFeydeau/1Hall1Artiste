/**
 * Constantes centralisées pour tous les chemins d'images
 * Utilise le système getImagePath unifié qui fonctionne partout
 */
import { getImagePath } from '../utils/imagePaths';

// Fonction helper avec logs pour debug
const getImagePathWithLogs = (path: string, name: string) => {
  const fullPath = getImagePath(path);
  console.log(`🖼️ [IMAGE_PATHS] ${name}:`, { 
    relativePath: path, 
    fullPath,
    timestamp: new Date().toISOString()
  });
  return fullPath;
};

// Chemins relatifs des images (sans préfixe de base)
export const IMAGE_PATHS = {
  // Images de fond avec logs
  BACKGROUNDS: {
    get PARCHMENT() { 
      return getImagePathWithLogs('/images/background/small/Historical_Parchment_Background_Portrait.jpg', 'PARCHMENT'); 
    },
    get PARCHMENT_LANDSCAPE() { 
      return getImagePathWithLogs('/images/background/small/Historical_Parchment_Background.jpg', 'PARCHMENT_LANDSCAPE'); 
    },
    get DETAILED_HISTORICAL() { 
      return getImagePathWithLogs('/images/background/small/Detailed_Historical_Background.jpg', 'DETAILED_HISTORICAL'); 
    },
    get DETAILED_HISTORICAL_PORTRAIT() { 
      return getImagePathWithLogs('/images/background/small/Detailed_Historical_Background_Portrait.jpg', 'DETAILED_HISTORICAL_PORTRAIT'); 
    },
    get ARTISTIC_BRUSH() { 
      return getImagePathWithLogs('/images/background/small/Artistic_Brush_Stroke_Background.jpg', 'ARTISTIC_BRUSH'); 
    },
    get TEXTURED_CREAM() { 
      return getImagePathWithLogs('/images/background/small/Textured_Cream_Background.jpg', 'TEXTURED_CREAM'); 
    },
  },
  
  // Images de placeholder
  PLACEHOLDERS: {
    get IMAGE() { 
      return getImagePathWithLogs('/images/placeholder-image.jpg', 'PLACEHOLDER_IMAGE'); 
    },
    get SVG() { 
      return getImagePathWithLogs('/placeholder.svg', 'PLACEHOLDER_SVG'); 
    },
  },
  
  // Cartes et plans (seulement celle utilisée)
  MAPS: {
    get FEYDEAU_OLD() { 
      return getImagePathWithLogs('/carte-feydeau - ancienne.png', 'FEYDEAU_OLD'); 
    },
  },
  
  // Images d'événements par défaut
  EVENTS: {
    DEFAULT_EXAMPLE: '/events/expositions/imageExemple.jpg',
  }
};
