import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioSrc: string;
  autoPlay?: boolean;
}

export const AudioPlayer = ({ audioSrc, autoPlay = true }: AudioPlayerProps) => {
  // Récupérer la préférence utilisateur depuis le localStorage
  const getSavedPreference = (): boolean => {
    const saved = localStorage.getItem('audioPlayerState');
    return saved !== null ? saved === 'playing' : autoPlay;
  };

  const [isPlaying, setIsPlaying] = useState(getSavedPreference());
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Créer l'élément audio
    audioRef.current = new Audio(audioSrc);
    audioRef.current.loop = true;
    
    // Configurer le volume
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
    
    // Démarrer la lecture selon la préférence utilisateur
    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Lecture audio automatique empêchée:", error);
          setIsPlaying(false);
          localStorage.setItem('audioPlayerState', 'paused');
        });
      }

      // Démarrer l'animation si la lecture démarre
      setIsAnimating(true);
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSrc, isPlaying]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsAnimating(false);
        localStorage.setItem('audioPlayerState', 'paused');
      } else {
        audioRef.current.play().catch(error => {
          console.log("Erreur lors de la lecture:", error);
        });
        setIsAnimating(true);
        localStorage.setItem('audioPlayerState', 'playing');
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full bg-white/90 hover:bg-white shadow-md relative",
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
  );
};
