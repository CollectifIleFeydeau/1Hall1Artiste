import React from 'react';
import { Card } from "@/components/ui/card";
import { Event } from "@/data/events";
import { EventImage } from "@/components/EventImage";
import { getBackgroundFallback } from "@/utils/backgroundUtils";

export interface EventCardSimpleProps {
  event: Event;
  isSaved: boolean;
  isLiked: boolean;
  isSelected: boolean;
  onEventClick: () => void;
  showImage?: boolean;
  priority?: boolean;
  cardIndex?: number;
}

export const EventCardSimple: React.FC<EventCardSimpleProps> = ({ 
  event, 
  isSaved, 
  isLiked,
  isSelected,
  onEventClick,
  showImage = true,
  priority = false,
  cardIndex
}) => {
  if (!event || !event.id) return null;

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
      backgroundImage: `url('${getBackgroundFallback('Historical_Parchment_Background_Portrait.jpg')}')`,
      backgroundSize: 'cover',
      backgroundPosition: positions[intensity],
      opacity: 0.6,
      zIndex: 1, 
      transform: transform,
    };
  };

  return (
    <Card 
      className={`card-modern cursor-pointer border-0 shadow-lg grid grid-cols-[96px_1fr] md:grid-cols-[128px_1fr] transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-[#ff7a45]/50 border-[#ff7a45]' 
          : 'hover:shadow-xl'
      }`}
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
        {/* Section du haut : Titre */}
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
          {/* Indicateurs d'état */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {isLiked && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="Aimé"></div>
            )}
            {isSaved && (
              <div className="w-2 h-2 bg-[#ff7a45] rounded-full" title="Sauvegardé"></div>
            )}
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

export default EventCardSimple;
