import { useState, useEffect, useRef, useMemo } from "react";
import UserLocation, { GeoPosition } from "@/components/UserLocation";
import ProximityGuide from "@/components/ProximityGuide";
import NavigationGuideSimple from "@/components/NavigationGuideSimple";
import LocationActivator from "@/components/LocationActivator";
import AudioActivator from "@/components/AudioActivator";
import { useNavigate, useLocation } from "react-router-dom";
import { createLogger } from "@/utils/logger";
import { MapComponent, MAP_WIDTH, MAP_HEIGHT } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsToggle } from "@/components/SettingsToggle";
import { analytics, EventAction } from "@/services/firebaseAnalytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import X from "lucide-react/dist/esm/icons/x";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Info from "lucide-react/dist/esm/icons/info";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import { VisitProgress } from "@/components/VisitProgress";
import { ShareButton } from "@/components/ShareButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EventDetails } from "@/components/EventDetails";
import { type Event, events, getLocationIdForEvent } from "@/data/events";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { toast } from "@/components/ui/use-toast";
import { saveEvent, removeSavedEvent, getSavedEvents } from "../services/savedEvents";
import { LikeButton } from "@/components/community/LikeButton";
import { unlockAchievement, AchievementType } from "../services/achievements";
// Créer un logger pour le composant Map
const logger = createLogger('Map');

interface MapProps {
  fullScreen?: boolean;
}

