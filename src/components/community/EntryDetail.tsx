import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "../../components/ui/button";
import { CommunityEntry } from "../../types/communityTypes";
import { cn } from "../../lib/utils";
import { LocalImage } from "./LocalImage";

interface EntryDetailProps {
  entry: CommunityEntry;
  onClose: () => void;
  onLike: (entryId: string) => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onClose, onLike }) => {
  // Empêcher le défilement du corps lorsque le modal est ouvert
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
        >
          {/* En-tête */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{entry.displayName}</span>
              <span className="text-sm text-slate-500">
                {format(new Date(entry.timestamp), "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
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

          {/* Pied de page avec likes */}
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-slate-500">
              Partagé le {format(new Date(entry.timestamp), "d MMMM yyyy à HH:mm", { locale: fr })}
            </span>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-2",
                entry.isLikedByCurrentUser && "bg-primary/10"
              )}
              onClick={() => onLike(entry.id)}
            >
              <ThumbsUp
                size={16}
                className={cn(
                  entry.isLikedByCurrentUser && "fill-primary text-primary"
                )}
              />
              <span>{entry.likes}</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
