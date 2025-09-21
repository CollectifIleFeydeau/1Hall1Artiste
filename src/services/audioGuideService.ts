import { createLogger } from "@/utils/logger";
import { useState, useEffect } from "react";

const logger = createLogger('AudioGuideService');

export interface AudioGuideState {
  isPlaying: boolean;
  currentTrack: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export type AudioGuideListener = (state: AudioGuideState) => void;

class AudioGuideService {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioGuideListener> = new Set();
  private state: AudioGuideState = {
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isLoading: false,
    error: null
  };

  constructor() {
    // Initialiser le volume depuis le localStorage
    const savedVolume = localStorage.getItem('audioGuide_volume');
    if (savedVolume) {
      this.state.volume = parseFloat(savedVolume);
    }
  }

  /**
   * Ajouter un listener pour les changements d'état
   */
  addListener(listener: AudioGuideListener): () => void {
    this.listeners.add(listener);
    // Retourner une fonction de cleanup
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifier tous les listeners des changements d'état
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        logger.error('Erreur lors de la notification d\'un listener', { error });
      }
    });
  }

  /**
   * Mettre à jour l'état et notifier les listeners
   */
  private updateState(updates: Partial<AudioGuideState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): AudioGuideState {
    return { ...this.state };
  }

  /**
   * Jouer un fichier audio
   */
  async play(audioUrl: string, trackName?: string): Promise<void> {
    try {
      logger.info('Tentative de lecture audio', { audioUrl, trackName });
      
      // Si c'est déjà le même track et qu'il est en pause, reprendre la lecture
      if (this.audio && this.state.currentTrack === audioUrl && !this.state.isPlaying) {
        this.audio.play();
        this.updateState({ isPlaying: true, error: null });
        return;
      }

      // Arrêter l'audio actuel si il y en a un
      this.stop();

      this.updateState({ 
        isLoading: true, 
        error: null, 
        currentTrack: audioUrl 
      });

      // Créer un nouvel élément audio
      this.audio = new Audio(audioUrl);
      this.audio.volume = this.state.volume;

      // Configurer les event listeners
      this.setupAudioEventListeners();

      // Démarrer la lecture
      await this.audio.play();
      
      this.updateState({ 
        isPlaying: true, 
        isLoading: false,
        currentTrack: audioUrl
      });

      logger.info('Lecture audio démarrée avec succès', { audioUrl });
    } catch (error) {
      logger.error('Erreur lors de la lecture audio', { error, audioUrl });
      this.updateState({ 
        isPlaying: false, 
        isLoading: false, 
        error: 'Erreur lors de la lecture du fichier audio' 
      });
      throw error;
    }
  }

  /**
   * Mettre en pause la lecture
   */
  pause(): void {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
      logger.info('Lecture audio mise en pause');
    }
  }

  /**
   * Reprendre la lecture
   */
  resume(): void {
    if (this.audio && !this.state.isPlaying) {
      this.audio.play();
      this.updateState({ isPlaying: true });
      logger.info('Lecture audio reprise');
    }
  }

  /**
   * Arrêter la lecture
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.cleanupAudio();
      this.updateState({ 
        isPlaying: false, 
        currentTrack: null, 
        currentTime: 0, 
        duration: 0,
        error: null 
      });
      logger.info('Lecture audio arrêtée');
    }
  }

  /**
   * Changer le volume (0-1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateState({ volume: clampedVolume });
    
    if (this.audio) {
      this.audio.volume = clampedVolume;
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('audioGuide_volume', clampedVolume.toString());
    logger.debug('Volume modifié', { volume: clampedVolume });
  }

  /**
   * Aller à une position spécifique (en secondes)
   */
  seekTo(time: number): void {
    if (this.audio && this.state.duration > 0) {
      const clampedTime = Math.max(0, Math.min(this.state.duration, time));
      this.audio.currentTime = clampedTime;
      this.updateState({ currentTime: clampedTime });
      logger.debug('Position audio modifiée', { time: clampedTime });
    }
  }

  /**
   * Configurer les event listeners pour l'élément audio
   */
  private setupAudioEventListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.updateState({ 
          duration: this.audio.duration,
          isLoading: false 
        });
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.updateState({ currentTime: this.audio.currentTime });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ 
        isPlaying: false, 
        currentTime: 0 
      });
      logger.info('Lecture audio terminée');
    });

    this.audio.addEventListener('error', (error) => {
      logger.error('Erreur audio', { error });
      this.updateState({ 
        isPlaying: false, 
        isLoading: false, 
        error: 'Erreur lors de la lecture du fichier audio' 
      });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, error: null });
    });
  }

  /**
   * Nettoyer l'élément audio actuel
   */
  private cleanupAudio(): void {
    if (this.audio) {
      // Retirer tous les event listeners en remplaçant l'élément
      const oldAudio = this.audio;
      this.audio = null;
      
      try {
        oldAudio.pause();
        oldAudio.src = '';
        oldAudio.load();
      } catch (error) {
        logger.warn('Erreur lors du nettoyage audio', { error });
      }
    }
  }

  /**
   * Nettoyer le service (à appeler lors du démontage)
   */
  cleanup(): void {
    this.stop();
    this.listeners.clear();
    logger.info('Service audio guide nettoyé');
  }
}

// Instance singleton
export const audioGuideService = new AudioGuideService();

// Hook React pour utiliser le service
export function useAudioGuide() {
  const [state, setState] = useState<AudioGuideState>(audioGuideService.getState());

  useEffect(() => {
    const unsubscribe = audioGuideService.addListener(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    play: audioGuideService.play.bind(audioGuideService),
    pause: audioGuideService.pause.bind(audioGuideService),
    resume: audioGuideService.resume.bind(audioGuideService),
    stop: audioGuideService.stop.bind(audioGuideService),
    setVolume: audioGuideService.setVolume.bind(audioGuideService),
    seekTo: audioGuideService.seekTo.bind(audioGuideService)
  };
}
