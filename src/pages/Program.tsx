import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackFeatureUsage } from "../services/analytics";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import { useNavigate } from "react-router-dom";
import { events, getEventsByDay, type Event } from "@/data/events";
import { EventFilter } from "@/components/EventFilter";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetails } from "@/components/EventDetails";
import { toast } from "@/components/ui/use-toast";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Charger les événements sauvegardés depuis le localStorage
    const savedEvents = localStorage.getItem("savedEvents");
    if (savedEvents) {
      setSavedEventIds(JSON.parse(savedEvents));
    }
  }, []);

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
  
  const handleViewOnMap = (event: Event) => {
    // Track event view in analytics
    trackFeatureUsage.eventView(event.id, event.title);
    // Pass the event ID directly - the Map component will handle the conversion
    navigate(`/map?location=${event.id}`);
  };
  
  const filterEvents = (events: Event[], filter: string) => {
    if (filter === "all") return events;
    return events.filter(event => event.type === filter);
  };
  
  return (
    <div className="min-h-screen app-gradient pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#ff7a45]">Programme</h1>
          <div className="flex items-center space-x-2">
            <ShareButton 
              title="Programme Île Feydeau" 
              text="Découvrez le programme des événements sur l'Île Feydeau à Nantes!" 
            />
          </div>
        </header>
        
        {/* Event type filter */}
        <div className="mb-4 fade-in">
          <EventFilter onFilterChange={setCurrentFilter} currentFilter={currentFilter} />
        </div>
        
        <div className="text-center mb-4 text-sm text-[#ff7a45] slide-in-bottom">
        </div>
        
        <Tabs defaultValue="samedi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-[#e0ebff]">
            <TabsTrigger 
              value="samedi" 
              className="data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Samedi
            </TabsTrigger>
            <TabsTrigger 
              value="dimanche"
              className="data-[state=active]:bg-[#ff7a45] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Dimanche
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="samedi" className="space-y-4">
            {filterEvents(getEventsByDay("samedi"), currentFilter).map((event, index) => (
                <Card 
                  key={`samedi-${event.id}-${index}`}
                  className="shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onClick={() => {
                    setSelectedEvent(event);
                    trackFeatureUsage.eventView(event.id, event.title);
                  }}
                >
                  <div className={`h-1 ${event.type === "exposition" ? "bg-[#4a5d94]" : "bg-[#ff7a45]"}`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#1a2138]">{event.title}</h3>
                        <p className="text-sm text-[#4a5d94]">{event.artistName}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
                          <p className="text-xs text-[#8c9db5]">{event.locationName} • {event.time}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type === "exposition" 
                            ? "bg-[#e0ebff] text-[#4a5d94]" 
                            : "bg-[#fff2ee] text-[#ff7a45]"
                        }`}>
                          {event.type === "exposition" ? "Exposition" : "Concert"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {filterEvents(getEventsByDay("samedi"), currentFilter).length === 0 && (
              <div className="text-center py-8 text-[#8c9db5]">
                <p>Aucun événement ne correspond à ce filtre pour ce jour.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dimanche" className="space-y-4">
            {filterEvents(getEventsByDay("dimanche"), currentFilter).map((event, index) => (
                <Card 
                  key={`dimanche-${event.id}-${index}`}
                  className="shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onClick={() => {
                    setSelectedEvent(event);
                    trackFeatureUsage.eventView(event.id, event.title);
                  }}
                >
                  <div className={`h-1 ${event.type === "exposition" ? "bg-[#4a5d94]" : "bg-[#ff7a45]"}`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#1a2138]">{event.title}</h3>
                        <p className="text-sm text-[#4a5d94]">{event.artistName}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
                          <p className="text-xs text-[#8c9db5]">{event.locationName} • {event.time}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type === "exposition" 
                            ? "bg-[#e0ebff] text-[#4a5d94]" 
                            : "bg-[#fff2ee] text-[#ff7a45]"
                        }`}>
                          {event.type === "exposition" ? "Exposition" : "Concert"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {filterEvents(getEventsByDay("dimanche"), currentFilter).length === 0 && (
              <div className="text-center py-8 text-[#8c9db5]">
                <p>Aucun événement ne correspond à ce filtre pour ce jour.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Utiliser le composant EventDetails unifié */}
        <EventDetails 
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          source="program"
        />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Program;
