import { Event } from "@/data/events";

// Type pour les événements sauvegardés
export interface SavedEvent extends Event {
  savedAt: string;
  notificationTime?: string;
}

// Récupérer les événements sauvegardés depuis le localStorage
export const getSavedEvents = (): SavedEvent[] => {
  const savedEvents = localStorage.getItem('savedEvents');
  return savedEvents ? JSON.parse(savedEvents) : [];
};

// Sauvegarder un événement
export const saveEvent = (event: Event): SavedEvent[] => {
  const savedEvents = getSavedEvents();
  
  // Vérifier si l'événement est déjà sauvegardé
  const eventExists = savedEvents.some(savedEvent => savedEvent.id === event.id);
  
  if (!eventExists) {
    const savedEvent: SavedEvent = {
      ...event,
      savedAt: new Date().toISOString()
    };
    
    const updatedSavedEvents = [...savedEvents, savedEvent];
    localStorage.setItem('savedEvents', JSON.stringify(updatedSavedEvents));
    return updatedSavedEvents;
  }
  
  return savedEvents;
};

// Supprimer un événement sauvegardé
export const removeSavedEvent = (eventId: string): SavedEvent[] => {
  const savedEvents = getSavedEvents();
  const updatedSavedEvents = savedEvents.filter(event => event.id !== eventId);
  localStorage.setItem('savedEvents', JSON.stringify(updatedSavedEvents));
  return updatedSavedEvents;
};

// Définir une notification pour un événement sauvegardé
export const setEventNotification = (eventId: string, notificationTime: string): SavedEvent[] => {
  const savedEvents = getSavedEvents();
  const updatedSavedEvents = savedEvents.map(event => {
    if (event.id === eventId) {
      return { ...event, notificationTime };
    }
    return event;
  });
  
  localStorage.setItem('savedEvents', JSON.stringify(updatedSavedEvents));
  return updatedSavedEvents;
};

// Vérifier les notifications à afficher
export const checkNotifications = (): SavedEvent[] => {
  const savedEvents = getSavedEvents();
  const now = new Date();
  
  // Filtrer les événements dont la notification doit être affichée
  return savedEvents.filter(event => {
    if (!event.notificationTime) return false;
    
    const notificationDate = new Date(event.notificationTime);
    return notificationDate <= now;
  });
};

// Marquer une notification comme lue
export const markNotificationAsRead = (eventId: string): SavedEvent[] => {
  const savedEvents = getSavedEvents();
  const updatedSavedEvents = savedEvents.map(event => {
    if (event.id === eventId) {
      return { ...event, notificationTime: undefined };
    }
    return event;
  });
  
  localStorage.setItem('savedEvents', JSON.stringify(updatedSavedEvents));
  return updatedSavedEvents;
};
