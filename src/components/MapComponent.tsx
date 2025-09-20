import React, { useEffect, useRef, useState } from 'react';
import { createLogger } from "@/utils/logger";
import { Location } from "@/data/locations";
import { getImagePath } from "@/utils/imagePaths";
import { isOnline } from "@/utils/serviceWorkerRegistration";
import UserLocation, { UserLocationProps } from "./UserLocation";
import { toast } from "@/components/ui/use-toast";

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
  // Optional pan/drag callbacks (for analytics)
  onPanStart?: (info: { x: number; y: number }) => void;
  onPan?: (info: { dx: number; dy: number; x: number; y: number }) => void;
  onPanEnd?: (info: { totalDx: number; totalDy: number; distance: number; durationMs: number }) => void;
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
  navigationProps,
  onPanStart,
  onPan,
  onPanEnd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // Facteur d'échelle pour les coordonnées
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [userMapCoords, setUserMapCoords] = useState<{ x: number, y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // Drag state (client coordinates)
  const dragStartClient = useRef<{ x: number; y: number } | null>(null);
  const lastClient = useRef<{ x: number; y: number } | null>(null);
  const dragTotals = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const dragStartTime = useRef<number>(0);

  // Référence pour suivre si un avertissement de limite de carte a été affiché
  const outOfBoundsWarningShownRef = useRef(false);

  // Effet pour appliquer des dimensions responsives au conteneur principal
  useEffect(() => {
    let isCleanedUp = false;
    
    const calculateScale = () => {
      try {
        if (isCleanedUp || !containerRef.current) {
          return;
        }
        
        // Vérification robuste de l'existence du parent
        const parent = containerRef.current.parentElement;
        if (!parent) {
          return;
        }
        
        // Obtenir la largeur du conteneur parent
        const parentWidth = parent.clientWidth || window.innerWidth;
        // Calculer le facteur d'échelle basé sur la largeur disponible
        const maxWidth = Math.min(parentWidth, MAP_WIDTH);
        const newScale = maxWidth / MAP_WIDTH;
        
        // Vérifier que le composant n'a pas été démonté
        if (isCleanedUp) return;
        
        // Mettre à jour l'état local
        setScale(newScale);
        
        // Notifier le parent du changement d'échelle
        if (onScaleChange && !isCleanedUp) {
          onScaleChange(newScale);
        }
        
        // Appliquer les dimensions mises à l'échelle avec vérification
        if (!isCleanedUp && containerRef.current && containerRef.current.parentElement) {
          containerRef.current.style.width = `${MAP_WIDTH * newScale}px`;
          containerRef.current.style.height = `${MAP_HEIGHT * newScale}px`;
        }
        
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
      } catch (error) {
        console.warn('[MapComponent] Error in calculateScale:', error);
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
      isCleanedUp = true;
      try {
        window.removeEventListener('resize', debouncedResize);
      } catch (error) {
        console.warn('[MapComponent] Error cleaning up resize listener:', error);
      }
    };
  }, [onScaleChange]); // Ajouter onScaleChange comme dépendance

  // Mouse drag handlers (basic analytics support without visual panning)
  useEffect(() => {
    if (readOnly) return;
    
    let isCleanedUp = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (isCleanedUp || !isDragging || !dragStartClient.current) return;
      const current = { x: e.clientX, y: e.clientY };
      if (!lastClient.current) {
        lastClient.current = current;
        return;
      }
      const dx = current.x - lastClient.current.x;
      const dy = current.y - lastClient.current.y;
      dragTotals.current.dx += dx;
      dragTotals.current.dy += dy;
      lastClient.current = current;
      if (onPan) {
        onPan({ dx, dy, x: current.x, y: current.y });
      }
    };
    const handleMouseUp = () => {
      if (isCleanedUp || !isDragging) return;
      setIsDragging(false);
      const durationMs = Date.now() - dragStartTime.current;
      const { dx, dy } = dragTotals.current;
      const distance = Math.hypot(dx, dy);
      // Reset refs
      dragStartClient.current = null;
      lastClient.current = null;
      dragTotals.current = { dx: 0, dy: 0 };
      if (onPanEnd) {
        onPanEnd({ totalDx: dx, totalDy: dy, distance, durationMs });
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    const startDrag = (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragStartClient.current = { x: clientX, y: clientY };
      lastClient.current = { x: clientX, y: clientY };
      dragTotals.current = { dx: 0, dy: 0 };
      dragStartTime.current = Date.now();
      if (onPanStart) onPanStart({ x: clientX, y: clientY });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };
    const el = containerRef.current;
    if (!el || isCleanedUp) return;
    
    const onMouseDown = (e: MouseEvent) => {
      // Ignore if primary button not pressed or component is being cleaned up
      if (e.button !== 0 || isCleanedUp) return;
      
      // Vérifier que l'élément existe toujours dans le DOM
      if (!el.parentElement || !document.contains(el)) {
        return;
      }
      
      startDrag(e.clientX, e.clientY);
    };
    
    try {
      el.addEventListener('mousedown', onMouseDown);
    } catch (error) {
      console.warn('[MapComponent] Error adding mousedown listener:', error);
      return () => {};
    }
    
    return () => {
      isCleanedUp = true;
      try {
        // Vérifier que l'élément existe encore avant de retirer les listeners
        if (el && el.removeEventListener && document.contains(el)) {
          el.removeEventListener('mousedown', onMouseDown);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      } catch (error) {
        console.warn('[MapComponent] Error cleaning up event listeners:', error);
      }
    };
  }, [isDragging, readOnly, onPanStart, onPan, onPanEnd]);
  
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
  
  // Protection contre les erreurs de rendu
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Récupérer les erreurs de rendu React
  useEffect(() => {
    const handleError = (error: Error) => {
      if (error.message && (error.message.includes('removeChild') || error.message.includes('insertBefore'))) {
        console.warn('[MapComponent] Render error caught:', error.message);
        setRenderError('Erreur de rendu de la carte');
        // Auto-recovery après 1 seconde
        setTimeout(() => {
          setRenderError(null);
        }, 1000);
      }
    };
    
    // Pas d'event listener global ici, la gestion se fait au niveau parent
    return () => {};
  }, []);
  
  // Si erreur de rendu, afficher un fallback
  if (renderError) {
    return (
      <div 
        className="relative border border-[#d8e3ff] rounded-lg bg-[#f0f5ff] mb-4 overflow-hidden mx-auto flex items-center justify-center"
        style={{ 
          width: `${MAP_WIDTH * scale}px`, 
          height: `${MAP_HEIGHT * scale}px`
        }}
      >
        <div className="text-center text-[#4a5d94]">
          <p className="text-sm mb-2">{renderError}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4a5d94] mx-auto"></div>
        </div>
      </div>
    );
  }
  
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
                    ? location.visited 
                      ? 'bg-[#4CAF50]/90 ring-4 ring-green-400 ring-opacity-80' 
                      : 'bg-[#ff7a45]/90 ring-4 ring-yellow-400 ring-opacity-80'
                    : location.hasProgram === false
                      ? 'bg-[#757575]/90' // Gris pour les lieux sans programmation
                      : location.visited 
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
