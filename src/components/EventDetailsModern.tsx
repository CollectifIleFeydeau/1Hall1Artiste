import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TreasureButton } from "@/components/ui/TreasureButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { SwipeIndicator } from "@/components/ui/SwipeIndicator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getImagePath } from "@/utils/imagePaths";
import { setEventContributionContext } from "@/services/contextualContributionService";
import ReactMarkdown from "react-markdown";
import { Event } from "@/data/events";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import X from "lucide-react/dist/esm/icons/x";
import Heart from "lucide-react/dist/esm/icons/heart";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import MessageSquareQuote from "lucide-react/dist/esm/icons/message-square-quote";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { analytics, EventAction, trackInteraction } from "@/services/firebaseAnalytics";
import { addToCalendar, isCalendarSupported, CalendarErrorType } from "@/services/calendarService";
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/logger";
import { getBackgroundFallback } from "@/utils/backgroundUtils";
import { LikeButton } from "@/components/community/LikeButton";
import { useLikes } from "@/hooks/useLikes";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/services/savedEvents";
import { getEventsByLocation } from "@/data/events";
import { artists } from "@/data/artists";
import { ShareButton } from "@/components/ShareButton";
import { getLocationNameById } from "@/data/locations";


interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  source: "map" | "program" | "saved";
  navigableEvents?: Event[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

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

// Composant pour afficher la description de l'artiste avec un teaser et une option pour développer
interface ArtistDescriptionProps {
  text: string;
}

const ArtistDescription = ({ text }: ArtistDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createTeaser = (fullText: string): string => {
    const maxLength = 120;
    if (fullText.length <= maxLength) return fullText;
    const truncated = fullText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpaceIndex) + '...';
  };
  
  const teaser = createTeaser(text);
  const showExpandOption = text.length > teaser.length;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="text-sm text-gray-700">
      <div 
        onClick={showExpandOption ? toggleExpand : undefined}
        className={showExpandOption ? "cursor-pointer" : ""}
      >
        <ReactMarkdown components={{
          p: ({node, ...props}) => <p className="mb-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold mb-2" {...props} />,
        }}>
          {isExpanded ? text : teaser}
        </ReactMarkdown>
        
        {showExpandOption && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            {isExpanded ? (
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
    </div>
  );
};

export const EventDetailsNew = ({ 
  event, 
  isOpen, 
  onClose, 
  source,
  navigableEvents = [],
  currentIndex = 0,
  onIndexChange
}: EventDetailsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [calendarSupported, setCalendarSupported] = useState<boolean>(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  
  // Tracking: ouverture du panneau de détails
  useEffect(() => {
    if (isOpen && event) {
      analytics.trackProgramInteraction(EventAction.EVENT_DETAILS, {
        event_id: event.id,
        event_title: event.title,
        source
      });
    }
  }, [isOpen, event, source]);
  
  // Vérifier si l'événement est sauvegardé au chargement
  useEffect(() => {
    if (event) {
      const currentSavedEvents = getSavedEvents();
      setSavedEvents(currentSavedEvents);
      setCalendarSupported(isCalendarSupported());
      
      // Charger les événements liés au même lieu
      if (event.locationId) {
        const eventsAtSameLocation = getEventsByLocation(event.locationId)
          .filter(e => e.id !== event.id);
        setRelatedEvents(eventsAtSameLocation);
      }
    }
  }, [event]);
  
  // Vérifier si l'événement actuel est sauvegardé
  const isSaved = event ? savedEvents.some(saved => saved.id === event.id) : false;
  
  // Hook de swipe
  const swipe = useSwipeNavigation({
    items: navigableEvents,
    currentIndex,
    onIndexChange: onIndexChange || (() => {}),
    threshold: 100, // Seuil augmenté pour éviter les faux positifs (clic interprété comme swipe)
    enabled: navigableEvents.length > 1
  });
  
  // Hook de navigation clavier
  useKeyboardNavigation({
    onPrevious: swipe.goPrevious,
    onNext: swipe.goNext,
    onClose,
    enabled: navigableEvents.length > 1 && isOpen
  });
  
  // Fonction pour naviguer vers la carte
  const navigateToMap = () => {
    if (!event) return;
    
    trackInteraction(EventAction.CLICK, 'view_on_map_button', {
      from: 'event_details',
      event_id: event.id,
      location_id: event.locationId,
      source
    });
    
    onClose();
    
    setTimeout(() => {
      navigate(`/map`, { 
        state: { 
          highlightLocationId: event.locationId,
          fromEvent: true,
          timestamp: new Date().getTime()
        } 
      });
    }, 100);
  };
  
  // Fonction pour contribuer à la galerie communautaire
  const handleContribute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    setEventContributionContext(event);
    navigate("/community?tab=contribute");
    onClose();
    
    analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, {
      from: 'event_details',
      event_id: event.id,
      event_title: event.title
    });
  };

  // Fonction pour gérer la sauvegarde/suppression d'un événement
  const toggleSaveEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    const isCurrentlySaved = savedEvents.some(saved => saved.id === event.id);
    
    if (isCurrentlySaved) {
      removeSavedEvent(event.id);
      setSavedEvents(getSavedEvents());
      analytics.trackContentInteraction(EventAction.UNSAVE, 'event', event.id, {
        event_title: event.title,
        source
      });
    } else {
      saveEvent(event);
      setSavedEvents(getSavedEvents());
      analytics.trackContentInteraction(EventAction.SAVE, 'event', event.id, {
        event_title: event.title,
        source
      });
    }
  };
  
  // Fonction pour ajouter un événement au calendrier
  const handleAddToCalendar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    try {
      await addToCalendar(event);
      toast({
        title: "Événement ajouté",
        description: "L'événement a été ajouté à votre calendrier.",
      });
      
      analytics.trackProgramInteraction(EventAction.CLICK, {
        action: 'calendar_add',
        event_id: event.id,
        event_title: event.title,
        source
      });
    } catch (error: any) {
      let errorMessage = "Impossible d'ajouter l'événement au calendrier.";
      
      if (error.type === CalendarErrorType.NOT_SUPPORTED) {
        errorMessage = "Votre navigateur ne supporte pas cette fonctionnalité.";
      } else if (error.cancelled) {
        return;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Si pas d'événement ou si le dialogue n'est pas ouvert, ne rien afficher
  if (!event || !isOpen) return null;
  
  // Récupérer l'artiste correspondant à l'événement
  const artist = artists.find(artist => artist.id === event.artistId);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
      <div 
        className="max-w-lg w-full max-h-[75vh] overflow-y-auto rounded-2xl shadow-2xl relative bg-amber-50/95 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
        {...swipe.handlers}
      >
        
        <div className="relative z-10 p-6">
          {/* Boutons en haut à droite */}
          <div className="flex justify-end items-center gap-2 mb-2">
            {/* Bouton de like - Logique partagée, UI simple */}
            <LikeButtonSimple entryId={`event-${event.id}`} />
            
            {/* Bouton témoignage/citation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContribute(e);
              }}
              className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
              title="Partager un témoignage"
            >
              <MessageSquareQuote className="h-5 w-5" />
            </button>
            
            {/* Bouton sauvegarder/calendrier */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCalendar(e);
              }}
              className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
              title="Ajouter au calendrier"
            >
              <Calendar className="h-5 w-5" />
            </button>
            
            {/* Bouton situer sur la carte */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateToMap();
              }}
              className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
              title="Voir sur la carte"
            >
              <MapPin className="h-5 w-5" />
            </button>
            
            {/* Bouton share - Style uniforme */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: `${event.title} - Île Feydeau`,
                    text: `Découvrez ${event.title} par ${event.artistName} sur l'Île Feydeau à Nantes!`,
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
            
            {/* Bouton retour - Style uniforme */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
              title="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          
          {/* Indicateur de swipe */}
          {navigableEvents.length > 1 && (
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
          
          {/* Header avec titre - Style épuré */}
          <div className="mb-6 pb-4">
            <h2 className="text-2xl font-bold text-[#1a2138] font-serif mb-2">
              {event.title}
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              {event.artistName} • {event.type === 'exposition' ? 'Exposition' : 'Concert'}
            </p>
          </div>
          
          {/* Informations pratiques */}
          <div className="mb-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                <span>{getLocationNameById(event.locationId) || event.locationName}</span>
              </div>
            </div>
          </div>
          
          
          {/* Description de l'artiste */}
          {artist?.presentation && (
            <div className="mb-6">
              <ArtistDescription text={artist.presentation} />
            </div>
          )}

          {/* Informations de contact complètes pour les concerts */}
          {event.type === "concert" && artist && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Contact & Réseaux
              </h3>
              <div className="space-y-3">
                {/* Email */}
                {artist.email && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Email:</span>
                    <a href={`mailto:${artist.email}`} className="text-blue-600 hover:underline">
                      {artist.email}
                    </a>
                  </div>
                )}
                
                {/* Site web */}
                {artist.website && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Site web:</span>
                    <a 
                      href={artist.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {artist.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* Téléphone */}
                {artist.phone && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Téléphone:</span>
                    <a 
                      href={`tel:${artist.phone}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {artist.phone}
                    </a>
                  </div>
                )}

                {/* Facebook */}
                {artist.facebook && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Facebook:</span>
                    <span className="text-gray-700">{artist.facebook}</span>
                  </div>
                )}

                {/* YouTube */}
                {artist.youtube && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">YouTube:</span>
                    <a 
                      href={artist.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {artist.youtube.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* TikTok */}
                {artist.tiktok && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">TikTok:</span>
                    <a 
                      href={artist.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {artist.tiktok.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* Directeur/Chef */}
                {artist.director && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Direction:</span>
                    <span className="text-gray-700">{artist.director}</span>
                  </div>
                )}

                {/* Membres */}
                {artist.members && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2 min-w-[80px]">Membres:</span>
                    <span className="text-gray-700">{artist.members}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Galerie photos de l'artiste */}
          {event.type === "concert" && artist?.photos && artist.photos.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Photos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artist.photos.map((photo, index) => (
                  <div key={index} className="relative pb-[75%] overflow-hidden rounded-xl shadow-sm">
                    <img 
                      src={getImagePath(photo)} 
                      alt={`${event.artistName} - photo ${index + 1}`}
                      className="absolute top-0 left-0 object-cover w-full h-full"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Erreur de chargement de l'image: ${photo}`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galerie vidéos de l'artiste */}
          {event.type === "concert" && artist?.videos && artist.videos.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Vidéos
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {artist.videos.map((videoUrl, index) => {
                  // Traitement des URLs YouTube
                  let embedUrl = videoUrl;
                  
                  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    let videoId = '';
                    
                    if (videoUrl.includes('youtube.com/watch?v=')) {
                      videoId = videoUrl.split('v=')[1];
                      const ampersandPosition = videoId.indexOf('&');
                      if (ampersandPosition !== -1) {
                        videoId = videoId.substring(0, ampersandPosition);
                      }
                    } else if (videoUrl.includes('youtu.be/')) {
                      videoId = videoUrl.split('youtu.be/')[1];
                    }
                    
                    if (videoId) {
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                  }
                  
                  return (
                    <div key={index} className="relative w-full pb-[56.25%] overflow-hidden rounded-lg">
                      <iframe
                        src={embedUrl}
                        title={`${event.artistName} - vidéo ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                        loading="lazy"
                      ></iframe>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Widget Instagram */}
          {artist && artist.instagram && artist.instagram.includes('instagram') && (() => {
            const extractInstagramHandle = (url: string): string => {
              try {
                const u = new URL(url);
                const cleanedPath = u.pathname.replace(/\/$/, "");
                const parts = cleanedPath.split('/').filter(Boolean);
                return parts.pop() || "";
              } catch {
                const cleaned = url.split('?')[0].replace(/\/$/, "");
                const parts = cleaned.split('/').filter(Boolean);
                return parts.pop() || "";
              }
            };
            
            const handle = extractInstagramHandle(artist.instagram);
            if (!handle) return null;
            
            return (
              <div className="mb-6">
                <div 
                  className="instagram-embed-container w-full overflow-hidden rounded-lg relative" 
                  style={{
                    paddingBottom: '100%',
                    height: 0
                  }}
                >
                  <iframe
                    title={`Instagram feed de ${event.artistName}`}
                    src={`https://www.instagram.com/${handle}/embed?hidecaption=1&header=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: '-43px',
                      left: 0,
                      width: '100%',
                      height: 'calc(100% + 43px)'
                    }}
                  ></iframe>
                </div>
              </div>
            );
          })()}

          {/* Événements liés au même lieu */}
          {relatedEvents.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Autres événements à cet endroit
              </h3>
              <div className="space-y-2">
                {relatedEvents.map((relatedEvent) => (
                  <div key={relatedEvent.id} className="text-sm text-gray-700 p-2 bg-white/50 rounded-lg">
                    <div className="font-medium">{relatedEvent.title}</div>
                    <div className="text-xs text-gray-500">{relatedEvent.artistName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
