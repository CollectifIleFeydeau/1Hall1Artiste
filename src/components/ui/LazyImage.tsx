import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  priority?: boolean; // Pour les images above-the-fold
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholderSrc,
  blurDataURL,
  onLoad,
  onError,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Si priority=true, charger immédiatement
  const [hasError, setHasError] = useState(!src); // Si pas de src, marquer comme erreur immédiatement
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Si pas de src, ne pas essayer de charger
  if (!src || src === 'undefined') {
    console.warn(`[LazyImage] URL d'image invalide: ${src}`);
  }

  // Intersection Observer pour détecter quand l'image entre dans le viewport
  useEffect(() => {
    if (priority) {
      return; // Skip observer si priority=true
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      console.log(`[LazyImage] Observing element: ${src}`);
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`[LazyImage] Image error: ${src}`, error);
    setHasError(true);
    onError?.(error.nativeEvent);
  };

  // Placeholder blur par défaut (base64 1x1 pixel gris)
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';


  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Placeholder blur */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-slate-200 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)' // Évite les bords blancs du blur
          }}
        />
      )}

      {/* Image principale */}
      {isInView && src && src !== 'undefined' && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"} // Native lazy loading en backup
        />
      )}

      {/* Indicateur de chargement */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}

      {/* Erreur de chargement */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center text-slate-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image indisponible</div>
          </div>
        </div>
      )}
    </div>
  );
};

