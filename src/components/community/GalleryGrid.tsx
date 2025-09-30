import { getImagePath } from '@/utils/imagePaths';
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { CommunityEntry } from "../../types/communityTypes";
import { cn } from "../../lib/utils";
import { LikeButton } from "./LikeButton";
import { IMAGE_PATHS } from '../../constants/imagePaths';

// Interface pour les photos historiques
interface HistoricalPhoto {
  id: string;
  path: string;
  type: 'historical';
  displayName: string;
  timestamp: string;
  description: string;
}

// Type unifié pour toutes les entrées
type UnifiedGalleryEntry = CommunityEntry | HistoricalPhoto;

interface GalleryGridProps {
  entries: UnifiedGalleryEntry[];
  onEntryClick: (entry: UnifiedGalleryEntry) => void;
}

// Fonction pour optimiser les URLs Cloudinary
const getOptimizedCloudinaryUrl = (url: string, isMobile: boolean): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Taille optimisée selon l'écran
  const width = isMobile ? 400 : 600;
  const quality = 'auto:low'; // Qualité automatique basse pour réduire le poids
  
  // Insérer les transformations Cloudinary
  return url.replace(
    '/upload/',
    `/upload/w_${width},q_${quality},f_auto,c_fill/`
  );
};

export const GalleryGrid: React.FC<GalleryGridProps> = ({ entries, onEntryClick }) => {
  // Logs pour diagnostiquer le scintillement
  console.log('[GalleryGrid] RENDER - Nombre d\'entrées:', entries.length);
  console.log('[GalleryGrid] Première entrée:', entries[0]?.id, entries[0]?.type);
  
  // TEST SCINTILLEMENT : Forcer le système mobile PARTOUT (pas de Framer Motion)
  const isMobile = true; // FORCÉ À TRUE POUR TEST - désactiver Framer Motion partout
  
  // Sur mobile, utiliser des divs simples sans animation
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-20">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onEntryClick(entry)}
          >
          {entry.type === "historical" ? (
            // Affichage d'une photo historique
            <div className="aspect-square relative">
              <img
                src={entry.path}
                alt={entry.description}
                className="w-full h-full object-cover"
                loading={index < 6 ? "eager" : "lazy"}
                onError={(e) => {
                  // Fallback pour les photos historiques qui ne se chargent pas
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder')) {
                    target.src = IMAGE_PATHS.PLACEHOLDERS.IMAGE;
                  }
                }}
              />
              {/* Overlay avec description */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pb-8">
                <p className="text-white text-sm line-clamp-2">{entry.description}</p>
              </div>
            </div>
          ) : entry.type === "photo" && ('thumbnailUrl' in entry || 'imageUrl' in entry) && (entry.thumbnailUrl || entry.imageUrl) ? (
            // Affichage d'une photo
            <div className="aspect-square relative bg-slate-200">
              <img
                src={getOptimizedCloudinaryUrl(entry.thumbnailUrl || entry.imageUrl, isMobile)}
                alt={entry.description || "Photo communautaire"}
                className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                style={{ imageRendering: 'auto' }}
                onLoad={(e) => {
                  // Afficher l'image en douceur une fois chargée
                  e.currentTarget.style.opacity = '1';
                }}
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
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 p-3 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-2xl mb-1">💬</div>
                <p className="text-xs text-slate-500 font-medium">Témoignage</p>
              </div>
              <p className="text-sm line-clamp-4 text-center flex-grow">
                {(entry.content && entry.content.trim()) || 
                 (entry.description && entry.description.trim()) || 
                 "Contenu disponible"}
              </p>
            </div>
          )}

          {/* Plus de badge "En cours" - Système instantané ! */}

          {/* Bouton de like - TEMPORAIREMENT DÉSACTIVÉ POUR TEST */}
          {/* {entry.type !== 'historical' && (
            <LikeButton 
              entryId={entry.id} 
              variant="compact"
            />
          )} */}

          {/* Informations communes */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
            <div className="truncate">
              <span>{entry.displayName}</span>
              <span className="text-xs text-slate-300 ml-1">
                {(() => {
                  try {
                    if (!entry.timestamp) return "";
                    const date = new Date(entry.timestamp);
                    if (isNaN(date.getTime())) return "";
                    
                    // Pour les photos historiques, afficher juste "Historique"
                    if (entry.type === 'historical') {
                      return "Historique";
                    }
                    
                    return format(date, "d MMM", { locale: fr });
                  } catch (error) {
                    console.warn('[GalleryGrid] Invalid timestamp:', entry.timestamp, error);
                    return "";
                  }
                })()}
              </span>
            </div>
          </div>
          </div>
        ))}
      </div>
    );
  }

  // Version desktop avec animations
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
          {entry.type === "historical" ? (
            // Affichage d'une photo historique
            <div className="aspect-square relative">
              <img
                src={entry.path}
                alt={entry.description}
                className="w-full h-full object-cover"
                loading={index < 6 ? "eager" : "lazy"}
                onError={(e) => {
                  // Fallback pour les photos historiques qui ne se chargent pas
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder')) {
                    target.src = IMAGE_PATHS.PLACEHOLDERS.IMAGE;
                  }
                }}
              />
              {/* Overlay avec description */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pb-8">
                <p className="text-white text-sm line-clamp-2">{entry.description}</p>
              </div>
            </div>
          ) : entry.type === "photo" && ('thumbnailUrl' in entry || 'imageUrl' in entry) && (entry.thumbnailUrl || entry.imageUrl) ? (
            // Affichage d'une photo
            <div className="aspect-square relative bg-slate-200">
              <img
                src={getOptimizedCloudinaryUrl(entry.thumbnailUrl || entry.imageUrl, false)}
                alt={entry.description || "Photo communautaire"}
                className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                style={{ imageRendering: 'auto' }}
                onLoad={(e) => {
                  console.log(`[GalleryGrid] Image chargée: ${entry.id}`);
                  e.currentTarget.style.opacity = '1';
                }}
                onError={(e) => {
                  console.error(`[GalleryGrid] Erreur chargement: ${entry.id}`);
                }}
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
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 p-3 flex flex-col justify-center">
              <div className="text-center mb-2">
                <div className="text-2xl mb-1">💬</div>
                <p className="text-xs text-slate-500 font-medium">Témoignage</p>
              </div>
              <p className="text-sm line-clamp-4 text-center flex-grow">
                {(entry.content && entry.content.trim()) || 
                 (entry.description && entry.description.trim()) || 
                 "Contenu disponible"}
              </p>
            </div>
          )}

          {/* Plus de badge "En cours" - Système instantané ! */}

          {/* Bouton de like - TEMPORAIREMENT DÉSACTIVÉ POUR TEST */}
          {/* {entry.type !== 'historical' && (
            <LikeButton 
              entryId={entry.id} 
              variant="compact"
            />
          )} */}

          {/* Informations communes */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
            <div className="truncate">
              <span>{entry.displayName}</span>
              <span className="text-xs text-slate-300 ml-1">
                {(() => {
                  try {
                    if (!entry.timestamp) return "";
                    const date = new Date(entry.timestamp);
                    if (isNaN(date.getTime())) return "";
                    
                    // Pour les photos historiques, afficher juste "Historique"
                    if (entry.type === 'historical') {
                      return "Historique";
                    }
                    
                    return format(date, "d MMM", { locale: fr });
                  } catch (error) {
                    console.warn('[GalleryGrid] Invalid timestamp:', entry.timestamp, error);
                    return "";
                  }
                })()}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};



