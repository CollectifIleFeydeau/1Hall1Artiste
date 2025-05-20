import { useState, useEffect } from 'react';
import { cacheManager } from '@/utils/cacheManager';

/**
 * Hook pour utiliser facilement le cache dans les composants React
 * @param key - Clé unique pour identifier les données en cache
 * @param fetcher - Fonction qui récupère les données si elles ne sont pas en cache
 * @param options - Options supplémentaires (expiration, dépendances)
 * @returns Un objet contenant les données, l'état de chargement et les erreurs
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    expiry?: number | null;
    dependencies?: any[];
  } = {}
) {
  const { expiry = null, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await cacheManager.getOrSet<T>(key, fetcher, expiry);
        
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Erreur lors de la récupération des données pour la clé "${key}":`, err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [key, ...dependencies]);

  // Fonction pour rafraîchir manuellement les données
  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Supprimer l'entrée existante du cache
      cacheManager.remove(key);
      
      // Récupérer de nouvelles données
      const freshData = await fetcher();
      
      // Mettre à jour le cache et l'état
      cacheManager.set(key, freshData, expiry);
      setData(freshData);
      setIsLoading(false);
    } catch (err) {
      console.error(`Erreur lors du rafraîchissement des données pour la clé "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refresh };
}
