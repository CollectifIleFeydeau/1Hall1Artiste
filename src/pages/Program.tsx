
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { events, getEventsByDay, type Event } from "@/data/events";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const handleViewOnMap = (event: Event) => {
    navigate(`/map?location=${event.id}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold">Programme</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/map")}>
            <MapPin className="h-4 w-4 mr-2" />
            Voir la carte
          </Button>
        </header>
        
        <Tabs defaultValue="samedi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="samedi">Samedi</TabsTrigger>
            <TabsTrigger value="dimanche">Dimanche</TabsTrigger>
          </TabsList>
          <TabsContent value="samedi" className="space-y-4">
            {getEventsByDay("samedi").map((event) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.artistName}</p>
                        <p className="text-sm text-gray-500">{event.locationName} • {event.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.type === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {event.type === "exposition" ? "Expo" : "Concert"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="dimanche" className="space-y-4">
            {getEventsByDay("dimanche").map((event) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.artistName}</p>
                        <p className="text-sm text-gray-500">{event.locationName} • {event.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.type === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {event.type === "exposition" ? "Expo" : "Concert"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          {selectedEvent && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm font-medium">Par {selectedEvent.artistName}</p>
                <p className="text-sm text-gray-500 mb-4">{selectedEvent.locationName} • {selectedEvent.time}</p>
                
                <p className="text-sm mb-4">{selectedEvent.description}</p>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-1">À propos de l'artiste</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedEvent.artistBio}</p>
                  
                  <h4 className="text-sm font-medium mb-1">Contact</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.contact}</p>
                </div>
                
                <Button 
                  size="sm" 
                  className="mt-4 w-full"
                  onClick={() => {
                    handleViewOnMap(selectedEvent);
                    setSelectedEvent(null);
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Program;
