import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { createLogger } from "@/utils/logger";
import { trackEvent } from "@/services/analyticsService";

// Créer un logger pour la page d'analyse
const logger = createLogger('AnalyticsPage');

export default function Analytics() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Suivre la visite de la page d'analyse
    trackEvent('page_view', { page: 'analytics' });
    logger.info("Page d'analyse visitée");
  }, []);
  
  return (
    <div className="container mx-auto px-4 pb-20 pt-4">
      <header className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-center flex-1 mr-8">Analyse et Suivi</h1>
        <div className="w-8"></div>
      </header>
      
      <AnalyticsDashboard />
    </div>
  );
}
