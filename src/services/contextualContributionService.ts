import { Event } from "@/data/events";
import { Location } from "@/data/locations";
import { SubmissionParams } from "@/types/communityTypes";
import { getImagePath } from "@/utils/imagePaths";

// Interface pour stocker les informations de contribution contextuelle
interface ContributionContext {
  type: "event" | "location";
  id: string;
  name: string;
  imageUrl?: string;
  locationId?: string; // ID du lieu associé à l'événement
}

// Clé pour le stockage local
const CONTRIBUTION_CONTEXT_KEY = 'contribution_context';

/**
 * Enregistre le contexte d'une contribution liée à un événement
 */
export function setEventContributionContext(event: Event): void {
  const context: ContributionContext = {
    type: "event",
    id: event.id,
    name: event.title,
    imageUrl: event.image ? getImagePath(event.image) : undefined,
    locationId: event.locationId // Inclure l'ID du lieu associé à l'événement
  };
  
  try {
    localStorage.setItem(CONTRIBUTION_CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du contexte de contribution:", error);
  }
}

/**
 * Enregistre le contexte d'une contribution liée à un lieu
 */
export function setLocationContributionContext(location: Location): void {
  const context: ContributionContext = {
    type: "location",
    id: location.id,
    name: location.name,
    imageUrl: location.image ? getImagePath(location.image) : undefined
  };
  
  try {
    localStorage.setItem(CONTRIBUTION_CONTEXT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du contexte de contribution:", error);
  }
}

/**
 * Récupère le contexte de contribution actuel
 */
export function getContributionContext(): ContributionContext | null {
  try {
    const contextData = localStorage.getItem(CONTRIBUTION_CONTEXT_KEY);
    return contextData ? JSON.parse(contextData) : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du contexte de contribution:", error);
    return null;
  }
}

/**
 * Efface le contexte de contribution
 */
export function clearContributionContext(): void {
  try {
    localStorage.removeItem(CONTRIBUTION_CONTEXT_KEY);
  } catch (error) {
    console.error("Erreur lors de la suppression du contexte de contribution:", error);
  }
}

/**
 * Enrichit les paramètres de soumission avec le contexte actuel
 */
export function enrichSubmissionWithContext(params: SubmissionParams): SubmissionParams {
  const context = getContributionContext();
  
  if (!context) {
    return params;
  }
  
  return {
    ...params,
    contextType: context.type,
    contextId: context.id
  };
}

