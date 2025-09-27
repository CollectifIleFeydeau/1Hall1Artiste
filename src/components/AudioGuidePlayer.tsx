import React from 'react';
import { useAudioGuide } from '@/services/audioGuideService';
import { ActionButton } from '@/components/ui/ActionButton';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Play from 'lucide-react/dist/esm/icons/play';
import Pause from 'lucide-react/dist/esm/icons/pause';
import Square from 'lucide-react/dist/esm/icons/square';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

interface AudioGuidePlayerProps {
  className?: string;
}

export const AudioGuidePlayer: React.FC<AudioGuidePlayerProps> = ({
  className = ''
}) => {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    play,
    pause,
    resume,
    stop,
    setVolume,
    seekTo
  } = useAudioGuide();

  // Ne pas afficher le player si aucun track n'est chargé
  if (!currentTrack) {
    return null;
  }

  // Formater le temps en mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculer le pourcentage de progression
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (duration > 0) {
      const newTime = (value[0] / 100) * duration;
      seekTo(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  return (
    <Card className={`fixed bottom-20 left-4 right-4 z-40 bg-white/95 backdrop-blur-sm border-[#d8e3ff] shadow-lg ${className}`}>
      <div className="p-3">
        {/* Titre et contrôles principaux */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#4a5d94] truncate">
              Audio Guide
            </p>
            {error && (
              <p className="text-xs text-red-500 truncate">
                {error}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            {/* Bouton Play/Pause */}
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading || !!error}
              className="p-1 h-8 w-8 text-[#8c9db5] hover:text-[#4a5d94]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </ActionButton>
            
            {/* Bouton Stop */}
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={stop}
              className="p-1 h-8 w-8 text-[#8c9db5] hover:text-[#4a5d94]"
            >
              <Square className="h-3 w-3" />
            </ActionButton>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-2">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
            disabled={duration === 0 || isLoading}
          />
          <div className="flex justify-between text-xs text-[#8c9db5] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôle du volume */}
        <div className="flex items-center space-x-2">
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="p-1 h-6 w-6 text-[#8c9db5] hover:text-[#4a5d94]"
          >
            {volume === 0 ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </ActionButton>
          
          <div className="flex-1 max-w-20">
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <span className="text-xs text-[#8c9db5] w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </Card>
  );
};

