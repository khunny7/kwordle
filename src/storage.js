const KEY = 'kwordle:history:v1';
const ACHIEVEMENTS_KEY = 'kwordle_achievements_v1';
const STATS_KEY = 'kwordle_stats_v1';

export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry) {
  try {
    const list = getHistory();
    list.push(entry);
    // keep last 100
    const trimmed = list.slice(-100);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}

// Achievement storage functions
export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(achievementId) {
  try {
    const unlocked = getUnlockedAchievements();
    // Check if already unlocked
    if (unlocked.find(a => a.id === achievementId)) {
      return false; // Already unlocked
    }
    
    const newAchievement = {
      id: achievementId,
      unlockedAt: Date.now()
    };
    
    unlocked.push(newAchievement);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    return true; // Newly unlocked
  } catch {
    return false;
  }
}

export function clearAchievements() {
  try { localStorage.removeItem(ACHIEVEMENTS_KEY); } catch { /* noop */ }
}

// Enhanced stats storage functions
export function getGameStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      // Initialize with default stats
      const defaultStats = {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        currentWinStreak: 0,
        maxWinStreak: 0,
        currentLossStreak: 0,
        maxLossStreak: 0,
        bestGuessCount: null,
        fastestWinSeconds: null,
        sharedCount: 0,
        gameHistory: [] // Recent game history for certain achievement checks
      };
      return defaultStats;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure all required fields exist (for backwards compatibility)
    const stats = {
      gamesPlayed: parsed.gamesPlayed || 0,
      wins: parsed.wins || 0,
      losses: parsed.losses || 0,
      currentWinStreak: parsed.currentWinStreak || 0,
      maxWinStreak: parsed.maxWinStreak || 0,
      currentLossStreak: parsed.currentLossStreak || 0,
      maxLossStreak: parsed.maxLossStreak || 0,
      bestGuessCount: parsed.bestGuessCount || null,
      fastestWinSeconds: parsed.fastestWinSeconds || null,
      sharedCount: parsed.sharedCount || 0,
      gameHistory: parsed.gameHistory || []
    };
    
    return stats;
  } catch {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      currentLossStreak: 0,
      maxLossStreak: 0,
      bestGuessCount: null,
      fastestWinSeconds: null,
      sharedCount: 0,
      gameHistory: []
    };
  }
}

export function updateGameStats(gameResult) {
  try {
    const stats = getGameStats();
    
    // Update basic counts
    stats.gamesPlayed++;
    
    if (gameResult.success) {
      stats.wins++;
      stats.currentWinStreak++;
      stats.currentLossStreak = 0;
      stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.currentWinStreak);
      
      // Track best guess count
      if (!stats.bestGuessCount || gameResult.guesses < stats.bestGuessCount) {
        stats.bestGuessCount = gameResult.guesses;
      }
      
      // Track fastest win time
      if (gameResult.durationSeconds) {
        if (!stats.fastestWinSeconds || gameResult.durationSeconds < stats.fastestWinSeconds) {
          stats.fastestWinSeconds = gameResult.durationSeconds;
        }
      }
    } else {
      stats.losses++;
      stats.currentLossStreak++;
      stats.currentWinStreak = 0;
      stats.maxLossStreak = Math.max(stats.maxLossStreak, stats.currentLossStreak);
    }
    
    // Update game history (keep last 10 for achievement checks)
    stats.gameHistory.push({
      success: gameResult.success,
      guesses: gameResult.guesses,
      ts: gameResult.ts,
      durationSeconds: gameResult.durationSeconds
    });
    stats.gameHistory = stats.gameHistory.slice(-10);
    
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  } catch {
    return getGameStats(); // Return default stats on error
  }
}

export function incrementSharedCount() {
  try {
    const stats = getGameStats();
    stats.sharedCount++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  } catch {
    return getGameStats();
  }
}

export function clearStats() {
  try { localStorage.removeItem(STATS_KEY); } catch { /* noop */ }
}
