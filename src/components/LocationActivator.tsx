import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { createLogger } from "@/utils/logger";

const logger = createLogger('LocationActivator');

interface LocationActivatorProps {
  onLocationEnabled?: () => void;
  onLocationDenied?: () => void;
}

/**
 * Composant pour activer explicitement la géolocalisation
 */
const LocationActivator: React.FC<LocationActivatorProps> = ({
  onLocationEnabled,
  onLocationDenied
}) => {
  const activateLocation = () => {
    if (navigator.geolocation) {
      logger.info('Demande d\'autorisation de géolocalisation explicite');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Succès
          logger.info('Autorisation de géolocalisation accordée', {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
          
          // Stocker le consentement
          localStorage.setItem('locationConsent', 'granted');
          
          // Notification de succès
          toast({
            title: "Localisation activée",
            description: "Votre position est maintenant affichée sur la carte.",
            duration: 3000
          });
          
          // Callback
          if (onLocationEnabled) {
            onLocationEnabled();
          }
        },
        (error) => {
          // Erreur
          logger.warn('Autorisation de géolocalisation refusée', { 
            code: error.code,
            message: error.message
          });
          
          // Notification d'erreur
          toast({
            title: "Localisation refusée",
            description: "Veuillez autoriser l'accès à votre position dans les paramètres de votre navigateur.",
            variant: "destructive"
          });
          
          // Callback
          if (onLocationDenied) {
            onLocationDenied();
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      // Géolocalisation non supportée
      toast({
        title: "Localisation non disponible",
        description: "Votre navigateur ne prend pas en charge la géolocalisation.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={activateLocation}
    >
      <MapPin className="h-4 w-4" />
      Activer localisation
    </Button>
  );
};

export default LocationActivator;
