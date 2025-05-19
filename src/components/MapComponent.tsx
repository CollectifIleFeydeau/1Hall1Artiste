import React, { useEffect, useState, useRef } from 'react';
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
  }>;
  activeLocation?: string | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readOnly?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  activeLocation,
  onClick,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    logger.info('MapComponent monté avec les dimensions fixes', { width: MAP_WIDTH, height: MAP_HEIGHT });
    
    // Empêcher le redimensionnement de la fenêtre de modifier les dimensions
    const handleResize = () => {
      if (containerRef.current) {
        // Forcer les dimensions fixes même en cas de redimensionnement
        containerRef.current.style.width = `${MAP_WIDTH}px`;
        containerRef.current.style.height = `${MAP_HEIGHT}px`;
        logger.info('Dimensions forcées après redimensionnement', { width: MAP_WIDTH, height: MAP_HEIGHT });
      }
    };
    
    // Appliquer immédiatement et écouter les redimensionnements
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative border border-[#d8e3ff] rounded-lg bg-[#f0f5ff] mb-4 overflow-hidden"
      style={{ 
        width: MAP_WIDTH, 
        height: MAP_HEIGHT,
        minWidth: MAP_WIDTH,
        minHeight: MAP_HEIGHT,
        maxWidth: MAP_WIDTH,
        maxHeight: MAP_HEIGHT
      }}
    >
      {/* Map background with image */}
      <div 
        className="absolute inset-0 bg-white flex items-center justify-center"
        onClick={!readOnly ? onClick : undefined}
        style={{ 
          cursor: !readOnly ? 'pointer' : 'default',
          width: MAP_WIDTH,
          height: MAP_HEIGHT
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
          onLoad={(e) => {
            // Log des dimensions réelles de l'image
            logger.info('Dimensions de l\'image dans MapComponent', {
              width: e.currentTarget.width,
              height: e.currentTarget.height,
              naturalWidth: e.currentTarget.naturalWidth,
              naturalHeight: e.currentTarget.naturalHeight,
              containerWidth: MAP_WIDTH,
              containerHeight: MAP_HEIGHT
            });
          }}
        />
      </div>
      
      {/* Map locations overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          width: MAP_WIDTH,
          height: MAP_HEIGHT
        }}
      >
        <div 
          className="relative"
          style={{ 
            width: MAP_WIDTH,
            height: MAP_HEIGHT
          }}
        >
          {locations.map((location) => (
            <div 
              key={location.id}
              id={`location-${location.id}`}
              className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg border-2 border-white
                ${activeLocation === location.id ? 'bg-[#ff7a45] ring-2 ring-[#ff7a45] ring-opacity-70 scale-110' : 'bg-[#4a5d94]'}
              `}
              style={{ 
                position: 'absolute',
                left: `${location.x}px`, 
                top: `${location.y}px`,
                zIndex: 20,
                pointerEvents: !readOnly ? 'auto' : 'none' // Permettre l'interaction avec les points si non readOnly
              }}
              onClick={!readOnly ? (e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
              } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
