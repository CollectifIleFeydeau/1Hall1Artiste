import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ActionButton } from "@/components/ui/ActionButton";
import { BackButton } from "@/components/ui/BackButton";
import { ArrowLeft, MapPin, Info } from "lucide-react";
import X from "lucide-react/dist/esm/icons/x";
import Camera from "lucide-react/dist/esm/icons/camera";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import Pause from "lucide-react/dist/esm/icons/pause";
import Play from "lucide-react/dist/esm/icons/play";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { SwipeIndicator } from "@/components/ui/SwipeIndicator";
import { getImagePath } from "@/utils/imagePaths";
import { IMAGE_PATHS } from "../constants/imagePaths";
import { getAssetPath } from "@/utils/assetUtils";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { isOnline } from "@/utils/serviceWorkerRegistration";
import { preloadSingleHistoryImage, isHistoryImageCached } from "@/services/offlineService";
import { createLogger } from "@/utils/logger";
import { Slider } from "@/components/ui/slider";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations } from "@/data/locations";
import { setLocationContributionContext } from "@/services/contextualContributionService";
import { LikeButton } from "@/components/community/LikeButton";

// Créer un logger pour le composant LocationHistory
const logger = createLogger('LocationHistory');

export function LocationHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [imagesLoading, setImagesLoading] = useState<Record<string, boolean>>({});
  
  // États pour le lecteur audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Récupérer le locationId depuis l'état de navigation s'il existe
  const locationIdFromState = location.state?.selectedLocationId;
  
  // Vérifier d'abord si l'ID reçu correspond à un lieu existant
  const locationFromState = locationIdFromState ? locations.find(loc => loc.id === locationIdFromState) : null;
  
  // MÉMOÏSER les calculs pour éviter les re-renders infinis
  const locationsWithHistory = React.useMemo(() => {
    const result = [];
    const processedNames = new Set();
    
    // Donner priorité aux lieux avec un historique direct plutôt qu'une référence
    const sortedLocations = [...locations].sort((a, b) => {
      // Les lieux avec history viennent avant ceux avec historyRef
      if (a.history && !b.history) return -1;
      if (!a.history && b.history) return 1;
      return 0;
    });
    
    // Filtrer les lieux
    for (const loc of sortedLocations) {
      // Vérifier si le lieu a un historique ou une référence
      if (loc.history || loc.historyRef) {
        // Vérifier si on a déjà un lieu avec le même nom
        if (!processedNames.has(loc.name)) {
          result.push(loc);
          processedNames.add(loc.name);
        }
      }
    }
    
    // Si le lieu reçu en paramètre a un historique ou une référence mais n'est pas dans la liste, l'ajouter
    if ((locationFromState?.history || locationFromState?.historyRef) && 
        !result.some(loc => loc.id === locationIdFromState)) {
      result.push(locationFromState);
    }
    
    return result;
  }, [locationIdFromState, locationFromState]);
  
  // État pour l'index de navigation par swipe
  const [historySwipeIndex, setHistorySwipeIndex] = useState(() => {
    if (locationIdFromState) {
      const index = locationsWithHistory.findIndex(loc => loc.id === locationIdFromState);
      return index !== -1 ? index : 0;
    }
    return 0;
  });
  
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Si on a reçu un ID valide, l'utiliser
    if (locationIdFromState && locations.find(loc => loc.id === locationIdFromState) && 
        (locations.find(loc => loc.id === locationIdFromState)?.history || 
         locations.find(loc => loc.id === locationIdFromState)?.historyRef)) {
      return locationIdFromState;
    }
    // Sinon, utiliser le premier emplacement disponible
    return locationsWithHistory[0]?.id || null;
  });

  // Trouver le lieu sélectionné - MÉMOÏSÉ
  const selectedLocationData = React.useMemo(
    () => locationsWithHistory.find(loc => loc.id === selectedLocation),
    [locationsWithHistory, selectedLocation]
  );
  
  // Fonctions pour le lecteur audio
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        if (selectedLocationData?.id) {
          analytics.trackAudio('pause', selectedLocationData.id);
        }
      } else {
        audioRef.current.play();
        if (selectedLocationData?.id) {
          analytics.trackAudio('play', selectedLocationData.id);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioLoading(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
      if (selectedLocationData?.id) {
        analytics.trackAudio('seek', selectedLocationData.id, value[0]);
      }
    }
  };

  // Formater le temps en minutes:secondes
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Hook de swipe
  const swipe = useSwipeNavigation({
    items: locationsWithHistory,
    currentIndex: historySwipeIndex,
    onIndexChange: (newIndex) => {
      const newLocation = locationsWithHistory[newIndex];
      if (newLocation) {
        setSelectedLocation(newLocation.id);
        setHistorySwipeIndex(newIndex);
        analytics.trackFeatureUse('swipe_navigation', {
          direction: newIndex > historySwipeIndex ? 'next' : 'previous',
          from_location: selectedLocation,
          to_location: newLocation.id,
          page: 'history'
        });
      }
    },
    enabled: locationsWithHistory.length > 1
  });
  
  // Hook de navigation clavier
  useKeyboardNavigation({
    onPrevious: swipe.goPrevious,
    onNext: swipe.goNext,
    onClose: () => navigate('/map'),
    enabled: locationsWithHistory.length > 1
  });
  
  // Synchroniser l'index avec le lieu sélectionné (pour le dropdown)
  useEffect(() => {
    const index = locationsWithHistory.findIndex(loc => loc.id === selectedLocation);
    if (index !== -1 && index !== historySwipeIndex) {
      setHistorySwipeIndex(index);
    }
  }, [selectedLocation, locationsWithHistory, historySwipeIndex]);
  
  // Précharger l'image du lieu sélectionné pour le mode hors-ligne
  useEffect(() => {
    // Page view for history page
    analytics.trackPageView("/history", "Histoire des lieux");
  }, []);

  // Track building selection and section view
  useEffect(() => {
    if (selectedLocationData?.image) {
      const imagePath = getImagePath(selectedLocationData.image);
      
      // Vérifier si l'image est déjà en cache
      if (!isHistoryImageCached(imagePath)) {
        setImagesLoading(prev => ({ ...prev, [imagePath]: true }));
        
        // Précharger l'image
        preloadSingleHistoryImage(imagePath)
          .then(success => {
            logger.info(`Préchargement de l'image ${success ? 'réussi' : 'échoué'}:`, { imagePath });
            setImagesLoading(prev => ({ ...prev, [imagePath]: false }));
          })
          .catch(error => {
            logger.error(`Erreur lors du préchargement de l'image:`, { imagePath, error });
            setImagesLoading(prev => ({ ...prev, [imagePath]: false }));
          });
      }
    }
    // Track building viewed and main section visible
    if (selectedLocationData) {
      analytics.trackBuildingView(selectedLocationData.id, selectedLocationData.name);
      analytics.trackBuildingHistoryView(selectedLocationData.id, 'Histoire complète');
    }
  }, [selectedLocationData]);
  
  // Réinitialiser le lecteur audio lors du changement de lieu
  useEffect(() => {
    // Arrêter la lecture audio si elle est en cours
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentTime(0);
    setDuration(0);
    
    // Si le nouveau lieu a un fichier audio, préparer le lecteur
    if (selectedLocationData?.audio) {
      setAudioLoading(true);
    }
  }, [selectedLocation]);

  return (
    <div 
      className="min-h-screen pb-20 px-4 pt-4 overflow-x-hidden" 
      style={{
        backgroundImage: `url('${IMAGE_PATHS.BACKGROUNDS.PARCHMENT}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      {...swipe.handlers}
    >
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-white/10" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-4 flex items-center justify-between">
          <button
            aria-label="Retour"
            title="Retour"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-[#1a2138] font-serif">Histoire des lieux</h1>
          <button
            aria-label="Fermer"
            title="Fermer"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Indicateur de swipe */}
        {locationsWithHistory.length > 1 && (
          <div className="mb-4 flex justify-center">
            <SwipeIndicator
              currentIndex={swipe.currentIndex}
              totalCount={swipe.totalCount}
              canGoPrevious={swipe.canGoPrevious}
              canGoNext={swipe.canGoNext}
              onPrevious={swipe.goPrevious}
              onNext={swipe.goNext}
              showArrows={true}
              showCounter={true}
            />
          </div>
        )}

        {/* Liste déroulante des lieux */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3 text-[#1a2138]">Sélectionnez un lieu</h2>
          <Select
            value={selectedLocation}
            onValueChange={(value) => setSelectedLocation(value)}
          >
            <SelectTrigger className="w-full bg-amber-50/95 backdrop-blur-sm border-2 border-amber-600/30 text-[#1a2138] shadow-lg rounded-xl">
              <SelectValue placeholder="Choisir un lieu" />
            </SelectTrigger>
            <SelectContent className="bg-amber-50/95 backdrop-blur-sm border-2 border-amber-600/30 shadow-lg">
              {locationsWithHistory.map((location) => (
                <SelectItem key={location.id} value={location.id} className="hover:bg-amber-50">
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {/* Détails du lieu sélectionné */}
      {selectedLocationData ? (
        <Card className="bg-amber-50/95 backdrop-blur-sm border-2 border-amber-600/30 shadow-lg rounded-xl mb-6">
          <CardHeader className="pb-6">
            <div className="flex flex-col mb-2">
              <div className="flex justify-between items-center w-full mb-4">
                <CardTitle className="text-xl font-bold text-[#1a2138] font-lora mr-2 leading-tight">
                  {selectedLocationData.name}
                </CardTitle>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Bouton de like pour le lieu */}
                  <LikeButton 
                    entryId={`location-${selectedLocationData.id}`}
                    variant="icon"
                    showCount={true}
                  />
                </div>
              </div>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {selectedLocationData.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {selectedLocationData.image && (
              <div className="mb-4">
                {/* Utiliser une div avec background-image comme solution de secours */}
                <div 
                  className="w-full h-64 rounded-xl shadow-lg border-2 border-amber-200 relative"
                  style={{
                    backgroundImage: `url(${getImagePath(selectedLocationData.image)})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                  }}
                >
                  {/* Indicateur de chargement */}
                  {imagesLoading[getImagePath(selectedLocationData.image)] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                      <Loader2 className="h-8 w-8 animate-spin text-[#4a5d94]" />
                    </div>
                  )}
                  
                  {/* Image cachée pour détecter les erreurs de chargement */}
                  <img 
                    src={getImagePath(selectedLocationData.image)} 
                    alt={`Photo historique de ${selectedLocationData.name}`} 
                    className="hidden"
                    onError={(e) => {
                      // Log l'erreur
                      logger.error(`Erreur de chargement de l'image:`, { 
                        image: selectedLocationData.image,
                        online: isOnline()
                      });
                      analytics.trackError(EventAction.RESOURCE_ERROR, 'history_image_load_failed', {
                        image: selectedLocationData.image,
                        building_id: selectedLocationData.id,
                        online: isOnline()
                      });
                    }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mt-1">Photo de {selectedLocationData.name}</p>
              </div>
            )}
            
            {/* Lecteur audio si disponible */}
            {selectedLocationData.audio && (
              <div className="mb-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border-2 border-amber-200 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 text-[#4a5d94] mr-2" />
                    <span className="text-sm font-medium text-[#4a5d94]">Écouter l'histoire</span>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    disabled={audioLoading}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-[#4a5d94] hover:bg-[#3a4d84] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {audioLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5 text-white fill-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white fill-white" />
                    )}
                  </button>
                </div>
                
                <div className="space-y-1">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSliderChange}
                    disabled={audioLoading}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#4a5d94]">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                <audio
                  ref={audioRef}
                  src={selectedLocationData.audio ? 
                    (window.location.hostname.includes('github.io') 
                      ? `/1Hall1Artiste${selectedLocationData.audio}` 
                      : selectedLocationData.audio) 
                    : ''}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (selectedLocationData?.id) {
                      analytics.trackAudio('pause', selectedLocationData.id);
                    }
                  }}
                  onCanPlay={() => setAudioLoading(false)}
                  onError={(e) => {
                    console.error("Erreur de chargement audio:", e, selectedLocationData.audio);
                    setAudioLoading(false);
                  }}
                  preload="metadata"
                  className="hidden"
                />
              </div>
            )}
            
            <h3 className="text-base font-bold text-[#4a5d94] mb-3 pb-1 border-b border-[#d8e3ff]">
              Histoire complète
            </h3>
            
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {(() => {
                  // Déterminer le contenu historique à afficher
                  let historyContent = "";
                  
                  if (selectedLocationData.history) {
                    // Utiliser directement l'historique du lieu
                    historyContent = selectedLocationData.history;
                  } else if (selectedLocationData.historyRef) {
                    // Chercher l'historique référencé
                    const referencedLocation = locations.find(loc => loc.id === selectedLocationData.historyRef);
                    if (referencedLocation?.history) {
                      historyContent = referencedLocation.history;
                    }
                  }
                  
                  // Afficher le contenu historique
                  return historyContent.split('\n\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <div key={index} className="mb-4">
                        {paragraph.startsWith('#') ? (
                          <h4 className="text-lg font-bold text-[#4a5d94] mb-2">
                            {paragraph.replace('#', '').trim()}
                          </h4>
                        ) : (
                          <p className="text-[#4a5d94] leading-relaxed text-sm">{paragraph}</p>
                        )}
                      </div>
                    )
                  ));
                })()}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10 border rounded-lg border-dashed border-gray-300 bg-gray-50">
          <Info className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 mb-1">Sélectionnez un lieu</p>
          <p className="text-gray-400 text-sm">Pour afficher son histoire complète</p>
        </div>
      )}

      {/* Boutons fixes */}
      <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-4 z-10 space-y-2">
        {selectedLocationData && (
          <ActionButton 
            className="w-full border-[#ff7a45] text-[#ff7a45] hover:bg-[#fff5f0] text-sm min-h-[44px]"
            variant="outline"
            onClick={() => {
              if (selectedLocationData) {
                // Enregistrer le contexte de contribution
                setLocationContributionContext(selectedLocationData);
                
                // Naviguer vers la galerie communautaire, onglet contribution
                navigate("/community?tab=contribute");
                
                analytics.trackCommunityInteraction(EventAction.CONTRIBUTION, {
                  source: 'history_page',
                  building_id: selectedLocationData.id
                });
              }
            }}
          >
            Partager un souvenir de ce lieu
          </ActionButton>
        )}
        
        <ActionButton 
          variant="primary"
          className="w-full text-sm min-h-[44px]"
          onClick={() => {
            // Rediriger vers la carte avec le lieu sélectionné mis en évidence
            navigate('/map', {
              state: {
                highlightLocationId: selectedLocation,
                fromHistory: true,
                timestamp: new Date().getTime()
              }
            });
          }}
        >
          Voir sur la carte
        </ActionButton>
      </div>

        <BottomNavigation />
      </div>
    </div>
  );
};





