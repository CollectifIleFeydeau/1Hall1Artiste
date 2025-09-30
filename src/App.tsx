import React, { useEffect, useState, useRef } from "react";
import { initEmailJS, checkAndSendErrors, setupGlobalErrorHandler } from "./services/errorTracking";
import { initFirebaseAnalytics } from "./services/firebaseConfig";
import { analytics, EventAction } from "./services/firebaseAnalytics";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Celebration } from "./components/Celebration";
import { AchievementType, getAchievementCelebrationMessage } from "./services/achievements";
import { AudioPlayer } from "./components/AudioPlayer";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { HashRouter } from "react-router-dom/dist/index";
import { AnimatePresence } from "framer-motion";

// Contextes
import { NavigationProvider } from "./contexts/NavigationContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ErrorBoundary } from "react-error-boundary";

// Composants
import { AnimatedPageTransition, isSwipeableRoute } from "./components/AnimatedPageTransition";
import OfflineIndicator from "./components/OfflineIndicator";

// Utilitaires
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { preloadAllOfflineData } from "./services/offlineService";

// Pages
import Map from "./pages/Map";
import Program from "./pages/Program";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Admin from "./pages/Admin";
import SavedEvents from "./pages/SavedEvents";
import { LocationHistory } from "@/pages/LocationHistory";
import Analytics from "./pages/Analytics";
import Gallery from "./pages/Gallery";
import AnalyticsDebugger from "./debug/AnalyticsDebugger";
import About from "./pages/About";
import CoordinatesPicker from "./pages/CoordinatesPicker";

const queryClient = new QueryClient();

// Type définition pour la configuration des routes
interface RouteConfig {
  path: string;
  component: React.ComponentType;
  swipeable?: boolean;
}

/**
 * Composant qui gère les transitions entre les routes
 */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef<string>(location.pathname);
  
  // Vérifier si le splash screen a déjà été vu
  const hasSeenSplash = () => {
    try {
      return localStorage.getItem('hasSeenSplash') === 'true';
    } catch {
      return false;
    }
  };

  // État pour l'écran d'accueil
  const [showSplash, setShowSplash] = useState<boolean>(!hasSeenSplash());
  
  // Gérer la fin de l'écran d'accueil
  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      localStorage.setItem('hasSeenSplash', 'true');
    } catch (error) {
      console.warn('[App] Could not save splash screen state:', error);
    }
    // Rester sur la page actuelle au lieu de rediriger vers /map
    // Si on est sur la racine, aller vers /map
    if (location.pathname === '/') {
      navigate('/map', { replace: true });
    }
  };
  

  // Sauvegarder la dernière page visitée (sauf admin et pages techniques)
  useEffect(() => {
    const excludedPaths = ['/admin', '/coordinates', '/analytics', '/location-history'];
    if (location.pathname !== '/' && !showSplash && !excludedPaths.includes(location.pathname)) {
      try {
        localStorage.setItem('lastVisitedPath', location.pathname);
      } catch (error) {
        console.warn('[App] Could not save last visited path:', error);
      }
    }
  }, [location.pathname, showSplash]);

  // Track route changes for analytics
  useEffect(() => {
    const previousPath = prevPathRef.current;
    const currentPath = location.pathname;
    if (previousPath !== currentPath) {
      analytics.trackRouteChange(previousPath, currentPath);
      prevPathRef.current = currentPath;
    }
  }, [location.pathname]);
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  
  
  // Configuration des routes principales
  const mainRoutes: RouteConfig[] = [
    { path: '/map', component: Map, swipeable: false },
    // Route de débogage pour Firebase Analytics (uniquement en dev)
    { path: '/debug-analytics', component: AnalyticsDebugger },
    { path: '/program', component: Program, swipeable: false },
    { path: '/saved', component: SavedEvents, swipeable: false },
    { path: '/community', component: Gallery, swipeable: false },
    { path: '/about', component: About, swipeable: false },
    { path: '/donate', component: Donate, swipeable: false },
  ];
  
  // Configuration des routes secondaires
  const secondaryRoutes: RouteConfig[] = [
    { path: '/admin', component: Admin },
    { path: '/coordinates', component: CoordinatesPicker },
    { path: '/location-history', component: LocationHistory },
    { path: '/analytics', component: Analytics },
  ];
  
  // Vérifier si la page actuelle supporte la navigation par gestes
  const isSwipeablePage = isSwipeableRoute(location.pathname);
  
  // Fonction pour rendre une route avec le bon wrapper
  const renderRouteElement = (Component: React.ComponentType, enableSwipe: boolean = false): React.ReactElement => (
    <AnimatedPageTransition enableSwipe={enableSwipe}>
      <Component />
    </AnimatedPageTransition>
  );
  
  // Si l'écran d'accueil est actif, le montrer au lieu des routes
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete} 
      />
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rediriger vers la dernière page visitée ou la carte */}
        <Route path="/" element={<Navigate to={(() => {
          try {
            const lastPath = localStorage.getItem('lastVisitedPath');
            return lastPath || '/map';
          } catch {
            return '/map';
          }
        })()} replace />} />
        
        {/* Rediriger l'ancienne page galleries vers la galerie unifiée */}
        <Route path="/galleries" element={<Navigate to="/community" replace />} />

        {/* Routes principales avec navigation par gestes */}
        {mainRoutes.map(route => (
          <Route 
            key={route.path}
            path={route.path} 
            element={renderRouteElement(route.component, isSwipeablePage && route.swipeable)}
          />
        ))}
        
        {/* Routes secondaires sans navigation par gestes */}
        {secondaryRoutes.map(route => (
          <Route 
            key={route.path}
            path={route.path} 
            element={renderRouteElement(route.component)}
          />
        ))}
        
        {/* Route 404 */}
        <Route path="*" element={renderRouteElement(NotFound)} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  return <AnimatedRoutes />;
};

