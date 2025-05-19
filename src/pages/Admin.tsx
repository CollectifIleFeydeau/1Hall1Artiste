import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/data/events";
import { locations, Location } from "@/data/locations";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createLogger } from "@/utils/logger";

// Créer un logger pour le composant Admin
const logger = createLogger('Admin');

export default function Admin() {
  logger.info('Initialisation du composant Admin');
  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mapLocations, setMapLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapClicked, setMapClicked] = useState(false);
  
  useEffect(() => {
    // Utiliser les lieux au lieu des événements pour éviter les doublons
    logger.info('Chargement initial des lieux');
    logger.debug('Données de lieux chargées', locations);
    setMapLocations(locations);
  }, []);

  const handleLogin = () => {
    logger.info('Tentative de connexion');
    // Simple authentication for demo purposes
    if (password === "admin123") {
      logger.info('Authentification réussie');
      setIsAuthenticated(true);
    } else {
      logger.warn('Authentification échouée - mot de passe incorrect');
      alert("Mot de passe incorrect");
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    logger.info('Clic sur la carte détecté');
    
    if (!activeLocation) {
      logger.warn('Aucun lieu sélectionné lors du clic sur la carte');
      alert("Veuillez d'abord sélectionner un lieu");
      return;
    }
    
    try {
      // Get click coordinates relative to the map container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      
      logger.info(`Nouvelles coordonnées: x=${x}, y=${y}`);
      logger.debug('Détails du clic', { x, y, activeLocation });
      
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
      const locationIndex = locations.findIndex(loc => loc.id === activeLocation);
      if (locationIndex !== -1) {
        // Mettre à jour l'objet locations global
        logger.debug('Mise à jour de l\'objet locations global', { index: locationIndex, id: locations[locationIndex].id, name: locations[locationIndex].name });
        locations[locationIndex].x = x;
        locations[locationIndex].y = y;
        
        // Mettre à jour les événements associés à ce lieu
        const locationEvents = events.filter(event => event.locationName === locations[locationIndex].name);
        logger.info(`Mise à jour de ${locationEvents.length} événements associés au lieu ${locations[locationIndex].name}`);
        locationEvents.forEach(event => {
          logger.debug('Mise à jour de l\'événement', { id: event.id, title: event.title, oldX: event.x, oldY: event.y, newX: x, newY: y });
          event.x = x;
          event.y = y;
        });
        
        logger.info(`Coordonnées mises à jour par clic pour ${locations[locationIndex].name} et ${locationEvents.length} événements associés`);
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
      
      // Mettre à jour les coordonnées dans l'application
      // Cette partie est importante pour que les changements soient visibles dans toute l'application
      const locationIndex = locations.findIndex(loc => loc.id === activeLocation);
      if (locationIndex !== -1) {
        logger.info(`Mise à jour des coordonnées dans l'objet global pour ${locations[locationIndex].name}`);
        
        // Mettre à jour l'objet locations global
        const oldX = locations[locationIndex].x;
        const oldY = locations[locationIndex].y;
        locations[locationIndex].x = coordinates.x;
        locations[locationIndex].y = coordinates.y;
        
        logger.debug('Coordonnées mises à jour dans l\'objet global', {
          id: locations[locationIndex].id,
          name: locations[locationIndex].name,
          oldX,
          oldY,
          newX: coordinates.x,
          newY: coordinates.y
        });
        
        // Mettre à jour les événements associés à ce lieu
        const locationEvents = events.filter(event => event.locationName === locations[locationIndex].name);
        logger.info(`Mise à jour de ${locationEvents.length} événements associés au lieu ${locations[locationIndex].name}`);
        
        locationEvents.forEach(event => {
          const oldEventX = event.x;
          const oldEventY = event.y;
          event.x = coordinates.x;
          event.y = coordinates.y;
          
          logger.debug('Événement mis à jour', {
            id: event.id,
            title: event.title,
            oldX: oldEventX,
            oldY: oldEventY,
            newX: coordinates.x,
            newY: coordinates.y
          });
        });
        
        logger.info(`Coordonnées mises à jour pour ${locations[locationIndex].name} et ${locationEvents.length} événements associés`);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin}>Connexion</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold text-[#4a5d94] text-center">Administration</h1>
          <div className="w-20"></div>
        </header>
        
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
            <div className="relative border border-[#d8e3ff] rounded-lg h-[calc(100vh-450px)] bg-[#f0f5ff] mb-4 overflow-hidden">
              {/* Map background with image */}
              <div 
                className="absolute inset-0 bg-white flex items-center justify-center"
                onClick={handleMapClick}
              >
                <img 
                  src="/Plan Île Feydeau.png" 
                  alt="Plan de l'Île Feydeau" 
                  className="max-w-full max-h-full object-contain"
                  style={{ opacity: 0.9 }}
                />
              </div>
              
              {/* Map locations overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                  {mapLocations.map((location) => (
                    <div 
                      key={location.id}
                      className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg border-2 border-white
                        ${activeLocation === location.id ? 'bg-[#ff7a45]' : 'bg-[#4a5d94]'}
                      `}
                      style={{ 
                        position: 'absolute',
                        left: `${location.x}px`, 
                        top: `${location.y}px`,
                        zIndex: 20
                      }}
                    />
                  ))}
                </div>
              </div>
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
