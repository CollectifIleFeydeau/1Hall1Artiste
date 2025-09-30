import { getImagePath } from '@/utils/imagePaths';
import { IMAGE_PATHS } from '../constants/imagePaths';
import React, { useState, useRef, useEffect } from 'react';
import { ActionButton } from "@/components/ui/ActionButton";
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
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import Play from "lucide-react/dist/esm/icons/play";
import Pause from "lucide-react/dist/esm/icons/pause";
import MessageSquareQuote from "lucide-react/dist/esm/icons/message-square-quote";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import { AudioGuideButton } from "@/components/AudioGuideButton";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import { getBackgroundFallback } from "@/utils/backgroundUtils";
import { ShareButton } from "@/components/ShareButton";
import { audioGuideService } from "@/services/audioGuideService";
import { Slider } from "@/components/ui/slider";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { SwipeIndicator } from "@/components/ui/SwipeIndicator";
import { AudioGuide } from "@/components/AudioGuide";

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
  navigableLocations?: Location[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
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
  navigableLocations = [],
  currentIndex = 0,
  onIndexChange,
  onClose,
  onSaveEvent,
  onSelectEvent,
  onMarkVisited,
  onNavigate,
  isVisited
}) => {
  const navigate = useNavigate();
  
  // États pour le lecteur audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleHistoryClick = () => {
    navigate('/location-history', { 
      state: { selectedLocationId: location.id }
    });
  };
  
  // Fonctions pour le lecteur audio
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        analytics.trackAudio('pause', location.id);
      } else {
        audioRef.current.play();
        analytics.trackAudio('play', location.id);
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Hook de swipe
  const swipe = useSwipeNavigation({
    items: navigableLocations,
    currentIndex,
    onIndexChange: onIndexChange || (() => {}),
    enabled: navigableLocations.length > 1
  });
  
  // Hook de navigation clavier
  useKeyboardNavigation({
    onPrevious: swipe.goPrevious,
    onNext: swipe.goNext,
    onClose,
    enabled: navigableLocations.length > 1
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative bg-amber-50/95 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
        {...swipe.handlers}
      >
        
        <div className="relative z-10 p-6">
          {/* Header avec titre et boutons - Style épuré */}
          <div className="mb-6">
            {/* Boutons en haut à droite avec indication bâtiment fermé */}
            <div className="flex justify-between items-center gap-2 mb-2">
              {/* Indication bâtiment fermé à gauche */}
              {location.hasProgram === false && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full">
                  <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-700">
                    Bâtiment fermé
                  </p>
                </div>
              )}
              
              {/* Spacer pour pousser les boutons à droite si pas de message */}
              {location.hasProgram !== false && <div className="flex-1" />}
              
              {/* Boutons à droite */}
              <div className="flex items-center gap-2">
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
              
              {/* Bouton témoignage/citation */}
              <button
                onClick={() => {
                  navigate("/community?tab=contribute", { 
                    state: { 
                      locationContext: location,
                      fromLocation: true 
                    } 
                  });
                  onClose();
                }}
                className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
                title="Partager un témoignage"
              >
                <MessageSquareQuote className="h-5 w-5" />
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
            </div>
            
            {/* Indicateur de swipe */}
            {navigableLocations.length > 1 && (
              <div className="flex justify-center mb-4">
                <SwipeIndicator
                  currentIndex={swipe.currentIndex}
                  totalCount={swipe.totalCount}
                  canGoPrevious={swipe.canGoPrevious}
                  canGoNext={swipe.canGoNext}
                  onPrevious={swipe.goPrevious}
                  onNext={swipe.goNext}
                  showArrows={true}
                  showCounter={true}
                />
              </div>
            )}
            
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

          {/* Description du lieu avec expand/collapse */}
          {location.description && (
            <div className="mb-6">
              <div 
                className="cursor-pointer"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                <p className={`text-sm text-gray-700 leading-relaxed ${
                  showFullDescription ? '' : 'line-clamp-2'
                }`}>
                  {location.description}
                </p>
                {location.description.length > 100 && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        <span>Réduire</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        <span>Voir plus</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              {location.history && showFullDescription && (
                <button
                  onClick={handleHistoryClick}
                  className="mt-2 text-sm text-[#4a5d94] hover:text-[#3a4d84] font-medium underline"
                >
                  La suite →
                </button>
              )}
            </div>
          )}

          {/* Lecteur audio intégré si disponible et fichier existe */}
          {location.audio && location.audio !== '' && (
            <AudioGuide 
              audioSrc={location.audio} 
              locationId={location.id}
              className="mb-4 mx-auto max-w-md"
            />
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
                        backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.PARCHMENT}')`,
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
            
            {/* Deuxième ligne : Navigation (si géolocalisation active) */}
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




