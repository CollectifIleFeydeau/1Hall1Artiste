import { storageManager } from '@/utils/storageManager';
import { Event } from '@/data/events';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EnhancedSavedEvents');

// Clé pour les événements sauvegardés dans le stockage
const SAVED_EVENTS_KEY = 'saved-events';

/**
 * Service amélioré pour gérer les événements sauvegardés
 */
export const enhancedSavedEvents = {
  /**
   * Récupère tous les événements sauvegardés
   */
  getSavedEvents(): Event[] {
    try {
      return storageManager.get<Event[]>(SAVED_EVENTS_KEY, []) || [];
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements sauvegardés', error);
      return [];
    }
  },

  /**
   * Sauvegarde un événement
   */
  saveEvent(event: Event): boolean {
    try {
      const savedEvents = this.getSavedEvents();
      
      // Vérifier si l'événement est déjà sauvegardé
      if (savedEvents.some(e => e.id === event.id)) {
        logger.info(`L'événement ${event.id} est déjà sauvegardé`);
        return true;
      }
      
      // Ajouter l'événement à la liste
      const updatedEvents = [...savedEvents, event];
      
      // Sauvegarder la liste mise à jour
      const success = storageManager.set(SAVED_EVENTS_KEY, updatedEvents);
      
      if (success) {
        logger.info(`Événement ${event.id} sauvegardé avec succès`);
      } else {
        logger.error(`Échec de la sauvegarde de l'événement ${event.id}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Erreur lors de la sauvegarde de l'événement ${event.id}`, error);
      return false;
    }
  },

  /**
   * Supprime un événement sauvegardé
   */
  removeSavedEvent(eventId: string): boolean {
    try {
      const savedEvents = this.getSavedEvents();
      
      // Filtrer l'événement à supprimer
      const updatedEvents = savedEvents.filter(event => event.id !== eventId);
      
      // Si aucun changement, l'événement n'était pas sauvegardé
      if (updatedEvents.length === savedEvents.length) {
        logger.info(`L'événement ${eventId} n'était pas sauvegardé`);
        return true;
      }
      
      // Sauvegarder la liste mise à jour
      const success = storageManager.set(SAVED_EVENTS_KEY, updatedEvents);
      
      if (success) {
        logger.info(`Événement ${eventId} supprimé avec succès`);
      } else {
        logger.error(`Échec de la suppression de l'événement ${eventId}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'événement ${eventId}`, error);
      return false;
    }
  },

  /**
   * Vérifie si un événement est sauvegardé
   */
  isEventSaved(eventId: string): boolean {
    try {
      const savedEvents = this.getSavedEvents();
      return savedEvents.some(event => event.id === eventId);
    } catch (error) {
      logger.error(`Erreur lors de la vérification de l'événement ${eventId}`, error);
      return false;
    }
  },

  /**
   * Supprime tous les événements sauvegardés
   */
  clearSavedEvents(): boolean {
    try {
      return storageManager.remove(SAVED_EVENTS_KEY);
    } catch (error) {
      logger.error('Erreur lors de la suppression de tous les événements sauvegardés', error);
      return false;
    }
  }
};

