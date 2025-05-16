
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { events, getLocations, getEventById, type Event } from "@/data/events";

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mapLocations, setMapLocations] = useState(getLocations());
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const locationId = searchParams.get('location');
    
    if (locationId) {
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
    
    // Mark location as visited
    setMapLocations(prevLocations => 
      prevLocations.map(loc => 
        loc.id === locationId ? { ...loc, visited: true } : loc
      )
    );
  };

  const getLocationEvents = (locationId: string) => {
    const location = mapLocations.find(l => l.id === locationId);
    if (!location) return [];
    
    return location.events.map(eventId => 
      getEventById(eventId)
    ).filter(Boolean) as Event[];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold">Carte & Parcours</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/program")}>
            <Calendar className="h-4 w-4 mr-2" />
            Programme
          </Button>
        </header>
        
        <div className="bg-white rounded-lg p-4 shadow-md mb-4">
          <div className="relative border-2 border-gray-200 rounded-lg h-80 bg-gray-50 mb-4">
            {/* Simplified map illustration */}
            <div className="absolute inset-0 p-2">
              <div className="w-full h-full relative border border-dashed border-gray-300 rounded">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Carte du quartier
                </div>
                
                {mapLocations.map((location) => (
                  <div 
                    key={location.id}
                    className={`absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer
                      ${activeLocation === location.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      ${location.visited ? 'bg-green-500' : 'bg-gray-400'}
                    `}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    onClick={() => handleLocationClick(location.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Visité</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                <span>Non visité</span>
              </div>
            </div>
            <p>Cliquez sur les points pour plus d'informations sur chaque lieu.</p>
          </div>
        </div>
        
        {activeLocation && (
          <Card className="mb-4 animate-fade-in">
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">
                {mapLocations.find(l => l.id === activeLocation)?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {mapLocations.find(l => l.id === activeLocation)?.description}
              </p>
              
              {getLocationEvents(activeLocation).length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Événements :</h4>
                  <div className="space-y-2">
                    {getLocationEvents(activeLocation).map(event => event && (
                      <div key={event.id} className="text-sm">
                        <span className="font-medium">{event.title}</span> par {event.artistName}
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-3 text-xs" 
                onClick={() => navigate("/program")}
              >
                Voir le programme complet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Map;
