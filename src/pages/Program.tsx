import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackFeatureUsage } from "../services/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import { useNavigate } from "react-router-dom";
import { events, getEventsByDay, type Event } from "@/data/events";
import { EventFilter } from "@/components/EventFilter";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#ff7a45]">Programme</h1>
          <ShareButton 
            title="Programme Île Feydeau" 
            text="Découvrez le programme des événements sur l'Île Feydeau à Nantes!" 
          />
        </header>
        
        {/* Event type filter */}
        <div className="mb-4 fade-in">
          <EventFilter onFilterChange={setCurrentFilter} currentFilter={currentFilter} />
        </div>
        
        <div className="text-center mb-4 text-sm text-[#ff7a45] slide-in-bottom">
          <p>Découvrez tous les événements du week-end</p>
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
            {filterEvents(getEventsByDay("samedi"), currentFilter).map((event) => (
                <Card 
                  key={event.id}
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === "exposition" 
                          ? "bg-[#e0ebff] text-[#4a5d94]" 
                          : "bg-[#fff2ee] text-[#ff7a45]"
                      }`}>
                        {event.type === "exposition" ? "Exposition" : "Concert"}
                      </span>
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
            {filterEvents(getEventsByDay("dimanche"), currentFilter).map((event) => (
                <Card 
                  key={event.id}
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.type === "exposition" 
                          ? "bg-[#e0ebff] text-[#4a5d94]" 
                          : "bg-[#fff2ee] text-[#ff7a45]"
                      }`}>
                        {event.type === "exposition" ? "Exposition" : "Concert"}
                      </span>
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
                    className="bg-[#ff7a45] hover:bg-[#ff9d6e] text-white"
                    onClick={() => {
                      handleViewOnMap(selectedEvent);
                      setSelectedEvent(null);
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Voir sur la carte
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
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Program;
