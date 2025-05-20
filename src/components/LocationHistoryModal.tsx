import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { locations } from "@/data/locations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationHistoryModalProps {
  locationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationHistoryModal({
  locationId,
  isOpen,
  onClose,
}: LocationHistoryModalProps) {
  // Gérer le cas spécial du 9 quai Turenne qui a deux points sur la carte
  // Si on a quai-turenne-9-concert, utiliser quai-turenne-9 pour l'historique
  const normalizedLocationId = locationId === "quai-turenne-9-concert" ? "quai-turenne-9" : locationId;
  
  // Trouver l'emplacement correspondant
  const location = normalizedLocationId ? locations.find(loc => loc.id === normalizedLocationId) : undefined;
  
  // Si l'emplacement n'existe pas ou n'a pas d'historique, ne rien afficher
  if (!location || !location.history) {
    return null;
  }
  
  // Utiliser l'historique de l'emplacement
  const historyText = location.history;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{location.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 whitespace-pre-line">
            {historyText}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
