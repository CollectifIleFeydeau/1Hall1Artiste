import { Event } from "@/data/events";
import { Location } from "@/data/locations";
import { createLogger } from "@/utils/logger";

// Créer un logger pour le service de validation
const logger = createLogger('ValidationService');

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Fonctions de validation pour les événements
export const validateEvent = (event: Event): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validation des champs obligatoires
  if (!event.id) {
    errors.push({ field: 'id', message: 'L\'identifiant est obligatoire' });
  } else if (!/^[a-z0-9-]+$/.test(event.id)) {
    errors.push({ field: 'id', message: 'L\'identifiant doit contenir uniquement des lettres minuscules, des chiffres et des tirets' });
  }
  
  if (!event.title || event.title.trim() === '') {
    errors.push({ field: 'title', message: 'Le titre est obligatoire' });
  }
  
  if (!event.artistName || event.artistName.trim() === '') {
    errors.push({ field: 'artistName', message: 'Le nom de l\'artiste est obligatoire' });
  }
  
  if (!event.type) {
    errors.push({ field: 'type', message: 'Le type d\'événement est obligatoire' });
  } else if (event.type !== 'exposition' && event.type !== 'concert') {
    errors.push({ field: 'type', message: 'Le type d\'événement doit être "exposition" ou "concert"' });
  }
  
  if (!event.description || event.description.trim() === '') {
    errors.push({ field: 'description', message: 'La description est obligatoire' });
  }
  
  if (!event.artistBio || event.artistBio.trim() === '') {
    errors.push({ field: 'artistBio', message: 'La biographie de l\'artiste est obligatoire' });
  }
  
  if (!event.time || event.time.trim() === '') {
    errors.push({ field: 'time', message: 'L\'horaire est obligatoire' });
  }
  
  if (!event.days || event.days.length === 0) {
    errors.push({ field: 'days', message: 'Au moins un jour doit être sélectionné' });
  } else {
    for (const day of event.days) {
      if (day !== 'samedi' && day !== 'dimanche') {
        errors.push({ field: 'days', message: 'Les jours doivent être "samedi" ou "dimanche"' });
        break;
      }
    }
  }
  
  if (!event.locationName || event.locationName.trim() === '') {
    errors.push({ field: 'locationName', message: 'Le nom du lieu est obligatoire' });
  }
  
  // Validation des coordonnées
  if (typeof event.x !== 'number') {
    errors.push({ field: 'x', message: 'La coordonnée X doit être un nombre' });
  }
  
  if (typeof event.y !== 'number') {
    errors.push({ field: 'y', message: 'La coordonnée Y doit être un nombre' });
  }
  
  // Journalisation des résultats de validation
  if (errors.length > 0) {
    logger.warn(`Validation de l'événement ${event.id} échouée`, { errors });
  } else {
    logger.info(`Validation de l'événement ${event.id} réussie`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonctions de validation pour les lieux
export const validateLocation = (location: Location): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validation des champs obligatoires
  if (!location.id) {
    errors.push({ field: 'id', message: 'L\'identifiant est obligatoire' });
  } else if (!/^[a-z0-9-]+$/.test(location.id)) {
    errors.push({ field: 'id', message: 'L\'identifiant doit contenir uniquement des lettres minuscules, des chiffres et des tirets' });
  }
  
  if (!location.name || location.name.trim() === '') {
    errors.push({ field: 'name', message: 'Le nom est obligatoire' });
  }
  
  if (!location.description || location.description.trim() === '') {
    errors.push({ field: 'description', message: 'La description est obligatoire' });
  }
  
  if (!location.events || !Array.isArray(location.events)) {
    errors.push({ field: 'events', message: 'La liste des événements doit être un tableau' });
  }
  
  // Validation des coordonnées
  if (typeof location.x !== 'number') {
    errors.push({ field: 'x', message: 'La coordonnée X doit être un nombre' });
  }
  
  if (typeof location.y !== 'number') {
    errors.push({ field: 'y', message: 'La coordonnée Y doit être un nombre' });
  }
  
  // Journalisation des résultats de validation
  if (errors.length > 0) {
    logger.warn(`Validation du lieu ${location.id} échouée`, { errors });
  } else {
    logger.info(`Validation du lieu ${location.id} réussie`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction utilitaire pour formater les erreurs de validation en message lisible
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
};
