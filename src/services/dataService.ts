import { Event, events as initialEvents } from "@/data/events";
import { Location, locations as initialLocations } from "@/data/locations";
import { createLogger } from "@/utils/logger";
import { validateEvent, validateLocation, formatValidationErrors } from "@/services/validationService";

// Créer un logger pour le service de données
const logger = createLogger('DataService');

// Types pour les données gérées par le service
export interface DataState {
  events: Event[];
  locations: Location[];
  isLoading: boolean;
  error: string | null;
}

// État initial des données
const initialState: DataState = {
  events: initialEvents,
  locations: initialLocations,
  isLoading: false,
  error: null
};

// Singleton pour le service de données
class DataService {
  private static instance: DataService;
  private state: DataState;
  private listeners: ((state: DataState) => void)[] = [];

  private constructor() {
    logger.info('Initialisation du service de données');
    this.state = this.loadFromLocalStorage() || initialState;
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Méthodes pour récupérer les données
  public getState(): DataState {
    return { ...this.state };
  }

  public getEvents(): Event[] {
    return [...this.state.events];
  }

  public getLocations(): Location[] {
    return [...this.state.locations];
  }

  public getEventById(id: string): Event | undefined {
    return this.state.events.find(event => event.id === id);
  }

  public getLocationById(id: string): Location | undefined {
    return this.state.locations.find(location => location.id === id);
  }

  public getEventsByLocationId(locationId: string): Event[] {
    return this.state.events.filter(event => event.locationId === locationId);
  }

  // Méthodes pour mettre à jour les données
  public updateEvent(updatedEvent: Event): { success: boolean; error?: string } {
    logger.info(`Mise à jour de l'événement ${updatedEvent.id}`);
    
    // Valider l'événement avant la mise à jour
    const validationResult = validateEvent(updatedEvent);
    
    if (!validationResult.isValid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      logger.error(`Validation échouée pour l'événement ${updatedEvent.id}`, errorMessage);
      
      this.setState({
        ...this.state,
        error: `Erreur de validation: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
    
    this.setState({
      ...this.state,
      events: this.state.events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ),
      error: null
    });
    
    return { success: true };
  }

  public updateLocation(updatedLocation: Location): { success: boolean; error?: string } {
    logger.info(`Mise à jour du lieu ${updatedLocation.id}`);
    
    // Valider le lieu avant la mise à jour
    const validationResult = validateLocation(updatedLocation);
    
    if (!validationResult.isValid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      logger.error(`Validation échouée pour le lieu ${updatedLocation.id}`, errorMessage);
      
      this.setState({
        ...this.state,
        error: `Erreur de validation: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
    
    this.setState({
      ...this.state,
      locations: this.state.locations.map(location => 
        location.id === updatedLocation.id ? updatedLocation : location
      ),
      error: null
    });
    
    return { success: true };
  }

  public addEvent(newEvent: Event): { success: boolean; error?: string } {
    logger.info(`Ajout d'un nouvel événement: ${newEvent.title}`);
    
    // Vérifier si l'ID existe déjà
    if (this.state.events.some(event => event.id === newEvent.id)) {
      const errorMessage = `Un événement avec l'ID ${newEvent.id} existe déjà`;
      logger.error(errorMessage);
      this.setState({
        ...this.state,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
    
    // Valider l'événement avant l'ajout
    const validationResult = validateEvent(newEvent);
    
    if (!validationResult.isValid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      logger.error(`Validation échouée pour le nouvel événement`, errorMessage);
      
      this.setState({
        ...this.state,
        error: `Erreur de validation: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
    
    this.setState({
      ...this.state,
      events: [...this.state.events, newEvent],
      error: null
    });
    
    return { success: true };
  }

  public addLocation(newLocation: Location): { success: boolean; error?: string } {
    logger.info(`Ajout d'un nouveau lieu: ${newLocation.name}`);
    
    // Vérifier si l'ID existe déjà
    if (this.state.locations.some(location => location.id === newLocation.id)) {
      const errorMessage = `Un lieu avec l'ID ${newLocation.id} existe déjà`;
      logger.error(errorMessage);
      this.setState({
        ...this.state,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
    
    // Valider le lieu avant l'ajout
    const validationResult = validateLocation(newLocation);
    
    if (!validationResult.isValid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      logger.error(`Validation échouée pour le nouveau lieu`, errorMessage);
      
      this.setState({
        ...this.state,
        error: `Erreur de validation: ${errorMessage}`
      });
      
      return { success: false, error: errorMessage };
    }
    
    this.setState({
      ...this.state,
      locations: [...this.state.locations, newLocation],
      error: null
    });
    
    return { success: true };
  }

  public removeEvent(eventId: string): void {
    logger.info(`Suppression de l'événement ${eventId}`);
    
    this.setState({
      ...this.state,
      events: this.state.events.filter(event => event.id !== eventId)
    });
  }

  public removeLocation(locationId: string): void {
    logger.info(`Suppression du lieu ${locationId}`);
    
    this.setState({
      ...this.state,
      locations: this.state.locations.filter(location => location.id !== locationId)
    });
  }

  // Méthodes pour la persistance des données
  public saveToLocalStorage(): void {
    logger.info('Sauvegarde des données dans le localStorage');
    
    try {
      // Log détaillé des données avant sauvegarde
      logger.debug('Détails des données à sauvegarder', {
        eventsCount: this.state.events.length,
        locationsCount: this.state.locations.length,
        firstLocation: this.state.locations[0] ? {
          id: this.state.locations[0].id,
          name: this.state.locations[0].name,
          x: this.state.locations[0].x,
          y: this.state.locations[0].y
        } : 'Aucun lieu'
      });
      
      // Sauvegarde des données
      localStorage.setItem('events', JSON.stringify(this.state.events));
      localStorage.setItem('locations', JSON.stringify(this.state.locations));
      
      // Vérification de la sauvegarde
      const savedLocations = localStorage.getItem('locations');
      if (savedLocations) {
        const parsedLocations = JSON.parse(savedLocations);
        logger.debug('Vérification de la sauvegarde', {
          savedLocationsCount: parsedLocations.length,
          firstSavedLocation: parsedLocations[0] ? {
            id: parsedLocations[0].id,
            name: parsedLocations[0].name,
            x: parsedLocations[0].x,
            y: parsedLocations[0].y
          } : 'Aucun lieu'
        });
      }
      
      logger.info('Données sauvegardées avec succès dans le localStorage');
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde des données', error);
      this.setState({
        ...this.state,
        error: 'Erreur lors de la sauvegarde des données'
      });
    }
  }

  private loadFromLocalStorage(): DataState | null {
    logger.info('Chargement des données depuis le localStorage');
    
    try {
      // Récupérer les données du localStorage
      const eventsData = localStorage.getItem('events');
      const locationsData = localStorage.getItem('locations');
      
      // Log des données récupérées
      logger.debug('Données récupérées du localStorage', {
        eventsDataExists: !!eventsData,
        locationsDataExists: !!locationsData,
        eventsDataLength: eventsData ? eventsData.length : 0,
        locationsDataLength: locationsData ? locationsData.length : 0
      });
      
      if (!eventsData || !locationsData) {
        logger.info('Aucune donnée trouvée dans le localStorage');
        return null;
      }
      
      // Parser les données
      const parsedEvents = JSON.parse(eventsData);
      const parsedLocations = JSON.parse(locationsData);
      
      // Log des données parsées
      logger.debug('Données parsées du localStorage', {
        eventsCount: parsedEvents.length,
        locationsCount: parsedLocations.length,
        firstLocation: parsedLocations[0] ? {
          id: parsedLocations[0].id,
          name: parsedLocations[0].name,
          x: parsedLocations[0].x,
          y: parsedLocations[0].y
        } : 'Aucun lieu'
      });
      
      logger.info('Données chargées avec succès depuis le localStorage');
      
      return {
        events: parsedEvents,
        locations: parsedLocations,
        isLoading: false,
        error: null
      };
    } catch (error) {
      logger.error('Erreur lors du chargement des données', error);
      return {
        ...initialState,
        error: 'Erreur lors du chargement des données'
      };
    }
  }

  // Méthodes pour l'import/export des données
  public exportData(): string {
    logger.info('Export des données au format JSON');
    
    try {
      const exportData = {
        events: this.state.events,
        locations: this.state.locations,
        exportDate: new Date().toISOString()
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('Erreur lors de l\'export des données', error);
      this.setState({
        ...this.state,
        error: 'Erreur lors de l\'export des données'
      });
      return '';
    }
  }

  public importData(jsonData: string): boolean {
    logger.info('Import des données depuis JSON');
    
    try {
      const importedData = JSON.parse(jsonData);
      
      if (!importedData.events || !importedData.locations) {
        logger.error('Format de données invalide');
        this.setState({
          ...this.state,
          error: 'Format de données invalide'
        });
        return false;
      }
      
      this.setState({
        ...this.state,
        events: importedData.events,
        locations: importedData.locations,
        error: null
      });
      
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'import des données', error);
      this.setState({
        ...this.state,
        error: 'Erreur lors de l\'import des données'
      });
      return false;
    }
  }

  // Système d'abonnement pour notifier les composants des changements
  public subscribe(listener: (state: DataState) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(newState: DataState): void {
    this.state = newState;
    
    // Notifier tous les abonnés
    this.listeners.forEach(listener => listener(this.state));
    
    // Sauvegarder automatiquement les changements
    this.saveToLocalStorage();
  }
}

// Exporter l'instance unique du service
export const dataService = DataService.getInstance();

// Fonction utilitaire pour récupérer un événement par ID
export const getEventById = (id: string): Event | undefined => {
  return dataService.getEventById(id);
};

// Fonction utilitaire pour récupérer un lieu par ID
export const getLocationById = (id: string): Location | undefined => {
  return dataService.getLocationById(id);
};

// Fonction utilitaire pour récupérer l'ID du lieu d'un événement
export const getLocationIdForEvent = (event: Event): string => {
  return event.locationId;
};
