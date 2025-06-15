import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { AnimatedPageTransition } from "@/components/AnimatedPageTransition";
import { analytics, EventAction } from "@/services/firebaseAnalytics";

interface HistoricalPhoto {
  id: string;
  path: string;
  loaded?: boolean;
}

const HistoricalGallery: React.FC = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<HistoricalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fonction pour charger dynamiquement les photos du dossier
  const loadPhotos = useCallback(async () => {
    try {
      // Créer un tableau pour stocker les chemins des photos
      const photoList: HistoricalPhoto[] = [];
      
      // Déterminer le préfixe de base en fonction de l'environnement
      const basePath = window.location.hostname.includes('github.io')
        ? '/1Hall1Artiste/images/historical'
        : '/images/historical';
      
      // Ajouter les photos du dossier historical
      // Comme nous avons 165 photos, nous allons les numéroter
      for (let i = 1; i <= 165; i++) {
        // Essayer d'abord avec l'extension .jpg
        photoList.push({
          id: `photos-${i}`,
          path: `${basePath}/photos-${i}.jpg`, // Extension par défaut
          loaded: false
        });
      }
      
      setPhotos(photoList);
      setLoading(false);
      
      // Tracker l'ouverture de la galerie
      analytics.trackFeatureUse('historical_gallery', {
        photo_count: photoList.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur lors du chargement des photos:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
    
    // Gestionnaire pour le mode plein écran
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loadPhotos]);

  // Gérer le changement de slide
  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
    
    // Tracker la visualisation de la photo
    analytics.trackContentInteraction(EventAction.VIEW, 'historical_photo', photos[currentIndex].id, {
      photo_index: currentIndex,
      timestamp: new Date().toISOString()
    });
  };

  // Basculer en mode plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erreur lors du passage en plein écran: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Gérer les erreurs de chargement d'image
  const handleImageError = (index: number) => {
    // Essayer différents formats d'image
    setPhotos(prevPhotos => {
      const updatedPhotos = [...prevPhotos];
      const currentPath = updatedPhotos[index].path;
      
      // Déterminer le préfixe de base en fonction de l'environnement
      const baseDir = window.location.hostname.includes('github.io')
        ? '/1Hall1Artiste/images/historical'
        : '/images/historical';
      
      const basePath = `${baseDir}/photos-${index + 1}`;
      
      // Séquence de formats à essayer
      if (currentPath.endsWith('.jpg')) {
        // Si .jpg échoue, essayer .jpeg
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.jpeg`
        };
      } else if (currentPath.endsWith('.jpeg')) {
        // Si .jpeg échoue, essayer .webp
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.webp`
        };
      } else if (currentPath.endsWith('.webp')) {
        // Si .webp échoue, essayer .png
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.png`
        };
      } else if (currentPath.endsWith('.png')) {
        // Si .png échoue, essayer .JPG (majuscules)
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.JPG`
        };
      } else if (currentPath.endsWith('.JPG')) {
        // Si .JPG échoue, essayer .JPEG (majuscules)
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.JPEG`
        };
      } else if (currentPath.endsWith('.JPEG')) {
        // Si .JPEG échoue, essayer .PNG (majuscules)
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: `${basePath}.PNG`
        };
      } else if (currentPath.endsWith('.PNG')) {
        // Si toutes les tentatives échouent, utiliser le placeholder
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          path: '/placeholder.svg'
        };
      }
      
      return updatedPhotos;
    });
  };

  return (
    <AnimatedPageTransition>
      <div className="relative min-h-screen bg-black flex flex-col">
        {/* Header avec bouton retour et plein écran */}
        <div className="absolute top-4 left-0 right-0 z-10 flex justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/50 text-white rounded-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Retour</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white rounded-full"
            onClick={toggleFullscreen}
          >
            <span className="h-6 w-6 flex items-center justify-center">
              {isFullscreen ? "⤓" : "⤢"}
            </span>
            <span className="sr-only">
              {isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            </span>
          </Button>
        </div>

        {/* Diaporama */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Carousel 
              className="w-full h-full"
              opts={{
                loop: true,
                align: "center"
              }}
              setApi={(api) => {
                api?.on("select", () => {
                  const selectedIndex = api.selectedScrollSnap();
                  handleSlideChange(selectedIndex);
                });
              }}
            >
              <CarouselContent>
                {photos.map((photo, index) => (
                  <CarouselItem key={photo.id} className="flex items-center justify-center">
                    <div className="h-screen w-screen flex items-center justify-center">
                      <img 
                        src={photo.path} 
                        alt="Photo historique de l'Île Feydeau" 
                        className="max-h-full max-w-full object-contain"
                        onError={() => handleImageError(index)}
                        loading={Math.abs(index - currentIndex) <= 2 ? "eager" : "lazy"}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-black/50 text-white border-none hover:bg-black/70" />
              <CarouselNext className="right-4 bg-black/50 text-white border-none hover:bg-black/70" />
            </Carousel>
          </div>
        )}
        
        {/* Indicateur de progression */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="bg-black/50 text-white px-4 py-1 rounded-full text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </div>
    </AnimatedPageTransition>
  );
};

export default HistoricalGallery;
