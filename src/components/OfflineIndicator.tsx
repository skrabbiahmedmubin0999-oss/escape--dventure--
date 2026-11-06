import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, Download, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio/soundSystem';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline && dismissed) return null;

  return (
    <div 
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 font-sans ${!isOnline ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}
      style={{ top: 'max(10px, env(safe-area-inset-top, 10px))' }}
    >
      <div className="bg-amber-950/95 border-2 border-amber-500/80 text-amber-200 px-3.5 py-1.5 xs:px-4 xs:py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md max-w-[92vw]">
        <div className="p-1.5 bg-amber-500/20 rounded-xl text-amber-400 animate-pulse shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="text-[11px] xs:text-xs font-bold tracking-wide truncate">
          <span>Offline Mode</span> — Running from local cache!
        </div>
      </div>
    </div>
  );
};
