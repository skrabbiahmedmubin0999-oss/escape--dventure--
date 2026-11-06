import React, { useEffect } from 'react';
import { Play, Users, BookOpen, Settings, User, Volume2, VolumeX, Swords, Crosshair, QrCode } from 'lucide-react';
import { sound } from '../audio/soundSystem';
import { PWAInstallButton } from './PWAInstallButton';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenMultiplayer: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenMissionSelect: () => void;
  onOpenShare: () => void;
  playerName: string;
  playerTitle: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenMultiplayer,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenProfile,
  onOpenMissionSelect,
  onOpenShare,
  playerName,
  playerTitle,
  isMuted,
  onToggleMute,
}) => {
  // Keyboard shortcut: Enter or Space to start game immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        sound.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-2.5 xs:p-4 sm:p-8 pt-[max(10px,env(safe-area-inset-top,10px))] pb-[max(10px,env(safe-area-inset-bottom,10px))] pl-[max(10px,env(safe-area-inset-left,10px))] pr-[max(10px,env(safe-area-inset-right,10px))] font-sans overflow-y-auto custom-scrollbar">
      {/* Top Bar: Profile Badge & Audio Toggle */}
      <div className="flex items-center justify-between gap-1.5 xs:gap-2 w-full pointer-events-auto max-w-xl mx-auto shrink-0">
        {/* Profile Card Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="min-h-[44px] bg-slate-900/85 hover:bg-slate-800/95 text-slate-100 border border-amber-500/30 rounded-2xl px-2.5 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink"
        >
          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
          </div>
          <div className="text-left leading-tight min-w-0">
            <div className="text-xs font-bold text-slate-200 tracking-wide truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px]">{playerName}</div>
            <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-amber-400 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px]">{playerTitle}</div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
          {/* In-App PWA Install Trigger */}
          <PWAInstallButton />

          {/* Audio Mute Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="min-h-[44px] min-w-[44px] bg-slate-900/85 hover:bg-slate-800/95 text-slate-200 p-2.5 rounded-2xl border border-slate-700 shadow-xl transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Hero Title & Main Actions (Centered with comfortable spacing) */}
      <div className="flex flex-col items-center justify-center text-center my-auto pointer-events-auto max-w-xl mx-auto w-full py-2 xs:py-4">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-3 xs:mb-5 transform hover:scale-[1.01] transition-transform w-full flex justify-center">
          <svg
            viewBox="0 0 540 120"
            className="w-full max-w-[260px] xs:max-w-[310px] sm:max-w-md h-auto filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          >
            <defs>
              <linearGradient id="titleGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff2a3" />
                <stop offset="50%" stopColor="#f39c12" />
                <stop offset="100%" stopColor="#b76500" />
              </linearGradient>
            </defs>

            {/* Decorative Compass / Sun Crest behind */}
            <circle cx="270" cy="55" r="46" fill="none" stroke="rgba(241, 196, 15, 0.25)" strokeWidth="3" />
            <polygon points="270,4 275,24 270,20 265,24" fill="#f1c40f" opacity="0.8" />
            <polygon points="270,106 275,86 270,90 265,86" fill="#f1c40f" opacity="0.8" />
            <polygon points="219,55 239,50 235,55 239,60" fill="#f1c40f" opacity="0.8" />
            <polygon points="321,55 301,50 305,55 301,60" fill="#f1c40f" opacity="0.8" />

            {/* Main Word: ESCAPE */}
            <text
              x="270"
              y="58"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="48"
              fontWeight="900"
              letterSpacing="7"
              fill="url(#titleGoldGrad)"
              stroke="#2c1a06"
              strokeWidth="2.5"
            >
              ESCAPE
            </text>

            {/* Secondary Word: ADVENTURE */}
            <text
              x="270"
              y="88"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="24"
              fontWeight="800"
              letterSpacing="10"
              fill="#ecf0f1"
              stroke="#1a252f"
              strokeWidth="1.2"
            >
              ADVENTURE
            </text>

            {/* Subtitle banner */}
            <text
              x="270"
              y="110"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="700"
              letterSpacing="4"
              fill="#f1c40f"
            >
              • ISLAND QUEST & ANCIENT RUINS •
            </text>
          </svg>
        </div>

        {/* Action Buttons Menu */}
        <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 w-full max-w-sm px-1.5 xs:px-2">
          {/* Primary CTA: PLAY */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="group min-h-[50px] relative w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm xs:text-base sm:text-lg uppercase tracking-wider shadow-2xl border-2 border-amber-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950 transition-transform group-hover:scale-110" />
            <span>Play Solo Adventure</span>
            <span className="text-[10px] bg-slate-950/20 text-slate-900 px-2 py-0.5 rounded font-mono font-bold tracking-normal hidden sm:inline">
              SPACE
            </span>
          </button>

          {/* MISSION SELECT CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMissionSelect();
            }}
            className="group min-h-[46px] w-full py-3 px-4 rounded-2xl bg-slate-950/50 hover:bg-slate-900/70 text-amber-100 font-bold text-xs sm:text-sm uppercase tracking-widest border border-amber-500/30 hover:border-amber-400/60 shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <div className="flex -space-x-1">
              <Swords className="w-4 h-4 text-amber-400" />
              <Crosshair className="w-4 h-4 text-amber-500" />
            </div>
            <span>Mission Selection</span>
            <span className="text-[9px] bg-amber-600/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              Combat Briefing
            </span>
          </button>

          {/* Multiplayer Lobby */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMultiplayer();
            }}
            className="min-h-[46px] w-full py-3 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/95 text-slate-100 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-700 shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            <span>Multiplayer Lobby</span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30">
              Co-Op Ready
            </span>
          </button>

          {/* Grid of secondary actions: How to Play, QR Code & Settings */}
          <div className="grid grid-cols-3 gap-1.5 xs:gap-2 mt-0.5">
            <button
              onClick={() => {
                sound.playClick();
                onOpenHowToPlay();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 font-semibold text-[11px] tracking-wide border border-slate-700 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Guide</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenShare();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 font-semibold text-[11px] tracking-wide border border-emerald-600/40 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">QR Code</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 font-semibold text-[11px] tracking-wide border border-slate-700 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Flat Control-Hint Line */}
      <div className="w-full text-center text-[10px] xs:text-[11px] sm:text-xs font-medium text-slate-300/90 tracking-wide pointer-events-auto pb-1 shrink-0">
        <span className="bg-slate-900/80 px-3 py-1 xs:px-3.5 xs:py-1.5 rounded-full border border-slate-700/60 shadow-md inline-block max-w-[95%] truncate">
          Touch Joystick Move · Jump · Crouch · Camera Drag
        </span>
      </div>
    </div>
  );
};
