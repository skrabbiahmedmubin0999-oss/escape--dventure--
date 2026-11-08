import React, { useEffect, useState } from 'react';
import { Play, Users, BookOpen, Settings, User, Volume2, VolumeX, Swords, Crosshair, QrCode, Maximize2, Minimize2, Bot } from 'lucide-react';
import { sound } from '../audio/soundSystem';
import { PWAInstallButton } from './PWAInstallButton';
import { toggleFullscreenAndLandscape, requestLandscapeAndFullscreen } from '../utils/orientation';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenMultiplayer: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenMissionSelect: () => void;
  onOpenShare: () => void;
  onOpenAIMode?: () => void;
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
  onOpenAIMode,
  playerName,
  playerTitle,
  isMuted,
  onToggleMute,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
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

  const handleStartWithLandscape = () => {
    sound.playClick();
    // Attempt landscape/fullscreen on game start
    requestLandscapeAndFullscreen().catch(() => {});
    onStartGame();
  };

  // Keyboard shortcut: Enter or Space to start game immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        handleStartWithLandscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 xs:p-4 sm:p-8 pt-2.5 sm:pt-4 font-sans">
      {/* Background Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/60 pointer-events-none" />

      {/* Top Bar: Profile & Global Actions */}
      <div className="flex items-center justify-between w-full pointer-events-auto max-w-5xl mx-auto shrink-0 z-10">
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="group bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 border border-white/10 hover:border-amber-500/40 rounded-2xl px-3 py-2 flex items-center gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left hidden xs:block">
            <div className="text-xs font-black text-white tracking-wider uppercase">{playerName}</div>
            <div className="text-[10px] font-bold text-amber-400/90">{playerTitle}</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <PWAInstallButton />
          <button
            onClick={() => {
              sound.playClick();
              onOpenShare();
            }}
            className="w-11 h-11 bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 text-emerald-400 hover:text-emerald-300 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/50 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
            title="Download Game QR Code"
            aria-label="Download Game QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              toggleFullscreenAndLandscape().catch(() => {});
            }}
            className="w-11 h-11 bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 text-white rounded-2xl border border-white/10 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Landscape"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Landscape"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-amber-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-amber-400" />
            )}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="w-11 h-11 bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 text-white rounded-2xl border border-white/10 shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-90"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Center Hero Section - Shifted slightly higher up */}
      <div className="flex flex-col items-center justify-center text-center mt-1 sm:mt-2 mb-auto -translate-y-2 sm:-translate-y-4 pointer-events-auto max-w-md sm:max-w-lg mx-auto w-full z-10 gap-2.5 sm:gap-3.5 px-2">
        {/* Centered Logo & Landscape Branding */}
        <div className="transform hover:scale-[1.02] transition-transform duration-500 flex flex-col items-center justify-center text-center shrink-0 mx-auto">
          <svg
            viewBox="0 0 540 120"
            className="w-full max-w-[240px] xs:max-w-[280px] sm:max-w-[320px] h-auto filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)] mx-auto"
          >
            <defs>
              <linearGradient id="premiumGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            <circle cx="270" cy="55" r="50" fill="none" stroke="url(#premiumGold)" strokeWidth="1" opacity="0.2" />
            
            <text
              x="270"
              y="58"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="52"
              fontWeight="900"
              letterSpacing="10"
              fill="url(#premiumGold)"
              stroke="#000"
              strokeWidth="1"
            >
              ESCAPE
            </text>

            <text
              x="270"
              y="92"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="22"
              fontWeight="800"
              letterSpacing="14"
              fill="#fff"
              opacity="0.9"
            >
              ADVENTURE
            </text>
            
            <rect x="200" y="105" width="140" height="1" fill="url(#premiumGold)" opacity="0.4" />
          </svg>

          <div className="mt-1 flex items-center justify-center gap-2 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-300/80 mx-auto">
            <span>ল্যান্ডস্কেপ থ্রিডি গেম</span>
            <span className="opacity-40">•</span>
            <span>Shadow Assassin</span>
          </div>
        </div>

        {/* Centered Primary Action Stack */}
        <div className="flex flex-col gap-2 w-full max-w-sm shrink-0 items-center justify-center text-center mx-auto">
          {/* Start Journey */}
          <button
            onClick={handleStartWithLandscape}
            className="group relative overflow-hidden w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-[0.15em] shadow-[0_12px_32px_rgba(245,158,11,0.3)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.4)] border border-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Play className="w-4 h-4 fill-slate-950" />
            <div className="flex flex-col items-center leading-none text-center">
              <span>Start Journey</span>
              <span className="text-[9px] font-bold tracking-normal opacity-80 lowercase">যাত্রা শুরু করুন</span>
            </div>
          </button>

          {/* Missions & AI Mode Row */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playClick();
                onOpenMissionSelect();
              }}
              className="py-2 sm:py-2.5 rounded-xl bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-amber-100 font-bold text-[11px] uppercase tracking-wider border border-white/10 hover:border-amber-500/40 shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Missions (মিশন)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onOpenAIMode) {
                  onOpenAIMode();
                } else {
                  onOpenMultiplayer();
                }
              }}
              className="py-2 sm:py-2.5 rounded-xl bg-cyan-500/15 backdrop-blur-xl hover:bg-cyan-500/25 text-cyan-200 font-black text-[11px] uppercase tracking-wider border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer text-center"
              title="AI Tactical Mode & Guard Dog Companion"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Mode (এআই মোড)</span>
            </button>
          </div>

          {/* QR Code & Guide Row */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playClick();
                onOpenShare();
              }}
              className="py-2 sm:py-2.5 rounded-xl bg-emerald-500/20 backdrop-blur-xl hover:bg-emerald-500/30 text-emerald-200 font-black text-[11px] uppercase tracking-wider border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
              title="Download Game QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenHowToPlay();
              }}
              className="py-2 sm:py-2.5 rounded-xl bg-slate-950/40 backdrop-blur-xl hover:bg-slate-900/60 text-slate-100 font-bold text-[11px] uppercase tracking-wider border border-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Guide (গাইড)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full flex justify-center pb-2 z-10 shrink-0 text-center">
        <div className="bg-white/5 backdrop-blur-sm px-5 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center justify-center gap-2 mx-auto">
          <span>Mobile Tactical Stealth</span>
          <span className="text-amber-400">•</span>
          <span>সম্পূর্ণ ল্যান্ডস্কেপ মোড</span>
        </div>
      </div>
    </div>
  );
};
