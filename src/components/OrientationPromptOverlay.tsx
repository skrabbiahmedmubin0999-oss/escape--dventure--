import React from 'react';
import { Smartphone, RotateCw, Maximize2, ShieldAlert } from 'lucide-react';
import { requestLandscapeAndFullscreen } from '../utils/orientation';

interface OrientationPromptOverlayProps {
  isPortrait: boolean;
  isMobile: boolean;
}

/**
 * Strict Landscape Mode Blocker.
 * Strictly enforces landscape orientation on mobile and touch devices.
 * Removes any portrait bypass so that all gameplay, menus, and controls
 * remain 100% inside landscape mode.
 */
export const OrientationPromptOverlay: React.FC<OrientationPromptOverlayProps> = ({
  isPortrait,
  isMobile,
}) => {
  // If in landscape mode, or not on mobile/touch screen, do not show
  if (!isPortrait || !isMobile) {
    return null;
  }

  const handleEnterLandscape = async () => {
    await requestLandscapeAndFullscreen();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Strict Landscape Mode Enforced"
      className="fixed inset-0 z-[99999] pointer-events-auto flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300 font-sans select-none"
    >
      <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-amber-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.95)] ring-2 ring-amber-400/30 text-center flex flex-col items-center gap-5">
        
        {/* Animated Phone Rotation Graphic */}
        <div className="relative w-28 h-28 flex items-center justify-center my-1">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />

          {/* Orbiting Rotating Dashed Ring */}
          <div className="relative w-24 h-24 rounded-3xl border-2 border-dashed border-amber-400/40 flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <RotateCw className="w-6 h-6 text-amber-400/50" />
          </div>

          {/* Central Animated Phone */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-2xl transition-transform duration-700 animate-[bounce_2.5s_ease-in-out_infinite] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-between p-2 relative overflow-hidden">
                <div className="w-4 h-0.5 rounded-full bg-amber-400/60" />
                <Smartphone className="w-8 h-8 text-amber-400 -rotate-90 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <div className="w-2 h-2 rounded-full bg-amber-400/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Header & Instructions */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Landscape Mode Locked</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider italic">
            Rotate To Landscape
          </h2>

          <div className="space-y-1.5 pt-1">
            <p className="text-amber-200/90 text-xs font-bold leading-relaxed">
              ফোনটি আড়াআড়ি (Landscape) করুন
            </p>
            <p className="text-slate-300 text-[11px] font-medium leading-relaxed max-w-xs">
              গেমের সমস্ত কন্ট্রোল, ট্যাকটিকাল ভিউ এবং থ্রিডি ক্যামেরা শুধুমাত্র ল্যান্ডস্কেপ মোডেই চলে। খেলার জন্য ডিভাইসটি ঘুরিয়ে নিন।
            </p>
          </div>
        </div>

        {/* Action Button: Auto-Lock & Fullscreen */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <button
            onClick={handleEnterLandscape}
            className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 active:from-amber-500 active:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_12px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Lock Landscape Fullscreen</span>
          </button>

          <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
            (অটো-রোটেট অন করে ফোনটি পাশে ঘোরান)
          </p>
        </div>
      </div>
    </div>
  );
};
