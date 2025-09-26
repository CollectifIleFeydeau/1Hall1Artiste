import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Event } from "@/data/events";
import Heart from "lucide-react/dist/esm/icons/heart";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import { EventImage } from "@/components/EventImage";

export interface EventCardModernProps {
  event: Event;
  isSaved: boolean;
  onEventClick: () => void;
  onSaveClick: (e: React.MouseEvent) => void;
  showImage?: boolean;
  priority?: boolean;
  cardIndex?: number;
}

export const EventCardModern: React.FC<EventCardModernProps> = ({ 
  event, 
  isSaved, 
  onEventClick, 
  onSaveClick,
  showImage = true,
  priority = false,
  cardIndex
}) => {
  if (!event || !event.id) return null;

  const [isLiked, setIsLiked] = React.useState(false);

  const handleActionClick = (e: React.MouseEvent, action: (e: React.MouseEvent) => void) => {
    e.stopPropagation();
    action(e);
  };

  const getEventBackgroundStyle = (): React.CSSProperties => ({
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  });

  const getEventBackgroundPseudoElementStyle = (index?: number): React.CSSProperties => {
    const intensity = index !== undefined ? index % 4 : 0;
    const positions = ['top left', 'top right', 'bottom left', 'bottom right'];
    let transform = 'none';
    if (intensity === 1 || intensity === 3) {
      transform = 'scaleX(-1)';
    }

    return {
      content: '""',
      position: 'absolute',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundImage: `url('/images/background/Historical Parchment Background Portrait.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: positions[intensity],
      opacity: 0.6,
      zIndex: 1, 
      transform: transform,
    };
  };

  return (
    <Card 
      className="card-modern cursor-pointer border-0 shadow-lg grid grid-cols-[96px_1fr] md:grid-cols-[128px_1fr]"
      style={getEventBackgroundStyle()}
      onClick={onEventClick}
    >
      <div style={getEventBackgroundPseudoElementStyle(cardIndex)} />
      
      {/* Colonne 1: Image */}
      {showImage && (
        <div className="relative z-10">
          <EventImage
            event={event}
            size="medium"
            priority={priority}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Colonne 2: Contenu */}
      <div className="relative z-10 flex-1 min-w-0 p-4 flex flex-col">
        {/* Section du haut : Titre et Boutons */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className='font-bold text-lg leading-tight text-[#1a2138]'>
              {event.title}
            </h3>
            {event.artistName && (
              <p className="text-sm text-[#1a2138] mt-1 font-medium">
                {event.artistName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <Button variant="ghost" size="icon" className="p-1 h-auto text-[#1a2138] hover:bg-blue-50 rounded-full" onClick={(e) => handleActionClick(e, () => setIsLiked(!isLiked))}>
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="p-1 h-auto text-[#1a2138] hover:bg-blue-50 rounded-full" onClick={(e) => handleActionClick(e, onSaveClick)}>
              {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Espaceur qui pousse le contenu du bas vers le bas */}
        <div className="flex-grow"></div>

        {/* Section du bas : Infos et Badge */}
        <div>
          <div className="text-gray-500 text-sm space-y-1">
            <p>{event.time}</p>
            <p>{event.locationName}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">
              {event.type === 'exposition' ? 'Exposition' : 'Concert'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventCardModern;