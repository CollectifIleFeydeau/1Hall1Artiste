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
    // Ajoutez d'autres chemins d'images ici
  }
};
