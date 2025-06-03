import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook qui retourne les dimensions actuelles de la fenêtre
 * et se met à jour automatiquement lors du redimensionnement
 */
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Gestionnaire pour mettre à jour les dimensions lors du redimensionnement
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('resize', handleResize);
    
    // Appeler le gestionnaire immédiatement pour définir les dimensions initiales
    handleResize();
    
    // Nettoyer l'écouteur d'événement lors du démontage
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
