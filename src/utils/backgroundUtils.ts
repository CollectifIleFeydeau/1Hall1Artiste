/**
 * Utilitaires pour la gestion des backgrounds optimisés
 */
import { useState, useEffect } from 'react';

// Détection du support WebP
let webpSupported: boolean | null = null;

export const supportsWebP = (): Promise<boolean> => {
  if (webpSupported !== null) {
    return Promise.resolve(webpSupported);
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Mapping des backgrounds disponibles
const backgroundMap = {
  'historical-parchment-background-portrait.jpg': {
    webp: '/images/background/webp/historical-parchment-background-portrait.webp',
    fallback: '/images/background/small/historical-parchment-background-portrait.jpg'
  },
  'historical-parchment-background.jpg': {
    webp: '/images/background/webp/historical-parchment-background.webp',
    fallback: '/images/background/small/historical-parchment-background.jpg'
  },
  'artistic-brush-stroke-background.jpg': {
    webp: '/images/background/webp/artistic-brush-stroke-background.webp',
    fallback: '/images/background/small/artistic-brush-stroke-background.jpg'
  },
  'detailed-historical-background.jpg': {
    webp: '/images/background/webp/detailed-historical-background.webp',
    fallback: '/images/background/small/detailed-historical-background.jpg'
  },
  'detailed-historical-background-portrait.jpg': {
    webp: '/images/background/webp/detailed-historical-background-portrait.webp',
    fallback: '/images/background/small/detailed-historical-background-portrait.jpg'
  },
  'textured-cream-background.jpg': {
    webp: '/images/background/webp/textured-cream-background.webp',
    fallback: '/images/background/small/textured-cream-background.jpg'
  }
};

/**
 * Retourne l'URL optimisée d'un background (WebP si supporté, sinon fallback)
 */
export const getOptimizedBackground = async (filename: string): Promise<string> => {
  const mapping = backgroundMap[filename as keyof typeof backgroundMap];
  
  if (!mapping) {
    console.warn(`Background non trouvé dans le mapping: ${filename}`);
    return `/images/background/small/${filename}`;
  }

  const isWebPSupported = await supportsWebP();
  return isWebPSupported ? mapping.webp : mapping.fallback;
};

/**
 * Version synchrone qui retourne le fallback par défaut
 * Utile pour les styles inline où on ne peut pas attendre
 */
export const getBackgroundFallback = (filename: string): string => {
  const mapping = backgroundMap[filename as keyof typeof backgroundMap];
  if (mapping) {
    return mapping.fallback;
  }
  // Encoder les espaces dans le nom de fichier pour l'URL
  const encodedFilename = encodeURIComponent(filename);
  return `/images/background/small/${encodedFilename}`;
};

/**
 * Hook React pour utiliser un background optimisé
 */
export const useOptimizedBackground = (filename: string) => {
  const [backgroundUrl, setBackgroundUrl] = useState(getBackgroundFallback(filename));

  useEffect(() => {
    getOptimizedBackground(filename).then(setBackgroundUrl);
  }, [filename]);

  return backgroundUrl;
};
