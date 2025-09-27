import { Event, events as allEvents } from "@/data/events";
import { AchievementType, unlockAchievement } from "./achievements";

// Type pour les événements sauvegardés
export interface SavedEvent extends Event {
  savedAt: string;
  notificationTime?: string;
}

// Récupérer les événements sauvegardés depuis le localStorage
export const getSavedEvents = (): SavedEvent[] => {
  try {
    const savedEventIds = localStorage.getItem('savedEvents');
    if (!savedEventIds) return [];
    
    // Convertir les IDs sauvegardés en objets d'événements complets
    const ids = JSON.parse(savedEventIds) as string[];
    if (!Array.isArray(ids)) return [];
    
    // Utiliser les événements importés directement
    // (allEvents est importé en haut du fichier)
    
    return ids.map(id => {
      if (!id) return null;
      const event = allEvents.find((e: Event) => e && e.id === id);
      if (!event) return null;
      
      return {
        ...event,
        savedAt: new Date().toISOString()
      };
    }).filter(Boolean) as SavedEvent[];
  } catch (error) {
    console.error('Erreur dans getSavedEvents:', error);
    return [];
  }
};

// Sauvegarder un événement
export const saveEvent = (event: Event): SavedEvent[] => {
  try {
    if (!event || !event.id) {
      console.error('Tentative de sauvegarde d\'un événement invalide:', event);
      return getSavedEvents();
    }
    
    const savedEventIdsStr = localStorage.getItem('savedEvents');
    let savedEventIds = [];
    
    try {
      savedEventIds = savedEventIdsStr ? JSON.parse(savedEventIdsStr) as string[] : [];
      if (!Array.isArray(savedEventIds)) savedEventIds = [];
    } catch (error) {
      console.error('Erreur lors de la lecture des événements sauvegardés:', error);
      savedEventIds = [];
    }
    
    console.log(`[savedEvents] Événements déjà sauvegardés: ${savedEventIds.length}`, savedEventIds);
    
    // Vérifier si l'événement est déjà sauvegardé
    const eventExists = savedEventIds.includes(event.id);
    console.log(`[savedEvents] Événement déjà sauvegardé: ${eventExists}`);
    
    if (!eventExists) {
      const updatedIds = [...savedEventIds, event.id];
      localStorage.setItem('savedEvents', JSON.stringify(updatedIds));
      console.log(`[savedEvents] Événement sauvegardé, nouveau total: ${updatedIds.length}`);
      
      // Déclencher l'événement personnalisé pour mettre à jour les compteurs
      window.dispatchEvent(new CustomEvent('savedEventsChanged'));
      
      // Débloquer des réalisations avec un délai pour assurer que l'interface est prête
      console.log(`[savedEvents] Planification du déclenchement des achievements dans 500ms`);
      setTimeout(() => {
        // Premier événement sauvegardé
        if (updatedIds.length === 1) {
          console.log(`[savedEvents] Déclenchement de l'achievement FIRST_EVENT_SAVED (premier événement)`);
          unlockAchievement(AchievementType.FIRST_EVENT_SAVED);
        }
        
        // 5 événements ou plus sauvegardés
        if (updatedIds.length >= 5) {
          console.log(`[savedEvents] Déclenchement de l'achievement MULTIPLE_EVENTS_SAVED (${updatedIds.length} événements)`);
          unlockAchievement(AchievementType.MULTIPLE_EVENTS_SAVED);
        }
      }, 500); // Délai de 500ms pour assurer que l'interface est prête
    } else {
      console.log(`[savedEvents] Événement déjà sauvegardé, aucune action nécessaire`);
    }
    
    return getSavedEvents();
  } catch (error) {
    console.error('Erreur dans saveEvent:', error);
    return getSavedEvents();
  }
};

