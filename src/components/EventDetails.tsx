import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Info from "lucide-react/dist/esm/icons/info";
import X from "lucide-react/dist/esm/icons/x";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import { ShareButton } from "@/components/ShareButton";
import { saveEvent, getSavedEvents, removeSavedEvent } from "@/services/savedEvents";
import { type Event, getEventsByLocation } from "@/data/events";
import { locations } from "@/data/locations";
import { trackFeatureUsage } from "@/services/analytics";
import { InstagramCarousel } from "@/components/InstagramCarousel";
import { TruncatedText } from "@/components/TruncatedText";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  source: "map" | "program"; // Pour savoir d'où vient l'utilisateur
}

export const EventDetails = ({ event, isOpen, onClose, source }: EventDetailsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Charger les événements sauvegardés seulement quand le dialogue est ouvert
    if (isOpen && event) {
      const savedEvents = getSavedEvents();
      setSavedEventIds(savedEvents.map(e => e.id));
    }
  }, [isOpen, event]);
  
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
  
  // Fonction pour gérer la sauvegarde/suppression d'un événement
  const toggleSaveEvent = (e: React.MouseEvent) => {
    if (!event) return;
    e.stopPropagation();
    
    const isSaved = savedEventIds.includes(event.id);
    
    if (isSaved) {
      // Supprimer l'événement des sauvegardés
      removeSavedEvent(event.id);
      setSavedEventIds(savedEventIds.filter(id => id !== event.id));
      
      toast({
        title: "Événement retiré",
        description: `${event.title} a été retiré de vos événements sauvegardés.`,
      });
    } else {
      // Sauvegarder l'événement
      saveEvent(event);
      setSavedEventIds([...savedEventIds, event.id]);
      
      toast({
        title: "Événement sauvegardé",
        description: `${event.title} a été ajouté à vos événements sauvegardés.`,
      });
    }
  };
  
  // Si pas d'événement ou si le dialogue n'est pas ouvert, ne rien afficher
  if (!event || !isOpen) return null;
  
  // Déterminer si l'événement est sauvegardé
  const isEventSaved = savedEventIds.includes(event.id);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto pt-14">
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
            
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-[#4a5d94] transition-all duration-200 hover:shadow-sm"
              title="Partager"
              type="button"
              onClick={() => {
                // Ouvrir le menu de partage natif si disponible
                if (navigator.share) {
                  navigator.share({
                    title: `${event.title} - Île Feydeau`,
                    text: `Découvrez ${event.title} par ${event.artistName} sur l'Île Feydeau à Nantes!`,
                    url: window.location.href
                  }).catch(err => console.error('Erreur de partage:', err));
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            
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
        
        <div className="py-2 px-1">
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
                text={`${event.locationName} • ${event.time}`} 
                maxLength={40} 
                className="text-xs text-[#8c9db5]"
              />
            </p>
          </div>
          
          <div className="bg-[#f0f5ff] p-3 rounded-lg mb-4">
            <p className="text-sm text-[#4a5d94]">
              {/* Pas de troncature pour la description, car c'est un élément important */}
              {event.description}
            </p>
          </div>
          
          {/* Nous ne montrons plus l'adresse Instagram car le widget l'affiche déjà */}
          
          {/* Instagram Embed - Show actual Instagram feed */}
          {event.contact && event.contact.includes('instagram') && (
            <div className="border-t border-[#d8e3ff] pt-4 mt-4">
              {/* <h4 className="text-sm font-medium mb-3 text-[#4a5d94] flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                Photos Instagram de l'artiste
              </h4> */}
              <div 
                className="instagram-embed-container overflow-hidden rounded-lg" 
                style={{
                  maxHeight: '240px',
                  overflow: 'hidden'
                }}
              >
                <iframe
                  title={`Instagram feed de ${event.artistName}`}
                  src={`https://www.instagram.com/${event.contact.split('/').pop()}/embed?hidecaption=1&header=0`}
                  width="100%"
                  height="275"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency="true"
                  loading="lazy"
                  style={{
                    transform: 'scale(0.99)',
                    transformOrigin: 'top center',
                    marginTop: '-40px' // Réduit le décalage vers le haut pour éviter que le contenu soit coupé
                  }}
                ></iframe>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2 mt-6 border-t border-[#d8e3ff] pt-4">
            {source === "program" ? (
              <Button 
                className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1"
                onClick={navigateToMap}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Voir sur la carte
              </Button>
            ) : (
              <Button 
                className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1"
                onClick={() => navigate("/program")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Voir le programme
              </Button>
            )}
            
            <Button 
              variant="outline"
              className="border-[#4a5d94] text-[#4a5d94] flex-1"
              onClick={() => {
                navigate('/location-history', { 
                  state: { selectedLocationId: event.locationId } 
                });
                onClose();
              }}
            >
              <Info className="h-4 w-4 mr-2" />
              Histoire du lieu
            </Button>
          </div>
          
          <Button 
            className="w-full mt-3 border-[#8c9db5] text-[#8c9db5]"
            variant="outline"
            onClick={onClose}
          >
            Retour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
