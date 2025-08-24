import React from 'react';

// Layout based on the common 2-set Korean keyboard grouping
const ROWS = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
  ['ㄲ','ㄸ','ㅃ','ㅆ','ㅉ','ㅒ','ㅖ'] // doubled jamo and archaic combos
];

export default function Keyboard({ onKey }) {
  return (
    <div className="keyboard">
      <div className="keyboard-rows">
        {ROWS.map((row, ri) => (
          <div className="key-row" key={ri}>
            {row.map((k) => (
              <button key={k} className="key" onClick={() => onKey(k)}>{k}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="enter" onClick={() => onKey('ENTER')}>Enter</button>
        <button className="back" onClick={() => onKey('BACK')}>Back</button>
      </div>
    </div>
  );
}