const Map = ({ fullScreen = false }: MapProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utiliser les hooks pour accéder aux données centralisées
  const { locations } = useLocations();
  const { getEventById, getEventsByLocationId } = useEvents();
  
  // Utiliser directement les emplacements du service de données
  const [mapLocations, setMapLocations] = useState(locations);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [highlightedLocation, setHighlightedLocation] = useState<string | null>(null);
  
  // État pour la position de l'utilisateur sur la carte et GPS
  const [userPosition, setUserPosition] = useState<{ x: number, y: number } | null>(null);
  const [userGpsPosition, setUserGpsPosition] = useState<GeoPosition | null>(null);
  const [mapScale, setMapScale] = useState<number>(1); // Stocker le facteur d'échelle de la carte
  
  // État pour la navigation
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showLocationFeatures, setShowLocationFeatures] = useState(false);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  
  // Détection de l'environnement de développement désactivée pour les tests sur le terrain
  const isDevelopmentEnvironment = useMemo(() => {
    // Force à false pour les tests sur le terrain
    return false;
  }, []);

  // Tracker les changements de zoom de la carte
  useEffect(() => {
    analytics.trackInteraction(EventAction.ZOOM, 'map', { scale: mapScale });
  }, [mapScale]);
  
  // Initialiser les données des lieux en incluant l'état de visite
  useEffect(() => {
    // Page view + map load
    analytics.trackPageView('/map', 'Carte');
    analytics.trackMapInteraction(EventAction.MAP_LOAD, {
      total_locations: locations.length
    });

    // Essayer de charger les lieux avec leur état de visite depuis le localStorage
    const savedLocations = localStorage.getItem("mapLocations");
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations);
        // Fusionner les données sauvegardées avec les données actuelles
        const mergedLocations = locations.map(loc => {
          const savedLoc = parsedLocations.find((saved: any) => saved.id === loc.id);
          return savedLoc ? { ...loc, visited: savedLoc.visited } : loc;
        });
        setMapLocations(mergedLocations);
      } catch (error) {
        logger.error('Erreur lors du chargement des lieux visités', { error });
      }
    }
  }, [locations]);
  
  // Charger les événements sauvegardés depuis le service
  useEffect(() => {
    const savedEventsData = getSavedEvents();
    const savedIds = savedEventsData.map(event => event.id);
    setSavedEventIds(savedIds);
  }, [isDevelopmentEnvironment]);
  
  // Recharger les événements sauvegardés lorsqu'on ferme la vue détaillée d'un événement
  useEffect(() => {
    if (!selectedEvent) {
      // Quand on ferme la vue détaillée, on recharge les événements sauvegardés
      const savedEventsData = getSavedEvents();
      const savedIds = savedEventsData.map(event => event.id);
      setSavedEventIds(savedIds);
    }
  }, [selectedEvent]);
  
  // Mettre à jour les emplacements lorsque les données changent
  useEffect(() => {
    logger.info('Mise à jour des emplacements sur la carte depuis le service de données');
    setMapLocations(locations);
  }, [locations]);
  
  // Fonction pour sauvegarder/retirer un événement des favoris
  const handleSaveEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    logger.info(`Tentative de sauvegarde de l'événement: ${event.id} depuis la carte`);
    
    const isEventSaved = savedEventIds.includes(event.id);
    
    if (!isEventSaved) {
      // Ajouter l'événement aux favoris en utilisant le service
      saveEvent(event);
      // Mettre à jour l'état local
      setSavedEventIds([...savedEventIds, event.id]);
      // Analytics: sauvegarde
      analytics.trackContentInteraction(EventAction.SAVE, 'event', event.id, { source: 'map' });
      
      // toast({
      //   title: "Événement sauvegardé",
      //   description: `${event.title} a été ajouté à vos favoris.`,
      // });
      
      logger.info(`Événement ${event.id} sauvegardé avec succès depuis la carte`);
    } else {
      // Retirer l'événement des favoris en utilisant le service
      removeSavedEvent(event.id);
      // Mettre à jour l'état local
      setSavedEventIds(savedEventIds.filter(id => id !== event.id));
      // Analytics: désactivation de la sauvegarde
      analytics.trackContentInteraction(EventAction.UNSAVE, 'event', event.id, { source: 'map' });
      
      // toast({
      //   title: "Événement retiré",
      //   description: `${event.title} a été retiré de vos favoris.`,
      // });
      
      logger.info(`Événement ${event.id} retiré avec succès depuis la carte`);
    }
  };
  
  // Effet pour mettre en évidence le lieu lorsqu'on arrive depuis l'histoire complète ou l'admin
  useEffect(() => {
    // Vérifier si on a un ID de lieu à mettre en évidence dans l'état de location
    const highlightId = location.state?.highlightLocationId;
    const fromEvent = location.state?.fromEvent === true;
    const fromHistory = location.state?.fromHistory === true;
    
    // Vérifier si on a un ID de lieu à mettre en évidence dans les paramètres d'URL
    const searchParams = new URLSearchParams(window.location.search);
    const highlightParam = searchParams.get('highlight');
    const locationParam = searchParams.get('location');
    const eventParam = searchParams.get('event');
    
    // Utiliser l'ID du paramètre d'URL ou de l'état de location
    const locationIdToHighlight = highlightParam || locationParam || highlightId || eventParam;
    
    // Si aucun lieu à mettre en évidence, ne rien faire
    if (!locationIdToHighlight) {
      return;
    }
    
    logger.info(`Mise en évidence du lieu avec ID: ${locationIdToHighlight}`);
    
    // Convertir l'ID d'événement en ID de lieu si nécessaire
    let locationIdToUse = locationIdToHighlight;
    
    // Si c'est un ID d'événement, le convertir en ID de lieu
    if (eventParam && locationIdToHighlight === eventParam) {
      const event = events.find(e => e.id === eventParam);
      if (event) {
        locationIdToUse = event.locationId;
        logger.debug(`Conversion de l'ID d'événement ${eventParam} en ID de lieu ${locationIdToUse}`);
        
        // Ouvrir automatiquement les détails de l'événement
        setTimeout(() => {
          setSelectedEvent(event);
          logger.info(`Ouverture automatique des détails de l'événement ${event.id}`);
        }, 500); // Petit délai pour permettre à la carte de se charger d'abord
      }
    }
    
    // Trouver l'emplacement correspondant
    let locationToHighlight = mapLocations.find(loc => loc.id === locationIdToUse);
    
    // Si le lieu n'est pas trouvé directement, essayer de trouver un lieu dont l'ID commence par locationIdToUse
    // Cela permet de gérer les cas où on passe un ID partiel comme "quai-turenne" au lieu de "quai-turenne-8"
    if (!locationToHighlight && locationIdToUse) {
      locationToHighlight = mapLocations.find(loc => loc.id.startsWith(locationIdToUse));
      if (locationToHighlight) {
        logger.info(`Lieu avec ID exact ${locationIdToUse} non trouvé, mais un lieu correspondant a été trouvé: ${locationToHighlight.id}`);
        locationIdToUse = locationToHighlight.id; // Mettre à jour l'ID avec celui qui a été trouvé
      }
    }
    
    if (locationToHighlight) {
      logger.debug('Lieu trouvé pour mise en évidence', { 
        id: locationToHighlight.id, 
        name: locationToHighlight.name,
        x: locationToHighlight.x,
        y: locationToHighlight.y
      });
      
      // Mettre en évidence le lieu (maintenant sans limite de temps)
      // La mise en évidence restera active jusqu'à ce que l'utilisateur interagisse avec la carte
      setHighlightedLocation(locationIdToUse);
      
      // N'ouvrir la programmation que si nous ne venons pas de l'historique ou des détails d'événement
      if (!fromHistory && !fromEvent) {
        setActiveLocation(locationIdToUse);
      }
      
      logger.debug(`Mise en évidence permanente du lieu ${locationIdToUse} jusqu'à la prochaine action utilisateur`);
    } else {
      logger.warn(`Lieu avec ID ${locationIdToHighlight} non trouvé dans mapLocations`);
    }
  }, [location, mapLocations, events]);
  
  const handleLocationClick = (locationId: string) => {
    logger.info(`Clic sur l'emplacement ${locationId}`);
    
    // Stocker l'ID du lieu actif pour la mise en évidence
    setHighlightedLocation(locationId);
    
    // Définir le lieu comme actif pour afficher ses détails
    setActiveLocation(locationId);
    
    // Trouver les événements associés à ce lieu en utilisant la propriété locationId des événements
    const eventsData = getEventsByLocationId(locationId);
    logger.debug(`Récupération des événements pour le lieu ${locationId} via getEventsByLocationId`, eventsData);
    logger.debug(`Événements trouvés pour ${locationId}`, eventsData);
    // Analytics: vue de lieu depuis la carte
    const loc = mapLocations.find(l => l.id === locationId);
    if (loc) {
      analytics.trackBuildingView(loc.id, loc.name);
    }
    analytics.trackMapInteraction(EventAction.LOCATION_VIEW, {
      building_id: locationId,
      from: 'map'
    });
    
    // Toujours afficher d'abord les informations du lieu, jamais directement l'événement
    setSelectedEvent(null);
  };

  const markLocationAsVisited = (locationId: string, visited: boolean) => {
    const updatedLocations = mapLocations.map(loc => 
      loc.id === locationId ? { ...loc, visited } : loc
    );
    
    setMapLocations(updatedLocations);
    localStorage.setItem('mapLocations', JSON.stringify(updatedLocations));
    // Analytics: marquage visité
    analytics.trackFeatureUse('location_mark_visited', { location_id: locationId, visited });
    
    // Conserver la mise en évidence du lieu même après l'avoir marqué comme visité
    // Cela permet à l'utilisateur de voir le lieu mis en évidence lorsqu'il revient à la carte
    setHighlightedLocation(locationId);
    
    // toast({
    //   title: visited ? "Lieu marqué comme visité" : "Lieu marqué comme non visité",
    //   description: `${mapLocations.find(l => l.id === locationId)?.name} a été mis à jour.`,
    // });
    
    // Si le lieu est marqué comme visité, déclencher les achievements appropriés
    if (visited) {
      logger.info(`Lieu ${locationId} marqué comme visité, vérification des achievements`);
      
      // Vérifier si tous les lieux ont été visités
      const allVisited = updatedLocations.every(loc => loc.visited);
      if (allVisited) {
        logger.info('Tous les lieux ont été visités, déblocage de l\'achievement ALL_LOCATIONS_VISITED');
        unlockAchievement(AchievementType.ALL_LOCATIONS_VISITED);
      }
    }
  };

  // Cette fonction n'est plus nécessaire car elle est gérée par le composant EventDetails

  const getLocationEvents = (locationId: string) => {
    // Utiliser la fonction getEventsByLocationId du hook useEvents
    // qui a été mise à jour pour fonctionner avec la nouvelle structure de données
    const eventsWithThisLocation = getEventsByLocationId(locationId);
    
    logger.debug(`Événements trouvés pour ${locationId} via getEventsByLocationId`, eventsWithThisLocation);
    
    return eventsWithThisLocation;
  };

  // Calculate visited locations count
  const visitedCount = mapLocations.filter(loc => loc.visited).length;
  const totalCount = mapLocations.length;

  // Fonction pour réactiver la localisation si l'utilisateur a précédemment refusé
  const reactivateLocation = () => {
    localStorage.setItem('locationConsent', 'granted');
    setShowLocationFeatures(true);
    setLocationPermissionRequested(false); // Force la réinitialisation du processus de demande
    setPermissionDenied(false); // Réinitialiser l'état de permission refusée
  };

  // Demander l'autorisation de localisation au chargement de la page
  useEffect(() => {
    // En environnement de développement, activer automatiquement la localisation sans demander
    if (isDevelopmentEnvironment) {
      setLocationPermissionRequested(true);
      setPermissionDenied(false);
      setShowLocationFeatures(true);
      localStorage.setItem('locationConsent', 'granted');
      logger.info('Environnement de développement détecté, localisation activée automatiquement');
      return;
    }
    
    // En production, réinitialiser les états pour forcer une nouvelle demande d'autorisation
    localStorage.removeItem('locationConsent');
    setLocationPermissionRequested(false);
    setPermissionDenied(false);
    setShowLocationFeatures(false);
  }, []);

  // Fonction pour mettre à jour la position de l'utilisateur
  const handleLocationUpdate = (x: number, y: number, gpsPosition?: GeoPosition) => {
    setUserPosition({ x, y });
    if (gpsPosition) {
      setUserGpsPosition(gpsPosition);
    }
    // Log seulement 0.1% des mises à jour pour réduire drastiquement le bruit dans la console
    // if (process.env.NODE_ENV === 'development' && Math.random() < 0.001) {
    //   logger.info('Position utilisateur mise à jour sur la carte', { x, y, gps: gpsPosition });
    // }
  };

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto px-4 pt-4">
        <header className="mb-2 flex items-center justify-between">
          <div className="w-1/4"></div>
          <h1 className="text-xl font-bold text-[#4a5d94] text-center">Carte</h1>
          <div className="flex items-center space-x-2 w-1/4 justify-end">
            <ShareButton 
              title="Parcours Île Feydeau" 
              text="Découvrez mon parcours sur l'Île Feydeau à Nantes!" 
            />
          </div>
        </header>
        
        {/* Légende sous le titre - toujours visible */}
        <div className="flex items-center justify-center mb-4 text-sm text-[#4a5d94] fade-in">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-5 h-5 bg-[#4CAF50] rounded-full mr-1 text-white text-xs font-medium">
                {visitedCount}
              </div>
              <span className="text-xs">{visitedCount > 1 ? 'Visités' : 'Visité'}</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-5 h-5 bg-[#4a5d94] rounded-full mr-1 text-white text-xs font-medium">
                {totalCount - visitedCount}
              </div>
              <span className="text-xs">À découvrir</span>
            </div>
          </div>
        </div>
        

        
        {/* Boutons d'activation de la localisation et du son */}
        <div className="flex justify-center gap-2 my-2">
          <LocationActivator 
            onLocationEnabled={() => {
              setPermissionDenied(false);
              setShowLocationFeatures(true);
              setLocationPermissionRequested(true);
              logger.info('Localisation activée manuellement par l\'utilisateur');
              analytics.trackMapInteraction(EventAction.USER_LOCATION, { granted: true });
            }}
            onLocationDenied={() => {
              setPermissionDenied(true);
              setShowLocationFeatures(false);
              logger.warn('Localisation refusée par l\'utilisateur');
              analytics.trackMapInteraction(EventAction.USER_LOCATION, { granted: false });
            }}
            onLocationDisabled={() => {
              setShowLocationFeatures(false);
              setNavigationTarget(null); // Arrêter la navigation en cours
              logger.info('Localisation désactivée manuellement par l\'utilisateur');
              analytics.trackMapInteraction(EventAction.USER_LOCATION, { granted: false, disabled: true });
            }}
          />
          
          <AudioActivator 
            onAudioEnabled={() => {
              logger.info('Son activé manuellement par l\'utilisateur');
              analytics.trackFeatureUse('map_sound_toggle', { enabled: true });
            }}
            onAudioDisabled={() => {
              logger.info('Son désactivé par l\'utilisateur');
              analytics.trackFeatureUse('map_sound_toggle', { enabled: false });
            }}
          />
        </div>
        
        <div className="relative">
          {/* Map container */}
          <div className="bg-white rounded-lg mb-4 border-0 transition-all duration-300 hover:shadow-lg w-full">
            <div className="relative h-full">
              <MapComponent 
                locations={mapLocations}
                activeLocation={activeLocation}
                highlightedLocation={highlightedLocation}
                onClick={(e) => {
                  // Récupérer l'ID du lieu depuis l'élément cliqué
                  const locationId = e.currentTarget.dataset.locationId || e.currentTarget.id.replace('location-', '');
                  if (locationId) {
                    handleLocationClick(locationId);
                  } else {
                    // Clic sur l'arrière-plan de la carte
                    analytics.trackInteraction(EventAction.CLICK, 'map_background');
                  }
                }}
                readOnly={false}
                onScaleChange={setMapScale}
                onPanStart={({ x, y }) => {
                  analytics.trackMapInteraction(EventAction.DRAG, {
                    phase: 'start',
                    x: Math.round(x),
                    y: Math.round(y)
                  });
                }}
                onPanEnd={({ totalDx, totalDy, distance, durationMs }) => {
                  analytics.trackMapInteraction(EventAction.DRAG, {
                    total_dx: Math.round(totalDx),
                    total_dy: Math.round(totalDy),
                    distance: Math.round(distance),
                    duration_ms: Math.round(durationMs)
                  });
                }}
                userLocationProps={showLocationFeatures ? {
                  onLocationUpdate: handleLocationUpdate,
                  showNavigation: false,
                  onPermissionChange: (denied) => setPermissionDenied(denied)
                } : undefined}
                navigationProps={navigationTarget && userPosition && userGpsPosition ? {
                  userPosition: userGpsPosition,
                  targetLocation: mapLocations.find(loc => loc.id === navigationTarget) || null,
                  onClose: () => setNavigationTarget(null)
                } : undefined}
              />
              
            
              {/* Message d'erreur et bouton pour réactiver la localisation - caché en mode développement */}
              {permissionDenied && !isDevelopmentEnvironment && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-center">
                  <div className="mb-2">Accès refusé - Vous avez refusé l'accès à votre position.</div>
                  <Button
                    size="sm"
                    onClick={reactivateLocation}
                    className="bg-white text-red-500 hover:bg-gray-100 text-xs"
                  >
                    Activer la localisation
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* La légende a été déplacée sous le titre */}
        </div>
        

        
      
      </div>
      
      {/* Removed visit confirmation dialog */}
      
      {/* Location details overlay */}
      {activeLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setActiveLocation(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#4a5d94]">
                {mapLocations.find(l => l.id === activeLocation)?.name}
              </h2>
              <div className="flex items-center space-x-2">
                {/* Bouton de like pour le bâtiment */}
                <LikeButton 
                  entryId={`building-${activeLocation}`}
                  variant="icon"
                  showCount={true}
                />
                
                <Button variant="ghost" size="sm" className="-mt-2 -mr-2" onClick={() => {
                  if (activeLocation) {
                    analytics.trackInteraction(EventAction.BACK, 'location_details_close', { building_id: activeLocation });
                  }
                  setActiveLocation(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-[#8c9db5] mb-3">
              {/* Display location if available */}
              Île Feydeau, Nantes
            </p>
            
            <p className="text-sm text-[#4a5d94] mb-4">
              {mapLocations.find(l => l.id === activeLocation)?.description}
            </p>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#4a5d94] text-[#4a5d94]"
              onClick={() => {
                // S'assurer que activeLocation est défini avant de naviguer
                if (activeLocation) {
                  logger.info(`Navigation vers l'histoire du lieu: ${activeLocation}`);
                  const loc = mapLocations.find(l => l.id === activeLocation);
                  if (loc) {
                    analytics.trackBuildingHistoryView(loc.id, 'from_map');
                  }
                  analytics.trackInteraction(EventAction.CLICK, 'history_button', { from: 'map', building_id: activeLocation });
                  navigate('/location-history', { 
                    state: { selectedLocationId: activeLocation }
                  });
                } else {
                  logger.warn('Tentative de navigation vers l\'histoire d\'un lieu non sélectionné');
                }
              }}
            >
              <Info className="h-3 w-3 mr-1" />
              Histoire du lieu
            </Button>
            
            <div className="mb-6"></div>
            
            {getLocationEvents(activeLocation).length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-[#1a2138] mb-2">Événements à cet endroit:</h3>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 -mr-2">
                  {getLocationEvents(activeLocation).map((event) => (
                    <div 
                      key={event.id} 
                      className={`bg-[#f0f5ff] p-3 rounded-lg cursor-pointer hover:bg-[#e0ebff] transition-colors ${savedEventIds.includes(event.id) ? 'border-l-4 border-l-[#ff7a45]' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => {
                          analytics.trackProgramInteraction(EventAction.EVENT_DETAILS, { event_id: event.id, source: 'map' });
                          setSelectedEvent(event);
                        }}>
                          <p className="font-medium text-[#1a2138]">{event.title}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 text-[#8c9db5]" />
                            <p className="text-xs text-[#8c9db5]">{event.days.map(day => day === "samedi" ? "Sa" : "Di").join("/")}, {event.time}</p>
                          </div>
                          <p className="text-xs text-[#4a5d94] mt-1">{event.artistName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={(e) => handleSaveEvent(event, e)}
                        >
                          {savedEventIds.includes(event.id) ? (
                            <BookmarkCheck className="h-5 w-5 text-[#ff7a45]" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-[#8c9db5]" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between mb-4">
              <Button
                variant="outline"
                className="border-[#4a5d94] text-[#4a5d94] text-xs sm:text-sm px-1 sm:px-2 min-h-[44px]"
                onClick={() => activeLocation && markLocationAsVisited(activeLocation, !mapLocations.find(l => l.id === activeLocation)?.visited)}
              >
                {mapLocations.find(l => l.id === activeLocation)?.visited ? 'Non visité' : 'Marquer visité'}
              </Button>
              
              <Button 
                className="bg-[#ff7a45] hover:bg-[#ff9d6e] text-sm min-h-[44px]"
                onClick={() => {
                  // Fermer la vue détaillée mais conserver la mise en évidence du lieu
                  // Le lieu reste en surbrillance grâce à highlightedLocation qui n'est pas réinitialisé
                  if (activeLocation) {
                    analytics.trackInteraction(EventAction.BACK, 'location_details_back', { building_id: activeLocation });
                  }
                  setActiveLocation(null);
                }}
              >
                Retour à la carte
              </Button>
            </div>
            
            {/* Bouton de navigation - visible uniquement si la géolocalisation est active */}
            {showLocationFeatures && (
              <div className="mb-16">
                <Button 
                  variant="secondary" 
                  className="w-full text-sm bg-[#f0f5ff] text-[#4a5d94] hover:bg-[#d8e3ff] min-h-[44px]"
                  onClick={() => {
                    // Utiliser l'ID du lieu actif
                    if (activeLocation) {
                      setNavigationTarget(activeLocation);
                      setActiveLocation(null); // Fermer la vue détaillée
                      analytics.trackMapInteraction(EventAction.ROUTE_CALCULATE, {
                        building_id: activeLocation,
                        has_user_position: !!userPosition
                      });
                    }
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Me guider vers ce lieu
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Event details using the unified component */}
      <EventDetails 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          setHighlightedLocation(null); // Réinitialiser la mise en évidence
        }}
        source="map"
      />
      
      {/* Boîte de dialogue de consentement de localisation retirée */}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Guide de navigation (si un lieu est sélectionné pour la navigation) */}
      {/* Le NavigationGuide est maintenant intégré dans le MapComponent */}

    </div>
  );
};

export default Map;
