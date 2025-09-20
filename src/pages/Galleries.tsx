import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Camera from "lucide-react/dist/esm/icons/camera";
import History from "lucide-react/dist/esm/icons/history";
import { Button } from "@/components/ui/button";
import { AnimatedPageTransition } from "@/components/AnimatedPageTransition";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import { BottomNavigation } from "@/components/BottomNavigation";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { useNewPhotosNotification } from "@/hooks/useNewPhotosNotification";

const Galleries: React.FC = () => {
  const navigate = useNavigate();
  const { hasNewPhotos, newPhotosCount, markAsViewed } = useNewPhotosNotification();

  const handleGalleryClick = (galleryType: string) => {
    // Tracker l'événement de clic sur une galerie
    analytics.trackContentInteraction(EventAction.VIEW, 'gallery', galleryType, {
      gallery_type: galleryType,
      timestamp: new Date().toISOString()
    });

    // Marquer les nouvelles photos comme vues si c'est la galerie communautaire
    if (galleryType === 'community' && hasNewPhotos) {
      markAsViewed();
    }

    // Naviguer vers la galerie sélectionnée
    navigate(`/${galleryType}`);
  };

  return (
    <AnimatedPageTransition>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header avec titre et bouton retour */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center h-16 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Retour</span>
            </Button>
            <h1 className="text-xl font-semibold">Galeries</h1>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-4 pb-20"> {/* Added pb-20 to provide space for the bottom navigation */}
          <div className="grid grid-cols-1 gap-4">
            {/* Galerie de la communauté */}
            <div 
              className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
              onClick={() => handleGalleryClick("community")}
            >
              <div className="relative h-40 bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <NotificationBadge count={newPhotosCount} show={hasNewPhotos} className="absolute top-2 right-2">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </NotificationBadge>
                </div>
                {hasNewPhotos && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                    {newPhotosCount} nouvelle{newPhotosCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Photos de la communauté</h2>
                  {hasNewPhotos && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Nouveau !
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  Découvrez les photos partagées par la communauté de l'Île Feydeau
                </p>
              </div>
            </div>

            {/* Galerie historique */}
            <div 
              className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGalleryClick("historical")}
            >
              <div className="relative h-40 bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <History className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-medium">Photos historiques</h2>
                <p className="text-gray-600 mt-1">
                  Explorez notre collection de 165 photos historiques de l'Île Feydeau
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </AnimatedPageTransition>
  );
};

export default Galleries;
