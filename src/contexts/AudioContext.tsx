import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/logger";

const logger = createLogger('AudioContext');

interface AudioContextType {
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  audioElement: HTMLAudioElement | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialisation de l'élément audio et vérification des préférences utilisateur
  useEffect(() => {
    const audioPreference = localStorage.getItem('audioEnabled');
    // Mettre à jour l'état uniquement si la préférence est explicitement 'true'
    if (audioPreference === 'true') {
      setIsAudioEnabled(true);
    }
    
    // Créer l'élément audio une seule fois
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    
    // Déterminer le chemin audio en fonction de l'environnement
    const audioPath = window.location.hostname.includes('github.io')
      ? '/1Hall1Artiste/audio/Port-marchand.mp3'
      : '/audio/Port-marchand.mp3';
    
    audio.src = audioPath;
    setAudioElement(audio);
    
    // Nettoyage lors du démontage de l'application
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
    
    if (isAudioEnabled) {
      audioElement.play().catch(error => {
        logger.warn('Impossible de lire l\'audio automatiquement', { error });
        // Ne pas changer l'état ici, car l'utilisateur a explicitement activé le son
      });
    } else {
      audioElement.pause();
    }
  }, [isAudioEnabled, audioElement]);
  
  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    
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
          setIsAudioEnabled(false);
          localStorage.setItem('audioEnabled', 'false');
        });
      }
      
      // Notification d'activation
      toast({
        title: "Son activé",
        description: "Le son d'ambiance est maintenant actif.",
        duration: 3000
      });
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
    }
  };

  return (
    <AudioContext.Provider value={{ isAudioEnabled, toggleAudio, audioElement }}>
      {children}
    </AudioContext.Provider>
  );
};

