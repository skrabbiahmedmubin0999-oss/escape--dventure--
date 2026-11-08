import React, { useState } from 'react';
import { puzzleSystem } from '../game/puzzleSystem';
import { PuzzleState } from '../game/types';
import { X, Sparkles, CheckCircle2, RotateCw, ToggleLeft, HelpCircle, ShieldAlert, Sun, Droplets, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';

interface Props {
  activePuzzleId: string | null;
  onClose: () => void;
  onPuzzleSolved: (puzzleId: string) => void;
}

export const PuzzleModal: React.FC<Props> = ({ activePuzzleId, onClose, onPuzzleSolved }) => {
  const [puzzles, setPuzzles] = useState<PuzzleState[]>(() => puzzleSystem.getPuzzles());

  if (!activePuzzleId) return null;

  const currentPuzzle = puzzles.find((p) => p.id === activePuzzleId);
  if (!currentPuzzle) return null;

  const refreshPuzzles = () => {
    const updated = puzzleSystem.getPuzzles();
    setPuzzles(updated);
    const p = updated.find((item) => item.id === activePuzzleId);
    if (p && p.solved) {
      onPuzzleSolved(p.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg landscape:max-w-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90dvh]"
      >
        {/* Header - Ancient Terminal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight leading-snug">{currentPuzzle.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>{currentPuzzle.locationName}</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-amber-400/80 font-mono text-[10px]">MECH_INTERFACE</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
            aria-label="Close"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Clue Banner - Data Stream */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-start gap-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1 py-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Deciphering Hint</span>
            <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
              "{currentPuzzle.clue}"
            </p>
          </div>
        </div>

        {/* Puzzle Content Body */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[240px] overflow-y-auto custom-scrollbar">
          {currentPuzzle.solved ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tight">Sequence Verified</h4>
              <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed font-medium">
                The ancient mechanism has unlocked. Neural feedback loop closed successfully.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="mt-8 min-h-[48px] px-10 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all cursor-pointer active:scale-95"
              >
                Proceed & Claim
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Puzzle A — Symbol Matching */}
              {currentPuzzle.type === 'symbol_match' && (
                <motion.div 
                  key="symbol_match"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rotate Elemental Alignments</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {currentPuzzle.symbols?.map((sym, idx) => {
                      const iconMap: Record<string, string> = {
                        Sun: '☀️',
                        Water: '🌊',
                        Leaf: '🍃',
                        Moon: '🌙',
                      };
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            sound.playClick();
                            puzzleSystem.rotatePillarSymbol(currentPuzzle.id, idx);
                            refreshPuzzles();
                          }}
                          className="aspect-[4/5] flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all active:scale-95 group cursor-pointer shadow-lg"
                        >
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-3">NODE_{idx + 1}</span>
                          <span className="text-2xl mb-2 transition-transform group-hover:scale-125 duration-300">
                            {iconMap[sym] || sym}
                          </span>
                          <span className="text-[10px] font-black text-amber-300 uppercase tracking-tighter mb-4">{sym}</span>
                          <RotateCw className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:rotate-180 transition-all duration-500" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Puzzle B — Switch Sequence */}
              {currentPuzzle.type === 'switch_sequence' && (
                <motion.div 
                  key="switch_sequence"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Calibrate Order Logic</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 w-full">
                    {currentPuzzle.switchesState?.map((isLit, idx) => {
                      const romanLabels = ['I', 'II', 'III', 'IV'];
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            sound.playClick();
                            puzzleSystem.toggleSwitch(currentPuzzle.id, idx);
                            refreshPuzzles();
                          }}
                          className={`aspect-square flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 shadow-xl cursor-pointer ${
                            isLit
                              ? 'bg-emerald-400/20 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                              : 'bg-black/20 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className={`text-[10px] font-black mb-3 ${isLit ? 'text-emerald-300' : 'text-slate-600'}`}>
                            {romanLabels[idx]}
                          </span>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isLit ? 'bg-emerald-400 border-white/20' : 'bg-transparent border-white/10'
                          }`}>
                            <ToggleLeft
                              className={`w-5 h-5 transition-transform duration-300 ${isLit ? 'text-slate-900 rotate-180' : 'text-slate-600'}`}
                            />
                          </div>
                          <span className={`text-[8px] font-black mt-3 tracking-widest ${isLit ? 'text-emerald-400' : 'text-slate-700'}`}>
                            {isLit ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Puzzle C — Ancient Rune Dial */}
              {currentPuzzle.type === 'rune_dial' && (
                <motion.div 
                  key="rune_dial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Coordinate Sync</span>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                    {[
                      { name: 'Outer Core', icon: Sun, color: 'text-amber-400' },
                      { name: 'Middle Core', icon: Droplets, color: 'text-cyan-400' },
                      { name: 'Inner Core', icon: Trees, color: 'text-emerald-400' }
                    ].map((ring, idx) => {
                      const angle = currentPuzzle.dialAngles?.[idx] || 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${ring.color}`}>
                              <ring.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-tight">{ring.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5 uppercase tracking-widest">
                                Pos: <span className={ring.color}>{angle}°</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              sound.playClick();
                              puzzleSystem.rotateRuneRing(currentPuzzle.id, idx);
                              refreshPuzzles();
                            }}
                            className="min-h-[44px] px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-white/10"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            90°
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            ST_MECH // ADDR: {activePuzzleId.toUpperCase()}
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[46px] px-10 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            Suspend Interaction
          </button>
        </div>
      </motion.div>
    </div>
  );
};

