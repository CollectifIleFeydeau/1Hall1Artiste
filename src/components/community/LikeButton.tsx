import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  entryId: string;
  className?: string;
  variant?: 'compact' | 'full' | 'icon';
  showCount?: boolean;
}

// Composant pour animer le changement de nombre
const AnimatedCounter: React.FC<{ value: number; loading: boolean }> = ({ value, loading }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue && !loading) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayValue(value);
        setTimeout(() => setIsAnimating(false), 150);
      }, 150);
    }
  }, [value, displayValue, loading]);

  if (loading) return <span>...</span>;

  return (
    <motion.span
      key={displayValue}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "font-medium transition-colors",
        isAnimating && "text-green-400"
      )}
    >
      {displayValue}
    </motion.span>
  );
};

// Composant pour le feedback visuel
const FeedbackIcon: React.FC<{ isToggling: boolean; error: string | null; liked: boolean }> = ({ 
  isToggling, 
  error, 
  liked 
}) => {
  if (isToggling) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
      />
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
      >
        <span className="text-white text-xs">!</span>
      </motion.div>
    );
  }

  return null;
};

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  entryId, 
  className,
  variant = 'compact',
  showCount = true
}) => {
  const { liked, total, loading, error, isToggling, toggleLike } = useLikes(entryId);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture du modal
    e.preventDefault(); // Empêcher le comportement par défaut
    if (!loading && !isToggling) {
      toggleLike();
      // Afficher un feedback de succès temporaire
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    }
  };

  if (variant === 'compact') {
    // Version compacte pour la grille
    return (
      <motion.button
        onClick={handleClick}
        disabled={loading || isToggling}
        className={cn(
          "absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full",
          "bg-black/60 backdrop-blur-sm text-white text-xs z-10",
          "hover:bg-black/80 transition-colors",
          "disabled:opacity-50 cursor-pointer",
          isToggling && "animate-pulse",
          showSuccess && "bg-green-500/80",
          error && "bg-red-500/80",
          className
        )}
        whileTap={!isToggling ? { scale: 0.95 } : {}}
        whileHover={!isToggling ? { scale: 1.05 } : {}}
        animate={showSuccess ? { scale: [1, 1.1, 1] } : {}}
      >
        <AnimatePresence mode="wait">
          {isToggling ? (
            <FeedbackIcon key="loading" isToggling={true} error={null} liked={liked} />
          ) : (
            <motion.div
              key="heart"
              animate={liked ? { 
                scale: [1, 1.3, 1],
                rotate: [0, -10, 10, 0]
              } : { scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Heart 
                size={12} 
                className={cn(
                  "transition-all duration-300",
                  liked ? "fill-red-500 text-red-500 drop-shadow-sm" : "text-white"
                )} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {showCount && (
          <AnimatedCounter value={total} loading={loading} />
        )}
        
        {/* Particules d'animation au clic */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === 'icon') {
    // Version icône pour les barres d'actions (style boutons de partage)
    return (
      <motion.button
        onClick={handleClick}
        disabled={loading || isToggling}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors",
          "disabled:opacity-50 cursor-pointer relative",
          isToggling && "animate-pulse",
          showSuccess && "border-green-400 text-green-500",
          error && "border-red-400 text-red-500",
          liked 
            ? "bg-red-50 border-red-500 text-red-500" 
            : "bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500",
          className
        )}
        whileTap={!isToggling ? { scale: 0.95 } : {}}
        whileHover={!isToggling ? { scale: 1.05 } : {}}
        animate={showSuccess ? { scale: [1, 1.1, 1] } : {}}
        title={`${liked ? 'Retirer le' : 'Ajouter un'} like${showCount && total > 0 ? ` (${total})` : ''}`}
      >
        <AnimatePresence mode="wait">
          {isToggling ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              key="heart"
              initial={{ scale: 0 }}
              animate={liked ? {
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              } : { scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Heart
                size={18}
                className={cn(
                  "transition-all duration-300",
                  liked ? "fill-red-500 text-red-500 drop-shadow-sm" : "text-gray-500"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compteur en badge si showCount et > 0 */}
        {showCount && total > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            <AnimatedCounter value={total} loading={loading} />
          </motion.div>
        )}

        {/* Particules d'animation au clic */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Version complète pour les modals/détails
  return (
    <motion.button
      onClick={handleClick}
      disabled={loading || isToggling}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden",
        "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
        "transition-all duration-300 disabled:opacity-50",
        isToggling && "animate-pulse",
        showSuccess && "bg-green-100 dark:bg-green-900/30",
        error && "bg-red-100 dark:bg-red-900/30",
        className
      )}
      whileTap={!isToggling ? { scale: 0.98 } : {}}
      whileHover={!isToggling ? { scale: 1.02 } : {}}
      animate={showSuccess ? { scale: [1, 1.02, 1] } : {}}
    >
      <AnimatePresence mode="wait">
        {isToggling ? (
          <motion.div
            key="loading"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            key="heart"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <motion.div
              animate={liked ? { 
                scale: [1, 1.4, 1],
                rotate: [0, -15, 15, 0]
              } : { scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Heart 
                size={20} 
                className={cn(
                  "transition-all duration-300",
                  liked ? "fill-red-500 text-red-500 drop-shadow-lg" : "text-slate-600 dark:text-slate-400"
                )} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col items-start">
        <motion.span 
          className="text-sm font-medium"
          animate={showSuccess ? { color: "#10b981" } : {}}
        >
          {isToggling ? "En cours..." : liked ? "Liké !" : "Liker"}
        </motion.span>
        {showCount && (
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <AnimatedCounter value={total} loading={loading} />
            <span>like{total !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Effet de vague au succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-green-400/20 rounded-lg"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};
