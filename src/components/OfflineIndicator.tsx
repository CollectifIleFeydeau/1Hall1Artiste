import React from 'react';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Check from 'lucide-react/dist/esm/icons/check';

/**
 * Component that displays an indicator when the user is offline
 * and shows the status of offline data preloading
 */
export const OfflineIndicator: React.FC = () => {
  const { online, offlineReady, preloadingData, preloadData } = useOfflineMode();
  
  // Si l'utilisateur est en ligne et que les données sont préchargées, ne rien afficher
  if (online && offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div 
        className={`px-4 py-2 rounded-full shadow-md flex items-center gap-2 pointer-events-auto ${!online ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}
      >
        {!online && <WifiOff className="h-4 w-4" />}
        
        {!online && (
          <span className="text-sm font-medium">
            Mode hors ligne
            {offlineReady && ' (données disponibles)'}
          </span>
        )}
        
        {online && !offlineReady && (
          <>
            {preloadingData ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Préparation du mode hors-ligne...</span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Préparer le mode hors-ligne</span>
                <button 
                  onClick={() => preloadData()} 
                  className="ml-2 bg-blue-200 hover:bg-blue-300 text-blue-800 px-2 py-1 rounded text-xs"
                >
                  Activer
                </button>
              </>
            )}
          </>
        )}
        
        {online && offlineReady && (
          <>
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Mode hors-ligne prêt</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

