import React, { useState, useEffect } from 'react';

// Préfixe pour les chemins d'images en production (GitHub Pages)
const BASE_PATH = import.meta.env.PROD ? '/Collectif-Feydeau---app' : '';

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazyLoad?: boolean;
  placeholderSrc?: string;
}

/**
 * Composant d'image amélioré qui gère:
 * - Les chemins d'accès en fonction de l'environnement (développement ou production)
 * - Le lazy loading des images pour améliorer les performances
 * - Un placeholder pendant le chargement
 * - La gestion des erreurs de chargement
 */
export const AppImage: React.FC<AppImageProps> = ({ 
  src, 
  alt, 
  lazyLoad = true, 
  placeholderSrc = '/placeholder.svg',
  ...props 
}) => {
  // Ajouter le préfixe uniquement si le chemin commence par "/"
  const imageSrc = src.startsWith('/') ? `${BASE_PATH}${src}` : src;
  const placeholderImage = placeholderSrc.startsWith('/') ? `${BASE_PATH}${placeholderSrc}` : placeholderSrc;
  
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Réinitialiser l'état quand la source change
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);
  
  return (
    <img 
      src={error ? placeholderImage : imageSrc} 
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      style={{
        ...props.style,
        transition: 'opacity 0.3s ease-in-out',
        opacity: loaded ? 1 : 0.6,
      }}
      {...props} 
    />
  );
};
