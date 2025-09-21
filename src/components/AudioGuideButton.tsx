import React from 'react';
import { Button } from '@/components/ui/button';
import { useAudioGuide } from '@/services/audioGuideService';
import { createLogger } from '@/utils/logger';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Pause from 'lucide-react/dist/esm/icons/pause';
import Play from 'lucide-react/dist/esm/icons/play';

const logger = createLogger('AudioGuideButton');

interface AudioGuideButtonProps {
  audioUrl?: string;
  locationName?: string;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
  disabled?: boolean;
}

export const AudioGuideButton: React.FC<AudioGuideButtonProps> = ({
  audioUrl,
  locationName = 'ce lieu',
  variant = 'default',
  className = '',
  disabled = false
}) => {
  const { 
    isPlaying, 
    currentTrack, 
    isLoading, 
    error, 
    play, 
    pause, 
    stop 
  } = useAudioGuide();

  // Vérifier si ce bouton contrôle le track actuellement en cours
  const isCurrentTrack = currentTrack === audioUrl;
  const isThisTrackPlaying = isCurrentTrack && isPlaying;

  const handleClick = async () => {
    if (!audioUrl) {
      logger.warn('Aucune URL audio fournie');
      return;
    }

    try {
      if (isThisTrackPlaying) {
        // Si ce track est en cours de lecture, le mettre en pause
        pause();
        logger.info('Audio guide mis en pause', { audioUrl, locationName });
      } else if (isCurrentTrack && !isPlaying) {
        // Si c'est le même track mais en pause, reprendre
        await play(audioUrl, locationName);
        logger.info('Audio guide repris', { audioUrl, locationName });
      } else {
        // Sinon, démarrer ce nouveau track
        await play(audioUrl, locationName);
        logger.info('Audio guide démarré', { audioUrl, locationName });
      }
    } catch (error) {
      logger.error('Erreur lors du contrôle de l\'audio guide', { error, audioUrl });
    }
  };

  // Ne pas afficher le bouton si pas d'URL audio
  if (!audioUrl) {
    return null;
  }

  // Déterminer l'icône à afficher
  const getIcon = () => {
    if (isLoading && isCurrentTrack) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isThisTrackPlaying) {
      return <Pause className="h-4 w-4" />;
    }
    
    if (error && isCurrentTrack) {
      return <VolumeX className="h-4 w-4" />;
    }
    
    return <Volume2 className="h-4 w-4" />;
  };

  // Déterminer le texte du bouton
  const getButtonText = () => {
    if (isLoading && isCurrentTrack) {
      return 'Chargement...';
    }
    
    if (isThisTrackPlaying) {
      return 'Pause audio';
    }
    
    if (error && isCurrentTrack) {
      return 'Erreur audio';
    }
    
    return 'Écouter l\'histoire';
  };

  // Déterminer le titre (tooltip)
  const getTitle = () => {
    if (isThisTrackPlaying) {
      return `Mettre en pause l'audio guide de ${locationName}`;
    }
    
    if (isCurrentTrack && !isPlaying) {
      return `Reprendre l'audio guide de ${locationName}`;
    }
    
    return `Écouter l'histoire de ${locationName}`;
  };

  // Styles selon la variante
  const getButtonProps = () => {
    switch (variant) {
      case 'icon':
        return {
          variant: 'ghost' as const,
          size: 'sm' as const,
          className: `p-2 h-auto ${isThisTrackPlaying ? 'text-[#ff7a45] bg-[#ff7a45]/10' : 'text-[#4a5d94]'} ${className}`,
          children: getIcon()
        };
      
      case 'compact':
        return {
          variant: 'outline' as const,
          size: 'sm' as const,
          className: `text-xs ${isThisTrackPlaying ? 'border-[#ff7a45] text-[#ff7a45] bg-[#ff7a45]/5' : 'border-[#4a5d94] text-[#4a5d94]'} ${className}`,
          children: (
            <>
              {getIcon()}
              <span className="ml-1 hidden sm:inline">{getButtonText()}</span>
            </>
          )
        };
      
      default:
        return {
          variant: 'outline' as const,
          size: 'sm' as const,
          className: `text-xs ${isThisTrackPlaying ? 'border-[#ff7a45] text-[#ff7a45] bg-[#ff7a45]/5' : 'border-[#4a5d94] text-[#4a5d94]'} ${className}`,
          children: (
            <>
              {getIcon()}
              <span className="ml-2">{getButtonText()}</span>
            </>
          )
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={disabled || (isLoading && isCurrentTrack)}
      title={getTitle()}
    />
  );
};
