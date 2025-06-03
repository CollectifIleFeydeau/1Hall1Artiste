import Settings from "lucide-react/dist/esm/icons/settings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

export function SettingsToggle() {
  // Use local state instead of context to avoid type issues
  const [mapFirstExperience, setMapFirstExperience] = useState<boolean>(() => {
    const saved = localStorage.getItem('mapFirstExperience');
    return saved ? JSON.parse(saved) : false;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mapFirstExperience', JSON.stringify(mapFirstExperience));
  }, [mapFirstExperience]);

  const toggleMapFirstExperience = () => {
    setMapFirstExperience(prev => !prev);
    // Reload the page to apply the new setting
    setTimeout(() => window.location.href = mapFirstExperience ? '/map' : '/', 300);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-110">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Paramètres d'affichage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
          <span>Mode carte principale</span>
          <Switch 
            checked={mapFirstExperience} 
            onCheckedChange={toggleMapFirstExperience}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
