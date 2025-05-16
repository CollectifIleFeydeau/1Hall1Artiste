import { useState } from "react";
import { Button } from "@/components/ui/button";
import Music from "lucide-react/dist/esm/icons/music";
import ImageIcon from "lucide-react/dist/esm/icons/image";

interface EventFilterProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

export function EventFilter({ onFilterChange, currentFilter }: EventFilterProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className={currentFilter === "all" ? "bg-[#ff7a45] hover:bg-[#ff9d6e]" : ""}
      >
        Tous
      </Button>
      <Button
        variant={currentFilter === "exposition" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("exposition")}
        className={currentFilter === "exposition" ? "bg-[#ff7a45] hover:bg-[#ff9d6e]" : ""}
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Expositions
      </Button>
      <Button
        variant={currentFilter === "concert" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("concert")}
        className={currentFilter === "concert" ? "bg-[#ff7a45] hover:bg-[#ff9d6e]" : ""}
      >
        <Music className="h-4 w-4 mr-2" />
        Concerts
      </Button>
    </div>
  );
}
