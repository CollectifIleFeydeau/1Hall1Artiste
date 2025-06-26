/**
 * Types pour la galerie communautaire
 */

// Types d'entrées possibles
export type EntryType = 'photo' | 'testimonial';

// Statuts de modération possibles
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

// Structure d'une entrée communautaire
export interface CommunityEntry {
  id: string;
  type: EntryType;
  displayName: string;
  sessionId?: string;
  createdAt: string;
  timestamp?: string; // Date formatée pour l'affichage
  moderation: {
    status: ModerationStatus;
    moderatedAt: string | null;
  };
  
  // Champs spécifiques aux photos
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  
  // Champs spécifiques aux témoignages
  content?: string;
  
  // Références
  eventId?: string;
  locationId?: string;
  
  // Informations de contexte
  contextType?: string;
  contextId?: string;
}

// Paramètres pour soumettre une nouvelle contribution
export interface SubmissionParams {
  type: EntryType;
  displayName?: string;
  sessionId?: string;
  
  // Pour les photos
  image?: File;
  cloudinaryUrl?: string; // URL Cloudinary après upload
  description?: string;
  
  // Pour les témoignages
  content?: string;
  
  // Références
  eventId?: string;
  locationId?: string;
  
  // Informations de contexte
  contextType?: string;
  contextId?: string;
}

// Structure des données de contenu communautaire
export interface CommunityContentData {
  entries: CommunityEntry[];
  lastUpdated: string;
}

// Résultat de modération
export interface ModerationResult {
  entryId: string;
  status: ModerationStatus;
  message?: string;
}
