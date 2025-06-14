import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getImagePath } from "@/utils/imagePaths";
import { useAudio } from "@/components/AudioPlayer";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setUserInteracted } = useAudio();
  
  // Effet pour marquer l'interaction utilisateur lors de l'affichage de l'onboarding
  useEffect(() => {
    console.log("[Onboarding] Préparation de l'interaction utilisateur");
    // Marquer l'interaction utilisateur dans le localStorage pour les futures visites
    localStorage.setItem('userHasInteracted', 'true');
    // Informer le contexte audio que l'utilisateur a interagi
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
      video: "/video/intro-video.mp4" // Chemin vers votre vidéo d'introduction
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
    // Déclencher l'interaction utilisateur pour activer le son
    console.log("[Onboarding] Interaction utilisateur via nextSlide");
    setUserInteracted(true);
    localStorage.setItem('userHasInteracted', 'true');
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const handleFinish = () => {
    // Déclencher l'interaction utilisateur pour activer le son
    console.log("[Onboarding] Interaction utilisateur via handleFinish");
    setUserInteracted(true);
    
    // Marquer l'onboarding comme vu et l'interaction utilisateur
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('userHasInteracted', 'true');
    
    // Utiliser le chemin de base de l'application pour la redirection
    const basePath = import.meta.env.BASE_URL || '/';
    // Utiliser window.location.href pour assurer la navigation
    window.location.href = basePath;
  };

  // Gestion du swipe
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -50 && currentSlide < slides.length - 1) {
      // Swipe vers la gauche - slide suivant
      setCurrentSlide(currentSlide + 1);
    } else if (info.offset.x > 50 && currentSlide > 0) {
      // Swipe vers la droite - slide précédent
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-white flex flex-col overflow-hidden">
      {/* Indicateur de progression */}
      <div className="pt-4 pb-2 z-30 flex justify-center">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${index === currentSlide ? 'bg-[#ff7a45]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div 
          className="flex-1 flex flex-col overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Titre en haut */}
          <h1 className="text-xl md:text-2xl font-bold text-center my-4">{slides[currentSlide].title}</h1>
          
          {currentSlide === 0 ? (
            /* Pour le premier slide: vidéo en quasi pleine page */
            <div className="flex-1 relative overflow-hidden bg-gray-200 mb-[80px]">
              <video 
                className="absolute inset-0 w-full h-full object-contain" 
                controls
                autoPlay
                playsInline
                src={getImagePath(slides[currentSlide].video)}
                aria-label={`Vidéo: ${slides[currentSlide].title}`}
              />
            </div>
          ) : (
            /* Pour les autres slides: structure originale */
            <>
              <div className="relative h-[30vh] md:h-[40vh] overflow-hidden bg-gray-200">
                {slides[currentSlide].video ? (
                  <video 
                    className="absolute inset-0 w-full h-full object-contain" 
                    controls
                    playsInline
                    src={getImagePath(slides[currentSlide].video)}
                    aria-label={`Vidéo: ${slides[currentSlide].title}`}
                  />
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
        </motion.div>
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
          onClick={nextSlide}
          className="flex-1 bg-[#4a5d94] text-white"
        >
          {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
  // return (
  //   <div className="h-screen max-h-screen bg-white flex flex-col overflow-hidden">
  //     {/* Indicateur de progression */}
  //     <div className="pt-4 pb-2 z-30 flex justify-center">
  //       <div className="flex space-x-2">
  //         {slides.map((_, index) => (
  //           <div 
  //             key={index} 
  //             className={`h-2 w-2 rounded-full ${index === currentSlide ? 'bg-[#ff7a45]' : 'bg-gray-300'}`}
  //           />
  //         ))}
  //       </div>
  //     </div>
      
  //     {/* Contenu principal - hauteur limitée pour garantir que les boutons restent visibles */}
  //     <div className="flex-1 flex flex-col overflow-hidden">
  //       <motion.div 
  //         className="flex-1 flex flex-col overflow-hidden"
  //         drag="x"
  //         dragConstraints={{ left: 0, right: 0 }}
  //         onDragEnd={handleDragEnd}
  //       >
  //         {/* Section image ou vidéo - hauteur fixe pour garantir de l'espace pour le contenu et les boutons */}
  //         <div className="relative h-[30vh] md:h-[40vh] overflow-hidden bg-gray-200">
  //           {slides[currentSlide].video ? (
  //             <video 
  //               className="absolute inset-0 w-full h-full object-contain" 
  //               controls
  //               autoPlay={currentSlide === 0}
  //               playsInline
  //               src={getImagePath(slides[currentSlide].video)}
  //               aria-label={`Vidéo: ${slides[currentSlide].title}`}
  //             />
  //           ) : (
  //             <div 
  //               className="absolute inset-0 bg-center bg-no-repeat bg-contain" 
  //               style={{ backgroundImage: `url(${getImagePath(slides[currentSlide].image)})` }}
  //               aria-label={slides[currentSlide].title}
  //             ></div>
  //           )}
  //         </div>
          
  //         {/* Section texte - hauteur limitée avec scroll si nécessaire */}
  //         <div className="flex-1 p-4 overflow-y-auto pb-[80px]">
  //           <h1 className="text-xl md:text-2xl font-bold text-center mb-4">{slides[currentSlide].title}</h1>
            
  //           {Array.isArray(slides[currentSlide].description) ? (
  //             <div className="space-y-3">
  //               {slides[currentSlide].description.map((desc, i) => (
  //                 <p key={i} className="text-center text-gray-600 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: desc }}></p>
  //               ))}
  //             </div>
  //           ) : (
  //             <p className="text-center text-gray-600 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: slides[currentSlide].description }}></p>
  //           )}
  //         </div>
  //       </motion.div>
  //     </div>
      
  //     {/* Boutons de navigation - position fixe en bas */}
  //     <div className="fixed bottom-0 left-0 right-0 p-4 flex space-x-4 border-t border-gray-100 bg-white z-50">
  //       {currentSlide > 0 && (
  //         <Button 
  //           onClick={prevSlide}
  //           className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
  //         >
  //           Précédent
  //         </Button>
  //       )}
        
  //       <Button 
  //         onClick={nextSlide}
  //         className="flex-1 bg-[#4a5d94] text-white"
  //       >
  //         {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
  //       </Button>
  //     </div>
  //   </div>
  // );
}
