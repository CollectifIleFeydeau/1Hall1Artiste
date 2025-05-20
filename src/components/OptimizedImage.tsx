import React, { useState, useEffect } from 'react';
import { getResponsiveImageProps } from '@/utils/imageOptimizer';
import { LoadingIndicator } from './LoadingIndicator';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  width,
  height,
  priority = false,
  objectFit = 'cover'
}) => {
  const [imageProps, setImageProps] = useState<any>({
    src,
    alt,
    className: `${className} ${objectFit ? `object-${objectFit}` : ''}`,
    width,
    height,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async'
  });
  
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Ne pas optimiser si l'image est prioritaire (au-dessus de la ligne de flottaison)
    if (priority) return;
    
    const optimizeImage = async () => {
      try {
        const optimizedProps = await getResponsiveImageProps(src, alt, sizes, className);
        setImageProps({
          ...optimizedProps,
          width,
          height,
          style: { objectFit }
        });
      } catch (err) {
        console.error('Erreur lors de l\'optimisation de l\'image:', err);
        setError(true);
      }
    };
    
    optimizeImage();
  }, [src, alt, className, sizes, width, height, priority, objectFit]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <LoadingIndicator size="small" text="" />
        </div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center bg-gray-100 text-gray-500 rounded" 
             style={{ width: width || '100%', height: height || 200 }}>
          <span className="text-sm">Image non disponible</span>
        </div>
      ) : (
        <img
          {...imageProps}
          onLoad={handleLoad}
          onError={handleError}
          style={{ 
            ...imageProps.style,
            display: isLoading ? 'none' : 'block' 
          }}
        />
      )}
    </div>
  );
};
