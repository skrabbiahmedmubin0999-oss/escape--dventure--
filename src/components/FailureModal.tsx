import React from 'react';
import { RefreshCw, Home, Clock, Sparkles, Coins, AlertTriangle } from 'lucide-react';

interface Props {
  reason?: string;
  crystalsCollected: number;
  totalCrystals: number;
  coinsCollected: number;
  timeElapsed: number;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

export const FailureModal: React.FC<Props> = ({
  reason = 'The dusk storm covered Mystery Island before all energy crystals were rescued!',
  crystalsCollected,
  totalCrystals,
  coinsCollected,
  timeElapsed,
  onRetry,
  onReturnToMenu,
}) => {
  const mins = Math.floor(timeElapsed / 60);
  const secs = Math.floor(timeElapsed % 60);
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto select-none font-sans">
      <div className="relative w-full max-w-md landscape:max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-red-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90dvh] ring-1 ring-red-500/20 animate-in zoom-in-95 duration-300">
        
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col landscape:flex-row flex-1 overflow-y-auto custom-scrollbar p-6 landscape:p-7 gap-5 landscape:gap-6 items-center">
          {/* Left Column: Icon, Title & Failure Reason */}
          <div className="flex flex-col items-center landscape:items-start text-center landscape:text-left landscape:w-5/12 shrink-0 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.25)] mb-3 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                Link Fragmented
              </h2>
            </div>
            <div className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30 mb-2">
              মিশন ব্যর্থ • সংযোগ বিচ্ছিন্ন
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-500/80 mb-3">
              Mission Critical Failure
            </p>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-slate-300 italic leading-relaxed">
              "{reason}"
            </div>
          </div>

          {/* Right Column: Mission Stats Breakdown & Actions */}
          <div className="flex-1 flex flex-col justify-center space-y-4 w-full relative z-10">
            {/* Mission Stats Breakdown */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-500 mb-0.5">Assets (কি)</span>
                <span className="text-base font-black text-white">
                  {crystalsCollected}/{totalCrystals}
                </span>
              </div>

              <div className="flex flex-col items-center border-x border-white/5">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-500 mb-0.5">Credits (কয়েন)</span>
                <span className="text-base font-black text-amber-400">
                  {coinsCollected}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-500 mb-0.5">Uptime (সময়)</span>
                <span className="text-base font-black text-slate-300 font-mono">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 w-full shrink-0">
              <button
                onClick={onRetry}
                className="w-full py-3.5 px-5 rounded-2xl bg-red-500 hover:bg-red-400 text-slate-950 font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Establish Link • আবার চেষ্টা করুন</span>
              </button>

              <button
                onClick={onReturnToMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Exit to Terminal • মূল মেনু</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
