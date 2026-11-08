import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed left-1/2 z-[100] font-sans"
          style={{ top: 'max(10px, env(safe-area-inset-top, 10px))' }}
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-400/40 text-amber-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[92vw]">
            <div className="p-2 bg-amber-400/10 rounded-xl text-amber-400 border border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Connection Interrupted</span>
              <span className="text-xs font-bold text-white tracking-tight leading-none mt-0.5">
                Offline Mode Active — Running from local cache
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

