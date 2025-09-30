import { useState, useRef, useEffect } from 'react';
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Slider } from "@/components/ui/slider";
import { analytics } from "@/services/firebaseAnalytics";

interface AudioGuideProps {
  audioSrc: string;
  locationId: string;
  className?: string;
}

export const AudioGuide = ({ audioSrc, locationId, className = "" }: AudioGuideProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        analytics.trackAudio('pause', locationId);
      } else {
        audioRef.current.play();
        analytics.trackAudio('play', locationId);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className={`p-3 bg-white/60 backdrop-blur-sm rounded-xl border-2 border-amber-200 shadow-md ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          disabled={audioLoading}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#4a5d94] hover:bg-[#3a4d84] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
        >
          {audioLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5 text-white fill-white" />
          ) : (
            <Play className="h-5 w-5 text-white fill-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#4a5d94]">{formatTime(currentTime)}</span>
            <div className="flex items-center">
              <Volume2 className="h-4 w-4 text-[#4a5d94] mr-2 flex-shrink-0" />
              <span className="text-sm font-medium text-[#4a5d94]">Audio guide</span>
            </div>
            <span className="text-xs text-[#4a5d94]">{formatTime(duration)}</span>
          </div>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            disabled={audioLoading}
            className="cursor-pointer"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc ? 
          (window.location.hostname.includes('github.io') 
            ? `/1Hall1Artiste${audioSrc}` 
            : audioSrc) 
          : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onCanPlay={() => setAudioLoading(false)}
        onError={() => setAudioLoading(false)}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
};
