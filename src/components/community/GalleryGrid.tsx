import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { CommunityEntry } from "../../types/communityTypes";
import { cn } from "../../lib/utils";
import { LazyImage } from "../ui/LazyImage";

interface GalleryGridProps {
  entries: CommunityEntry[];
  onEntryClick: (entry: CommunityEntry) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ entries, onEntryClick }) => {
  // Animation pour les éléments de la grille
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-20">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          custom={index}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative rounded-lg overflow-hidden"
          onClick={() => onEntryClick(entry)}
        >
          {entry.type === "photo" && (entry.thumbnailUrl || entry.imageUrl) ? (
            // Affichage d'une photo
            <div className="aspect-square relative">
              <LazyImage
                src={entry.thumbnailUrl || entry.imageUrl}
                alt={entry.description || "Photo communautaire"}
                className="w-full h-full object-cover"
                priority={index < 6} // Charger immédiatement les 6 premières images
              />
              {/* Overlay avec description - visible sur mobile, hover sur desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pb-8">
                <p className="text-white text-sm line-clamp-2">{entry.description || entry.content}</p>
              </div>
            </div>
          ) : entry.type === "photo" ? (
            // Photo sans image (fallback)
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 p-3 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-center text-slate-500">Image non disponible</p>
              <p className="text-xs text-center text-slate-400 mt-1 line-clamp-2">{entry.content}</p>
            </div>
          ) : (
            // Affichage d'un témoignage
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 p-3 flex flex-col">
              <p className="text-sm line-clamp-5 flex-grow">{entry.content}</p>
              <div className="mt-2 text-xs text-slate-500">
                {entry.eventId && (
                  <span className="block truncate">
                    {entry.eventId.replace(/-/g, " ")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Informations communes */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
            <div className="truncate">
              <span>{entry.displayName}</span>
              <span className="text-xs text-slate-300 ml-1">
                {entry.timestamp && !isNaN(new Date(entry.timestamp).getTime()) 
                  ? format(new Date(entry.timestamp), "d MMM", { locale: fr })
                  : ""}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
