import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSwipeable } from "react-swipeable";

import { Button } from "../../components/ui/button";
import { CommunityEntry } from "../../types/communityTypes";
import { cn } from "../../lib/utils";
import { LocalImage } from "./LocalImage";

interface EntryDetailProps {
  entry: CommunityEntry;
  entries: CommunityEntry[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, entries, currentIndex, onClose, onNavigate }) => {
  // Empêcher le défilement du corps lorsque le modal est ouvert
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Logique de navigation
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < entries.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(currentIndex + 1);
    }
  };

  // Configuration du swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (canGoNext) {
        handleNext();
      }
    },
    onSwipedRight: () => {
      if (canGoPrevious) {
        handlePrevious();
      }
    },
    trackMouse: true, // Permet aussi le swipe avec la souris sur desktop
    preventScrollOnSwipe: true, // Empêche le scroll pendant le swipe
    delta: 50, // Distance minimum pour déclencher le swipe
  });

  // Gestion des touches clavier
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && canGoPrevious) {
        handlePrevious();
      } else if (event.key === 'ArrowRight' && canGoNext) {
        handleNext();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canGoPrevious, canGoNext, onClose]);

  // Animation pour le modal
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => e.stopPropagation()}
          {...swipeHandlers} // Ajouter les handlers de swipe
        >
          {/* En-tête simplifié */}
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-medium">{entry.displayName}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X size={16} />
            </Button>
          </div>

          {/* Contenu */}
          <div className="flex-grow overflow-auto">
            {entry.type === "photo" ? (
              <div className="flex flex-col">
                <div className="relative">
                  <LocalImage
                    src={entry.imageUrl}
                    alt={entry.description || "Photo communautaire"}
                    className="w-full h-auto"
                  />
                  
                </div>
                {entry.description && (
                  <p className="p-4 text-sm">{entry.description}</p>
                )}
              </div>
            ) : (
              <div className="p-6 min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  {entry.content && entry.content.trim() ? (
                    <p className="text-lg leading-relaxed text-left">{entry.content.trim()}</p>
                  ) : entry.description && entry.description.trim() ? (
                    <p className="text-lg leading-relaxed text-left">{entry.description.trim()}</p>
                  ) : (
                    <div>
                      <p className="text-slate-500 italic">Aucun contenu disponible</p>
                      <p className="text-xs text-slate-400 mt-2">Debug: content="{entry.content}", description="{entry.description}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Pied de page simplifié */}
          <div className="p-3 border-t text-center">
            <span className="text-sm text-slate-500">
              {format(new Date(entry.timestamp), "d MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
