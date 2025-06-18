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
const STORAGE_KEYS = {
  ENTRIES: 'community_entries',
  LIKED_ENTRIES: 'liked_entries'
};

const SESSION_ID_KEY = 'user_session_id';

// Fonction pour obtenir ou créer un identifiant de session utilisateur
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Fonctions utilitaires pour la gestion du stockage local
const getStoredEntries = (): CommunityEntry[] => {
  try {
    if (typeof localStorage === 'undefined') {
      console.log('[CommunityService] localStorage non disponible, retour tableau vide');
      return [];
    }
    
    console.log('[CommunityService] Récupération des entrées depuis localStorage...');
    const storedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    console.log('[CommunityService] Données brutes localStorage:', storedEntries ? `${storedEntries.length} caractères` : 'null');
    
    const entries = storedEntries ? JSON.parse(storedEntries) : [];
    console.log('[CommunityService] Entrées parsées:', entries.length, 'entrées');
    
    // Ajouter l'information des likes pour l'utilisateur actuel
    const likedEntries = getLikedEntries();
    console.log('[CommunityService] Likes utilisateur actuel:', likedEntries.length, 'entrées likées');
    
    const entriesWithLikes = entries.map((entry: CommunityEntry) => ({
      ...entry,
      isLikedByCurrentUser: likedEntries.includes(entry.id)
    }));
    
    console.log('[CommunityService] Entrées avec informations de likes préparées');
    return entriesWithLikes;
  } catch (error) {
    console.error('[CommunityService] Erreur lors de la récupération des entrées:', error);
    return [];
  }
};

const saveEntries = (entries: CommunityEntry[]): void => {
  try {
    if (typeof localStorage === 'undefined') {
      console.warn('[CommunityService] localStorage non disponible, impossible de sauvegarder');
      return;
    }
    
    console.log('[CommunityService] Sauvegarde de', entries.length, 'entrées...');
    
    // Retirer la propriété isLikedByCurrentUser avant de sauvegarder
    const entriesToSave = entries.map(({ isLikedByCurrentUser, ...rest }) => rest);
    console.log('[CommunityService] Propriétés isLikedByCurrentUser supprimées pour la sauvegarde');
    
    const dataToSave = JSON.stringify(entriesToSave);
    console.log('[CommunityService] Taille des données à sauvegarder:', dataToSave.length, 'caractères');
    
    localStorage.setItem(STORAGE_KEYS.ENTRIES, dataToSave);
    console.log('[CommunityService] Entrées sauvegardées avec succès dans localStorage');
  } catch (error) {
    console.error('[CommunityService] Erreur lors de la sauvegarde des entrées locales:', error);
  }
};

const getLikedEntries = (): string[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    
    const likedEntries = localStorage.getItem(STORAGE_KEYS.LIKED_ENTRIES);
    return likedEntries ? JSON.parse(likedEntries) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return [];
  }
};