// Supprimer un événement sauvegardé
export const removeSavedEvent = (eventId: string): SavedEvent[] => {
  try {
    if (!eventId) {
      console.error('Tentative de suppression d\'un événement avec un ID invalide');
      return getSavedEvents();
    }
    
    const savedEventIdsStr = localStorage.getItem('savedEvents');
    if (!savedEventIdsStr) return [];
    
    let savedEventIds = [];
    try {
      savedEventIds = JSON.parse(savedEventIdsStr) as string[];
      if (!Array.isArray(savedEventIds)) savedEventIds = [];
    } catch (error) {
      console.error('Erreur lors de la lecture des événements sauvegardés:', error);
      return [];
    }
    
    const updatedIds = savedEventIds.filter(id => id !== eventId);
    localStorage.setItem('savedEvents', JSON.stringify(updatedIds));
    
    // Déclencher l'événement personnalisé pour mettre à jour les compteurs
    window.dispatchEvent(new CustomEvent('savedEventsChanged'));
    
    return getSavedEvents();
  } catch (error) {
    console.error('Erreur dans removeSavedEvent:', error);
    return [];
  }
};

// Définir une notification pour un événement sauvegardé
export const setEventNotification = (eventId: string, notificationTime: string): SavedEvent[] => {
  try {
    if (!eventId) {
      console.error('Tentative de définir une notification pour un événement avec un ID invalide');
      return getSavedEvents();
    }
    
    // Stocker les notifications séparément
    const notificationsStr = localStorage.getItem('eventNotifications');
    let notifications = {};
    
    try {
      notifications = notificationsStr ? JSON.parse(notificationsStr) : {};
      if (typeof notifications !== 'object') notifications = {};
    } catch (error) {
      console.error('Erreur lors de la lecture des notifications:', error);
      notifications = {};
    }
    
    // Vérifier si c'est la première notification configurée
    const isFirstNotification = Object.keys(notifications).length === 0;
    
    // Mettre à jour la notification pour cet événement
    notifications[eventId] = notificationTime;
    localStorage.setItem('eventNotifications', JSON.stringify(notifications));
    
    // Débloquer la réalisation si c'est la première notification
    if (isFirstNotification) {
      unlockAchievement(AchievementType.NOTIFICATION_SET);
    }
    
    // Récupérer les événements sauvegardés avec les notifications mises à jour
    const events = getSavedEvents();
    return events.map(event => {
      if (event && event.id === eventId) {
        return { ...event, notificationTime };
      }
      return event;
    });
  } catch (error) {
    console.error('Erreur dans setEventNotification:', error);
    return getSavedEvents();
  }
};

// Vérifier les notifications à afficher
export const checkNotifications = (): SavedEvent[] => {
  try {
    const events = getSavedEvents();
    const now = new Date();
    
    // Récupérer les notifications
    const notificationsStr = localStorage.getItem('eventNotifications');
    if (!notificationsStr) return [];
    
    let notifications = {};
    try {
      notifications = JSON.parse(notificationsStr);
      if (typeof notifications !== 'object') return [];
    } catch (error) {
      console.error('Erreur lors de la lecture des notifications:', error);
      return [];
    }
    
    // Filtrer les événements dont la notification doit être affichée
    return events.filter(event => {
      if (!event || !event.id) return false;
      
      const notificationTime = notifications[event.id];
      if (!notificationTime) return false;
      
      try {
        const notificationDate = new Date(notificationTime);
        return notificationDate <= now;
      } catch (error) {
        console.error('Date de notification invalide:', error);
        return false;
      }
    });
  } catch (error) {
    console.error('Erreur dans checkNotifications:', error);
    return [];
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = (eventId: string): SavedEvent[] => {
  try {
    if (!eventId) {
      console.error('Tentative de marquer comme lue une notification avec un ID invalide');
      return getSavedEvents();
    }
    
    // Récupérer les notifications
    const notificationsStr = localStorage.getItem('eventNotifications');
    if (!notificationsStr) return getSavedEvents();
    
    let notifications = {};
    try {
      notifications = JSON.parse(notificationsStr);
      if (typeof notifications !== 'object') return getSavedEvents();
    } catch (error) {
      console.error('Erreur lors de la lecture des notifications:', error);
      return getSavedEvents();
    }
    
    // Supprimer la notification pour cet événement
    if (notifications[eventId]) {
      delete notifications[eventId];
      localStorage.setItem('eventNotifications', JSON.stringify(notifications));
    }
    
    return getSavedEvents();
  } catch (error) {
    console.error('Erreur dans markNotificationAsRead:', error);
    return getSavedEvents();
  }
};
