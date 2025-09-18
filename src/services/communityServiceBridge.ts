/**
 * Service pour la gestion des contributions communautaires
 * Ce service implémente directement les fonctionnalités sans dépendance externe
 */

// Importer les types nécessaires
import { CommunityEntry, SubmissionParams, ModerationResult, ModerationStatus } from "../types/communityTypes";

// Configuration Cloudinary pur - RÉVOLUTION !
const CLOUDINARY_CLOUD_NAME = 'dpatqkgsc';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

// URL du Worker Cloudflare qui sert de proxy pour les requêtes POST à l'API GitHub
const WORKER_URL = 'https://github-contribution-proxy.collectifilefeydeau.workers.dev';

/**
 * RÉVOLUTION : Récupère les photos directement depuis Cloudinary
 */
async function fetchFromCloudinary(): Promise<CommunityEntry[]> {
  try {
    console.log('[CommunityService] 🚀 RÉVOLUTION : Récupération depuis Cloudinary pur !');
    
    // Utiliser l'API Cloudinary Search pour récupérer toutes les photos communautaires
    const searchUrl = `${CLOUDINARY_API_URL}/resources/search`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: 'folder:collectif_photos',
        with_field: ['context', 'created_at'],
        sort_by: [['created_at', 'desc']],
        max_results: 100
      })
    });

    if (!response.ok) {
      console.log('[CommunityService] Cloudinary API non disponible, fallback sur localStorage');
      return getStoredEntries();
    }

    const data = await response.json();
    console.log(`[CommunityService] ✅ ${data.resources?.length || 0} photos récupérées depuis Cloudinary`);

    // Convertir les ressources Cloudinary en CommunityEntry
    const entries: CommunityEntry[] = (data.resources || []).map((resource: any) => {
      const context = resource.context || {};
      return {
        id: resource.public_id,
        type: 'photo',
        displayName: context.displayName || 'Anonyme',
        content: context.content || '',
        imageUrl: resource.secure_url,
        thumbnailUrl: resource.secure_url,
        description: context.description || '',
        createdAt: resource.created_at,
        timestamp: resource.created_at,
        moderation: {
          status: (context.moderation_status || 'approved') as ModerationStatus,
          moderatedAt: context.moderated_at || resource.created_at
        }
      };
    });

    // Sauvegarder dans localStorage pour le cache
    saveEntries(entries);
    
    return entries;
    
  } catch (error) {
    console.error('[CommunityService] Erreur Cloudinary:', error);
    console.log('[CommunityService] Fallback sur localStorage');
    return getStoredEntries();
  }
}

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
  ENTRIES: 'community_entries'
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
    
    console.log('[CommunityService] Entrées préparées');
    return entries;
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
    
    const dataToSave = JSON.stringify(entries);
    console.log('[CommunityService] Taille des données à sauvegarder:', dataToSave.length, 'caractères');
    
    localStorage.setItem(STORAGE_KEYS.ENTRIES, dataToSave);
    console.log('[CommunityService] Entrées sauvegardées avec succès dans localStorage');
  } catch (error) {
    console.error('[CommunityService] Erreur lors de la sauvegarde des entrées:', error);
  }
};

// Exporter les fonctions du service communautaire avec les types TypeScript appropriés
// Fonction pour nettoyer les contributions temporaires après synchronisation
function cleanupTemporaryContributions(localEntries: CommunityEntry[], serverEntries: CommunityEntry[]): CommunityEntry[] {
  const serverIds = new Set(serverEntries.map(entry => entry.id));
  
  return localEntries.map(entry => {
    // Si une contribution temporaire existe maintenant sur le serveur, la marquer comme synchronisée
    if (entry.isTemporary && serverIds.has(entry.id)) {
      console.log(`[CommunityService] Contribution ${entry.id} synchronisée, suppression du flag temporaire`);
      const { isTemporary, ...cleanEntry } = entry;
      return {
        ...cleanEntry,
        moderation: { status: 'approved' as ModerationStatus, moderatedAt: new Date().toISOString() }
      };
    }
    return entry;
  });
}

/**
 * RÉVOLUTION : Récupère les photos directement depuis Cloudinary !
 */
export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  try {
    console.log('[CommunityService] 🚀 RÉVOLUTION : Cloudinary pur activé !');
    
    // Nouveau système : Cloudinary pur !
    return await fetchFromCloudinary();
    
  } catch (error) {
    console.error('[CommunityService] Erreur système Cloudinary:', error);
    console.log('[CommunityService] Fallback sur localStorage');
    return getStoredEntries();
  }
}

