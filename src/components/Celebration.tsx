import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';

interface CelebrationProps {
  trigger: boolean;
  duration?: number;
  message?: string;
  onComplete?: () => void;
}

/**
 * Composant de célébration qui affiche des confettis et un message
 * @param trigger - Déclenche l'animation lorsque true
 * @param duration - Durée de l'animation en millisecondes (défaut: 3000ms)
 * @param message - Message à afficher pendant la célébration
 * @param onComplete - Fonction appelée à la fin de l'animation
 */
export const Celebration: React.FC<CelebrationProps> = ({
  trigger,
  duration = 3000,
  message,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  const { width, height } = useWindowSize();
  
  // Utiliser les dimensions de la fenêtre ou des valeurs par défaut pour mobile
  const confettiWidth = width || window.innerWidth || document.documentElement.clientWidth || 375;
  const confettiHeight = height || window.innerHeight || document.documentElement.clientHeight || 667;

  useEffect(() => {
    if (trigger) {
      console.log('Celebration triggered with message:', message);
      setIsActive(true);
      
      // Désactiver après la durée spécifiée
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, duration, message, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Confetti
        width={confettiWidth}
        height={confettiHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
        tweenDuration={5000}
      />
      
      {message && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 px-6 py-3 rounded-lg shadow-lg text-center">
          <p className="text-lg font-bold text-[#4a5d94]">{message}</p>
        </div>
      )}
    </div>
  );
};

export default Celebration;

