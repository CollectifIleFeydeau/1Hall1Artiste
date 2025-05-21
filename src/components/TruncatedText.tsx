import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  tooltipEnabled?: boolean;
  as?: React.ElementType;
}

/**
 * Composant pour afficher du texte tronqué avec une infobulle optionnelle
 * montrant le texte complet au survol
 */
export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 50,
  className = "",
  tooltipEnabled = false,
  as: Component = "span"
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  
  // Si le texte est plus court que la longueur maximale, l'afficher tel quel
  if (!text || text.length <= maxLength) {
    return <Component className={className}>{text}</Component>;
  }
  
  // Tronquer le texte et ajouter des points de suspension
  const truncatedText = `${text.substring(0, maxLength)}...`;
  
  // Si les infobulles sont désactivées, afficher simplement le texte tronqué
  if (!tooltipEnabled) {
    return <Component className={className}>{truncatedText}</Component>;
  }
  
  // Sinon, afficher le texte tronqué avec une infobulle
  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <Component 
            className={`${className} cursor-help`}
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            onTouchStart={() => setIsTooltipOpen(true)}
            onTouchEnd={() => setIsTooltipOpen(false)}
          >
            {truncatedText}
          </Component>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white text-black p-2 rounded shadow-md border border-gray-200">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
