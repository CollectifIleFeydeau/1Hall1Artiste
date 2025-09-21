import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VersionBadgeProps {
  className?: string;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ className = '' }) => {
  // Récupération de la version depuis package.json
  const version = '1.4.0'; // Sera mis à jour automatiquement par le script de release
  
  const handleChangelogClick = () => {
    window.open('https://github.com/CollectifIleFeydeau/1Hall1Artiste/blob/main/CHANGELOG.md', '_blank');
  };

  return (
    <TooltipProvider>
      <div className={`fixed bottom-20 right-4 z-[9999] ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="
                inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                cursor-pointer transition-all duration-200 select-none
                opacity-100 bg-background/90 backdrop-blur-sm border border-border/50
                shadow-md hover:shadow-lg text-muted-foreground hover:text-foreground
                hover:scale-105 active:scale-95
              "
              onClick={handleChangelogClick}
              onMouseDown={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChangelogClick();
                }
              }}
            >
              <Info className="w-3 h-3 mr-1" />
              v{version}
              <span className="ml-1 text-xs">↗</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-sm">
              Version {version} - Cliquez pour voir le changelog
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default VersionBadge;
