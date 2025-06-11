import React, { useEffect, useRef, useState } from 'react';
import { createLogger } from "@/utils/logger";
import { Location } from "@/data/locations";
import { getImagePath } from "@/utils/imagePaths";
import { isOnline } from "@/utils/serviceWorkerRegistration";
import UserLocation, { UserLocationProps } from "./UserLocation";

// Créer un logger pour le composant Map avec filtrage
const originalLogger = createLogger('MapComponent');
// Wrapper pour filtrer les logs indésirables
const logger = {
  info: (message: string, data?: any) => {
    // Filtrer les logs de redimensionnement
    if (message.includes('redimensionné')) {
      return;
    }
    return originalLogger.info(message, data);
  },
  warn: originalLogger.warn,
  error: originalLogger.error,
  debug: originalLogger.debug
};

// Dimensions de référence pour la carte (utilisées pour calculer les ratios)
export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 600;

// Utilisation du type Location importé depuis data/locations.ts

import NavigationGuideSimple from "./NavigationGuideSimple";
import { GeoPosition } from "./UserLocation";

export interface MapComponentProps {
  locations: Location[];
  visitedLocations?: string[];
  onLocationClick?: (locationId: string) => void;
  highlightedLocation?: string | null;
  testPoint?: { x: number; y: number };
  testPointAffine?: { x: number; y: number };
  activeLocation?: string | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readOnly?: boolean;
  onScaleChange?: (scale: number) => void;
  userLocationProps?: Omit<UserLocationProps, 'scale'>;
  navigationProps?: {
    userPosition: GeoPosition | null;
    targetLocation: Location | null;
    onClose: () => void;
  };
};

/**
 * Composant de carte
 * 
 * Affiche une carte interactive avec des points représentant les lieux.
 * Les dimensions de la carte sont fixes pour assurer la cohérence des coordonnées.
 * Les coordonnées des points sont définies directement dans le fichier de données.
 */
