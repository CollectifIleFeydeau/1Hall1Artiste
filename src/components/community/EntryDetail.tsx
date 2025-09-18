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
          {/* En-tête */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{entry.displayName}</span>
              <span className="text-sm text-slate-500">
                {format(new Date(entry.timestamp), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Indicateur de position */}
              <span className="text-xs text-slate-400 mr-2">
                {currentIndex + 1} / {entries.length}
              </span>
              
              {/* Boutons de navigation */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="h-8 w-8"
                title="Photo précédente (← ou swipe droite)"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-8 w-8"
                title="Photo suivante (→ ou swipe gauche)"
              >
                <ChevronRight size={16} />
              </Button>
              
              {/* Bouton fermer */}
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title="Fermer (Échap)">
                <X size={16} />
              </Button>
            </div>
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
                  
                  {/* Indicateurs visuels de swipe sur mobile */}
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 to-transparent pointer-events-none md:hidden flex items-center justify-start pl-2">
                    {canGoPrevious && (
                      <ChevronLeft className="text-white/60" size={20} />
                    )}
                  </div>
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/20 to-transparent pointer-events-none md:hidden flex items-center justify-end pr-2">
                    {canGoNext && (
                      <ChevronRight className="text-white/60" size={20} />
                    )}
                  </div>
                </div>
                {entry.description && (
                  <p className="p-4 text-sm">{entry.description}</p>
                )}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-lg">{entry.content}</p>
              </div>
            )}

            {/* Métadonnées */}
            <div className="p-4 text-sm text-slate-500 space-y-2">
              {entry.eventId && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{entry.eventId.replace(/-/g, " ")}</span>
                </div>
              )}
              {entry.locationId && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{entry.locationId.replace(/-/g, " ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pied de page avec instructions */}
          <div className="p-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                Partagé le {format(new Date(entry.timestamp), "d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
              <span className="text-xs text-slate-400 md:hidden">
                Swipe ← → pour naviguer
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
