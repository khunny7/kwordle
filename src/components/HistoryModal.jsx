import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory } from '../storage';

export default function HistoryModal({ onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const list = getHistory()
      .slice()
      .sort((a, b) => b.ts - a.ts);
    setItems(list);
  }, []);

  function fmt(ts) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }

  function jamo(str) {
    return (str || '').split('').join(' ');
  }

  function onClear() {
    clearHistory();
    setItems([]);
  }

  // quick stats
  const total = items.length;
  const wins = items.filter(i => i.success).length;
  const rate = total ? Math.round((wins / total) * 100) : 0;
  const avgGuesses = total ? (items.reduce((s, i) => s + i.guesses, 0) / total).toFixed(2) : '0.00';

  return (
    <div className="overlay" style={{ zIndex: 4 }}>
      <div className="overlay-card history-card">
        <div className="overlay-title">History</div>
        <div className="history-stats">
          <div className="stat"><div className="stat-num">{total}</div><div className="stat-label">Games</div></div>
          <div className="stat"><div className="stat-num">{wins}</div><div className="stat-label">Wins</div></div>
          <div className="stat"><div className="stat-num">{rate}%</div><div className="stat-label">Win Rate</div></div>
          <div className="stat"><div className="stat-num">{avgGuesses}</div><div className="stat-label">Avg Guesses</div></div>
        </div>
        <div className="history-actions">
          <button className="key" onClick={onClear}>Clear</button>
          <button className="key action" onClick={onClose}>Close</button>
        </div>
        {items.length === 0 ? (
          <div className="history-empty">No games yet.</div>
        ) : (
          <div className="history-list">
            {items.map((it, idx) => (
              <div key={idx} className="history-item grid">
                <div className="col-left">
                  <span className={`badge ${it.success ? 'badge-win' : 'badge-lose'}`}>{it.success ? 'Win' : 'Lose'}</span>
                  <div className="answer chip-alt">{jamo(it.answer)}</div>
                </div>
                <div className="col-right">
                  <div className="muted">{fmt(it.ts)}</div>
                  <div className="muted">{it.guesses} guesses</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
