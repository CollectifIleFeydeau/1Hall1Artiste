import React from 'react';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface SwipeIndicatorProps {
  currentIndex: number;
  totalCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  showArrows?: boolean;
  showDots?: boolean;
  showCounter?: boolean;
  className?: string;
}

/**
 * Composant d'indicateur de navigation par swipe
 * Affiche des flèches, un compteur et/ou des dots de pagination
 * 
 * @example
 * ```tsx
 * <SwipeIndicator
 *   currentIndex={2}
 *   totalCount={10}
 *   canGoPrevious={true}
 *   canGoNext={true}
 *   onPrevious={() => goToPrevious()}
 *   onNext={() => goToNext()}
 *   showArrows={true}
 *   showCounter={true}
 * />
 * ```
 */
export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  currentIndex,
  totalCount,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  showArrows = true,
  showDots = false,
  showCounter = true,
  className = ''
}) => {
  // Ne rien afficher si un seul item
  if (totalCount <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Ligne principale : Flèches + Compteur */}
      <div className="flex items-center justify-center gap-3">
        {/* Flèche gauche */}
        {showArrows && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            disabled={!canGoPrevious}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Fiche précédente"
            title="Fiche précédente"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
        )}

        {/* Compteur */}
        {showCounter && (
          <div className="px-3 py-1 bg-white rounded-full shadow-md">
            <span className="text-sm font-semibold text-gray-700">
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
        )}

        {/* Flèche droite */}
        {showArrows && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={!canGoNext}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Fiche suivante"
            title="Fiche suivante"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        )}
      </div>

      {/* Dots de pagination (optionnel) */}
      {showDots && totalCount <= 10 && (
        <div className="flex gap-1.5">
          {Array.from({ length: totalCount }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-amber-500 w-4' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
