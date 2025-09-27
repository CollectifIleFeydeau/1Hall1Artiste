import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import { cn } from '@/lib/utils';

// Créer un contexte pour gérer l'état audio global
export const AudioContext = createContext<{
  userInteracted: boolean;
  setUserInteracted: (value: boolean) => void;
}>({ 
  userInteracted: false,
  setUserInteracted: () => {}
});

// Hook personnalisé pour utiliser le contexte audio
export const useAudio = () => {
  const context = useContext(AudioContext);
  return context as {
    userInteracted: boolean;
    setUserInteracted: (value: boolean) => void;
  };
};

// Fournisseur du contexte audio
interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  
  return (
    <AudioContext.Provider value={{ userInteracted, setUserInteracted }}>
      {children}
    </AudioContext.Provider>
  );
};

interface AudioPlayerProps {
  audioSrc: string;
  autoPlay?: boolean;
}

export const AudioPlayer = ({ audioSrc, autoPlay = true }: AudioPlayerProps) => {
  // Récupérer la préférence utilisateur depuis le localStorage avec protection
  const getSavedPreference = (): boolean => {
    try {
      const saved = localStorage.getItem('audioPlayerState');
      return saved !== null ? saved === 'playing' : autoPlay;
    } catch (storageError) {
      console.warn('Erreur localStorage dans AudioPlayer:', storageError);
      return autoPlay;
    }
  };

  const [isPlaying, setIsPlaying] = useState(getSavedPreference());
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialiser l'audio
  useEffect(() => {
    if (audioRef.current) {
      // Configurer l'audio
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
      
      // Nettoyage lors du démontage
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, []);
  
  // Gérer les changements d'état de lecture
  useEffect(() => {
    if (audioRef.current) {
      // Mettre à jour l'état de lecture
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Erreur lors de la lecture:", error);
            setIsPlaying(false);
            setIsAnimating(false);
          });
        }
        setIsAnimating(true);
      } else {
        audioRef.current.pause();
        setIsAnimating(false);
      }
      
      // Sauvegarder la préférence utilisateur avec protection
      try {
        localStorage.setItem('audioPlayerState', isPlaying ? 'playing' : 'paused');
      } catch (storageError) {
        console.warn('Erreur sauvegarde localStorage dans AudioPlayer:', storageError);
      }
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    // Basculer l'état de lecture
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* Élément audio natif caché */}
      <audio 
        ref={audioRef}
        src={audioSrc} 
        loop 
        preload="auto"
        playsInline
        style={{ display: 'none' }}
      />
      
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "rounded-full bg-white/90 backdrop-blur-sm hover:bg-white/95 shadow-md relative border border-amber-300",
          isAnimating && "overflow-visible"
        )}
        onClick={togglePlayback}
        title={isPlaying ? "Couper le son d'ambiance" : "Jouer le son d'ambiance"}
      >
        {/* Cercles d'animation pour indiquer que le son joue */}
        {isAnimating && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping-slow bg-[#4a5d94]/10"></span>
            <span className="absolute inset-[-4px] rounded-full animate-ping-slow animation-delay-300 bg-[#4a5d94]/5"></span>
          </>
        )}
        {isPlaying ? (
          <Volume2 className="h-5 w-5 text-[#4a5d94]" />
        ) : (
          <VolumeX className="h-5 w-5 text-[#4a5d94]" />
        )}
      </Button>
    </>
  );
};

