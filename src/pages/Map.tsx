import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackFeatureUsage } from "../services/analytics";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import X from "lucide-react/dist/esm/icons/x";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { events, getLocations, getEventById, getLocationIdForEvent, type Event } from "@/data/events";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisitProgress } from "@/components/VisitProgress";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mapLocations, setMapLocations] = useState(getLocations());
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [visitDialog, setVisitDialog] = useState<{open: boolean; locationId: string | null}>({open: false, locationId: null});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
    setMapLocations(prevLocations => 
      prevLocations.map(loc => 
        loc.id === locationId ? { ...loc, visited } : loc
      )
    );
    setVisitDialog({open: false, locationId: null});
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
    <div className="min-h-screen app-gradient pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94]">Carte & Parcours</h1>
          <ShareButton 
            title="Parcours Île Feydeau" 
            text="Découvrez mon parcours sur l'Île Feydeau à Nantes!" 
          />
        </header>
        
        {/* Visit Progress Tracker */}
        <div className="mb-4 flex justify-center">
          <VisitProgress visitedCount={visitedCount} totalCount={totalCount} />
        </div>
        
        <div className="text-center mb-4 text-sm text-[#4a5d94] fade-in">
          <p>Explorez l'île Feydeau et marquez les lieux visités</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-md mb-4 border-0 transition-all duration-300 hover:shadow-lg">
          <div className="relative border border-[#d8e3ff] rounded-lg h-80 bg-[#f0f5ff] mb-4 overflow-hidden">
            {/* Map background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#e0ebff] to-[#f0f5ff]"></div>
            
            {/* Simplified map illustration */}
            <div className="absolute inset-0 p-2">
              <div className="w-full h-full relative border border-dashed border-[#8c9db5] rounded">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#4a5d94] text-xs font-medium">
                  Île Feydeau
                </div>
                
                {mapLocations.map((location) => (
                  <div 
                    key={location.id}
                    className={`absolute w-5 h-5 transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer shadow-md transition-all duration-200
                      ${activeLocation === location.id ? 'ring-2 ring-[#ff7a45] ring-offset-2 scale-110' : ''}
                      ${location.visited ? 'bg-[#ff7a45]' : 'bg-[#4a5d94]'}
                    `}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    onClick={() => handleLocationClick(location.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-[#4a5d94]">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#ff7a45] rounded-full mr-1"></div>
                <span>Visité</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#4a5d94] rounded-full mr-1"></div>
                <span>À découvrir</span>
              </div>
            </div>
            <p>Cliquez sur les points pour plus d'informations sur chaque lieu.</p>
          </div>
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
                        <h3 className="text-lg font-semibold text-[#1a2138] mb-1 transition-all duration-300 group-hover:text-[#4a5d94]">{mapLocations.find(l => l.id === activeLocation)?.name}</h3>
                        <p className="text-xs text-[#4a5d94]">{event.artistName} • {event.time}</p>
                        <p className="text-xs text-blue-600 mt-1">Voir les détails →</p>
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
      
      {/* Visit confirmation dialog */}
      <Dialog open={visitDialog.open} onOpenChange={(open) => setVisitDialog({...visitDialog, open})}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a2138]">Marquer comme visité ?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#4a5d94]">
              Souhaitez-vous marquer ce lieu comme visité ? Cela le mettra en évidence sur la carte et augmentera votre score de progression.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-[#4a5d94] text-[#4a5d94]"
              onClick={() => setVisitDialog({open: false, locationId: null})}
            >
              Annuler
            </Button>
            <Button 
              className="bg-[#ff7a45] hover:bg-[#ff9d6e]"
              onClick={() => visitDialog.locationId && markLocationAsVisited(visitDialog.locationId, true)}
            >
              Marquer comme visité
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                  Contact
                </h4>
                <p className="text-sm text-[#4a5d94] ml-4">
                  <a href={`mailto:${selectedEvent.contact}`} className="text-blue-600 hover:underline">
                    {selectedEvent.contact}
                  </a>
                </p>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-[#4a5d94] text-[#4a5d94]"
                  onClick={() => navigate("/program")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir le programme
                </Button>
                
                <ShareButton 
                  title={`${selectedEvent.title} - Île Feydeau`}
                  text={`Découvrez ${selectedEvent.title} par ${selectedEvent.artistName} sur l'Île Feydeau à Nantes!`}
                />
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Map;
