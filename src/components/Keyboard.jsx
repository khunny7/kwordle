import React, { useMemo } from 'react';

// Layout based on the common 2-set Korean keyboard grouping
const ROWS = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
  ['ㄲ','ㄸ','ㅃ','ㅆ','ㅉ','ㅒ','ㅖ'] // doubled jamo and archaic combos
];

function mergeState(prev, next) {
  const priority = { absent: 0, present: 1, correct: 2 };
  if (!prev) return next;
  return priority[next] > priority[prev] ? next : prev;
}

export default function Keyboard({ onKey, guesses = [], answer = '' }) {
  const keyStates = useMemo(() => {
    const map = {};
    for (const g of guesses) {
      const len = Math.max(g.length, answer.length);
      const res = Array.from({ length: len }, () => 'absent');
      const counts = {};
      for (let i = 0; i < answer.length; i++) counts[answer[i]] = (counts[answer[i]] || 0) + 1;
      for (let i = 0; i < g.length; i++) if (g[i] === answer[i]) { res[i] = 'correct'; counts[g[i]] -= 1; }
      for (let i = 0; i < g.length; i++) if (res[i] !== 'correct' && counts[g[i]] > 0) { res[i] = 'present'; counts[g[i]] -= 1; }
      for (let i = 0; i < g.length; i++) {
        const ch = g[i];
        map[ch] = mergeState(map[ch], res[i]);
      }
    }
    return map;
  }, [guesses, answer]);

  return (
    <div className="keyboard">
      <div className="keyboard-rows">
        {ROWS.map((row, ri) => (
          <div className="key-row" key={ri}>
            {row.map((k) => {
              const state = keyStates[k];
              const cls = state ? `key state-${state}` : 'key';
              return (
                <button key={k} className={cls} onClick={() => onKey(k)}>{k}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="key action" onClick={() => onKey('ENTER')}>Enter</button>
        <button className="key action" onClick={() => onKey('BACK')}>Back</button>
      </div>
    </div>
  );
}
