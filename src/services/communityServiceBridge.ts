/**
 * Bridge pour les services communautaires
 * Ce fichier sert de pont entre l'application principale et les services communautaires
 * stockés dans le dépôt community-content
 */

// Importer les types nécessaires
import { CommunityEntry, SubmissionParams, ModerationResult } from "../types/communityTypes";

// Chemin relatif vers le service communautaire dans le dépôt community-content
// Ajustez ce chemin selon votre structure de projet
const communityServicePath = '../../community-content/services/communityService.js';

// Fonction pour importer dynamiquement le service communautaire
async function importCommunityService() {
  try {
    return await import(communityServicePath);
  } catch (error) {
    console.error('Erreur lors de l\'importation du service communautaire:', error);
    throw new Error('Impossible de charger le service communautaire');
  }
}

// Exporter les fonctions du service communautaire avec les types TypeScript appropriés
export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  const service = await importCommunityService();
  return service.fetchCommunityEntries();
}

export async function deleteCommunityEntry(entryId: string): Promise<boolean> {
  const service = await importCommunityService();
  return service.deleteCommunityEntry(entryId);
}

export async function toggleLike(entryId: string, sessionId: string): Promise<CommunityEntry> {
  const service = await importCommunityService();
  return service.toggleLike(entryId, sessionId);
}

// Fonction pour soumettre une nouvelle contribution
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  const service = await importCommunityService();
  return service.submitContribution(params);
}

// Fonction pour modérer le contenu avant soumission
export async function moderateContent(text: string): Promise<ModerationResult> {
  const service = await importCommunityService();
  return service.moderateContent(text);
}

// Fonction pour télécharger une image
export async function uploadImage(file: File): Promise<string> {
  const service = await importCommunityService();
  return service.uploadImage(file);
}

// Exporter les constantes
export const getBasePath = async () => {
  const service = await importCommunityService();
  return service.getBasePath();
};

// Exporter les URLs de base
export const BASE_URL = async () => {
  const service = await importCommunityService();
  return service.BASE_URL;
};

export const IMAGES_BASE_URL = async () => {
  const service = await importCommunityService();
  return service.IMAGES_BASE_URL;
};

export const API_URL = async () => {
  const service = await importCommunityService();
  return service.API_URL;
};

export const WORKER_URL = async () => {
  const service = await importCommunityService();
  return service.WORKER_URL;
};
