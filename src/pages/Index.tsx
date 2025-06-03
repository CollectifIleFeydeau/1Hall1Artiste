
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { useNavigate } from "react-router-dom";
import AssociationIntro from "@/components/AssociationIntro";

const Index = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
    setTimeout(() => navigate("/map"), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      {showWelcome ? (
        <div className="flex flex-col items-center justify-center min-h-[90vh] animate-fade-in">
          <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Bienvenue</CardTitle>
              <CardDescription className="text-center">
                Découvrez notre quartier historique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssociationIntro />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                onClick={handleGetStarted}
              >
                Commencer la visite <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="animate-fade-out">
          <div className="h-[90vh] flex items-center justify-center">
            <div className="animate-pulse">Chargement...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
