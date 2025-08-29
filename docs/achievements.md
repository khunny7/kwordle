# K-Wordle Achievements System

The K-Wordle achievements system provides players with 15 unlockable achievements that track their progress and skill across different aspects of gameplay.

## Features

- **15 Unique Achievements** covering play count, streaks, skill, speed, and behavioral milestones
- **Persistent Local Storage** - achievements survive browser refreshes and sessions
- **Real-time Evaluation** - achievements unlock immediately when conditions are met
- **Toast Notifications** - visual feedback when achievements are unlocked
- **Responsive UI** - accessible achievements modal with progress tracking
- **Retroactive Migration** - existing players get achievements based on their current stats

## Achievement Categories

### Play Count Achievements
- **First Steps** (👣) - Play your first game
- **Getting Started** (🔟) - Play 10 games  
- **Dedicated Player** (💯) - Play 100 games

### Victory Achievements
- **Victory!** (🏆) - Win your first game
- **On Fire** (🔥) - Win 3 games in a row
- **Blazing** (🔥🔥) - Win 5 games in a row
- **Unstoppable** (🔥🚀) - Win 10 games in a row
- **Resilient** (🪃) - Win immediately after a loss

### Skill Achievements
- **Precision** (🎯) - Solve in 3 guesses or fewer
- **Incredible Luck** (🥇) - Solve in 1 guess
- **Lightning Fast** (⚡) - Win in under 60 seconds

### Behavioral Achievements
- **Perseverance** (🧱) - Lose 3 games in a row
- **Early Bird** (🌅) - Play a game before 7:00 AM
- **Night Owl** (🌙) - Play a game after 10:00 PM
- **Share the Fun** (📣) - Share results at least once

## Technical Implementation

### File Structure
```
src/
├── achievements/
│   ├── achievements.js      # Achievement definitions and registry
│   └── evaluator.js         # Achievement evaluation and unlocking logic
├── components/
│   ├── AchievementsView.jsx # Main achievements grid display
│   ├── AchievementsModal.jsx # Modal wrapper for achievements
│   └── AchievementToast.jsx # Toast notification component
└── storage.js               # Enhanced storage with achievement persistence
```

### Data Storage

Achievements are stored in localStorage using these keys:
- `kwordle_achievements_v1` - Array of unlocked achievements with timestamps
- `kwordle_stats_v1` - Enhanced game statistics for achievement evaluation
- `kwordle:history:v1` - Game history (existing)

### Achievement Data Structure

Each achievement has:
```javascript
{
  id: 'achievement-id',           // Stable identifier
  name: 'Achievement Name',       // Display name
  description: 'Description text', // What player needs to do
  icon: '🏆',                    // Emoji icon
  iconLabel: 'trophy',           // Accessibility label
  checkUnlock: (stats, lastGame) => boolean // Unlock condition
}
```

### Statistics Tracked

The system tracks these statistics for achievement evaluation:
- `gamesPlayed` - Total games completed
- `wins` / `losses` - Win/loss counts
- `currentWinStreak` / `maxWinStreak` - Win streak tracking
- `currentLossStreak` / `maxLossStreak` - Loss streak tracking
- `bestGuessCount` - Fewest guesses to win
- `fastestWinSeconds` - Fastest win time
- `sharedCount` - Number of times results shared
- `gameHistory` - Recent game results for context-dependent achievements

## Adding New Achievements

To add a new achievement:

1. **Define the achievement** in `src/achievements/achievements.js`:
```javascript
{
  id: 'new-achievement',
  name: 'New Achievement',
  description: 'Description of what unlocks this',
  icon: '🆕',
  iconLabel: 'new',
  checkUnlock: (stats, lastGame) => {
    // Return true when achievement should unlock
    return stats.someCondition >= threshold;
  }
}
```

2. **Add to the ACHIEVEMENTS array** in the same file

3. **Update TOTAL_ACHIEVEMENTS** if the constant is used elsewhere

4. **Test the unlock logic** to ensure it works correctly

5. **Update this documentation** with the new achievement details

## API Reference

### Core Functions

#### `evaluateAndUnlockAchievements(stats, lastGame)`
Evaluates all achievements and unlocks any that meet their criteria.
- `stats` - Current game statistics object
- `lastGame` - Most recent game result object
- Returns: Array of newly unlocked achievement objects

#### `getAllAchievementsWithStatus()`
Gets all achievements with their current unlock status.
- Returns: Array of achievements with `unlocked` and `unlockedAt` properties

#### `getUnlockedCount()`
Gets the number of currently unlocked achievements.
- Returns: Number of unlocked achievements

### Storage Functions

#### `unlockAchievement(achievementId)`
Unlocks a specific achievement.
- `achievementId` - The stable ID of the achievement
- Returns: `true` if newly unlocked, `false` if already unlocked

#### `getUnlockedAchievements()`
Gets all unlocked achievements with timestamps.
- Returns: Array of `{id, unlockedAt}` objects

#### `updateGameStats(gameResult)`
Updates game statistics based on a completed game.
- `gameResult` - Object with game outcome data
- Returns: Updated statistics object

## Integration Points

The achievement system integrates with the main game at these points:

1. **Game Completion** - `submitGuess()` function calls achievement evaluation
2. **Game Timing** - Timer starts on first input, stops on game end
3. **Sharing** - Share button increments share count
4. **UI Navigation** - Achievements button in header opens modal
5. **Migration** - Existing users get retroactive achievements on first load

## Accessibility

- All achievement icons have proper `aria-label` attributes
- Achievements grid uses semantic markup
- Toast notifications are announced to screen readers
- Keyboard navigation supported in modal
- High contrast support for locked/unlocked states

## Performance

- Achievement evaluation is O(N) where N is number of achievements (currently 15)
- Runs only on game completion, not during gameplay
- LocalStorage operations are wrapped in try/catch for error handling
- UI components use React memoization where appropriate