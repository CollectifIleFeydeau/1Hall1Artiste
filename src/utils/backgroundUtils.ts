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
  'Historical Parchment Background Portrait.jpg': {
    webp: '/images/background/webp/Historical Parchment Background Portrait.webp',
    fallback: '/images/background/small/Historical Parchment Background Portrait.jpg'
  },
  'Historical Parchment Background.jpg': {
    webp: '/images/background/webp/Historical Parchment Background.webp',
    fallback: '/images/background/small/Historical Parchment Background.jpg'
  },
  'Artistic Brush Stroke Background.jpg': {
    webp: '/images/background/webp/Artistic Brush Stroke Background.webp',
    fallback: '/images/background/small/Artistic Brush Stroke Background.jpg'
  },
  'Detailed Historical Background.jpg': {
    webp: '/images/background/webp/Detailed Historical Background.webp',
    fallback: '/images/background/small/Detailed Historical Background.jpg'
  },
  'Textured Cream Background.jpg': {
    webp: '/images/background/webp/Textured Cream Background.webp',
    fallback: '/images/background/small/Textured Cream Background.jpg'
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
  return mapping ? mapping.fallback : `/images/background/small/${filename}`;
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
