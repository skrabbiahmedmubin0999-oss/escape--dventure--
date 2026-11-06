import React, { useEffect, useState } from 'react';
import { Compass, Eye, Shield, Swords, Sparkles, Zap, Crosshair } from 'lucide-react';
import { sound } from '../audio/soundSystem';

interface GameLoadingScreenProps {
  missionTitle?: string;
  missionDescription?: string;
  playerName?: string;
  playerTitle?: string;
  onLoadingComplete: () => void;
}

const TACTICAL_TIPS = [
  "Shadows and dense vegetation reduce enemy line-of-sight awareness by up to 75%.",
  "Distract guards by throwing pebbles near patrol intersections to create safe infiltration windows.",
  "Time your blade strikes just as the enemy attacks to execute an unblockable Guard Parry.",
  "Firearm usage produces loud acoustic signatures—use only when stealth is compromised.",
  "Ancient elemental keys are guarded by patrolling elites; study their movement routes before striking.",
  "Checkpoints save your health, inventory, and mission progress across the island.",
  "Hold Hide/Crouch to move silently behind guards without triggering footstep detection.",
];

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  missionTitle = 'Shadow Escape - Island Fortress',
  missionDescription = 'Infiltrate the high-security ancient ruins, bypass patrolling guards, collect 3 elemental keys, and activate the escape portal.',
  playerName = 'Alex The Explorer',
  playerTitle = 'Island Quest Pioneer',
  onLoadingComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Rotate tips every 2.5 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TACTICAL_TIPS.length);
    }, 2500);
    return () => clearInterval(tipInterval);
  }, []);

  // Simulate smooth 3D scene compilation & resource loading
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 18 + 8;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setIsReady(true);
        clearInterval(interval);
      } else {
        setProgress(Math.floor(current));
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    sound.playClick();
    onLoadingComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col justify-between p-3 xs:p-4 sm:p-8 pt-[max(12px,env(safe-area-inset-top,12px))] pb-[max(12px,env(safe-area-inset-bottom,12px))] font-sans select-none overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar: Explorer Identity */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-2xl mx-auto pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wide">{playerName}</div>
            <div className="text-xs font-bold text-amber-400/90">{playerTitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3D Engine Ready</span>
        </div>
      </div>

      {/* Center Tactical Briefing Card */}
      <div className="relative z-10 my-auto max-w-sm w-[95%] mx-auto bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3 text-left backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Tactical Briefing</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
            CLASSIFIED
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
            {missionTitle}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
            {missionDescription}
          </p>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
            <Eye className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            <div className="text-[8px] font-bold text-slate-400 uppercase">Stealth</div>
            <div className="text-[10px] font-black text-slate-200">Ghost</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
            <Shield className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
            <div className="text-[8px] font-bold text-slate-400 uppercase">Defense</div>
            <div className="text-[10px] font-black text-slate-200">Parry</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
            <Crosshair className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
            <div className="text-[8px] font-bold text-slate-400 uppercase">Objective</div>
            <div className="text-[10px] font-black text-slate-200">Portal</div>
          </div>
        </div>

        {/* Rotating Tip Box */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 space-y-1">
          <div className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Field Advisor Tip
          </div>
          <p className="text-[10px] text-slate-300 font-medium leading-normal min-h-[30px] transition-all duration-300">
            "{TACTICAL_TIPS[tipIndex]}"
          </p>
        </div>

        {/* Progress Bar & Start CTA */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-300">
            <span>{isReady ? 'Infiltration Ready' : 'Compiling Shaders...'}</span>
            <span className="text-amber-400">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-150 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>

          {isReady && (
            <button
              onClick={handleStart}
              className="mt-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest shadow-2xl border-2 border-amber-200 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer animate-pulse"
            >
              Deploy Now
            </button>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 text-center text-[10px] font-mono text-slate-500 pb-2">
        ESCAPE ADVENTURE • 3D ISLAND ENGINE • ALL SYSTEMS OPERATIONAL
      </div>
    </div>
  );
};
