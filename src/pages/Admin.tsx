import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Location } from "@/data/locations";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { MapComponent, MAP_WIDTH, MAP_HEIGHT } from "@/components/MapComponent";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { ImportExportPanel } from "@/components/ImportExportPanel";
import { EventForm } from "@/components/EventForm";
import { AdminLogin } from "@/components/AdminLogin";
import { toast } from "@/components/ui/use-toast";
import { CommunityManagement } from "@/components/CommunityManagement";
import { LikesTestComponent } from "@/components/test/LikesTestComponent";
import { LikesStatsComponent } from "@/components/admin/LikesStatsComponent";
import { RealTimeStatsComponent } from "@/components/admin/RealTimeStatsComponent";
import { EventManagement } from "@/components/admin/EventManagement";

// Créer un logger pour le composant Admin
const logger = createLogger('Admin');

export default function Admin() {
  logger.info('Initialisation du composant Admin');
  
  const navigate = useNavigate();
  // Utiliser les hooks personnalisés pour accéder aux données
  const { events } = useEvents();
  const { locations } = useLocations();
  const { updateEvent, updateLocation } = useData();
  
  const [mapLocations, setMapLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapClicked, setMapClicked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Vérifier si l'utilisateur est déjà authentifié (session storage)
  useEffect(() => {
    const adminAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (adminAuthenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  useEffect(() => {
    // Utiliser les lieux au lieu des événements pour éviter les doublons
    logger.info('Chargement initial des lieux');
    logger.debug('Données de lieux chargées', locations);
    setMapLocations(locations);
  }, [locations]);

  const handleLocationSelect = (locationId: string) => {
    logger.info(`Sélection du lieu ${locationId}`);
    setActiveLocation(locationId);
    
    const location = mapLocations.find(loc => loc.id === locationId);
    if (location) {
      setCoordinates({ x: location.x, y: location.y });
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    logger.info('Clic sur la carte');
    
    try {
      // Obtenir les coordonnées du clic
      const x = Math.round(e.nativeEvent.offsetX);
      const y = Math.round(e.nativeEvent.offsetY);
      
      // Log des coordonnées pour référence
      logger.info(`Coordonnées du clic: x=${x}, y=${y}`);
      
      // Définir les coordonnées pour le point sélectionné
      setCoordinates({ x, y });
      setMapClicked(true);
      
      // Tester immédiatement les nouvelles coordonnées
      testCoordinatesOnMap();
    } catch (error) {
      logger.error('Erreur lors du clic sur la carte', error);
    }
  };

  const handleUpdateCoordinates = () => {
    logger.info('Demande de mise à jour des coordonnées');
    logger.debug('État actuel', { activeLocation, coordinates, mapClicked });
    
    try {
      if (!activeLocation) {
        logger.warn('Tentative de mise à jour sans lieu sélectionné');
        alert("Veuillez d'abord sélectionner un lieu");
        return;
      }
      
      if (!mapClicked && (!coordinates.x || !coordinates.y)) {
        logger.warn('Tentative de mise à jour avec des coordonnées invalides');
        alert("Veuillez cliquer sur la carte pour définir les nouvelles coordonnées");
        return;
      }
      
      // Mettre à jour les coordonnées dans l'état local
      const updatedLocations = mapLocations.map(location => {
        if (location.id === activeLocation) {
          logger.debug('Mise à jour des coordonnées pour', {
            id: location.id,
            name: location.name,
            oldX: location.x,
            oldY: location.y,
            newX: coordinates.x,
            newY: coordinates.y
          });
          return { ...location, x: coordinates.x, y: coordinates.y };
        }
        return location;
      });
      
      setMapLocations(updatedLocations);
      setMapClicked(false);
      
      // Nous n'utilisons plus localStorage directement, tout passe par le service de données
      logger.info('Mise à jour des coordonnées via le service de données');
      logger.debug('Nouvelles coordonnées', updatedLocations);
      
      // Mettre à jour les coordonnées dans l'application en utilisant le service de données centralisé
      const locationToUpdate = locations.find(loc => loc.id === activeLocation);
      
      if (locationToUpdate) {
        logger.info(`Mise à jour des coordonnées dans le service de données pour ${locationToUpdate.name}`);
        
        // Créer une copie mise à jour du lieu
        const updatedLocation = { 
          ...locationToUpdate, 
          x: coordinates.x, 
          y: coordinates.y 
        };
        
        // Mettre à jour le lieu via le service de données
        const updateResult = updateLocation(updatedLocation);
        
        if (updateResult.success) {
          logger.debug('Coordonnées mises à jour dans le service de données', {
            id: updatedLocation.id,
            name: updatedLocation.name,
            oldX: locationToUpdate.x,
            oldY: locationToUpdate.y,
            newX: coordinates.x,
            newY: coordinates.y
          });
          
          // Mettre à jour les événements associés à ce lieu
          const locationEvents = events.filter(event => event.locationName === updatedLocation.name);
          logger.info(`Mise à jour de ${locationEvents.length} événements associés au lieu ${updatedLocation.name}`);
          
          // Note: Les événements n'ont pas de coordonnées x,y directes
          // Ils héritent des coordonnées de leur lieu via locationId
          logger.info(`${locationEvents.length} événements associés au lieu ${updatedLocation.name} hériteront automatiquement des nouvelles coordonnées`);
          
          logger.info(`Coordonnées mises à jour pour ${updatedLocation.name} et ${locationEvents.length} événements associés`);
        } else {
          logger.error(`Erreur lors de la mise à jour du lieu ${locationToUpdate.id}`, updateResult.error);
        }
      } else {
        logger.warn(`Lieu avec ID ${activeLocation} non trouvé dans la liste globale des lieux`);
      }
      
      // Afficher une confirmation sans redirection
      const locationName = mapLocations.find(l => l.id === activeLocation)?.name;
      logger.info(`Confirmation de mise à jour pour ${locationName}`);
      alert(`Coordonnées mises à jour pour ${locationName}\nX: ${coordinates.x}, Y: ${coordinates.y}\n\nLes modifications ont été enregistrées avec succès.`);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des coordonnées', error);
      alert(`Erreur lors de la mise à jour des coordonnées: ${error}`);
    }
  };

  const testCoordinatesOnMap = () => {
    logger.info('Test des coordonnées sur la carte');
    
    if (!activeLocation) {
      logger.warn('Tentative de test sans lieu sélectionné');
      alert("Veuillez d'abord sélectionner un lieu");
      return;
    }
    
    // Créer une copie temporaire des lieux avec les nouvelles coordonnées pour le lieu actif
    const testLocations = mapLocations.map(location => {
      if (location.id === activeLocation) {
        // Utiliser les coordonnées actuelles du formulaire
        const newLocation = { ...location, x: coordinates.x, y: coordinates.y };
        logger.debug('Mise à jour temporaire des coordonnées pour le test', {
          id: location.id,
          name: location.name,
          oldX: location.x,
          oldY: location.y,
          newX: coordinates.x,
          newY: coordinates.y
        });
        return newLocation;
      }
      return location;
    });
    
    // Mettre à jour l'état local pour afficher les nouvelles coordonnées sur la carte
    setMapLocations(testLocations);
    logger.info('Coordonnées de test appliquées temporairement', coordinates);
  };

  const exportLocations = () => {
    logger.info('Exportation des coordonnées');
    
    try {
      const locationsData = JSON.stringify(mapLocations, null, 2);
      const blob = new Blob([locationsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'locations.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.info('Exportation des coordonnées réussie');
    } catch (error) {
      logger.error('Erreur lors de l\'exportation des coordonnées', error);
      alert(`Erreur lors de l'exportation des coordonnées: ${error}`);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('adminAuthenticated', 'true');
  };
  
  const clearLocalStorage = () => {
    localStorage.clear();
    toast({
      title: "LocalStorage vidé",
      description: "Toutes les données locales ont été effacées.",
      variant: "destructive"
    });
    logger.info('LocalStorage vidé par l\'administrateur');
    setTimeout(() => window.location.reload(), 1500);
  };
  

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            className="mr-2 p-0 h-auto"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-[#4a5d94]">Administration</h1>
        </div>
        
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          className="mr-2 p-0 h-auto"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-[#4a5d94]">Administration</h1>
      </div>
      
      <div className="space-y-6">
        <Tabs defaultValue="coordinates" className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center gap-1 h-auto p-1">
            <TabsTrigger value="events" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">Événements</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">Lieux</TabsTrigger>
            <TabsTrigger value="community" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">Contributions</TabsTrigger>
            <TabsTrigger value="likes-stats" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">👍 Likes</TabsTrigger>
            <TabsTrigger value="analytics-stats" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">📊 Analytics</TabsTrigger>
            <TabsTrigger value="likes-test" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">🧪 Test</TabsTrigger>
            <TabsTrigger value="import-export" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">Import/Export</TabsTrigger>
            <TabsTrigger value="reset" className="text-xs md:text-sm px-2 py-1 flex-shrink-0">Reset</TabsTrigger>
          </TabsList>
          
          {/* Onglet de gestion des coordonnées */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4a5d94]">Gestion des coordonnées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Lieux</h2>
                    <p className="text-sm text-gray-500 mb-2">Sélectionnez un lieu pour modifier ses coordonnées</p>
                    
                    <div className="space-y-2">
                      {mapLocations.map(location => (
                        <Button
                          key={location.id}
                          variant={activeLocation === location.id ? "default" : "outline"}
                          className={`w-full justify-start ${activeLocation === location.id ? 'bg-[#4a5d94]' : ''}`}
                          onClick={() => handleLocationSelect(location.id)}
                        >
                          {location.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {activeLocation && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Coordonnées</h2>
                      <p className="text-sm text-gray-500 mb-2">
                        Modifiez les coordonnées du lieu sélectionné
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <Label htmlFor="new-x">X</Label>
                          <Input 
                            id="new-x" 
                            type="number" 
                            value={coordinates.x}
                            onChange={(e) => setCoordinates({...coordinates, x: e.target.value ? parseInt(e.target.value) : 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-y">Y</Label>
                          <Input 
                            id="new-y" 
                            type="number" 
                            value={coordinates.y}
                            onChange={(e) => setCoordinates({...coordinates, y: e.target.value ? parseInt(e.target.value) : 0})}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-[#4a5d94] mb-2" 
                        onClick={handleUpdateCoordinates}
                      >
                        Mettre à jour les coordonnées
                      </Button>
                      
                      <Button 
                        className="w-full bg-[#ff7a45] mb-2" 
                        onClick={testCoordinatesOnMap}
                      >
                        Tester sur la carte
                      </Button>
                    </div>
                  )}
                  
                  <div className="relative">
                    <h2 className="text-lg font-semibold mb-2">Carte</h2>
                    <p className="text-sm text-gray-500 mb-2">Cliquez sur la carte pour définir la position du lieu sélectionné</p>
                    
                    <div className="bg-white rounded-lg mb-4 border-0 transition-all duration-300 hover:shadow-lg w-full">
                      <div className="flex justify-center">
                        <MapComponent 
                          locations={mapLocations} 
                          activeLocation={activeLocation} 
                          onClick={handleMapClick} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet de gestion des événements */}
          <TabsContent value="events">
            <EventManagement />
          </TabsContent>
          
          {/* Onglet de gestion des contributions */}
          <TabsContent value="community" className="space-y-4">
            <CommunityManagement />
          </TabsContent>
          
          {/* Onglet des statistiques de likes */}
          <TabsContent value="likes-stats" className="space-y-4">
            <LikesStatsComponent />
          </TabsContent>
          
          {/* Onglet des statistiques Analytics temps réel */}
          <TabsContent value="analytics-stats" className="space-y-4">
            <RealTimeStatsComponent />
          </TabsContent>
          
          {/* Onglet de test du système de likes */}
          <TabsContent value="likes-test" className="space-y-4">
            <LikesTestComponent />
          </TabsContent>
          
          
          {/* Onglet d'import/export */}
          <TabsContent value="import-export">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4a5d94]">Import / Export des données</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportExportPanel />
                
                <div className="mt-4">
                  <Button 
                    className="w-full bg-[#4a5d94]" 
                    onClick={exportLocations}
                  >
                    Exporter les coordonnées
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet de réinitialisation */}
          <TabsContent value="reset" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4a5d94]">Réinitialisation des données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Réinitialisation du localStorage</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Attention : cette action effacera toutes les données locales de l'application, y compris les événements sauvegardés, les lieux visités et les préférences utilisateur.                      
                    </p>
                    <Button 
                      onClick={clearLocalStorage}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Vider le localStorage
                    </Button>
                  </div>
                  
                  <div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
