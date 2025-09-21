import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioGuide } from '@/services/audioGuideService';
import { createLogger } from '@/utils/logger';
import { cn } from '@/lib/utils';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import Pause from 'lucide-react/dist/esm/icons/pause';
import Play from 'lucide-react/dist/esm/icons/play';

const logger = createLogger('AudioGuideButton');

interface AudioGuideButtonProps {
  audioUrl?: string;
  locationName?: string;
  variant?: 'icon' | 'compact' | 'full';
  className?: string;
}

// Composant pour le feedback visuel (similaire au LikeButton)
const FeedbackIcon: React.FC<{ isLoading: boolean; error: string | null; isPlaying: boolean }> = ({ 
  isLoading, 
  error, 
  isPlaying
}) => {
  if (isLoading) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
      />
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
      >
        <span className="text-white text-xs">!</span>
      </motion.div>
    );
  }

  return null;
};

export const AudioGuideButton: React.FC<AudioGuideButtonProps> = ({
  audioUrl,
  locationName = 'ce lieu',
  variant = 'icon',
  className
}) => {
  const { 
    isPlaying, 
    currentTrack, 
    isLoading, 
    error, 
    play, 
    pause, 
    resume 
  } = useAudioGuide();
  
  const [showSuccess, setShowSuccess] = useState(false);

  // Vérifier si ce bouton contrôle le track actuellement en cours
  const isCurrentTrack = currentTrack === audioUrl;
  const isThisTrackPlaying = isCurrentTrack && isPlaying;
  const isToggling = isLoading && isCurrentTrack;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!audioUrl || isToggling) {
      return;
    }

    try {
      if (isThisTrackPlaying) {
        pause();
        logger.info('Audio guide mis en pause', { audioUrl, locationName });
      } else if (isCurrentTrack && !isPlaying) {
        resume();
        logger.info('Audio guide repris', { audioUrl, locationName });
      } else {
        await play(audioUrl, locationName);
        logger.info('Audio guide démarré', { audioUrl, locationName });
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } catch (error) {
      logger.error('Erreur lors du contrôle de l\'audio guide', { error, audioUrl });
    }
  };

  if (!audioUrl) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-500",
          "bg-white hover:shadow-sm transition-all duration-200",
          "disabled:opacity-50 cursor-pointer relative",
          isToggling && "animate-pulse",
          showSuccess && "border-orange-400 text-orange-500",
          error && "border-red-400 text-red-500",
          isThisTrackPlaying && "border-orange-400 text-orange-500",
          className
        )}
        whileTap={!isToggling ? { scale: 0.95 } : {}}
        whileHover={!isToggling ? { scale: 1.05 } : {}}
        animate={showSuccess ? { scale: [1, 1.1, 1] } : {}}
      >
        <AnimatePresence mode="wait">
          {isToggling ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              key="audio-icon"
              initial={{ scale: 0 }}
              animate={isThisTrackPlaying ? { 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              } : { scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {error && isCurrentTrack ? (
                <VolumeX
                  size={18}
                  className="text-red-500"
                />
              ) : isThisTrackPlaying ? (
                <Pause
                  size={18}
                  className={cn(
                    "transition-all duration-300",
                    "text-orange-500 drop-shadow-sm"
                  )}
                />
              ) : (
                <Volume2
                  size={18}
                  className="text-gray-500"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particules d'animation au clic */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-orange-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === 'compact') {
    // Version compacte pour la grille (style identique au LikeButton)
    return (
      <motion.button
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          "absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full",
          "bg-black/60 backdrop-blur-sm text-white text-xs z-10",
          "hover:bg-black/80 transition-colors",
          "disabled:opacity-50 cursor-pointer",
          isToggling && "animate-pulse",
          showSuccess && "bg-orange-500/80",
          error && "bg-red-500/80",
          className
        )}
        whileTap={!isToggling ? { scale: 0.95 } : {}}
        whileHover={!isToggling ? { scale: 1.05 } : {}}
        animate={showSuccess ? { scale: [1, 1.1, 1] } : {}}
      >
        <AnimatePresence mode="wait">
          {isToggling ? (
            <FeedbackIcon key="loading" isLoading={true} error={null} isPlaying={isThisTrackPlaying} />
          ) : (
            <motion.div
              key="audio-icon"
              animate={isThisTrackPlaying ? { 
                scale: [1, 1.3, 1],
                rotate: [0, -10, 10, 0]
              } : { scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {error && isCurrentTrack ? (
                <VolumeX 
                  size={12} 
                  className="text-red-400" 
                />
              ) : isThisTrackPlaying ? (
                <Pause 
                  size={12} 
                  className="text-orange-400 drop-shadow-sm" 
                />
              ) : (
                <Volume2 
                  size={12} 
                  className="text-white" 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Particules d'animation au clic */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-orange-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Version complète pour les modals/détails (style identique au LikeButton)
  return (
    <motion.button
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden",
        "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
        "transition-all duration-300 disabled:opacity-50",
        isToggling && "animate-pulse",
        showSuccess && "bg-orange-100 dark:bg-orange-900/30",
        error && "bg-red-100 dark:bg-red-900/30",
        className
      )}
      whileTap={!isToggling ? { scale: 0.98 } : {}}
      whileHover={!isToggling ? { scale: 1.02 } : {}}
      animate={showSuccess ? { scale: [1, 1.02, 1] } : {}}
    >
      <AnimatePresence mode="wait">
        {isToggling ? (
          <motion.div
            key="loading"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            key="audio-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <motion.div
              animate={isThisTrackPlaying ? { 
                scale: [1, 1.4, 1],
                rotate: [0, -15, 15, 0]
              } : { scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {error && isCurrentTrack ? (
                <VolumeX 
                  size={20} 
                  className="text-red-500" 
                />
              ) : isThisTrackPlaying ? (
                <Pause 
                  size={20} 
                  className="text-orange-500 drop-shadow-lg" 
                />
              ) : (
                <Volume2 
                  size={20} 
                  className="text-slate-600 dark:text-slate-400" 
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col items-start">
        <motion.span 
          className="text-sm font-medium"
          animate={showSuccess ? { color: "#f97316" } : {}}
        >
          {isToggling ? "Chargement..." : isThisTrackPlaying ? "En lecture..." : "Écouter l'histoire"}
        </motion.span>
        <div className="text-xs text-slate-500">
          Audio guide de {locationName}
        </div>
      </div>

      {/* Effet de vague au succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-orange-400/20 rounded-lg"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};
