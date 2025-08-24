import React, { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import { WORDS } from './wordlist';

const ANSWER = WORDS[Math.floor(Math.random() * WORDS.length)];

export default function App() {
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState('');
  const composing = useRef(false);
  // jamo-based input (no composition)

  useEffect(() => {
    // expose for debugging
    window.__WORDLE_ANSWER__ = ANSWER;
    console.log('Answer:', ANSWER);

    function onKeyDown(e) {
      if (status) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrent((s) => s.slice(0, -1));
      } else if (e.key.length === 1) {
        // append raw jamo character (assume user types jamo or pastes)
        setCurrent((s) => {
          if (s.length >= 6) return s;
          return (s + e.key).slice(0, 6);
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [status]);

  function submitGuess() {
    if ([...current].length !== 6) return;
      let warned = false;
      if (!WORDS.includes(current)) {
        setStatus('단어에 없습니다');
        warned = true;
        // clear the warning after a short delay
        setTimeout(() => {
          setStatus('');
        }, 1500);
      }
      const next = [...guesses, current];
      setGuesses(next);
      setCurrent('');
      if (current === ANSWER) setStatus('정답!');
      else if (next.length >= 6) setStatus('실패!');
  }

  function onKey(key) {
    if (status) return;
    if (key === 'ENTER') {
      submitGuess();
      return;
    }
    if (key === 'BACK') {
      setCurrent((s) => s.slice(0, -1));
      return;
    }
    // append raw jamo char
    setCurrent((s) => {
      if (s.length >= 6) return s;
      return (s + key).slice(0, 6);
    });
  }

  // For jamo-based mode, show spaced jamo
  function decomposeToJamo(str) {
    return str.split('').join(' ');
  }

  return (
    <div className="app">
      <h1>K-Wordle</h1>
      <Board guesses={guesses} current={current} answer={ANSWER} />
      <Keyboard onKey={onKey} />
  <div className="status">{status}</div>
  <div className="debug">DEBUG ANSWER: {ANSWER} — JAMO: {decomposeToJamo(ANSWER)}</div>
    </div>
  );
}
