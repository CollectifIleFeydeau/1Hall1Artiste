import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Info } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locations } from "@/data/locations";

export function LocationHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filtrer uniquement les lieux qui ont un historique
  const locationsWithHistory = locations.filter(loc => loc.history);
  
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Récupérer le locationId depuis l'état de navigation s'il existe
    const locationIdFromState = location.state?.selectedLocationId;
    if (locationIdFromState && locationsWithHistory.some(loc => loc.id === locationIdFromState)) {
      return locationIdFromState;
    }
    // Sinon, utiliser le premier emplacement disponible
    return locationsWithHistory[0]?.id || null;
  });

  // Trouver le lieu sélectionné
  const selectedLocationData = locationsWithHistory.find(loc => loc.id === selectedLocation);

  return (
    <div className="container max-w-md mx-auto px-4 pb-20 pt-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Histoire des lieux</h1>
      </div>

      {/* Liste déroulante des lieux */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2 text-[#4a5d94]">Sélectionnez un lieu</h2>
        <Select
          value={selectedLocation}
          onValueChange={(value) => setSelectedLocation(value)}
        >
          <SelectTrigger className="w-full border-[#4a5d94] text-[#4a5d94]">
            <SelectValue placeholder="Choisir un lieu" />
          </SelectTrigger>
          <SelectContent>
            {locationsWithHistory.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Détails du lieu sélectionné */}
      {selectedLocationData ? (
        <Card className="shadow-md border-[#d8e3ff] mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-xl font-bold text-[#4a5d94]">
                {selectedLocationData.name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#4a5d94] text-[#4a5d94] hover:bg-[#4a5d94] hover:text-white"
                onClick={() => {
                  navigate('/map', { state: { highlightLocationId: selectedLocationData.id } });
                }}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Voir sur la carte
              </Button>
            </div>
            <CardDescription className="text-sm text-slate-600 mb-2">
              {selectedLocationData.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-base font-bold text-[#4a5d94] mb-3 pb-1 border-b border-[#d8e3ff]">
              Histoire complète
            </h3>
            
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {selectedLocationData.history?.split('\n\n').map((paragraph, index) => (
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
                ))}
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

      <BottomNavigation />
    </div>
  );
}
