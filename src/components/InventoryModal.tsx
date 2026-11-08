import React from 'react';
import { QuestProgress, PlayerStats } from '../game/types';
import { X, Key, Coins, Sparkles, Package, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';

interface Props {
  onClose: () => void;
  quest: QuestProgress;
  stats: PlayerStats;
}

export const InventoryModal: React.FC<Props> = ({ onClose, quest, stats }) => {
  const keysList = [
    { id: 'sun', name: 'Sun Key', color: 'from-amber-500 to-yellow-400', glow: 'shadow-amber-500/20', loc: 'Sun Temple', collected: quest.keysCollected.sun },
    { id: 'ocean', name: 'Ocean Key', color: 'from-cyan-500 to-blue-400', glow: 'shadow-cyan-500/20', loc: 'Waterfall', collected: quest.keysCollected.ocean },
    { id: 'forest', name: 'Forest Key', color: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/20', loc: 'Sacred Grove', collected: quest.keysCollected.forest },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88dvh]"
      >
        {/* Header - Manifest Terminal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight leading-snug">Storage Manifest</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Resource Inventory</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-amber-400/80 font-mono text-[10px]">BACKPACK_V4</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer shrink-0 group"
            aria-label="Close"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Player Level & XP Stats bar - Clean Metadata */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-500">Expedition Rank</span>
              <span className="text-amber-300 font-black">Level {stats.level}</span>
              <span className="text-slate-500 font-normal">/</span>
              <span className="text-slate-300">Pioneer</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{quest.coinsCollected || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{quest.xpEarned || 0} XP</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Section: Elemental Keys */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                Elemental Frequency Keys
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{quest.keysCount} / 3 FOUND</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {keysList.map((k) => (
                <motion.div
                  key={k.id}
                  whileHover={k.collected ? { scale: 1.05, y: -2 } : {}}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    k.collected
                      ? `bg-white/5 border-white/20 shadow-lg ${k.glow}`
                      : 'bg-black/20 border-white/5 opacity-30 grayscale'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr ${k.color} text-slate-950 font-bold shadow-lg mb-3`}
                  >
                    <Key className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-tight truncate w-full mb-1">{k.name}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate w-full">
                    {k.collected ? 'Active' : 'Offline'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: Survival Crystals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                Energy Resonators
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{quest.crystalsCollected || 0} / {quest.totalCrystals || 5}</span>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-white uppercase tracking-tight">Ancient Crystals</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Restores Neural Link integrity & unlocks Shrines.</div>
                </div>
              </div>
              <div className="text-xl font-black text-cyan-400 tabular-nums shrink-0">
                {quest.crystalsCollected || 0}
              </div>
            </div>
          </div>

          {/* Section: Treasure Chest Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Vault Acquisitions
              </h4>
              <span className="text-[10px] font-mono text-slate-500">SECTOR_LOG</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Chests Decoded</span>
                <span className="text-lg font-black text-amber-300 font-mono tabular-nums leading-none">
                  {quest.chestsOpened} / {quest.totalChests}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Riddles Solved</span>
                <span className="text-lg font-black text-emerald-300 font-mono tabular-nums leading-none">
                  {quest.puzzlesSolvedCount || 0} / {quest.totalPuzzles || 3}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            INVENTORY_SCAN // COMPLETE
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[46px] px-10 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            Close Manifest
          </button>
        </div>
      </motion.div>
    </div>
  );
};