export const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  visitedLocations = [],
  onLocationClick,
  highlightedLocation = null,
  testPoint,
  testPointAffine,
  activeLocation = null,
  onClick,
  readOnly = false,
  onScaleChange,
  userLocationProps,
  navigationProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // Facteur d'échelle pour les coordonnées
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [userMapCoords, setUserMapCoords] = useState<{ x: number, y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Effet pour appliquer des dimensions responsives au conteneur principal
  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        // Obtenir la largeur du conteneur parent
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        // Calculer le facteur d'échelle basé sur la largeur disponible
        const maxWidth = Math.min(parentWidth, MAP_WIDTH);
        const newScale = maxWidth / MAP_WIDTH;
        
        // Mettre à jour l'état local
        setScale(newScale);
        
        // Notifier le parent du changement d'échelle
        if (onScaleChange) {
          onScaleChange(newScale);
        }
        
        // Appliquer les dimensions mises à l'échelle
        containerRef.current.style.width = `${MAP_WIDTH * newScale}px`;
        containerRef.current.style.height = `${MAP_HEIGHT * newScale}px`;
        
        // Appliquer une transformation d'échelle directe au conteneur
        // containerRef.current.style.transform = `scale(${newScale})`;
        // containerRef.current.style.transformOrigin = 'top left';
        
        // Journaliser seulement 10% des redimensionnements pour réduire le bruit dans la console
        // if (Math.random() < 0.1) {
        //   logger.info('MapComponent redimensionné', { 
        //     parentWidth, 
        //     maxWidth, 
        //     scale: newScale, 
        //     newWidth: MAP_WIDTH * newScale, 
        //     newHeight: MAP_HEIGHT * newScale 
        //   });
        // }
      }
    };
    
    // Appliquer immédiatement et écouter les redimensionnements
    calculateScale();
    
    // Utiliser un délai pour s'assurer que le redimensionnement est terminé
    const debouncedResize = debounce(calculateScale, 100);
    window.addEventListener('resize', debouncedResize);
    
    // Fonction de debounce pour limiter les appels fréquents
    function debounce(fn: Function, delay: number) {
      let timer: number | null = null;
      return function() {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          fn();
          timer = null;
        }, delay);
      };
    }
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [onScaleChange]); // Ajouter onScaleChange comme dépendance
  
  // Log des coordonnées des points au chargement
  useEffect(() => {
    if (locations && locations.length > 0) {
      logger.info('Coordonnées des points sur la carte', {
        activeLocationId: activeLocation || 'aucun',
        points: locations.map(loc => ({
          id: loc.id,
          name: loc.name,
          x: loc.x,
          y: loc.y
        }))
      });
    }
  }, [locations, activeLocation]);
  
  return (
    <div 
      ref={containerRef}
      className="relative border border-[#d8e3ff] rounded-lg bg-[#f0f5ff] mb-4 overflow-hidden mx-auto"
      style={{ 
        width: `${MAP_WIDTH * scale}px`, 
        height: `${MAP_HEIGHT * scale}px`
      }}
    >
      {/* Fond de carte avec image */}
      <div 
        className="absolute inset-0 bg-white flex items-center justify-center"
        onClick={!readOnly ? onClick : undefined}
        style={{ 
          cursor: !readOnly ? 'pointer' : 'default'
        }}
      >
        {/* Utiliser une div avec background-image comme solution de secours */}
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${getImagePath('/map-feydeau.png')})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            opacity: 0.9,
            pointerEvents: 'none' // Empêcher l'interaction avec l'image
          }}
        >
          {/* Image cachée pour détecter les erreurs de chargement */}
          <img 
            src={getImagePath('/map-feydeau.png')} 
            alt="Plan de l'Île Feydeau" 
            className="hidden"
            onError={(e) => {
              logger.error('Erreur de chargement de l\'image de la carte', { online: isOnline() });
              // L'image d'arrière-plan sera toujours visible même si cette image échoue
            }}
          />
        </div>
      </div>
      
      {/* Points sur la carte */}
      <div className="absolute inset-0">
        {/* Point de test pour la méthode de triangulation */}
        {testPoint && (
          <div
            className="absolute"
            style={{
              position: 'absolute',
              left: `${testPoint.x * scale}px`,
              top: `${testPoint.y * scale}px`,
              zIndex: 30,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="rounded-full shadow-lg border-2 border-white bg-[#ff0000]/90"
              style={{
                width: `${24 * scale}px`,
                height: `${24 * scale}px`
              }}
            />
          </div>
        )}
        
        {/* Point de test pour la méthode affine */}
        {testPointAffine && (
          <div
            className="absolute"
            style={{
              position: 'absolute',
              left: `${testPointAffine.x * scale}px`,
              top: `${testPointAffine.y * scale}px`,
              zIndex: 30,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="rounded-full shadow-lg border-2 border-white bg-[#0000ff]/90"
              style={{
                width: `${24 * scale}px`,
                height: `${24 * scale}px`
              }}
            />
          </div>
        )}
        
        {locations.map((location) => (
          <div 
            key={location.id}
            id={`location-${location.id}`}
            data-location-id={location.id}
            className="absolute"  
            style={{ 
              position: 'absolute',
              left: `${location.x * scale}px`, 
              top: `${location.y * scale}px`,
              zIndex: 20,
              width: `${60 * scale}px`, // Zone de clic mise à l'échelle
              height: `${60 * scale}px`,
              transform: 'translate(-50%, -50%)', // Centrer le point sur les coordonnées
              pointerEvents: !readOnly ? 'auto' : 'none',
              cursor: !readOnly ? 'pointer' : 'default'
            }}
            onClick={!readOnly ? (e) => {
              e.stopPropagation();
              if (onClick) onClick(e);
            } : undefined}
          >
            {/* Point visible */}
            <div
              className={`absolute top-1/2 left-1/2 w-8 h-8 rounded-full shadow-lg border-2 border-white
                ${activeLocation === location.id 
                  ? 'bg-[#ff7a45]/90 ring-2 ring-[#ff7a45] ring-opacity-70 scale-110' 
                  : highlightedLocation === location.id
                    ? visitedLocations?.includes(location.id) 
                      ? 'bg-[#4CAF50]/90 ring-4 ring-green-400 ring-opacity-80' 
                      : 'bg-[#ff7a45]/90 ring-4 ring-yellow-400 ring-opacity-80'
                    : location.hasProgram === false
                      ? 'bg-[#757575]/90' // Gris pour les lieux sans programmation
                      : visitedLocations?.includes(location.id) 
                        ? 'bg-[#4CAF50]/90' 
                        : 'bg-[#4a5d94]/90'
                }`}
              style={{
                transform: 'translate(-50%, -50%)',
                width: `${32 * scale}px`,
                height: `${32 * scale}px`
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Composant de localisation utilisateur (conditionnel) */}
      {userLocationProps && (
        <UserLocation 
          {...userLocationProps}
          scale={scale}
          onLocationUpdate={(x, y, gpsPosition) => {
            setUserMapCoords({x, y});
            if (userLocationProps.onLocationUpdate) {
              userLocationProps.onLocationUpdate(x, y, gpsPosition);
            }
          }}
        />
      )}
      
      {/* Composant de navigation simplifié (conditionnel) */}
      {navigationProps && userLocationProps && (
        <NavigationGuideSimple 
          {...navigationProps}
          mapCoords={userMapCoords}
          targetMapCoords={navigationProps.targetLocation ? {
            x: navigationProps.targetLocation.x,
            y: navigationProps.targetLocation.y
          } : null}
          scale={scale}
        />
      )}
    </div>
  );
};
