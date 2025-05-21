import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createLogger } from "@/utils/logger";
import { MapComponent, MAP_WIDTH, MAP_HEIGHT } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsToggle } from "@/components/SettingsToggle";
import { trackFeatureUsage } from "../services/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import X from "lucide-react/dist/esm/icons/x";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Info from "lucide-react/dist/esm/icons/info";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import { VisitProgress } from "@/components/VisitProgress";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetails } from "@/components/EventDetails";
import { type Event, events, getLocationIdForEvent } from "@/data/events";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { toast } from "@/components/ui/use-toast";

// Créer un logger pour le composant Map
const logger = createLogger('Map');

interface MapProps {
  fullScreen?: boolean;
}

const Map = ({ fullScreen = false }: MapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utiliser les hooks pour accéder aux données centralisées
  const { locations } = useLocations();
  const { getEventById } = useEvents();
  
  // Utiliser directement les emplacements du service de données
  const [mapLocations, setMapLocations] = useState(locations);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [highlightedLocation, setHighlightedLocation] = useState<string | null>(null);
  
  // Initialiser les données des lieux en incluant l'état de visite
  useEffect(() => {
    // Essayer de charger les lieux avec leur état de visite depuis le localStorage
    const savedLocations = localStorage.getItem("mapLocations");
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations);
        // Fusionner les données sauvegardées avec les données actuelles
        const mergedLocations = locations.map(loc => {
          const savedLoc = parsedLocations.find((saved: any) => saved.id === loc.id);
          return savedLoc ? { ...loc, visited: savedLoc.visited } : loc;
        });
        setMapLocations(mergedLocations);
      } catch (error) {
        logger.error('Erreur lors du chargement des lieux visités', { error });
      }
    }
  }, [locations]);
  
  // Charger les événements sauvegardés depuis le localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("savedEvents");
    if (savedEvents) {
      setSavedEventIds(JSON.parse(savedEvents));
    }
  }, []);
  
  // Recharger les événements sauvegardés lorsqu'on ferme la vue détaillée d'un événement
  useEffect(() => {
    if (!selectedEvent) {
      // Quand on ferme la vue détaillée, on recharge les événements sauvegardés
      const savedEvents = localStorage.getItem("savedEvents");
      if (savedEvents) {
        setSavedEventIds(JSON.parse(savedEvents));
      }
    }
  }, [selectedEvent]);
  
  // Mettre à jour les emplacements lorsque les données changent
  useEffect(() => {
    logger.info('Mise à jour des emplacements sur la carte depuis le service de données');
    setMapLocations(locations);
  }, [locations]);
  
  // Fonction pour sauvegarder/retirer un événement des favoris
  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const savedEvents = [...savedEventIds];
    const eventIndex = savedEvents.indexOf(event.id);
    
    if (eventIndex === -1) {
      // Ajouter l'événement aux favoris
      savedEvents.push(event.id);
      toast({
        title: "Événement sauvegardé",
        description: `${event.title} a été ajouté à vos favoris.`,
      });
    } else {
      // Retirer l'événement des favoris
      savedEvents.splice(eventIndex, 1);
      toast({
        title: "Événement retiré",
        description: `${event.title} a été retiré de vos favoris.`,
      });
    }
    
    setSavedEventIds(savedEvents);
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
  };
  
  // Effet pour mettre en évidence le lieu lorsqu'on arrive depuis l'histoire complète ou l'admin
  useEffect(() => {
    // Vérifier si on a un ID de lieu à mettre en évidence dans l'état de location
    const highlightId = location.state?.highlightLocationId;
    const fromEvent = location.state?.fromEvent === true;
    const fromHistory = location.state?.fromHistory === true;
    
    // Vérifier si on a un ID de lieu à mettre en évidence dans les paramètres d'URL
    const searchParams = new URLSearchParams(window.location.search);
    const highlightParam = searchParams.get('highlight');
    const locationParam = searchParams.get('location');
    const eventParam = searchParams.get('event');
    
    // Utiliser l'ID du paramètre d'URL ou de l'état de location
    const locationIdToHighlight = highlightParam || locationParam || highlightId || eventParam;
    
    // Si aucun lieu à mettre en évidence, ne rien faire
    if (!locationIdToHighlight) {
      return;
    }
    
    logger.info(`Mise en évidence du lieu avec ID: ${locationIdToHighlight}`);
    
    // Convertir l'ID d'événement en ID de lieu si nécessaire
    let locationIdToUse = locationIdToHighlight;
    
    // Si c'est un ID d'événement, le convertir en ID de lieu
    if (eventParam && locationIdToHighlight === eventParam) {
      const event = events.find(e => e.id === eventParam);
      if (event) {
        locationIdToUse = event.locationId;
        logger.debug(`Conversion de l'ID d'événement ${eventParam} en ID de lieu ${locationIdToUse}`);
      }
    }
    
    // Trouver l'emplacement correspondant
    let locationToHighlight = mapLocations.find(loc => loc.id === locationIdToUse);
    
    // Si le lieu n'est pas trouvé directement, essayer de trouver un lieu dont l'ID commence par locationIdToUse
    // Cela permet de gérer les cas où on passe un ID partiel comme "quai-turenne" au lieu de "quai-turenne-8"
    if (!locationToHighlight && locationIdToUse) {
      locationToHighlight = mapLocations.find(loc => loc.id.startsWith(locationIdToUse));
      if (locationToHighlight) {
        logger.info(`Lieu avec ID exact ${locationIdToUse} non trouvé, mais un lieu correspondant a été trouvé: ${locationToHighlight.id}`);
        locationIdToUse = locationToHighlight.id; // Mettre à jour l'ID avec celui qui a été trouvé
      }
    }
    
    if (locationToHighlight) {
      logger.debug('Lieu trouvé pour mise en évidence', { 
        id: locationToHighlight.id, 
        name: locationToHighlight.name,
        x: locationToHighlight.x,
        y: locationToHighlight.y
      });
      
      // Mettre en évidence le lieu (maintenant sans limite de temps)
      // La mise en évidence restera active jusqu'à ce que l'utilisateur interagisse avec la carte
      setHighlightedLocation(locationIdToUse);
      
      // N'ouvrir la programmation que si nous ne venons pas de l'historique ou des détails d'événement
      if (!fromHistory && !fromEvent) {
        setActiveLocation(locationIdToUse);
      }
      
      logger.debug(`Mise en évidence permanente du lieu ${locationIdToUse} jusqu'à la prochaine action utilisateur`);
    } else {
      logger.warn(`Lieu avec ID ${locationIdToHighlight} non trouvé dans mapLocations`);
    }
  }, [location, mapLocations, events]);
  
  const handleLocationClick = (locationId: string) => {
    logger.info(`Clic sur l'emplacement ${locationId}`);
    
    // Stocker l'ID du lieu actif pour la mise en évidence
    setHighlightedLocation(locationId);
    
    // Définir le lieu comme actif pour afficher ses détails
    setActiveLocation(locationId);
    
    // Trouver les événements associés à ce lieu en utilisant le hook useEvents
    const locationEvents = mapLocations.find(l => l.id === locationId)?.events || [];
    const eventsData = locationEvents.map(eventId => getEventById(eventId)).filter(Boolean) as Event[];
    logger.debug(`Événements trouvés pour ${locationId}`, eventsData);
    
    // Toujours afficher d'abord les informations du lieu, jamais directement l'événement
    setSelectedEvent(null);
  };

  const markLocationAsVisited = (locationId: string, visited: boolean) => {
    const updatedLocations = mapLocations.map(loc => 
      loc.id === locationId ? { ...loc, visited } : loc
    );
    
    setMapLocations(updatedLocations);
    localStorage.setItem('mapLocations', JSON.stringify(updatedLocations));
    
    // Réinitialiser la mise en évidence lorsque l'utilisateur marque un lieu comme visité
    // Cela permet de désactiver la mise en évidence permanente lors d'une action utilisateur
    setHighlightedLocation(null);
    
    toast({
      title: visited ? "Lieu marqué comme visité" : "Lieu marqué comme non visité",
      description: `${mapLocations.find(l => l.id === locationId)?.name} a été mis à jour.`,
    });
  };

  // Cette fonction n'est plus nécessaire car elle est gérée par le composant EventDetails

  const getLocationEvents = (locationId: string) => {
    // 1. Récupérer les événements à partir des IDs stockés dans le lieu
    const location = mapLocations.find(l => l.id === locationId);
    if (!location) return [];
    
    // 2. Récupérer également tous les événements qui ont ce locationId
    // Cela permet de trouver les événements qui ne sont pas explicitement listés dans location.events
    const eventsFromLocation = location.events.map(eventId => getEventById(eventId)).filter(Boolean) as Event[];
    
    // 3. Rechercher tous les événements qui ont ce locationId
    const eventsWithThisLocation = events.filter(event => event.locationId === locationId);
    
    // 4. Fusionner les deux listes et éliminer les doublons
    const allEvents = [...eventsFromLocation, ...eventsWithThisLocation];
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    return uniqueEvents;
  };

  // Calculate visited locations count
  const visitedCount = mapLocations.filter(loc => loc.visited).length;
  const totalCount = mapLocations.length;

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto px-4 pt-4">
        <header className="mb-2 flex items-center justify-between">
          <div className="w-1/4"></div>
          <h1 className="text-xl font-bold text-[#4a5d94] text-center">Carte & Parcours</h1>
          <div className="flex items-center space-x-2 w-1/4 justify-end">
            <ShareButton 
              title="Parcours Île Feydeau" 
              text="Découvrez mon parcours sur l'Île Feydeau à Nantes!" 
            />
          </div>
        </header>
        
        {/* Légende sous le titre - toujours visible */}
        <div className="flex items-center justify-center mb-4 text-sm text-[#4a5d94] fade-in">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-5 h-5 bg-[#4CAF50] rounded-full mr-1 text-white text-xs font-medium">
                {visitedCount}
              </div>
              <span className="text-xs">{visitedCount > 1 ? 'Visités' : 'Visité'}</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-5 h-5 bg-[#4a5d94] rounded-full mr-1 text-white text-xs font-medium">
                {totalCount - visitedCount}
              </div>
              <span className="text-xs">À découvrir</span>
            </div>
          </div>
        </div>
        
        {!fullScreen && (
          <div className="text-center mb-4 text-sm text-[#4a5d94] fade-in">
            <p>Explorez l'île Feydeau et marquez les lieux visités</p>
            
            {/* Légende sous le titre */}
            <div className="flex items-center justify-center mt-2 space-x-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-5 h-5 bg-[#ff7a45] rounded-full mr-1 text-white text-xs font-medium">
                  {visitedCount}
                </div>
                <span className="text-xs">{visitedCount > 1 ? 'Visités' : 'Visité'}</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-5 h-5 bg-[#4a5d94] rounded-full mr-1 text-white text-xs font-medium">
                  {totalCount - visitedCount}
                </div>
                <span className="text-xs">À découvrir</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative">
          {/* Map container */}
          <div className="bg-white rounded-lg mb-4 border-0 transition-all duration-300 hover:shadow-lg w-full">
            <div className="flex justify-center">
              <MapComponent 
                locations={mapLocations} 
                activeLocation={activeLocation}
                highlightedLocation={highlightedLocation} 
                onClick={(e) => {
                  // Trouver l'élément avec l'ID de location
                  const target = e.target as HTMLElement;
                  let element = target;
                  
                  // Remonter dans l'arbre DOM pour trouver l'élément parent avec un ID de location
                  while (element && !element.id?.startsWith('location-')) {
                    element = element.parentElement as HTMLElement;
                    if (!element) break;
                  }
                  
                  // Extraire l'ID de location
                  const locationId = element?.id?.replace('location-', '');
                  
                  console.log('Clic sur élément:', { targetId: target.id, elementId: element?.id, locationId });
                  
                  if (locationId && mapLocations.some(loc => loc.id === locationId)) {
                    handleLocationClick(locationId);
                  } else if (activeLocation) {
                    handleLocationClick(activeLocation);
                  }
                }}
                readOnly={false} 
              />
            </div>
          </div>
          
          {/* La légende a été déplacée sous le titre */}
        </div>
        
        {/* Bottom text instruction */}
        {!fullScreen ? (
          <p className="text-center text-sm text-[#4a5d94] mt-2">Cliquez sur les points pour plus d'informations sur chaque lieu.</p>
        ) : null}
        
        {/* Location list - only shown in non-fullscreen mode */}
        {!fullScreen && (
          <div className="bg-white rounded-lg p-4 shadow-md border-0 mt-4">
            <h3 className="font-medium text-[#4a5d94] mb-3">Lieux à visiter</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mapLocations.map((location) => (
                <Card 
                  key={location.id}
                  className={`cursor-pointer transition-all duration-200 border-0 ${activeLocation === location.id ? 'ring-2 ring-[#ff7a45]' : ''}`}
                  onClick={() => handleLocationClick(location.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${location.visited ? 'bg-[#ff7a45]' : 'bg-[#4a5d94]'}`}></div>
                      <p className="text-sm font-medium text-[#4a5d94] truncate">{location.name}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => {
                          markLocationAsVisited(location.id, !location.visited);
                        }}
                      >
                        {location.visited ? 'Visité ✓' : 'Marquer'}
                      </Button>
                      
                      {getLocationEvents(location.id).length > 0 && (
                        <span className="text-xs text-[#8c9db5]">{getLocationEvents(location.id).length} événement(s)</span>
                      )}
// ...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Removed visit confirmation dialog */}
      
      {/* Fullscreen location details overlay */}
      {fullScreen && activeLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setActiveLocation(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#4a5d94]">
                {mapLocations.find(l => l.id === activeLocation)?.name}
              </h2>
              <Button variant="ghost" size="sm" className="-mt-2 -mr-2" onClick={() => setActiveLocation(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-[#8c9db5] mb-3">
              {/* Display location if available */}
              Île Feydeau, Nantes
            </p>
            
            <p className="text-sm text-[#4a5d94] mb-4">
              {mapLocations.find(l => l.id === activeLocation)?.description}
            </p>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#4a5d94] text-[#4a5d94]"
              onClick={() => {
                navigate('/location-history', { state: { selectedLocationId: activeLocation } });
              }}
            >
              <Info className="h-3 w-3 mr-1" />
              Voir l'histoire complète
            </Button>
            
            <div className="mb-6"></div>
            
            {getLocationEvents(activeLocation).length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-[#1a2138] mb-2">Événements à cet endroit:</h3>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 -mr-2">
                  {getLocationEvents(activeLocation).map((event) => (
                    <div 
                      key={event.id} 
                      className={`bg-[#f0f5ff] p-3 rounded-lg cursor-pointer hover:bg-[#e0ebff] transition-colors ${savedEventIds.includes(event.id) ? 'border-l-4 border-l-[#ff7a45]' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => setSelectedEvent(event)}>
                          <p className="font-medium text-[#1a2138]">{event.title}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 text-[#8c9db5]" />
                            <p className="text-xs text-[#8c9db5]">{event.time}</p>
                          </div>
                          <p className="text-xs text-[#4a5d94] mt-1">{event.artistName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={(e) => handleSaveEvent(event, e)}
                        >
                          {savedEventIds.includes(event.id) ? (
                            <BookmarkCheck className="h-5 w-5 text-[#ff7a45]" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-[#8c9db5]" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                className="border-[#4a5d94] text-[#4a5d94] flex-1"
                onClick={() => activeLocation && markLocationAsVisited(activeLocation, !mapLocations.find(l => l.id === activeLocation)?.visited)}
              >
                {mapLocations.find(l => l.id === activeLocation)?.visited ? 'Marquer comme non visité' : 'Marquer comme visité'}
              </Button>
              
              <Button 
                className="bg-[#ff7a45] hover:bg-[#ff9d6e] flex-1"
                onClick={() => {
                  // Fermer la vue détaillée mais conserver la mise en évidence du lieu
                  // Le lieu reste en surbrillance grâce à highlightedLocation qui n'est pas réinitialisé
                  setActiveLocation(null);
                }}
              >
                Retour à la carte
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Event details using the unified component */}
      <EventDetails 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          setHighlightedLocation(null); // Réinitialiser la mise en évidence
        }}
        source="map"
      />
      
      {/* Boîte de dialogue de consentement de localisation retirée */}
      
      {/* Bottom Navigation */}
      <BottomNavigation />

    </div>
  );
};

export default Map;
