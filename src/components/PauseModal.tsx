import React from 'react';
import { Play, RotateCcw, Home, Settings, Sliders, Save, Volume2, VolumeX, BookOpen, Key, Compass, X, QrCode } from 'lucide-react';
import { sound } from '../audio/soundSystem';
import { QuestProgress } from '../game/types';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
  onOpenSettings: () => void;
  onOpenControlCustomizer: () => void;
  onOpenHowToPlay: () => void;
  onOpenShare?: () => void;
  onSaveProgress?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  quest: QuestProgress;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onReturnToMenu,
  onOpenSettings,
  onOpenControlCustomizer,
  onOpenHowToPlay,
  onOpenShare,
  onSaveProgress,
  isMuted,
  onToggleMute,
  quest,
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(quest.timeElapsed / 60);
  const seconds = Math.floor(quest.timeElapsed % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm font-sans pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-md landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] text-slate-100 ring-1 ring-white/5 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase tracking-tight">Expedition Paused</h2>
                <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">সাময়িক বিরতি</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/60">Duration: {timeFormatted}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group active:scale-90"
            aria-label="Close Pause Menu"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Landscape Dual-Column Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col landscape:flex-row gap-4 landscape:gap-6">
          {/* Left Column: Objectives Snapshot & Mission Status */}
          <div className="flex flex-col gap-3 landscape:w-5/12 shrink-0">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-black uppercase tracking-[0.15em] text-amber-400">Keys Recovered</span>
                <span className="font-mono text-slate-300 font-bold bg-white/5 px-2 py-0.5 rounded-full">{quest.keysCount}/3 SECURED</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`py-2 rounded-xl border text-[9px] uppercase tracking-wider text-center font-black transition-all ${
                  quest.keysCollected.sun 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  Sun {quest.keysCollected.sun ? '✓' : ''}
                </div>
                <div className={`py-2 rounded-xl border text-[9px] uppercase tracking-wider text-center font-black transition-all ${
                  quest.keysCollected.ocean 
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.1)]' 
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  Ocean {quest.keysCollected.ocean ? '✓' : ''}
                </div>
                <div className={`py-2 rounded-xl border text-[9px] uppercase tracking-wider text-center font-black transition-all ${
                  quest.keysCollected.forest 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}>
                  Forest {quest.keysCollected.forest ? '✓' : ''}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Coins Found:</span>
                  <span className="text-amber-400 font-bold">{quest.coinsCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chests Looted:</span>
                  <span className="text-sky-300 font-bold">{quest.chestsOpened}/{quest.totalChests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Altar:</span>
                  <span className={quest.altarActivated ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {quest.altarActivated ? 'Activated' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden landscape:block bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-[10px] text-amber-300/80">
              <span className="font-bold uppercase tracking-wider">Tactical Hint:</span> সাইলেন্ট মুভমেন্ট এবং কভার ব্যবহার করে শত্রুদের দৃষ্টি এড়িয়ে চলুন।
            </div>
          </div>

          {/* Right Column: Action Buttons Stack */}
          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            <button
              onClick={() => {
                sound.playClick();
                onResume();
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Resume Protocol • খেলা চালিয়ে যান</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {onSaveProgress && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSaveProgress();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-emerald-400 border border-white/10 hover:border-emerald-500/20 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sync (সেভ)</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleMute();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>Audio (অডিও)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenControlCustomizer();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Controls</span>
              </button>

              {onOpenShare && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenShare();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR Code</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSettings();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenHowToPlay();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 border-t border-white/5">
              <button
                onClick={() => {
                  sound.playClick();
                  onRestart();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset (রিস্টার্ট)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onReturnToMenu();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Exit (মূল মেনু)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
