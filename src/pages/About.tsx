
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aboutInfo } from "@/data/about";
import { associationInfo } from "@/data/association";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold ml-2">À propos</h1>
        </header>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Notre histoire</h2>
          <p className="text-gray-700 mb-4">
            {aboutInfo.history}
          </p>
          
          <h2 className="text-lg font-semibold mb-3">Notre mission</h2>
          <p className="text-gray-700 mb-4">
            {aboutInfo.mission}
          </p>
          
          <h2 className="text-lg font-semibold mb-3">Notre quartier</h2>
          <p className="text-gray-700">
            {aboutInfo.neighborhood}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Événement annuel</h2>
          <p className="text-gray-700 mb-4">
            {aboutInfo.event}
          </p>
          
          <div className="text-sm text-gray-600 mt-4">
            <p>Association : {associationInfo.name}</p>
            <p>Fondée en {associationInfo.yearFounded}</p>
            <p>Contact : {associationInfo.contactEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
