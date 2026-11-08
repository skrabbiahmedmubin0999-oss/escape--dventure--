import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Settings,
  Home,
  Compass,
  Sun,
  Droplets,
  Trees,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Check,
  Hand,
  Coins,
  Package,
  Sparkles,
  Cloud,
  Moon,
  Wind,
  Trophy,
  Briefcase,
  Heart,
  Activity,
  Crosshair,
  Play,
  Maximize2,
  Minimize2,
  QrCode,
} from 'lucide-react';
import { QuestProgress, EnvironmentState, TimeOfDay, WeatherType, ControlLayoutConfig } from '../game/types';
import { toggleFullscreenAndLandscape } from '../utils/orientation';
import { sound } from '../audio/soundSystem';

interface GameHUDProps {
  quest: QuestProgress;
  prompt: string | null;
  tutorialNotice: { title: string; text: string } | null;
  onDismissTutorial: () => void;
  onOpenSettings: () => void;
  onOpenPause?: () => void;
  onOpenShare?: () => void;
  onReturnToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerInteract?: () => void;
  environmentState?: EnvironmentState;
  onChangeTimeOfDay?: (time: TimeOfDay) => void;
  onChangeWeather?: (weather: WeatherType) => void;
  onToggleAutoCycle?: () => void;
  onOpenInventory?: () => void;
  onOpenAchievements?: () => void;
  showFps?: boolean;
  playerPos?: { x: number; z: number; rotation: number };
  stealthLevel?: number;
  stealthState?: 'patrol' | 'suspicious' | 'investigate' | 'chase' | 'search' | 'disabled';
  stoneCooldownRemaining?: number;
  onStartMission?: () => void;
  onThrowStone?: () => void;
  // Phase 7 Combat
  playerHealth?: number;
  maxPlayerHealth?: number;
  ammoCount?: number;
  maxAmmo?: number;
  layout?: ControlLayoutConfig;
  getPerformanceStats?: () => {
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    usedHeapMB: number | null;
    totalHeapMB: number | null;
  } | undefined;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  quest,
  prompt,
  tutorialNotice,
  onDismissTutorial,
  onOpenSettings,
  onOpenPause,
  onOpenShare,
  onReturnToMenu,
  isMuted,
  onToggleMute,
  onTriggerInteract,
  environmentState,
  onChangeTimeOfDay,
  onChangeWeather,
  onToggleAutoCycle,
  onOpenInventory,
  onOpenAchievements,
  showFps,
  playerPos = { x: -22, z: 24, rotation: 0 },
  stealthLevel = 0,
  stealthState = 'patrol',
  stoneCooldownRemaining = 0,
  onStartMission,
  onThrowStone,
  playerHealth = 100,
  maxPlayerHealth = 100,
  ammoCount = 0,
  maxAmmo = 0,
  layout,
  getPerformanceStats,
}) => {
  const [isQuestDetailsOpen, setIsQuestDetailsOpen] = useState(false);
  const [isEnvPanelOpen, setIsEnvPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [floatingXpPopups, setFloatingXpPopups] = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUpBanner, setLevelUpBanner] = useState<{ level: number } | null>(null);
  const prevXpRef = React.useRef(quest.xpEarned);
  const prevLevelRef = React.useRef(Math.floor(quest.xpEarned / 250) + 1);

  React.useEffect(() => {
    const currentXp = quest.xpEarned;
    const prevXp = prevXpRef.current;
    if (currentXp > prevXp) {
      const diff = currentXp - prevXp;
      const id = `xp_${Date.now()}_${Math.random()}`;
      setFloatingXpPopups((prev) => [...prev, { id, amount: diff }]);
      setTimeout(() => {
        setFloatingXpPopups((prev) => prev.filter((p) => p.id !== id));
      }, 1800);

      const currentLevel = Math.floor(currentXp / 250) + 1;
      const prevLevel = prevLevelRef.current;
      if (currentLevel > prevLevel) {
        setLevelUpBanner({ level: currentLevel });
        sound.playLevelUp();
        setTimeout(() => {
          setLevelUpBanner(null);
        }, 3500);
      }
      prevLevelRef.current = currentLevel;
    }
    prevXpRef.current = currentXp;
  }, [quest.xpEarned]);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Keyboard shortcut listener to start expedition when briefing is active
  React.useEffect(() => {
    if (quest.missionPhase !== 'orient') return;
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        onStartMission?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [quest.missionPhase, onStartMission]);

  // Format elapsed time (mm:ss)
  const minutes = Math.floor(quest.timeElapsed / 60);
  const seconds = Math.floor(quest.timeElapsed % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Current objective summary
  let currentObjective = `Find Keys (${quest.keysCount}/3)`;
  if (quest.gateUnlocked) {
    currentObjective = 'Portal Open! Step In';
  } else if (quest.gateOpening) {
    currentObjective = 'Portal Opening...';
  } else if (quest.altarActivated) {
    currentObjective = 'Escape via Grand Gate';
  } else if (quest.keysCount >= 3) {
    currentObjective = 'Activate Rune Altar';
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 0. MISSION ORIENTATION OVERLAY                           */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 0. MISSION ORIENTATION OVERLAY                           */}
      {/* ======================================================== */}
      {quest.missionPhase === 'orient' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto flex items-center justify-center p-3 sm:p-4 z-[100] animate-in fade-in duration-500">
          <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-3.5 sm:p-5 max-w-sm landscape:max-w-2xl w-full shadow-[0_32px_64px_rgba(0,0,0,0.8)] text-center transform animate-in zoom-in-95 duration-300 flex flex-col landscape:flex-row landscape:items-center landscape:text-left gap-3 landscape:gap-5 max-h-[85dvh] overflow-y-auto custom-scrollbar">
            {/* Left Column: Icon & Story Briefing */}
            <div className="flex flex-col items-center landscape:items-start landscape:w-5/12 shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg rotate-2 mb-2">
                <Compass className="w-6 h-6 text-slate-950 -rotate-2" />
              </div>
              
              <div className="space-y-0.5 mb-1">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider italic">Expedition Briefing</h2>
                <div className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 inline-block">
                  অভিযান ব্রিফিং • ল্যান্ডস্কেপ মোড
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase tracking-wider mt-0.5">
                <Activity className="w-3 h-3" /> <span>Tactical Stealth Protocol</span>
              </div>
            </div>

            {/* Right Column: Mission Details & Start Button */}
            <div className="flex-1 space-y-2.5">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 text-left">
                <p className="text-slate-200 text-xs font-medium leading-relaxed">
                  দ্বীপের রহস্যময় ধ্বংসাবশেষ থেকে ৩টি মৌল শক্তির কি (<span className="text-amber-400 font-black uppercase">3 Elemental Keys</span>) উদ্ধার করুন।
                </p>
                <p className="text-slate-300 text-[10px] sm:text-[11px] font-medium leading-relaxed">
                  সব কি উদ্ধার করার পর সেন্ট্রাল <span className="text-amber-400 font-bold">Rune Altar</span> সক্রিয় করে গ্র্যান্ড পোর্টাল দিয়ে বের হয়ে আসুন।
                </p>
              </div>

              <button
                onClick={() => onStartMission?.()}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-[0_12px_24px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_32px_rgba(245,158,11,0.35)] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Begin Mission • অভিযান শুরু করুন</span>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP HUD DECK                                          */}
      {/* ======================================================== */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-auto flex flex-col gap-2 p-3 sm:p-5"
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          paddingLeft: 'max(12px, env(safe-area-inset-left, 12px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 12px))',
        }}
      >
        <div className="flex items-start justify-between gap-3 max-w-full w-full">
          {/* Left: Mission Status */}
          {layout?.objectiveTracker?.enabled !== false && (
            <div
              className="flex flex-col gap-2 transition-transform"
              style={layout?.objectiveTracker ? {
                transform: `translate(${layout.objectiveTracker.x}px, ${layout.objectiveTracker.y}px) scale(${layout.objectiveTracker.scale})`,
                opacity: layout.objectiveTracker.opacity,
                transformOrigin: 'top left',
              } : undefined}
            >
              <button
                onClick={() => setIsQuestDetailsOpen(!isQuestDetailsOpen)}
                className="bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-white border border-white/10 rounded-2xl pl-3 pr-4 py-2 flex items-center gap-3 shadow-2xl transition-all cursor-pointer group"
              >
                <div className="relative">
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                   <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[2px]" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-1">Active Objective</span>
                  <span className="text-sm font-black text-white truncate max-w-[140px] xs:max-w-[180px]">
                    {currentObjective}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-white/10 mx-1" />
                <span className="text-xs font-mono font-black text-white tabular-nums tracking-tighter">
                  {timeFormatted}
                </span>
                {isQuestDetailsOpen ? (
                  <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white" />
                )}
              </button>

              {isQuestDetailsOpen && (
                <div className="w-64 sm:w-72 bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-300 space-y-3">
                   {/* Objectives List */}
                   <div className="space-y-2.5">
                      {[
                        { label: 'Elemental Keys', progress: `${quest.keysCount}/3`, done: quest.keysCount === 3 },
                        { label: 'Ancient Altar', progress: quest.altarActivated ? 'COMPLETED' : 'PENDING', done: quest.altarActivated },
                        { label: 'Escape Gate', progress: quest.gateUnlocked ? 'READY' : 'LOCKED', done: quest.gateUnlocked }
                      ].map((obj, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
                           <span className={`font-bold tracking-wide uppercase ${obj.done ? 'text-emerald-400' : 'text-white/60'}`}>{obj.label}</span>
                           <span className={`font-black tabular-nums ${obj.done ? 'text-emerald-300' : 'text-amber-400'}`}>{obj.progress}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="h-[1px] bg-white/10" />
                   
                   <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 text-amber-400">
                         <Coins className="w-3.5 h-3.5" /> {quest.coinsCollected}
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-400">
                         <Package className="w-3.5 h-3.5" /> {quest.chestsOpened}/{quest.totalChests}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Right: Interaction Deck */}
          <div className="flex items-center gap-2">
            {/* Environment Toggle */}
            <div className="relative">
               <button
                 onClick={() => setIsEnvPanelOpen(!isEnvPanelOpen)}
                 className={`w-11 h-11 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-90 ${
                   isEnvPanelOpen 
                     ? 'bg-amber-500 text-slate-950 border-amber-300' 
                     : 'bg-slate-950/40 hover:bg-slate-900/60 text-white border-white/10'
                 }`}
               >
                 <Cloud className="w-5 h-5" />
               </button>
               {isEnvPanelOpen && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-300 z-50">
                    {/* Environment Controls... (simplified for brevity) */}
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Atmosphere Config</div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                       {['morning', 'day', 'sunset', 'night'].map(t => (
                         <button key={t} onClick={() => onChangeTimeOfDay?.(t as any)} className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${environmentState?.timeOfDay === t ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}>{t}</button>
                       ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                       <span className="text-[10px] font-bold text-white/40 uppercase">Auto Cycle</span>
                       <button onClick={onToggleAutoCycle} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${environmentState?.autoCycle ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white/40'}`}>{environmentState?.autoCycle ? 'ON' : 'OFF'}</button>
                    </div>
                 </div>
               )}
            </div>

            {/* Fullscreen / Landscape Toggle */}
            <button
              onClick={() => {
                toggleFullscreenAndLandscape().catch(() => {});
              }}
              className="w-11 h-11 rounded-2xl bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-white border border-white/10 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Landscape"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Landscape"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-amber-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Download QR Code */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="w-11 h-11 rounded-2xl bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
                title="Download Game QR Code"
                aria-label="Download Game QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            )}

            {/* Global Settings */}
            <button
              onClick={() => onOpenPause?.() || onOpenSettings()}
              className="w-11 h-11 rounded-2xl bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-white border border-white/10 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Deck: Vitals */}
        {layout?.vitalsBar?.enabled !== false && (
          <div
            className="mx-auto w-full max-w-sm flex flex-col items-center gap-2 pointer-events-none mt-2 transition-transform"
            style={layout?.vitalsBar ? {
              transform: `translate(${layout.vitalsBar.x}px, ${layout.vitalsBar.y}px) scale(${layout.vitalsBar.scale})`,
              opacity: layout.vitalsBar.opacity,
            } : undefined}
          >
             {/* Stealth Gauge */}
             {quest.missionPhase !== 'orient' && (
               <div className="w-full flex flex-col items-center gap-1">
                  <div className={`w-48 h-1.5 rounded-full bg-black/40 border border-white/5 overflow-hidden transition-all duration-300 ${stealthState === 'chase' ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
                     <div 
                       className={`h-full transition-all duration-300 ease-out ${
                         stealthState === 'chase' ? 'bg-red-500' : 
                         stealthState === 'investigate' ? 'bg-amber-500' : 
                         'bg-emerald-500'
                       }`}
                       style={{ width: `${Math.max(stealthLevel, stealthState === 'chase' ? 100 : 0)}%` }}
                     />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${stealthState === 'chase' ? 'text-red-500 animate-pulse' : 'text-white/40'}`}>
                     {stealthState === 'chase' ? '!!! DETECTED !!!' : stealthState.toUpperCase()}
                  </span>
               </div>
             )}

             {/* Health & Ammo */}
             <div className="flex items-center gap-6 bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-2 shadow-2xl">
                <div className="flex items-center gap-3">
                   <Heart className={`w-4 h-4 ${playerHealth < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
                   <div className="w-24 h-2 rounded-full bg-black/40 overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${playerHealth < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }} />
                   </div>
                </div>
                {quest.firearmAuthorized && (
                  <div className="h-4 w-[1px] bg-white/10" />
                )}
                {quest.firearmAuthorized && (
                  <div className="flex items-center gap-2">
                     <Crosshair className="w-4 h-4 text-amber-500" />
                     <span className="text-xs font-black text-amber-400 tabular-nums tracking-wider">{ammoCount}<span className="text-white/20 ml-0.5">/{maxAmmo}</span></span>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DISMISSIBLE EXPLORER SIGN NOTIFICATION PANEL           */}
      {/* ======================================================== */}
      {tutorialNotice && (
        <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm pointer-events-auto z-40 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-950/95 border-2 border-amber-400/60 rounded-2xl p-3 sm:p-3.5 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {tutorialNotice.title}
                </h3>
              </div>
              <button
                onClick={onDismissTutorial}
                className="w-6 h-6 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Dismiss Tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              {tutorialNotice.text}
            </p>

            <div className="mt-2.5 flex justify-end">
              <button
                onClick={onDismissTutorial}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. PROXIMITY INTERACTION PROMPT (Safe Center-Screen Area) */}
      {/* ======================================================== */}
      {prompt && (
        <div
          onClick={onTriggerInteract}
          className="absolute left-1/2 -translate-x-1/2 bottom-36 sm:bottom-32 pointer-events-auto cursor-pointer transition-all duration-150 active:scale-95 z-30 animate-in zoom-in-90"
        >
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-2xl border-2 border-amber-200 flex items-center gap-2.5">
            <Hand className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="tracking-wide uppercase">{prompt}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. XP GAIN FLOATING POPUPS & LEVEL UP BANNER             */}
      {/* ======================================================== */}
      <div className="absolute top-20 right-6 sm:right-10 flex flex-col items-end gap-2 pointer-events-none z-50">
        <AnimatePresence>
          {floatingXpPopups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -25, scale: 1.1 }}
              exit={{ opacity: 0, y: -45, scale: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.5)] border border-cyan-200 flex items-center gap-1.5 tabular-nums"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>+{popup.amount} XP</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {levelUpBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center"
          >
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm sm:text-lg px-8 py-3 rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.7)] border-2 border-white flex flex-col items-center gap-0.5 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-slate-950 fill-slate-950 animate-bounce" />
                <span>LEVEL UP!</span>
              </div>
              <span className="text-xs font-mono font-black text-slate-900 bg-white/40 px-3 py-0.5 rounded-full">
                Rank Reached: Level {levelUpBanner.level}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. DESKTOP-ONLY CONTROL HINTS (Hidden on mobile devices) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-slate-950/80 border border-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium shadow-md flex items-center gap-2">
          <span className="font-mono text-slate-200 font-bold">WASD</span> Move
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-200 font-bold">Space</span> Jump
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-200 font-bold">Shift</span> Run
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-200 font-bold">E</span> Interact
          <span className="text-slate-600">·</span>
          <span>Drag to Orbit Camera</span>
        </div>
      </div>

      {/* Top-Down Island Minimap Radar */}
      <Minimap playerPos={playerPos} quest={quest} />

      {/* Real-time Dev HUD Performance Overlay */}
      {showFps && <FpsOverlay getPerformanceStats={getPerformanceStats} />}
    </div>
  );
};

interface MinimapProps {
  playerPos: { x: number; z: number; rotation: number };
  quest: QuestProgress;
}

const Minimap: React.FC<MinimapProps> = ({ playerPos, quest }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 128;
    const center = size / 2;
    const worldRadius = 48;
    const scale = 54 / worldRadius; // Maps 48m world radius to 54px canvas radius

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // 1. Ocean Water Outer Ring
    ctx.fillStyle = '#0284c7'; // Sky blue ocean
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sand Beach Ring
    ctx.fillStyle = '#fde047'; // Golden sand
    ctx.beginPath();
    ctx.arc(center, center, 52, 0, Math.PI * 2);
    ctx.fill();

    // 3. Tropical Island Landmass
    ctx.fillStyle = '#15803d'; // Vibrant island green
    ctx.beginPath();
    ctx.arc(center, center, 48, 0, Math.PI * 2);
    ctx.fill();

    // Inland River / Waterfall Lagoon Detail
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(center + 18 * scale, center + 10 * scale, 6, 0, Math.PI * 2);
    ctx.fill();

    // Helper: Map World (X, Z) to Canvas (x, y)
    const toCanvasX = (wx: number) => center + wx * scale;
    const toCanvasY = (wz: number) => center + wz * scale;

    // 4. Draw Quest Objective Markers

    // A. Sun Key Marker (-18, -18)
    if (!quest.keysCollected.sun) {
      const sx = toCanvasX(-18);
      const sy = toCanvasY(-18);
      ctx.fillStyle = '#f59e0b'; // Gold / Amber
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // B. Ocean Key Marker (22, 12)
    if (!quest.keysCollected.ocean) {
      const ox = toCanvasX(22);
      const oy = toCanvasY(12);
      ctx.fillStyle = '#38bdf8'; // Sky Blue
      ctx.beginPath();
      ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // C. Forest Key Marker (-12, 28)
    if (!quest.keysCollected.forest) {
      const fx = toCanvasX(-12);
      const fy = toCanvasY(28);
      ctx.fillStyle = '#34d399'; // Emerald Green
      ctx.beginPath();
      ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // D. Central Rune Altar Marker (0, 2)
    const ax = toCanvasX(0);
    const ay = toCanvasY(2);
    ctx.fillStyle = quest.altarActivated ? '#10b981' : quest.keysCount >= 3 ? '#a855f7' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // E. Grand Gate Escape Portal Marker (0, -30)
    const gx = toCanvasX(0);
    const gy = toCanvasY(-30);
    ctx.fillStyle = quest.gateUnlocked ? '#06b6d4' : '#64748b';
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, Math.PI * 2);
    ctx.fill();
    if (quest.gateUnlocked) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 5. Draw Player Position & Directional Arrow
    const px = toCanvasX(playerPos.x);
    const py = toCanvasY(playerPos.z);

    // Glowing Player Ring
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    // Player Direction Arrow
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(playerPos.rotation);
    ctx.fillStyle = '#f59e0b'; // Amber Player Arrow
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Cardinal Directions (N)
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', center, 10);

  }, [playerPos, quest]);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`fixed top-20 xs:top-22 sm:top-24 left-2.5 xs:left-3.5 sm:left-4 z-30 pointer-events-auto cursor-pointer transition-all duration-200 ${
        isExpanded ? 'scale-125 origin-top-left' : 'hover:scale-105'
      }`}
      title="Top-Down Island Radar Minimap (Click to Expand)"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-400/80 bg-slate-950/90 shadow-2xl overflow-hidden flex items-center justify-center backdrop-blur-md">
        <canvas ref={canvasRef} width={128} height={128} className="w-full h-full rounded-full" />
        <div className="absolute inset-0 rounded-full border border-amber-300/30 pointer-events-none" />
        <div className="absolute bottom-0.5 inset-x-0 text-center font-mono font-bold text-[8px] text-amber-300 bg-slate-950/80 py-0.5 pointer-events-none">
          RADAR
        </div>
      </div>
    </div>
  );
};

interface DevHudProps {
  getPerformanceStats?: () => {
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    usedHeapMB: number | null;
    totalHeapMB: number | null;
  } | undefined;
}

const FpsOverlay: React.FC<DevHudProps> = ({ getPerformanceStats }) => {
  const [hudInfo, setHudInfo] = React.useState({
    fps: 60,
    frameTime: 16.6,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    usedHeapMB: null as number | null,
  });

  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const tick = () => {
      const now = performance.now();
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 400) {
        const fps = Math.round((frameCount * 1000) / delta);
        const frameTime = parseFloat((delta / frameCount).toFixed(1));
        const stats = getPerformanceStats?.() || { drawCalls: 0, triangles: 0, geometries: 0, textures: 0, usedHeapMB: null };
        setHudInfo({
          fps,
          frameTime,
          drawCalls: stats.drawCalls,
          triangles: stats.triangles,
          geometries: stats.geometries,
          textures: stats.textures,
          usedHeapMB: stats.usedHeapMB,
        });
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [getPerformanceStats]);

  const trisFormatted = hudInfo.triangles > 1000 
    ? `${(hudInfo.triangles / 1000).toFixed(1)}k` 
    : `${hudInfo.triangles}`;

  return (
    <div className="fixed bottom-3 right-3 bg-slate-950/95 border border-emerald-500/60 rounded-2xl px-3 py-2 font-mono text-[10px] sm:text-[11px] text-emerald-400 font-bold shadow-2xl z-50 pointer-events-none flex flex-col gap-1 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 text-[11px] border-b border-slate-800/80 pb-1">
        <span className="flex items-center gap-1.5 text-white uppercase font-sans font-black tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> DEV HUD
        </span>
        <span className="text-emerald-300 font-extrabold">{hudInfo.fps} FPS <span className="text-slate-500 font-normal">({hudInfo.frameTime}ms)</span></span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300 text-[10px]">
        <div><span className="text-slate-500">Draw Calls:</span> <span className="text-amber-300 font-mono">{hudInfo.drawCalls}</span></div>
        <div><span className="text-slate-500">Triangles:</span> <span className="text-amber-300 font-mono">{trisFormatted}</span></div>
        <div><span className="text-slate-500">Geo/Tex:</span> <span className="text-sky-300 font-mono">{hudInfo.geometries}/{hudInfo.textures}</span></div>
        {hudInfo.usedHeapMB !== null && (
          <div><span className="text-slate-500">Heap Mem:</span> <span className="text-purple-300 font-mono">{hudInfo.usedHeapMB} MB</span></div>
        )}
      </div>
    </div>
  );
};
