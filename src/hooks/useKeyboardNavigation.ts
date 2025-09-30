import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onClose?: () => void;
  enabled?: boolean;
}

/**
 * Hook pour gérer la navigation au clavier
 * Écoute les touches fléchées et Escape
 * 
 * @param onPrevious - Fonction appelée sur flèche gauche
 * @param onNext - Fonction appelée sur flèche droite
 * @param onClose - Fonction appelée sur Escape (optionnel)
 * @param enabled - Active/désactive la navigation clavier (défaut: true)
 * 
 * @example
 * ```tsx
 * useKeyboardNavigation({
 *   onPrevious: () => goToPrevious(),
 *   onNext: () => goToNext(),
 *   onClose: () => closeModal(),
 *   enabled: isModalOpen
 * });
 * ```
 */
export const useKeyboardNavigation = ({
  onPrevious,
  onNext,
  onClose,
  enabled = true
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'Escape':
          if (onClose) {
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onPrevious, onNext, onClose]);
};
