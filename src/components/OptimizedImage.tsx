import React, { useState, useEffect } from 'react';
import { isWebPSupported, getOptimizedImageUrl } from '@/utils/imageOptimizer';
import { getImagePath } from '@/utils/imagePaths';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholderSrc?: string;
  widths?: number[];
}

/**
 * Composant d'image optimisé qui combine:
 * - Gestion des chemins selon l'environnement (dev/prod)
 * - Conversion automatique en WebP si supporté
 * - Images responsives avec srcSet
 * - Lazy loading intelligent
 * - États de chargement et gestion des erreurs
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  quality = 80,
  priority = false,
  placeholderSrc = '/placeholder.svg',
  widths = [320, 640, 768, 1024, 1280],
  className = '',
  ...props
}) => {
  // Utiliser l'utilitaire getImagePath pour gérer les chemins d'images
  const baseSrc = src.startsWith('/') ? getImagePath(src) : src;
  const placeholderImage = placeholderSrc.startsWith('/') ? getImagePath(placeholderSrc) : placeholderSrc;
  
  const [imageSrc, setImageSrc] = useState<string>(baseSrc);
  const [srcSet, setSrcSet] = useState<string>('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  
  // Vérifier le support WebP et optimiser l'image
  useEffect(() => {
    const optimizeImage = async () => {
      try {
        // Vérifier le support WebP
        const supportsWebP = await isWebPSupported();
        setWebpSupported(supportsWebP);
        
        // Optimiser l'image principale
        const optimizedSrc = await getOptimizedImageUrl(baseSrc);
        setImageSrc(optimizedSrc);
        
        // Générer le srcSet pour les différentes tailles
        if (!src.startsWith('http') && !src.startsWith('data:')) {
          const srcSetArray = await Promise.all(
            widths.map(async (width) => {
              const optimizedUrl = await getOptimizedImageUrl(baseSrc, width);
              return `${optimizedUrl} ${width}w`;
            })
          );
          setSrcSet(srcSetArray.join(', '));
        }
      } catch (err) {
        console.error('Erreur lors de l\'optimisation de l\'image:', err);
        setImageSrc(baseSrc); // Fallback à l'image originale
      }
    };
    
    optimizeImage();
  }, [baseSrc, widths]);
  
  // Réinitialiser l'état quand la source change
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);
  
  return (
    <img 
      src={error ? placeholderImage : imageSrc}
      srcSet={!error && srcSet ? srcSet : undefined}
      sizes={!error && srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={className}
      style={{
        ...props.style,
        transition: 'opacity 0.3s ease-in-out',
        opacity: loaded ? 1 : 0.6,
      }}
      {...props}
    />
  );
};

export default OptimizedImage;

