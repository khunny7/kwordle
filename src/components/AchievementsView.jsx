import React from 'react';
import { getAllAchievementsWithStatus, getUnlockedCount } from '../achievements/evaluator.js';
import { TOTAL_ACHIEVEMENTS } from '../achievements/achievements.js';

export default function AchievementsView() {
  const achievements = getAllAchievementsWithStatus();
  const unlockedCount = getUnlockedCount();

  function formatUnlockDate(timestamp) {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return '';
    }
  }

  return (
    <div className="achievements-embed">
      <div className="achievements-header">
        <div className="achievements-counter">
          <span className="counter-text">{unlockedCount}/{TOTAL_ACHIEVEMENTS} unlocked</span>
        </div>
      </div>
      
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            title={achievement.description}
          >
            <div className="achievement-icon" aria-label={achievement.iconLabel}>
              {achievement.icon}
            </div>
            <div className="achievement-content">
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-description">{achievement.description}</div>
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="achievement-date">
                  {formatUnlockDate(achievement.unlockedAt)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}