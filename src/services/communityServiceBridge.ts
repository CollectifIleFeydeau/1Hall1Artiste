/**
 * Service pour la gestion des contributions communautaires
 * Ce service implémente directement les fonctionnalités sans dépendance externe
 */

// Importer les types nécessaires
import { CommunityEntry, SubmissionParams, ModerationResult, ModerationStatus } from "../types/communityTypes";

// URL du Worker Cloudflare qui sert de proxy pour les requêtes POST à l'API GitHub
const WORKER_URL = 'https://github-contribution-proxy.collectifilefeydeau.workers.dev';

// Fonction utilitaire pour obtenir le chemin de base en fonction de l'environnement
const getBasePathInternal = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return '/1Hall1Artiste'; // Chemin de base sur GitHub Pages
  }
  return ''; // Chemin de base en local
};

// URL de base pour les données JSON (à adapter selon l'environnement)
const BASE_URL_INTERNAL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? 'https://raw.githubusercontent.com/CollectifIleFeydeau/community-content/main'
  : '/data';

// URL de base pour les images (à adapter selon l'environnement)
const IMAGES_BASE_URL_INTERNAL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? `https://collectifilefeydeau.github.io${getBasePathInternal()}/images`
  : '/images';

// URL de base pour l'API GitHub (pour les requêtes GET publiques)
const API_URL_INTERNAL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? 'https://api.github.com/repos/CollectifIleFeydeau/community-content'
  : typeof process !== 'undefined' && process.env.VITE_USE_API === 'true'
    ? 'https://api.github.com/repos/CollectifIleFeydeau/community-content'
    : '/api';

// Clés pour le stockage local
const COMMUNITY_ENTRIES_KEY = 'community_entries';
const COMMUNITY_LIKES_KEY = 'community_liked_entries'; // Clé pour stocker les likes

// Fonctions utilitaires pour la gestion du stockage local
const getStoredEntries = (): CommunityEntry[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    
    const storedEntries = localStorage.getItem(COMMUNITY_ENTRIES_KEY);
    const entries = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Ajouter l'information des likes pour l'utilisateur actuel
    const likedEntries = getLikedEntries();
    return entries.map(entry => ({
      ...entry,
      isLikedByCurrentUser: likedEntries.includes(entry.id)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées locales:', error);
    return [];
  }
};

const saveEntries = (entries: CommunityEntry[]): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    
    // Retirer la propriété isLikedByCurrentUser avant de sauvegarder
    const entriesToSave = entries.map(({ isLikedByCurrentUser, ...rest }) => rest);
    localStorage.setItem(COMMUNITY_ENTRIES_KEY, JSON.stringify(entriesToSave));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des entrées locales:', error);
  }
};

const getLikedEntries = (): string[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    
    const likedEntries = localStorage.getItem(COMMUNITY_LIKES_KEY);
    return likedEntries ? JSON.parse(likedEntries) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return [];
  }
};

const saveLikedEntries = (entryIds: string[]): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem(COMMUNITY_LIKES_KEY, JSON.stringify(entryIds));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des likes:', error);
  }
};

