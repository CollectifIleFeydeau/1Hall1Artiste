import { getImagePath } from '@/utils/imagePaths';
import React from 'react';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { IMAGE_PATHS } from '../constants/imagePaths';

interface EventImageProps {
  event: {
    id: string;
    title: string;
    artist?: string;
    type: 'concert' | 'exposition';
    imageUrl?: string;
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export const EventImage: React.FC<EventImageProps> = ({
  event,
  size = 'medium',
  className = '',
  priority = false,
  aspectRatio = '1/1'
}) => {
  // Utilisation de imageExemple pour toutes les images d'événements
  const generateImagePath = (event: EventImageProps['event']): string => {
    if (event.imageUrl) {
      return event.imageUrl;
    }

    // Utiliser imageExemple.jpg pour tous les événements
    return IMAGE_PATHS.EVENTS.DEFAULT_EXAMPLE;
  };

  // Images de fallback par type
  const getFallbackImage = (type: 'concert' | 'exposition'): string => {
    return `/events/defaults/${type}-default.jpg`;
  };

  // Génération de l'alt text
  const generateAltText = (event: EventImageProps['event']): string => {
    if (event.type === 'concert') {
      return `Photo du concert de ${event.artist || event.title}`;
    } else {
      return `Œuvre de l'exposition de ${event.artist || event.title}`;
    }
  };

  // Classes CSS selon la taille
  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'small':
        return 'w-16 h-16';
      case 'medium':
        return 'w-24 h-24 md:w-32 md:h-32';
      case 'large':
        return 'w-full h-48 md:h-64';
      default:
        return 'w-24 h-24 md:w-32 md:h-32';
    }
  };

  // Placeholder personnalisé selon le type
  const getPlaceholder = (type: 'concert' | 'exposition') => (
    <div className="image-fallback">
      <div className="text-center">
        <div className="text-3xl mb-2">
          {type === 'concert' ? '🎵' : '🎨'}
        </div>
        <div className="text-sm font-medium">
          {type === 'concert' ? 'Concert' : 'Exposition'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {event.artist || event.title}
        </div>
      </div>
    </div>
  );

  const imageSrc = generateImagePath(event);
  const fallbackSrc = getFallbackImage(event.type);
  const altText = generateAltText(event);
  const sizeClasses = getSizeClasses(size);

  return (
    <ImageWithFallback
      src={imageSrc}
      fallbackSrc={fallbackSrc}
      alt={altText}
      className={`${sizeClasses} ${className}`}
      priority={priority}
      aspectRatio={aspectRatio}
      placeholder={getPlaceholder(event.type)}
    />
  );
};

export default EventImage;


