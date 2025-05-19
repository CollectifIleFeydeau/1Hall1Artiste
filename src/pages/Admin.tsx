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
          
          let updatedEventsCount = 0;
          
          locationEvents.forEach(event => {
            // Créer une copie mise à jour de l'événement
            const updatedEvent = { 
              ...event, 
              x: coordinates.x, 
              y: coordinates.y 
            };
            
            // Mettre à jour l'événement via le service de données
            const eventUpdateResult = updateEvent(updatedEvent);
            
            if (eventUpdateResult.success) {
              updatedEventsCount++;
              
              logger.debug('Événement mis à jour', {
                id: updatedEvent.id,
                title: updatedEvent.title,
                oldX: event.x,
                oldY: event.y,
                newX: coordinates.x,
                newY: coordinates.y
              });
            } else {
              logger.error(`Erreur lors de la mise à jour de l'événement ${event.id}`, eventUpdateResult.error);
            }
          });
          
          logger.info(`Coordonnées mises à jour pour ${updatedLocation.name} et ${updatedEventsCount} événements associés`);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94] text-center">Administration</h1>
          <div className="w-20"></div>
        </header>
        
        {/* Système d'onglets */}
        <Tabs defaultValue="coordinates" className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coordinates">Coordonnées</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="import-export">Import / Export</TabsTrigger>
          </TabsList>
          
          {/* Onglet de gestion des coordonnées */}
          <TabsContent value="coordinates">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4a5d94]">Gestion des événements</CardTitle>
              </CardHeader>
              <CardContent>
                <EventForm onSuccess={() => {
                  logger.info('Événement ajouté avec succès');
                }} />
              </CardContent>
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
}
