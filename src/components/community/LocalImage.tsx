import React, { useState, useEffect } from 'react';

interface LocalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Composant qui gère l'affichage des images stockées localement en base64
 * Si l'URL commence par "local:", récupère l'image depuis localStorage
 * Sinon, utilise l'URL directement
 * Gère les erreurs et les images manquantes avec une image de secours
 */
// Fonction utilitaire pour obtenir le chemin de base en fonction de l'environnement
const getBasePath = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return '/1Hall1Artiste'; // Chemin de base sur GitHub Pages
  }
  return ''; // Chemin de base en local
};

export const LocalImage: React.FC<LocalImageProps> = ({ 
  src, 
  alt, 
  className = '',
  fallbackSrc = `${getBasePath()}/images/placeholder-image.jpg` 
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const loadImage = () => {
      setLoading(true);
      setError(false);

      try {
        // Si l'URL commence par "local:", récupérer l'image depuis localStorage
        if (src.startsWith('local:')) {
          const imageId = src.substring(6); // Enlever le préfixe "local:"
          const base64Data = localStorage.getItem(`community_image_${imageId}`);
          
          if (base64Data) {
            setImageSrc(base64Data);
          } else {
            console.error(`Image non trouvée dans localStorage: ${imageId}`);
            // Essayer de récupérer l'image depuis le cache du navigateur si disponible
            if (caches && 'match' in caches && retryCount === 0) {
              caches.open('image-cache').then(cache => {
                cache.match(`community-images/${imageId}`).then(response => {
                  if (response) {
                    response.blob().then(blob => {
                      const objectURL = URL.createObjectURL(blob);
                      setImageSrc(objectURL);
                      setRetryCount(prev => prev + 1);
                    });
                  } else {
                    setError(true);
                  }
                });
              }).catch(() => {
                setError(true);
              });
            } else {
              setError(true);
            }
          }
        } else {
          // Utiliser l'URL directement
          setImageSrc(src);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, retryCount]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (error) {
    // Essayer d'utiliser l'image de secours
      // Utiliser une URL absolue pour l'image de secours
      const absoluteFallbackSrc = fallbackSrc.startsWith('/') 
        ? window.location.origin + fallbackSrc
        : fallbackSrc;
        
      return (
      <img 
        src={absoluteFallbackSrc} 
        alt={alt} 
        className={className} 
        onError={(e) => {
          // Si même l'image de secours échoue, afficher un placeholder
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center');
          const span = document.createElement('span');
          span.className = 'text-sm text-gray-500';
          span.textContent = 'Image non disponible';
          e.currentTarget.parentElement?.appendChild(span);
        }}
      />
    );
  }

  // Utiliser une URL absolue pour l'image de secours
  const absoluteFallbackSrc = fallbackSrc.startsWith('/') 
    ? window.location.origin + fallbackSrc
    : fallbackSrc;
    
  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        // En cas d'erreur de chargement, essayer l'image de secours
        console.log(`Erreur de chargement de l'image, utilisation de l'image de secours`);
        if (e.currentTarget.src !== absoluteFallbackSrc) {
          e.currentTarget.src = absoluteFallbackSrc;
        } else {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center');
          const span = document.createElement('span');
          span.className = 'text-sm text-gray-500';
          span.textContent = 'Image non disponible';
          e.currentTarget.parentElement?.appendChild(span);
        }
      }}
    />  
  );
};
