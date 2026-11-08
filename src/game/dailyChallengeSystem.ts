import { DailyChallenge } from './types';

export const DAILY_CHALLENGE_POOL = [
  { id: 'dc_coins', title: 'Coin Collector', description: 'Collect 20 gold coins.', objectiveCount: 20 },
  { id: 'dc_chests', title: 'Chest Opener', description: 'Open 2 treasure chests.', objectiveCount: 2 },
  { id: 'dc_survival', title: 'Crystal Rescuer', description: 'Rescue 2 survival crystals.', objectiveCount: 2 },
  { id: 'dc_puzzles', title: 'Puzzle Solver', description: 'Solve 1 puzzle.', objectiveCount: 1 },
];

export class DailyChallengeManager {
  public static getChallenges(): DailyChallenge[] {
    const stored = localStorage.getItem('dailyChallenges');
    const lastDate = localStorage.getItem('lastChallengeDate');
    const today = new Date().toDateString();

    if (stored && lastDate === today) {
      return JSON.parse(stored);
    }

    // Generate new
    const challenges: DailyChallenge[] = DAILY_CHALLENGE_POOL
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(c => ({ ...c, currentCount: 0, completed: false, rewardXp: 100 }));

    localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
    localStorage.setItem('lastChallengeDate', today);
    return challenges;
  }

  public static updateChallenge(id: string, progress: number) {
    const challenges = this.getChallenges();
    const challenge = challenges.find(c => c.id === id);
    if (challenge && !challenge.completed) {
      challenge.currentCount = Math.min(challenge.currentCount + progress, challenge.objectiveCount);
      if (challenge.currentCount >= challenge.objectiveCount) {
        challenge.completed = true;
      }
      localStorage.setItem('dailyChallenges', JSON.stringify(challenges));
    }
  }
}
