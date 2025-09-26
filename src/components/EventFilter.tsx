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
    <div className="flex justify-center space-x-2 mb-4">
      <Button
        variant={currentFilter === "exposition" ? "default" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("exposition")}
        className={`rounded-full px-4 py-2 border ${
          currentFilter === "exposition" 
            ? "bg-[#ff7a45] hover:bg-[#ff9d6e] text-white border-[#ff7a45]"
            : "bg-transparent text-gray-700 hover:bg-gray-100 border-gray-300"
        }`}
      >
        Expositions
      </Button>
      <Button
        variant={currentFilter === "concert" ? "default" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("concert")}
        className={`rounded-full px-4 py-2 border ${
          currentFilter === "concert" 
            ? "bg-[#ff7a45] hover:bg-[#ff9d6e] text-white border-[#ff7a45]"
            : "bg-transparent text-gray-700 hover:bg-gray-100 border-gray-300"
        }`}
      >
        Concerts
      </Button>
    </div>
  );
}
