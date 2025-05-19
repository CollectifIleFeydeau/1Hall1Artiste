import { useState, useEffect } from 'react';
import { dataService, DataState } from '@/services/dataService';
import { Event } from '@/data/events';
import { Location } from '@/data/locations';
import { createLogger } from '@/utils/logger';

// Créer un logger pour le hook
const logger = createLogger('useData');

/**
 * Hook personnalisé pour accéder et manipuler les données de l'application
 */
export const useData = () => {
  const [state, setState] = useState<DataState>(dataService.getState());

  useEffect(() => {
    logger.info('Initialisation du hook useData');
    
    // S'abonner aux changements du service de données
    const unsubscribe = dataService.subscribe(newState => {
      setState(newState);
    });
    
    // Se désabonner lors du démontage du composant
    return () => {
      logger.info('Nettoyage du hook useData');
      unsubscribe();
    };
  }, []);

  // Fonctions pour récupérer les données
  const getEvents = (): Event[] => state.events;
  const getLocations = (): Location[] => state.locations;
  
  const getEventById = (id: string): Event | undefined => 
    state.events.find(event => event.id === id);
  
  const getLocationById = (id: string): Location | undefined => 
    state.locations.find(location => location.id === id);
  
  const getEventsByLocationId = (locationId: string): Event[] => {
    const location = getLocationById(locationId);
    if (!location) return [];
    
    return state.events.filter(event => 
      location.events.includes(event.id)
    );
  };

  // Fonctions pour mettre à jour les données
  const updateEvent = (updatedEvent: Event): { success: boolean; error?: string } => {
    logger.info(`Mise à jour de l'événement ${updatedEvent.id}`);
    return dataService.updateEvent(updatedEvent);
  };

  const updateLocation = (updatedLocation: Location): { success: boolean; error?: string } => {
    logger.info(`Mise à jour du lieu ${updatedLocation.id}`);
    return dataService.updateLocation(updatedLocation);
  };

  const addEvent = (newEvent: Event): { success: boolean; error?: string } => {
    logger.info(`Ajout d'un nouvel événement: ${newEvent.title}`);
    return dataService.addEvent(newEvent);
  };

  const addLocation = (newLocation: Location): { success: boolean; error?: string } => {
    logger.info(`Ajout d'un nouveau lieu: ${newLocation.name}`);
    return dataService.addLocation(newLocation);
  };

  const removeEvent = (eventId: string): void => {
    logger.info(`Suppression de l'événement ${eventId}`);
    dataService.removeEvent(eventId);
  };

  const removeLocation = (locationId: string): void => {
    logger.info(`Suppression du lieu ${locationId}`);
    dataService.removeLocation(locationId);
  };

  // Fonctions pour l'import/export des données
  const exportData = (): string => {
    logger.info('Export des données');
    return dataService.exportData();
  };

  const importData = (jsonData: string): boolean => {
    logger.info('Import des données');
    return dataService.importData(jsonData);
  };

  return {
    // État
    events: state.events,
    locations: state.locations,
    isLoading: state.isLoading,
    error: state.error,
    
    // Getters
    getEvents,
    getLocations,
    getEventById,
    getLocationById,
    getEventsByLocationId,
    
    // Setters
    updateEvent,
    updateLocation,
    addEvent,
    addLocation,
    removeEvent,
    removeLocation,
    
    // Import/Export
    exportData,
    importData
  };
};

/**
 * Hook spécialisé pour les événements uniquement
 */
export const useEvents = () => {
  const { 
    events, 
    isLoading, 
    error, 
    getEventById, 
    addEvent, 
    updateEvent, 
    removeEvent 
  } = useData();
  
  return {
    events,
    isLoading,
    error,
    getEventById,
    addEvent,
    updateEvent,
    removeEvent
  };
};

/**
 * Hook spécialisé pour les lieux uniquement
 */
export const useLocations = () => {
  const { 
    locations, 
    isLoading, 
    error, 
    getLocationById, 
    getEventsByLocationId,
    addLocation, 
    updateLocation, 
    removeLocation 
  } = useData();
  
  return {
    locations,
    isLoading,
    error,
    getLocationById,
    getEventsByLocationId,
    addLocation,
    updateLocation,
    removeLocation
  };
};
