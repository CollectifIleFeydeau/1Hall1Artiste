import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedEvent, getSavedEvents, removeSavedEvent, setEventNotification } from "@/services/savedEvents";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import Clock from "lucide-react/dist/esm/icons/clock";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Bell from "lucide-react/dist/esm/icons/bell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function SavedEvents() {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [notificationDate, setNotificationDate] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  useEffect(() => {
    // Charger les événements sauvegardés
    setSavedEvents(getSavedEvents());
  }, []);

  const handleRemoveEvent = (eventId: string) => {
    const updatedEvents = removeSavedEvent(eventId);
    setSavedEvents(updatedEvents);
  };

  const handleSetNotification = (eventId: string) => {
    if (!notificationDate || !notificationTime) return;
    
    const notificationDateTime = new Date(`${notificationDate}T${notificationTime}`);
    const updatedEvents = setEventNotification(eventId, notificationDateTime.toISOString());
    setSavedEvents(updatedEvents);
    setActiveEvent(null);
    setNotificationDate("");
    setNotificationTime("");
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94] text-center">Événements sauvegardés</h1>
          <div className="w-20"></div>
        </header>

        {savedEvents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Vous n'avez pas encore sauvegardé d'événements.</p>
            <Button 
              className="mt-4 bg-[#4a5d94]"
              onClick={() => navigate("/program")}
            >
              Voir le programme
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedEvents.map((event) => (
              <Card key={event.id} className="border-[#e0ebff]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{event.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 h-8 w-8 p-0"
                      onClick={() => handleRemoveEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{event.days.map(day => day === "samedi" ? "Samedi" : "Dimanche").join(" et ")}, {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.locationName}</span>
                    </div>
                    {event.notificationTime && (
                      <div className="flex items-center text-[#4a5d94]">
                        <Bell className="h-4 w-4 mr-2" />
                        <span>Rappel prévu le {formatEventDate(event.notificationTime)}</span>
                      </div>
                    )}
                    
                    {activeEvent === event.id ? (
                      <div className="mt-4 p-3 bg-[#f0f5ff] rounded-md">
                        <h3 className="font-medium mb-2">Définir un rappel</h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Label htmlFor={`date-${event.id}`}>Date</Label>
                            <Input 
                              id={`date-${event.id}`}
                              type="date" 
                              value={notificationDate}
                              onChange={(e) => setNotificationDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`time-${event.id}`}>Heure</Label>
                            <Input 
                              id={`time-${event.id}`}
                              type="time" 
                              value={notificationTime}
                              onChange={(e) => setNotificationTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-[#4a5d94]"
                            onClick={() => handleSetNotification(event.id)}
                          >
                            Définir
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setActiveEvent(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-[#4a5d94] border-[#4a5d94]"
                        onClick={() => setActiveEvent(event.id)}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        {event.notificationTime ? "Modifier le rappel" : "Définir un rappel"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
