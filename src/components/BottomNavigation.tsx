import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Info from "lucide-react/dist/esm/icons/info";
import Heart from "lucide-react/dist/esm/icons/heart";
import Home from "lucide-react/dist/esm/icons/home";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import Gift from "lucide-react/dist/esm/icons/gift";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Camera from "lucide-react/dist/esm/icons/camera";
import Twitter from "lucide-react/dist/esm/icons/twitter";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  const openSocialMedia = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-center h-16 z-[9999] shadow-lg">
      <div className="w-full max-w-screen-lg grid grid-cols-6 gap-0 px-1 mx-auto">
        <Link
          to="/map"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/") || isActive("/map") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <MapPin className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">Carte</span>
        </Link>
        
        <Link
          to="/program"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/program") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">Programme</span>
        </Link>
        
        <Link
          to="/saved"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/saved") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <Bookmark className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">Enregistrés</span>
        </Link>
        
        <Link
          to="/community"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/community") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <Camera className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">Galerie</span>
        </Link>
        
        <Link
          to="/about"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/about") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <Info className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">À propos</span>
        </Link>
        
        <Link
          to="/donate"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/donate") ? "text-[#ff7a45]" : "text-gray-500"
          }`}
        >
          <Gift className="h-6 w-6" />
          <span className="text-[10px] mt-1 leading-tight">Dons</span>
        </Link>
      </div>
    </div>
  );
}
