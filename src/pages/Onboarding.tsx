import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getImagePath } from "@/utils/imagePaths";
import { useAudio } from "@/components/AudioPlayer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { EventAction } from "@/services/firebaseAnalytics";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const { setUserInteracted } = useAudio();
  const analytics = useAnalytics();

  useEffect(() => {
    // Initialisation de l'onboarding
    analytics.trackOnboarding(EventAction.ONBOARDING_START, {
      timestamp: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    // Suivi du changement de slide
    analytics.trackOnboarding(EventAction.ONBOARDING_SLIDE_VIEW, {
      slide_index: currentSlide,
      slide_title: currentSlideData.title,
      has_video: !!currentSlideData.video
    });
  }, [currentSlide]);

  useEffect(() => {
    console.log("[Onboarding] Préparation de l'interaction utilisateur");
    localStorage.setItem('userHasInteracted', 'true');
    setUserInteracted(true);
  }, [setUserInteracted]);

  const slides = [
    {
      title: "Bienvenue sur l'application Collectif Île Feydeau",
      description: [
        "Découvrez le <strong>patrimoine unique</strong> de l'Île Feydeau à travers notre <strong>parcours interactif</strong>.",
        "Explorez les <strong>expositions</strong> et <strong>concerts</strong> organisés par les artistes du collectif."
      ],
      image: "intro-video-image.png",
      video: "/video/intro-video.mp4"
    },
    {
      title: "Bienvenue sur l'application Collectif Île Feydeau",
      description: [
        "Découvrez le <strong>patrimoine unique</strong> de l'Île Feydeau à travers notre <strong>parcours interactif</strong>.",
        "Explorez les <strong>expositions</strong> et <strong>concerts</strong> organisés par les artistes du collectif."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Programme et horaires",
      description: [
        "Consultez le <strong>programme complet</strong> des événements par jour.",
        "Les <strong>horaires</strong> sont clairement indiqués pour chaque événement.",
        "<strong>Filtrez</strong> par type d'événement : expositions ou concerts."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Carte interactive",
      description: [
        "<strong>Localisez</strong> tous les événements sur la <strong>carte</strong> de l'Île Feydeau.",
        "<strong>Naviguez</strong> facilement entre les différents lieux.",
        "<strong>Marquez</strong> les lieux que vous avez visités."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Fonctionnalités pratiques",
      description: [
        "<strong>Enregistrez</strong> vos événements favoris pour y accéder rapidement.",
        "Configurez des <strong>rappels</strong> pour ne manquer aucun événement.",
        "L'application fonctionne <strong>hors-ligne</strong> pour consulter le programme sans connexion."
      ],
      image: "/onboarding-image.webp"
    }
  ];

  const nextSlide = () => {
    console.log("[Onboarding] Interaction utilisateur via nextSlide");
    setUserInteracted(true);
    localStorage.setItem('userHasInteracted', 'true');
    analytics.trackSwipe('left', 'button', true, {
      current_slide: currentSlide,
      total_slides: slides.length
    });
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      console.log("[Onboarding] Dernière slide atteinte, appel de handleFinish");
      setTimeout(() => {
        handleFinish();
      }, 100);
    }
  };

  const prevSlide = () => {
    console.log("[Onboarding] Interaction utilisateur via prevSlide");
    setUserInteracted(true);
    localStorage.setItem('userHasInteracted', 'true');
    analytics.trackSwipe('right', 'button', true, {
      current_slide: currentSlide,
      total_slides: slides.length
    });
    
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    // Éviter les appels multiples
    if (isNavigating) {
      console.log("[Onboarding] Navigation déjà en cours, ignoré");
      return;
    }
    
    try {
      setIsNavigating(true);
      console.log("[Onboarding] Début de handleFinish");
      localStorage.setItem('hasSeenOnboarding', 'true');
      
      // Tracker la fin de l'onboarding
      analytics.trackOnboarding(EventAction.ONBOARDING_COMPLETE, {
        total_slides_viewed: currentSlide + 1,
        completion_time: new Date().toISOString()
      });
      
      // Ajout d'un log pour déboguer
      console.log("[Onboarding] Navigation vers la carte");
      
      // Forcer un petit délai avant la navigation
      setTimeout(() => {
        console.log("[Onboarding] Exécution de la navigation vers /map");
        // Utiliser le format de route compatible avec HashRouter
        navigate('/map');
        
        // Force un rechargement de la page pour s'assurer que le Map component est correctement monté
        setTimeout(() => {
          console.log("[Onboarding] Forçage du rechargement de la page");
          // Déterminer la base URL en fonction de l'environnement
          const baseUrl = window.location.hostname.includes('github.io') 
            ? '/1Hall1Artiste/#' 
            : '/#';
          window.location.href = `${baseUrl}/map`;
        }, 100);
      }, 300);
    } catch (error) {
      console.error("[Onboarding] Erreur lors de la finalisation de l'onboarding:", error);
      // Fallback en cas d'erreur avec le format HashRouter
      const baseUrl = window.location.hostname.includes('github.io') 
        ? '/1Hall1Artiste/#' 
        : '/#';
      window.location.href = `${baseUrl}/map`;
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentSlide < slides.length - 1) {
      // Swipe vers la gauche - slide suivante
      analytics.trackSwipe('left', 'gesture', true, {
        current_slide: currentSlide,
        total_slides: slides.length,
        swipe_distance: Math.abs(info.offset.x)
      });
      setCurrentSlide(currentSlide + 1);
    } else if (info.offset.x > swipeThreshold && currentSlide > 0) {
      // Swipe vers la droite - slide précédente
      analytics.trackSwipe('right', 'gesture', true, {
        current_slide: currentSlide,
        total_slides: slides.length,
        swipe_distance: Math.abs(info.offset.x)
      });
      setCurrentSlide(currentSlide - 1);
    } else {
      // Swipe insuffisant - pas de changement
      analytics.trackSwipe(
        info.offset.x < 0 ? 'left' : 'right',
        'gesture',
        false,
        {
          current_slide: currentSlide,
          total_slides: slides.length,
          swipe_distance: Math.abs(info.offset.x)
        }
      );
    }
  };

  const handleVideoPlay = () => {
    console.log("[Onboarding] Vidéo démarrée");
    setUserInteracted(true);
    localStorage.setItem('userHasInteracted', 'true');
    
    // Tracker le démarrage de la vidéo
    analytics.trackMediaInteraction(EventAction.PLAY, 'video', `onboarding-slide-${currentSlide}`, {
      slide_index: currentSlide,
      slide_title: slides[currentSlide].title
    });
  };

  const handleVideoPause = () => {
    console.log("[Onboarding] Vidéo mise en pause");
    
    // Tracker la pause de la vidéo
    analytics.trackMediaInteraction(EventAction.PAUSE, 'video', `onboarding-slide-${currentSlide}`, {
      slide_index: currentSlide,
      slide_title: slides[currentSlide].title
    });
  };

  const handleVideoEnded = () => {
    console.log("[Onboarding] Vidéo terminée");
    
    // Tracker la fin de la vidéo
    analytics.trackMediaInteraction(EventAction.COMPLETE, 'video', `onboarding-slide-${currentSlide}`, {
      slide_index: currentSlide,
      slide_title: slides[currentSlide].title
    });
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    
    // Tracker le saut de l'onboarding
    analytics.trackOnboarding(EventAction.ONBOARDING_SKIP, {
      skipped_at_slide: currentSlide,
      total_slides: slides.length,
      skip_time: new Date().toISOString()
    });
    
    navigate(import.meta.env.BASE_URL || '/');
  };

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      {// Header avec le bouton de skip
      <div className="p-4 flex justify-end">
        {/* <Button 
          onClick={handleSkip} 
          className="text-gray-500 hover:text-gray-700 bg-transparent hover:bg-transparent"
          variant="ghost"
        >
          Passer
        </Button> */}
      </div> }
      
      {/* Indicateurs de slides */}
      <div className="absolute top-4 left-0 right-0 flex justify-center z-50">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${index === currentSlide ? 'bg-[#ff7a45]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Overlay pour la gestion du swipe sur toute la surface - sauf sur les vidéos */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-auto touch-pan-x"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-x' }}
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Titre en haut */}
          <h1 className="text-xl md:text-2xl font-bold text-center my-4 relative">{slides[currentSlide].title}</h1>
          
          {currentSlide === 0 ? (
            /* Pour le premier slide: vidéo avec hauteur limitée */
            <div className="relative overflow-hidden bg-gray-200 mb-[80px] h-[50vh] md:h-[60vh] z-20">
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <video 
                  className="max-w-full max-h-full" 
                  controls
                  playsInline
                  src={getImagePath(slides[currentSlide].video || '')}
                  aria-label={`Vidéo: ${slides[currentSlide].title}`}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ) : (
            /* Pour les autres slides: structure originale */
            <>
              <div className="relative h-[30vh] md:h-[40vh] overflow-hidden bg-gray-200">
                {slides[currentSlide].video ? (
                  <div className="absolute inset-0 flex items-center justify-center z-50">
                    <video 
                      className="max-w-full max-h-full" 
                      controls
                      playsInline
                      src={getImagePath(slides[currentSlide].video || '')}
                      aria-label={`Vidéo: ${slides[currentSlide].title}`}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnded}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <div 
                    className="absolute inset-0 bg-center bg-no-repeat bg-contain" 
                    style={{ backgroundImage: `url(${getImagePath(slides[currentSlide].image)})` }}
                    aria-label={slides[currentSlide].title}
                  ></div>
                )}
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto pb-[80px]">
                {Array.isArray(slides[currentSlide].description) ? (
                  <div className="space-y-3">
                    {slides[currentSlide].description.map((desc, i) => (
                      <p key={i} className="text-center text-gray-600 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: desc }}></p>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: slides[currentSlide].description }}></p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Boutons de navigation - position fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex space-x-4 border-t border-gray-100 bg-white z-50">
        {currentSlide > 0 && (
          <Button 
            onClick={prevSlide}
            className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Précédent
          </Button>
        )}
        
        <Button 
          onClick={() => currentSlide === slides.length - 1 ? handleFinish() : nextSlide()}
          className="flex-1 bg-[#4a5d94] text-white"
        >
          {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
