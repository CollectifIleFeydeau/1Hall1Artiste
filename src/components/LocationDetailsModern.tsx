import { getImagePath } from '@/utils/imagePaths';
import { IMAGE_PATHS } from '../constants/imagePaths';
import React from 'react';
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/card";
import { Location } from "@/data/locations";
import { Event } from "@/data/events";
import { useNavigate } from "react-router-dom";
import { LikeButton } from "@/components/community/LikeButton";
import { useLikes } from "@/hooks/useLikes";
import X from "lucide-react/dist/esm/icons/x";
import Heart from "lucide-react/dist/esm/icons/heart";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import { AudioGuideButton } from "@/components/AudioGuideButton";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import { getBackgroundFallback } from "@/utils/backgroundUtils";
import { ShareButton } from "@/components/ShareButton";

// Composant Like simple avec logique partagée
interface LikeButtonSimpleProps {
  entryId: string;
}

const LikeButtonSimple = ({ entryId }: LikeButtonSimpleProps) => {
  const { liked, total, loading, toggleLike } = useLikes(entryId);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!loading) {
      toggleLike();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`h-10 w-10 flex items-center justify-center relative rounded-full border-2 transition-colors ${
        liked 
          ? 'bg-red-50 border-red-500 text-red-500' 
          : 'bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500'
      }`}
      title={`${liked ? 'Retirer le' : 'Ajouter un'} like${total > 0 ? ` (${total})` : ''}`}
    >
      <Heart 
        className={`h-5 w-5 ${liked ? 'text-red-500 fill-red-500' : 'inherit'}`}
      />
      {total > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {total}
        </span>
      )}
    </button>
  );
};

interface LocationDetailsModernProps {
  location: Location;
  events: Event[];
  savedEventIds: string[];
  showLocationFeatures: boolean;
  onClose: () => void;
  onSaveEvent: (event: Event, e: React.MouseEvent) => void;
  onSelectEvent: (event: Event) => void;
  onMarkVisited: (visited: boolean) => void;
  onNavigate: () => void;
  isVisited: boolean;
}

