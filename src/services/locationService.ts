import { createLogger } from "@/utils/logger";
import { GeoPosition, isPositionWithinFeydeau, calculateDistanceToCenter } from "@/utils/locationUtils";
import { FEYDEAU_CENTER } from "@/data/gpsCoordinates";
import { toastService } from "@/services/toastService";

// Créer un logger pour le service
const logger = createLogger('locationService');

// Constantes pour le service de localisation
const LOCATION_UPDATE_INTERVAL = 5000; // 5 secondes
const LOCATION_TIMEOUT = 10000; // 10 secondes
const LOCATION_MAX_AGE = 30000; // 30 secondes
const LOCATION_CONSENT_KEY = 'locationConsent';
const LOCATION_ACTIVATION_TIMESTAMP_KEY = 'locationActivationTimestamp';
const RECENT_ACTIVATION_THRESHOLD = 5000; // 5 secondes

// Options pour la géolocalisation
const geoOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: LOCATION_TIMEOUT,
  maximumAge: LOCATION_MAX_AGE
};

// Type pour les callbacks de mise à jour de position
export type LocationUpdateCallback = (position: GeoPosition) => void;
export type MapCoordinatesUpdateCallback = (x: number, y: number, position?: GeoPosition) => void;
export type PermissionChangeCallback = (denied: boolean) => void;

// Interface pour le service de localisation
export interface LocationServiceInterface {
  startTracking: (
    onLocationUpdate: MapCoordinatesUpdateCallback,
    onPermissionChange?: PermissionChangeCallback
  ) => void;
  stopTracking: () => void;
  isLocationActivated: () => boolean;
  activateLocation: () => void;
  deactivateLocation: () => void;
}

/**
 * Service pour gérer le suivi de la localisation de l'utilisateur
 */
class LocationService implements LocationServiceInterface {
  private watchId: number | null = null;
  private lastPosition: GeoPosition | null = null;
  private onLocationUpdateCallback: MapCoordinatesUpdateCallback | null = null;
  private onPermissionChangeCallback: PermissionChangeCallback | null = null;
  private permissionDenied: boolean = false;
  private isLocalDevelopment: boolean = false;
  private simulationInterval: number | null = null;

  constructor() {
    // Détecter si nous sommes en environnement de développement local
    // Pour les tests sur le terrain, on force cette valeur à false
    this.isLocalDevelopment = false;
    
    // Vérifier si la géolocalisation est disponible
    if (!navigator.geolocation && !this.isLocalDevelopment) {
      logger.warn('La géolocalisation n\'est pas prise en charge par ce navigateur');
    }
  }

  /**
   * Démarre le suivi de la localisation
   * @param onLocationUpdate Callback pour les mises à jour de position sur la carte
   * @param onPermissionChange Callback pour les changements d'état de permission
   */
  public startTracking(
    onLocationUpdate: MapCoordinatesUpdateCallback,
    onPermissionChange?: PermissionChangeCallback
  ): void {
    this.onLocationUpdateCallback = onLocationUpdate;
    this.onPermissionChangeCallback = onPermissionChange || null;
    
    // Réinitialiser l'état de permission refusée au démarrage
    this.permissionDenied = false;
    
    // Notifier que la permission n'est pas refusée
    this.notifyPermissionChange(false);
    
    // Si la localisation n'est pas activée, ne pas démarrer le suivi
    if (!this.isLocationActivated()) {
      logger.info('La localisation n\'est pas activée, le suivi ne démarre pas');
      return;
    }
    
    // En mode développement local, simuler la position
    if (this.isLocalDevelopment) {
      this.startPositionSimulation();
      return;
    }
    
    // Vérifier si la géolocalisation est disponible
    if (!navigator.geolocation) {
      logger.warn('La géolocalisation n\'est pas prise en charge par ce navigateur');
      toastService.error({
        title: "Localisation non disponible",
        description: "Votre navigateur ne prend pas en charge la géolocalisation.",
        source: "LocationService.startTracking",
        context: {
          browserSupport: false
        }
      });
      return;
    }
    
    // Forcer une demande d'autorisation de géolocalisation immédiatement
    navigator.geolocation.getCurrentPosition(
      this.handlePositionSuccess.bind(this),
      this.handlePositionError.bind(this),
      geoOptions
    );
    
    // Démarrer le suivi de la position
    const id = navigator.geolocation.watchPosition(
      this.handlePositionSuccess.bind(this),
      this.handlePositionError.bind(this),
      geoOptions
    );
    
    this.watchId = id;
    logger.info('Suivi de la position démarré', { watchId: id });
  }

  /**
   * Arrête le suivi de la localisation
   */
  public stopTracking(): void {
    // Arrêter la simulation si elle est active
    if (this.simulationInterval !== null) {
      window.clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      logger.info('Simulation de position arrêtée');
    }
    
    // Arrêter le suivi si actif
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      logger.info('Suivi de la position arrêté');
    }
    