// Créer un événement personnalisé pour les achievements
export const achievementEvent = new EventTarget();

// Type pour l'événement d'achievement
export interface AchievementEventDetail {
  type: AchievementType;
  message: string;
}

// Fonction pour déclencher un événement d'achievement
export const triggerAchievementEvent = (type: AchievementType) => {
  const message = getAchievementCelebrationMessage(type);
  if (message) {
    const event = new CustomEvent<AchievementEventDetail>('achievement', {
      detail: { type, message }
    });
    achievementEvent.dispatchEvent(event);
  }
};

const App: React.FC = () => {
  // État pour les célébrations
  const [celebration, setCelebration] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: '' });

  // Écouter les événements d'achievement
  useEffect(() => {
    console.log('[App] Initialisation des écouteurs d\'événements d\'achievement');
    
    // Gestionnaire pour l'événement interne
    const handleInternalAchievement = (event: Event) => {
      const customEvent = event as CustomEvent<AchievementEventDetail>;
      console.log('[App] Événement interne achievement reçu:', customEvent.detail);
      
      setCelebration({
        show: true,
        message: customEvent.detail.message
      });
      console.log('[App] Célébration activée avec le message:', customEvent.detail.message);
    };

    // Gestionnaire pour l'événement global
    const handleGlobalAchievement = (event: Event) => {
      const customEvent = event as CustomEvent<AchievementEventDetail>;
      console.log('[App] Événement global app-achievement reçu:', customEvent.detail);
      
      setCelebration({
        show: true,
        message: customEvent.detail.message
      });
      console.log('[App] Célébration activée avec le message:', customEvent.detail.message);
    };

    // Ajouter les écouteurs
    console.log('[App] Ajout de l\'écouteur pour l\'événement interne "achievement"');
    achievementEvent.addEventListener('achievement', handleInternalAchievement);
    
    console.log('[App] Ajout de l\'écouteur pour l\'événement global "app-achievement"');
    window.addEventListener('app-achievement', handleGlobalAchievement);


    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      console.log('[App] Nettoyage des écouteurs d\'événements');
      try {
        achievementEvent.removeEventListener('achievement', handleInternalAchievement);
        window.removeEventListener('app-achievement', handleGlobalAchievement);
      } catch (error) {
        console.warn('[App] Error cleaning up event listeners:', error);
      }
    };
  }, []);

  // Register service worker and initialize error reporting
  useEffect(() => {
    // Afficher la base URL détectée
    console.log('[App] Base URL détectée:', (window as any).APP_CONFIG?.BASE_URL || '/');
    
    // Initialiser le service worker
    registerServiceWorker();
    
    // Initialiser le suivi des erreurs
    setupGlobalErrorHandler();
    initEmailJS();
    
    // Initialiser Firebase Analytics (nouveau système)
    initFirebaseAnalytics();
    console.log('[App] Firebase Analytics initialisé');
    
    // Démarrer une nouvelle session analytics
    analytics.startSession();
    
    // Suivre l'événement de démarrage de l'application (Firebase)
    analytics.trackFeatureUse('app_start', {
      timestamp: new Date().toISOString(),
      referrer: document.referrer || 'direct'
    });
    
    // Vérifier et envoyer les erreurs toutes les 30 minutes
    // Synchroniser également les données d'analyse
    const errorCheckInterval = setInterval(() => {
      checkAndSendErrors();
    }, 30 * 60 * 1000);
    
    // Vérifier et envoyer les erreurs stockées
    checkAndSendErrors();
    
    // Configurer le gestionnaire d'erreurs global
    setupGlobalErrorHandler();
    
    // Enregistrer le service worker pour le mode hors ligne
    registerServiceWorker();
    
    // Précharger les données hors ligne
    preloadAllOfflineData();
    
    // Nettoyer la session analytics à la fermeture
    return () => {
      analytics.endSession();
    };
  }, []);

  // First-load performance metrics
  useEffect(() => {
    try {
      // Load time (Navigation Timing)
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];
        const loadTime = nav.loadEventEnd - nav.startTime;
        if (isFinite(loadTime) && loadTime >= 0) {
          analytics.trackPerformance(EventAction.LOAD_TIME, Math.round(loadTime));
        }
      } else if ((performance as any).timing) {
        const t = (performance as any).timing as PerformanceTiming;
        const loadTime = t.loadEventEnd - t.navigationStart;
        if (isFinite(loadTime) && loadTime >= 0) {
          analytics.trackPerformance(EventAction.LOAD_TIME, Math.round(loadTime));
        }
      }

      // FP & FCP
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const name = (entry as any).name;
            if (name === 'first-paint') {
              analytics.trackPerformance(EventAction.FIRST_PAINT, Math.round(entry.startTime));
            } else if (name === 'first-contentful-paint') {
              analytics.trackPerformance(EventAction.FIRST_CONTENTFUL_PAINT, Math.round(entry.startTime));
            }
          }
        });
        try {
          paintObserver.observe({ type: 'paint', buffered: true } as PerformanceObserverInit);
        } catch (_) { /* noop */ }

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEventTiming[]) {
            const fid = entry.processingStart - entry.startTime;
            if (isFinite(fid) && fid >= 0) {
              analytics.trackPerformance(EventAction.FIRST_INPUT_DELAY, Math.round(fid), {
                name: entry.name,
                duration: Math.round(entry.duration)
              });
            }
          }
        });
        try {
          fidObserver.observe({ type: 'first-input', buffered: true } as PerformanceObserverInit);
        } catch (_) { /* noop */ }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[Perf] metrics collection failed', err);
      }
    }
  }, []);

  
  // Fonction pour tester les confettis
  const testConfetti = () => {
    console.log('[App] Test manuel des confettis');
    setCelebration({
      show: true,
      message: 'Test des confettis!'
    });
  };
  
  // Fonction pour tester les achievements
  const testAchievement = (type: AchievementType) => {
    console.log(`[App] Test manuel de l'achievement ${type}`);
    // Déclencher directement l'événement global
    const message = getAchievementCelebrationMessage(type);
    if (message) {
      const event = new CustomEvent('app-achievement', {
        detail: { type, message }
      });
      window.dispatchEvent(event);
    }
  };
  
  // Fonction pour vider le localStorage
  const clearLocalStorage = () => {
    console.log('[App] Nettoyage du localStorage...');
    localStorage.clear();
    toast({
      title: "LocalStorage vidé",
      description: "Toutes les données locales ont été effacées.",
      variant: "destructive"
    });
    setTimeout(() => {
      try {
        if (window.location && window.location.reload) {
          window.location.reload();
        } else {
          window.location.href = window.location.origin + window.location.pathname;
        }
      } catch (error) {
        console.error('[App] Error reloading page:', error);
      }
    }, 1500);
  };

  // Aucun code de gestion de localisation n'est nécessaire ici
  // La gestion de la localisation est maintenant gérée directement dans le composant AudioActivator
  
  // Déterminer le chemin audio en fonction de l'environnement
  const audioPath = window.location.hostname.includes('github.io')
    ? '/1Hall1Artiste/audio/Port-marchand.mp3'
    : '/audio/Port-marchand.mp3';
    
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <HashRouter>
              <NavigationProvider>
                <AppContent />
                <OfflineIndicator />
                {celebration.show && (
                  <Celebration 
                    trigger={celebration.show} 
                    message={celebration.message} 
                    duration={5000}
                    onComplete={() => setCelebration({ show: false, message: '' })}
                  />
                )}
              </NavigationProvider>
            </HashRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

export default App;

