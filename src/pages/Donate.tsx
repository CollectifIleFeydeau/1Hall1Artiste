import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { trackFeatureUsage } from "../services/analytics";
import X from "lucide-react/dist/esm/icons/x";
import { useNavigate } from "react-router-dom";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";

const Donate = () => {
  const navigate = useNavigate();
  
  // HelloAsso URL without tracking parameters
  const helloAssoUrl = "https://www.helloasso.com/associations/collectif-feydeau/formulaires/1";
  
  // Open HelloAsso in a new tab
  const openHelloAsso = () => {
    // Track donation button click
    trackFeatureUsage.donationClick();
    window.open(helloAssoUrl, "_blank");
  };

  return (
    <div className="min-h-screen app-gradient pb-20 px-4 pt-4 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto">
        <header className="mb-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#ff7a45]">Faire un don</h1>
          <ShareButton 
            title="Faire un don au Collectif Île Feydeau" 
            text="Soutenez les actions du Collectif Île Feydeau pour la préservation du patrimoine nantais!" 
          />
        </header>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Heart className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Soutenez notre association</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Pourquoi faire un don ?</h3>
                <ul className="text-sm space-y-2">
                  <li>• Organisation d'événements culturels</li>
                  <li>• Création de contenus pédagogiques</li>
                  <li>• Développement de projets communautaires</li>
                  <li>• 66% de votre don est déductible de votre impôt sur le revenu</li>
                </ul>
              </div>
              
              <Button 
                className="w-full py-6 text-lg btn-animate btn-pulse" 
                onClick={openHelloAsso}
              >
                <Heart className="h-5 w-5 mr-2" fill="white" />
                Faire un don via HelloAsso
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-2">
                Vous serez redirigé vers notre page HelloAsso pour finaliser votre don en toute sécurité.
              </p>
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
      
      {/* No embedded iframe - using direct link approach instead */}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Donate;
