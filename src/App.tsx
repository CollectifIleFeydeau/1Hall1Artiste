import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HashRouter } from "react-router-dom/dist/index";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useEffect, useState } from "react";
import { initGA, trackPageView } from "./services/analytics";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { cacheManager } from "@/utils/cacheManager";
import Index from "./pages/Index";
import Map from "./pages/Map";
import Program from "./pages/Program";
import About from "./pages/About";
import Team from "./pages/Team";
import Support from "./pages/Support";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SavedEvents from "./pages/SavedEvents";
import Onboarding from "./pages/Onboarding";
import { LocationHistory } from "./pages/LocationHistory";
// import { NotificationsProvider } from "./components/NotificationsProvider";

const queryClient = new QueryClient();

// Animated routes component with location-based transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Get map-first experience preference from localStorage
  const [mapFirstExperience, setMapFirstExperience] = useState<boolean>(() => {
    const saved = localStorage.getItem('mapFirstExperience');
    return saved ? JSON.parse(saved) : true; // Par défaut, utiliser la carte comme page d'accueil
  });
  
  // Initialize Google Analytics when the app loads
  useEffect(() => {
    initGA();
    
    // Nettoyer le cache périodiquement (toutes les 5 minutes)
    const cacheCleanupInterval = setInterval(() => {
      cacheManager.cleanup();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(cacheCleanupInterval);
    };
  }, []);
  
  // Track page views when the route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  
  // Vérifier si l'utilisateur a déjà vu l'onboarding
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rediriger vers l'onboarding lors de la première visite, sinon vers la carte */}
        <Route path="/" element={
          !hasSeenOnboarding 
            ? <Navigate to="/onboarding" replace /> 
            : <Navigate to="/map" replace />
        } />
        <Route path="/map" element={<PageTransition><Map fullScreen={true} /></PageTransition>} />
        <Route path="/program" element={<PageTransition><Program /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/saved-events" element={<PageTransition><SavedEvents /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        {/* Team and Support pages are now integrated into the About page */}
        <Route path="/donate" element={<PageTransition><Donate /></PageTransition>} />
        <Route path="/location-history" element={<PageTransition><LocationHistory /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  return <AnimatedRoutes />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppContent />
          </HashRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

export default App;
