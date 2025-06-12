import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { createLogger } from "@/utils/logger";

const logger = createLogger('LocationActivator');

interface LocationActivatorProps {
  onLocationEnabled?: () => void;
  onLocationDenied?: () => void;
  onLocationDisabled?: () => void;
}

/**
 * Composant pour activer ou désactiver la géolocalisation
 */
const LocationActivator: React.FC<LocationActivatorProps> = ({
  onLocationEnabled,
  onLocationDenied,
  onLocationDisabled
}) => {
  // Par défaut, le bouton est sur "Activer localisation"
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Vérifier l'état initial de la localisation au chargement
  useEffect(() => {
    const locationConsent = localStorage.getItem('locationConsent');
    // Mettre à jour l'état uniquement si le consentement est explicitement 'granted'
    if (locationConsent === 'granted') {
      setIsActive(true);
    } else {
      // S'assurer que l'état est à false si pas de consentement ou autre valeur
      setIsActive(false);
    }
  }, []);
  
  const toggleLocation = () => {
    if (isActive) {
      // Désactiver la localisation
      localStorage.removeItem('locationConsent');
      setIsActive(false);
      
      
      // Callback
      if (onLocationDisabled) {
        onLocationDisabled();
      }
      
      return;
    }
    
    // Activer la localisation
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
          
          // Mettre à jour l'état du bouton
          setIsActive(true);
          
          
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
      logger.warn('Géolocalisation non supportée par le navigateur');
    }
  };

  return (
    <Button
      variant={isActive ? "destructive" : "default"}
      size="sm"
      className="flex items-center gap-1 font-medium"
      onClick={toggleLocation}
    >
      <MapPin className="h-4 w-4" />
      {isActive ? "Désactiver localisation" : "Activer localisation"}
    </Button>
  );
};

export default LocationActivator;
