import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createLogger } from "@/utils/logger";
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
import { events, getEventById, getLocationIdForEvent, type Event } from "@/data/events";
import { locations } from "@/data/locations";

// Créer un logger pour le composant Map
const logger = createLogger('Map');

interface MapProps {
  fullScreen?: boolean;
}

const Map = ({ fullScreen = false }: MapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Charger les emplacements depuis localStorage s'ils existent, sinon utiliser les valeurs par défaut
  const [mapLocations, setMapLocations] = useState(() => {
    logger.info('Initialisation des emplacements sur la carte');
    const savedLocations = localStorage.getItem('mapLocations');
    
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations);
        logger.info('Emplacements chargés depuis localStorage');
        logger.debug('Détails des emplacements chargés', parsedLocations);
        return parsedLocations;
      } catch (error) {
        logger.error('Erreur lors du parsing des emplacements depuis localStorage', error);
        return locations;
      }
    } else {
      logger.info('Aucun emplacement trouvé dans localStorage, utilisation des valeurs par défaut');
      logger.debug('Emplacements par défaut', locations);
      return locations;
    }
  });
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
      
      // Centrer la carte sur le lieu
      const locationToHighlight = mapLocations.find(loc => loc.id === locationIdToHighlight);
      if (locationToHighlight) {
        logger.debug('Lieu trouvé pour mise en évidence', { 
          id: locationToHighlight.id, 
          name: locationToHighlight.name,
          x: locationToHighlight.x,
          y: locationToHighlight.y
        });
        
        // Mettre en évidence visuellement le lieu
        const locationElement = document.getElementById(`location-${locationToHighlight.id}`);
        if (locationElement) {
          logger.info(`Application de l'animation sur l'élément DOM pour le lieu ${locationToHighlight.name}`);
          
          // Ajouter une animation plus visible
          locationElement.classList.add('animate-ping');
          locationElement.classList.add('ring-4');
          locationElement.classList.add('ring-[#ff7a45]');
          locationElement.classList.add('ring-opacity-70');
          locationElement.classList.add('scale-125');
          
          // Supprimer l'animation après 3 secondes
          setTimeout(() => {
            logger.debug(`Suppression de l'animation pour le lieu ${locationToHighlight.name}`);
            locationElement.classList.remove('animate-ping');
          }, 3000);
        } else {
          logger.warn(`Élément DOM non trouvé pour le lieu ${locationToHighlight.id}`);
        }
      } else {
        logger.warn(`Lieu avec ID ${locationIdToHighlight} non trouvé dans mapLocations`);
      }
    } else {
      logger.info('Aucun lieu à mettre en évidence');
    }
  }, [location, mapLocations]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const { toast } = useToast();
  // Fonctionnalité de localisation retirée

  // Charger les événements sauvegardés
  useEffect(() => {
    const savedEvents = getSavedEvents();
    setSavedEventIds(savedEvents.map(event => event.id));
    
    // Charger les coordonnées depuis le localStorage si elles existent
    const savedLocations = localStorage.getItem('mapLocations');
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations);
        // Mettre à jour les coordonnées des lieux
        parsedLocations.forEach((savedLoc: any) => {
          const locationIndex = mapLocations.findIndex(loc => loc.id === savedLoc.id);
          if (locationIndex !== -1) {
            mapLocations[locationIndex].x = savedLoc.x;
            mapLocations[locationIndex].y = savedLoc.y;
            
            // Mettre à jour les événements associés à ce lieu
            const locationEvents = events.filter(event => event.locationName === mapLocations[locationIndex].name);
            locationEvents.forEach(event => {
              event.x = savedLoc.x;
              event.y = savedLoc.y;
            });
          }
        });
        setMapLocations([...mapLocations]); // Force refresh
        console.log('Coordonnées chargées depuis le localStorage');
      } catch (error) {
        console.error('Erreur lors du chargement des coordonnées:', error);
      }
    }
  }, []);

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventOrLocationId = searchParams.get('location');
    
    if (eventOrLocationId) {
      // First, check if this is an event ID
      const locationId = getLocationIdForEvent(eventOrLocationId) || eventOrLocationId;
      
      // Set the active location
      setActiveLocation(locationId);
      
      // Mark location as visited
      setMapLocations(prevLocations => 
        prevLocations.map(loc => 
          loc.id === locationId ? { ...loc, visited: true } : loc
        )
      );
    }
  }, [location.search]);

  const handleLocationClick = (locationId: string) => {
    setActiveLocation(locationId);
    // Track location view in analytics
    trackFeatureUsage.mapLocation(locationId);
    // Just show the location details, don't show dialog automatically
  };
  
  const markLocationAsVisited = (locationId: string, visited: boolean) => {
    setMapLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, visited } : loc
    ));
    
    // Save to localStorage
    const visitedLocations = JSON.parse(localStorage.getItem('visitedLocations') || '[]');
    
    if (visited && !visitedLocations.includes(locationId)) {
      localStorage.setItem('visitedLocations', JSON.stringify([...visitedLocations, locationId]));
    } else if (!visited && visitedLocations.includes(locationId)) {
      localStorage.setItem('visitedLocations', JSON.stringify(visitedLocations.filter((id: string) => id !== locationId)));
    }
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

  // Fonctionnalités de localisation retirées

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
        
        {!fullScreen && (
          <div className="text-center mb-4 text-sm text-[#4a5d94] fade-in">
            <p>Explorez l'île Feydeau et marquez les lieux visités</p>
          </div>
        )}
        
        <div className="relative">
          {/* Map container */}
          <div className="bg-white rounded-lg mb-4 border-0 transition-all duration-300 hover:shadow-lg w-full">
            <div className="relative border border-[#d8e3ff] rounded-lg h-[calc(100vh-150px)] bg-[#f0f5ff] mb-4 overflow-hidden">
            {/* Map background with image */}
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <img 
                src="/Plan Île Feydeau.png" 
                alt="Plan de l'Île Feydeau" 
                className="max-w-full max-h-full object-contain transition-opacity duration-500 opacity-100"
                onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                style={{ opacity: 0.9 }}
              />
            </div>
            
            {/* Map locations overlay avec coordonnées fixes */}
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                {mapLocations.map((location) => (
                  <div 
                    key={location.id}
                    id={`location-${location.id}`}
                    className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer shadow-lg border-2 border-white transition-all duration-200
                      ${activeLocation === location.id ? 'ring-2 ring-[#ff7a45] ring-offset-2 scale-125 z-10' : ''}
                      ${location.visited ? 'bg-[#ff7a45]' : 'bg-[#4a5d94]'}
                    `}
                    style={{ 
                      position: 'absolute',
                      left: `${location.x}px`, 
                      top: `${location.y}px`,
                      zIndex: 20
                    }}
                    onClick={() => handleLocationClick(location.id)}
                  />
                ))}
              </div>
              
              {/* Marqueur de localisation retiré */}
            </div>
          </div>
          
            {/* Legend overlay - positioned at the top left */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md text-[#4a5d94] z-10">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-7 h-7 bg-[#ff7a45] rounded-full mr-2 text-white text-sm font-medium">
                    {visitedCount}
                  </div>
                  <span className="text-base">{visitedCount > 1 ? 'Visités' : 'Visité'}</span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-7 h-7 bg-[#4a5d94] rounded-full mr-2 text-white text-sm font-medium">
                    {totalCount - visitedCount}
                  </div>
                  <span className="text-base">À découvrir</span>
                </div>
              </div>
            </div>
            
            {/* Bouton de localisation retiré */}
            
            {/* Progress overlay removed as it's now in the legend */}
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
                  <div 
                    key={location.id} 
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${activeLocation === location.id ? 'bg-[#f0f5ff] border-l-2 border-[#4a5d94]' : 'hover:bg-gray-50'}`}
                    onClick={() => handleLocationClick(location.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 mr-2 rounded-full ${location.visited ? 'bg-[#ff7a45]' : 'bg-[#4a5d94]'}`} />
                      <div className="text-sm truncate">
                        <p className="font-medium text-[#1a2138]">{location.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {activeLocation && (
          <Card className="mb-4 animate-fade-in shadow-md border-0 overflow-hidden">
            <div className="h-2 bg-[#ff7a45]"></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium mb-1 text-[#1a2138]">
                  {mapLocations.find(l => l.id === activeLocation)?.name}
                </h3>
                
                {/* Visited status indicator */}
                {mapLocations.find(l => l.id === activeLocation)?.visited ? (
                  <div className="flex items-center text-[#ff7a45] text-sm">
                    <span className="inline-block w-4 h-4 mr-1 rounded-full border border-current flex items-center justify-center">
                      <span className="block w-2 h-2 bg-current rounded-full"></span>
                    </span>
                    Visité
                  </div>
                ) : null}
              </div>
              
              <p className="text-sm text-[#4a5d94] mb-3">
                {mapLocations.find(l => l.id === activeLocation)?.description}
              </p>
              
              {getLocationEvents(activeLocation).length > 0 && (
                <div className="mt-3 bg-[#f0f5ff] p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-[#4a5d94] flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-[#4a5d94]" />
                    Événements à cet endroit
                  </h4>
                  <div className="space-y-2">
                    {getLocationEvents(activeLocation).map(event => event && (
                      <div 
                        key={event.id} 
                        className="text-sm bg-white p-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-[#1a2138] mb-1 transition-all duration-300 group-hover:text-[#4a5d94]">{event.title}</h3>
                            <p className="text-xs text-[#4a5d94]">{event.artistName} • {event.time}</p>
                            <p className="text-xs text-blue-600 mt-1">Voir les détails →</p>
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
              
              <div className="flex flex-col space-y-4 mt-4">
                {/* Mark as visited button - only show if not already visited */}
                {activeLocation && !mapLocations.find(l => l.id === activeLocation)?.visited && (
                  <Button 
                    className="w-full bg-[#ff7a45] hover:bg-[#ff9d6e] text-white"
                    onClick={() => {
                      const location = mapLocations.find(l => l.id === activeLocation);
                      if (location) {
                        markLocationAsVisited(location.id, true);
                      }
                    }}
                  >
                    <span className="inline-block w-4 h-4 mr-2 rounded-full border border-white flex items-center justify-center"></span>
                    Marquer comme visité
                  </Button>
                )}
                
                <div className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs border-[#4a5d94] text-[#4a5d94] hover:bg-[#e0ebff] hover:text-[#4a5d94]" 
                    onClick={() => navigate("/program")}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Programme complet
                  </Button>
                  
                  <ShareButton 
                    title={`${mapLocations.find(l => l.id === activeLocation)?.name} - Île Feydeau`}
                    text={`Découvrez ${mapLocations.find(l => l.id === activeLocation)?.name} sur l'Île Feydeau à Nantes!`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
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
                <p className="text-sm text-[#4a5d94] mb-2 ml-4">{selectedEvent.locationDescription}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-4 text-xs border-[#4a5d94] text-[#4a5d94]"
                  onClick={() => {
                    const locationId = selectedEvent.locationName.toLowerCase().replace(/\s+/g, '-');
                    navigate('/location-history', { state: { selectedLocationId: locationId } });
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
