
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { artists, type Artist } from "@/data/artists";

const Program = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Artist | null>(null);
  
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
            {artists
              .filter(artist => artist.day === "samedi")
              .map((artist) => (
                <Card 
                  key={artist.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(artist)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{artist.title}</h3>
                        <p className="text-sm text-gray-600">{artist.name}</p>
                        <p className="text-sm text-gray-500">{artist.location} • {artist.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        artist.type === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {artist.type === "exposition" ? "Expo" : "Concert"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="dimanche" className="space-y-4">
            {artists
              .filter(artist => artist.day === "dimanche")
              .map((artist) => (
                <Card 
                  key={artist.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvent(artist)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{artist.title}</h3>
                        <p className="text-sm text-gray-600">{artist.name}</p>
                        <p className="text-sm text-gray-500">{artist.location} • {artist.time}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        artist.type === "exposition" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {artist.type === "exposition" ? "Expo" : "Concert"}
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
                <p className="text-sm font-medium">Par {selectedEvent.name}</p>
                <p className="text-sm text-gray-500 mb-4">{selectedEvent.location} • {selectedEvent.time}</p>
                
                <p className="text-sm mb-4">{selectedEvent.description}</p>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-1">À propos de l'artiste</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedEvent.bio}</p>
                  
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
