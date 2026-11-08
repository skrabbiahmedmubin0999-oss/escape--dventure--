import React from 'react';
import { Trophy, Star, RotateCcw, Home, Clock, Key, Sparkles, Coins, Package } from 'lucide-react';
import { sound } from '../audio/soundSystem';

interface VictoryModalProps {
  timeElapsed: number;
  bestTime: number | null;
  coinsCollected: number;
  chestsOpened: number;
  totalChests: number;
  xpEarned: number;
  caughtCount: number;
  sessionSeed?: number;
  onPlayAgain: () => void;
  onReplaySameSeed?: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  timeElapsed,
  bestTime,
  coinsCollected,
  chestsOpened,
  totalChests,
  xpEarned,
  caughtCount,
  sessionSeed,
  onPlayAgain,
  onReplaySameSeed,
  onReturnToMenu,
}) => {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isNewRecord = bestTime !== null && (bestTime === timeElapsed || timeElapsed <= bestTime);

  // Rating based on speed and stealth
  const stealthBonus = Math.max(0, 100 - caughtCount * 25);
  const timeRating = timeElapsed < 120 ? 3 : timeElapsed < 240 ? 2 : 1;
  const stealthRating = caughtCount === 0 ? 3 : caughtCount < 3 ? 2 : 1;
  const stars = Math.ceil((timeRating + stealthRating) / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm font-sans overflow-y-auto pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-[2.5rem] w-full max-w-md landscape:max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] ring-1 ring-amber-500/20 my-auto animate-in zoom-in-95 duration-500">
        {/* Landscape Side-by-Side Wrapper */}
        <div className="flex flex-col landscape:flex-row flex-1 overflow-y-auto custom-scrollbar">
          {/* Left Column: Top Celebration & Stars */}
          <div className="bg-gradient-to-b landscape:bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent p-6 landscape:p-8 flex flex-col items-center justify-center text-center landscape:w-5/12 border-b landscape:border-b-0 landscape:border-r border-white/5 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] border-2 border-white/30 mb-3 sm:mb-4 relative group">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 transition-transform group-hover:scale-110" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-pulse" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Exfiltration Success
              </h1>
            </div>
            <div className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 mb-2">
              মিশন সফল • বিজয় সম্পন্ন
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500/80">
              Sector Cleared • Extraction Confirmed
            </p>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="relative">
                    {s <= stars && (
                      <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse" />
                    )}
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-700 ${
                        s <= stars
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'text-white/5 fill-transparent scale-90'
                      }`}
                      style={{ transitionDelay: `${s * 150}ms` }}
                    />
                  </div>
                ))}
              </div>
              {sessionSeed && (
                <div className="text-[8px] font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 tracking-wider mt-1">
                  SEED: #{sessionSeed}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stats Grid & Actions */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1 opacity-60 group-hover:opacity-100" />
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Runtime (সময়)</div>
                <div className="text-lg font-black font-mono text-white mt-0.5 leading-none tracking-tight">
                  {timeFormatted}
                </div>
                {isNewRecord && (
                  <div className="text-[8px] font-black text-emerald-400 mt-1 uppercase tracking-tighter">
                    New Record!
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                <Key className="w-4 h-4 text-amber-400 mx-auto mb-1 opacity-60 group-hover:opacity-100" />
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Payload (কি)</div>
                <div className="text-lg font-black font-mono text-amber-400 mt-0.5 leading-none tracking-tight">
                  3/3
                </div>
                <div className="text-[8px] text-amber-500/60 mt-1 font-black uppercase tracking-tighter">
                  Keys Secured
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1 opacity-60 group-hover:opacity-100" />
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Credits (কয়েন)</div>
                <div className="text-lg font-black font-mono text-amber-300 mt-0.5 leading-none tracking-tight">
                  +{coinsCollected}
                </div>
                <div className="text-[8px] text-amber-500/60 mt-1 font-black uppercase tracking-tighter">
                  Coins Logged
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center group hover:bg-white/10 transition-colors">
                <Package className="w-4 h-4 text-emerald-400 mx-auto mb-1 opacity-60 group-hover:opacity-100" />
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Stealth (স্টেল্থ)</div>
                <div className="text-lg font-black font-mono text-emerald-400 mt-0.5 leading-none tracking-tight">
                  {caughtCount === 0 ? 'Ghost' : 'Detected'}
                </div>
                <div className="text-[8px] text-emerald-500/60 mt-1 font-black uppercase tracking-tighter">
                  +{stealthBonus} Efficiency
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[10px] text-slate-400 italic">
              "{caughtCount === 0
                ? 'অনবদ্য কৌশল! কোনো শত্রু আপনাকে সনাক্ত করতে পারেনি।'
                : `মিশন সম্পন্ন হয়েছে, তবে শত্রু সতর্কতা বৃদ্ধি পেয়েছিল।`}"
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  onPlayAgain();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Next Mission • পরবর্তী মিশন</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {onReplaySameSeed && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onReplaySameSeed();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 font-black text-[10px] uppercase tracking-wider border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repeat (পুনরায়)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    onReturnToMenu();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-black text-[10px] uppercase tracking-wider border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Main Menu (মূল মেনু)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
