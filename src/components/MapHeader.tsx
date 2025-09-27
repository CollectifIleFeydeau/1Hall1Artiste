import React from 'react';

interface MapHeaderProps {
  visitedCount: number;
  totalCount: number;
  onLocationToggle?: () => void;
  onAmbianceToggle?: () => void;
  showLocationButton?: boolean;
  showAmbianceButton?: boolean;
}

export function MapHeader({ 
  visitedCount, 
  totalCount, 
  onLocationToggle,
  onAmbianceToggle,
  showLocationButton = true,
  showAmbianceButton = true
}: MapHeaderProps) {
  const toDiscoverCount = totalCount - visitedCount;

  return (
    <div className="w-full mb-4 px-4">
      {/* Titre de la page */}
      <h1 className="text-2xl font-bold text-[#1a2138] text-center mb-4 font-serif">
        Carte
      </h1>
      
      {/* Compteur de progression - Style maquette */}
      <div className="flex justify-center mb-4">
        <div 
          className="flex items-center overflow-hidden shadow-lg"
          style={{
            borderRadius: '25px',
            border: '2px solid rgba(139, 69, 19, 0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            minWidth: '240px'
          }}
        >
          {/* Section Visité (partie transparente) */}
          <div 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold flex-1 justify-center"
            style={{
              // background: 'rgba(245, 244, 240, 0.3)',
              // color: '#1a2138',
              fontFamily: 'serif'
            }}
          >
            <span className="text-base font-bold">{visitedCount}</span>
            <span className="whitespace-nowrap">Visité{visitedCount > 1 ? 's' : ''}</span>
          </div>

          {/* Séparateur */}
          <div className="w-px h-8 bg-amber-700/30"></div>

          {/* Section À découvrir (partie semi-transparente) */}
          <div 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-50 flex-1 justify-center"
            style={{
              background: 'rgba(139, 69, 19, 0.6)',
              fontFamily: 'serif'
            }}
          >
            <span className="text-base font-bold">{toDiscoverCount}</span>
            <span className="whitespace-nowrap">À découvrir</span>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-4">
        {showLocationButton && (
          <button
            onClick={onLocationToggle}
            className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f5f4f0 0%, #e8e6e0 100%)',
              color: '#1a2138',
              fontFamily: 'serif',
              border: '2px solid rgba(26, 33, 56, 0.2)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            Localisation
          </button>
        )}

        {showAmbianceButton && (
          <button
            onClick={onAmbianceToggle}
            className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f5f4f0 0%, #e8e6e0 100%)',
              color: '#1a2138',
              fontFamily: 'serif',
              border: '2px solid rgba(26, 33, 56, 0.2)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            Ambiance
          </button>
        )}
      </div>
    </div>
  );
}

