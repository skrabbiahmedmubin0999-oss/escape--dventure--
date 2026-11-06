import React from 'react';
import { QuestProgress, PlayerStats } from '../game/types';
import { X, Key, Coins, Sparkles, Package, ShieldAlert, Award } from 'lucide-react';

interface Props {
  onClose: () => void;
  quest: QuestProgress;
  stats: PlayerStats;
}

export const InventoryModal: React.FC<Props> = ({ onClose, quest, stats }) => {
  const keysList = [
    { id: 'sun', name: 'Sun Key', color: 'from-amber-500 to-yellow-400', loc: 'Sun Temple', collected: quest.keysCollected.sun },
    { id: 'ocean', name: 'Ocean Key', color: 'from-cyan-500 to-blue-400', loc: 'Waterfall', collected: quest.keysCollected.ocean },
    { id: 'forest', name: 'Forest Key', color: 'from-emerald-500 to-green-400', loc: 'Sacred Grove', collected: quest.keysCollected.forest },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88dvh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-snug">Explorer Backpack</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Inventory & Quest Collectibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Level & XP Stats bar */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[9px] sm:text-xs text-slate-400 uppercase font-bold">Explorer Rank</span>
              <div className="text-xs sm:text-sm font-black text-amber-300">Level {stats.level} Pioneer</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-yellow-400 font-black text-xs sm:text-sm">
              <Coins className="w-3.5 h-3.5" />
              <span>{quest.coinsCollected || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 font-black text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{quest.xpEarned || 0} XP</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Section: Elemental Keys */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Elemental Gate Keys ({quest.keysCount}/3)
            </h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {keysList.map((k) => (
                <div
                  key={k.id}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    k.collected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr ${k.color} text-slate-950 font-bold shadow-md mb-1.5`}
                  >
                    <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200 truncate w-full">{k.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate w-full">{k.collected ? 'Acquired' : k.loc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Survival Crystals */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              Energy Crystals ({quest.crystalsCollected || 0}/{quest.totalCrystals || 5})
            </h4>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-200 truncate">Ancient Resonant Crystals</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 truncate">Restores energy and unlocks shrines</div>
                </div>
              </div>
              <span className="text-sm sm:text-base font-black text-cyan-300 shrink-0">
                {quest.crystalsCollected || 0} / {quest.totalCrystals || 5}
              </span>
            </div>
          </div>

          {/* Section: Treasure Chest Stats */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Treasure Vault Discovery
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex justify-between items-center">
                <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">Chests Opened</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                  {quest.chestsOpened} / {quest.totalChests}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/60 border border-slate-700 flex justify-between items-center">
                <span className="text-[11px] sm:text-xs text-slate-300 font-semibold">Puzzles Solved</span>
                <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
                  {quest.puzzlesSolvedCount || 0} / {quest.totalPuzzles || 3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-800 bg-slate-800/30 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full xs:w-auto min-h-[44px] px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          >
            Close Satchel
          </button>
        </div>
      </div>
    </div>
  );
};
