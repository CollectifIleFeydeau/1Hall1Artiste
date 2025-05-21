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
import { PageTransition } from "./components/PageTransition";
import { SwipeNavigation } from "./components/SwipeNavigation";

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
  
  // Routes qui supportent la navigation par gestes
  const swipeableRoutes = [
    '/',
    '/map',
    '/program',
    '/saved',
    '/about',
    '/donate'
  ];
  
  // Vérifier si la page actuelle supporte la navigation par gestes
  const isSwipeablePage = swipeableRoutes.includes(location.pathname);
  
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
        <Route path="/map" element={
          isSwipeablePage ? (
            <SwipeNavigation>
              <Map />
            </SwipeNavigation>
          ) : (
            <PageTransition>
              <Map />
            </PageTransition>
          )
        } />
        
        <Route path="/program" element={
          isSwipeablePage ? (
            <SwipeNavigation>
              <Program />
            </SwipeNavigation>
          ) : (
            <PageTransition>
              <Program />
            </PageTransition>
          )
        } />
        
        <Route path="/saved" element={
          isSwipeablePage ? (
            <SwipeNavigation>
              <SavedEvents />
            </SwipeNavigation>
          ) : (
            <PageTransition>
              <SavedEvents />
            </PageTransition>
          )
        } />
        
        <Route path="/about" element={
          isSwipeablePage ? (
            <SwipeNavigation>
              <About />
            </SwipeNavigation>
          ) : (
            <PageTransition>
              <About />
            </PageTransition>
          )
        } />
        
        <Route path="/donate" element={
          isSwipeablePage ? (
            <SwipeNavigation>
              <Donate />
            </SwipeNavigation>
          ) : (
            <PageTransition>
              <Donate />
            </PageTransition>
          )
        } />
        
        {/* Routes sans navigation par gestes */}
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
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
            <NavigationProvider>
              <AppContent />
            </NavigationProvider>
          </HashRouter>
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

export default App;
