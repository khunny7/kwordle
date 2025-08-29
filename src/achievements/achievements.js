// Achievements registry for K-Wordle
// Each achievement has an id, name, description, icon, and unlock criteria

export const ACHIEVEMENTS = [
  {
    id: 'first-game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '👣',
    iconLabel: 'footsteps',
    checkUnlock: (stats) => stats.gamesPlayed >= 1
  },
  {
    id: 'ten-games',
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🔟',
    iconLabel: 'ten',
    checkUnlock: (stats) => stats.gamesPlayed >= 10
  },
  {
    id: 'hundred-games',
    name: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '💯',
    iconLabel: 'hundred points',
    checkUnlock: (stats) => stats.gamesPlayed >= 100
  },
  {
    id: 'first-win',
    name: 'Victory!',
    description: 'Win your first game',
    icon: '🏆',
    iconLabel: 'trophy',
    checkUnlock: (stats) => stats.wins >= 1
  },
  {
    id: 'hot-streak-3',
    name: 'On Fire',
    description: 'Win 3 games in a row',
    icon: '🔥',
    iconLabel: 'fire',
    checkUnlock: (stats) => stats.maxWinStreak >= 3
  },
  {
    id: 'hot-streak-5',
    name: 'Blazing',
    description: 'Win 5 games in a row',
    icon: '🔥🔥',
    iconLabel: 'double fire',
    checkUnlock: (stats) => stats.maxWinStreak >= 5
  },
  {
    id: 'hot-streak-10',
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '🔥🚀',
    iconLabel: 'fire rocket',
    checkUnlock: (stats) => stats.maxWinStreak >= 10
  },
  {
    id: 'bounce-back',
    name: 'Resilient',
    description: 'Win immediately after a loss',
    icon: '🪃',
    iconLabel: 'boomerang',
    checkUnlock: (stats, lastGame) => {
      // Check if last game was a win and previous was a loss
      if (!lastGame || !lastGame.success) return false;
      const history = stats.gameHistory || [];
      if (history.length < 2) return false;
      const secondLast = history[history.length - 2];
      return !secondLast.success;
    }
  },
  {
    id: 'speedy-solver',
    name: 'Lightning Fast',
    description: 'Win in under 60 seconds',
    icon: '⚡',
    iconLabel: 'lightning',
    checkUnlock: (stats) => stats.fastestWinSeconds && stats.fastestWinSeconds < 60
  },
  {
    id: 'sharpshooter',
    name: 'Precision',
    description: 'Solve in 3 guesses or fewer',
    icon: '🎯',
    iconLabel: 'target',
    checkUnlock: (stats) => stats.bestGuessCount && stats.bestGuessCount <= 3
  },
  {
    id: 'golden-first-try',
    name: 'Incredible Luck',
    description: 'Solve in 1 guess',
    icon: '🥇',
    iconLabel: 'gold medal',
    checkUnlock: (stats) => stats.bestGuessCount === 1
  },
  {
    id: 'resilience-3',
    name: 'Perseverance',
    description: 'Lose 3 games in a row',
    icon: '🧱',
    iconLabel: 'brick',
    checkUnlock: (stats) => stats.maxLossStreak >= 3
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Play a game before 7:00 AM',
    icon: '🌅',
    iconLabel: 'sunrise',
    checkUnlock: (stats, lastGame) => {
      if (!lastGame) return false;
      const gameTime = new Date(lastGame.ts);
      return gameTime.getHours() < 7;
    }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Play a game after 10:00 PM',
    icon: '🌙',
    iconLabel: 'moon',
    checkUnlock: (stats, lastGame) => {
      if (!lastGame) return false;
      const gameTime = new Date(lastGame.ts);
      return gameTime.getHours() >= 22;
    }
  },
  {
    id: 'social-butterfly',
    name: 'Share the Fun',
    description: 'Share results at least once',
    icon: '📣',
    iconLabel: 'megaphone',
    checkUnlock: (stats) => stats.sharedCount >= 1
  }
];

// Helper function to get achievement by id
export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get total number of achievements
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;