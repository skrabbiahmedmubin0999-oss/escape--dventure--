import React, { useState } from 'react';
import { puzzleSystem } from '../game/puzzleSystem';
import { PuzzleState } from '../game/types';
import { X, Sparkles, CheckCircle2, RotateCw, ToggleLeft, HelpCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88dvh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-snug">{currentPuzzle.name}</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">{currentPuzzle.locationName}</p>
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

        {/* Clue Banner */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-amber-950/30 border-b border-amber-900/40 flex items-start gap-2 text-amber-200/90 text-xs sm:text-sm shrink-0">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-400">Ancient Clue: </span>
            {currentPuzzle.clue}
          </div>
        </div>

        {/* Puzzle Content Body */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-[220px] overflow-y-auto custom-scrollbar">
          {currentPuzzle.solved ? (
            <div className="flex flex-col items-center text-center py-4 animate-in zoom-in-90 duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 mb-3 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-emerald-300">Puzzle Solved!</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs leading-relaxed">
                The ancient mechanism has unlocked! Secret vault chambers & rewards revealed.
              </p>
              <button
                onClick={onClose}
                className="mt-4 min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center active:scale-95"
              >
                Claim Rewards & Close
              </button>
            </div>
          ) : (
            <>
              {/* Puzzle A — Symbol Matching */}
              {currentPuzzle.type === 'symbol_match' && (
                <div className="w-full flex flex-col items-center gap-4">
                  <p className="text-[11px] sm:text-xs text-slate-400 text-center">
                    Tap each pillar to rotate through elemental symbols.
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                    {currentPuzzle.symbols?.map((sym, idx) => {
                      const iconMap: Record<string, string> = {
                        Sun: '☀️ Sun',
                        Water: '🌊 Water',
                        Leaf: '🍃 Leaf',
                        Moon: '🌙 Moon',
                      };
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            puzzleSystem.rotatePillarSymbol(currentPuzzle.id, idx);
                            refreshPuzzles();
                          }}
                          className="min-h-[74px] flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/50 text-amber-300 transition-all active:scale-95 shadow-md cursor-pointer group"
                        >
                          <span className="text-[10px] text-slate-400 font-bold mb-1">Pillar {idx + 1}</span>
                          <span className="text-xs sm:text-sm font-black text-amber-300 group-hover:scale-105 transition-transform">
                            {iconMap[sym] || sym}
                          </span>
                          <RotateCw className="w-3.5 h-3.5 text-slate-400 mt-1.5 opacity-70 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Puzzle B — Switch Sequence */}
              {currentPuzzle.type === 'switch_sequence' && (
                <div className="w-full flex flex-col items-center gap-4">
                  <p className="text-[11px] sm:text-xs text-slate-400 text-center">
                    Activate levers in correct order. Incorrect sequence resets all switches.
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full">
                    {currentPuzzle.switchesState?.map((isLit, idx) => {
                      const romanLabels = ['Lever I', 'Lever II', 'Lever III', 'Lever IV'];
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            puzzleSystem.toggleSwitch(currentPuzzle.id, idx);
                            refreshPuzzles();
                          }}
                          className={`min-h-[68px] flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all active:scale-95 shadow-md cursor-pointer ${
                            isLit
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-emerald-500/20'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-500/40'
                          }`}
                        >
                          <ToggleLeft
                            className={`w-5 h-5 mb-1 ${isLit ? 'text-emerald-400 rotate-180' : 'text-slate-500'}`}
                          />
                          <span className="text-[10px] sm:text-xs font-bold">{romanLabels[idx]}</span>
                          <span className={`text-[8px] sm:text-[9px] mt-0.5 font-bold ${isLit ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isLit ? 'ACTIVE' : 'OFF'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Puzzle C — Ancient Rune Dial */}
              {currentPuzzle.type === 'rune_dial' && (
                <div className="w-full flex flex-col items-center gap-3.5">
                  <p className="text-[11px] sm:text-xs text-slate-400 text-center">
                    Rotate the concentric rings to align the solar, ocean, and forest glyphs.
                  </p>
                  <div className="flex flex-col gap-2.5 w-full max-w-sm">
                    {['Solar Ring (Outer)', 'Ocean Ring (Middle)', 'Forest Ring (Inner)'].map((ringName, idx) => {
                      const angle = currentPuzzle.dialAngles?.[idx] || 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-300">{ringName}</div>
                            <div className="text-xs text-purple-400 font-mono font-bold mt-0.5">Angle: {angle}°</div>
                          </div>
                          <button
                            onClick={() => {
                              puzzleSystem.rotateRuneRing(currentPuzzle.id, idx);
                              refreshPuzzles();
                            }}
                            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Rotate 90°
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-800 bg-slate-800/30 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full xs:w-auto min-h-[44px] px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
