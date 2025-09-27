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
    IMAGE: '/images/placeholder-image.jpg',
    SVG: '/placeholder.svg',
  },
  
  // Cartes et plans
  MAPS: {
    FEYDEAU_OLD: '/carte-feydeau - ancienne.png',
    FEYDEAU: '/carte-feydeau.png',
    PLAN_ILE: '/Plan Île Feydeau.png',
  },
  
  // Images d'événements par défaut
  EVENTS: {
    DEFAULT_EXAMPLE: '/events/expositions/imageExemple.jpg',
  }
};
