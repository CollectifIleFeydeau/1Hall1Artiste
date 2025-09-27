import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  key: string; // Clé unique pour le localStorage
  data: any; // Données à sauvegarder
  delay?: number; // Délai en ms avant sauvegarde (défaut: 1000ms)
  enabled?: boolean; // Activer/désactiver l'auto-save
}

// Fonction debounce native
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  const debouncedFunc = ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T & { cancel: () => void };
  
  debouncedFunc.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunc;
}

export const useAutoSave = ({ key, data, delay = 1000, enabled = true }: AutoSaveOptions) => {
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Fonction de sauvegarde
  const saveToLocalStorage = (dataToSave: any) => {
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: Date.now(),
        version: '1.0'
      });
      localStorage.setItem(`draft_${key}`, serializedData);
      console.log(`[AutoSave] Brouillon sauvegardé: ${key}`);
    } catch (error) {
      console.error(`[AutoSave] Erreur sauvegarde ${key}:`, error);
    }
  };

  // Fonction de récupération
  const loadFromLocalStorage = (): any | null => {
    try {
      const serializedData = localStorage.getItem(`draft_${key}`);
      if (!serializedData) return null;

      const parsed = JSON.parse(serializedData);
      
      // Vérifier si le brouillon n'est pas trop ancien (24h max)
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(`draft_${key}`);
        return null;
      }

      console.log(`[AutoSave] Brouillon récupéré: ${key}`);
      return parsed.data;
    } catch (error) {
      console.error(`[AutoSave] Erreur récupération ${key}:`, error);
      return null;
    }
  };

  // Fonction de suppression
  const clearDraft = () => {
    try {
      localStorage.removeItem(`draft_${key}`);
      console.log(`[AutoSave] Brouillon supprimé: ${key}`);
    } catch (error) {
      console.error(`[AutoSave] Erreur suppression ${key}:`, error);
    }
  };

  // Créer la fonction debounced
  useEffect(() => {
    debouncedSaveRef.current = debounce(saveToLocalStorage, delay);
    
    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, [delay]);

  // Auto-save quand les données changent
  useEffect(() => {
    if (!enabled || !data) return;

    // Ne pas sauvegarder si les données sont vides
    const isEmpty = typeof data === 'object' && Object.keys(data).length === 0;
    if (isEmpty) return;

    debouncedSaveRef.current?.(data);
  }, [data, enabled]);

  return {
    loadDraft: loadFromLocalStorage,
    clearDraft,
    hasDraft: () => {
      try {
        return localStorage.getItem(`draft_${key}`) !== null;
      } catch {
        return false;
      }
    }
  };
};