const saveLikedEntries = (entryIds: string[]): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.LIKED_ENTRIES, JSON.stringify(entryIds));
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
      
      // Récupérer les likes actuels pour chaque entrée depuis le serveur
      const entriesWithLikes = await Promise.all(entries.map(async (entry) => {
        try {
          // Extraire le numéro d'issue depuis l'ID
          const issueMatch = entry.id.match(/issue-(\d+)/);
          if (!issueMatch) {
            console.warn(`[CommunityService] ID d'entrée invalide: ${entry.id}`);
            return {
              ...entry,
              likes: entry.likes || 0,
              isLikedByCurrentUser: getLikedEntries().includes(entry.id)
            };
          }
          
          const issueNumber = parseInt(issueMatch[1]);
          
          // Récupérer les likes depuis le serveur
          const response = await fetch(`${WORKER_URL}/like-issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              issueNumber, 
              sessionId: getSessionId(), 
              action: 'get' 
            })
          });
          
          if (response.ok) {
            const likeData = await response.json();
            return {
              ...entry,
              likes: likeData.likes || 0,
              isLikedByCurrentUser: likeData.isLikedByCurrentUser || false
            };
          } else {
            // En cas d'erreur, utiliser les données locales
            return {
              ...entry,
              likes: entry.likes || 0,
              isLikedByCurrentUser: getLikedEntries().includes(entry.id)
            };
          }
        } catch (error) {
          console.warn(`[CommunityService] Erreur lors de la récupération des likes pour ${entry.id}:`, error);
          // En cas d'erreur, utiliser les données locales
          return {
            ...entry,
            likes: entry.likes || 0,
            isLikedByCurrentUser: getLikedEntries().includes(entry.id)
          };
        }
      }));
      
      console.log(`[CommunityService] Likes synchronisés pour ${entriesWithLikes.length} entrées`);
      return entriesWithLikes;
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
  console.log('[CommunityService] === DÉBUT DE SUBMIT CONTRIBUTION ===');
  console.log('[CommunityService] Paramètres reçus:', {
    type: params.type,
    displayName: params.displayName,
    content: params.content,
    description: params.description,
    hasImage: !!params.image,
    imageInfo: params.image ? {
      name: params.image.name,
      size: params.image.size,
      type: params.image.type
    } : null,
    eventId: params.eventId,
    locationId: params.locationId
  });

  try {
    // Générer un ID unique pour la nouvelle entrée
    const id = `entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log('[CommunityService] ID généré pour la nouvelle entrée:', id);
    
    // Traitement de l'image si présente
    let imageUrl: string | undefined;
    if (params.image) {
      console.log('[CommunityService] Traitement de l\'image...');
      try {
        imageUrl = URL.createObjectURL(params.image);
        console.log('[CommunityService] URL temporaire créée pour l\'image:', imageUrl);
      } catch (imageError) {
        console.error('[CommunityService] Erreur lors de la création de l\'URL image:', imageError);
      }
    } else {
      console.log('[CommunityService] Aucune image à traiter');
    }

    // Créer la nouvelle entrée
    const newEntry: CommunityEntry = {
      id,
      type: params.type,
      displayName: params.displayName || 'Anonyme',
      content: params.content,
      imageUrl: imageUrl,
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
    
    console.log('[CommunityService] Nouvelle entrée créée:', {
      id: newEntry.id,
      type: newEntry.type,
      displayName: newEntry.displayName,
      hasContent: !!newEntry.content,
      hasImage: !!newEntry.imageUrl,
      hasDescription: !!newEntry.description,
      likes: newEntry.likes,
      moderationStatus: newEntry.moderation?.status
    });

    // Récupérer les entrées existantes et ajouter la nouvelle
    console.log('[CommunityService] Récupération des entrées existantes...');
    const entries = getStoredEntries();
    console.log('[CommunityService] Nombre d\'entrées existantes:', entries.length);
    
    const updatedEntries = [newEntry, ...entries];
    console.log('[CommunityService] Nouvelle liste après ajout:', updatedEntries.length, 'entrées');
    
    console.log('[CommunityService] Sauvegarde des entrées...');
    saveEntries(updatedEntries);
    console.log('[CommunityService] Entrées sauvegardées avec succès');

    // Tenter de sauvegarder la contribution sur GitHub via le Worker
    try {
      console.log('[CommunityService] Tentative de sauvegarde sur GitHub...');
      
      const response = await fetch(`${WORKER_URL}/create-contribution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry: {
            id: newEntry.id,
            type: newEntry.type,
            displayName: newEntry.displayName,
            content: newEntry.content,
            description: newEntry.description,
            createdAt: newEntry.createdAt,
            timestamp: newEntry.timestamp,
            likes: newEntry.likes,
            moderation: newEntry.moderation
          },
          sessionId: getSessionId()
        })
      });
      
      if (response.ok) {
        const serverData = await response.json();
        console.log('[CommunityService] Contribution sauvegardée sur GitHub avec succès:', serverData);
        
        // Mettre à jour l'ID de l'entrée avec celui du serveur si fourni
        if (serverData.id && serverData.id !== newEntry.id) {
          newEntry.id = serverData.id;
          updatedEntries[0] = newEntry; // Mettre à jour la première entrée (la nouvelle)
          saveEntries(updatedEntries);
          console.log('[CommunityService] ID de l\'entrée mis à jour:', serverData.id);
        }
      } else {
        const errorText = await response.text();
        console.warn('[CommunityService] Erreur serveur lors de la sauvegarde GitHub:', response.status, errorText);
        console.warn('[CommunityService] La contribution reste sauvegardée localement');
      }
    } catch (serverError) {
      console.warn('[CommunityService] Impossible de sauvegarder sur GitHub, contribution sauvegardée localement uniquement:', serverError);
    }

    console.log('[CommunityService] === SUBMIT CONTRIBUTION TERMINÉ AVEC SUCCÈS ===');
    return newEntry;
  } catch (error) {
    console.error('[CommunityService] === ERREUR LORS DU SUBMIT CONTRIBUTION ===');
    console.error('[CommunityService] Erreur détaillée:', error);
    console.error('[CommunityService] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('[CommunityService] Paramètres qui ont causé l\'erreur:', params);
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
