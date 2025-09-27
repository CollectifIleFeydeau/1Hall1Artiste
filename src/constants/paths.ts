// Détection automatique du chemin de base selon l'environnement
const getBasePath = () => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');
    const hasSubPath = pathname.includes('1Hall1Artiste');
    
    console.log('🔍 [IMAGE_PATHS] Debug info:', {
      hostname,
      pathname,
      isGitHubPages,
      hasSubPath,
      fullUrl: window.location.href
    });
    
    // En production sur GitHub Pages, le chemin contient '1Hall1Artiste'
    const basePath = (isGitHubPages || hasSubPath) ? '/1Hall1Artiste' : '';
    console.log('🔍 [IMAGE_PATHS] Base path determined:', basePath);
    return basePath;
  }
  return '';
};

// Fonction pour obtenir un chemin d'image avec le bon préfixe
const getImagePath = (relativePath: string) => {
  const fullPath = `${getBasePath()}${relativePath}`;
  console.log('🔍 [IMAGE_PATHS] Generated path:', { relativePath, fullPath });
  return fullPath;
};

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
