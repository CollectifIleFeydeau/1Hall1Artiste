import { useState, useEffect } from 'react';
import { getSavedEvents } from '@/services/savedEvents';

export function useSavedEventsCount() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    setCount(getSavedEvents().length);
  };

  useEffect(() => {
    // Initialiser le compteur
    updateCount();

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedEvents') {
        updateCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Écouter les changements personnalisés (même onglet)
    const handleCustomEvent = () => {
      updateCount();
    };

    window.addEventListener('savedEventsChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savedEventsChanged', handleCustomEvent);
    };
  }, []);

  return count;
}

