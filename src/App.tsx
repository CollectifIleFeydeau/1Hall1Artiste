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
import About from "./pages/About";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import Admin from "./pages/Admin";
import SavedEvents from "./pages/SavedEvents";
import Onboarding from "./pages/Onboarding";
import { LocationHistory } from "./pages/LocationHistory";
import Analytics from "./pages/Analytics";
import CommunityGallery from "./pages/CommunityGallery";
import HistoricalGallery from "./pages/HistoricalGallery";
import Galleries from "./pages/Galleries";
import AnalyticsDebugger from "./debug/AnalyticsDebugger";

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
  
  // État pour suivre si l'utilisateur a déjà vu l'onboarding
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('hasSeenOnboarding');
    return storedValue === 'true';
  });
  
  // Surveiller les changements du localStorage pour hasSeenOnboarding
  useEffect(() => {
    console.log('[App] Initialisation des écouteurs d\'événements d\'onboarding');
    
    // Fonction pour vérifier les changements du localStorage
    const handleStorageChange = () => {
      const storedValue = localStorage.getItem('hasSeenOnboarding');
      const newValue = storedValue === 'true';
      
      // Early return si la valeur n'a pas changé pour éviter des re-renders inutiles
      if (newValue !== hasSeenOnboarding) {
        console.log('[App] Mise à jour de hasSeenOnboarding depuis localStorage:', newValue);
        setHasSeenOnboarding(newValue);
      }
    };

    // Écouter les changements du localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier aussi périodiquement avec une fréquence réduite (500ms au lieu de 100ms)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [hasSeenOnboarding]);

  // État pour l'écran d'accueil
  const [showSplash, setShowSplash] = useState<boolean>(true);
  
  // Gérer la fin de l'écran d'accueil
  const handleSplashComplete = () => {
    setShowSplash(false);
    // Si c'est la première visite, aller à l'onboarding
    if (!hasSeenOnboarding) {
      navigate('/onboarding');
    }
    // Sinon, rester sur la page actuelle (ne pas forcer la redirection vers /map)
  };
  
  // Vérifier si c'est la première visite
  useEffect(() => {
    console.log('[App] useEffect navigation - État actuel:', {
      showSplash,
      hasSeenOnboarding,
      pathname: location.pathname
    });
    
    // Ne rien faire si l'écran d'accueil est encore affiché
    if (showSplash) {
      console.log('[App] Écran d\'accueil encore affiché, aucune action');
      return;
    }
    
    // Si c'est la première visite et que l'utilisateur n'est pas déjà sur la page d'onboarding
    if (!hasSeenOnboarding && location.pathname !== '/onboarding') {
      console.log('[App] Redirection vers onboarding depuis:', location.pathname);
      navigate('/onboarding');
    } else if (hasSeenOnboarding && location.pathname === '/onboarding') {
      console.log('[App] Onboarding terminé, redirection vers /map');
      navigate('/map');
    } else {
      console.log('[App] Aucune action de navigation nécessaire');
    }
  }, [hasSeenOnboarding, location.pathname, navigate, showSplash]);

  // Track route changes for analytics
  useEffect(() => {
    const previousPath = prevPathRef.current;
    const currentPath = location.pathname;
    if (previousPath !== currentPath) {
      analytics.trackRouteChange(previousPath, currentPath);
      prevPathRef.current = currentPath;
    }
  }, [location.pathname]);
  
  // Marquer l'onboarding comme vu
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    navigate('/map');
  };
  
  // Configuration des routes principales
  const mainRoutes: RouteConfig[] = [
    { path: '/map', component: Map, swipeable: true },
    // Route de débogage pour Firebase Analytics (uniquement en dev)
    { path: '/debug-analytics', component: AnalyticsDebugger },
    { path: '/program', component: Program, swipeable: true },
    { path: '/saved', component: SavedEvents, swipeable: true },
    { path: '/community', component: CommunityGallery, swipeable: true },
    { path: '/galleries', component: Galleries, swipeable: false },
    { path: '/historical', component: HistoricalGallery, swipeable: false },
    { path: '/about', component: About, swipeable: true },
    { path: '/donate', component: Donate, swipeable: true },
  ];
  
  // Configuration des routes secondaires
  const secondaryRoutes: RouteConfig[] = [
    { path: '/admin', component: Admin },
    { path: '/onboarding', component: Onboarding },
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
        isFirstVisit={!hasSeenOnboarding} 
      />
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rediriger vers l'onboarding lors de la première visite, sinon vers la carte */}
        <Route path="/" element={
          hasSeenOnboarding ? (
            <Navigate to="/map" replace />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        } />
        

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

    // Fonction de test globale pour réinitialiser l'onboarding
    (window as any).resetOnboardingTest = () => {
      console.log('[App] [TEST] Réinitialisation de l\'onboarding...');
      localStorage.removeItem('hasSeenOnboarding');
      window.location.reload();
    };

    console.log('[App] [TEST] Fonction resetOnboardingTest() disponible dans la console');

    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      console.log('[App] Nettoyage des écouteurs d\'événements');
      achievementEvent.removeEventListener('achievement', handleInternalAchievement);
      window.removeEventListener('app-achievement', handleGlobalAchievement);
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

  // Fonction pour réinitialiser l'onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    console.log('[App] Onboarding réinitialisé, rechargement de la page...');
    // Forcer l'affichage de l'écran d'accueil avant l'onboarding
    window.location.reload();
  };
  
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
    setTimeout(() => window.location.reload(), 1500);
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
