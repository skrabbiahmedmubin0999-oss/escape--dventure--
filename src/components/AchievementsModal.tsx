import React, { useState } from 'react';
import { PlayerStats, QuestProgress, AchievementItem, DailyChallenge } from '../game/types';
import { X, Trophy, Award, Coins, Sparkles, CheckCircle2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/soundSystem';
import { DailyChallengeManager } from '../game/dailyChallengeSystem';

interface Props {
  onClose: () => void;
  stats: PlayerStats;
  quest: QuestProgress;
}

export const AchievementsModal: React.FC<Props> = ({ onClose, stats, quest }) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'daily'>('achievements');
  const dailyChallenges = DailyChallengeManager.getChallenges();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88dvh]"
      >
        {/* Header - Commendation Terminal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              {activeTab === 'achievements' ? <Trophy className="w-6 h-6" /> : <ListTodo className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight leading-snug">{activeTab === 'achievements' ? 'Expedition Merits' : 'Daily Challenges'}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>{activeTab === 'achievements' ? 'Milestone Recognition' : 'Task Completion'}</span>
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-amber-400/80 font-mono text-[10px]">AUTH_CERTIFIED</span>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-white/5">
          <button
            onClick={() => { sound.playClick(); setActiveTab('achievements'); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Achievements
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('daily'); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Daily Challenges
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-wider">
            {activeTab === 'achievements' ? <Award className="w-4 h-4 text-amber-400" /> : <ListTodo className="w-4 h-4 text-cyan-400" />}
            <span>{activeTab === 'achievements' ? 'Badge Progress' : 'Task Status'}</span>
            <span className="text-white font-black">
              {activeTab === 'achievements' ? `${achievements.filter((a) => a.unlocked).length} / ${achievements.length}` : `${dailyChallenges.filter((d) => d.completed).length} / ${dailyChallenges.length}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400 font-black">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.totalCoins || quest.coinsCollected}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stats.xp || quest.xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-6 flex-1 space-y-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'achievements' ? achievements.map((ach) => (
            <motion.div
              key={ach.id}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                ach.unlocked
                  ? 'bg-white/5 border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.05)]'
                  : 'bg-black/20 border-white/5 opacity-60 grayscale'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${
                  ach.unlocked ? 'bg-amber-400/20 border border-amber-400/40' : 'bg-white/5 border border-white/5'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
                    <span className="truncate">{ach.title}</span>
                    {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                  <span className="text-[10px] font-black text-amber-400/80 font-mono tabular-nums">
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal line-clamp-2">{ach.description}</p>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-3 p-px border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )) : dailyChallenges.map((dc) => (
            <motion.div
              key={dc.id}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                dc.completed
                  ? 'bg-white/5 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.05)]'
                  : 'bg-black/20 border-white/5'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  dc.completed ? 'bg-cyan-400/20 border border-cyan-400/40' : 'bg-white/5 border border-white/5'
                }`}
              >
                <ListTodo className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
                    <span className="truncate">{dc.title}</span>
                    {dc.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </h4>
                  <span className="text-[10px] font-black text-cyan-400/80 font-mono tabular-nums">
                    {dc.currentCount} / {dc.objectiveCount}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal line-clamp-2">{dc.description}</p>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-3 p-px border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(dc.currentCount / dc.objectiveCount) * 100}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      dc.completed ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            {activeTab === 'achievements' ? 'RECORD_SYNC // NODES: ACTIVE' : 'DAILY_RESET // 24H_CYCLE'}
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[46px] px-10 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </div>
  );
};

