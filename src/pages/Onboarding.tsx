import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";

// Préfixe pour les chemins d'images en production (GitHub Pages)
const BASE_PATH = import.meta.env.PROD ? '/Collectif-Feydeau---app' : '';

export default function Onboarding() {
  const navigate = useNavigate();
  
  const slides = [
    {
      title: "Bienvenue sur l'application Collectif Île Feydeau",
      description: [
        "Découvrez le patrimoine unique de l'Île Feydeau à travers notre parcours interactif.",
        "Marquez les événements qui vous intéressent et recevez des notifications de rappel."
      ],
      image: "/onboarding-image.webp"
    }
  ];

  const handleFinish = () => {
    // Marquer l'onboarding comme vu
    localStorage.setItem('hasSeenOnboarding', 'true');
    // Utiliser le chemin de base de l'application pour la redirection
    const basePath = import.meta.env.BASE_URL || '/';
    // Utiliser window.location.href pour assurer la navigation
    window.location.href = basePath;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 flex flex-col">
            {slides.map((slide, index) => (
              <div key={index} className="absolute inset-0 flex flex-col z-10">
                <div className="relative h-2/3 overflow-hidden bg-gray-200">
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                    <img
                      src={`${BASE_PATH}${slide.image}`}
                      alt={slide.title}
                      className="h-full w-auto object-contain"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                      onError={() => {
                        console.error(`Erreur de chargement de l'image: ${slide.image}`);
                        const errorDiv = document.getElementById(`error-${index}`);
                        if (errorDiv) errorDiv.style.opacity = '1';
                      }}
                      onLoad={() => console.log(`Image chargée avec succès: ${slide.image}`)}
                    />
                    
                    {/* Div de secours en cas d'erreur de chargement */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ color: 'red', opacity: 0 }}
                      id={`error-${index}`}
                    >
                      Erreur de chargement de l'image
                    </div>
                  </div>
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                    <div className="text-center text-white">
                      <h1 className="text-2xl font-bold mb-2">{slide.title}</h1>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6">
                  {Array.isArray(slide.description) ? (
                    <div className="space-y-4">
                      {slide.description.map((desc, i) => (
                        <p key={i} className="text-center text-gray-600">{desc}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600">{slide.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <Button 
            onClick={handleFinish}
            className="w-full bg-[#4a5d94]"
          >
            Commencer
          </Button>
        </div>
      </div>
    </div>
  );
}
