import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo, useAnimation } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const controls = useAnimation();
  
  const slides = [
    {
      title: "Bienvenue sur l'application Collectif Île Feydeau",
      description: "Découvrez le patrimoine unique de l'Île Feydeau à travers notre parcours interactif.",
      image: "/619cc0053cbb-JEP-2025-Clement-Barbe-Ministere-de-la-Culture.webp.webp"
    },
    {
      title: "Explorez la carte interactive",
      description: "Naviguez facilement sur notre carte pour découvrir tous les points d'intérêt de l'île.",
      image: "/Plan Île Feydeau.png"
    },
    {
      title: "Sauvegardez vos événements préférés",
      description: "Marquez les événements qui vous intéressent et recevez des notifications de rappel.",
      image: "/619cc0053cbb-JEP-2025-Clement-Barbe-Ministere-de-la-Culture.webp.webp"
    }
  ];

  const handleFinish = () => {
    // Marquer l'onboarding comme vu
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/');
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      controls.start({ opacity: 0, x: -100 }).then(() => {
        setCurrentSlide(currentSlide + 1);
        controls.start({ opacity: 1, x: 0 });
      });
    } else {
      handleFinish();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      controls.start({ opacity: 0, x: 100 }).then(() => {
        setCurrentSlide(currentSlide - 1);
        controls.start({ opacity: 1, x: 0 });
      });
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Si le swipe est assez long vers la gauche, passer à la diapositive suivante
    if (info.offset.x < -50) {
      nextSlide();
    }
    // Si le swipe est assez long vers la droite, revenir à la diapositive précédente
    else if (info.offset.x > 50) {
      prevSlide();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            className="absolute inset-0 flex flex-col"
            animate={controls}
            initial={{ opacity: 1, x: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className={`absolute inset-0 flex flex-col ${index === currentSlide ? 'z-10' : 'z-0'}`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === currentSlide ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
              <div className="relative h-2/3 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-2">{slide.title}</h1>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between p-6">
                <p className="text-center text-gray-600">{slide.description}</p>
              </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentSlide ? 'bg-[#4a5d94]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button 
            onClick={nextSlide}
            className="w-full bg-[#4a5d94]"
          >
            {currentSlide < slides.length - 1 ? "Suivant" : "Commencer"}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={handleFinish}
              className="w-full mt-2 text-gray-500"
            >
              Passer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
