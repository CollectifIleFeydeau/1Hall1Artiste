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

import { CommunityEntry } from "../../types/communityTypes";
import { cn } from "../../lib/utils";
import { LocalImage } from "./LocalImage";
import { LikeButton } from "./LikeButton";

// Interface pour les photos historiques
interface HistoricalPhoto {
  id: string;
  path: string;
  type: 'historical';
  displayName: string;
  timestamp: string;
  description: string;
}

// Type unifié
type UnifiedEntry = CommunityEntry | HistoricalPhoto;

interface EntryDetailProps {
  entry: UnifiedEntry;
  entries: UnifiedEntry[];
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
          className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 shadow-lg dark:bg-slate-900 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
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
            <button
              aria-label="Fermer"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-grow overflow-auto">
            {entry.type === "historical" ? (
              // Photo historique
              <div className="flex flex-col">
                <div className="relative cursor-zoom-in" onClick={() => {
                  // Ouvrir l'image en plein écran dans un nouvel onglet
                  window.open(entry.path, '_blank');
                }}>
                  <img
                    src={entry.path}
                    alt={entry.description}
                    className="w-full h-auto"
                    onError={(e) => {
                      console.error('[EntryDetail] Image historique non trouvée:', entry.path);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Indicateur de zoom */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    🔍 Cliquer pour agrandir
                  </div>
                </div>
                {entry.description && (
                  <p className="p-4 text-sm">{entry.description}</p>
                )}
              </div>
            ) : entry.type === "photo" ? (
              // Photo communautaire
              <div className="flex flex-col">
                <div className="relative cursor-zoom-in" onClick={() => {
                  // Ouvrir l'image en plein écran dans un nouvel onglet
                  window.open(entry.imageUrl, '_blank');
                }}>
                  <LocalImage
                    src={entry.imageUrl}
                    alt={entry.description || "Photo communautaire"}
                    className="w-full h-auto"
                  />
                  {/* Indicateur de zoom */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    🔍 Cliquer pour agrandir
                  </div>
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

          {/* Pied de page avec like et date */}
          <div className="p-3 border-t flex items-center justify-between">
            <LikeButton 
              entryId={entry.id} 
              variant="full"
            />
            <span className="text-sm text-slate-500">
              {(() => {
                try {
                  if (!entry.timestamp) return "Date inconnue";
                  const date = new Date(entry.timestamp);
                  if (isNaN(date.getTime())) return "Date invalide";
                  return format(date, "d MMMM yyyy", { locale: fr });
                } catch (error) {
                  console.warn('[EntryDetail] Invalid timestamp:', entry.timestamp, error);
                  return "Date invalide";
                }
              })()}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

