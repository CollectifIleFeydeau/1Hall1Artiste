
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Info from "lucide-react/dist/esm/icons/info";
import Heart from "lucide-react/dist/esm/icons/heart";
import Users from "lucide-react/dist/esm/icons/users";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HeroBanner } from "@/components/HeroBanner";

function Home() {
  const navigate = useNavigate();
  const associationInfo = {
    shortName: "Collectif Île Feydeau",
    eventWeekend: "19 et 20 septembre 2025",
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Full-page background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <img 
          src="/619cc0053cbb-JEP-2025-Clement-Barbe-Ministere-de-la-Culture.webp.webp" 
          alt="Journées du Patrimoine" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="relative z-10 app-gradient bg-opacity-80">
      {/* Hero section with image background */}
      <div className="relative overflow-hidden mb-6">
        <div className="h-48 rounded-lg flex items-center justify-center p-6 text-white relative">
          {/* Background image with overlay */}
          <div className="absolute inset-0 bg-black/40 z-10 rounded-lg"></div>
          <img 
            src="/619cc0053cbb-JEP-2025-Clement-Barbe-Ministere-de-la-Culture.webp.webp" 
            alt="Journées du Patrimoine" 
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          <div className="text-center z-20 relative">
            <h1 className="text-2xl font-bold mb-2">
              {associationInfo.shortName}
              {/* <div className="text-sm font-normal mt-1">© 2025</div> */}
              <div className="text-xs font-normal">Association pour la valorisation du patrimoine de l'île Feydeau</div>
            </h1>
            <p className="text-sm mb-4">{associationInfo.eventWeekend}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Card className="bg-white shadow-md rounded-lg overflow-hidden border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-0">
              <Link to="/program" className="block">
                <div className="h-2 bg-[#ff7a45]" />
                <div className="p-4 flex items-center space-x-4">
                  <div className="bg-[#fff2ee] p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-[#ff7a45]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Programme</h2>
                    <p className="text-sm text-gray-500">Découvrez les événements à venir sur l'île</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-md rounded-lg overflow-hidden border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-0">
              <Link to="/about" className="block">
                <div className="h-2 bg-[#4a5d94]" />
                <div className="p-4 flex items-center space-x-4">
                  <div className="bg-[#e0ebff] p-3 rounded-full">
                    <Users className="h-6 w-6 text-[#4a5d94]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">À propos</h2>
                    <p className="text-sm text-gray-500">En savoir plus sur notre association et notre équipe</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md rounded-lg overflow-hidden border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-0">
              <Link to="/donate" className="block">
                <div className="h-2 bg-[#ff7a45]" />
                <div className="p-4 flex items-center space-x-4">
                  <div className="bg-[#fff2ee] p-3 rounded-full">
                    <Heart className="h-6 w-6 text-[#ff7a45]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Faire un don</h2>
                    <p className="text-sm text-gray-500">Soutenez nos actions de préservation du patrimoine</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer content moved to header */}
      </div>
      
      <BottomNavigation />
      </div>
    </div>
  );
};

export default Home;
