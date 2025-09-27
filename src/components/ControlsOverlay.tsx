import React from 'react';
import { AudioPlayer } from './AudioPlayer';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ControlsOverlayProps {
  audioSrc: string;
  onLocationClick: () => void;
  locationActive?: boolean;
}

/**
 * Composant qui regroupe les contrôles audio et de localisation
 */
export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  audioSrc,
  onLocationClick,
  locationActive = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-center gap-2">
      {/* Contrôle de localisation */}
      <div className="flex flex-col items-center">
        <div className="bg-white/90 text-[#4a5d94] text-xs px-2 py-1 rounded-md shadow-sm mb-1 whitespace-nowrap">
          {locationActive ? "Localisation active" : "Activer la localisation"}
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full bg-white/90 hover:bg-white shadow-md",
            locationActive && "bg-blue-100 border-blue-300"
          )}
          onClick={onLocationClick}
          title={locationActive ? "Localisation activée" : "Activer la localisation"}
        >
          <MapPin className={cn(
            "h-5 w-5",
            locationActive ? "text-blue-600" : "text-[#4a5d94]"
          )} />
        </Button>
      </div>

      {/* Contrôle audio */}
      <div className="flex flex-col items-center">
        <div className="bg-white/90 text-[#4a5d94] text-xs px-2 py-1 rounded-md shadow-sm mb-1 whitespace-nowrap">
          Son d'ambiance
        </div>
        <AudioPlayer audioSrc={audioSrc} autoPlay={true} />
      </div>
    </div>
  );
};

export default ControlsOverlay;

