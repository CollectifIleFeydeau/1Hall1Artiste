import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
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
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 165 });
  const [selectedPhoto, setSelectedPhoto] = useState<HistoricalPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Fonction pour charger dynamiquement les photos du dossier
  const loadPhotos = useCallback(async () => {
    try {
      // Créer un tableau pour stocker les chemins des photos
      const photoList: HistoricalPhoto[] = [];
      
      // Déterminer le préfixe de base en fonction de l'environnement
      const basePath = window.location.hostname.includes('github.io')
        ? '/1Hall1Artiste/images/historical'
        : '/images/historical';
      
      // Extensions par ordre de probabilité (optimisation)
      const extensions = ['jpg', 'JPEG', 'jpeg', 'JPG', 'png', 'PNG'];
      
      // Cache des extensions trouvées pour optimiser les recherches suivantes
      const extensionStats: { [key: string]: number } = {};
      
      // Fonction optimisée pour tester si une image existe
      const testImageExists = async (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          const timeout = setTimeout(() => resolve(false), 500); // Réduire timeout à 500ms
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };
          
          img.src = url;
        });
      };
      
      // Chercher les photos de 1 à 165 (nombre réel d'images)
      const maxPhotos = 165; // Réduire la plage de recherche
      
      console.log(`[HistoricalGallery] Recherche optimisée de photos (1 à ${maxPhotos})...`);
      
      // Traitement par batch plus petit pour un feedback plus rapide
      const batchSize = 5;
      for (let start = 1; start <= maxPhotos; start += batchSize) {
        const batch = [];
        
        for (let i = start; i < Math.min(start + batchSize, maxPhotos + 1); i++) {
          // Tester chaque extension pour cette photo avec ordre optimisé
          const photoPromise = (async () => {
            // Réorganiser les extensions selon les statistiques
            const sortedExtensions = [...extensions].sort((a, b) => 
              (extensionStats[b] || 0) - (extensionStats[a] || 0)
            );
            
            for (const ext of sortedExtensions) {
              const photoPath = `${basePath}/photos-${i}.${ext}`;
              const exists = await testImageExists(photoPath);
              
              if (exists) {
                // Mettre à jour les statistiques pour optimiser les prochaines recherches
                extensionStats[ext] = (extensionStats[ext] || 0) + 1;
                
                console.log(`[HistoricalGallery] Photo trouvée: photos-${i}.${ext}`);
                return {
                  id: `photos-${i}`,
                  path: photoPath,
                  loaded: false
                };
              }
            }
            return null; // Photo non trouvée
          })();
          
          batch.push(photoPromise);
        }
        
        // Attendre que ce batch soit terminé
        const batchResults = await Promise.all(batch);
        
        // Ajouter les photos trouvées
        batchResults.forEach(result => {
          if (result) {
            photoList.push(result);
          }
        });
        
        // Feedback de progression
        const currentProgress = Math.min(start + batchSize - 1, maxPhotos);
        setLoadingProgress({ current: currentProgress, total: maxPhotos });
        console.log(`[HistoricalGallery] Progression: ${currentProgress}/${maxPhotos} (${photoList.length} trouvées)`);
        
        // Pause plus courte entre les batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Trier par numéro pour avoir l'ordre correct
      photoList.sort((a, b) => {
        const numA = parseInt(a.id.replace('photos-', ''));
        const numB = parseInt(b.id.replace('photos-', ''));
        return numA - numB;
      });
      
      console.log(`[HistoricalGallery] ${photoList.length} photos trouvées en ${extensions.length} extensions testées`);
      console.log(`[HistoricalGallery] Extensions les plus fréquentes:`, 
        Object.entries(extensionStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
      );
      
      setPhotos(photoList);
      setLoading(false);
      
      // Tracker l'ouverture de la galerie
      analytics.trackFeatureUse('historical_gallery', {
        photo_count: photoList.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des photos historiques:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

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
        // Si .jpeg échoue, essayer .png
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

  // Ouvrir la modal de photo
  const openPhotoModal = (photo: HistoricalPhoto, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    
    // Tracker la visualisation de la photo
    analytics.trackContentInteraction(EventAction.VIEW, 'historical_photo', photo.id, {
      photo_index: index,
      timestamp: new Date().toISOString()
    });
  };

  // Fermer la modal de photo
  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  };

  // Navigation dans la modal
  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedIndex === -1) return;
    
    let newIndex = selectedIndex;
    if (direction === 'prev') {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : photos.length - 1;
    } else {
      newIndex = selectedIndex < photos.length - 1 ? selectedIndex + 1 : 0;
    }
    
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      switch (e.key) {
        case 'Escape':
          closePhotoModal();
          break;
        case 'ArrowLeft':
          navigatePhoto('prev');
          break;
        case 'ArrowRight':
          navigatePhoto('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPhoto, selectedIndex]);

  // Animation pour les éléments de la grille
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.3
      }
    })
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (selectedPhoto) {
        navigatePhoto('next');
      }
    },
    onSwipedRight: () => {
      if (selectedPhoto) {
        navigatePhoto('prev');
      }
    },
    trackMouse: true, // Permet le swipe avec la souris sur desktop
    preventScrollOnSwipe: true, // Empêche le scroll pendant le swipe
    delta: 50, // Distance minimum pour déclencher le swipe (50px)
    swipeDuration: 500, // Durée maximum du swipe (500ms)
  });

  return (
    <AnimatedPageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  ←
                  <span className="sr-only">Retour</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Galerie Historique</h1>
                  <p className="text-slate-600">Photos d'époque de l'Île Feydeau</p>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {photos.length} photos
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Détection automatique des photos...</p>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingProgress.current} / {loadingProgress.total} photos analysées
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Math.round((loadingProgress.current / loadingProgress.total) * 100)}% terminé
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openPhotoModal(photo, index)}
                >
                  <img
                    src={photo.path} 
                    alt={`Photo historique ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading={index < 12 ? "eager" : "lazy"} // Charger immédiatement les 12 premières (2 rangées)
                    onLoad={() => {
                      setPhotos(prev => prev.map(p => 
                        p.id === photo.id ? { ...p, loaded: true } : p
                      ));
                    }}
                    onError={(e) => {
                      console.warn(`Erreur chargement image ${photo.path}`);
                      // Fallback intelligent basé sur les extensions trouvées
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith('.jpg')) {
                        target.src = target.src.replace('.jpg', '.JPEG');
                      } else if (target.src.endsWith('.JPEG')) {
                        target.src = target.src.replace('.JPEG', '.png');
                      } else if (target.src.endsWith('.png')) {
                        target.src = target.src.replace('.png', '.PNG');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-xs font-medium">
                      Photo {index + 1}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de visualisation plein écran */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={closePhotoModal}
              {...handlers}
            >
              {/* Bouton fermer */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
                onClick={closePhotoModal}
              >
                <span className="sr-only">Fermer</span>
                <span className="text-2xl">&times;</span>
              </Button>

              {/* Boutons de navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('prev');
                }}
                title="Photo précédente (← ou swipe droite)"
              >
                ←
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('next');
                }}
                title="Photo suivante (→ ou swipe gauche)"
              >
                →
              </Button>

              {/* Indicateur de position */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {selectedIndex + 1} / {photos.length}
              </div>

              {/* Instructions swipe sur mobile */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full md:hidden">
                Swipe ← → pour naviguer
              </div>

              {/* Image */}
              <motion.img
                key={selectedPhoto.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={selectedPhoto.path}
                alt={`Photo historique ${selectedIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPageTransition>
  );
};

export default HistoricalGallery;
