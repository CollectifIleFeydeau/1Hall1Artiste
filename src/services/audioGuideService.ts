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
      
      // Validation de l'URL audio
      if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim() === '') {
        throw new Error('URL audio invalide ou vide');
      }

      // Si c'est déjà le même track et qu'il est en pause, reprendre la lecture
      if (this.audio && this.state.currentTrack === audioUrl && !this.state.isPlaying) {
        try {
          await this.audio.play();
          this.updateState({ isPlaying: true, error: null });
          return;
        } catch (playError) {
          logger.warn('Erreur lors de la reprise, recréation de l\'élément audio', { playError });
          // Continuer avec la création d'un nouvel élément audio
        }
      }

      // Arrêter l'audio actuel si il y en a un
      this.stop();

      this.updateState({ 
        isLoading: true, 
        error: null, 
        currentTrack: audioUrl 
      });

      // Créer un nouvel élément audio avec protection
      try {
        this.audio = new Audio();
        
        // Configurer les event listeners AVANT de définir la source
        this.setupAudioEventListeners();
        
        // Définir la source et le volume
        this.audio.src = audioUrl;
        this.audio.volume = this.state.volume;
        
        // Précharger l'audio
        this.audio.preload = 'auto';
        
        // Attendre que les métadonnées soient chargées avant de jouer
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Timeout lors du chargement des métadonnées audio'));
          }, 10000); // Timeout de 10 secondes

          const onLoadedMetadata = () => {
            clearTimeout(timeoutId);
            if (this.audio) {
              this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
              this.audio.removeEventListener('error', onError);
            }
            resolve();
          };

          const onError = (event: Event) => {
            clearTimeout(timeoutId);
            if (this.audio) {
              this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
              this.audio.removeEventListener('error', onError);
            }
            const error = this.audio?.error;
            if (error) {
              reject(new Error(`Erreur de chargement audio: ${error.message} (code: ${error.code})`));
            } else {
              reject(new Error('Erreur de chargement audio inconnue'));
            }
          };

          if (this.audio) {
            this.audio.addEventListener('loadedmetadata', onLoadedMetadata);
            this.audio.addEventListener('error', onError);
            this.audio.load(); // Forcer le chargement
          } else {
            reject(new Error('Élément audio non créé'));
          }
        });

        // Démarrer la lecture
        if (this.audio) {
          await this.audio.play();
          
          this.updateState({ 
            isPlaying: true, 
            isLoading: false,
            currentTrack: audioUrl
          });

          logger.info('Lecture audio démarrée avec succès', { audioUrl });
        } else {
          throw new Error('Élément audio perdu pendant le chargement');
        }
      } catch (audioError) {
        // Nettoyage en cas d'erreur
        this.cleanupAudio();
        throw audioError;
      }
    } catch (error) {
      logger.error('Erreur lors de la lecture audio', { error, audioUrl });
      
      let errorMessage = 'Erreur lors de la lecture du fichier audio';
      if (error instanceof Error) {
        if (error.message.includes('no supported sources') || error.message.includes('MEDIA_ERR_SRC_NOT_SUPPORTED')) {
          errorMessage = 'Format audio non supporté par ce navigateur';
        } else if (error.message.includes('network') || error.message.includes('MEDIA_ERR_NETWORK')) {
          errorMessage = 'Erreur réseau lors du chargement de l\'audio';
        } else if (error.message.includes('decode') || error.message.includes('MEDIA_ERR_DECODE')) {
          errorMessage = 'Erreur de décodage du fichier audio';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'Timeout lors du chargement de l\'audio';
        }
      }
      
      this.updateState({ 
        isPlaying: false, 
        isLoading: false, 
        error: errorMessage,
        currentTrack: null
      });
      
      // Ne pas re-throw l'erreur pour éviter les unhandled rejections
      // L'erreur est déjà gérée dans l'état du service
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
      if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
        this.updateState({ 
          duration: this.audio.duration,
          isLoading: false 
        });
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !isNaN(this.audio.currentTime)) {
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

    this.audio.addEventListener('error', (event) => {
      const audioElement = event.target as HTMLAudioElement;
      const error = audioElement?.error;
      
      let errorMessage = 'Erreur lors de la lecture du fichier audio';
      let logDetails: any = { event };
      
      if (error) {
        logDetails.errorCode = error.code;
        logDetails.errorMessage = error.message;
        
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Lecture audio interrompue';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Erreur réseau lors du chargement';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Erreur de décodage du fichier audio';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Format audio non supporté';
            break;
          default:
            errorMessage = 'Erreur audio inconnue';
        }
      }
      
      logger.error('Erreur audio détectée', logDetails);
      this.updateState({ 
        isPlaying: false, 
        isLoading: false, 
        error: errorMessage,
        currentTrack: null
      });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, error: null });
    });

    // Ajouter des listeners pour détecter les problèmes de chargement
    this.audio.addEventListener('stalled', () => {
      logger.warn('Chargement audio bloqué');
    });

    this.audio.addEventListener('suspend', () => {
      logger.info('Chargement audio suspendu par le navigateur');
    });

    this.audio.addEventListener('abort', () => {
      logger.warn('Chargement audio abandonné');
      this.updateState({ 
        isLoading: false, 
        error: 'Chargement audio abandonné' 
      });
    });

    this.audio.addEventListener('emptied', () => {
      logger.info('Élément audio vidé');
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
        // Arrêter la lecture si en cours
        if (!oldAudio.paused) {
          oldAudio.pause();
        }
        
        // Vider la source pour éviter "no supported sources"
        oldAudio.removeAttribute('src');
        oldAudio.src = '';
        
        // Forcer le rechargement pour nettoyer l'état interne
        oldAudio.load();
        
        // Supprimer explicitement tous les event listeners possibles
        const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 
                       'play', 'pause', 'ended', 'error', 'timeupdate', 'progress', 'seeking', 
                       'seeked', 'volumechange', 'ratechange', 'stalled', 'suspend', 'abort', 'emptied'];
        
        events.forEach(eventType => {
          try {
            oldAudio.removeEventListener(eventType, () => {});
          } catch (e) {
            // Ignorer les erreurs de suppression d'event listeners
          }
        });
        
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

