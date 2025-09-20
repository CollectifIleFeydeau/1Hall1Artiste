import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number; // Distance en px pour déclencher le refresh
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 80
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Gestion tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    setStartY(e.touches[0].clientY);
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    // Résistance progressive
    const resistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(resistance);
    
    // Empêcher le scroll si on tire vers le bas
    if (distance > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling || disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Gestion souris (pour desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    setStartY(e.clientY);
    setIsPulling(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }
    
    const distance = Math.max(0, e.clientY - startY);
    const resistance = Math.min(distance * 0.3, threshold * 1.5);
    setPullDistance(resistance);
  };

  const handleMouseUp = () => {
    if (!isPulling || disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Nettoyage des événements souris globaux
  useEffect(() => {
    let isCleanedUp = false;
    
    if (isPulling) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isCleanedUp || !isPulling) return;
        const distance = Math.max(0, e.clientY - startY);
        const resistance = Math.min(distance * 0.3, threshold * 1.5);
        setPullDistance(resistance);
      };

      const handleGlobalMouseUp = () => {
        if (isCleanedUp) return;
        if (pullDistance >= threshold) {
          handleRefresh();
        } else {
          setPullDistance(0);
          setIsPulling(false);
        }
      };

      try {
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
      } catch (error) {
        console.warn('[PullToRefresh] Error adding global event listeners:', error);
      }

      return () => {
        isCleanedUp = true;
        try {
          document.removeEventListener('mousemove', handleGlobalMouseMove);
          document.removeEventListener('mouseup', handleGlobalMouseUp);
        } catch (error) {
          console.warn('[PullToRefresh] Error removing global event listeners:', error);
        }
      };
    }
  }, [isPulling, startY, pullDistance, threshold]);

  const shouldTrigger = pullDistance >= threshold;
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Indicateur de pull-to-refresh */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4"
            style={{
              transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`
            }}
          >
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <RefreshCw 
                className={`transition-all duration-200 ${
                  isRefreshing ? 'animate-spin' : ''
                } ${shouldTrigger ? 'text-green-500' : 'text-slate-500'}`}
                size={16}
                style={{
                  transform: `rotate(${progress * 180}deg)`
                }}
              />
              <span className={`text-sm font-medium transition-colors ${
                shouldTrigger ? 'text-green-500' : 'text-slate-500'
              }`}>
                {isRefreshing 
                  ? 'Actualisation...' 
                  : shouldTrigger 
                    ? 'Relâcher pour actualiser' 
                    : 'Tirer pour actualiser'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu */}
      <div className="min-h-full">
        {children}
      </div>
    </div>
  );
};
