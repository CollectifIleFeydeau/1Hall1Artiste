import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { locationHistories } from "@/data/locationHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { locations } from "@/data/locations";

export function LocationHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Récupérer le locationId depuis l'état de navigation s'il existe
    const locationIdFromState = location.state?.selectedLocationId;
    if (locationIdFromState && locationHistories.some(loc => loc.id === locationIdFromState)) {
      return locationIdFromState;
    }
    // Sinon, utiliser le premier emplacement disponible
    return locationHistories[0]?.id || null;
  });

  return (
    <div className="container max-w-md mx-auto px-4 pb-20 pt-4">
      <div className="flex items-center mb-6">
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

      <div className="grid grid-cols-1 gap-4 mb-6">
        {locationHistories.map((location) => (
          <Button
            key={location.id}
            variant={selectedLocation === location.id ? "default" : "outline"}
            className={selectedLocation === location.id ? "bg-[#4a5d94] text-white" : "border-[#4a5d94] text-[#4a5d94]"}
            onClick={() => setSelectedLocation(location.id)}
          >
            {location.name}
          </Button>
        ))}
      </div>

      {selectedLocation && (
        <Card className="shadow-md border-[#d8e3ff]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-[#4a5d94] flex justify-between items-center">
              {locationHistories.find(loc => loc.id === selectedLocation)?.name}
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#4a5d94] text-[#4a5d94] hover:bg-[#4a5d94] hover:text-white"
                onClick={() => {
                  const locationId = selectedLocation;
                  const location = locations.find(loc => loc.id === locationId);
                  if (location) {
                    navigate('/map', { state: { highlightLocationId: locationId } });
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Voir sur la carte
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {locationHistories.find(loc => loc.id === selectedLocation)?.fullHistory.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <div key={index} className="mb-4">
                      {paragraph.startsWith('#') ? (
                        <h3 className="text-xl font-bold text-[#4a5d94] mb-3 pb-1 border-b border-[#d8e3ff]">
                          {paragraph.replace('#', '').trim()}
                        </h3>
                      ) : (
                        <p className="text-[#4a5d94] leading-relaxed">{paragraph}</p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <BottomNavigation />
    </div>
  );
}
