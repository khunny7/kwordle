// Achievement evaluation and unlocking logic
import { ACHIEVEMENTS } from './achievements.js';
import { getGameStats, unlockAchievement, getUnlockedAchievements } from '../storage.js';

/**
 * Evaluates and unlocks any newly earned achievements based on current stats and last game
 * @param {Object} stats - Current game statistics
 * @param {Object} lastGame - The most recent game result
 * @returns {Array} Array of newly unlocked achievement objects
 */
export function evaluateAndUnlockAchievements(stats, lastGame = null) {
  const newlyUnlocked = [];
  const alreadyUnlocked = getUnlockedAchievements().map(a => a.id);
  
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (alreadyUnlocked.includes(achievement.id)) {
      continue;
    }
    
    // Check if this achievement should be unlocked
    try {
      const shouldUnlock = achievement.checkUnlock(stats, lastGame);
      if (shouldUnlock) {
        const wasUnlocked = unlockAchievement(achievement.id);
        if (wasUnlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    } catch (error) {
      console.warn('Error checking achievement:', achievement.id, error);
    }
  }
  
  return newlyUnlocked;
}

/**
 * Gets all achievements with their unlock status
 * @returns {Array} Array of achievement objects with unlocked property and unlockDate
 */
export function getAllAchievementsWithStatus() {
  const unlockedAchievements = getUnlockedAchievements();
  const unlockedMap = new Map(unlockedAchievements.map(a => [a.id, a.unlockedAt]));
  
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: unlockedMap.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) || null
  }));
}

/**
 * Gets the count of unlocked achievements
 * @returns {number} Number of unlocked achievements
 */
export function getUnlockedCount() {
  return getUnlockedAchievements().length;
}

/**
 * Retroactively unlock achievements for existing players
 * This is called when the achievements system is first introduced
 */
export function migrateExistingUserAchievements() {
  const stats = getGameStats();
  
  // If user has no games played, no need to migrate
  if (stats.gamesPlayed === 0) {
    return [];
  }
  
  // Get current unlock status to avoid double-migration
  const currentUnlocked = getUnlockedAchievements();
  if (currentUnlocked.length > 0) {
    return []; // Already migrated
  }
  
  // Evaluate achievements based on current stats
  // Note: Some achievements like early-bird, night-owl, bounce-back may not be 
  // retroactively unlockable without full game history, which is acceptable
  return evaluateAndUnlockAchievements(stats, null);
}