// Exporter les fonctions du service communautaire avec les types TypeScript appropriés
export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  try {
    const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const useAPI = (typeof process !== 'undefined' && process.env.VITE_USE_API === 'true');
    const isProduction = (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
    
    console.log(`[CommunityService] Environment check:`, {
      isGitHubPages,
      useAPI,
      isProduction,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'undefined',
      BASE_URL_INTERNAL
    });
    
    // En production, sur GitHub Pages, ou si l'API est explicitement activée
    if (isGitHubPages || isProduction || useAPI) {
      
      console.log(`[CommunityService] Récupération des entrées depuis l'API GitHub`);
      console.log(`[CommunityService] URL complète: ${BASE_URL_INTERNAL}/entries.json`);
      
      // Récupérer les données depuis le fichier JSON sur GitHub
      const response = await fetch(`${BASE_URL_INTERNAL}/entries.json`);
      
      if (!response.ok) {
        console.warn(`[CommunityService] Erreur HTTP ${response.status}, utilisation des données locales`);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Le fichier peut contenir un objet avec une propriété 'entries' ou être un tableau direct
      const entries = Array.isArray(data) ? data : (data.entries || []);
      
      console.log(`[CommunityService] ${entries.length} entrées récupérées depuis GitHub`);
      console.log(`[CommunityService] Dernière mise à jour:`, data.lastUpdated || 'Non disponible');
      
      // Sauvegarder les entrées dans le stockage local pour utilisation hors ligne
      saveEntries(entries);
      
      // Ajouter l'information des likes pour l'utilisateur actuel
      const likedEntries = getLikedEntries();
      return entries.map(entry => ({
        ...entry,
        isLikedByCurrentUser: likedEntries.includes(entry.id)
      }));
    }
    
    // En développement local, utiliser les données stockées localement
    console.log(`[CommunityService] Mode développement local: utilisation des données locales`);
    return getStoredEntries();
  } catch (error) {
    console.error('Erreur lors de la récupération des entrées:', error);
    
    // En cas d'erreur, utiliser les données stockées localement
    console.log(`[CommunityService] Erreur, utilisation des données locales de secours`);
    return getStoredEntries();
  }
}

export async function deleteCommunityEntry(entryId: string): Promise<boolean> {
  try {
    // Supprimer l'entrée du stockage local
    const entries = getStoredEntries();
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    saveEntries(updatedEntries);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entrée:', error);
    return false;
  }
}

export async function toggleLike(entryId: string, sessionId: string): Promise<CommunityEntry> {
  try {
    console.log(`[CommunityService] Tentative de like/unlike pour l'entrée ${entryId}`);
    
    // Récupérer les entrées locales
    const entries = getStoredEntries();
    const likedEntries = getLikedEntries();
    
    // Trouver l'entrée à mettre à jour
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) {
      throw new Error(`Entrée non trouvée: ${entryId}`);
    }
    
    const entry = entries[entryIndex];
    
    // Vérifier si l'utilisateur a déjà aimé cette entrée
    const hasLiked = likedEntries.includes(entryId);
    const action = hasLiked ? 'unlike' : 'like';
    
    console.log(`[CommunityService] Action: ${action} pour l'entrée ${entryId}`);
    
    // Tenter de synchroniser avec le serveur
    try {
      // Extraire le numéro d'issue de l'ID de l'entrée
      const issueMatch = entryId.match(/issue-(\d+)/);
      if (!issueMatch) {
        throw new Error(`Format d'ID invalide: ${entryId}`);
      }
      const issueNumber = parseInt(issueMatch[1]);
      
      const response = await fetch(`${WORKER_URL}/like-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueNumber: issueNumber,
          sessionId: sessionId,
          action: action
        })
      });
      
      if (response.ok) {
        const serverData = await response.json();
        console.log(`[CommunityService] Réponse du serveur:`, serverData);
        
        // Mettre à jour l'entrée avec les données du serveur
        const updatedEntry = {
          ...entry,
          likes: serverData.likes || (hasLiked ? Math.max(0, entry.likes - 1) : entry.likes + 1),
          likedBy: serverData.likedBy || [],
          isLikedByCurrentUser: !hasLiked
        };
        
        // Mettre à jour la liste des entrées
        entries[entryIndex] = updatedEntry;
        saveEntries(entries);
        
        // Mettre à jour la liste des likes locaux
        if (hasLiked) {
          saveLikedEntries(likedEntries.filter(id => id !== entryId));
        } else {
          saveLikedEntries([...likedEntries, entryId]);
        }
        
        console.log(`[CommunityService] Like synchronisé avec succès`);
        return updatedEntry;
      } else {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
    } catch (serverError) {
      console.warn(`[CommunityService] Impossible de synchroniser avec le serveur, mise à jour locale uniquement:`, serverError);
      
      // Fallback: mise à jour locale uniquement
      const updatedEntry = {
        ...entry,
        likes: hasLiked ? Math.max(0, entry.likes - 1) : entry.likes + 1,
        isLikedByCurrentUser: !hasLiked
      };
      
      // Mettre à jour la liste des entrées
      entries[entryIndex] = updatedEntry;
      saveEntries(entries);
      
      // Mettre à jour la liste des likes
      if (hasLiked) {
        saveLikedEntries(likedEntries.filter(id => id !== entryId));
      } else {
        saveLikedEntries([...likedEntries, entryId]);
      }
      
      return updatedEntry;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du like:', error);
    throw error;
  }
}

// Fonction pour soumettre une nouvelle contribution
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  try {
    // Générer un ID unique pour la nouvelle entrée
    const id = `entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Créer la nouvelle entrée
    const newEntry: CommunityEntry = {
      id,
      type: params.type,
      displayName: params.displayName || 'Anonyme',
      content: params.content,
      imageUrl: params.image ? URL.createObjectURL(params.image) : undefined,
      description: params.description,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      isLikedByCurrentUser: false,
      moderation: {
        status: 'approved' as ModerationStatus,
        moderatedAt: new Date().toISOString()
      }
    };
    
    // Récupérer les entrées existantes et ajouter la nouvelle
    const entries = getStoredEntries();
    const updatedEntries = [newEntry, ...entries];
    saveEntries(updatedEntries);
    
    return newEntry;
  } catch (error) {
    console.error('Erreur lors de la soumission de la contribution:', error);
    throw error;
  }
}

// Fonction pour modérer le contenu avant soumission
export async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    // Générer un ID temporaire pour l'entrée en cours de modération
    const tempEntryId = `temp_${Date.now()}`;
    
    // En mode développement, simuler une modération réussie
    return {
      entryId: tempEntryId,
      status: 'approved' as ModerationStatus,
      message: 'Contenu approuvé automatiquement en mode développement'
    };
  } catch (error) {
    console.error('Erreur lors de la modération du contenu:', error);
    throw error;
  }
}

// Fonction pour télécharger une image
export async function uploadImage(file: File): Promise<string> {
  try {
    // En mode développement, simuler un téléchargement réussi avec une URL locale
    const localUrl = URL.createObjectURL(file);
    return localUrl;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    throw error;
  }
}

// Exporter les constantes
export const getBasePath = (): string => {
  return getBasePathInternal();
};

// Exporter les URLs de base
export const BASE_URL = BASE_URL_INTERNAL;
export const IMAGES_BASE_URL = IMAGES_BASE_URL_INTERNAL;
export const API_URL = API_URL_INTERNAL;
