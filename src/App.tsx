import React, { useEffect, useState } from "react";
import { initEmailJS, checkAndSendErrors } from "./services/errorTracking";
import { setupGlobalErrorHandler } from "./services/errorTracking";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import Celebration from "./components/Celebration";
import { AchievementType, getAchievementCelebrationMessage } from "./services/achievements";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { HashRouter } from "react-router-dom/dist/index";
import { AnimatePresence } from "framer-motion";

// Contextes
import { NavigationProvider } from "./contexts/NavigationContext";
import { LoadingProvider } from "./contexts/LoadingContext";

// Composants
import { AnimatedPageTransition, isSwipeableRoute } from "./components/AnimatedPageTransition";
import OfflineIndicator from "./components/OfflineIndicator";

// Utilitaires
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";

// Pages
import Map from "./pages/Map";
import Program from "./pages/Program";
import About from "./pages/About";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SavedEvents from "./pages/SavedEvents";
import Onboarding from "./pages/Onboarding";
import { LocationHistory } from "./pages/LocationHistory";

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
const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // État pour suivre si l'utilisateur a déjà vu l'onboarding
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    const storedValue = localStorage.getItem('hasSeenOnboarding');
    return storedValue === 'true';
  });
  
  // Vérifier si c'est la première visite
  useEffect(() => {
    // Si c'est la première visite et que l'utilisateur n'est pas déjà sur la page d'onboarding
    if (!hasSeenOnboarding && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [hasSeenOnboarding, location.pathname, navigate]);
  
  // Marquer l'onboarding comme vu
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    navigate('/map');
  };
  
  // Configuration des routes principales
  const mainRoutes: RouteConfig[] = [
    { path: '/map', component: Map, swipeable: true },
    { path: '/program', component: Program, swipeable: true },
    { path: '/saved', component: SavedEvents, swipeable: true },
    { path: '/about', component: About, swipeable: true },
    { path: '/donate', component: Donate, swipeable: true },
  ];
  
  // Configuration des routes secondaires
  const secondaryRoutes: RouteConfig[] = [
    { path: '/admin', component: Admin },
    { path: '/onboarding', component: Onboarding },
    { path: '/location-history', component: LocationHistory },
  ];
  
  // Vérifier si la page actuelle supporte la navigation par gestes
  const isSwipeablePage = isSwipeableRoute(location.pathname);
  
  // Fonction pour rendre une route avec le bon wrapper
  const renderRouteElement = (Component: React.ComponentType, enableSwipe: boolean = false): React.ReactElement => (
    <AnimatedPageTransition enableSwipe={enableSwipe}>
      <Component />
    </AnimatedPageTransition>
  );
  
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

const AppContent = () => {
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

const App = () => {
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

    // Ajouter les écouteurs d'événements
    console.log('[App] Ajout de l\'écouteur pour l\'événement interne "achievement"');
    achievementEvent.addEventListener('achievement', handleInternalAchievement);
    
    console.log('[App] Ajout de l\'écouteur pour l\'événement global "app-achievement"');
    window.addEventListener('app-achievement', handleGlobalAchievement);

    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      console.log('[App] Nettoyage des écouteurs d\'événements');
      achievementEvent.removeEventListener('achievement', handleInternalAchievement);
      window.removeEventListener('app-achievement', handleGlobalAchievement);
    };
  }, []);

  // Register service worker and initialize error reporting
  useEffect(() => {
    // Initialiser le service worker
    registerServiceWorker();
    
    // Initialiser le suivi des erreurs
    setupGlobalErrorHandler();
    initEmailJS();
    
    // Vérifier et envoyer les erreurs toutes les 30 minutes
    const errorCheckInterval = setInterval(() => {
      checkAndSendErrors();
    }, 30 * 60 * 1000);
    
    // Vérifier les erreurs lors de la fermeture de l'application
    window.addEventListener('beforeunload', () => {
      checkAndSendErrors();
    });
    
    // Nettoyer les intervalles lors du démontage
    return () => {
      clearInterval(errorCheckInterval);
    };
  }, []);

  // Fonction pour réinitialiser l'onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    console.log('[App] Onboarding réinitialisé, rechargement de la page...');
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
              {/* Composant de célébration pour les achievements */}
              <Celebration 
                trigger={celebration.show} 
                message={celebration.message} 
                duration={5000}
                onComplete={() => setCelebration({ show: false, message: '' })}
              />
              
              {/* Boutons temporaires pour les tests */}
              <div className="fixed bottom-20 right-4 z-50 flex flex-col space-y-2">
                <button
                  onClick={resetOnboarding}
                  className="bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg text-sm flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Tester Onboarding</span>
                </button>
                

                
                <button
                  onClick={clearLocalStorage}
                  className="bg-red-600 text-white px-3 py-2 rounded-full shadow-lg text-sm flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Vider localStorage</span>
                </button>
              </div>
            </NavigationProvider>
          </HashRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

export default App;
