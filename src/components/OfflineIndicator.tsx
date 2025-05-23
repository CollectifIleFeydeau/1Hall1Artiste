import React, { useState, useEffect } from 'react';
import { isOnline, addOnlineStatusListener } from '@/utils/serviceWorkerRegistration';
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off';

/**
 * Component that displays an indicator when the user is offline
 */
export const OfflineIndicator: React.FC = () => {
  const [offline, setOffline] = useState(!isOnline());

  useEffect(() => {
    // Set up listeners for online/offline events
    const cleanup = addOnlineStatusListener((online) => {
      setOffline(!online);
    });

    // Clean up listeners on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full shadow-md flex items-center gap-2 pointer-events-auto">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Mode hors ligne</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
