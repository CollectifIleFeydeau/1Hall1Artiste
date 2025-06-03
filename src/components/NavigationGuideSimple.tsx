import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Location, getLocationGPSById } from "@/data/locations";
import { GeoPosition } from "./UserLocation";
import { createLogger } from "@/utils/logger";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import X from "lucide-react/dist/esm/icons/x";

// Créer un logger pour le composant
const logger = createLogger('NavigationGuideSimple');

// Distance maximale en mètres pour considérer qu'un lieu est "atteint"
const ARRIVAL_THRESHOLD = 20;

/**
 * Calcule la distance entre deux points GPS en mètres
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Rayon de la Terre en mètres
  const R = 6371000;
  
  // Conversion des degrés en radians
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  // Formule haversine
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance en mètres
  return R * c;
}

/**
 * Calcule une distance simplifiée pour l'affichage
 * 
 * @param calculatedDistance Distance GPS calculée en mètres
 * @returns Distance adaptée à l'échelle de la carte en mètres
 */
function calculateSimpleDistance(calculatedDistance: number): number {
  // Arrondir la distance au mètre près sans appliquer de facteur de correction
  return Math.round(calculatedDistance);
}

/**
 * Détermine la direction entre deux points GPS
 */
function getDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  // Calculer l'angle en degrés
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let angle = Math.atan2(y, x) * 180 / Math.PI;
  
  // Convertir en angle positif (0-360°)
  angle = (angle + 360) % 360;
  
  // Convertir l'angle en direction cardinale
  if (angle >= 337.5 || angle < 22.5) return "nord";
  if (angle >= 22.5 && angle < 67.5) return "nord-est";
  if (angle >= 67.5 && angle < 112.5) return "est";
  if (angle >= 112.5 && angle < 157.5) return "sud-est";
  if (angle >= 157.5 && angle < 202.5) return "sud";
  if (angle >= 202.5 && angle < 247.5) return "sud-ouest";
  if (angle >= 247.5 && angle < 292.5) return "ouest";
  return "nord-ouest";
}

type NavigationGuideSimpleProps = {
  userPosition: GeoPosition | null;
  targetLocation: Location | null;
  mapCoords?: { x: number; y: number } | null;
  targetMapCoords?: { x: number; y: number } | null;
  scale?: number;
  onClose: () => void;
};

/**
 * Composant simplifié pour guider l'utilisateur vers un point d'intérêt
 */
function NavigationGuideSimple(props: NavigationGuideSimpleProps) {
  const { userPosition, targetLocation, onClose, mapCoords, targetMapCoords, scale = 1 } = props;
  
  const [navigationInfo, setNavigationInfo] = useState({
    distance: 0,
    direction: '',
    isNearby: false
  });

  useEffect(() => {
    if (userPosition && targetLocation) {
      try {
        // Récupérer les coordonnées GPS de l'emplacement cible à partir de son ID
        const targetCoordinates = getLocationGPSById(targetLocation.id);
        
        if (!targetCoordinates) {
          logger.warn('[NavigationGuideSimple] Coordonnées GPS non trouvées pour', targetLocation.id);
          return;
        }
        
        // Calculer la distance entre l'utilisateur et la cible
        const calculatedDistance = calculateDistance(
          userPosition.latitude, userPosition.longitude,
          targetCoordinates.latitude, targetCoordinates.longitude
        );
        
        // Calculer la direction (simplifiée pour cet exemple)
        const direction = getDirection(
          userPosition.latitude, userPosition.longitude,
          targetCoordinates.latitude, targetCoordinates.longitude
        );
        
        // Déterminer si l'utilisateur est à proximité (moins de 20 mètres)
        const isNearby = calculatedDistance < ARRIVAL_THRESHOLD;
        
        // Appliquer le facteur de correction pour l'affichage
        const displayDistance = calculateSimpleDistance(calculatedDistance);
        
        // Mettre à jour l'état
        setNavigationInfo({
          distance: displayDistance,
          direction,
          isNearby
        });
        
        // Journaliser les informations de navigation pour le débogage
        logger.info('[NavigationGuideSimple] Navigation calculée', {
          userPosition,
          targetLocation: targetLocation.id,
          distance: displayDistance,
          direction,
          isNearby
        });
      } catch (error: any) {
        logger.error('[NavigationGuideSimple] Erreur lors du calcul de la navigation', error);
      }
    }
  }, [userPosition, targetLocation]);

  // Si les données nécessaires ne sont pas disponibles, ne rien afficher
  if (!userPosition || !targetLocation) {
    return null;
  }
  
  return (
    <>
      {/* Affichage du chemin uniquement si les coordonnées de carte sont disponibles */}
      {mapCoords && targetMapCoords && (
        <div className="absolute top-0 left-0 w-full h-full z-40">
          {/* Ligne simple entre les deux points */}
          <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
            <line 
              x1={mapCoords.x * scale} 
              y1={mapCoords.y * scale} 
              x2={targetMapCoords.x * scale} 
              y2={targetMapCoords.y * scale} 
              stroke="#3b82f6" 
              strokeWidth="4" 
              strokeDasharray="8,4" 
            />
            
            {/* Points de départ et d'arrivée */}
            <circle cx={mapCoords.x * scale} cy={mapCoords.y * scale} r="6" fill="#3b82f6" />
            <circle cx={targetMapCoords.x * scale} cy={targetMapCoords.y * scale} r="6" fill="#ef4444" />
          </svg>
          
          {/* Affichage de la distance au milieu de la ligne avec bouton pour arrêter la navigation */}
          <div 
            className="absolute bg-white/90 px-3 py-1.5 rounded text-sm font-medium text-blue-700 shadow-md flex items-center gap-2 cursor-pointer hover:bg-white/100 transition-colors"
            style={{
              left: `${((mapCoords.x + targetMapCoords.x) / 2) * scale}px`,
              top: `${((mapCoords.y + targetMapCoords.y) / 2) * scale}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={onClose}
          >
            <span>{navigationInfo.distance} m</span>
            <X className="w-3 h-3 text-gray-500" />
          </div>
        </div>
      )}
      
      {/* Panneau de navigation en bas de l'écran */}
      <div className="fixed bottom-20 left-0 right-0 z-50 p-4 bg-white/90 shadow-lg rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="font-semibold text-lg">{targetLocation.name}</h3>
          </div>
          <Button variant="destructive" size="sm" onClick={onClose} className="flex items-center gap-1">
            <X className="w-4 h-4" />
            Arrêter
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            <div>
              <p className="font-medium">
                {navigationInfo.isNearby ? "Vous êtes arrivé!" : `${navigationInfo.distance} mètres`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavigationGuideSimple;
