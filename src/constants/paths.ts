import { getImagePath } from '../utils/imagePaths';

export const IMAGE_PATHS = {
  BACKGROUNDS: {
    get PARCHMENT() { return getImagePath('/images/background/small/Historical_Parchment_Background_Portrait.jpg'); },
    get PARCHMENT_LANDSCAPE() { return getImagePath('/images/background/small/Historical_Parchment_Background.jpg'); },
    get DETAILED_HISTORICAL() { return getImagePath('/images/background/small/Detailed_Historical_Background.jpg'); },
    get DETAILED_HISTORICAL_PORTRAIT() { return getImagePath('/images/background/small/Detailed_Historical_Background_Portrait.jpg'); },
    get ARTISTIC_BRUSH() { return getImagePath('/images/background/small/Artistic_Brush_Stroke_Background.jpg'); },
    get TEXTURED_CREAM() { return getImagePath('/images/background/small/Textured_Cream_Background.jpg'); },
  },
  PLACEHOLDERS: {
    get IMAGE() { return getImagePath('/images/placeholder-image.jpg'); },
    get SVG() { return getImagePath('/placeholder.svg'); },
  },
  MAPS: {
    get FEYDEAU_OLD() { return getImagePath('/carte-feydeau - ancienne.png'); },
    get FEYDEAU() { return getImagePath('/carte-feydeau.png'); },
    get PLAN_ILE() { return getImagePath('/Plan Île Feydeau.png'); },
  },
  EVENTS: {
    get DEFAULT_EXAMPLE() { return getImagePath('/events/expositions/imageExemple.jpg'); },
  }
};
