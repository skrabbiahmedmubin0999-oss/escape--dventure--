import React, { useEffect, useState } from 'react';
import { Compass, Sliders, Hand, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';

interface MobileHelpOverlayProps {
  onDismiss: () => void;
}

export const MobileHelpOverlay: React.FC<MobileHelpOverlayProps> = ({ onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onDismiss, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="absolute inset-x-4 top-14 sm:top-18 z-[100] flex flex-col items-center pointer-events-none font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900/80 backdrop-blur-xl border border-amber-400/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl pointer-events-auto text-slate-100 relative overflow-hidden group"
      >
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/30 transition-colors" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase">Neural Interface</h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Auto-hides: {timeLeft}s</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer group/close"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 group-hover/close:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5 group/item hover:border-amber-400/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 font-mono text-xs font-black">01</div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-black text-white uppercase tracking-tight">Kinetic Stick:</span> Drag bottom-left region to navigate coordinates.
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/5 group/item hover:border-amber-400/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 font-mono text-xs font-black">02</div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-black text-white uppercase tracking-tight">Calibration:</span> Open <strong className="text-amber-400">Settings</strong> to resize & remap interface.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onDismiss();
          }}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] cursor-pointer active:scale-95"
        >
          Initialize Mission
        </button>

        {/* Progress Bar */}
        <div className="w-full bg-black/40 h-1 rounded-full mt-4 overflow-hidden p-px border border-white/5">
          <div
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 ease-linear shadow-[0_0_5px_rgba(251,191,36,0.5)]"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
};

