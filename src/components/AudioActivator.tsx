import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import { createLogger } from "@/utils/logger";

const logger = createLogger('AudioActivator');

interface AudioActivatorProps {
  onAudioEnabled?: () => void;
  onAudioDisabled?: () => void;
}

/**
 * Composant pour activer ou désactiver le son d'ambiance
 */
const AudioActivator: React.FC<AudioActivatorProps> = ({
  onAudioEnabled,
  onAudioDisabled
}) => {
  // Par défaut, le bouton est sur "Activer son"
  const [isActive, setIsActive] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Vérifier l'état initial du son au chargement
  useEffect(() => {
    const audioPreference = localStorage.getItem('audioEnabled');
    // Mettre à jour l'état uniquement si la préférence est explicitement 'true'
    if (audioPreference === 'true') {
      setIsActive(true);
    } else {
      // S'assurer que l'état est à false si pas de préférence ou autre valeur
      setIsActive(false);
    }
    
    // Créer l'élément audio
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    
    // Déterminer le chemin audio en fonction de l'environnement
    const audioPath = window.location.hostname.includes('github.io')
      ? '/1Hall1Artiste/audio/Port-marchand.mp3'
      : '/audio/Port-marchand.mp3';
    
    audio.src = audioPath;
    setAudioElement(audio);
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);
  
  // Effet pour gérer la lecture audio en fonction de l'état
  useEffect(() => {
    if (!audioElement) return;
    
    if (isActive) {
      audioElement.play().catch(error => {
        logger.warn('Impossible de lire l\'audio automatiquement', { error });
        // Ne pas changer l'état ici, car l'utilisateur a explicitement activé le son
      });
    } else {
      audioElement.pause();
    }
  }, [isActive, audioElement]);
  
  const toggleAudio = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    // Sauvegarder la préférence
    localStorage.setItem('audioEnabled', newState.toString());
    
    if (newState) {
      // Activer le son
      if (audioElement) {
        audioElement.play().catch(error => {
          logger.warn('Impossible de lire l\'audio', { error });
          toast({
            title: "Activation du son impossible",
            description: "Votre navigateur a bloqué la lecture audio. Réessayez.",
            variant: "destructive"
          });
          setIsActive(false);
          localStorage.setItem('audioEnabled', 'false');
        });
      }
      
      // Notification d'activation
      toast({
        title: "Son activé",
        description: "Le son d'ambiance est maintenant actif.",
        duration: 3000
      });
      
      // Callback
      if (onAudioEnabled) {
        onAudioEnabled();
      }
    } else {
      // Désactiver le son
      if (audioElement) {
        audioElement.pause();
      }
      
      // Notification de désactivation
      toast({
        title: "Son désactivé",
        description: "Le son d'ambiance est maintenant coupé.",
        duration: 3000
      });
      
      // Callback
      if (onAudioDisabled) {
        onAudioDisabled();
      }
    }
  };

  return (
    <Button
      variant={isActive ? "destructive" : "default"}
      size="sm"
      className="flex items-center gap-1 font-medium"
      onClick={toggleAudio}
    >
      {isActive ? (
        <>
          <Volume2 className="h-4 w-4" />
          Désactiver son
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4" />
          Activer son
        </>
      )}
    </Button>
  );
};

export default AudioActivator;
