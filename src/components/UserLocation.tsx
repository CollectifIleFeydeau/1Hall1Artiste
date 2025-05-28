import React, { useEffect, useState } from 'react';
import { createLogger } from "@/utils/logger";
import { toast } from "@/components/ui/use-toast";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import { FEYDEAU_CENTER, FEYDEAU_DIMENSIONS } from "@/data/gpsCoordinates";
import { gpsToMapCoordinates } from "@/utils/coordinateSystem";

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

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

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
  const [watchId, setWatchId] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Demander et suivre la position de l'utilisateur
  useEffect(() => {
    // Détecter si nous sommes en environnement de développement local
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('192.168.') || 
                           window.location.protocol === 'http:';
    
    // En développement local, simuler automatiquement une position
    if (isLocalDevelopment) {
      logger.info('Environnement de développement détecté, simulation de position activée');
      
      // Position fixe au 9 quai Turenne pour les tests
      // Coordonnées GPS précises du 9 quai Turenne
      const fixedPosition: GeoPosition = {
        latitude: 47.2127569, // Latitude du 9 quai Turenne47.21230600,-1.55698600
        longitude: -1.5551265, // Longitude du 9 quai Turenne (négative pour l'ouest)
        accuracy: 5
      };
      
      // Mettre à jour la position
      setPosition(fixedPosition);
      
      // Utiliser les coordonnées de carte précises du 9 quai Turenne
      // Coordonnées testées et vérifiées
      const mapPosition = {
        x: 320,  // Coordonnée X du 9 quai Turenne sur la carte
        y: 150   // Coordonnée Y du 9 quai Turenne sur la carte
      };
      setMapCoords(mapPosition);
      
      // Notifier le composant parent avec les coordonnées de la carte et GPS
      if (onLocationUpdate) {
        onLocationUpdate(mapPosition.x, mapPosition.y, fixedPosition);
      }
      
      logger.info('Position fixe utilisée pour les tests', { 
        gps: fixedPosition, 
        map: mapPosition 
      });
      
      // Pas besoin d'intervalle pour une position fixe
      return () => {};
    }
    
    // En production, utiliser la géolocalisation réelle
    if (!navigator.geolocation) {
      logger.warn('La géolocalisation n\'est pas prise en charge par ce navigateur');
      toast({
        title: "Localisation non disponible",
        description: "Votre navigateur ne prend pas en charge la géolocalisation.",
        variant: "destructive"
      });
      return;
    }
    
    // Réinitialiser l'état de permission refusée au démarrage
    // Cela permet de réessayer après que l'utilisateur a cliqué sur "Activer"
    setPermissionDenied(false);
    
    // Notifier le composant parent que la permission n'est pas refusée
    if (onPermissionChange) {
      onPermissionChange(false);
    };

    // Fonction de succès pour la géolocalisation
    const success = (pos: GeolocationPosition) => {
      const newPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };
      
      setPosition(newPosition);
      
      // Réinitialiser l'état de permission refusée puisque nous avons reçu une position
      if (permissionDenied) {
        setPermissionDenied(false);
        if (onPermissionChange) {
          onPermissionChange(false);
        }
      }
      
      // Convertir les coordonnées GPS en coordonnées de la carte
      const mapPosition = gpsToMapCoordinates(newPosition.latitude, newPosition.longitude);
      setMapCoords(mapPosition);
      
      // Notifier le composant parent avec les coordonnées de la carte et GPS
      if (onLocationUpdate) {
        onLocationUpdate(mapPosition.x, mapPosition.y, newPosition);
      }
      
      logger.info('Position utilisateur mise à jour', { 
        gps: newPosition, 
        map: mapPosition 
      });
    };

    // Fonction d'erreur pour la géolocalisation
    const error = (err: GeolocationPositionError) => {
      // Détecter si nous sommes en environnement de développement local
      const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname.includes('192.168.') || 
                              window.location.protocol === 'http:';
      
      // En environnement de développement, ne jamais signaler d'erreur de permission
      if (isLocalDevelopment) {
        // Ne pas mettre à jour permissionDenied
        // La simulation de position est déjà activée dans le bloc précédent
        logger.info('Erreur de géolocalisation ignorée en mode développement', { 
          code: err.code,
          message: err.message
        });
        return;
      }
      
      // Vérifier si l'erreur est liée à une origine non sécurisée (HTTP vs HTTPS)
      const isSecureOriginError = err.message && err.message.includes('secure origins');
      
      if (isSecureOriginError) {
        // En production, afficher un message spécifique pour les origines non sécurisées
        setPermissionDenied(true);
        if (onPermissionChange) {
          onPermissionChange(true);
        }
        
        toast({
          title: "Localisation non disponible",
          description: "Pour utiliser la géolocalisation, veuillez accéder au site via HTTPS.",
          variant: "destructive"
        });
        return;
      }
      
      if (err.code === 1) { // Permission refusée
        setPermissionDenied(true);
        if (onPermissionChange) {
          onPermissionChange(true);
        }
        
        logger.warn('Accès à la localisation refusé', { errorCode: err.code });
      } else {
        // Autres erreurs de géolocalisation
        logger.error('Erreur de géolocalisation', { 
          code: err.code,
          message: err.message
        });
        
        toast({
          title: "Erreur de localisation",
          description: `Impossible de déterminer votre position: ${err.message}`,
          variant: "destructive"
        });
      }
      logger.error('Erreur de géolocalisation', { code: err.code, message: err.message });
    };

    // Options pour la géolocalisation
    const options = {
      enableHighAccuracy: true, // Haute précision pour une meilleure localisation
      maximumAge: 30000,       // Accepter une position mise en cache de moins de 30 secondes
      timeout: 10000           // Timeout après 10 secondes
    };

    // Démarrer le suivi de la position
    const id = navigator.geolocation.watchPosition(success, error, options);
    setWatchId(id);

    // Nettoyer lors du démontage du composant
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [onLocationUpdate]);

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
          transform: 'translate(-50%, -50%)', // Centrer le marqueur sur les coordonnées
          // Ajouter des logs pour débogage
          ...(logger.info('Rendu du marqueur utilisateur', {
            x: mapCoords.x,
            y: mapCoords.y,
            scale,
            positionX: mapCoords.x * scale,
            positionY: mapCoords.y * scale
          }), {})
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
