import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TreasureButton } from "@/components/ui/TreasureButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { setEventContributionContext } from "@/services/contextualContributionService";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Event } from "@/data/events";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import X from "lucide-react/dist/esm/icons/x";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import { analytics, EventAction, trackInteraction } from "@/services/firebaseAnalytics";
import { addToCalendar, isCalendarSupported, CalendarErrorType } from "@/services/calendarService";
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/logger";
import { getBackgroundFallback } from "@/utils/backgroundUtils";
import { LikeButton } from "@/components/community/LikeButton";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/services/savedEvents";
import { artists } from "@/data/artists";
import { ShareButton } from "@/components/ShareButton";
import { getLocationNameById } from "@/data/locations";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  source: "map" | "program" | "saved";
}

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

export const EventDetails = ({ event, isOpen, onClose, source }: EventDetailsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [calendarSupported, setCalendarSupported] = useState<boolean>(false);
  
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
    }
  }, [event]);
  
  // Vérifier si l'événement actuel est sauvegardé
  const isSaved = event ? savedEvents.some(saved => saved.id === event.id) : false;
  
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
        return; // L'utilisateur a annulé, pas d'erreur à afficher
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-white/85 backdrop-blur-sm border-2 border-amber-300 shadow-2xl rounded-2xl"
        style={{
          backgroundImage: `url('${getBackgroundFallback('Historical Parchment Background Portrait.jpg')}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-describedby="event-details-description"
      >
        <div id="event-details-description" className="sr-only">
          Détails de l'événement sélectionné
        </div>
        
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/85 rounded-2xl" />
        
        <div className="relative z-10 p-6">
          {/* Header avec titre et boutons - Style LocationDetailsModern */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-amber-200">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a2138] font-serif mb-2">
                {event.title}
              </h2>
              <p className="text-sm text-amber-700 font-medium">
                {event.artistName} • {event.type === 'exposition' ? 'Exposition' : 'Concert'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {/* Bouton de like */}
              <LikeButton 
                entryId={`event-${event.id}`}
                variant="icon"
                showCount={true}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full shadow-md"
              />
              
              {/* Bouton save */}
              <ActionButton
                variant="save"
                active={isSaved}
                icon={isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                onClick={toggleSaveEvent}
                tooltip={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full shadow-md"
              />
              
              {/* Bouton share */}
              <ShareButton
                title={`${event.title} - Île Feydeau`}
                text={`Découvrez ${event.title} par ${event.artistName} sur l'Île Feydeau à Nantes!`}
                url={window.location.href}
              />
              
              {/* Bouton fermer */}
              <ActionButton
                variant="ghost"
                icon={<X className="h-5 w-5" />}
                onClick={onClose}
                tooltip="Fermer"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full shadow-md"
              />
            </div>
          </div>
          
          {/* Informations pratiques */}
          <div className="mb-6 p-4 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                <span>{event.days.map(day => day === "samedi" ? "Samedi" : "Dimanche").join("/")} • {event.time}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                <span>{getLocationNameById(event.locationId) || event.locationName}</span>
              </div>
            </div>
          </div>
          
          {/* Boutons d'action principaux */}
          <div className="flex gap-3 mb-6">
            <TreasureButton 
              variant="secondary"
              size="md"
              onClick={navigateToMap}
              className="flex-1"
            >
              Voir sur la carte
            </TreasureButton>
            
            <TreasureButton 
              variant="secondary"
              size="md"
              onClick={handleAddToCalendar}
              className="flex-1"
            >
              Ajouter au calendrier
            </TreasureButton>
          </div>
          
          {/* Description de l'artiste */}
          {artist?.presentation && (
            <div className="mb-6 p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                À propos de l'artiste
              </h3>
              <ArtistDescription text={artist.presentation} />
            </div>
          )}

          {/* Informations de contact pour les concerts */}
          {event.type === "concert" && artist && (artist.email || artist.website) && (
            <div className="mb-6 p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <h3 className="font-semibold text-[#1a2138] mb-3 font-serif text-lg">
                Contact
              </h3>
              <div className="space-y-2">
                {artist.email && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2">Email:</span>
                    <a href={`mailto:${artist.email}`} className="text-blue-600 hover:underline">
                      {artist.email}
                    </a>
                  </div>
                )}
                {artist.website && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-2">Site web:</span>
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
              </div>
            </div>
          )}

          {/* Actions du bas - Style LocationDetailsModern */}
          <div className="space-y-3">
            <Button 
              onClick={handleContribute}
              className="w-full bg-[#1a2138] hover:bg-[#2a3148] text-white rounded-full font-medium"
            >
              Contribuer à la galerie
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
