// NOTE: react-ga4 disabled. This file now only manages local usage statistics
// and exposes the same API without sending data to GA4.

// Stockage local pour les statistiques détaillées
const LOCAL_STATS_KEY = 'app_usage_statistics';

// Types pour les statistiques locales
interface AppStats {
  pageViews: Record<string, number>;
  featureUsage: Record<string, number>;
  navigationPaths: Array<{from: string, to: string, timestamp: number}>;
  sessionDurations: Array<{date: string, duration: number}>;
  lastSession: {
    startTime: number;
    currentPage: string;
  };
  deviceInfo: {
    screenSize: string;
    platform: string;
    language: string;
  };
}

// Initialiser ou récupérer les statistiques locales
const getLocalStats = (): AppStats => {
  const savedStats = localStorage.getItem(LOCAL_STATS_KEY);
  if (savedStats) {
    try {
      return JSON.parse(savedStats);
    } catch (e) {
      console.error('Erreur lors de la lecture des statistiques locales:', e);
    }
  }
  
  // Statistiques par défaut
  return {
    pageViews: {},
    featureUsage: {},
    navigationPaths: [],
    sessionDurations: [],
    lastSession: {
      startTime: Date.now(),
      currentPage: window.location.pathname
    },
    deviceInfo: {
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform,
      language: navigator.language
    }
  };
};

// Sauvegarder les statistiques locales
const saveLocalStats = (stats: AppStats) => {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des statistiques locales:', e);
  }
};

// Initialize local stats only (react-ga4 removed)
export const initGA = () => {
  const stats = getLocalStats();
  stats.lastSession.startTime = Date.now();
  stats.lastSession.currentPage = window.location.pathname;
  saveLocalStats(stats);

  window.addEventListener('beforeunload', () => {
    const currentStats = getLocalStats();
    const sessionDuration = Date.now() - currentStats.lastSession.startTime;

    currentStats.sessionDurations.push({
      date: new Date().toISOString().split('T')[0],
      duration: sessionDuration
    });

    if (currentStats.sessionDurations.length > 30) {
      currentStats.sessionDurations = currentStats.sessionDurations.slice(-30);
    }

    saveLocalStats(currentStats);
  });
};

// Track page views
export const trackPageView = (path: string) => {
  // Statistiques locales uniquement
  const stats = getLocalStats();
  
  // Enregistrer le changement de page
  if (stats.lastSession.currentPage !== path) {
    stats.navigationPaths.push({
      from: stats.lastSession.currentPage,
      to: path,
      timestamp: Date.now()
    });
    
    // Limiter le nombre d'entrées
    if (stats.navigationPaths.length > 100) {
      stats.navigationPaths = stats.navigationPaths.slice(-100);
    }
  }
  
  // Incrémenter le compteur de vues de page
  stats.pageViews[path] = (stats.pageViews[path] || 0) + 1;
  stats.lastSession.currentPage = path;
  
  saveLocalStats(stats);
};

// Track events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  // Statistiques locales uniquement
  const stats = getLocalStats();
  const featureKey = `${category}:${action}${label ? ':' + label : ''}`;
  stats.featureUsage[featureKey] = (stats.featureUsage[featureKey] || 0) + 1;
  saveLocalStats(stats);
};

// Obtenir les statistiques d'utilisation
export const getUsageStatistics = () => {
  return getLocalStats();
};

// Exporter les statistiques (pour sauvegarder ou partager)
export const exportStatistics = () => {
  const stats = getLocalStats();
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

// Track user interactions with specific features
export const trackFeatureUsage = {
  mapLocation: (locationId: string) => {
    trackEvent('Map', 'View Location', locationId);
  },
  eventView: (eventId: string, eventTitle: string) => {
    trackEvent('Program', 'View Event', eventTitle, 1);
  },
  donationClick: () => {
    trackEvent('Donation', 'Click Donate Button');
  },
  shareContent: (platform: string, contentType: string) => {
    trackEvent('Share', 'Share Content', `${contentType} via ${platform}`);
  },
  userLocation: () => {
    trackEvent('Map', 'Use Location Feature');
  },
  // Navigation avancée
  useAdvancedNavigation: (enabled: boolean) => {
    trackEvent('Navigation', 'Toggle Advanced Navigation', enabled ? 'Enabled' : 'Disabled');
  },
  navigationCompleted: (params: { distance: number, duration: number, type: 'simple' | 'advanced' }) => {
    trackEvent('Navigation', 'Navigation Completed', params.type, Math.round(params.distance));
  },
  // Nouvelles fonctions de tracking
  save_event: (params: { eventId: string, eventName: string }) => {
    trackEvent('Events', 'Save Event', params.eventName);
  },
  unsave_event: (params: { eventId: string, eventName: string }) => {
    trackEvent('Events', 'Unsave Event', params.eventName);
  },
  contribute_from_event: (params: { eventId: string, eventName: string }) => {
    trackEvent('Community', 'Contribute From Event', params.eventName);
  },
  contribute_from_location: (params: { locationId: string, locationName: string }) => {
    trackEvent('Community', 'Contribute From Location', params.locationName);
  },
  // Tracking de l'onboarding
  onboardingStart: () => {
    trackEvent('Onboarding', 'Start');
  },
  onboardingComplete: () => {
    trackEvent('Onboarding', 'Complete');
  },
  onboardingSkip: () => {
    trackEvent('Onboarding', 'Skip');
  },
  onboardingSlideView: (slideIndex: number, slideTitle: string) => {
    trackEvent('Onboarding', 'View Slide', `${slideIndex}: ${slideTitle}`);
  },
  // Tracking des interactions de swipe
  swipeInteraction: (direction: 'left' | 'right', source: string, success: boolean) => {
    trackEvent('Interaction', 'Swipe', `${direction} on ${source}`, success ? 1 : 0);
  },
  videoInteraction: (action: 'play' | 'pause' | 'complete', videoId: string) => {
    trackEvent('Media', 'Video', `${action}: ${videoId}`);
  }
};