export const LocationDetailsModern: React.FC<LocationDetailsModernProps> = ({
  location,
  events,
  savedEventIds,
  showLocationFeatures,
  onClose,
  onSaveEvent,
  onSelectEvent,
  onMarkVisited,
  onNavigate,
  isVisited
}) => {
  const navigate = useNavigate();

  const handleHistoryClick = () => {
    navigate('/location-history', { 
      state: { selectedLocationId: location.id }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative bg-amber-50/95 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="relative z-10 p-6">
          {/* Header avec titre et boutons - Style épuré */}
          <div className="mb-6">
            {/* Boutons en haut à droite */}
            <div className="flex justify-end items-center gap-2 mb-2">
              {/* Bouton de like */}
              <LikeButtonSimple entryId={`building-${location.id}`} />
              
              {/* Bouton save - Marquer visité */}
              <button
                onClick={() => onMarkVisited(!isVisited)}
                className={`h-10 w-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                  isVisited 
                    ? 'bg-amber-50 border-amber-500 text-amber-500' 
                    : 'bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500'
                }`}
                title={isVisited ? "Retirer des visités" : "Marquer comme visité"}
              >
                {isVisited ? 
                  <BookmarkCheck className="h-5 w-5" /> : 
                  <Bookmark className="h-5 w-5" />
                }
              </button>
              
              {/* Bouton share */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${location.name} - Île Feydeau`,
                      text: `Découvrez ${location.name} sur l'Île Feydeau à Nantes!`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié !');
                  }
                }}
                className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
                title="Partager"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Titre et sous-titre */}
            <div>
              <h2 className="text-2xl font-bold text-[#1a2138] font-serif mb-1">
                {location.name}
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                Île Feydeau, Nantes
              </p>
            </div>
          </div>

          {/* Description du lieu */}
          {location.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                {location.description}
              </p>
            </div>
          )}


          {/* Événements à cet endroit */}
          {events.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Événements à cet endroit
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {events.map((event, index) => (
                  <div 
                    key={event.id} 
                    className={`relative p-2 rounded-lg cursor-pointer hover:opacity-90 transition-all overflow-hidden ${
                      savedEventIds.includes(event.id) ? 'ring-2 ring-amber-400' : ''
                    }`}
                    style={{
                      position: 'relative',
                      backgroundColor: 'transparent',
                    }}
                  >
                    {/* Fond parchemin comme dans le programme */}
                    <div 
                      className="absolute inset-0 opacity-60 z-0"
                      style={{
                        backgroundImage: `url('${getImagePath(IMAGE_PATHS.BACKGROUNDS.PARCHMENT)}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: index % 2 === 0 ? 'top left' : 'top right',
                        transform: index % 2 === 1 ? 'scaleX(-1)' : 'none',
                      }}
                    />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex-1" onClick={() => {
                        onClose(); // Fermer LocationDetailsModern d'abord
                        setTimeout(() => {
                          onSelectEvent(event); // Puis ouvrir EventDetailsModern après un délai
                        }, 100);
                      }}>
                        <p className="font-bold text-[#1a2138] mb-0.5 text-sm leading-tight">{event.title}</p>
                        {event.artistName && (
                          <p className="text-xs text-[#1a2138] font-medium mb-0.5">{event.artistName}</p>
                        )}
                        <div className="text-gray-500 text-xs">
                          <p>{event.time}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-600 font-medium">
                            {event.type === 'exposition' ? 'Exposition' : 'Concert'}
                          </span>
                        </div>
                      </div>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors relative z-10 ${
                          savedEventIds.includes(event.id)
                            ? 'bg-amber-50 border-amber-500 text-amber-500'
                            : 'bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500'
                        }`}
                        onClick={(e) => onSaveEvent(event, e)}
                        title={savedEventIds.includes(event.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        {savedEventIds.includes(event.id) ? (
                          <BookmarkCheck className="h-3 w-3" />
                        ) : (
                          <Bookmark className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions du bas */}
          <div className="space-y-3">
            {/* Première ligne : Histoire et Audio Guide */}
            <div className="flex gap-3">
              <button
                onClick={handleHistoryClick}
                className="flex-1 h-12 border-2 border-[#1a2138] text-[#1a2138] bg-transparent hover:bg-[#1a2138] hover:text-white rounded-full font-medium text-sm transition-colors"
              >
                Histoire
              </button>
              
              {location.audio ? (
                <button
                  onClick={() => {
                    // Logique pour jouer l'audio guide
                    const audio = new Audio(location.audio);
                    audio.play().catch(console.error);
                  }}
                  className="flex-1 h-12 border-2 border-[#1a2138] text-[#1a2138] bg-transparent hover:bg-[#1a2138] hover:text-white rounded-full font-medium text-sm transition-colors"
                >
                  Audio guide
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 h-12 bg-[#1a2138] hover:bg-[#2a3148] text-white rounded-full font-medium text-sm transition-colors"
                >
                  Retour
                </button>
              )}
            </div>
            
            {/* Deuxième ligne : Témoignage et Retour */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Navigation vers la galerie communautaire avec contexte du lieu
                  navigate("/community?tab=contribute", { 
                    state: { 
                      locationContext: location,
                      fromLocation: true 
                    } 
                  });
                  onClose();
                }}
                className="flex-1 h-12 border-2 border-[#1a2138] text-[#1a2138] bg-transparent hover:bg-[#1a2138] hover:text-white rounded-full font-medium text-sm transition-colors"
              >
                Témoignage
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 h-12 bg-[#1a2138] hover:bg-[#2a3148] text-white rounded-full font-medium text-sm transition-colors"
              >
                Retour
              </button>
            </div>
            
            {/* Troisième ligne : Navigation (si géolocalisation active) */}
            {showLocationFeatures && (
              <div className="flex gap-3">
                <button
                  onClick={onNavigate}
                  className="w-full h-12 border-2 border-[#1a2138] text-[#1a2138] bg-transparent hover:bg-[#1a2138] hover:text-white rounded-full font-medium text-sm transition-colors"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Me guider vers ce lieu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsModern;




