import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Info from "lucide-react/dist/esm/icons/info";
import Heart from "lucide-react/dist/esm/icons/heart";
import Home from "lucide-react/dist/esm/icons/home";
import { Link, useLocation } from "react-router-dom";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      <Link
        to="/home"
        className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
          isActive("/home") ? "text-[#ff7a45]" : "text-gray-500"
        }`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Accueil</span>
      </Link>
      <Link
        to="/map"
        className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
          isActive("/map") ? "text-[#ff7a45]" : "text-gray-500"
        }`}
      >
        <MapPin className="h-6 w-6" />
        <span className="text-xs mt-1">Carte</span>
      </Link>
      
      <Link
        to="/program"
        className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
          isActive("/program") ? "text-[#ff7a45]" : "text-gray-500"
        }`}
      >
        <Calendar className="h-6 w-6" />
        <span className="text-xs mt-1">Programme</span>
      </Link>
      
      <Link
        to="/about"
        className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
          isActive("/about") ? "text-[#ff7a45]" : "text-gray-500"
        }`}
      >
        <Info className="h-6 w-6" />
        <span className="text-xs mt-1">À propos</span>
      </Link>
      
      <Link
        to="/donate"
        className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
          isActive("/donate") ? "text-[#ff7a45]" : "text-gray-500"
        }`}
      >
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Dons</span>
      </Link>
    </div>
  );
}
