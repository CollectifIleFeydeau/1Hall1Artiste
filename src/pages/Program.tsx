
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Event = {
  id: string;
  title: string;
  artist: string;
  time: string;
  location: string;
  category: "exposition" | "concert";
  description: string;
  artistBio?: string;
  contact?: string;
};

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const events: Event[] = [
    {
      id: "expo1",
      title: "Photographie Urbaine",
      artist: "Marie Dupont",
      time: "14h00 - 18h00",
      location: "Hall Principal",
      category: "exposition",
      description: "Une exploration visuelle de l'architecture urbaine de Nantes au fil du temps.",
      artistBio: "Photographe nantaise spécialisée dans l'architecture urbaine.",
      contact: "marie.dupont@example.com"
    },
    {
      id: "concert1",
      title: "Jazz Manouche",
      artist: "Trio Rivière",
      time: "16h00 - 17h00",
      location: "Cour Intérieure",
      category: "concert",
      description: "Un concert de jazz manouche inspiré par Django Reinhardt.",
      artistBio: "Groupe local de jazz formé en 2018.",
      contact: "trioriviere@example.com"
    },
    {
      id: "expo2",
      title: "Sculptures Contemporaines",
      artist: "Jean Mercier",
      time: "10h00 - 19h00",
      location: "Galerie Est",
      category: "exposition",
      description: "Des créations contemporaines réalisées à partir de matériaux recyclés.",
      artistBio: "Sculpteur autodidacte travaillant principalement avec des matériaux recyclés.",
      contact: "jean.m@example.com"
    },
    {
      id: "concert2",
      title: "Folk Acoustique",
      artist: "Luna & Les Étoiles",
      time: "18h30 - 19h30",
      location: "Jardin",
      category: "concert",
      description: "Un concert acoustique aux influences folk et celtiques.",
      artistBio: "Groupe formé à Nantes en 2020, spécialisé dans la musique folk.",
      contact: "luna.etoiles@example.com"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold ml-2">Programme</h1>
        </header>
        
        <Tabs defaultValue="samedi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="samedi">Samedi</TabsTrigger>
            <TabsTrigger value="dimanche">Dimanche</TabsTrigger>
          </TabsList>
          <TabsContent value="samedi" className="space-y-4">
            {events
              .filter(event => ["expo1", "concert1"].includes(event.id))
              .map((event) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.artist}</p>
                        <p className="text-sm text-gray-500">{event.location} • {event.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.category === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {event.category === "exposition" ? "Expo" : "Concert"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="dimanche" className="space-y-4">
            {events
              .filter(event => ["expo2", "concert2"].includes(event.id))
              .map((event) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.artist}</p>
                        <p className="text-sm text-gray-500">{event.location} • {event.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.category === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {event.category === "exposition" ? "Expo" : "Concert"}
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
                <p className="text-sm font-medium">Par {selectedEvent.artist}</p>
                <p className="text-sm text-gray-500 mb-4">{selectedEvent.location} • {selectedEvent.time}</p>
                
                <p className="text-sm mb-4">{selectedEvent.description}</p>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-1">À propos de l'artiste</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedEvent.artistBio}</p>
                  
                  <h4 className="text-sm font-medium mb-1">Contact</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.contact}</p>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default Program;
