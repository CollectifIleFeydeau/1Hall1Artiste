import React, { useEffect, useState, useRef } from 'react';
import { createLogger } from "@/utils/logger";
import { ToastAction } from "@/components/ui/toast";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import { FEYDEAU_DIMENSIONS } from "@/data/gpsCoordinates";
import { gpsToMapCoordinates } from "@/utils/coordinateSystem";
import { GeoPosition, isPositionWithinFeydeau, getDirectionToFeydeau, calculateDistanceToCenter } from "@/utils/locationUtils";
import { locationService } from "@/services/locationService";
import { toastService } from "@/services/toastService";

// Créer un logger pour le composant
const logger = createLogger('UserLocation');

// Dimensions de la carte en pixels (importées de MapComponent)
export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 600;

export type UserLocationProps = {
  onLocationUpdate?: (x: number, y: number, gpsPosition?: GeoPosition) => void;
  showNavigation?: boolean;
  onPermissionChange?: (denied: boolean) => void;
  scale?: number; // Facteur d'échelle de la carte
};

// Réexporter le type GeoPosition pour la compatibilité avec le code existant
export type { GeoPosition };

// Constantes pour la gestion des notifications
const LOCATION_ACTIVATION_TIMESTAMP_KEY = 'locationActivationTimestamp';
const RECENT_ACTIVATION_THRESHOLD = 5000; // 5 secondes
const LOCATION_NOTIFICATION_TIMESTAMP_KEY = 'locationNotificationTimestamp';
const NOTIFICATION_THROTTLE_DURATION = 300000; // 5 minutes (300000 ms)

/**
 * Composant pour gérer et afficher la localisation de l'utilisateur sur la carte
 */
