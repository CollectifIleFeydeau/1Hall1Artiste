import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Location } from "@/data/locations";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { MapComponent, MAP_WIDTH, MAP_HEIGHT } from "@/components/MapComponent";
import { useData, useEvents, useLocations } from "@/hooks/useData";
import { ImportExportPanel } from "@/components/ImportExportPanel";

// Créer un logger pour le composant Admin
const logger = createLogger('Admin');

export default function Admin() {
  logger.info('Initialisation du composant Admin');
  
  const navigate = useNavigate();
  // Utiliser les hooks personnalisés pour accéder aux données
  const { events } = useEvents();
  const { locations } = useLocations();
  const { updateEvent, updateLocation } = useData();
  
  // Authentification désactivée temporairement
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

  // Authentification temporairement désactivée

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    logger.info('Clic sur la carte détecté');
    
    if (!activeLocation) {
      logger.warn('Aucun lieu sélectionné lors du clic sur la carte');
      alert("Veuillez d'abord sélectionner un lieu");
      return;
    }
    
    try {
      // Obtenir l'élément cible du clic
      const target = e.target as HTMLElement;
      const mapContainer = target.closest('.relative') as HTMLElement;
      
      if (!mapContainer) {
        logger.warn('Conteneur de carte non trouvé');
        return;
      }
      
      // Calculer les coordonnées relatives au conteneur de la carte avec dimensions fixes
      const rect = mapContainer.getBoundingClientRect();
      
      // Calculer les coordonnées en tenant compte des dimensions fixes de la carte
      const scaleX = MAP_WIDTH / rect.width;
      const scaleY = MAP_HEIGHT / rect.height;
      
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      
      // Appliquer l'échelle pour obtenir les coordonnées dans les dimensions fixes
      const x = Math.round(rawX * scaleX);
      const y = Math.round(rawY * scaleY);
      
      logger.info(`Nouvelles coordonnées: x=${x}, y=${y} (dimensions fixes ${MAP_WIDTH}x${MAP_HEIGHT})`);
      logger.debug('Détails du clic', { rawX, rawY, scaleX, scaleY, x, y, activeLocation });
      
      // Vérifier que les coordonnées sont dans les limites
      if (x < 0 || x > MAP_WIDTH || y < 0 || y > MAP_HEIGHT) {
        logger.warn(`Coordonnées hors limites: x=${x}, y=${y}`);
        alert(`Coordonnées hors limites: x=${x}, y=${y}\nLes coordonnées doivent être comprises entre (0,0) et (${MAP_WIDTH},${MAP_HEIGHT})`);
        return;
      }
      
      setCoordinates({ x, y });
      setMapClicked(true);
      
      // Update the coordinates immediately
      const updatedLocations = mapLocations.map(location => {
        if (location.id === activeLocation) {
          logger.debug('Mise à jour du lieu', { id: location.id, name: location.name, oldX: location.x, oldY: location.y, newX: x, newY: y });
          return { ...location, x, y };
        }
        return location;
      });
      
      logger.info('Mise à jour des emplacements dans l\'interface');
      logger.debug('Emplacements mis à jour', updatedLocations);
      setMapLocations(updatedLocations);
      
      // Afficher un message de confirmation
      const locationName = mapLocations.find(l => l.id === activeLocation)?.name;
      logger.info(`Position mise à jour pour ${locationName}`);
      alert(`Position mise à jour pour ${locationName}\nX: ${x}, Y: ${y}\n\nCliquez sur "Mettre à jour les coordonnées" pour sauvegarder.`);
      // Save to localStorage for persistence
      logger.info('Sauvegarde des emplacements dans localStorage');
      localStorage.setItem('mapLocations', JSON.stringify(updatedLocations));
      
      // Mettre à jour les coordonnées dans l'application
      const locationToUpdate = locations.find(loc => loc.id === activeLocation);
      
      if (locationToUpdate) {
        // Créer une copie mise à jour du lieu
        const updatedLocation = { ...locationToUpdate, x, y };
        
        // Mettre à jour le lieu via le service de données
        logger.debug('Mise à jour du lieu via le service de données', { id: updatedLocation.id, name: updatedLocation.name });
        const result = updateLocation(updatedLocation);
        
        if (result.success) {
          // Mettre à jour les événements associés à ce lieu
          const locationEvents = events.filter(event => event.locationName === updatedLocation.name);
          logger.info(`Mise à jour de ${locationEvents.length} événements associés au lieu ${updatedLocation.name}`);
          
          locationEvents.forEach(event => {
            const updatedEvent = { ...event, x, y };
            logger.debug('Mise à jour de l\'événement', { id: event.id, title: event.title, oldX: event.x, oldY: event.y, newX: x, newY: y });
            updateEvent(updatedEvent);
          });
          
          logger.info(`Coordonnées mises à jour par clic pour ${updatedLocation.name} et ${locationEvents.length} événements associés`);
        } else {
          logger.error('Erreur lors de la mise à jour du lieu', result.error);
        }
      } else {
        logger.warn(`Lieu avec ID ${activeLocation} non trouvé dans la liste globale des lieux`);
      }
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des coordonnées par clic', error);
      alert(`Erreur lors de la mise à jour des coordonnées: ${error}`);
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
        logger.warn('Tentative de mise à jour sans coordonnées définies');
        alert("Veuillez d'abord cliquer sur la carte ou entrer des coordonnées");
        return;
      }
      
      // Update the coordinates in the locations state
      logger.info('Mise à jour des coordonnées dans l\'état local');
      const updatedLocations = mapLocations.map(location => {
        if (location.id === activeLocation) {
          logger.debug('Mise à jour du lieu', { 
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
      
      // Save to localStorage for persistence
      logger.info('Sauvegarde des coordonnées dans localStorage');
      localStorage.setItem('mapLocations', JSON.stringify(updatedLocations));
      logger.debug('Données sauvegardées dans localStorage', updatedLocations);
      
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
    if (!activeLocation) {
      alert("Veuillez d'abord sélectionner un lieu");
      return;
    }
    
    // Ouvrir la carte dans un nouvel onglet
    const mapUrl = `/map?highlight=${activeLocation}`;
    window.open(mapUrl, '_blank');
  };

  const exportLocations = () => {
    const locationsData = mapLocations.map(({ id, name, x, y }) => ({
      id, name, x, y
    }));
    
    const dataStr = JSON.stringify(locationsData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'locations.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Authentification temporairement désactivée - accès direct à l'interface d'administration

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
        
        {/* Panneau d'import/export */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <ImportExportPanel />
          </CardContent>
        </Card>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Sélectionner un lieu</h2>
          <div className="grid grid-cols-2 gap-2">
            {mapLocations.map((location) => (
              <Button
                key={location.id}
                variant={activeLocation === location.id ? "default" : "outline"}
                className={`text-sm ${activeLocation === location.id ? 'bg-[#4a5d94]' : ''}`}
                onClick={() => setActiveLocation(location.id)}
              >
                {location.name}
              </Button>
            ))}
          </div>
        </div>
        
        {activeLocation && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Position actuelle</h2>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <Label htmlFor="x-coord">X</Label>
                <Input 
                  id="x-coord" 
                  type="number" 
                  value={mapLocations.find(l => l.id === activeLocation)?.x || 0}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="y-coord">Y</Label>
                <Input 
                  id="y-coord" 
                  type="number" 
                  value={mapLocations.find(l => l.id === activeLocation)?.y || 0}
                  readOnly
                />
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-1">Nouvelle position</h3>
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
          
          <Button 
            className="w-full mb-4 bg-[#4a5d94]" 
            onClick={exportLocations}
          >
            Exporter les coordonnées
          </Button>
        </div>
      </div>
    </div>
  );
}