export async function deleteCommunityEntry(entryId: string): Promise<void> {
  console.log(`[CommunityService] Suppression de l'entrée ${entryId}`);
  
  // Extraire le numéro d'issue depuis l'ID (format: "issue-123" ou "contrib-123")
  const issueMatch = entryId.match(/(?:issue-|contrib-)(\d+)/);
  
  if (issueMatch) {
    const issueNumber = issueMatch[1];
    console.log(`[CommunityService] Fermeture de l'issue GitHub #${issueNumber}`);
    
    try {
      // Appeler le Worker Cloudflare pour fermer l'issue GitHub
      const response = await fetch(`${WORKER_URL}/delete-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueNumber: issueNumber
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CommunityService] Erreur lors de la fermeture de l'issue #${issueNumber}:`, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      console.log(`[CommunityService] Issue GitHub #${issueNumber} fermée avec succès`);
      console.log(`[CommunityService] Le workflow de synchronisation va se déclencher automatiquement`);
      
    } catch (error) {
      console.error(`[CommunityService] Erreur lors de la fermeture de l'issue GitHub:`, error);
      // En cas d'erreur, on continue avec la suppression locale comme fallback
      console.log(`[CommunityService] Fallback: suppression locale uniquement`);
    }
  } else {
    console.warn(`[CommunityService] ID d'entrée non reconnu: ${entryId} (format attendu: issue-123 ou contrib-123)`);
    console.log(`[CommunityService] Suppression locale uniquement`);
  }
  
  // Marquer l'entrée comme supprimée localement (pour feedback immédiat à l'utilisateur)
  const entries = getStoredEntries();
  const updatedEntries = entries.map(entry => 
    entry.id === entryId 
      ? { ...entry, moderation: { status: 'rejected' as const, moderatedAt: new Date().toISOString() } }
      : entry
  );
  
  saveEntries(updatedEntries);
  console.log(`[CommunityService] Entrée ${entryId} marquée comme supprimée localement`);
}

export async function restoreCommunityEntry(entryId: string): Promise<void> {
  console.log(`[CommunityService] Restauration de l'entrée ${entryId}`);
  
  // Marquer l'entrée comme en attente de modération
  const entries = getStoredEntries();
  const updatedEntries = entries.map(entry => 
    entry.id === entryId 
      ? { ...entry, moderation: { status: 'pending' as const, moderatedAt: null } }
      : entry
  );
  
  saveEntries(updatedEntries);
  console.log(`[CommunityService] Entrée ${entryId} restaurée et marquée comme en attente`);
}

// Fonction pour soumettre une nouvelle contribution
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  console.log('[CommunityService] === DÉBUT DE SUBMIT CONTRIBUTION ===');
  console.log('[CommunityService] Paramètres reçus:', {
    type: params.type,
    displayName: params.displayName,
    content: params.content,
    description: params.description,
    hasImage: !!params.cloudinaryUrl,
    imageInfo: params.cloudinaryUrl ? {
      url: params.cloudinaryUrl
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
    if (params.cloudinaryUrl || params.imageUrl) {
      const finalImageUrl = params.cloudinaryUrl || params.imageUrl;
      console.log('[CommunityService] URL Cloudinary disponible:', finalImageUrl);
      imageUrl = finalImageUrl;
    } else {
      console.log('[CommunityService] Aucune URL Cloudinary fournie');
    }

    // Créer la nouvelle entrée avec statut "pending" pour preview temporaire
    const newEntry: CommunityEntry = {
      id,
      type: params.type,
      displayName: params.displayName?.trim() || 'Anonyme',
      content: params.content?.trim() || '',
      imageUrl: imageUrl,
      thumbnailUrl: imageUrl, // Utiliser la même URL pour le thumbnail
      description: params.description?.trim() || '',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      moderation: {
        status: 'pending' as ModerationStatus, // Statut temporaire pour preview
        moderatedAt: null
      },
      // Marquer comme contribution temporaire
      isTemporary: true
    };
    
    console.log('[CommunityService] Nouvelle entrée créée:', {
      id: newEntry.id,
      type: newEntry.type,
      displayName: newEntry.displayName,
      hasContent: !!newEntry.content,
      hasImage: !!newEntry.imageUrl,
      hasDescription: !!newEntry.description,
      moderationStatus: newEntry.moderation?.status
    });

    // Récupérer les entrées existantes et ajouter la nouvelle
    console.log('[CommunityService] Récupération des entrées existantes...');
    const entries = getStoredEntries();
    console.log('[CommunityService] Nombre d\'entrées existantes:', entries.length);
    
    // Vérifier si cette entrée existe déjà pour éviter les doublons
    const existingEntry = entries.find(entry => entry.id === newEntry.id);
    if (existingEntry) {
      console.log('[CommunityService] Entrée déjà existante, mise à jour:', newEntry.id);
      const updatedEntries = entries.map(entry => 
        entry.id === newEntry.id ? newEntry : entry
      );
      console.log('[CommunityService] Liste mise à jour:', updatedEntries.length, 'entrées');
      saveEntries(updatedEntries);
      return newEntry;
    }
    
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
            imageUrl: newEntry.imageUrl,
            createdAt: newEntry.createdAt,
            timestamp: newEntry.timestamp,
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
