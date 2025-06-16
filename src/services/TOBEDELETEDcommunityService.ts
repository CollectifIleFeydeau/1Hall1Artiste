import { CommunityEntry, CommunityContentData, SubmissionParams, ModerationResult, ModerationStatus, EntryType } from "../types/communityTypes";
import { AnonymousSessionService } from "./anonymousSessionService";

// URL de base pour les données JSON (à adapter selon l'environnement)
const BASE_URL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? 'https://raw.githubusercontent.com/CollectifIleFeydeau/community-content/main'
  : '/data';

// Fonction utilitaire pour obtenir le chemin de base en fonction de l'environnement
const getBasePath = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return '/1Hall1Artiste'; // Chemin de base sur GitHub Pages
  }
  return ''; // Chemin de base en local
};

// URL de base pour les images (à adapter selon l'environnement)
const IMAGES_BASE_URL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? `https://collectifilefeydeau.github.io${getBasePath()}/images`
  : '/images';

// URL de base pour l'API GitHub (pour les requêtes GET publiques)
const API_URL = (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  ? 'https://api.github.com/repos/CollectifIleFeydeau/community-content'
  : import.meta.env.VITE_USE_API === 'true'
    ? 'https://api.github.com/repos/CollectifIleFeydeau/community-content'
    : '/api';

// URL du Worker Cloudflare qui sert de proxy pour les requêtes POST à l'API GitHub
const WORKER_URL = 'https://github-contribution-proxy.collectifilefeydeau.workers.dev';

// Clés pour le stockage local
const COMMUNITY_ENTRIES_KEY = 'community_entries';
const COMMUNITY_LIKES_KEY = 'community_liked_entries'; // Clé pour stocker les likes
const SESSION_ID_KEY = 'anonymous_session_id'; // Clé pour stocker l'ID de session anonyme

// Récupérer ou générer un ID de session anonyme
const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Récupérer les entrées stockées localement ou renvoyer un tableau vide
const getStoredEntries = (): CommunityEntry[] => {
  try {
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

// Sauvegarder les entrées dans le stockage local
const saveEntries = (entries: CommunityEntry[]): void => {
  try {
    // Retirer la propriété isLikedByCurrentUser avant de sauvegarder
    const entriesToSave = entries.map(({ isLikedByCurrentUser, ...rest }) => rest);
    localStorage.setItem(COMMUNITY_ENTRIES_KEY, JSON.stringify(entriesToSave));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des entrées locales:', error);
  }
};

// Récupérer les IDs des entrées aimées par l'utilisateur
const getLikedEntries = (): string[] => {
  try {
    const likedEntries = localStorage.getItem(COMMUNITY_LIKES_KEY);
    return likedEntries ? JSON.parse(likedEntries) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return [];
  }
};

// Sauvegarder les IDs des entrées aimées par l'utilisateur
const saveLikedEntries = (entryIds: string[]): void => {
  try {
    localStorage.setItem(COMMUNITY_LIKES_KEY, JSON.stringify(entryIds));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des likes:', error);
  }
};

/**
 * Récupère les entrées communautaires depuis le serveur ou le stockage local
 */
export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  try {
    // En production ou si l'API est activée, récupérer les données depuis l'API GitHub
    if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
        process.env.NODE_ENV !== 'development' || 
        import.meta.env.VITE_USE_API === 'true') {
      
      // Récupérer les likes de l'utilisateur actuel
      const likedEntries = getLikedEntries();
      
      // 1. Récupérer les entrées du fichier JSON
      let entriesFromJson: CommunityEntry[] = [];
      try {
        console.log('[CommunityService] Récupération du fichier entries.json...');
        const jsonResponse = await fetch(`${BASE_URL}/entries.json`);
        if (jsonResponse.ok) {
          const data = await jsonResponse.json();
          entriesFromJson = data.entries || [];
          console.log(`[CommunityService] ${entriesFromJson.length} entrées récupérées depuis entries.json`);
        } else {
          console.warn(`[CommunityService] Impossible de récupérer entries.json: ${jsonResponse.status}`);
        }
      } catch (error) {
        console.error('[CommunityService] Erreur lors de la récupération de entries.json:', error);
      }
      
      // 2. Récupérer les issues GitHub récentes (contributions)
      let entriesFromIssues: CommunityEntry[] = [];
      try {
        console.log('[CommunityService] Récupération des issues GitHub...');
        
        // Récupérer les issues ouvertes
        const issuesUrl = 'https://api.github.com/repos/CollectifIleFeydeau/community-content/issues?state=open';
        console.log(`[CommunityService] URL de l'API GitHub: ${issuesUrl}`);
        
        const issuesResponse = await fetch(issuesUrl);
        console.log(`[CommunityService] Statut de la réponse: ${issuesResponse.status}`);
        
        if (issuesResponse.ok) {
          const issues = await issuesResponse.json();
          console.log(`[CommunityService] ${issues.length} issues récupérées depuis GitHub`);
          
          // Convertir les issues en entrées communautaires
          for (const issue of issues) {
            try {
              // Vérifier si c'est une issue de contribution (avec label photo ou testimonial)
              const isPhoto = issue.labels && issue.labels.some((label: any) => label.name === 'photo');
              const isTestimonial = issue.labels && issue.labels.some((label: any) => label.name === 'testimonial');
              
              if (!isPhoto && !isTestimonial) {
                console.log(`[CommunityService] Issue #${issue.number} ignorée (pas de label photo/testimonial)`);
                continue;
              }
              
              // Extraire les données de l'issue
              const body = issue.body || '';
              
              // Déterminer le type en fonction des labels et du contenu
              const typeMatch = body.match(/\*\*Type:\*\*\s*([^\n]+)/);
              const entryType: EntryType = (isTestimonial || (typeMatch && typeMatch[1].trim().toLowerCase() === 'témoignage')) 
                ? 'testimonial' 
                : 'photo';
              
              // Extraire le nom d'affichage
              const nameMatch = body.match(/\*\*Nom:\*\*\s*([^\n]+)/);
              const displayName = nameMatch ? nameMatch[1].trim() : 'Contributeur anonyme';
              
              // Extraire la description
              const descriptionMatch = body.match(/\*\*Description:\*\*\s*([^\n]+)/);
              const description = descriptionMatch ? descriptionMatch[1].trim() : '';
              
              // Extraire l'URL de l'image (pour les photos)
              const imageUrlMatch = body.match(/!\[.*?\]\((.*?)\)/);
              const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : undefined;
              
              // Extraire le témoignage (pour les témoignages)
              const testimonyMatch = body.match(/\*\*Témoignage:\*\*\s*([\s\S]+?)(?=\*\*|$)/);
              const testimony = testimonyMatch ? testimonyMatch[1].trim() : undefined;
              
              // Extraire les informations de likes
              const likesMatch = body.match(/\*\*Likes:\*\*\s*(\d+)/);
              const likes = likesMatch ? parseInt(likesMatch[1], 10) : 0;
              
              // Extraire la liste des utilisateurs qui ont liké
              const likedByMatch = body.match(/\*\*LikedBy:\*\*\s*(.+)/);
              const likedBy = likedByMatch ? likedByMatch[1].split(',').map(id => id.trim()) : [];
              
              // Vérifier si l'utilisateur actuel a liké cette entrée
              const sessionId = getSessionId();
              const isLikedByCurrentUser = likedBy.includes(sessionId);
              
              // Créer l'entrée de base
              const entry: CommunityEntry = {
                id: `issue-${issue.number}`,
                type: entryType,
                displayName,
                createdAt: issue.created_at,
                likes,
                likedBy,
                isLikedByCurrentUser,
                moderation: {
                  status: issue.state === 'open' ? 'approved' : 'rejected',
                  moderatedAt: issue.updated_at
                }
              };
              
              // Ajouter les champs spécifiques au type
              if (entryType === 'photo' && imageUrl) {
                entry.imageUrl = imageUrl;
                entry.thumbnailUrl = imageUrl; // Utiliser la même image comme miniature pour l'instant
                entry.description = description;
              } else if (entryType === 'testimonial' && testimony) {
                entry.content = testimony;
              }
              
              entriesFromIssues.push(entry);
              console.log(`[CommunityService] Issue #${issue.number} convertie en entrée communautaire`);
            } catch (error) {
              console.error(`[CommunityService] Erreur lors du traitement de l'issue #${issue.number}:`, error);
            }
          }
        } else {
          console.warn(`[CommunityService] Impossible de récupérer les issues: ${issuesResponse.status}`);
        }
      } catch (error) {
        console.error('[CommunityService] Erreur lors de la récupération des issues:', error);
      }
      
      // 3. Fusionner les deux sources de données (en évitant les doublons)
      // Si nous avons des données du serveur (entries.json ou issues), nous les utilisons en priorité
      // et ignorons les données locales pour éviter que des contributions supprimées ne réapparaissent
      let allEntries = [];
      
      // Si nous avons des données du serveur, nous les utilisons
      if (entriesFromJson.length > 0 || entriesFromIssues.length > 0) {
        allEntries = [...entriesFromJson];
        
        // Ajouter les entrées des issues qui ne sont pas déjà dans le JSON
        for (const issueEntry of entriesFromIssues) {
          // Vérifier si cette issue existe déjà dans les entrées JSON (par ID)
          const exists = allEntries.some(entry => entry.id === issueEntry.id);
          
          if (!exists) {
            allEntries.push(issueEntry);
          }
        }
        
        // Mettre à jour le stockage local avec les données du serveur
        saveEntries(allEntries);
      } else {
        // Si nous n'avons pas de données du serveur, utiliser les données locales
        console.log('[CommunityService] Aucune donnée du serveur, utilisation des données locales');
        allEntries = getStoredEntries();
      }
      
      console.log(`[CommunityService] Total de ${allEntries.length} entrées après fusion`);
      
      // Ajouter un flag pour indiquer si l'entrée est likée par l'utilisateur actuel
      return allEntries.map(entry => ({
        ...entry,
        isLikedByCurrentUser: likedEntries.includes(entry.id)
      }));
    }
    
    // En développement, récupérer les données depuis le localStorage
    const entriesString = localStorage.getItem(COMMUNITY_ENTRIES_KEY);
    const entries = entriesString ? JSON.parse(entriesString) : [];
    
    // Récupérer les likes de l'utilisateur actuel
    const likedEntries = getLikedEntries();
    
    // Ajouter un flag pour indiquer si l'entrée est likée par l'utilisateur actuel
    // et corriger les URLs des images si nécessaire
    return entries.map(entry => {
      // Corriger les URLs des images pour qu'elles soient absolues
      const processedEntry = { ...entry };
      
      if (processedEntry.imageUrl && !processedEntry.imageUrl.startsWith('data:') && !processedEntry.imageUrl.startsWith('http')) {
        processedEntry.imageUrl = window.location.origin + getBasePath() + (processedEntry.imageUrl.startsWith('/') ? '' : '/') + processedEntry.imageUrl;
      }
      
      if (processedEntry.thumbnailUrl && !processedEntry.thumbnailUrl.startsWith('data:') && !processedEntry.thumbnailUrl.startsWith('http')) {
        processedEntry.thumbnailUrl = window.location.origin + getBasePath() + (processedEntry.thumbnailUrl.startsWith('/') ? '' : '/') + processedEntry.thumbnailUrl;
      }
      
      return {
        ...processedEntry,
        isLikedByCurrentUser: likedEntries.includes(entry.id)
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contributions:', error);
    return [];
  }
}

/**
 * Supprime une contribution communautaire
 * @param entryId ID de la contribution à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteCommunityEntry(entryId: string): Promise<boolean> {
  try {
    console.log(`[CommunityService] Tentative de suppression de la contribution ${entryId}`);
    
    // Extraire le numéro d'issue si l'ID est au format "issue-X"
    let issueNumber = entryId;
    if (entryId.startsWith('issue-')) {
      issueNumber = entryId.replace('issue-', '');
    }
    
    console.log(`[CommunityService] Numéro d'issue extrait: ${issueNumber}`);
    
    // En production ou si l'API est activée, appeler l'API pour supprimer la contribution
    if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
        process.env.NODE_ENV !== 'development' || 
        import.meta.env.VITE_USE_API === 'true') {
      
      console.log(`[CommunityService] Utilisation du Worker Cloudflare pour supprimer l'issue GitHub`);
      
      // En production, utiliser le Worker Cloudflare comme proxy pour l'API GitHub
      const response = await fetch(`${WORKER_URL}/delete-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          issueNumber: issueNumber
        })
      });
      
      // Log de la réponse brute pour le débogage
      console.log(`[CommunityService] Réponse brute: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.error(`[CommunityService] Erreur HTTP lors de la suppression: ${response.status}`);
        let errorText = '';
        try {
          errorText = await response.text();
          console.error(`[CommunityService] Détail de l'erreur: ${errorText}`);
        } catch (textError) {
          console.error(`[CommunityService] Impossible de lire le corps de l'erreur:`, textError);
        }
        
        // Même en cas d'erreur, on supprime localement pour que l'UI soit cohérente
        removeEntryFromLocalStorage(entryId);
        return true; // On retourne true pour que l'UI se mette à jour
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log(`[CommunityService] Réponse de l'API: ${JSON.stringify(responseData)}`);
      } catch (jsonError) {
        console.warn(`[CommunityService] Impossible de parser la réponse JSON:`, jsonError);
      }
      
      // Supprimer également de localStorage pour une mise à jour immédiate de l'UI
      removeEntryFromLocalStorage(entryId);
      
      // Mettre à jour le fichier entries.json via une autre requête au Worker
      // Cette étape est optionnelle car le Worker pourrait le faire directement,
      // mais cela permet de s'assurer que les données sont synchronisées
      try {
        console.log(`[CommunityService] Mise à jour du cache local après suppression`);
        // Forcer un rechargement des entrées depuis GitHub pour mettre à jour le cache local
        await fetchCommunityEntries();
      } catch (syncError) {
        console.error(`[CommunityService] Erreur lors de la synchronisation après suppression:`, syncError);
        // On ignore cette erreur car la suppression a déjà réussi
      }
      
      return true;
    }
    
    // En développement, supprimer la contribution du localStorage
    console.log(`[CommunityService] Mode développement: suppression locale uniquement`);
    return removeEntryFromLocalStorage(entryId);
  } catch (error) {
    console.error(`[CommunityService] Erreur lors de la suppression de la contribution ${entryId}:`, error);
    // Même en cas d'erreur, on essaie de supprimer localement
    removeEntryFromLocalStorage(entryId);
    return true; // On retourne true pour que l'UI se mette à jour
  }
}

/**
 * Fonction utilitaire pour supprimer une entrée du localStorage
 * @param entryId ID de l'entrée à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
function removeEntryFromLocalStorage(entryId: string): boolean {
  try {
    const entriesString = localStorage.getItem(COMMUNITY_ENTRIES_KEY);
    if (!entriesString) return false;
    
    const entries = JSON.parse(entriesString);
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    
    // Supprimer également l'image associée si elle existe
    const imageKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('community_image_') && key.includes(entryId));
    
    imageKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[CommunityService] Image supprimée: ${key}`);
    });
    
    // Mettre à jour le localStorage
    localStorage.setItem(COMMUNITY_ENTRIES_KEY, JSON.stringify(updatedEntries));
    console.log(`[CommunityService] Contribution supprimée: ${entryId}`);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression locale de la contribution ${entryId}:`, error);
    return false;
  }
}

/**
 * Récupère les entrées mises en avant
 */
export async function fetchFeaturedEntries(): Promise<CommunityEntry[]> {
  try {
    // En production ou si l'API est activée, récupérer les données depuis l'API GitHub
    if (process.env.NODE_ENV !== 'development' || import.meta.env.VITE_USE_API === 'true') {
      // Utiliser l'API GitHub pour récupérer le contenu du fichier JSON
      const response = await fetch(`${BASE_URL}/data/featured-content.json`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Récupérer les likes de l'utilisateur actuel
      const likedEntries = getLikedEntries();
      
      // Ajouter un flag pour indiquer si l'entrée est likée par l'utilisateur actuel
      return data.entries.map(entry => ({
        ...entry,
        isLikedByCurrentUser: likedEntries.includes(entry.id)
      }));
    }
    
    // En développement, récupérer les données depuis le fichier JSON
    const response = await fetch(`${BASE_URL}/featured-content.json`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data: CommunityContentData = await response.json();
    
    // Récupérer les likes de l'utilisateur actuel
    const likedEntries = getLikedEntries();
    
    // Marquer les entrées aimées par l'utilisateur
    return data.entries.map(entry => ({
      ...entry,
      isLikedByCurrentUser: likedEntries.includes(entry.id)
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées mises en avant:", error);
    
    // En mode développement, retourner un sous-ensemble des données stockées localement
    if (process.env.NODE_ENV === 'development') {
      return getStoredEntries().slice(0, 3);
    }
    
    throw error;
  }
}

/**
 * Ajoute ou retire un like sur une entrée
 */
export async function toggleLike(entryId: string, sessionId: string): Promise<CommunityEntry> {
  try {
    console.log(`[CommunityService] Tentative de like/unlike pour l'entrée ${entryId}`);
    
    // Vérifier si l'utilisateur a déjà aimé cette entrée
    const likedEntries = getLikedEntries();
    const alreadyLiked = likedEntries.includes(entryId);
    const action = alreadyLiked ? 'unlike' : 'like';
    
    console.log(`[CommunityService] Action: ${action}, Déjà liké: ${alreadyLiked}`);
    
    // Récupérer les entrées stockées
    let entries = getStoredEntries();
    
    // Trouver l'entrée à mettre à jour
    let entryIndex = entries.findIndex(entry => entry.id === entryId);
    let entry;
    
    // Si l'entrée n'existe pas, essayer de la récupérer depuis le DOM
    if (entryIndex === -1) {
      console.log(`[CommunityService] Entrée ${entryId} non trouvée dans la collection locale, recherche dans le DOM...`);
      
      // Essayer de récupérer les données de l'entrée depuis le DOM
      const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
      if (entryElement) {
        // Extraire les données de l'entrée depuis les attributs data-*
        const type = entryElement.getAttribute('data-entry-type') as EntryType || 'photo';
        const displayName = entryElement.getAttribute('data-entry-author') || 'Contributeur anonyme';
        const imageUrl = entryElement.querySelector('img')?.src || undefined;
        const description = entryElement.getAttribute('data-entry-description') || '';
        
        console.log(`[CommunityService] Données récupérées depuis le DOM: type=${type}, auteur=${displayName}`);
        
        // Créer une nouvelle entrée avec les données récupérées
        const newEntry: CommunityEntry = {
          id: entryId,
          type: type,
          displayName: displayName,
          createdAt: new Date().toISOString(),
          likes: 0,
          likedBy: [],
          isLikedByCurrentUser: false,
          moderation: {
            status: 'approved',
            moderatedAt: new Date().toISOString()
          }
        };
        
        // Ajouter les champs spécifiques au type
        if (type === 'photo' && imageUrl) {
          newEntry.imageUrl = imageUrl;
          newEntry.thumbnailUrl = imageUrl;
          newEntry.description = description;
        }
        
        entries.push(newEntry);
        entryIndex = entries.length - 1;
        entry = newEntry;
        
        console.log(`[CommunityService] Nouvelle entrée créée à partir du DOM: ${JSON.stringify(newEntry)}`);
      } else {
        // Si l'entrée n'est pas trouvée dans le DOM, créer une entrée minimale
        console.log(`[CommunityService] Création d'une entrée temporaire minimale pour le like avec ID: ${entryId}`);
        const newEntry: CommunityEntry = {
          id: entryId,
          type: 'photo',
          displayName: 'Contributeur anonyme',
          createdAt: new Date().toISOString(),
          likes: 0,
          likedBy: [],
          isLikedByCurrentUser: false,
          moderation: {
            status: 'approved',
            moderatedAt: new Date().toISOString()
          }
        };
        
        entries.push(newEntry);
        entryIndex = entries.length - 1;
        entry = newEntry;
      }
      
      // Sauvegarder l'entrée dans le stockage local
      saveEntries(entries);
    } else {
      entry = entries[entryIndex];
    }
    
    // Extraire le numéro d'issue depuis l'ID de l'entrée
    // Format attendu: "issue-123" ou simplement "123"
    let issueNumber = entryId;
    if (entryId.startsWith('issue-')) {
      issueNumber = entryId.substring(6); // Enlever le préfixe "issue-"
    }
    
    // En production ou si l'API est activée, synchroniser le like avec le serveur
    if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
        process.env.NODE_ENV !== 'development' || 
        import.meta.env.VITE_USE_API === 'true') {
      
      try {
        console.log(`[CommunityService] Synchronisation du like avec le serveur pour l'issue #${issueNumber}`);
        
        // Appeler l'API du Worker Cloudflare pour mettre à jour le like sur GitHub
        const response = await fetch(`${WORKER_URL}/like-issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            issueNumber: issueNumber,
            sessionId: sessionId,
            action: action
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[CommunityService] Réponse du serveur:`, data);
          
          // Mettre à jour l'entrée avec les données du serveur
          entry.likes = data.likes;
          entry.likedBy = data.likedBy || [];
          entry.isLikedByCurrentUser = data.isLikedByCurrentUser;
        } else {
          console.error(`[CommunityService] Erreur lors de la synchronisation du like: ${response.status}`);
          // Continuer avec la mise à jour locale malgré l'erreur
        }
      } catch (error) {
        console.error(`[CommunityService] Erreur lors de l'appel à l'API de like:`, error);
        // Continuer avec la mise à jour locale malgré l'erreur
      }
    }
    
    // Mettre à jour le nombre de likes localement (même si la synchronisation a échoué)
    if (!alreadyLiked) {
      // Ajouter un like
      if (!entry.likes) entry.likes = 0;
      entry.likes++;
      entry.isLikedByCurrentUser = true;
      
      // Initialiser ou mettre à jour la liste des utilisateurs qui ont aimé
      if (!entry.likedBy) entry.likedBy = [];
      if (!entry.likedBy.includes(sessionId)) {
        entry.likedBy.push(sessionId);
      }
      
      // Ajouter l'ID de l'entrée à la liste des entrées aimées
      addLike(entryId);
      
      console.log(`[CommunityService] Like ajouté pour l'entrée ${entryId}, nouveau total: ${entry.likes}`);
    } else {
      // Retirer un like
      if (entry.likes && entry.likes > 0) {
        entry.likes--;
      }
      entry.isLikedByCurrentUser = false;
      
      // Mettre à jour la liste des utilisateurs qui ont aimé
      if (entry.likedBy) {
        entry.likedBy = entry.likedBy.filter(id => id !== sessionId);
      }
      
      // Retirer l'ID de l'entrée de la liste des entrées aimées
      removeLike(entryId);
      
      console.log(`[CommunityService] Like retiré pour l'entrée ${entryId}, nouveau total: ${entry.likes}`);
    }
    
    // Mettre à jour l'entrée dans le stockage local
    entries[entryIndex] = entry;
    saveEntries(entries);
    
    // Envoyer la mise à jour au serveur (pour traitement asynchrone)
    await sendLikeUpdate(entryId, !alreadyLiked, sessionId);
    
    return entry;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du like:", error);
    throw error;
  }
}

/**
 * Soumet une nouvelle contribution à la galerie
 */
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  try {
    // Récupérer le nom d'affichage de l'utilisateur ou utiliser celui fourni
    const displayName = params.displayName || AnonymousSessionService.getDisplayName() || 'Anonyme';
    
    // Générer un ID de session si non fourni
    const sessionId = AnonymousSessionService.getOrCreateSessionId();
    
    // En production ou si l'API est activée, envoyer à l'API GitHub
    if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
        process.env.NODE_ENV !== 'development' || 
        import.meta.env.VITE_USE_API === 'true') {
      
      // Préparer les données pour l'API GitHub
      let issueTitle = '';
      let issueBody = '';
      let labels = [];
      
      // Configurer le titre et le corps selon le type de contribution
      if (params.type === 'photo') {
        issueTitle = `Photo contribution: ${params.description || 'Sans titre'}`;
        labels.push('photo');
        
        // Si une image est fournie, la convertir en base64 et l'inclure dans le corps
        if (params.image) {
          try {
            // Convertir l'image en base64
            const base64Image = await resizeAndCompressImage(params.image, 800, 800, 0.7);
            issueBody = `![Image](${base64Image})\n\n`;
          } catch (error) {
            console.error('Erreur lors du traitement de l\'image:', error);
          }
        }
        
        // Ajouter la description si présente
        if (params.description) {
          issueBody += `**Description:** ${params.description}\n\n`;
        }
      } else if (params.type === 'testimonial') {
        issueTitle = `Témoignage de ${displayName}`;
        issueBody = params.content || '';
        labels.push('testimonial');
      }
      
      // Ajouter les métadonnées au corps
      issueBody += `\n\n---\n\n`;
      issueBody += `**Contributeur:** ${displayName}\n`;
      issueBody += `**Type:** ${params.type}\n`;
      
      // Ajouter les références à l'événement ou au lieu si présentes
      if (params.eventId) {
        issueBody += `**Événement:** ${params.eventId}\n`;
      }
      
      if (params.locationId) {
        issueBody += `**Lieu:** ${params.locationId}\n`;
      }
      
      // Ajouter les informations de contexte si présentes
      if (params.contextType) {
        issueBody += `**Type de contexte:** ${params.contextType}\n`;
      }
      
      if (params.contextId) {
        issueBody += `**ID de contexte:** ${params.contextId}\n`;
      }
      
      // Envoyer la requête au Worker Cloudflare qui sert de proxy sécurisé
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      };
      
      // Le Worker s'occupe d'ajouter le token d'authentification GitHub
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: labels
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Créer une entrée communautaire à partir de la réponse de l'API GitHub
      return {
        id: `${result.number}`,
        type: params.type,
        displayName: displayName,
        sessionId: sessionId,
        createdAt: result.created_at,
        timestamp: result.created_at,
        likes: 0,
        likedBy: [],
        moderation: {
          status: 'pending',
          moderatedAt: null
        },
        isLikedByCurrentUser: false,
        // Ajouter les champs spécifiques selon le type
        ...(params.type === 'photo' && {
          imageUrl: params.image ? await resizeAndCompressImage(params.image, 800, 800, 0.7) : null,
          description: params.description || ''
        }),
        ...(params.type === 'testimonial' && {
          content: params.content || ''
        }),
        // Ajouter les références si présentes
        ...(params.eventId && { eventId: params.eventId }),
        ...(params.locationId && { locationId: params.locationId }),
        ...(params.contextType && { contextType: params.contextType }),
        ...(params.contextId && { contextId: params.contextId })
      };
    }
    
    // En développement, simuler le comportement de l'API
    // Générer un ID unique pour la contribution
    const entryId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Créer l'entrée de base
    const newEntry: CommunityEntry = {
      id: entryId,
      type: params.type,
      displayName: displayName,
      sessionId: sessionId,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(), // Ajout explicite du timestamp pour éviter les erreurs de formatage
      likes: 0,
      likedBy: [],
      moderation: {
        status: 'pending',
        moderatedAt: null
      }
    };
    
    // Ajouter les champs spécifiques selon le type
    if (params.type === 'photo') {
      // Télécharger l'image si présente
      if (params.image) {
        const imageUrls = await uploadImage(params.image);
        newEntry.imageUrl = imageUrls.imageUrl;
        newEntry.thumbnailUrl = imageUrls.thumbnailUrl;
      }
      
      // Ajouter la description si présente
      if (params.description) {
        newEntry.description = params.description;
      }
    } else if (params.type === 'testimonial' && params.content) {
      newEntry.content = params.content;
    }
    
    // Ajouter les références à l'événement ou au lieu si présentes
    if (params.eventId) {
      newEntry.eventId = params.eventId;
    }
    
    if (params.locationId) {
      newEntry.locationId = params.locationId;
    }
    
    // Ajouter les informations de contexte si présentes
    if (params.contextType) {
      newEntry.contextType = params.contextType;
    }
    
    if (params.contextId) {
      newEntry.contextId = params.contextId;
    }
    
    // En développement, stocker localement
    const entries = getStoredEntries();
    entries.unshift(newEntry); // Ajouter au début pour avoir les plus récentes en premier
    saveEntries(entries);
    
    return {
      ...newEntry,
      isLikedByCurrentUser: false
    };
  } catch (error) {
    console.error("Erreur lors de la soumission de la contribution:", error);
    throw error;
  }
}

/**
 * Télécharge une image vers le service de stockage
 * En mode développement, convertit l'image en base64 pour la stocker dans localStorage
 */

// Taille maximale estimée du localStorage (en octets) - généralement 5-10 Mo selon les navigateurs
const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5 Mo par défaut

// Taille maximale qu'une image peut occuper (en octets)
const MAX_IMAGE_SIZE = 800 * 1024; // 800 Ko

/**
 * Estime la taille actuelle utilisée par le localStorage en octets
 * @returns Taille estimée en octets
 */
function estimateLocalStorageSize(): number {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += (key.length + value.length) * 2; // Approximation en octets (2 octets par caractère)
      }
    }
    return totalSize;
  } catch (error) {
    console.error("Erreur lors de l'estimation de la taille du localStorage:", error);
    return 0;
  }
}

/**
 * Nettoie le localStorage en supprimant les anciennes images
 * pour libérer de l'espace de manière intelligente
 * @param requiredSpace Espace requis en octets (optionnel)
 * @param preserveImageIds IDs des images à préserver (optionnel)
 */
function cleanupOldImages(requiredSpace?: number, preserveImageIds: string[] = []): void {
  try {
    console.log("[FileService] Nettoyage intelligent des images du localStorage");
    
    // Obtenir toutes les clés d'images du localStorage avec leur date de création
    const imageKeys: {key: string, id: string, timestamp: number}[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('community_image_')) {
        const imageId = key.replace('community_image_', '');
        
        // Ne pas inclure les images à préserver dans la liste des suppressions potentielles
        if (preserveImageIds.includes(imageId)) {
          console.log(`[FileService] Image préservée: ${imageId}`);
          continue;
        }
        
        // Extraire le timestamp de l'ID de l'image (format: img-TIMESTAMP-random)
        const timestampMatch = imageId.match(/img-(\d+)-/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : Date.now();
        
        imageKeys.push({ key, id: imageId, timestamp });
      }
    }
    
    // Si aucune image à supprimer, sortir
    if (imageKeys.length === 0) {
      console.log("[FileService] Aucune image à nettoyer");
      return;
    }
    
    // Trier les images par date (les plus anciennes d'abord)
    imageKeys.sort((a, b) => a.timestamp - b.timestamp);
    
    // Estimer l'espace actuel utilisé
    const currentSize = estimateLocalStorageSize();
    const availableSpace = MAX_LOCAL_STORAGE_SIZE - currentSize;
    
    // Si un espace spécifique est requis et qu'il n'est pas disponible, supprimer des images
    if (requiredSpace && availableSpace < requiredSpace) {
      let freedSpace = 0;
      let removedCount = 0;
      
      // Supprimer les images les plus anciennes jusqu'à libérer assez d'espace
      for (const { key, id } of imageKeys) {
        const value = localStorage.getItem(key) || '';
        const itemSize = (key.length + value.length) * 2;
        
        localStorage.removeItem(key);
        freedSpace += itemSize;
        removedCount++;
        
        console.log(`[FileService] Image supprimée: ${id} (${Math.round(itemSize/1024)} Ko)`);
        
        if (freedSpace >= requiredSpace) {
          break;
        }
      }
      
      console.log(`[FileService] ${removedCount} images supprimées, ${Math.round(freedSpace/1024)} Ko libérés`);
    } 
    // Sinon, supprimer uniquement les images les plus anciennes si on approche de la limite
    else if (currentSize > MAX_LOCAL_STORAGE_SIZE * 0.8) { // Si on utilise plus de 80% de l'espace
      // Garder seulement les 5 images les plus récentes
      const imagesToKeep = 5;
      const imagesToRemove = imageKeys.slice(0, -imagesToKeep);
      
      console.log(`[FileService] Suppression de ${imagesToRemove.length} anciennes images sur ${imageKeys.length} total`);
      
      imagesToRemove.forEach(({ key, id }) => {
        localStorage.removeItem(key);
        console.log(`[FileService] Image ancienne supprimée: ${id}`);
      });
    }
  } catch (error) {
    console.error("[FileService] Erreur lors du nettoyage des anciennes images:", error);
  }
}

/**
 * Redimensionne une image et la convertit en base64 avec compression
 */
async function resizeAndCompressImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        // Calculer les dimensions pour conserver le ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Créer un canvas pour redimensionner l'image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte 2D'));
          return;
        }
        
        // Dessiner l'image redimensionnée sur le canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression
        const base64String = canvas.toDataURL('image/webp', quality);
        resolve(base64String);
      };
      
      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(image: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  try {
    // En production, convertir l'image en base64 et créer un issue GitHub avec l'image encodée
    // En développement, utiliser l'API si VITE_USE_API=true
    if (process.env.NODE_ENV !== 'development' || import.meta.env.VITE_USE_API === 'true') {
      // Convertir l'image en base64
      const base64Image = await resizeAndCompressImage(image, 800, 800, 0.7);
      
      // Créer un issue GitHub avec l'image encodée en base64 dans le corps
      const response = await fetch(`${API_URL}/issues`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          title: `Photo contribution ${new Date().toISOString()}`,
          body: `![Image](${base64Image})`,
          labels: ['photo-contribution']
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extraire l'URL de l'image du corps de l'issue
      // En production, utiliser l'URL absolue pour les images
      const imageUrl = base64Image;
      return {
        imageUrl: imageUrl,
        thumbnailUrl: imageUrl
      };
    }
    
    // En développement, convertir l'image en base64 pour la stocker dans localStorage
    return new Promise(async (resolve, reject) => {
      try {
        // Estimer la taille nécessaire pour cette image
        const estimatedSize = image.size * 1.4; // Base64 est environ 33% plus grand que binaire + overhead
        
        // Redimensionner l'image si elle est trop grande
        let finalImage = image;
        let quality = 0.7;
        
        // Si l'image est trop grande, la redimensionner progressivement
        if (image.size > MAX_IMAGE_SIZE) {
          try {
            console.log(`[FileService] Redimensionnement de l'image (${Math.round(image.size/1024)} Ko) avant stockage`);
            
            // Adapter la qualité en fonction de la taille de l'image
            if (image.size > 2 * 1024 * 1024) { // > 2 Mo
              quality = 0.5;
            } else if (image.size > 1 * 1024 * 1024) { // > 1 Mo
              quality = 0.6;
            }
            
            // Calculer les dimensions maximales en fonction de la taille
            let maxDimension = 800;
            if (image.size > 3 * 1024 * 1024) { // > 3 Mo
              maxDimension = 600;
            } else if (image.size > 5 * 1024 * 1024) { // > 5 Mo
              maxDimension = 400;
            }
            
            const resizedBase64 = await resizeAndCompressImage(image, maxDimension, maxDimension, quality);
            // Convertir le base64 en blob puis en File
            const blob = await fetch(resizedBase64).then(r => r.blob());
            finalImage = new File([blob], image.name, { type: 'image/jpeg' });
            console.log(`[FileService] Image redimensionnée: ${Math.round(resizedBase64.length / 1024)} Ko`);
          } catch (resizeErr) {
            console.warn("[FileService] Échec du redimensionnement, utilisation de l'image originale", resizeErr);
          }
        }
        
        // Nettoyer le localStorage de manière intelligente AVANT de lire l'image
        console.log("[FileService] Nettoyage préventif du localStorage avant lecture de l'image");
        // Estimer l'espace nécessaire et nettoyer en conséquence
        cleanupOldImages(estimatedSize);
        
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            // Générer un ID unique pour cette image
            const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            // Ajouter l'origine à l'URL si nécessaire pour les chemins absolus
            const processImageUrl = (url: string) => {
              if (url.startsWith('data:')) return url; // Déjà en base64
              if (url.startsWith('http')) return url; // Déjà une URL absolue
              // Construire une URL absolue pour les chemins relatifs
              return window.location.origin + (url.startsWith('/') ? '' : '/') + url;
            };
            
            console.log("[FileService] Stockage de l'image:", finalImage.name, `(${Math.round(base64String.length / 1024)} Ko)`);
            
            // Essayer de stocker l'image en base64 dans localStorage
            try {
              localStorage.setItem(`community_image_${imageId}`, base64String);
            } catch (storageErr) {
              console.warn("[FileService] Échec du stockage, nettoyage agressif et nouvel essai", storageErr);
              
              // Nettoyer de manière plus agressive, mais préserver cette image
              cleanupOldImages(base64String.length * 2);
              
              try {
                // Réessayer après nettoyage
                localStorage.setItem(`community_image_${imageId}`, base64String);
              } catch (finalErr) {
                console.error("[FileService] Impossible de stocker l'image même après nettoyage", finalErr);
                
                // Dernier recours: réduire drastiquement la qualité de l'image
                (async () => {
                  try {
                    const lastChanceBase64 = await resizeAndCompressImage(finalImage, 400, 400, 0.3);
                    localStorage.setItem(`community_image_${imageId}`, lastChanceBase64);
                    console.log("[FileService] Image stockée avec qualité réduite");
                  } catch (e) {
                    reject(new Error("Impossible de stocker l'image: espace insuffisant"));
                  }
                })();
              }
            }
            
            // Retourner un identifiant qui permettra de récupérer l'image plus tard
            resolve({
              imageUrl: `local:${imageId}`,
              thumbnailUrl: `local:${imageId}`
            });
          } catch (err) {
            console.error("[FileService] Erreur lors du traitement de l'image:", err);
            reject(err);
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Erreur lors de la lecture de l'image"));
        };
        
        reader.readAsDataURL(finalImage);
      } catch (error) {
        console.error("[FileService] Erreur globale lors du traitement de l'image:", error);
        reject(error);
      }
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    throw error;
  }
}

/**
 * Modère le contenu soumis via une approche simplifiée
 */
export async function moderateContent(type: "photo" | "testimonial", content: string | File): Promise<ModerationResult> {
  try {
    // Générer un ID temporaire pour cette demande de modération
    const tempEntryId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // En production ou si l'API est activée, utiliser GitHub Actions pour la modération
    if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
        process.env.NODE_ENV !== 'development' || 
        import.meta.env.VITE_USE_API === 'true') {
      
      // En production, on effectue une modération côté client basique
      // La modération complète sera effectuée par GitHub Actions
      
      if (type === 'testimonial' && typeof content === 'string') {
        // Liste de mots interdits simplifiée
        const forbiddenWords = ['mot1', 'mot2', 'mot3'];
        
        // Vérifier si le contenu contient des mots interdits
        const containsForbiddenWord = forbiddenWords.some(word => 
          content.toLowerCase().includes(word.toLowerCase())
        );
        
        if (containsForbiddenWord) {
          return {
            entryId: tempEntryId,
            status: 'rejected',
            message: 'Le texte contient des mots inappropriés'
          };
        }
      }
      
      // Par défaut, marquer comme "en attente" pour modération par GitHub Actions
      return {
        entryId: tempEntryId,
        status: "pending",
        message: "En attente de modération"
      };
    }
    
    // En développement, effectuer une modération basique
    if (type === 'testimonial' && typeof content === 'string') {
      // Liste de mots interdits simplifiée
      const forbiddenWords = ['mot1', 'mot2', 'mot3'];
      
      // Vérifier si le contenu contient des mots interdits
      const containsForbiddenWord = forbiddenWords.some(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsForbiddenWord) {
        return {
          entryId: tempEntryId,
          status: 'rejected',
          message: 'Le texte contient des mots inappropriés'
        };
      }
    }
    
    // Par défaut, approuver le contenu
    return {
      entryId: tempEntryId,
      status: "approved"
    };
  } catch (error) {
    console.error("Erreur lors de la modération du contenu:", error);
    throw error;
  }
}

// Fonctions utilitaires pour la gestion des likes en local

function addLike(entryId: string): void {
  const likes = getLikedEntries();
  if (!likes.includes(entryId)) {
    likes.push(entryId);
    localStorage.setItem(COMMUNITY_LIKES_KEY, JSON.stringify(likes));
  }
}

function removeLike(entryId: string): void {
  const likes = getLikedEntries().filter(id => id !== entryId);
  localStorage.setItem(COMMUNITY_LIKES_KEY, JSON.stringify(likes));
}

async function sendLikeUpdate(entryId: string, isLiking: boolean, sessionId: string): Promise<void> {
  // En production ou si l'API est activée, envoyer la mise à jour via GitHub Actions
  if ((typeof window !== 'undefined' && window.location.hostname.includes('github.io')) || 
      process.env.NODE_ENV !== 'development' || 
      import.meta.env.VITE_USE_API === 'true') {
      
    // Créer un objet pour l'action de like
    const likeAction = {
      entryId,
      action: isLiking ? "like" : "unlike",
      sessionId,
      timestamp: new Date().toISOString()
    };
    
    // Stocker l'action dans localStorage pour traitement ultérieur par GitHub Actions
    const pendingActions = JSON.parse(localStorage.getItem('pending_like_actions') || '[]');
    pendingActions.push(likeAction);
    localStorage.setItem('pending_like_actions', JSON.stringify(pendingActions));
    
    // En production, on pourrait déclencher un workflow GitHub Actions ici
    // mais pour simplifier, nous stockons simplement les actions en attente
  }
}
