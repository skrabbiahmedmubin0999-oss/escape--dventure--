import React from 'react';
import { PlayerStats, QuestProgress, AchievementItem } from '../game/types';
import { X, Trophy, Award, Coins, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  stats: PlayerStats;
  quest: QuestProgress;
}

export const AchievementsModal: React.FC<Props> = ({ onClose, stats, quest }) => {
  const achievements: AchievementItem[] = [
    {
      id: 'ach_coins',
      title: 'Golden Pioneer',
      description: 'Gather 50 Gold Coins across Mystery Island.',
      icon: '🪙',
      unlocked: (quest.coinsCollected || 0) >= 50,
      progress: Math.min(50, quest.coinsCollected || 0),
      maxProgress: 50,
      rewardCoins: 25,
      rewardXp: 50,
    },
    {
      id: 'ach_keys',
      title: 'Key Master',
      description: 'Collect all 3 Elemental Gate Keys (Sun, Ocean, Forest).',
      icon: '🗝️',
      unlocked: quest.keysCount >= 3,
      progress: quest.keysCount,
      maxProgress: 3,
      rewardCoins: 50,
      rewardXp: 100,
    },
    {
      id: 'ach_chests',
      title: 'Treasure Hunter',
      description: 'Uncover all 3 hidden secret treasure chests.',
      icon: '📦',
      unlocked: quest.chestsOpened >= 3,
      progress: quest.chestsOpened,
      maxProgress: 3,
      rewardCoins: 75,
      rewardXp: 150,
    },
    {
      id: 'ach_puzzles',
      title: 'Ancient Riddle Solver',
      description: 'Solve all 3 interactive puzzles (Symbols, Switches, Rune Dial).',
      icon: '🧩',
      unlocked: (quest.puzzlesSolvedCount || 0) >= 3,
      progress: quest.puzzlesSolvedCount || 0,
      maxProgress: 3,
      rewardCoins: 100,
      rewardXp: 200,
    },
    {
      id: 'ach_obstacles',
      title: 'Course Champion',
      description: 'Traverse moving platforms and reach the Grand Finish Line.',
      icon: '🏁',
      unlocked: (quest.checkpointsReached || 0) >= 5,
      progress: quest.checkpointsReached || 0,
      maxProgress: 5,
      rewardCoins: 100,
      rewardXp: 200,
    },
    {
      id: 'ach_survival',
      title: 'Resistant Explorer',
      description: 'Rescue 5 Survival Energy Crystals across dynamic weather conditions.',
      icon: '💎',
      unlocked: (quest.crystalsCollected || 0) >= 5,
      progress: quest.crystalsCollected || 0,
      maxProgress: 5,
      rewardCoins: 75,
      rewardXp: 150,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto font-sans">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88dvh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-snug">Achievements & Badges</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Progression Milestones & Rewards</p>
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

        {/* Stats summary bar */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-amber-950/20 border-b border-amber-900/30 flex items-center justify-between text-xs flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-amber-200 font-bold">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{achievements.filter((a) => a.unlocked).length} / {achievements.length} Badges</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-yellow-400 font-extrabold flex items-center gap-1 text-[11px] sm:text-xs">
              <Coins className="w-3.5 h-3.5" /> {stats.totalCoins || quest.coinsCollected}
            </span>
            <span className="text-cyan-400 font-extrabold flex items-center gap-1 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5" /> {stats.xp || quest.xpEarned} XP
            </span>
          </div>
        </div>

        {/* List */}
        <div className="p-3.5 sm:p-5 flex-1 space-y-2.5 overflow-y-auto custom-scrollbar">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-slate-800/80 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-slate-900/50 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 ${
                  ach.unlocked ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1 truncate">
                    <span className="truncate">{ach.title}</span>
                    {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </h4>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 shrink-0 font-mono">
                    {ach.progress}/{ach.maxProgress}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{ach.description}</p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-emerald-400' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
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
