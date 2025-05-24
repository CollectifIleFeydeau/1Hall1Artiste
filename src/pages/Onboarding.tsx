import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";

// Préfixe pour les chemins d'images en production (GitHub Pages)
const BASE_PATH = import.meta.env.PROD ? '/Collectif-Feydeau---app' : '';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Bienvenue sur l'application Collectif Île Feydeau",
      description: [
        "Découvrez le patrimoine unique de l'Île Feydeau à travers notre parcours interactif.",
        "Explorez les expositions et concerts organisés par les artistes du collectif."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Programme et horaires",
      description: [
        "Consultez le programme complet des événements par jour.",
        "Les horaires sont clairement indiqués pour chaque événement.",
        "Filtrez par type d'événement : expositions ou concerts."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Carte interactive",
      description: [
        "Localisez tous les événements sur la carte de l'Île Feydeau.",
        "Naviguez facilement entre les différents lieux.",
        "Marquez les lieux que vous avez visités."
      ],
      image: "/onboarding-image.webp"
    },
    {
      title: "Fonctionnalités pratiques",
      description: [
        "Sauvegardez vos événements favoris pour y accéder rapidement.",
        "Configurez des notifications pour ne manquer aucun événement.",
        "L'application fonctionne hors-ligne pour consulter le programme sans connexion."
      ],
      image: "/onboarding-image.webp"
    }
  ];

  const nextSlide = () => {
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
    // Marquer l'onboarding comme vu
    localStorage.setItem('hasSeenOnboarding', 'true');
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
      
      {/* Contenu principal - hauteur limitée pour garantir que les boutons restent visibles */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div 
          className="flex-1 flex flex-col overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Section image - hauteur fixe pour garantir de l'espace pour le contenu et les boutons */}
          <div className="relative h-[30vh] md:h-[40vh] overflow-hidden bg-gray-200">
            <div 
              className="absolute inset-0 bg-center bg-no-repeat bg-contain" 
              style={{ backgroundImage: `url(${BASE_PATH}${slides[currentSlide].image})` }}
              aria-label={slides[currentSlide].title}
            ></div>
            
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="text-center text-white bg-black bg-opacity-30 p-3 rounded-lg max-w-[90%]">
                <h1 className="text-xl md:text-2xl font-bold">{slides[currentSlide].title}</h1>
              </div>
            </div>
          </div>
          
          {/* Section texte - hauteur limitée avec scroll si nécessaire */}
          <div className="flex-1 p-4 overflow-y-auto pb-[80px]">
            {Array.isArray(slides[currentSlide].description) ? (
              <div className="space-y-3">
                {slides[currentSlide].description.map((desc, i) => (
                  <p key={i} className="text-center text-gray-600 text-sm md:text-base">{desc}</p>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 text-sm md:text-base">{slides[currentSlide].description}</p>
            )}
          </div>
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
}
