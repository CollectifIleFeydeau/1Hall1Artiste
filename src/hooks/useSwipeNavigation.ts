import { useState, useRef, useCallback } from 'react';

interface UseSwipeNavigationProps<T> {
  items: T[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  threshold?: number;
  enabled?: boolean;
}

interface UseSwipeNavigationReturn {
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  canGoNext: boolean;
  canGoPrevious: boolean;
  goNext: () => void;
  goPrevious: () => void;
  currentIndex: number;
  totalCount: number;
  isSwiping: boolean;
}

/**
 * Hook personnalisé pour gérer la navigation par swipe entre des items
 * 
 * @template T - Type des items à parcourir
 * @param items - Liste des items à naviguer
 * @param currentIndex - Index actuel
 * @param onIndexChange - Callback appelé lors du changement d'index
 * @param threshold - Seuil de déclenchement du swipe en pixels (défaut: 50)
 * @param enabled - Active/désactive le swipe (défaut: true)
 * 
 * @example
 * ```tsx
 * const swipe = useSwipeNavigation({
 *   items: locations,
 *   currentIndex: selectedIndex,
 *   onIndexChange: setSelectedIndex,
 *   threshold: 50,
 *   enabled: true
 * });
 * 
 * <div {...swipe.handlers}>
 *   {/* Contenu swipeable *\/}
 * </div>
 * ```
 */
export const useSwipeNavigation = <T>({
  items,
  currentIndex,
  onIndexChange,
  threshold = 50,
  enabled = true
}: UseSwipeNavigationProps<T>): UseSwipeNavigationReturn => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const canGoNext = currentIndex < items.length - 1;
  const canGoPrevious = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      onIndexChange(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, onIndexChange]);

  const goPrevious = useCallback(() => {
    if (canGoPrevious) {
      onIndexChange(currentIndex - 1);
    }
  }, [canGoPrevious, currentIndex, onIndexChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Initialiser à la même position
    setIsSwiping(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !isSwiping) return;
    touchEndX.current = e.touches[0].clientX;
  }, [enabled, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isSwiping) return;
    
    const diff = touchStartX.current - touchEndX.current;
    
    // Vérifier qu'il y a eu un mouvement réel (pas juste un clic)
    // ET que le swipe dépasse le seuil
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left → next
        goNext();
      } else {
        // Swipe right → previous
        goPrevious();
      }
    }
    
    // Reset
    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [enabled, isSwiping, threshold, goNext, goPrevious]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    currentIndex,
    totalCount: items.length,
    isSwiping
  };
};
