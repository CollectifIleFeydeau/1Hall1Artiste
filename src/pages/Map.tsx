import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createLogger } from "@/utils/logger";
import { MapComponent, MAP_WIDTH, MAP_HEIGHT } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsToggle } from "@/components/SettingsToggle";
import { trackFeatureUsage } from "../services/analytics";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import X from "lucide-react/dist/esm/icons/x";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Info from "lucide-react/dist/esm/icons/info";
import { VisitProgress } from "@/components/VisitProgress";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { saveEvent, getSavedEvents, removeSavedEvent } from "@/services/savedEvents";
import { useToast } from "@/components/ui/use-toast";
import { type Event } from "@/data/events";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { getLocationIdForEvent } from "@/services/dataService";

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
  
  // Mettre à jour les emplacements lorsque les données changent
  useEffect(() => {
    logger.info('Mise à jour des emplacements sur la carte depuis le service de données');
    setMapLocations(locations);
  }, [locations]);
  
  const [activeLocation, setActiveLocation] = useState<string | null>(() => {
    // Si on arrive depuis l'histoire complète, on active le lieu correspondant
    return location.state?.highlightLocationId || null;
  });
  
  // Effet pour mettre en évidence le lieu lorsqu'on arrive depuis l'histoire complète ou l'admin
  useEffect(() => {
    logger.info('Vérification des paramètres pour mise en évidence d\'un lieu');
    
    // Vérifier si on a un ID de lieu à mettre en évidence dans l'état de location
    const highlightId = location.state?.highlightLocationId;
    logger.debug('ID de lieu dans l\'objet location.state', { highlightId });
    
    // Vérifier si on a un ID de lieu à mettre en évidence dans les paramètres d'URL
    const searchParams = new URLSearchParams(window.location.search);
    const highlightParam = searchParams.get('highlight');
    logger.debug('ID de lieu dans les paramètres URL', { highlightParam });
    
    // Utiliser l'ID du paramètre d'URL ou de l'état de location
    const locationIdToHighlight = highlightParam || highlightId;
    
    if (locationIdToHighlight) {
      logger.info(`Mise en évidence du lieu avec ID: ${locationIdToHighlight}`);
      setActiveLocation(locationIdToHighlight);
      
      // Trouver l'emplacement correspondant
      const locationToHighlight = mapLocations.find(loc => loc.id === locationIdToHighlight);
      if (locationToHighlight) {
        logger.debug('Lieu trouvé pour mise en évidence', { 
          id: locationToHighlight.id, 
          name: locationToHighlight.name,
          x: locationToHighlight.x,
          y: locationToHighlight.y
        });
      } else {
        logger.warn(`Lieu avec ID ${locationIdToHighlight} non trouvé dans mapLocations`);
      }
    } else {
      logger.info('Aucun lieu à mettre en évidence');
    }
  }, [location, mapLocations]);
  
  // Effet pour vérifier que les coordonnées sont dans les limites
  useEffect(() => {
    logger.info('Vérification des coordonnées des emplacements');
    logger.debug('Dimensions du conteneur de la carte', {
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT
    });
    
    // Vérifier que les coordonnées sont dans les limites
    mapLocations.forEach(loc => {
      if (loc.x < 0 || loc.x > MAP_WIDTH || loc.y < 0 || loc.y > MAP_HEIGHT) {
        logger.warn(`Coordonnées hors limites pour ${loc.name}`, {
          id: loc.id,
          x: loc.x,
          y: loc.y,
          mapWidth: MAP_WIDTH,
          mapHeight: MAP_HEIGHT
        });
      }
    });
  }, [mapLocations]);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Charger les événements sauvegardés
  useEffect(() => {
    // Extraire uniquement les IDs des événements sauvegardés
    const savedEvents = getSavedEvents();
    const savedIds = savedEvents.map(event => event.id);
    setSavedEventIds(savedIds);
  }, []);

  const handleLocationClick = (locationId: string) => {
    logger.info(`Clic sur l'emplacement ${locationId}`);
    setActiveLocation(locationId);
    
    // Trouver les événements associés à ce lieu en utilisant le hook useEvents
    const locationEvents = mapLocations.find(l => l.id === locationId)?.events || [];
    const eventsData = locationEvents.map(eventId => getEventById(eventId)).filter(Boolean) as Event[];
    logger.debug(`Événements trouvés pour ${locationId}`, eventsData);
    
    if (eventsData.length === 1) {
      // S'il n'y a qu'un seul événement, l'afficher directement
      setSelectedEvent(eventsData[0]);
    } else if (eventsData.length > 1) {
      // S'il y a plusieurs événements, afficher une liste
      setSelectedEvent(null);
      // Afficher la liste des événements (à implémenter)
    }
  };

  const markLocationAsVisited = (locationId: string, visited: boolean) => {
    const updatedLocations = mapLocations.map(loc => 
      loc.id === locationId ? { ...loc, visited } : loc
    );
    
    setMapLocations(updatedLocations);
    localStorage.setItem('mapLocations', JSON.stringify(updatedLocations));
    
    toast({
      title: visited ? "Lieu marqué comme visité" : "Lieu marqué comme non visité",
      description: `${mapLocations.find(l => l.id === locationId)?.name} a été mis à jour.`,
    });
  };

  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture du dialogue
    
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
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/saved-events")}
          >
            Voir
          </Button>
        ),
      });
    }
  };

  const getLocationEvents = (locationId: string) => {
    const location = mapLocations.find(l => l.id === locationId);
    if (!location) return [];
    
    return location.events.map(eventId => 
      getEventById(eventId)
    ).filter(Boolean) as Event[];
  };

  // Calculate visited locations count
  const visitedCount = mapLocations.filter(loc => loc.visited).length;
  const totalCount = mapLocations.length;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
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
            <div className="flex justify-center" style={{ minWidth: MAP_WIDTH, minHeight: MAP_HEIGHT }}>
              <MapComponent 
                locations={mapLocations} 
                activeLocation={activeLocation} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const locationId = target.id?.replace('location-', '');
                  
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
                        className="p-1 h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          markLocationAsVisited(location.id, !location.visited);
                        }}
                      >
                        {location.visited ? 'Visité ✓' : 'Marquer'}
                      </Button>
                      
                      {getLocationEvents(location.id).length > 0 && (
                        <span className="text-xs text-[#8c9db5]">{getLocationEvents(location.id).length} événement(s)</span>
                      )}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
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
            
            {getLocationEvents(activeLocation).length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-[#1a2138] mb-2">Événements à cet endroit:</h3>
                <div className="space-y-2">
                  {getLocationEvents(activeLocation).map((event) => (
                    <div 
                      key={event.id} 
                      className="bg-[#f0f5ff] p-3 rounded-lg cursor-pointer hover:bg-[#e0ebff] transition-colors"
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
                onClick={() => setActiveLocation(null)}
              >
                Retour à la carte
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Event details dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-[425px]">
            <div className={`h-1 ${selectedEvent.type === "exposition" ? "bg-[#4a5d94]" : "bg-[#ff7a45]"}`} />
            <DialogHeader>
              <DialogTitle className="text-[#1a2138]">{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium text-[#4a5d94]">Par {selectedEvent.artistName}</p>
              <div className="flex items-center mb-4">
                <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
                <p className="text-xs text-[#8c9db5]">{selectedEvent.locationName} • {selectedEvent.time}</p>
              </div>
              
              <div className="bg-[#f0f5ff] p-3 rounded-lg mb-4">
                <p className="text-sm text-[#4a5d94]">{selectedEvent.description}</p>
              </div>
              
              <div className="border-t border-[#d8e3ff] pt-4 mt-4">
                <h4 className="text-sm font-medium mb-1 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  À propos de l'artiste
                </h4>
                <p className="text-sm text-[#4a5d94] mb-4 ml-4">{selectedEvent.artistBio}</p>
                
                <h4 className="text-sm font-medium mb-1 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  Le lieu
                </h4>
                <p className="text-sm text-[#4a5d94] mb-2 ml-4">
                  {locations.find(loc => loc.id === selectedEvent.locationId)?.description || ''}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-4 text-xs border-[#4a5d94] text-[#4a5d94]"
                  onClick={() => {
                    navigate('/location-history', { state: { selectedLocationId: selectedEvent.locationId } });
                  }}
                >
                  <Info className="h-3 w-3 mr-1" />
                  Voir l'histoire complète
                </Button>
                
                <h4 className="text-sm font-medium mb-1 mt-4 text-[#4a5d94] flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#4a5d94] mr-2"></span>
                  Contact
                </h4>
                <p className="text-sm text-[#4a5d94] ml-4">
                  <a href={`mailto:${selectedEvent.contact}`} className="text-blue-600 hover:underline">
                    {selectedEvent.contact}
                  </a>
                </p>
              </div>
              
              <div className="flex flex-col space-y-3 mt-4">
                <Button 
                  className="bg-[#ff7a45] hover:bg-[#ff9d6e] w-full"
                  onClick={() => {
                    setSelectedEvent(null);
                    setActiveLocation(null);
                  }}
                >
                  Retour à la carte
                </Button>
                
                <div className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-[#4a5d94] text-[#4a5d94]"
                    onClick={() => navigate("/program")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Voir le programme
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={savedEventIds.includes(selectedEvent.id) ? "border-[#ff7a45] text-[#ff7a45]" : "border-[#8c9db5] text-[#8c9db5]"}
                    onClick={(e) => handleSaveEvent(selectedEvent, e)}
                  >
                    {savedEventIds.includes(selectedEvent.id) ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Sauvegardé
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  
                  <ShareButton 
                    title={`${selectedEvent.title} - Île Feydeau`}
                    text={`Découvrez ${selectedEvent.title} par ${selectedEvent.artistName} sur l'Île Feydeau à Nantes!`}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Boîte de dialogue de consentement de localisation retirée */}
      
      {/* Bottom Navigation */}
      <BottomNavigation />

    </div>
  );
};

export default Map;
