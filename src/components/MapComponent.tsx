import React, { useEffect, useRef, useState } from 'react';
import { createLogger } from "@/utils/logger";
import { Location } from "@/data/locations";
import { getImagePath } from "@/utils/imagePaths";
import { isOnline } from "@/utils/serviceWorkerRegistration";

// Créer un logger pour le composant Map
const logger = createLogger('MapComponent');

// Dimensions de référence pour la carte (utilisées pour calculer les ratios)
export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 600;

// Utilisation du type Location importé depuis data/locations.ts

export type MapComponentProps = {
  locations: Location[];
  activeLocation: string | null;
  highlightedLocation?: string | null; // Emplacement à mettre en évidence temporairement
  onClick?: (e: React.MouseEvent) => void;
  readOnly?: boolean;
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
  activeLocation,
  highlightedLocation = null,
  onClick,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // Facteur d'échelle pour les coordonnées
  
  // Effet pour appliquer des dimensions responsives au conteneur principal
  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        // Obtenir la largeur du conteneur parent
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        // Calculer le facteur d'échelle basé sur la largeur disponible
        const maxWidth = Math.min(parentWidth, MAP_WIDTH);
        const newScale = maxWidth / MAP_WIDTH;
        setScale(newScale);
        
        // Appliquer les dimensions mises à l'échelle
        containerRef.current.style.width = `${MAP_WIDTH * newScale}px`;
        containerRef.current.style.height = `${MAP_HEIGHT * newScale}px`;
        
        logger.info('MapComponent redimensionné', { 
          parentWidth, 
          maxWidth, 
          scale: newScale, 
          newWidth: MAP_WIDTH * newScale, 
          newHeight: MAP_HEIGHT * newScale 
        });
      }
    };
    
    // Appliquer immédiatement et écouter les redimensionnements
    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);
  
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
        {locations.map((location) => (
          <div 
            key={location.id}
            id={`location-${location.id}`}
            className="absolute"  
            style={{ 
              position: 'absolute',
              left: `${location.x * scale}px`, 
              top: `${location.y * scale}px`,
              zIndex: 20,
              width: `${60 * scale}px`, // Zone de clic mise à l'échelle
              height: `${60 * scale}px`,
              transform: 'translate(-50%, -50%)', // Centrer le point sur les coordonnées
              pointerEvents: !readOnly ? 'auto' : 'none'
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
    </div>
  );
};
