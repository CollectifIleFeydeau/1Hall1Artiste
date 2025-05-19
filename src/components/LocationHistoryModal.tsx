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
  const location = locationId ? locations.find(loc => loc.id === locationId) : undefined;

  if (!location || !location.history) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{location.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 whitespace-pre-line">
            {location.history}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
