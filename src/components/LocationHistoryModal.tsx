import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLocationHistoryById } from "@/data/locationHistory";
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
  const locationHistory = locationId ? getLocationHistoryById(locationId) : undefined;

  if (!locationHistory) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{locationHistory.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 whitespace-pre-line">
            {locationHistory.fullHistory}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
