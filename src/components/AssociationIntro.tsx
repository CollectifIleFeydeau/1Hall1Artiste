
import { Card } from "@/components/ui/card";
import { associationInfo } from "@/data/association";

const AssociationIntro = () => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{associationInfo.shortName}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-600">
          Bienvenue sur l'application officielle de notre association.
        </p>
        <p className="text-sm text-gray-600">
          Nous sommes {associationInfo.memberCount} habitants qui ouvrons les portes de notre quartier 
          historique situé sur une ancienne île à Nantes.
        </p>
        <p className="text-sm text-gray-600">
          Découvrez nos expositions et concerts lors du {associationInfo.eventWeekend}.
        </p>
      </div>
    </div>
  );
};

export default AssociationIntro;

