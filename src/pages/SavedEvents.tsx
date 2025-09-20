import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedEvent, getSavedEvents, removeSavedEvent, setEventNotification } from "@/services/savedEvents";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Info } from "lucide-react";
import Share2 from "lucide-react/dist/esm/icons/share-2";
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
import { EventDetails } from "@/components/EventDetails";
import { Event } from "@/data/events";
import { addToCalendar, isCalendarSupported, CalendarErrorType } from "@/services/calendarService";
import { createLogger } from "@/utils/logger";
import { toast } from "@/components/ui/use-toast";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

// Créer un logger pour la page des événements sauvegardés
const logger = createLogger('SavedEvents');

export default function SavedEvents() {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [notificationDate, setNotificationDate] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  
  // États pour les détails d'événement
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState<boolean>(false);
  
  // États pour les célébrations
  const [showFirstSavedCelebration, setShowFirstSavedCelebration] = useState<boolean>(false);
  const [showMultipleSavedCelebration, setShowMultipleSavedCelebration] = useState<boolean>(false);
  const [showNotificationCelebration, setShowNotificationCelebration] = useState<boolean>(false);
  
  // État pour indiquer si le calendrier est supporté - toujours activé maintenant
  const [calendarSupported, setCalendarSupported] = useState<boolean>(true);

  useEffect(() => {
    // Charger les événements sauvegardés
    setSavedEvents(getSavedEvents());
    
    // Toujours activer le support calendrier
    setCalendarSupported(true);
    
    // Analytics: page view
    analytics.trackPageView("/saved", "Événements enregistrés");
    
    // Vérifier si des réalisations ont été débloquées récemment
    // et si la célébration n'a pas encore été montrée
    const celebrationsShown = localStorage.getItem('celebrationsShown');
    const shownCelebrations = celebrationsShown ? JSON.parse(celebrationsShown) : {};
    
    if (isAchievementUnlocked(AchievementType.FIRST_EVENT_SAVED) && !shownCelebrations[AchievementType.FIRST_EVENT_SAVED]) {
      setShowFirstSavedCelebration(true);
      // Marquer cette célébration comme montrée
      shownCelebrations[AchievementType.FIRST_EVENT_SAVED] = true;
    }
    
    if (isAchievementUnlocked(AchievementType.MULTIPLE_EVENTS_SAVED) && !shownCelebrations[AchievementType.MULTIPLE_EVENTS_SAVED]) {
      setShowMultipleSavedCelebration(true);
      // Marquer cette célébration comme montrée
      shownCelebrations[AchievementType.MULTIPLE_EVENTS_SAVED] = true;
    }
    
    if (isAchievementUnlocked(AchievementType.NOTIFICATION_SET) && !shownCelebrations[AchievementType.NOTIFICATION_SET]) {
      setShowNotificationCelebration(true);
      // Marquer cette célébration comme montrée
      shownCelebrations[AchievementType.NOTIFICATION_SET] = true;
    }
    
    // Sauvegarder l'état des célébrations montrées
    localStorage.setItem('celebrationsShown', JSON.stringify(shownCelebrations));
  }, []);

  const handleRemoveEvent = (eventId: string) => {
    const updatedEvents = removeSavedEvent(eventId);
    setSavedEvents(updatedEvents);
    // Analytics: unsave
    analytics.trackContentInteraction(EventAction.UNSAVE, "event", eventId, { source: "saved" });
  };

  const handleSetNotification = (eventId: string) => {
    if (!notificationDate || !notificationTime) return;
    
    const notificationDateTime = new Date(`${notificationDate}T${notificationTime}`);
    const updatedEvents = setEventNotification(eventId, notificationDateTime.toISOString());
    setSavedEvents(updatedEvents);
    setActiveEvent(null);
    setNotificationDate("");
    setNotificationTime("");
    // Analytics: reminder set
    analytics.trackProgramInteraction(EventAction.EVENT_REMINDER, { event_id: eventId, reminder_at: notificationDateTime.toISOString(), source: "saved" });
  };
  
  // Fonction pour ajouter un événement au calendrier
  const handleAddToCalendar = async (event: SavedEvent) => {
    try {
      logger.info("Tentative d'ajout au calendrier", { eventId: event.id });
      
      const result = await addToCalendar(event);
      
      if (result.success) {
        toast({
          title: "Ajout au calendrier",
          description: "L'événement a été ajouté à votre calendrier",
          variant: "default"
        });
        logger.info("Ajout au calendrier réussi", { eventId: event.id });
        // Analytics: add to calendar success
        analytics.trackProgramInteraction(EventAction.CLICK, { cta_action: "add_to_calendar", event_id: event.id, success: true, source: "saved" });
      } else {
        let errorMessage = "Une erreur est survenue lors de l'ajout au calendrier";
        
        if (result.errorType === CalendarErrorType.NOT_SUPPORTED) {
          errorMessage = "L'ajout au calendrier n'est pas supporté sur cet appareil";
        } else if (result.errorType === CalendarErrorType.PERMISSION_DENIED) {
          errorMessage = "Permission refusée pour accéder au calendrier";
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
        logger.error("Erreur lors de l'ajout au calendrier", { 
          eventId: event.id, 
          errorType: result.errorType,
          errorMessage: result.errorMessage
        });
        // Analytics: add to calendar failure
        analytics.trackProgramInteraction(EventAction.CLICK, { cta_action: "add_to_calendar", event_id: event.id, success: false, error_type: result.errorType, source: "saved" });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
        variant: "destructive"
      });
      logger.error("Exception lors de l'ajout au calendrier", { error });
      // Analytics: add to calendar exception
      analytics.trackProgramInteraction(EventAction.CLICK, { cta_action: "add_to_calendar", event_id: event.id, success: false, exception: true, source: "saved" });
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      if (!dateString) return "Date inconnue";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
    } catch (error) {
      console.warn('[SavedEvents] Invalid date string:', dateString, error);
      return "Date invalide";
    }
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
          <Button variant="ghost" size="sm" onClick={() => { analytics.trackInteraction(EventAction.BACK, "button", { from: "saved_events" }); navigate("/"); }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94]">Événements enregistrés</h1>
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
                      {calendarSupported && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#4a5d94] h-7 w-7 p-0 mr-1"
                          onClick={() => handleAddToCalendar(event)}
                          title="Ajouter au calendrier"
                        >
                          <Calendar className="h-3 w-3" />
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{event.locationName}</span>
                      </div>
                      
                      {/* Bouton pour voir les détails de l'événement (plus petit, sur le côté) */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-[#4a5d94] hover:bg-[#e0ebff] text-xs flex items-center justify-center transition-all duration-200"
                        onClick={() => {
                          // Ouvrir directement les détails de l'événement
                          setEventDetailsOpen(true);
                          setSelectedEvent(event);
                          // Analytics: open event details
                          analytics.trackProgramInteraction(EventAction.EVENT_DETAILS, { event_id: event.id, source: "saved" });
                        }}
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Détails
                      </Button>
                    </div>
                    
                    {event.notificationTime && (
                      <div className="flex items-center text-[#4a5d94]">
                        <Bell className="h-3 w-3 mr-1" />
                        <span>Rappel: {formatEventDate(event.notificationTime)}</span>
                      </div>
                    )}
                    
                    {activeEvent === event.id ? (
                      <div className="mt-2 p-2 bg-[#f0f5ff] rounded-md">
                        <div className="mb-2">
                          <Label className="text-xs mb-1 block">Choisir un rappel</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs w-full"
                              onClick={() => {
                                // 1 jour avant l'événement
                                // Utiliser le premier jour de l'événement
                                const eventDay = event.days[0]; // samedi ou dimanche
                                const eventDate = new Date();
                                // Trouver le prochain samedi ou dimanche
                                const dayIndex = eventDay === 'samedi' ? 6 : 0; // 6 pour samedi, 0 pour dimanche
                                while (eventDate.getDay() !== dayIndex) {
                                  eventDate.setDate(eventDate.getDate() + 1);
                                }
                                const reminderDate = new Date(eventDate);
                                reminderDate.setDate(reminderDate.getDate() - 1);
                                setNotificationDate(reminderDate.toISOString().split('T')[0]);
                                setNotificationTime('10:00');
                                handleSetNotification(event.id);
                              }}
                            >
                              1 jour avant
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs w-full"
                              onClick={() => {
                                // 3 heures avant l'événement
                                // Utiliser le premier jour de l'événement
                                const eventDay = event.days[0]; // samedi ou dimanche
                                const eventDate = new Date();
                                // Trouver le prochain samedi ou dimanche
                                const dayIndex = eventDay === 'samedi' ? 6 : 0; // 6 pour samedi, 0 pour dimanche
                                while (eventDate.getDay() !== dayIndex) {
                                  eventDate.setDate(eventDate.getDate() + 1);
                                }
                                const eventTime = event.time.split('h');
                                eventDate.setHours(parseInt(eventTime[0]), parseInt(eventTime[1] || '0'), 0);
                                const reminderDate = new Date(eventDate);
                                reminderDate.setHours(reminderDate.getHours() - 3);
                                setNotificationDate(reminderDate.toISOString().split('T')[0]);
                                setNotificationTime(`${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`);
                                handleSetNotification(event.id);
                              }}
                            >
                              3 heures avant
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs w-full"
                              onClick={() => {
                                // Le matin même
                                // Utiliser le premier jour de l'événement
                                const eventDay = event.days[0]; // samedi ou dimanche
                                const eventDate = new Date();
                                // Trouver le prochain samedi ou dimanche
                                const dayIndex = eventDay === 'samedi' ? 6 : 0; // 6 pour samedi, 0 pour dimanche
                                while (eventDate.getDay() !== dayIndex) {
                                  eventDate.setDate(eventDate.getDate() + 1);
                                }
                                setNotificationDate(eventDate.toISOString().split('T')[0]);
                                setNotificationTime('08:00');
                                handleSetNotification(event.id);
                              }}
                            >
                              Le matin même
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs w-full"
                              onClick={() => {
                                // Afficher les champs de sélection précise
                                // Utiliser le premier jour de l'événement
                                const eventDay = event.days[0]; // samedi ou dimanche
                                const eventDate = new Date();
                                // Trouver le prochain samedi ou dimanche
                                const dayIndex = eventDay === 'samedi' ? 6 : 0; // 6 pour samedi, 0 pour dimanche
                                while (eventDate.getDay() !== dayIndex) {
                                  eventDate.setDate(eventDate.getDate() + 1);
                                }
                                setNotificationDate(eventDate.toISOString().split('T')[0]);
                                setNotificationTime('10:00');
                              }}
                            >
                              Choix précis
                            </Button>
                          </div>
                        </div>
                        
                        {/* Sélection précise */}
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
        
        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Composant EventDetails pour afficher les détails d'un événement */}
        <EventDetails 
          event={selectedEvent}
          isOpen={eventDetailsOpen}
          onClose={() => {
            setEventDetailsOpen(false);
            setSelectedEvent(null);
          }}
          source="saved"
        />
      </div>
    </div>
  );
}
