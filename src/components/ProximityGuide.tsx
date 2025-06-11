import React, { useEffect, useState } from 'react';
import { createLogger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Location } from "@/data/locations";
import { GeoPosition } from "./UserLocation";
import { gpsToMapCoordinatesAffine as gpsToMapCoordinates } from "@/utils/gpsConverter";
import { getGpsCoordinateById, FEYDEAU_CENTER } from "@/data/gpsCoordinates";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

// Créer un logger pour le composant
const logger = createLogger('ProximityGuide');

// Distance maximale en mètres pour considérer qu'un lieu est "à proximité"
const PROXIMITY_THRESHOLD = 50;

export type ProximityGuideProps = {
  userPosition: GeoPosition | null;
  locations: Location[];
  onSelectLocation: (locationId: string) => void;
  visitedLocations: Set<string>;
};

// Fonction pour calculer la distance en mètres entre deux points GPS
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Rayon de la Terre en mètres
  const R = 6371000;
  
  // Conversion des degrés en radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  // Formule haversine
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance en mètres
  return R * c;
};

// Fonction pour obtenir la direction (en texte) entre deux points
const getDirection = (
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number
): string => {
  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  
  // Calculer l'angle en degrés (0° = Nord, 90° = Est, etc.)
  let angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  
  // Convertir l'angle en direction cardinale
  if (angle >= 337.5 || angle < 22.5) return "nord";
  if (angle >= 22.5 && angle < 67.5) return "nord-est";
  if (angle >= 67.5 && angle < 112.5) return "est";
  if (angle >= 112.5 && angle < 157.5) return "sud-est";
  if (angle >= 157.5 && angle < 202.5) return "sud";
  if (angle >= 202.5 && angle < 247.5) return "sud-ouest";
  if (angle >= 247.5 && angle < 292.5) return "ouest";
  return "nord-ouest";
};

// Type pour les lieux avec leur distance par rapport à l'utilisateur
type LocationWithDistance = Location & {
  distance: number;
  direction: string;
};

/**
 * Composant qui guide l'utilisateur vers les points d'intérêt à proximité
 */
const ProximityGuide: React.FC<ProximityGuideProps> = ({
  userPosition,
  locations,
  onSelectLocation,
  visitedLocations
}) => {
  const [nearbyLocations, setNearbyLocations] = useState<LocationWithDistance[]>([]);
  const [expanded, setExpanded] = useState(false);
  
  // Calculer les lieux à proximité lorsque la position de l'utilisateur change
  useEffect(() => {
    if (!userPosition) return;
    
    // Calculer la distance pour chaque lieu
    const locationsWithDistance = locations.map(location => {
      // Obtenir les coordonnées GPS précises du lieu ou utiliser une approximation
      const gpsCoord = getGpsCoordinateById(location.id);
      const locationLat = gpsCoord ? gpsCoord.latitude : FEYDEAU_CENTER.latitude;
      const locationLng = gpsCoord ? gpsCoord.longitude : FEYDEAU_CENTER.longitude;
      
      const distance = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        locationLat,
        locationLng
      );
      
      const direction = getDirection(
        userPosition.latitude,
        userPosition.longitude,
        locationLat,
        locationLng
      );
      
      return {
        ...location,
        distance,
        direction
      };
    });
    
    // Trier par distance et filtrer les plus proches
    const sorted = locationsWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Prendre les 5 plus proches
    setNearbyLocations(sorted.slice(0, 5));
    
    logger.info('Lieux à proximité calculés', { 
      userPosition, 
      nearbyCount: sorted.length 
    });
  }, [userPosition, locations]);
  
  if (!userPosition || nearbyLocations.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 mb-2">
      <div className="bg-white rounded-lg shadow-lg border border-[#d8e3ff] overflow-hidden">
        <div 
          className="p-3 bg-[#f0f5ff] flex justify-between items-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            <Navigation className="h-4 w-4 mr-2 text-[#4a5d94]" />
            <span className="font-medium text-[#1a2138]">
              {expanded ? "Lieux à proximité" : `${nearbyLocations.length} lieux à proximité`}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <span className="text-[#4a5d94]">
              {expanded ? "−" : "+"}
            </span>
          </Button>
        </div>
        
        {expanded && (
          <div className="p-3 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {nearbyLocations.map((location) => {
                const isNearby = location.distance < PROXIMITY_THRESHOLD;
                const isVisited = visitedLocations.has(location.id);
                
                return (
                  <div 
                    key={location.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors
                      ${isNearby 
                        ? 'bg-[#e6f7ff] hover:bg-[#d1efff]' 
                        : 'bg-[#f5f5f5] hover:bg-[#e9e9e9]'
                      }
                      ${isVisited ? 'border-l-4 border-[#4CAF50]' : ''}
                    `}
                    onClick={() => onSelectLocation(location.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {isVisited && (
                            <CheckCircle className="h-3 w-3 mr-1 text-[#4CAF50]" />
                          )}
                          <span className="font-medium text-sm text-[#1a2138]">
                            {location.name}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
                          <span className="text-xs text-[#8c9db5]">
                            {isNearby 
                              ? `Vous y êtes ! (${Math.round(location.distance)}m)`
                              : `${Math.round(location.distance)}m au ${location.direction}`
                            }
                          </span>
                        </div>
                      </div>
                      <Navigation 
                        className={`h-5 w-5 ${isNearby ? 'text-[#4CAF50]' : 'text-[#4a5d94]'}`} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximityGuide;
