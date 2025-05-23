import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
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
  
  // État pour suivre si l'utilisateur a déjà vu l'onboarding - toujours considérer comme vu
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(true);
  
  // Marquer automatiquement l'onboarding comme vu
  useEffect(() => {
    localStorage.setItem('hasSeenOnboarding', 'true');
  }, []);
  
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

const App = () => {
  // Register service worker for offline support
  useEffect(() => {
    registerServiceWorker();
  }, []);

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
            </NavigationProvider>
          </HashRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

export default App;
