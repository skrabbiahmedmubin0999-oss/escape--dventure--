import React, { useEffect, useState } from 'react';
import { Compass, Eye, Shield, Swords, Sparkles, Zap, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Rotate tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TACTICAL_TIPS.length);
    }, 3000);
    return () => clearInterval(tipInterval);
  }, []);

  // Simulate smooth 3D scene compilation & resource loading
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setIsReady(true);
        clearInterval(interval);
      } else {
        setProgress(Math.floor(current));
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    sound.playClick();
    onLoadingComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col justify-between p-6 xs:p-8 sm:p-12 font-sans select-none overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      {/* Top Bar: Neural Link Identity */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="text-lg font-black text-white tracking-widest uppercase">{playerName}</div>
            <div className="text-[10px] font-black text-amber-400/80 uppercase tracking-[0.3em]">{playerTitle}</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">3D_ENGINE // STABLE</span>
        </div>
      </motion.div>

      {/* Center Tactical Briefing Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 my-auto max-w-md landscape:max-w-xl w-full mx-auto bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 text-center flex flex-col items-center justify-center max-h-[85dvh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 w-full">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Deployment Briefing</span>
          </div>
          <div className="px-2.5 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[9px] font-mono font-black text-amber-400 tracking-widest">
            LVL_AUTH_4
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-none">
            {missionTitle}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
            {missionDescription}
          </p>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { icon: Eye, label: 'Infiltration', sub: 'Ghost', color: 'text-emerald-400' },
            { icon: Shield, label: 'Tactical', sub: 'Parry', color: 'text-sky-400' },
            { icon: Crosshair, label: 'Extraction', sub: 'Portal', color: 'text-red-400' },
          ].map((item, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-2 text-center group hover:border-white/10 transition-colors">
              <item.icon className={`w-4 h-4 ${item.color} mx-auto mb-1 opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>
              <div className="text-[9px] font-black text-slate-200 uppercase tracking-tight">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Rotating Tip Box */}
        <div className="bg-black/40 border border-amber-400/20 rounded-xl p-3 relative overflow-hidden group w-full text-center">
          <div className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-400/80 mb-1 flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3" /> Intelligence Feed
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-relaxed italic max-w-md mx-auto"
            >
              "{TACTICAL_TIPS[tipIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar & Start CTA */}
        <div className="space-y-2.5 pt-0.5 w-full">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              {!isReady && <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />}
              <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                {isReady ? 'Neural Link Optimized' : 'Synthesizing Shaders'}
              </span>
            </div>
            <span className="text-xs font-black font-mono text-amber-400 tabular-nums">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <AnimatePresence>
            {isReady && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleStart}
                className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95 cursor-pointer text-center"
              >
                Infiltrate Sector • অভিযান শুরু করুন
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-center space-y-1 mx-auto"
      >
        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.4em]">
          Link-OS // Island Node v4.8.2 // All Systems Nominal
        </div>
        <div className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
          Proprietary Neural Interface • Mystery Island Sector
        </div>
      </motion.div>
    </div>
  );
};

