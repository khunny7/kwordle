import React, { useEffect, useState } from 'react';

export default function AchievementToast({ achievement, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      // Show toast
      setVisible(true);
      
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade-out animation
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className={`achievement-toast ${visible ? 'visible' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon" aria-label={achievement.iconLabel}>
          {achievement.icon}
        </div>
        <div className="toast-text">
          <div className="toast-title">Achievement Unlocked!</div>
          <div className="toast-name">{achievement.name}</div>
        </div>
      </div>
    </div>
  );
}