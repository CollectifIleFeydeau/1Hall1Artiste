import React from 'react';
import OptimizedImage from './OptimizedImage';

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
 * - Optimisation automatique des images (WebP, responsive)
 */
export const AppImage: React.FC<AppImageProps> = ({ 
  src, 
  alt, 
  lazyLoad = true, 
  placeholderSrc = '/placeholder.svg',
  ...props 
}) => {
  // Utiliser le composant OptimizedImage pour bénéficier de toutes les optimisations
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={!lazyLoad}
      placeholderSrc={placeholderSrc}
      {...props}
    />
  );
};
