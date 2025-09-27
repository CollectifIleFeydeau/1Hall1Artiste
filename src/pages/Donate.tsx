import { IMAGE_PATHS } from '../constants/paths';
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useEffect } from "react";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

const Donate = () => {
  const navigate = useNavigate();
  
  // Track donation page view and open
  useEffect(() => {
    analytics.trackPageView("/donate", "Faire un don");
    analytics.trackDonationPageOpen("app");
  }, []);

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 overflow-x-hidden" style={{
      backgroundImage: `url('/images/background/small/Historical_Parchment_Background_Portrait.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-white/20" />
      
      <div className="relative z-10 max-w-screen-lg mx-auto">
        <header className="mb-2 flex items-center justify-between">
          <BackButton onClick={() => { analytics.trackDonationInteraction(EventAction.DONATION_CANCEL, { method: "helloasso", reason: "back_click" }); navigate("/map"); }} />
          <h1 className="text-xl font-bold text-[#ff7a45]">Faire un don</h1>
          <ShareButton 
            title="Faire un don au Collectif Île Feydeau" 
            text="Soutenez les actions du Collectif Île Feydeau pour la préservation du patrimoine nantais!" 
          />
        </header>
        
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 shadow-lg mb-6">
          <CardContent className="p-6">
            {/*
            <div className="flex flex-col items-center text-center mb-6">
              <Heart className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Soutenez notre association</h2>
            </div>
            */}
            
            <div className="space-y-4">
              {/*
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Pourquoi faire un don ?</h3>
                <ul className="text-sm space-y-2">
                  <li>• Organisation d'événements culturels</li>
                  <li>• Création de contenus pédagogiques</li>
                  <li>• Développement de projets communautaires</li>
                  <li>• 66% de votre don est déductible de votre impôt sur le revenu</li>
                </ul>
              </div>
              */}

              {/* Intégration HelloAsso - widget intégré */}
              <iframe
                id="haWidget"
                title="Formulaire de don HelloAsso"
                scrolling="auto"
                src="https://www.helloasso.com/associations/collectif-feydeau/formulaires/1/widget"
                style={{ width: "100%", height: "750px", border: "none" }}
                // Track widget load as a donation_start signal
                onLoad={() => analytics.trackDonationInteraction(EventAction.DONATION_START, { method: "helloasso", widget_loaded: true })}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-600">
          <p>Pour toute question concernant les dons, contactez-nous à :</p>
          <p className="font-medium">
            <a href="mailto:collectif.ile.feydeau@gmail.com" className="text-blue-600 hover:underline">
              collectif.ile.feydeau@gmail.com
            </a>
          </p>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Donate;



