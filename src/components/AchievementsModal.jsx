import React from 'react';
import AchievementsView from './AchievementsView.jsx';

export default function AchievementsModal({ onClose }) {
  return (
    <div className="overlay" style={{ zIndex: 4 }}>
      <div className="overlay-card achievements-card">
        <div className="overlay-title">Achievements</div>
        <div className="overlay-actions" style={{ marginBottom: 16 }}>
          <button className="key action" onClick={onClose}>Close</button>
        </div>
        <AchievementsView />
      </div>
    </div>
  );
}