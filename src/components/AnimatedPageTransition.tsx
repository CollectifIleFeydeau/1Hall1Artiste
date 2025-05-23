import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// Define main routes in the same order as the navigation bar
const mainRoutes = [
  '/map',       // Carte
  '/program',   // Programme
  '/saved',     // Sauvegardés
  '/about',     // À propos
  '/donate',    // Dons
];

// Define different animation variants for transitions
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

// Map routes to transition types
const routeTransitionMap: Record<string, 'fade' | 'slide' | 'scale' | 'flip'> = {
  '/map': 'scale',
  '/program': 'slide',
  '/saved-events': 'slide',
  '/donate': 'fade',
  '/about': 'fade',
  '/admin': 'fade',
  '/location-history': 'flip'
};

// Define swipeable routes
const swipeableRoutes = [
  '/',
  '/map',
  '/program',
  '/saved',
  '/about',
  '/donate'
];

interface AnimatedPageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip';
  enableSwipe?: boolean;
}

export function AnimatedPageTransition({ 
  children, 
  transitionType,
  enableSwipe = false
}: AnimatedPageTransitionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [startX, setStartX] = useState<number | null>(null);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Determine the current route index for swipe navigation
  useEffect(() => {
    // Handle redirect from root to /map
    const path = location.pathname === '/' ? '/map' : location.pathname;
    const index = mainRoutes.indexOf(path);
    if (index !== -1) {
      setCurrentRouteIndex(index);
    }
  }, [location.pathname]);
  
  // Determine the transition type to use
  const getTransitionType = () => {
    if (transitionType) return transitionType;
    return routeTransitionMap[location.pathname] || 'fade';
  };
  
  const currentTransition = getTransitionType();
  const variant = transitionVariants[currentTransition];
  
  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipe || startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    const threshold = window.innerWidth * 0.2; // 20% of screen width

    // Determine swipe direction
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentRouteIndex > 0) {
        // Swipe right (previous page)
        setSwipeDirection('right');
        navigate(mainRoutes[currentRouteIndex - 1]);
      } else if (diffX < 0 && currentRouteIndex < mainRoutes.length - 1) {
        // Swipe left (next page)
        setSwipeDirection('left');
        navigate(mainRoutes[currentRouteIndex + 1]);
      }
    }

    setStartX(null);
  };
  
  // Swipe animation variants
  const swipeVariants = {
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
  
  // Use swipe variants if swipe is enabled, otherwise use regular transition variants
  const activeVariants = enableSwipe ? swipeVariants : {
    initial: variant.initial,
    animate: variant.animate,
    exit: variant.exit,
    transition: variant.transition
  };
  
  return (
    <motion.div
      className="animated-page-transition"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={activeVariants}
      custom={swipeDirection}
      key={location.pathname}
      style={{ 
        width: '100%', 
        height: '100%',
        overflowX: 'hidden',
        position: 'relative',
        touchAction: 'pan-y' // Allow vertical scrolling while capturing horizontal swipes
      }}
    >
      {children}
    </motion.div>
  );
}

// Helper function to check if a route is swipeable
export function isSwipeableRoute(pathname: string): boolean {
  return swipeableRoutes.includes(pathname);
}
