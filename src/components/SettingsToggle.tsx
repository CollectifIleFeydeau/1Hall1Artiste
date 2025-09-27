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
}

