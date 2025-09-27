import { useState, useEffect } from 'react';

export function useVisitedLocations() {
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);

  const updateVisitedLocations = () => {
    try {
      const visited = localStorage.getItem('visitedLocations');
      const parsedVisited = visited ? JSON.parse(visited) : [];
      setVisitedLocations(Array.isArray(parsedVisited) ? parsedVisited : []);
    } catch (error) {
      console.error('Erreur lors de la lecture des lieux visités:', error);
      setVisitedLocations([]);
    }
  };

  useEffect(() => {
    // Initialiser la liste
    updateVisitedLocations();

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'visitedLocations') {
        updateVisitedLocations();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Écouter les changements personnalisés (même onglet)
    const handleCustomEvent = () => {
      updateVisitedLocations();
    };

    window.addEventListener('visitedLocationsChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visitedLocationsChanged', handleCustomEvent);
    };
  }, []);

  return {
    visitedLocations,
    visitedCount: visitedLocations.length
  };
}

