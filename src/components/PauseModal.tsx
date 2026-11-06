import React from 'react';
import { Play, RotateCcw, Home, Settings, Sliders, Save, Volume2, VolumeX, BookOpen, Key, Compass, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md font-sans pointer-events-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase tracking-tight">Game Paused</h2>
              <p className="text-[10px] sm:text-xs text-amber-400/90 font-bold">Expedition Elapsed: {timeFormatted}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Audio Mute Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleMute();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onResume();
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Resume"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mission Objectives Mini Snapshot */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold uppercase text-amber-400 text-[10px] tracking-wider">Mission Objectives</span>
            <span className="font-mono text-slate-300 font-bold">{quest.keysCount}/3 Keys</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className={`p-1.5 rounded-lg border text-center font-bold ${
              quest.keysCollected.sun 
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              Sun Key {quest.keysCollected.sun ? '✓' : ''}
            </div>
            <div className={`p-1.5 rounded-lg border text-center font-bold ${
              quest.keysCollected.ocean 
                ? 'bg-sky-500/20 border-sky-400/60 text-sky-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              Ocean Key {quest.keysCollected.ocean ? '✓' : ''}
            </div>
            <div className={`p-1.5 rounded-lg border text-center font-bold ${
              quest.keysCollected.forest 
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              Forest Key {quest.keysCollected.forest ? '✓' : ''}
            </div>
          </div>
        </div>

        {/* Action Buttons List */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
          {/* 1. Primary CTA: RESUME GAME */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>Resume Expedition</span>
          </button>

          {/* 2. Save Progress to Offline IndexedDB */}
          {onSaveProgress && (
            <button
              onClick={() => {
                sound.playClick();
                onSaveProgress();
              }}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save Offline Checkpoint</span>
            </button>
          )}

          {/* 3. Customize Mobile Touch Controls */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenControlCustomizer();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-amber-200 font-bold text-xs uppercase tracking-wider border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Customize Touch Controls</span>
          </button>

          {/* 4. Game Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Game Settings</span>
          </button>

          {/* 5. How to Play Guide */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>How to Play & Guide</span>
          </button>

          {/* 6. Restart Mission */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Restart Mission</span>
          </button>

          {/* 7. Return to Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onReturnToMenu();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
