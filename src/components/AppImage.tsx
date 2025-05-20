import React from 'react';

// Préfixe pour les chemins d'images en production (GitHub Pages)
const BASE_PATH = import.meta.env.PROD ? '/Collectif-Feydeau---app' : '';

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Composant d'image qui gère automatiquement les chemins d'accès
 * en fonction de l'environnement (développement ou production)
 */
export const AppImage: React.FC<AppImageProps> = ({ src, alt, ...props }) => {
  // Ajouter le préfixe uniquement si le chemin commence par "/"
  const imageSrc = src.startsWith('/') ? `${BASE_PATH}${src}` : src;
  
  return <img src={imageSrc} alt={alt} {...props} />;
};