const UserLocation: React.FC<UserLocationProps> = ({ 
  onLocationUpdate,
  showNavigation = false,
  onPermissionChange,
  scale = 1 // Valeur par défaut de 1 si non fourni
}) => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [mapCoords, setMapCoords] = useState<{ x: number, y: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const firstPositionRef = useRef(true);
  const lastNotificationRef = useRef<string | null>(null);
  
  // Fonction pour vérifier si la localisation a été activée récemment
  const isRecentlyActivated = (): boolean => {
    const activationTimestamp = localStorage.getItem(LOCATION_ACTIVATION_TIMESTAMP_KEY);
    if (!activationTimestamp) return false;
    
    const timestamp = parseInt(activationTimestamp, 10);
    const now = Date.now();
    return now - timestamp < RECENT_ACTIVATION_THRESHOLD;
  };
  
  // Fonction pour vérifier si une notification peut être affichée
  const canShowNotification = (notificationKey: string): boolean => {
    // Vérifier si une notification a déjà été affichée récemment
    const lastNotificationTimestamp = localStorage.getItem(LOCATION_NOTIFICATION_TIMESTAMP_KEY);
    if (!lastNotificationTimestamp) return true;
    
    const timestamp = parseInt(lastNotificationTimestamp, 10);
    const now = Date.now();
    
    // Si la dernière notification est trop récente, ne pas en afficher une nouvelle
    if (now - timestamp < NOTIFICATION_THROTTLE_DURATION) {
      // Vérifier si c'est la même notification
      if (lastNotificationRef.current === notificationKey) {
        return false;
      }
    }
    
    // Mettre à jour le timestamp et la clé de la dernière notification
    localStorage.setItem(LOCATION_NOTIFICATION_TIMESTAMP_KEY, now.toString());
    lastNotificationRef.current = notificationKey;
    return true;
  };
  
  // Fonction pour gérer la mise à jour de position
  const handleLocationUpdate = React.useCallback((x: number, y: number, gpsPosition?: GeoPosition): void => {
    if (!gpsPosition) return;
    
    // Mettre à jour la position GPS
    setPosition(gpsPosition);
    
    // Convertir les coordonnées GPS en coordonnées de carte
    const mapPosition = gpsToMapCoordinates(gpsPosition.latitude, gpsPosition.longitude);
    setMapCoords(mapPosition);
    
    // Log uniquement lors de changements significatifs (1 fois sur 200) pour réduire le bruit dans la console
    // if (process.env.NODE_ENV === 'development' && Math.random() < 0.005) {
    //   logger.debug('Position utilisateur mise à jour', {
    //     latitude: gpsPosition.latitude,
    //     longitude: gpsPosition.longitude,
    //     mapX: mapPosition.x,
    //     mapY: mapPosition.y
    //   });
    // }
    
    // Vérifier si l'utilisateur est dans l'Île Feydeau
    const isWithin = isPositionWithinFeydeau(gpsPosition);
    
    // Calculer la distance au centre
    const distanceToCenter = calculateDistanceToCenter(gpsPosition.latitude, gpsPosition.longitude);
    const isFarFromCenter = distanceToCenter > 300; // Plus de 300 mètres
    
    // Afficher une notification si l'utilisateur est loin de l'Île
    if (!isWithin && !firstPositionRef.current && !isRecentlyActivated() && isFarFromCenter) {
      const direction = getDirectionToFeydeau(gpsPosition);
      const notificationKey = `distance-${Math.round(distanceToCenter/100)}00-${direction}`;
      
      // Vérifier si on peut afficher la notification (pas trop fréquente)
      if (canShowNotification(notificationKey)) {
        toastService.show({
          title: "Vous êtes éloigné de l'Île Feydeau",
          description: `L'Île Feydeau se trouve au ${direction} de votre position actuelle.`,
          duration: 5000,
          action: <ToastAction altText="Me guider">Me guider</ToastAction>,
          source: "UserLocation.handleLocationUpdate",
          context: {
            direction,
            distance: Math.round(distanceToCenter),
            isWithin,
            isFarFromCenter,
            notificationKey
          }
        });
      }
    }
    
    // Après la première position, désactiver le flag
    if (firstPositionRef.current) {
      firstPositionRef.current = false;
    }
    
    // Notifier le composant parent de la mise à jour
    if (onLocationUpdate) {
      onLocationUpdate(mapPosition.x, mapPosition.y, gpsPosition);
    }
  }, [onLocationUpdate, firstPositionRef, isRecentlyActivated, canShowNotification]);
  
  // Fonction pour gérer le changement d'état de permission
  const handlePermissionChange = React.useCallback((denied: boolean): void => {
    setPermissionDenied(denied);
    
    if (onPermissionChange) {
      onPermissionChange(denied);
    }
    
    if (denied) {
      toastService.error({
        title: "Localisation refusée",
        description: "Vous avez refusé l'accès à votre position. Certaines fonctionnalités ne seront pas disponibles.",
        duration: 5000,
        source: "UserLocation.handlePermissionChange",
        context: {
          permissionDenied: true
        }
      });
    }
  }, [onPermissionChange]);
  
  // Démarrer le suivi de la position de l'utilisateur
  useEffect(() => {
    // Enregistrer le timestamp d'activation
    localStorage.setItem(LOCATION_ACTIVATION_TIMESTAMP_KEY, Date.now().toString());
    
    // Créer une référence stable aux fonctions pour éviter les redémarrages
    const locationUpdateAdapter = (_: number, __: number, gpsPosition?: GeoPosition) => {
      if (!gpsPosition) return;
      handleLocationUpdate(0, 0, gpsPosition); // Les coordonnées x,y sont recalculées dans handleLocationUpdate
    };
    
    // Créer une référence stable pour le gestionnaire de permission
    const stablePermissionHandler = (denied: boolean) => {
      handlePermissionChange(denied);
    };
    
    // Démarrer le suivi de la position avec le service de localisation
    locationService.startTracking(locationUpdateAdapter, stablePermissionHandler);
    
    // Nettoyer lors du démontage du composant
    return () => {
      locationService.stopTracking();
    };
  }, []); // Utilise les fonctions mémorisées pour éviter les re-rendus inutiles

  // Si la position n'est pas encore disponible
  if (!mapCoords) {
    return null;
  }
  
  // Si l'autorisation a été refusée, on affiche quand même le composant
  // pour que le parent puisse savoir que l'autorisation a été refusée
  // mais on ne rend pas le marqueur de position

  return (
    <>
      {/* Marqueur de position de l'utilisateur */}
      <div 
        className="absolute z-30 pointer-events-none"
        style={{
          left: `${mapCoords.x * scale}px`,
          top: `${mapCoords.y * scale}px`,
          transform: 'translate(-50%, -50%)' // Centrer le marqueur sur les coordonnées
          // Logs de rendu supprimés pour réduire les messages dans la console
        }}
      >
        <div className="relative">
          {/* Cercle de précision */}
          {position && (
            <div 
              className="absolute rounded-full bg-blue-500/20 border border-blue-500/50"
              style={{
                width: `${(position.accuracy / FEYDEAU_DIMENSIONS.width) * MAP_WIDTH * 2 * scale}px`,
                height: `${(position.accuracy / FEYDEAU_DIMENSIONS.width) * MAP_WIDTH * 2 * scale}px`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%'
              }}
            />
          )}
          
          {/* Indicateur de position - plus grand et plus visible */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {showNavigation ? (
              <Navigation className="h-8 w-8 text-blue-600 drop-shadow-md" />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded-full border-4 border-white shadow-lg pulse-animation z-50" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserLocation;
