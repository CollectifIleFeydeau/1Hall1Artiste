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
import Celebration from "@/components/Celebration";
import { AchievementType, getAchievementCelebrationMessage, isAchievementUnlocked } from "@/services/achievements";

export default function SavedEvents() {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [notificationDate, setNotificationDate] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  
  // États pour les célébrations
  const [showFirstSavedCelebration, setShowFirstSavedCelebration] = useState<boolean>(false);
  const [showMultipleSavedCelebration, setShowMultipleSavedCelebration] = useState<boolean>(false);
  const [showNotificationCelebration, setShowNotificationCelebration] = useState<boolean>(false);

  useEffect(() => {
    // Charger les événements sauvegardés
    setSavedEvents(getSavedEvents());
    
    // Vérifier si des réalisations ont été débloquées récemment
    if (isAchievementUnlocked(AchievementType.FIRST_EVENT_SAVED)) {
      setShowFirstSavedCelebration(true);
    }
    
    if (isAchievementUnlocked(AchievementType.MULTIPLE_EVENTS_SAVED)) {
      setShowMultipleSavedCelebration(true);
    }
    
    if (isAchievementUnlocked(AchievementType.NOTIFICATION_SET)) {
      setShowNotificationCelebration(true);
    }
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
      {/* Composants de célébration */}
      <Celebration 
        trigger={showFirstSavedCelebration} 
        message={getAchievementCelebrationMessage(AchievementType.FIRST_EVENT_SAVED)} 
        onComplete={() => setShowFirstSavedCelebration(false)}
      />
      <Celebration 
        trigger={showMultipleSavedCelebration} 
        message={getAchievementCelebrationMessage(AchievementType.MULTIPLE_EVENTS_SAVED)} 
        onComplete={() => setShowMultipleSavedCelebration(false)}
      />
      <Celebration 
        trigger={showNotificationCelebration} 
        message={getAchievementCelebrationMessage(AchievementType.NOTIFICATION_SET)} 
        onComplete={() => setShowNotificationCelebration(false)}
      />
      
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
          <div className="space-y-2">
            {savedEvents.map((event) => (
              <Card key={event.id} className="border-[#e0ebff]">
                <CardHeader className="py-1 px-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                    <div className="flex items-center">
                      {!event.notificationTime && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#4a5d94] h-7 w-7 p-0 mr-1"
                          onClick={() => setActiveEvent(event.id)}
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 h-7 w-7 p-0"
                        onClick={() => handleRemoveEvent(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-1 px-3 pt-0">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{event.days.map(day => day === "samedi" ? "Sa" : "Di").join("/")}, {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{event.locationName}</span>
                    </div>
                    {event.notificationTime && (
                      <div className="flex items-center text-[#4a5d94]">
                        <Bell className="h-3 w-3 mr-1" />
                        <span>Rappel: {formatEventDate(event.notificationTime)}</span>
                      </div>
                    )}
                    
                    {activeEvent === event.id ? (
                      <div className="mt-2 p-2 bg-[#f0f5ff] rounded-md">
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <div>
                            <Label htmlFor={`date-${event.id}`} className="text-xs mb-1">Date</Label>
                            <Input 
                              id={`date-${event.id}`}
                              type="date" 
                              className="h-8 text-sm"
                              value={notificationDate}
                              onChange={(e) => setNotificationDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`time-${event.id}`} className="text-xs mb-1">Heure</Label>
                            <Input 
                              id={`time-${event.id}`}
                              type="time" 
                              className="h-8 text-sm"
                              value={notificationTime}
                              onChange={(e) => setNotificationTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <Button 
                            className="flex-1 bg-[#4a5d94] h-8 text-xs"
                            onClick={() => handleSetNotification(event.id)}
                          >
                            Définir
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-8 text-xs"
                            onClick={() => setActiveEvent(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : null}
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
