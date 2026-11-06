import React, { useEffect, useState } from 'react';
import { Compass, Sliders, Hand, X, Sparkles } from 'lucide-react';
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
    <div className="absolute inset-x-4 top-16 z-40 flex flex-col items-center pointer-events-none animate-fade-in font-sans">
      <div className="bg-slate-900/90 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 max-w-sm w-full shadow-2xl backdrop-blur-md pointer-events-auto text-slate-100 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white">Touch Controls Guide</h3>
              <p className="text-[10px] text-amber-400 font-bold">Auto-hides in {timeLeft}s</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-300 font-medium mb-3">
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 font-bold">1</div>
            <div>
              <span className="font-bold text-white">Virtual Joystick:</span> Drag bottom-left thumbstick to move around.
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 font-bold">2</div>
            <div>
              <span className="font-bold text-white">Custom Layouts:</span> Open <strong className="text-amber-400">Settings</strong> to reposition & resize buttons!
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onDismiss();
          }}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg cursor-pointer active:scale-95 flex items-center justify-center"
        >
          Got It, Let's Play!
        </button>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
