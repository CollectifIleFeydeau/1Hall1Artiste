import React, { useEffect } from "react";
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
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import History from "lucide-react/dist/esm/icons/history";
import BarChart from "lucide-react/dist/esm/icons/bar-chart";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { useNewPhotosNotification } from "@/hooks/useNewPhotosNotification";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationHook = useNewPhotosNotification();
  const { hasNewPhotos, newPhotosCount, markAsViewed } = notificationHook;
  
  
  // Enregistrer le hook pour les tests globaux
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).registerNotificationHook) {
      (window as any).registerNotificationHook(notificationHook);
    }
  }, [notificationHook]);

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
            isActive("/") || isActive("/map") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
        >
          <MapPin className={`${isActive("/") || isActive("/map") ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`mt-1 leading-tight ${isActive("/") || isActive("/map") ? "text-[11px]" : "text-[10px]"}`}>Carte</span>

        </Link>
        
        <Link
          to="/program"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/program") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
        >
          <Calendar className={`${isActive("/program") ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`mt-1 leading-tight ${isActive("/program") ? "text-[11px]" : "text-[10px]"}`}>Programme</span>

        </Link>
        
        <Link
          to="/saved"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/saved") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
        >
          <Bookmark className={`${isActive("/saved") ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`mt-1 leading-tight ${isActive("/saved") ? "text-[11px]" : "text-[10px]"}`}>Enregistrés</span>

        </Link>
        
        <Link
          to="/galleries"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/galleries") || isActive("/community") || isActive("/historical") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
          onClick={() => {
            // Marquer les nouvelles photos comme vues quand l'utilisateur clique
            if (hasNewPhotos) {
              markAsViewed();
            }
          }}
        >
          <NotificationBadge count={newPhotosCount} show={hasNewPhotos}>
            <Camera className={`${isActive("/galleries") || isActive("/community") || isActive("/historical") ? "h-7 w-7" : "h-6 w-6"}`} />
          </NotificationBadge>
          <span className={`mt-1 leading-tight ${isActive("/galleries") || isActive("/community") || isActive("/historical") ? "text-[11px]" : "text-[10px]"}`}>Galeries</span>
        </Link>
        
        <Link
          to="/about"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/about") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
        >
          <Info className={`${isActive("/about") ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`mt-1 leading-tight ${isActive("/about") ? "text-[11px]" : "text-[10px]"}`}>À propos</span>

        </Link>
        
        <Link
          to="/donate"
          className={`flex flex-col items-center justify-center w-full h-full nav-item-hover ${
            isActive("/donate") ? "text-[#ff7a45] font-medium" : "text-gray-500"
          }`}
        >
          <Gift className={`${isActive("/donate") ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`mt-1 leading-tight ${isActive("/donate") ? "text-[11px]" : "text-[10px]"}`}>Dons</span>

        </Link>
        
        {/* <div className="flex flex-col items-center justify-center w-full h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-full w-full flex flex-col items-center justify-center p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-6 w-6 text-gray-500" />
                <span className="text-[10px] mt-1 leading-tight text-gray-500">Plus</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">

              <DropdownMenuItem asChild>
                <Link to="/historical" className="flex items-center gap-2 w-full cursor-pointer">
                  <History className="h-4 w-4" />
                  <span>Photos historiques</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/analytics" className="flex items-center gap-2 w-full cursor-pointer">
                  <BarChart className="h-4 w-4" />
                  <span>Statistiques</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </div>
  );
}
