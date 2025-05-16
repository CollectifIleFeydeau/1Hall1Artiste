
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const navigate = useNavigate();
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const locations = [
    { id: "hall1", name: "Hall Principal", x: 30, y: 40, visited: true },
    { id: "courtyard", name: "Cour Intérieure", x: 60, y: 55, visited: false },
    { id: "hall2", name: "Galerie Est", x: 75, y: 30, visited: false },
    { id: "garden", name: "Jardin", x: 45, y: 75, visited: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-bold ml-2">Carte & Parcours</h1>
        </header>
        
        <div className="bg-white rounded-lg p-4 shadow-md mb-4">
          <div className="relative border-2 border-gray-200 rounded-lg h-80 bg-gray-50 mb-4">
            {/* Simplified map illustration */}
            <div className="absolute inset-0 p-2">
              <div className="w-full h-full relative border border-dashed border-gray-300 rounded">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Carte du quartier
                </div>
                
                {locations.map((location) => (
                  <div 
                    key={location.id}
                    className={`absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer
                      ${activeLocation === location.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      ${location.visited ? 'bg-green-500' : 'bg-gray-400'}
                    `}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    onClick={() => setActiveLocation(location.id)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Visité</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                <span>Non visité</span>
              </div>
            </div>
            <p>Cliquez sur les points pour plus d'informations sur chaque lieu.</p>
          </div>
        </div>
        
        {activeLocation && (
          <Card className="mb-4 animate-fade-in">
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">
                {locations.find(l => l.id === activeLocation)?.name}
              </h3>
              <p className="text-sm text-gray-600">
                Description du lieu et activités disponibles ici. Cliquez sur le programme pour plus de détails.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Map;
