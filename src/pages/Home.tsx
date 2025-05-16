
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Info } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto pt-8 pb-20">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Notre Association</h1>
          <p className="text-sm text-gray-600">Découvrez notre quartier historique à Nantes</p>
        </header>
        
        <div className="grid gap-4">
          <Card className="hover:shadow-md transition-all" onClick={() => navigate("/map")}>
            <CardContent className="p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Carte & Parcours</h3>
                <p className="text-sm text-gray-500">Explorez les lieux à visiter</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={() => navigate("/program")}>
            <CardContent className="p-4 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Programme</h3>
                <p className="text-sm text-gray-500">Expositions et concerts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={() => navigate("/about")}>
            <CardContent className="p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Info className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">À propos</h3>
                <p className="text-sm text-gray-500">Notre histoire et notre mission</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={() => navigate("/team")}>
            <CardContent className="p-4 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Notre équipe</h3>
                <p className="text-sm text-gray-500">Les membres de l'association</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={() => navigate("/support")}>
            <CardContent className="p-4 flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Nous soutenir</h3>
                <p className="text-sm text-gray-500">Comment nous aider</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
