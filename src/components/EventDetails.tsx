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
import { ShareButton } from "@/components/ShareButton";
import { saveEvent, getSavedEvents, removeSavedEvent } from "@/services/savedEvents";
import { type Event } from "@/data/events";
import { locations } from "@/data/locations";
import { trackFeatureUsage } from "@/services/analytics";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  source: "map" | "program"; // Pour savoir d'où vient l'utilisateur
}

export const EventDetails = ({ event, isOpen, onClose, source }: EventDetailsProps) => {
  // Si pas d'événement ou si le dialogue n'est pas ouvert, ne rien afficher
  if (!event || !isOpen) return null;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Charger les événements sauvegardés
    const savedEvents = getSavedEvents();
    setSavedEventIds(savedEvents.map(event => event.id));
  }, []);
  
  const handleSaveEvent = (e: React.MouseEvent) => {
    if (!event) return;
    e.stopPropagation();
    
    if (savedEventIds.includes(event.id)) {
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
  
  const handleViewOnMap = () => {
    if (!event) return;
    // Track event view in analytics
    trackFeatureUsage.eventView(event.id, event.title);
    // Naviguer vers la carte avec l'ID de l'événement
    // Fermer d'abord le dialogue pour éviter les problèmes de navigation
    onClose();
    // Utiliser setTimeout pour s'assurer que le dialogue est fermé avant la navigation
    setTimeout(() => {
      navigate(`/map?event=${event.id}`);
    }, 100);
  };
  
  // La vérification est déjà faite au début du composant
  
  const isEventSaved = savedEventIds.includes(event.id);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] pt-12">
        {/* Barre d'icônes en haut */}
        <div className="absolute top-0 left-0 right-0 flex justify-end items-center p-3 bg-white z-10">
          <div className="flex space-x-4">
            <button
              className={`flex items-center justify-center h-10 w-10 rounded-full border ${isEventSaved ? "border-[#ff7a45] text-[#ff7a45]" : "border-gray-300 text-gray-500"} transition-all duration-200 hover:shadow-sm`}
              onClick={handleSaveEvent}
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
        <DialogHeader>
          <DialogTitle className="text-[#1a2138] pr-16">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm font-medium text-[#4a5d94]">Par {event.artistName}</p>
          <div className="flex items-center mb-4">
            <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
            <p className="text-xs text-[#8c9db5]">{event.locationName} • {event.time}</p>
          </div>
          
          <div className="bg-[#f0f5ff] p-3 rounded-lg mb-4">
            <p className="text-sm text-[#4a5d94]">{event.description}</p>
          </div>
          
          <div className="border-t border-[#d8e3ff] pt-4 mt-4">
            <h4 className="text-sm font-medium mb-1 text-[#4a5d94] flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
              À propos de l'artiste
            </h4>
            <p className="text-sm text-[#4a5d94] mb-4 ml-4">{event.artistBio}</p>
            
            <h4 className="text-sm font-medium mb-1 text-[#4a5d94] flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
              Contact
            </h4>
            <p className="text-sm text-[#4a5d94] ml-4">
              <a href={`mailto:${event.contact}`} className="text-blue-600 hover:underline">
                {event.contact}
              </a>
            </p>
          </div>
          
          <div className="flex justify-between space-x-2 mt-6">
            {source === "program" ? (
              <Button 
                className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1"
                onClick={handleViewOnMap}
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
