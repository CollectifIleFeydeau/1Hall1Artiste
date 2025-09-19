import { LikeData, LikeResponse, LikeStats } from '@/types/likesTypes';

// Configuration Firebase
const FIREBASE_URL = 'https://collectif-feydeau-default-rtdb.europe-west1.firebasedatabase.app';
const LIKES_PATH = 'likes-data';
const STATS_PATH = 'likes-stats';

// Configuration du cache
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

// Interface pour les données en cache
interface CachedLikeData {
  data: LikeData;
  timestamp: number;
}

// Cache en mémoire
const likesCache = new Map<string, CachedLikeData>();

// Fonctions utilitaires pour le cache
function getCachedData(entryId: string): LikeData | null {
  const cached = likesCache.get(entryId);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    // Cache expiré, le supprimer
    likesCache.delete(entryId);
    return null;
  }
  
  console.log(`📦 Cache hit pour ${entryId}:`, cached.data);
  return cached.data;
}

function setCachedData(entryId: string, data: LikeData): void {
  likesCache.set(entryId, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cache mis à jour pour ${entryId}:`, data);
}

function invalidateCache(entryId: string): void {
  likesCache.delete(entryId);
  console.log(`🗑️ Cache invalidé pour ${entryId}`);
}

// Génération d'un ID de session anonyme
export function getSessionId(): string {
  let sessionId = localStorage.getItem('user-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user-session-id', sessionId);
  }
  return sessionId;
}

// Toggle like pour une contribution
export async function toggleLike(entryId: string, sessionId?: string): Promise<LikeResponse> {
  try {
    const userSessionId = sessionId || getSessionId();
    console.log(`🔄 Toggle like pour ${entryId} par ${userSessionId}`);

    // Récupérer les données actuelles
    const response = await fetch(`${FIREBASE_URL}/${LIKES_PATH}/${entryId}.json`);
    const currentData = response.ok ? await response.json() : null;
    
    const data = currentData || {
      likes: 0,
      likedBy: [],
      lastLiked: null
    };

    const hasLiked = data.likedBy?.includes(userSessionId) || false;
    let newLikedBy = data.likedBy || [];
    let newLikes = data.likes || 0;

    if (hasLiked) {
      // Retirer le like
      newLikedBy = newLikedBy.filter((id: string) => id !== userSessionId);
      newLikes = Math.max(0, newLikes - 1);
      console.log(`❤️ Like retiré pour ${entryId}`);
    } else {
      // Ajouter le like
      newLikedBy.push(userSessionId);
      newLikes += 1;
      console.log(`💖 Like ajouté pour ${entryId}`);
    }

    // Mise à jour Firebase
    const updatedData = {
      likes: newLikes,
      likedBy: newLikedBy,
      lastLiked: new Date().toISOString()
    };

    const updateResponse = await fetch(`${FIREBASE_URL}/${LIKES_PATH}/${entryId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!updateResponse.ok) {
      throw new Error('Erreur lors de la mise à jour des likes');
    }

    // Invalidate cache for this entry
    invalidateCache(entryId);
    
    // Mise à jour des stats globales
    await updateGlobalStats();

    return {
      success: true,
      liked: !hasLiked,
      total: newLikes
    };

  } catch (error) {
    console.error('❌ Erreur toggle like:', error);
    return {
      success: false,
      liked: false,
      total: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Récupérer le nombre de likes pour une entrée
export async function getLikeCount(entryId: string): Promise<number> {
  try {
    const response = await fetch(`${FIREBASE_URL}/likes-data/${entryId}/likes.json`);
    const count = response.ok ? await response.json() : 0;
    console.log(`📊 Likes pour ${entryId}: ${count || 0}`);
    return count || 0;
  } catch (error) {
    console.error('❌ Erreur getLikeCount:', error);
    return 0;
  }
}

// Vérifier si l'utilisateur a liké une entrée
export async function hasUserLiked(entryId: string, sessionId?: string): Promise<boolean> {
  try {
    const userSessionId = sessionId || getSessionId();
    const response = await fetch(`${FIREBASE_URL}/likes-data/${entryId}/likedBy.json`);
    const likedBy = response.ok ? await response.json() : [];
    const hasLiked = Array.isArray(likedBy) && likedBy.includes(userSessionId);
    console.log(`🔍 User ${userSessionId} a liké ${entryId}: ${hasLiked}`);
    return hasLiked;
  } catch (error) {
    console.error('❌ Erreur hasUserLiked:', error);
    return false;
  }
}

// Récupérer les données complètes de like pour une entrée
export async function getLikeData(entryId: string, sessionId?: string): Promise<LikeData> {
  try {
    const userSessionId = sessionId || getSessionId();
    
    // Vérifier le cache d'abord
    const cachedData = getCachedData(entryId);
    if (cachedData) {
      // Recalculer le statut "liked" pour la session actuelle
      return {
        ...cachedData,
        liked: Array.isArray(cachedData.likedBy) && cachedData.likedBy.includes(userSessionId)
      };
    }
    
    const response = await fetch(`${FIREBASE_URL}/${LIKES_PATH}/${entryId}.json`);
    const data = response.ok ? await response.json() : null;
    
    const likeData = data || {
      likes: 0,
      likedBy: []
    };

    const result = {
      liked: Array.isArray(likeData.likedBy) && likeData.likedBy.includes(userSessionId),
      total: likeData.likes || 0,
      likedBy: likeData.likedBy || []
    };
    
    // Mettre en cache les données
    setCachedData(entryId, result);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur getLikeData:', error);
    return {
      liked: false,
      total: 0
    };
  }
}

// Version qui force la récupération depuis Firebase (pour le polling)
export async function getLikeDataFresh(entryId: string, sessionId?: string): Promise<LikeData> {
  try {
    const userSessionId = sessionId || getSessionId();
    
    console.log(`🔄 Récupération fraîche depuis Firebase pour ${entryId}`);
    
    const response = await fetch(`${FIREBASE_URL}/${LIKES_PATH}/${entryId}.json`);
    const data = response.ok ? await response.json() : null;
    
    const likeData = data || {
      likes: 0,
      likedBy: []
    };

    const result = {
      liked: Array.isArray(likeData.likedBy) && likeData.likedBy.includes(userSessionId),
      total: likeData.likes || 0,
      likedBy: likeData.likedBy || []
    };
    
    // Mettre à jour le cache avec les nouvelles données
    setCachedData(entryId, result);
    
    console.log(`🔄 Données fraîches récupérées pour ${entryId}:`, result);
    return result;
  } catch (error) {
    console.error('❌ Erreur getLikeDataFresh:', error);
    return {
      liked: false,
      total: 0
    };
  }
}

// Récupérer les statistiques globales
export async function getLikeStats(): Promise<LikeStats> {
  try {
    const response = await fetch(`${FIREBASE_URL}/likes-stats.json`);
    const stats = response.ok ? await response.json() : null;
    
    const statsData = stats || {
      total: 0,
      today: 0,
      topEntry: null
    };
    
    console.log('📈 Stats globales:', statsData);
    return statsData;
  } catch (error) {
    console.error('❌ Erreur getLikeStats:', error);
    return {
      total: 0,
      today: 0
    };
  }
}

// Mise à jour des statistiques globales (fonction interne)
async function updateGlobalStats(): Promise<void> {
  try {
    // Récupérer tous les likes
    const response = await fetch(`${FIREBASE_URL}/likes-data.json`);
    const allLikes = response.ok ? await response.json() : {};
    
    let totalLikes = 0;
    let topEntry = '';
    let maxLikes = 0;
    
    Object.entries(allLikes || {}).forEach(([entryId, data]: [string, any]) => {
      const likes = data?.likes || 0;
      totalLikes += likes;
      
      if (likes > maxLikes) {
        maxLikes = likes;
        topEntry = entryId;
      }
    });

    // Mettre à jour les stats
    const statsData = {
      total: totalLikes,
      today: 0, // TODO: Calculer les likes du jour
      topEntry: topEntry || null,
      lastUpdated: new Date().toISOString()
    };

    await fetch(`${FIREBASE_URL}/likes-stats.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statsData)
    });

    console.log(`📊 Stats mises à jour: ${totalLikes} likes total, top: ${topEntry}`);
  } catch (error) {
    console.error('❌ Erreur updateGlobalStats:', error);
  }
}

// Fonction de test pour vérifier la connexion Firebase
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Test de connexion likes'
    };

    const response = await fetch(`${FIREBASE_URL}/test-connection.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ Connexion Firebase OK pour les likes');
      return true;
    } else {
      console.error('❌ Erreur connexion Firebase:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur connexion Firebase:', error);
    return false;
  }
}
