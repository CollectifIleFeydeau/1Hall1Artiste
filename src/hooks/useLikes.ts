import { useState, useEffect, useCallback } from 'react';
import { 
  toggleLike as toggleLikeService, 
  getLikeData, 
  getLikeDataFresh,
  getSessionId 
} from '@/services/likesService';
import { LikeData, LikeResponse } from '@/types/likesTypes';

export interface UseLikesReturn {
  liked: boolean;
  total: number;
  loading: boolean;
  error: string | null;
  isToggling: boolean;
  toggleLike: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLikes(entryId: string): UseLikesReturn {
  const [liked, setLiked] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const sessionId = getSessionId();

  // Charger les données initiales (avec cache)
  const loadLikeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getLikeData(entryId, sessionId);
      setLiked(data.liked);
      setTotal(data.total);
      
      console.log(`🔄 Données likes chargées pour ${entryId}:`, data);
    } catch (err) {
      console.error('❌ Erreur chargement likes:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [entryId, sessionId]);

  // Charger les données fraîches (pour le polling)
  const loadFreshLikeData = useCallback(async () => {
    try {
      setError(null);
      
      const data = await getLikeDataFresh(entryId, sessionId);
      setLiked(data.liked);
      setTotal(data.total);
      
      console.log(`🔄 Données likes fraîches pour ${entryId}:`, data);
    } catch (err) {
      console.error('❌ Erreur chargement likes fresh:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    }
  }, [entryId, sessionId]);

  // Charger les données initiales et setup polling simple
  useEffect(() => {
    if (!entryId) return;

    console.log(`🎧 Chargement initial pour ${entryId}`);
    
    // Charger les données initiales
    loadLikeData();
    
    // Setup polling avec données fraîches (toutes les 5 secondes)
    const interval = setInterval(() => {
      console.log(`⏰ Polling automatique pour ${entryId}`);
      loadFreshLikeData();
    }, 5000);

    // Cleanup
    return () => {
      console.log(`🔇 Arrêt polling pour ${entryId}`);
      clearInterval(interval);
    };
  }, [entryId, sessionId, loadLikeData, loadFreshLikeData]);

  // Fonction pour toggler le like avec debouncing
  const handleToggleLike = useCallback(async () => {
    // Prévention double-clic : si déjà en cours, ignorer
    if (isToggling) {
      console.log(`⏳ Toggle like déjà en cours pour ${entryId}, ignoré`);
      return;
    }

    try {
      setIsToggling(true);
      setError(null);
      console.log(`🔄 Toggle like pour ${entryId}...`);
      
      // Optimistic update
      const newLiked = !liked;
      const newTotal = newLiked ? total + 1 : Math.max(0, total - 1);
      
      setLiked(newLiked);
      setTotal(newTotal);
      
      // Appel au service
      const response: LikeResponse = await toggleLikeService(entryId, sessionId);
      
      if (!response.success) {
        // Rollback en cas d'erreur
        setLiked(liked);
        setTotal(total);
        setError(response.error || 'Erreur lors du like');
        console.error('❌ Erreur toggle like:', response.error);
      } else {
        console.log(`✅ Like toggled avec succès pour ${entryId}`);
      }
      
    } catch (err) {
      // Rollback en cas d'erreur
      setLiked(liked);
      setTotal(total);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('❌ Erreur toggle like:', err);
    } finally {
      // Débloquer après un délai minimum pour éviter les clics trop rapides
      const timeoutId = setTimeout(() => {
        setIsToggling(false);
      }, 500); // 500ms de délai minimum entre les clics
      
      // Note: Ce timeout est volontairement non nettoyé car il doit se terminer
      // même si le composant est démonté pour éviter les fuites d'état
    }
  }, [entryId, sessionId, liked, total, isToggling]);

  // Fonction pour rafraîchir manuellement
  const refresh = useCallback(async () => {
    await loadLikeData();
  }, [loadLikeData]);

  return {
    liked,
    total,
    loading,
    error,
    isToggling,
    toggleLike: handleToggleLike,
    refresh
  };
}
