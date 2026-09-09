import { useState, useEffect, useCallback } from 'react';
import { AMBIANCE_AUDIO_URL } from '@/constants/mediaUrls';

// Audio global partagé entre toutes les instances / pages
let globalAudioElement: HTMLAudioElement | null = null;
let isGlobalAudioInitialized = false;

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioElement) {
    globalAudioElement = new Audio();
    globalAudioElement.loop = true;
    globalAudioElement.volume = 0.5;

    globalAudioElement.src = AMBIANCE_AUDIO_URL;
  }
  return globalAudioElement;
}

interface UseAmbianceAudioOptions {
  onAudioEnabled?: () => void;
  onAudioDisabled?: () => void;
}

/**
 * Hook pour gérer le son d'ambiance.
 * Utilise un élément audio global pour conserver l'état entre les pages.
 */
export function useAmbianceAudio({ onAudioEnabled, onAudioDisabled }: UseAmbianceAudioOptions = {}) {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('audioEnabled') === 'true';
  });

  // Initialisation de l'audio global une seule fois
  useEffect(() => {
    if (!isGlobalAudioInitialized) {
      ensureAudio();
      isGlobalAudioInitialized = true;

      if (isActive && globalAudioElement) {
        globalAudioElement.play().catch(error => {
          console.warn('Impossible de lire l\'audio automatiquement', error);
        });
      }
    }
  }, [isActive]);

  const toggle = useCallback(() => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('audioEnabled', newState.toString());

    const audio = ensureAudio();
    if (newState) {
      if (audio) {
        audio.play().catch(error => {
          console.warn('Impossible de lire l\'audio', error);
          setIsActive(false);
          localStorage.setItem('audioEnabled', 'false');
        });
      }
      onAudioEnabled?.();
    } else {
      if (audio) audio.pause();
      onAudioDisabled?.();
    }
  }, [isActive, onAudioEnabled, onAudioDisabled]);

  return { isActive, toggle };
}
