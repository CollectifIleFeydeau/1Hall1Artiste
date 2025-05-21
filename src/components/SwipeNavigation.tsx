import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';

// Définir les routes principales de l'application
const mainRoutes = [
  '/',          // Accueil
  '/program',   // Programme
  '/saved-events', // Sauvegardés
  '/donate',    // Dons
  '/about',     // À propos
];

// Propriétés du composant
interface SwipeNavigationProps {
  children: React.ReactNode;
}

export const SwipeNavigation = ({ children }: SwipeNavigationProps): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const [startX, setStartX] = useState<number | null>(null);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Déterminer l'index de la route actuelle
  useEffect(() => {
    const index = mainRoutes.indexOf(location.pathname);
    if (index !== -1) {
      setCurrentRouteIndex(index);
    }
  }, [location.pathname]);

  // Gestionnaires d'événements tactiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    const threshold = window.innerWidth * 0.2; // 20% de la largeur de l'écran

    // Déterminer la direction du swipe
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentRouteIndex > 0) {
        // Swipe vers la droite (page précédente)
        setDirection('right');
        navigate(mainRoutes[currentRouteIndex - 1]);
      } else if (diffX < 0 && currentRouteIndex < mainRoutes.length - 1) {
        // Swipe vers la gauche (page suivante)
        setDirection('left');
        navigate(mainRoutes[currentRouteIndex + 1]);
      }
    }

    setStartX(null);
  };

  // Variantes d'animation pour les transitions
  const pageVariants = {
    initial: (direction: 'left' | 'right' | null) => ({
      x: direction === 'right' ? '-100%' : direction === 'left' ? '100%' : 0,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <motion.div
      className="swipe-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      custom={direction}
      key={location.pathname}
      style={{ 
        width: '100%', 
        height: '100%',
        overflowX: 'hidden',
        position: 'relative',
        touchAction: 'pan-y' // Permet le scroll vertical tout en capturant les swipes horizontaux
      }}
    >
      {children}
    </motion.div>
  );
};
