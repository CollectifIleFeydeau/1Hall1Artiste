import { useState, useEffect } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedEvent, getSavedEvents, removeSavedEvent, setEventNotification } from "@/services/savedEvents";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Info } from "lucide-react";
import Bell from "lucide-react/dist/esm/icons/bell";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BottomNavigation } from "@/components/BottomNavigation";
import Celebration from "@/components/Celebration";
import { AchievementType, getAchievementCelebrationMessage, isAchievementUnlocked } from "@/services/achievements";
import { EventDetailsNew as EventDetails } from "@/components/EventDetailsModern";
import { Event } from "@/data/events";
import { EventImage } from "@/components/EventImage";
import { getBackgroundFallback } from "@/utils/backgroundUtils";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

export default function SavedEvents() {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [notificationDate, setNotificationDate] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [selectedEventForActions, setSelectedEventForActions] = useState<SavedEvent | null>(null);
  
  // États pour les détails d'événement
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState<boolean>(false);
  
  // États pour les célébrations
  const [showFirstSavedCelebration, setShowFirstSavedCelebration] = useState<boolean>(false);
  const [showMultipleSavedCelebration, setShowMultipleSavedCelebration] = useState<boolean>(false);
  const [showNotificationCelebration, setShowNotificationCelebration] = useState<boolean>(false);

  useEffect(() => {
    // Charger les événements sauvegardés
    setSavedEvents(getSavedEvents());
    
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

  // Fonction pour obtenir le style de fond moderne comme EventCardModern
  const getEventBackgroundStyle = (index: number): React.CSSProperties => ({
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  });

  const getEventBackgroundPseudoElementStyle = (index: number): React.CSSProperties => {
    const intensity = index % 4;
    const positions = ['top left', 'top right', 'bottom left', 'bottom right'];
    let transform = 'none';
    if (intensity === 1 || intensity === 3) {
      transform = 'scaleX(-1)';
    }
    
    return {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url('${getBackgroundFallback('/images/background/small/Historical Parchment Background Portrait.jpg')}')`,
      backgroundSize: 'cover',
      backgroundPosition: positions[intensity] || 'center',
      backgroundRepeat: 'no-repeat',
      transform,
      opacity: 0.7 + (intensity * 0.1),
      zIndex: -1,
    };
  };


  return (
    <div className="min-h-screen pb-20 px-4 pt-4 overflow-x-hidden" style={{
      backgroundImage: `url('/images/background/small/Historical Parchment Background Portrait.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-white/10" />
      
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
      
      <div className="relative z-10 max-w-md mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <BackButton onClick={() => { analytics.trackInteraction(EventAction.BACK, "button", { from: "saved_events" }); navigate("/"); }} />
          <h1 className="text-xl font-bold text-[#4a5d94]">Événements enregistrés</h1>
          <div className="w-20"></div>
        </header>

        {savedEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4 text-lg">Vous n'avez pas encore sauvegardé d'événements.</p>
            <ActionButton 
              variant="primary"
              onClick={() => navigate("/program")}
              className="rounded-full px-6 py-2 font-medium"
            >
              Voir le programme
            </ActionButton>
          </div>
        ) : (
          <div className="space-y-4">
            {savedEvents.map((event, index) => (
              <Card 
                key={event.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selectedEventForActions?.id === event.id 
                    ? 'border-[#4a5d94] ring-2 ring-[#4a5d94]/30' 
                    : 'border-amber-300'
                }`}
                style={getEventBackgroundStyle(index)}
                onClick={() => {
                  setSelectedEventForActions(event);
                  analytics.trackContentInteraction(EventAction.CLICK, "event", event.id, { source: "saved" });
                }}
              >
                {/* Fond parchemin avec pseudo-élément */}
                <div 
                  style={getEventBackgroundPseudoElementStyle(index)}
                  className="absolute inset-0 pointer-events-none"
                />
                
                <div className="relative z-10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-lg font-bold text-[#1a2138] font-lora leading-tight mb-1">
                          {event.title}
                        </CardTitle>
                        {event.artistId && (
                          <p className="text-sm text-gray-600 mb-2">{event.artistId}</p>
                        )}
                      </div>
                      
                      {/* Image de l'événement */}
                      <div className="flex-shrink-0 ml-4">
                        <EventImage 
                          event={event}
                          className="w-24 h-18 md:w-32 md:h-24 rounded-lg object-cover"
                          priority={index < 6}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Informations de base */}
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{event.days.map(day => day === "samedi" ? "Sa" : "Di").join("/")}, {event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.locationName}</span>
                      </div>
                      
                      {/* Badge du type d'événement */}
                      <div className="flex justify-between items-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          event.type === 'exposition' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {event.type === 'exposition' ? 'Exposition' : 'Concert'}
                        </span>
                      </div>
                      
                      {/* Notification existante */}
                      {event.notificationTime && (
                        <div className="flex items-center text-[#4a5d94] text-sm">
                          <Bell className="h-4 w-4 mr-2" />
                          <span>Rappel: {formatEventDate(event.notificationTime)}</span>
                        </div>
                      )}
                      
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Barre de boutons flottante */}
        {selectedEventForActions && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 px-4 py-2">
              <div className="flex items-center space-x-3">
                {/* Nom de l'événement sélectionné */}
                <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                  {selectedEventForActions.title}
                </span>
                
                {/* Boutons d'action */}
                <div className="flex items-center space-x-1">
                  {!selectedEventForActions.notificationTime && (
                    <ActionButton 
                      variant="bell"
                      icon={<Bell className="h-4 w-4" />}
                      onClick={() => {
                        setActiveEvent(selectedEventForActions.id);
                      }}
                      tooltip="Définir un rappel"
                      size="sm"
                    />
                  )}
                  <ActionButton 
                    variant="trash"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => {
                      handleRemoveEvent(selectedEventForActions.id);
                      setSelectedEventForActions(null);
                    }}
                    tooltip="Supprimer de mes favoris"
                    size="sm"
                  />
                  <ActionButton 
                    variant="info"
                    icon={<Info className="h-4 w-4" />}
                    onClick={() => {
                      setEventDetailsOpen(true);
                      setSelectedEvent(selectedEventForActions);
                      analytics.trackProgramInteraction(EventAction.EVENT_DETAILS, { event_id: selectedEventForActions.id, source: "saved" });
                    }}
                    tooltip="Voir les détails"
                    size="sm"
                  />
                  {/* Bouton pour désélectionner */}
                  <button
                    onClick={() => setSelectedEventForActions(null)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Désélectionner"
                  >
                    <span className="text-gray-400 text-lg">×</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Interface de définition de rappel */}
        {activeEvent && selectedEventForActions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-[#4a5d94]">
                Définir un rappel pour "{selectedEventForActions.title}"
              </h3>
              
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Choisir un rappel</Label>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      // 1 jour avant l'événement
                      const eventDay = selectedEventForActions.days[0];
                      const eventDate = new Date();
                      const dayIndex = eventDay === 'samedi' ? 6 : 0;
                      while (eventDate.getDay() !== dayIndex) {
                        eventDate.setDate(eventDate.getDate() + 1);
                      }
                      const reminderDate = new Date(eventDate);
                      reminderDate.setDate(reminderDate.getDate() - 1);
                      setNotificationDate(reminderDate.toISOString().split('T')[0]);
                      setNotificationTime('10:00');
                      handleSetNotification(selectedEventForActions.id);
                    }}
                  >
                    1 jour avant
                  </ActionButton>
                  <ActionButton 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      // 3 heures avant l'événement
                      const eventDay = selectedEventForActions.days[0];
                      const eventDate = new Date();
                      const dayIndex = eventDay === 'samedi' ? 6 : 0;
                      while (eventDate.getDay() !== dayIndex) {
                        eventDate.setDate(eventDate.getDate() + 1);
                      }
                      const eventTime = selectedEventForActions.time.split('h');
                      eventDate.setHours(parseInt(eventTime[0]), parseInt(eventTime[1] || '0'), 0);
                      const reminderDate = new Date(eventDate);
                      reminderDate.setHours(reminderDate.getHours() - 3);
                      setNotificationDate(reminderDate.toISOString().split('T')[0]);
                      setNotificationTime(`${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`);
                      handleSetNotification(selectedEventForActions.id);
                    }}
                  >
                    3 heures avant
                  </ActionButton>
                  <ActionButton 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      // Le matin même
                      const eventDay = selectedEventForActions.days[0];
                      const eventDate = new Date();
                      const dayIndex = eventDay === 'samedi' ? 6 : 0;
                      while (eventDate.getDay() !== dayIndex) {
                        eventDate.setDate(eventDate.getDate() + 1);
                      }
                      setNotificationDate(eventDate.toISOString().split('T')[0]);
                      setNotificationTime('08:00');
                      handleSetNotification(selectedEventForActions.id);
                    }}
                  >
                    Le matin même
                  </ActionButton>
                  <ActionButton 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      // Afficher les champs de sélection précise
                      const eventDay = selectedEventForActions.days[0];
                      const eventDate = new Date();
                      const dayIndex = eventDay === 'samedi' ? 6 : 0;
                      while (eventDate.getDay() !== dayIndex) {
                        eventDate.setDate(eventDate.getDate() + 1);
                      }
                      setNotificationDate(eventDate.toISOString().split('T')[0]);
                      setNotificationTime('10:00');
                    }}
                  >
                    Choix précis
                  </ActionButton>
                </div>
              </div>
              
              {/* Sélection précise */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <Label htmlFor="notification-date" className="text-xs mb-1 block">Date</Label>
                  <Input 
                    id="notification-date"
                    type="date" 
                    className="h-8 text-sm"
                    value={notificationDate}
                    onChange={(e) => setNotificationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notification-time" className="text-xs mb-1 block">Heure</Label>
                  <Input 
                    id="notification-time"
                    type="time" 
                    className="h-8 text-sm"
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <ActionButton 
                  variant="primary"
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    handleSetNotification(selectedEventForActions.id);
                  }}
                >
                  Définir
                </ActionButton>
                <ActionButton 
                  variant="outline" 
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    setActiveEvent(null);
                  }}
                >
                  Annuler
                </ActionButton>
              </div>
            </div>
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
