import React, { useContext } from 'react';
type ReactNode = React.ReactNode;
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip';
}

// Définir différentes variantes d'animation pour les transitions
const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    transition: { duration: 0.4 }
  }
};

// Mapper les routes aux types de transition
const routeTransitionMap: Record<string, 'fade' | 'slide' | 'scale' | 'flip'> = {
  '/map': 'scale',
  '/program': 'slide',
  '/saved-events': 'slide',
  '/donate': 'fade',
  '/about': 'fade',
  '/admin': 'fade',
  '/location-history': 'flip'
};

export function PageTransition({ children, transitionType }: PageTransitionProps) {
  const location = useLocation();
  
  // Déterminer le type de transition à utiliser
  const getTransitionType = () => {
    if (transitionType) return transitionType;
    return routeTransitionMap[location.pathname] || 'fade';
  };
  
  const currentTransition = getTransitionType();
  const variant = transitionVariants[currentTransition];
  
  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={variant.transition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
