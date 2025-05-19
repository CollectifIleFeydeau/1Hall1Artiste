import React, { useEffect, useRef } from 'react';
import { createLogger } from "@/utils/logger";

// Créer un logger pour le composant Map
const logger = createLogger('MapComponent');

// Dimensions fixes pour la carte
export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 600;

interface MapComponentProps {
  locations: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    visited?: boolean;
  }>;
  activeLocation?: string | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readOnly?: boolean;
}

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
  onClick,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Effet pour appliquer des dimensions fixes au conteneur principal
  useEffect(() => {
    logger.info('MapComponent monté avec les dimensions fixes', { width: MAP_WIDTH, height: MAP_HEIGHT });
    
    // Empêcher le redimensionnement de la fenêtre de modifier les dimensions
    const handleResize = () => {
      if (containerRef.current) {
        // Forcer des dimensions absolues pour garantir la cohérence entre les sessions
        containerRef.current.style.width = `${MAP_WIDTH}px`;
        containerRef.current.style.height = `${MAP_HEIGHT}px`;
      }
    };
    
    // Appliquer immédiatement et écouter les redimensionnements
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
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
      className="relative border border-[#d8e3ff] rounded-lg bg-[#f0f5ff] mb-4 overflow-hidden"
      style={{ 
        width: `${MAP_WIDTH}px`, 
        height: `${MAP_HEIGHT}px`
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
        <img 
          src="/Plan Île Feydeau.png" 
          alt="Plan de l'Île Feydeau" 
          className="object-contain"
          style={{ 
            opacity: 0.9,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none' // Empêcher l'interaction avec l'image
          }}
        />
      </div>
      
      {/* Points sur la carte */}
      <div className="absolute inset-0 pointer-events-none">
        {locations.map((location) => (
          <div 
            key={location.id}
            id={`location-${location.id}`}
            className={`absolute w-6 h-6 rounded-full shadow-lg border-2 border-white
              ${activeLocation === location.id 
                ? 'bg-[#ff7a45] ring-2 ring-[#ff7a45] ring-opacity-70 scale-110' 
                : location.visited 
                  ? 'bg-[#4CAF50]' // Couleur verte pour les lieux visités
                  : 'bg-[#4a5d94]'}
            `}
            style={{ 
              position: 'absolute',
              left: `${location.x}px`, 
              top: `${location.y}px`,
              zIndex: 20,
              width: '24px',
              height: '24px',
              transform: 'translate(-50%, -50%)', // Centrer le point sur les coordonnées
              pointerEvents: !readOnly ? 'auto' : 'none'
            }}
            onClick={!readOnly ? (e) => {
              e.stopPropagation();
              if (onClick) onClick(e);
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
};
