import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/data/events";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import Clock from "lucide-react/dist/esm/icons/clock";
import { TruncatedText } from "@/components/TruncatedText";
import { LikeButton } from "@/components/community/LikeButton";

import React from "react";

export interface EventCardProps {
  event: Event;
  isSaved: boolean;
  onEventClick: () => void;
  onSaveClick: (e: React.MouseEvent) => void;
}

export const EventCard = ({ event, isSaved, onEventClick, onSaveClick }: EventCardProps) => {
  return (
    <Card 
      className="shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={onEventClick}
    >
      <div className={`h-1 ${event.type === "exposition" ? "bg-[#4a5d94]" : "bg-[#ff7a45]"}`} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-[#1a2138]">
              <TruncatedText 
                text={event.title} 
                maxLength={25} 
                className="font-medium text-[#1a2138]"
              />
            </h3>
            {/* N'afficher le nom de l'artiste que pour les expositions */}
            {event.type === "exposition" && (
              <p className="text-sm text-[#4a5d94]">
                <TruncatedText 
                  text={event.artistName} 
                  maxLength={20} 
                  className="text-sm text-[#4a5d94]"
                />
              </p>
            )}
            <div className="flex flex-col space-y-1 mt-1">
              {/* Horaires avec icône d'horloge */}
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-[#ff7a45]" />
                <p className="text-xs font-medium text-[#ff7a45]">
                  {event.time}
                </p>
              </div>
              
              {/* Lieu avec icône de localisation */}
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-[#8c9db5]" />
                <p className="text-xs text-[#8c9db5]">
                  <TruncatedText 
                    text={event.locationName}
                    maxLength={30} 
                    className="text-xs text-[#8c9db5]"
                  />
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1">
              {/* Bouton de like */}
              <LikeButton 
                entryId={`event-${event.id}`}
                variant="compact"
                showCount={true}
                className="scale-75 -mr-1"
              />
              
              {/* Bouton bookmark */}
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                  isSaved 
                    ? 'bg-amber-50 border-amber-500 text-amber-500' 
                    : 'bg-white/70 border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-500'
                }`}
                onClick={onSaveClick}
                title={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-full ${
              event.type === "exposition" 
                ? "bg-[#e0ebff] text-[#4a5d94]" 
                : "bg-[#fff2ee] text-[#ff7a45]"
            }`}>
              {event.type === "exposition" ? "Exposition" : "Concert"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