    // Réinitialiser les callbacks
    this.onLocationUpdateCallback = null;
    this.onPermissionChangeCallback = null;
  }

  /**
   * Vérifie si la localisation est activée
   * @returns true si la localisation est activée, false sinon
   */
  public isLocationActivated(): boolean {
    return localStorage.getItem(LOCATION_CONSENT_KEY) === 'granted';
  }

  /**
   * Active la localisation
   */
  public activateLocation(): void {
    localStorage.setItem(LOCATION_CONSENT_KEY, 'granted');
    localStorage.setItem(LOCATION_ACTIVATION_TIMESTAMP_KEY, Date.now().toString());
    logger.info('Localisation activée');
    
    toastService.success({
      title: "Localisation activée",
      description: "Vous pouvez maintenant voir votre position sur la carte.",
      duration: 3000,
      source: "LocationService.activateLocation",
      context: {
        timestamp: Date.now()
      }
    });
  }

  /**
   * Désactive la localisation
   */
  public deactivateLocation(): void {
    localStorage.removeItem(LOCATION_CONSENT_KEY);
    localStorage.removeItem(LOCATION_ACTIVATION_TIMESTAMP_KEY);
    logger.info('Localisation désactivée');
    
    toastService.show({
      title: "Localisation désactivée",
      description: "Votre position ne sera plus suivie.",
      duration: 3000,
      source: "LocationService.deactivateLocation",
      context: {
        timestamp: Date.now()
      }
    });
    
    // Arrêter le suivi
    this.stopTracking();
  }

  /**
   * Vérifie si la localisation a été activée récemment
   * @returns true si la localisation a été activée il y a moins de RECENT_ACTIVATION_THRESHOLD ms
   */
  private isRecentlyActivated(): boolean {
    const activationTimestamp = localStorage.getItem(LOCATION_ACTIVATION_TIMESTAMP_KEY);
    if (!activationTimestamp) return false;
    
    const timestamp = parseInt(activationTimestamp, 10);
    const now = Date.now();
    return now - timestamp < RECENT_ACTIVATION_THRESHOLD;
  }

  /**
   * Notifie le changement d'état de permission
   * @param denied true si la permission est refusée, false sinon
   */
  private notifyPermissionChange(denied: boolean): void {
    if (this.permissionDenied !== denied) {
      this.permissionDenied = denied;
      
      if (this.onPermissionChangeCallback) {
        this.onPermissionChangeCallback(denied);
      }
    }
  }

  /**
   * Gère le succès de la géolocalisation
   * @param pos Position reçue du navigateur
   */
  private handlePositionSuccess(pos: GeolocationPosition): void {
    // Extraire les données de position
    const position: GeoPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
    
    // Enregistrer la position
    this.lastPosition = position;
    
    // Désactivation complète des logs de position pour éviter de surcharger la console
    // Les logs ne seront générés que pour les événements importants (démarrage/arrêt du suivi, erreurs)
    
    // Convertir les coordonnées GPS en coordonnées de carte
    // Cette conversion est gérée par le composant qui utilise ce service
    
    // Vérifier si l'utilisateur est dans l'Île Feydeau
    const isWithin = isPositionWithinFeydeau(position);
    
    // Calculer la distance au centre
    const distanceToCenter = calculateDistanceToCenter(position.latitude, position.longitude);
    const isFarFromCenter = distanceToCenter > 300; // Plus de 300 mètres
    
    // Déterminer s'il faut afficher une notification
    const isFirstPosition = this.lastPosition === position;
    const isRecentlyActivated = this.isRecentlyActivated();
    
    // Afficher une notification si l'utilisateur est loin de l'Île
    if (!isWithin && !isFirstPosition && !isRecentlyActivated && isFarFromCenter) {
      // Cette notification est maintenant gérée par le composant qui utilise ce service
    }
    
    // Notifier la mise à jour de position
    if (this.onLocationUpdateCallback) {
      // Le callback doit gérer la conversion GPS -> carte
      this.onLocationUpdateCallback(0, 0, position);
    }
  }

  /**
   * Gère les erreurs de géolocalisation
   * @param err Erreur de géolocalisation
   */
  private handlePositionError(err: GeolocationPositionError): void {
    // Ne pas logger les erreurs de timeout, elles sont normales
    if (err.code !== err.TIMEOUT) {
      logger.error('Erreur de géolocalisation', {
        code: err.code,
        message: err.message
      });
    }
    
    // Gérer les différents types d'erreurs
    switch (err.code) {
      case err.PERMISSION_DENIED:
        this.notifyPermissionChange(true);
        break;
        
      case err.POSITION_UNAVAILABLE:
        // Notification gérée par le composant
        break;
        
      case err.TIMEOUT:
        // Ignorer les timeouts, ils sont normaux
        break;
    }
  }

  /**
   * Démarre la simulation de position pour le développement local
   */
  private startPositionSimulation(): void {
    logger.info('Démarrage de la simulation de position pour le développement local');
    
    // Simuler une position initiale au centre de l'Île Feydeau
    const initialPosition: GeoPosition = {
      latitude: FEYDEAU_CENTER.latitude,
      longitude: FEYDEAU_CENTER.longitude,
      accuracy: 10 // 10 mètres de précision
    };
    
    // Notifier immédiatement avec la position initiale
    this.handlePositionSuccess({
      coords: {
        latitude: initialPosition.latitude,
        longitude: initialPosition.longitude,
        accuracy: initialPosition.accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    } as GeolocationPosition);
    
    // Mettre à jour la position simulée périodiquement
    this.simulationInterval = window.setInterval(() => {
      // Générer une légère variation aléatoire pour simuler un mouvement
      const latOffset = (Math.random() - 0.5) * 0.0002; // Environ ±10 mètres
      const lngOffset = (Math.random() - 0.5) * 0.0002; // Environ ±10 mètres
      
      const simulatedPosition: GeoPosition = {
        latitude: FEYDEAU_CENTER.latitude + latOffset,
        longitude: FEYDEAU_CENTER.longitude + lngOffset,
        accuracy: 5 + Math.random() * 10 // Entre 5 et 15 mètres de précision
      };
      
      // Notifier avec la position simulée
      this.handlePositionSuccess({
        coords: {
          latitude: simulatedPosition.latitude,
          longitude: simulatedPosition.longitude,
          accuracy: simulatedPosition.accuracy,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition);
    }, LOCATION_UPDATE_INTERVAL);
  }
}

// Exporter une instance unique du service
export const locationService = new LocationService();
