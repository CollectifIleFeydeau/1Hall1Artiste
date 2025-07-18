import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getImagePath } from "@/utils/imagePaths";
import { setEventContributionContext } from "@/services/contextualContributionService";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Info from "lucide-react/dist/esm/icons/info";
import X from "lucide-react/dist/esm/icons/x";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Camera from "lucide-react/dist/esm/icons/camera";
import { ShareButton } from "@/components/ShareButton";
import { saveEvent, getSavedEvents, removeSavedEvent } from "@/services/savedEvents";
import { type Event, getEventsByLocation } from "@/data/events";
import { getLocationNameById } from "@/data/locations";
import { artists } from "@/data/artists";
import { trackFeatureUsage, trackEvent } from "@/services/analytics";
import { InstagramCarousel } from "@/components/InstagramCarousel";
import { TruncatedText } from "@/components/TruncatedText";
import { addToCalendar, isCalendarSupported, CalendarErrorType } from "@/services/calendarService";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  source: "map" | "program" | "saved"; // Pour savoir d'où vient l'utilisateur
}

// Composant pour afficher la description de l'artiste avec un teaser et une option pour développer
interface ArtistDescriptionProps {
  text: string;
}

const ArtistDescription = ({ text }: ArtistDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Créer un teaser en prenant les premiers caractères du texte
  const createTeaser = (fullText: string): string => {
    // Environ 100-120 caractères pour 1-2 lignes
    const maxLength = 120;
    
    if (fullText.length <= maxLength) return fullText;
    
    // Trouver le dernier espace avant la limite pour ne pas couper un mot
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
    <div className="text-sm text-[#4a5d94]">
      {/* Afficher soit le teaser, soit le texte complet */}
      <div 
        onClick={showExpandOption ? toggleExpand : undefined}
        onKeyDown={(e) => {
          if (showExpandOption && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleExpand();
          }
        }}
        tabIndex={showExpandOption ? 0 : undefined}
        role={showExpandOption ? "button" : undefined}
        aria-expanded={isExpanded}
        className={showExpandOption ? "cursor-pointer" : ""}
      >
        <ReactMarkdown components={{
          p: ({node, ...props}) => <p className="mb-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold mb-2" {...props} />,
          hr: ({node, ...props}) => <hr className="my-4 border-t border-[#d8e3ff]" {...props} />
        }}>
          {isExpanded ? text : teaser}
        </ReactMarkdown>
        
        {/* Indicateur visuel pour développer/réduire */}
        {showExpandOption && (
          <div className="flex items-center text-xs text-[#8c9db5] mt-1">
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                <span>Réduire</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                <span>(pour voir +)</span>
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
  
  // État pour les événements sauvegardés
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [calendarSupported, setCalendarSupported] = useState<boolean>(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  
  // Vérifier si l'événement est sauvegardé au chargement
  useEffect(() => {
    if (event) {
      const currentSavedEvents = getSavedEvents();
      setSavedEvents(currentSavedEvents);
      
      // Vérifier si le calendrier est supporté
      setCalendarSupported(isCalendarSupported());
      
      // Charger les événements liés au même lieu
      if (event.locationId) {
        const eventsAtSameLocation = getEventsByLocation(event.locationId)
          .filter(e => e.id !== event.id); // Exclure l'événement actuel
        setRelatedEvents(eventsAtSameLocation);
      }
    }
  }, [event]);
  
  // Vérifier si l'événement actuel est sauvegardé
  const isSaved = event ? savedEvents.some(saved => saved.id === event.id) : false;
  
  // Fonction pour naviguer vers la carte
  const navigateToMap = () => {
    if (!event) return;
    
    // Ajouter des logs pour déboguer
    console.log(`[EventDetails] Navigation vers la carte pour l'événement ${event.id} au lieu ${event.locationId}`);
    console.log(`[EventDetails] Source de navigation: ${source}`);
    
    // Track event view in analytics
    trackFeatureUsage.eventView(event.id, event.title);
    
    // Fermer d'abord le dialogue pour éviter les problèmes de navigation
    onClose();
    
    // Utiliser setTimeout pour s'assurer que le dialogue est fermé avant la navigation
    setTimeout(() => {
      // Naviguer vers la carte avec un paramètre fromEvent pour indiquer que nous venons des détails d'un événement
      console.log(`[EventDetails] Redirection vers /map avec highlightLocationId=${event.locationId}`);
      
      navigate(`/map`, { 
        state: { 
          highlightLocationId: event.locationId,
          fromEvent: true,
          timestamp: new Date().getTime() // Ajouter un timestamp pour garantir que l'état est considéré comme nouveau
        } 
      });
    }, 100);
  };
  
  // Fonction pour contribuer à la galerie communautaire avec le contexte de l'événement
  const handleContribute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    // Enregistrer le contexte de contribution
    setEventContributionContext(event);
    
    // Naviguer vers la galerie communautaire, onglet contribution
    navigate("/community?tab=contribute");
    onClose();
    
    // Tracker l'utilisation de la fonctionnalité
    trackFeatureUsage.contribute_from_event({
      eventId: event.id,
      eventName: event.title
    });
  };

  // Fonction pour gérer la sauvegarde/suppression d'un événement
  const toggleSaveEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    const isCurrentlySaved = savedEvents.some(saved => saved.id === event.id);
    
    if (isCurrentlySaved) {
      // Retirer des favoris
      removeSavedEvent(event.id);
      setSavedEvents(getSavedEvents());

      
      // Analytics
      trackFeatureUsage.unsave_event({
        eventId: event.id,
        eventName: event.title
      });
    } else {
      // Ajouter aux favoris
      saveEvent(event);
      setSavedEvents(getSavedEvents());
      
      
      // Analytics
      trackFeatureUsage.save_event({
        eventId: event.id,
        eventName: event.title
      });
    }
  };
  
  // Fonction pour ajouter un événement au calendrier
  const handleAddToCalendar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    try {
      // Tracker l'utilisation de la fonctionnalité
      trackEvent('Calendar', 'Add To Calendar', event.title);
      
      // Ajouter l'événement au calendrier
      const result = await addToCalendar(event);
      
      if (result.success) {
        toast({
          title: "Événement ajouté au calendrier",
          description: `${event.title} a été ajouté à votre calendrier.`,
        });
      } else {
        // Gérer les différents types d'erreurs
        if (result.errorType === CalendarErrorType.NOT_SUPPORTED) {
          toast({
            title: "Fonctionnalité non supportée",
            description: "Votre appareil ne supporte pas l'ajout au calendrier.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur",
            description: result.errorMessage || "Une erreur est survenue lors de l'ajout au calendrier.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout au calendrier:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive"
      });
    }
  };
  
  // Si pas d'événement ou si le dialogue n'est pas ouvert, ne rien afficher
  if (!event || !isOpen) return null;
  
  // Déterminer si l'événement est sauvegardé
  const isEventSaved = isSaved;
  
  // Récupérer l'artiste correspondant à l'événement
  const artist = artists.find(artist => artist.id === event.artistId);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-md max-h-[85vh] overflow-y-auto pt-14"
        aria-describedby="event-details-description"
      >
        <div id="event-details-description" className="sr-only">
          Détails de l'événement sélectionné
        </div>
        {/* Barre d'icônes en haut */}
        <div className="absolute top-0 left-0 right-0 flex justify-end items-center p-3 bg-white z-10">
          <div className="flex space-x-4">
            <button
              className={`flex items-center justify-center h-10 w-10 rounded-full border ${isEventSaved ? "border-[#ff7a45] text-[#ff7a45]" : "border-gray-300 text-gray-500"} transition-all duration-200 hover:shadow-sm`}
              onClick={toggleSaveEvent}
              title={isEventSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
              type="button"
            >
              {isEventSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
            
            <ShareButton
              title={`${event.title} - Île Feydeau`}
              text={`Découvrez ${event.title} par ${event.artistName} sur l'Île Feydeau à Nantes!`}
              url={window.location.href}
            />
            
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-500 transition-all duration-200 hover:shadow-sm"
              onClick={onClose}
              title="Fermer"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className={`h-1 ${event.type === "exposition" ? "bg-[#4a5d94]" : "bg-[#ff7a45]"}`} />
        
        <DialogHeader className="sr-only">
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-2 px-1 overflow-x-hidden">
          {event.type === "exposition" ? (
            <>
              <div className="bg-[#e0ebff] p-3 rounded-lg mb-2">
                <h3 className="text-lg font-medium text-[#1a2138] break-words">
                  {/* Pas de troncature pour le titre principal, mais utilisation de break-words */}
                  {event.title}
                </h3>
              </div>
              <p className="text-sm text-[#4a5d94] mb-2">
                <TruncatedText 
                  text={event.artistName} 
                  maxLength={40} 
                  className="text-sm text-[#4a5d94]"
                />
              </p>
            </>
          ) : (
            <div className="bg-[#f9f2ee] p-3 rounded-lg mb-3">
              <h3 className="text-lg font-medium text-[#1a2138] break-words">
                {/* Pas de troncature pour le titre principal, mais utilisation de break-words */}
                {event.title}
              </h3>
            </div>
          )}
          <div className="flex items-center mb-4">
            <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
            <p className="text-xs text-[#8c9db5]">
              <TruncatedText 
                text={`${getLocationNameById(event.locationId)} • ${event.time}`} 
                maxLength={40} 
                className="text-xs text-[#8c9db5]"
              />
            </p>
          </div>
          
          <div className="bg-[#f0f5ff] p-3 rounded-lg mb-4">
            {/* Afficher la bio de l'artiste si disponible */}
            {artist?.bio && (
              <ArtistDescription text={artist.bio} />
            )}
            
            {/* Afficher la présentation de l'artiste si disponible */}
            {artist?.presentation && (
              <div className="mt-3 pt-3 border-t border-[#d8e3ff]">
                <h4 className="text-sm font-medium mb-2 text-[#4a5d94]">Présentation:</h4>
                <ArtistDescription text={artist.presentation} />
              </div>
            )}
            
            {/* Fallback: afficher le texte de présentation de l'événement si pas de bio artiste */}
            {!artist?.bio && artist?.presentation && (
              <div className="mt-3 pt-3 border-t border-[#d8e3ff]">
                <ArtistDescription text={artist.presentation} />
              </div>
            )}
            
            {/* Afficher les informations complètes de l'artiste pour les concerts */}
            {event.type === "concert" && artist && (
              <div className="space-y-4">
                {/* Email de contact */}
                {artist.email && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">Contact email:</h4>
                    <a 
                      href={`mailto:${artist.email}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {artist.email}
                    </a>
                  </div>
                )}

                {/* Site web */}
                {artist.website && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">Site web:</h4>
                    <a 
                      href={artist.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {artist.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* Téléphone */}
                {artist.phone && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">Téléphone:</h4>
                    <a 
                      href={`tel:${artist.phone}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {artist.phone}
                    </a>
                  </div>
                )}

                {/* Facebook */}
                {artist.facebook && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">Facebook:</h4>
                    <span className="text-sm text-gray-700">{artist.facebook}</span>
                  </div>
                )}

                {/* YouTube */}
                {artist.youtube && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">YouTube:</h4>
                    <a 
                      href={artist.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {artist.youtube.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* TikTok */}
                {artist.tiktok && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-[#4a5d94]">TikTok:</h4>
                    <a 
                      href={artist.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {artist.tiktok.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {/* Directeur/Chef */}
                {artist.director && (
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Direction:</span>
                    <span className="text-sm text-gray-700">{artist.director}</span>
                  </div>
                )}

                {/* Membres */}
                {artist.members && (
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Membres:</span>
                    <span className="text-sm text-gray-700">{artist.members}</span>
                  </div>
                )}
              </div>
            )}

            {/* Afficher les photos pour les concerts si disponibles */}
            {event.type === "concert" && artist?.photos && artist.photos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  Photos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {artist.photos.map((photo, index) => (
                    <div key={index} className="relative pb-[75%] overflow-hidden rounded-lg">
                      <img 
                        src={photo} 
                        alt={`${event.artistName} - photo ${index + 1}`}
                        className="absolute top-0 left-0 object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Affichage des vidéos si présentes */}
            {event.type === "concert" && artist?.videos && artist.videos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  Vidéos
                </h4>
                <div className="grid grid-cols-1 gap-4 w-full">
                  {artist.videos.map((videoUrl, index) => {
                    // Déterminer le type de vidéo (YouTube, Vimeo, etc.)
                    let embedUrl = videoUrl;
                    
                    // Traitement des URLs YouTube
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                      // Extraire l'ID de la vidéo YouTube
                      let videoId = '';
                      
                      if (videoUrl.includes('youtube.com/watch?v=')) {
                        videoId = videoUrl.split('v=')[1];
                        // Gérer les paramètres supplémentaires
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
                    // Traitement des URLs Vimeo (à ajouter si nécessaire)
                    // else if (videoUrl.includes('vimeo.com')) { ... }
                    
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
            
            {/* Nous ne montrons plus l'adresse Instagram car le widget l'affiche déjà */}
            
            {/* Instagram Embed - Show actual Instagram feed */}
            {artist && artist.instagram && artist.instagram.includes('instagram') && (
              <div className="border-t border-[#d8e3ff] pt-4 mt-4">
                {/* <h4 className="text-sm font-medium mb-3 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  Photos Instagram de l'artiste
                </h4> */}
                <div 
                  className="instagram-embed-container w-full overflow-hidden rounded-lg relative" 
                  style={{
                    paddingBottom: '100%',
                    height: 0
                  }}
                >
                  <iframe
                    title={`Instagram feed de ${event.artistName}`}
                    src={`https://www.instagram.com/${artist.instagram.split('/').pop().split('?')[0]}/embed?hidecaption=1&header=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    allowtransparency="true"
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
            )}
            
            <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2 mt-6 border-t border-[#d8e3ff] pt-4">
              {source === "program" ? (
                <Button 
                  className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1 text-xs sm:text-sm"
                  onClick={navigateToMap}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
              ) : (
                <Button 
                  className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1 text-xs sm:text-sm"
                  onClick={() => navigate("/program")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir le programme
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="border-[#4a5d94] text-[#4a5d94] flex-1 text-xs sm:text-sm"
                onClick={() => {
                  navigate('/location-history', { 
                    state: { 
                      selectedLocationId: event.locationId,
                      fromEvent: true
                    } 
                  });
                  onClose();
                }}
              >
                <Info className="h-4 w-4 mr-2" />
                Histoire du lieu
              </Button>
            </div>
            
            {/* Bouton pour ajouter au calendrier */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
              <Button 
                variant="outline"
                className="border-[#4a5d94] text-[#4a5d94] flex-1 text-xs sm:text-sm"
                onClick={handleAddToCalendar}
                disabled={!calendarSupported}
              >
                {calendarSupported ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Ajouter au calendrier
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager l'événement
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                className="border-[#ff7a45] text-[#ff7a45] flex-1 text-xs sm:text-sm"
                onClick={handleContribute}
              >
                <Camera className="h-4 w-4 mr-2" />
                Partager un souvenir
              </Button>
            </div>
            
            <Button 
              className="w-full mt-3 border-[#8c9db5] text-[#8c9db5] text-xs sm:text-sm"
              variant="outline"
              onClick={onClose}
            >
              Retour
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
