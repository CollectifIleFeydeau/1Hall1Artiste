import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
  aspectRatio?: string; // ex: "1/1", "4/3", "16/9"
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  priority = false,
  onLoad,
  onError,
  placeholder,
  aspectRatio
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px' // Commence à charger 50px avant d'être visible
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Gestion du chargement de l'image
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();

    // Essayer le fallback si disponible
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }
  };

  // Styles pour l'aspect ratio
  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio }
    : {};

  // Placeholder par défaut
  const defaultPlaceholder = (
    <div className="image-fallback">
      {hasError ? (
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image non disponible</div>
        </div>
      ) : (
        <div className="image-loading">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm">Chargement...</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`image-container ${className}`}
      style={containerStyle}
      ref={imgRef}
    >
      {isInView ? (
        <>
          <img
            src={currentSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
            loading={priority ? 'eager' : 'lazy'}
          />
          
          {(isLoading || hasError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {placeholder || defaultPlaceholder}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          {placeholder || (
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-sm">Image</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;

