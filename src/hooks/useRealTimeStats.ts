import { useState, useEffect, useCallback } from 'react';
import { directAnalytics } from '@/services/directAnalytics';

// Interface pour les statistiques temps réel
export interface RealTimeStats {
  activeUsers: number;
  pageViews: number;
  events: number;
  topPages: Array<{ page: string; views: number }>;
  lastUpdate: string;
}

export interface UseRealTimeStatsReturn {
  stats: RealTimeStats | null;
  loading: boolean;
  error: string | null;
  sendTestEvent: () => Promise<string>;
  refresh: () => Promise<void>;
}

export function useRealTimeStats(): UseRealTimeStatsReturn {
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simuler des statistiques temps réel (en attendant l'API Google Analytics Reporting)
  const generateMockStats = useCallback((): RealTimeStats => {
    return {
      activeUsers: Math.floor(Math.random() * 50) + 1,
      pageViews: Math.floor(Math.random() * 200) + 50,
      events: Math.floor(Math.random() * 100) + 20,
      topPages: [
        { page: '/map', views: Math.floor(Math.random() * 50) + 20 },
        { page: '/community', views: Math.floor(Math.random() * 30) + 10 },
        { page: '/program', views: Math.floor(Math.random() * 25) + 5 },
        { page: '/galleries', views: Math.floor(Math.random() * 20) + 3 }
      ].sort((a, b) => b.views - a.views),
      lastUpdate: new Date().toISOString()
    };
  }, []);

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Générer des stats simulées
      const mockStats = generateMockStats();
      setStats(mockStats);
      
      console.log('📊 [useRealTimeStats] Stats mises à jour:', mockStats);
    } catch (err) {
      console.error('📊 [useRealTimeStats] Erreur chargement stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [generateMockStats]);

  // Envoyer un événement de test
  const sendTestEvent = useCallback(async (): Promise<string> => {
    try {
      const testId = await directAnalytics.testRealTime();
      
      // Simuler une augmentation des stats après l'événement avec cleanup
      const timeoutId = setTimeout(() => {
        setStats(prev => prev ? {
          ...prev,
          events: prev.events + 1,
          pageViews: prev.pageViews + Math.floor(Math.random() * 3),
          lastUpdate: new Date().toISOString()
        } : null);
      }, 1000);
      
      // Note: Ce timeout est intentionnellement court (1s) et ne nécessite pas de cleanup
      // car la fonction sendTestEvent est ponctuelle, mais on pourrait ajouter un cleanup
      // si nécessaire dans un useEffect avec une ref
      
      return testId;
    } catch (error) {
      console.error('📊 [useRealTimeStats] Erreur envoi test:', error);
      throw error;
    }
  }, []);

  // Rafraîchir manuellement
  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // Chargement initial et polling
  useEffect(() => {
    loadStats();
    
    // Polling toutes les 10 secondes (comme LikesStatsComponent)
    const interval = setInterval(() => {
      console.log('📊 [useRealTimeStats] Mise à jour automatique des stats');
      loadStats();
    }, 10000);
    
    return () => {
      console.log('📊 [useRealTimeStats] Arrêt polling stats');
      clearInterval(interval);
    };
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    sendTestEvent,
    refresh
  };
}

