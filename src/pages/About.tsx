
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
            Notre association est née de la volonté commune des habitants de ce quartier historique de Nantes, 
            situé sur ce qui était autrefois une île. Fondée en 2010, elle regroupe 20 passionnés 
            déterminés à préserver et partager le patrimoine unique de ce lieu.
          </p>
          
          <h2 className="text-lg font-semibold mb-3">Notre mission</h2>
          <p className="text-gray-700 mb-4">
            Nous œuvrons pour la préservation de notre patrimoine architectural et culturel, tout en favorisant 
            l'accès à l'art et à la culture pour tous. Chaque année, le troisième week-end de septembre, 
            nous ouvrons nos portes au public pour partager ce lieu exceptionnel à travers des expositions et concerts.
          </p>
          
          <h2 className="text-lg font-semibold mb-3">Notre quartier</h2>
          <p className="text-gray-700">
            Situé au cœur de Nantes, notre quartier était autrefois une île entourée par les bras de la Loire. 
            Au fil des siècles, l'urbanisation a transformé le paysage, mais nous conservons précieusement 
            l'héritage architectural et l'esprit communautaire qui caractérisent ce lieu si particulier.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Événement annuel</h2>
          <p className="text-gray-700 mb-4">
            Notre événement annuel transforme le quartier en une galerie d'art vivante où les visiteurs 
            peuvent découvrir des expositions dans les halls historiques et profiter de concerts dans 
            notre cour intérieure. C'est l'occasion de rencontrer des artistes locaux et de vivre 
            une expérience culturelle unique dans un cadre exceptionnel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
