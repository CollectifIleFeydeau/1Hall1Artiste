// Détection automatique du chemin de base selon l'environnement
const getBasePath = () => {
  if (typeof window !== 'undefined') {
    // En production sur GitHub Pages, le chemin contient '1Hall1Artiste'
    return window.location.pathname.includes('1Hall1Artiste') ? '/1Hall1Artiste' : '';
  }
  return '';
};

export const IMAGE_PATHS = {
  BACKGROUNDS: {
    PARCHMENT: `${getBasePath()}/images/background/small/Historical_Parchment_Background_Portrait.jpg`,
    PARCHMENT_LANDSCAPE: `${getBasePath()}/images/background/small/Historical_Parchment_Background.jpg`,
    DETAILED_HISTORICAL: `${getBasePath()}/images/background/small/Detailed_Historical_Background.jpg`,
    DETAILED_HISTORICAL_PORTRAIT: `${getBasePath()}/images/background/small/Detailed_Historical_Background_Portrait.jpg`,
    ARTISTIC_BRUSH: `${getBasePath()}/images/background/small/Artistic_Brush_Stroke_Background.jpg`,
    TEXTURED_CREAM: `${getBasePath()}/images/background/small/Textured_Cream_Background.jpg`,
  },
  PLACEHOLDERS: {
    IMAGE: `${getBasePath()}/images/placeholder-image.jpg`,
    SVG: `${getBasePath()}/placeholder.svg`,
  },
  MAPS: {
    FEYDEAU_OLD: `${getBasePath()}/carte-feydeau - ancienne.png`,
    FEYDEAU: `${getBasePath()}/carte-feydeau.png`,
    PLAN_ILE: `${getBasePath()}/Plan Île Feydeau.png`,
  },
  EVENTS: {
    DEFAULT_EXAMPLE: `${getBasePath()}/events/expositions/imageExemple.jpg`,
  }
};
