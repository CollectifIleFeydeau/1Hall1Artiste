import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";

// Audio global partagé entre les instances du composant
let globalAudioElement: HTMLAudioElement | null = null;
let isGlobalAudioInitialized = false;

interface AudioActivatorProps {
  onAudioEnabled?: () => void;
  onAudioDisabled?: () => void;
}

/**
 * Composant pour activer ou désactiver le son d'ambiance
 * Utilise une variable globale pour maintenir l'état audio entre les pages
 */
const AudioActivator: React.FC<AudioActivatorProps> = ({
  onAudioEnabled,
  onAudioDisabled
}) => {
  // État local qui reflète l'état global
  const [isActive, setIsActive] = useState<boolean>(() => {
    const audioPreference = localStorage.getItem('audioEnabled');
    return audioPreference === 'true';
  });
  
  // Initialisation de l'audio global une seule fois
  useEffect(() => {
    if (!isGlobalAudioInitialized) {
      // Créer l'élément audio s'il n'existe pas déjà
      if (!globalAudioElement) {
        globalAudioElement = new Audio();
        globalAudioElement.loop = true;
        globalAudioElement.volume = 0.5;
        
        // Déterminer le chemin audio en fonction de l'environnement
        const audioPath = window.location.hostname.includes('github.io')
          ? '/1Hall1Artiste/audio/Port-marchand.mp3'
          : '/audio/Port-marchand.mp3';
        
        globalAudioElement.src = audioPath;
      }
      
      isGlobalAudioInitialized = true;
      
      // Si l'audio était activé, le jouer
      if (isActive && globalAudioElement) {
        globalAudioElement.play().catch(error => {
          console.warn('Impossible de lire l\'audio automatiquement', error);
        });
      }
    }
  }, [isActive]);
  
  // Fonction pour gérer le clic sur le bouton
  const handleToggleAudio = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    // Sauvegarder la préférence
    localStorage.setItem('audioEnabled', newState.toString());
    
    if (newState) {
      // Activer le son
      if (globalAudioElement) {
        globalAudioElement.play().catch(error => {
          console.warn('Impossible de lire l\'audio', error);
          setIsActive(false);
          localStorage.setItem('audioEnabled', 'false');
        });
      }
      
      
      // Callback
      if (onAudioEnabled) {
        onAudioEnabled();
      }
    } else {
      // Désactiver le son
      if (globalAudioElement) {
        globalAudioElement.pause();
      }
      
      
      // Callback
      if (onAudioDisabled) {
        onAudioDisabled();
      }
    }
  };

  return (
    <button
      className={`h-12 border-2 ${
        isActive 
          ? "bg-[#1a2138] text-white border-[#1a2138]" 
          : "border-[#1a2138] text-[#1a2138] bg-transparent hover:bg-[#1a2138] hover:text-white"
      } rounded-full font-medium text-sm transition-colors px-4`}
      onClick={handleToggleAudio}
    >
      Ambiance
    </button>
  );
};

export default AudioActivator;
