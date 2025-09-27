import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getImagePath } from "@/utils/imagePaths";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Durée totale de l'animation en ms
    const animationDuration = 2000;
    
    // Marquer l'animation comme terminée après la durée spécifiée
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      
      // Attendre un peu après l'animation avant de naviguer
      setTimeout(() => {
        onComplete();
      }, 300);
    }, animationDuration);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Variantes pour l'animation du logo
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col items-center"
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.h1 
          className="text-2xl font-bold text-[#4a5d94] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          1 Hall 1 Artiste 2025
        </motion.h1>
        <motion.img 
          src={getImagePath('/Logo.png')} 
          alt="Collectif Feydeau Logo" 
          className="w-48 h-48 object-contain mb-6"
        />

        <motion.h2
          className="text-xl font-semibold text-[#4a5d94] mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Collectif Feydeau
        </motion.h2>
        <motion.p
          className="text-sm text-gray-600 text-center max-w-xs px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          "Découvrez le patrimoine historique de l'Île Feydeau"
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;

