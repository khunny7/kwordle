import React from 'react';

function Cell({ c, cls }) {
  return <div className={cls}>{c || ''}</div>;
}

export function evaluate(guess, answer) {
  // Wordle-style evaluation for repeated characters
  const len = Math.max(guess.length, answer.length);
  const res = Array.from({ length: len }, () => 'absent');
  const answerCounts = {};
  for (let i = 0; i < answer.length; i++) {
    const ch = answer[i];
    answerCounts[ch] = (answerCounts[ch] || 0) + 1;
  }
  // first pass: correct
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      res[i] = 'correct';
      answerCounts[guess[i]] -= 1;
    }
  }
  // second pass: present
  for (let i = 0; i < guess.length; i++) {
    if (res[i] === 'correct') continue;
    const ch = guess[i];
    if (answerCounts[ch] > 0) {
      res[i] = 'present';
      answerCounts[ch] -= 1;
    }
  }
  return res;
}

export default function Board({ guesses, current, answer = '', shakeRowIndex = -1, winRowIndex = -1 }) {
  const rows = Array.from({ length: 6 }, (_, r) => guesses[r] || (r === guesses.length ? current : ''));

  return (
    <div className="board">
      {rows.map((g, r) => {
        const isSubmitted = r < guesses.length;
        const evals = isSubmitted ? evaluate(g, answer) : [];
        return (
          <div className={`row ${shakeRowIndex === r ? 'shake' : ''} ${winRowIndex === r ? 'win' : ''}`} key={r}>
            {Array.from({ length: 6 }, (_, i) => {
              const clsBase = 'cell';
              let cls = clsBase;
              if (isSubmitted && g) {
                const state = evals[i] || 'absent';
                const winCls = winRowIndex === r ? ' win-bounce' : '';
                cls = `${clsBase} ${state} reveal${winCls}`;
              }
              const style = winRowIndex === r ? { animationDelay: `${i * 80 + 620}ms` } : undefined;
              return <div key={i} style={style}><Cell c={g[i]} cls={cls} /></div>;
            })}
          </div>
        );
      })}
    </div>
  );
}
