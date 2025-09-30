/**
 * Constantes centralisées pour tous les chemins d'images
 * Utilise le système getImagePath unifié qui fonctionne partout
 */
import { getImagePath } from '../utils/imagePaths';

// Chemins calculés une seule fois au chargement du module pour éviter les re-renders
const PARCHMENT_PATH = getImagePath('/images/background/small/Historical_Parchment_Background_Portrait.jpg');
const PARCHMENT_LANDSCAPE_PATH = getImagePath('/images/background/small/Historical_Parchment_Background.jpg');
const DETAILED_HISTORICAL_PATH = getImagePath('/images/background/small/Detailed_Historical_Background.jpg');
const DETAILED_HISTORICAL_PORTRAIT_PATH = getImagePath('/images/background/small/Detailed_Historical_Background_Portrait.jpg');
const ARTISTIC_BRUSH_PATH = getImagePath('/images/background/small/Artistic_Brush_Stroke_Background.jpg');
const TEXTURED_CREAM_PATH = getImagePath('/images/background/small/Textured_Cream_Background.jpg');
const PLACEHOLDER_IMAGE_PATH = getImagePath('/images/placeholder-image.jpg');
const PLACEHOLDER_SVG_PATH = getImagePath('/placeholder.svg');
const FEYDEAU_OLD_PATH = getImagePath('/carte-feydeau - ancienne.png');
const DEFAULT_EXAMPLE_PATH = getImagePath('/events/expositions/imageExemple.jpg');

// Chemins relatifs des images (sans préfixe de base)
export const IMAGE_PATHS = {
  // Images de fond - valeurs constantes calculées une fois
  BACKGROUNDS: {
    PARCHMENT: PARCHMENT_PATH,
    PARCHMENT_LANDSCAPE: PARCHMENT_LANDSCAPE_PATH,
    DETAILED_HISTORICAL: DETAILED_HISTORICAL_PATH,
    DETAILED_HISTORICAL_PORTRAIT: DETAILED_HISTORICAL_PORTRAIT_PATH,
    ARTISTIC_BRUSH: ARTISTIC_BRUSH_PATH,
    TEXTURED_CREAM: TEXTURED_CREAM_PATH,
  },
  
  // Images de placeholder
  PLACEHOLDERS: {
    IMAGE: PLACEHOLDER_IMAGE_PATH,
    SVG: PLACEHOLDER_SVG_PATH,
  },
  
  // Cartes et plans (seulement celle utilisée)
  MAPS: {
    FEYDEAU_OLD: FEYDEAU_OLD_PATH,
  },
  
  // Images d'événements par défaut
  EVENTS: {
    DEFAULT_EXAMPLE: DEFAULT_EXAMPLE_PATH,
  }
};
