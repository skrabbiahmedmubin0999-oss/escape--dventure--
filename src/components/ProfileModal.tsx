import React from 'react';
import { X, User, Award, Key, Clock, CheckCircle, Coins, Package, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { PlayerCustomization, PlayerStats } from '../game/types';

interface ProfileModalProps {
  onClose: () => void;
  customization: PlayerCustomization;
  onUpdateCustomization: (newVal: Partial<PlayerCustomization>) => void;
  stats: PlayerStats;
}

const TUNIC_COLORS = [
  { name: 'Amber Explorer', hex: '#e67e22' },
  { name: 'Forest Ranger', hex: '#27ae60' },
  { name: 'Ocean Voyager', hex: '#2980b9' },
  { name: 'Crimson Scout', hex: '#c0392b' },
  { name: 'Night Stalker', hex: '#34495e' },
  { name: 'Royal Scholar', hex: '#8e44ad' },
];

const HAT_COLORS = [
  { name: 'Mystic Purple', hex: '#8e44ad' },
  { name: 'Classic Leather', hex: '#4a2810' },
  { name: 'Golden Sun', hex: '#f1c40f' },
  { name: 'Emerald Moss', hex: '#16a085' },
  { name: 'Slate Gray', hex: '#7f8c8d' },
];

const TITLES = [
  'Novice Explorer',
  'Island Quest Pioneer',
  'Ancient Ruin Seeker',
  'Elemental Master',
  'Escape Adventure Champion',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  onClose,
  customization,
  onUpdateCustomization,
  stats,
}) => {
  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-xl landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] mx-auto"
      >
        {/* Header - Expedition Terminal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">Explorer Identity</h2>
                <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">প্রোফাইল সেটিংস</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Neural Link Status</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 uppercase tracking-widest font-bold">Synchronized</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
            aria-label="Close"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 ml-1">
                Designation
              </label>
              <input
                type="text"
                value={customization.name}
                onChange={(e) => onUpdateCustomization({ name: e.target.value })}
                maxLength={20}
                placeholder="Enter Name..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 ml-1">
                Expedition Rank
              </label>
              <div className="relative">
                <select
                  value={customization.title}
                  onChange={(e) => onUpdateCustomization({ title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer"
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Award className="w-4 h-4 text-amber-400/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Outfit Customization */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Visual Configuration</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300">Tunic Chromatics</span>
                <span className="text-[10px] font-mono text-amber-400/60">S-01 // ARMOR_COL</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {TUNIC_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      sound.playClick();
                      onUpdateCustomization({ tunicColor: c.hex });
                    }}
                    className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                      customization.tunicColor === c.hex
                        ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow-inner transition-transform group-hover:scale-110"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-slate-200">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300">Headgear Palette</span>
                <span className="text-[10px] font-mono text-amber-400/60">S-02 // HEAD_GEAR</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {HAT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      sound.playClick();
                      onUpdateCustomization({ hatColor: c.hex });
                    }}
                    className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                      customization.hatColor === c.hex
                        ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow-inner transition-transform group-hover:scale-110"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-slate-200">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player Statistics */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Expedition Metrics</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Lifetime Log</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.05)]">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  Level {stats.level ?? 1} · {stats.xp ?? 0} XP
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Clock, label: 'Best Escape', value: formatTime(stats.bestTime), color: 'text-sky-400' },
                { icon: Key, label: 'Keys Found', value: stats.totalKeysCollected ?? 0, color: 'text-amber-400' },
                { icon: Coins, label: 'Gold Assets', value: stats.totalCoins ?? 0, color: 'text-yellow-400' },
                { icon: Package, label: 'Vaults Opened', value: stats.totalChests ?? 0, color: 'text-sky-400' },
                { icon: Award, label: 'Riddles Solved', value: stats.puzzlesSolved ?? 0, color: 'text-emerald-400' },
                { icon: CheckCircle, label: 'Extractions', value: stats.gamesCompleted ?? 0, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center group hover:border-white/10 transition-all hover:bg-black/40"
                >
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3 opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-sm font-black font-mono text-white tracking-tight">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            ID: LINK-OS // VER: 4.8.0
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] active:scale-95 cursor-pointer"
          >
            Update Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

