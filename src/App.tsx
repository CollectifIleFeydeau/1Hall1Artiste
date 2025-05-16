
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useEffect } from "react";
import { initGA, trackPageView } from "./services/analytics";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Program from "./pages/Program";
import About from "./pages/About";
import Team from "./pages/Team";
import Support from "./pages/Support";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Animated routes component with location-based transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Initialize Google Analytics when the app loads
  useEffect(() => {
    initGA();
  }, []);
  
  // Track page views when the route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/map" element={<PageTransition><Map /></PageTransition>} />
        <Route path="/program" element={<PageTransition><Program /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        {/* Team and Support pages are now integrated into the About page */}
        <Route path="/donate" element={<PageTransition><Donate /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
