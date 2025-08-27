import React, { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import HistoryModal from './components/HistoryModal';
import HistoryView from './components/HistoryView';
import { WORDS } from './wordlist';
import { appendHistory } from './storage';

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function App() {
  const isDev = import.meta.env.DEV;
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const [winRow, setWinRow] = useState(-1);
  const [gameOver, setGameOver] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allowed, setAllowed] = useState(null);
  const [wordLen, setWordLen] = useState(() => {
    const saved = Number(localStorage.getItem('kwordle.wordLen'));
    return saved === 7 || saved === 8 ? saved : 6;
  });
  const [answer, setAnswer] = useState('');
  const confettiRef = useRef(null);
  const composing = useRef(false);
  // jamo-based input (no composition)

  useEffect(() => {
  localStorage.setItem('kwordle.wordLen', String(wordLen));
    // set answer and allowed whenever mode changes
    const filtered = WORDS.filter(w => [...w].length === wordLen);
    const url = wordLen === 6 ? '/allowed.json' : `/allowed-${wordLen}.json`;
    fetch(url).then(r => r.json()).then((list) => {
      if (Array.isArray(list)) {
        const union = new Set([...list, ...filtered]);
        setAllowed(union);
        const candidates = list && list.length ? list : filtered;
        const nextAnswer = candidates.length ? pickRandom(candidates) : 'ㅏ'.repeat(wordLen);
        setAnswer(nextAnswer);
          if (isDev) {
            window.__WORDLE_ANSWER__ = nextAnswer;
            console.log('Answer:', nextAnswer, 'len:', wordLen);
          } else {
            if ('__WORDLE_ANSWER__' in window) delete window.__WORDLE_ANSWER__;
          }
      } else {
        setAllowed(new Set(filtered));
        const nextAnswer = filtered.length ? pickRandom(filtered) : 'ㅏ'.repeat(wordLen);
        setAnswer(nextAnswer);
          if (isDev) {
            window.__WORDLE_ANSWER__ = nextAnswer;
            console.log('Answer:', nextAnswer, 'len:', wordLen);
          } else {
            if ('__WORDLE_ANSWER__' in window) delete window.__WORDLE_ANSWER__;
          }
      }
    }).catch(() => {
      setAllowed(new Set(filtered));
      const nextAnswer = filtered.length ? pickRandom(filtered) : 'ㅏ'.repeat(wordLen);
      setAnswer(nextAnswer);
        if (isDev) {
          window.__WORDLE_ANSWER__ = nextAnswer;
          console.log('Answer:', nextAnswer, 'len:', wordLen);
        } else {
          if ('__WORDLE_ANSWER__' in window) delete window.__WORDLE_ANSWER__;
        }
    });

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
          if ([...s].length >= wordLen) return s;
          const next = (s + e.key);
          return [...next].slice(0, wordLen).join('');
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [status, wordLen]);

  function submitGuess() {
    if ([...current].length !== wordLen) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(-1), 520);
      return;
    }
  const inAllowed = allowed ? allowed.has(current) : WORDS.includes(current);
  if (!inAllowed) {
      setStatus('단어에 없습니다');
      setShakeRow(guesses.length);
      setTimeout(() => { setStatus(''); setShakeRow(-1); }, 1500);
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent('');
  if (current === answer) {
      setStatus('정답!');
      setWinRow(next.length - 1);
      setGameOver(true);
      triggerConfetti();
      appendHistory({
        ts: Date.now(),
    answer,
        success: true,
        guesses: next.length,
      });
  // History will be shown inside the game-over overlay
    } else if (next.length >= 6) {
      setStatus('실패!');
      setGameOver(true);
      appendHistory({
        ts: Date.now(),
        answer,
        success: false,
        guesses: next.length,
      });
  // History will be shown inside the game-over overlay
    }
  }

  function onKey(key) {
  if (gameOver) return;
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
      if ([...s].length >= wordLen) return s;
      const next = (s + key);
      return [...next].slice(0, wordLen).join('');
    });
  }

  // For jamo-based mode, show spaced jamo
  function decomposeToJamo(str) {
    return str.split('').join(' ');
  }

  function triggerConfetti() {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#22c55e', '#eab308', '#7c5cff', '#22d3ee', '#ef4444'];
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const count = 140;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: -20 - Math.random() * 80,
        r: 3 + Math.random() * 4,
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 180 + Math.random() * 60,
        angle: Math.random() * Math.PI * 2,
        spin: -0.2 + Math.random() * 0.4,
      });
    }
    let frame = 0;
    function step() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.angle += p.spin; p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      });
      // fade out
      if (frame < 300) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, W, H);
    }
    step();
  }

  function nextGame() {
    // soft reset: new answer, clear guesses and state
    setGuesses([]);
    setCurrent('');
    setStatus('');
    setShakeRow(-1);
    setWinRow(-1);
  setGameOver(false);
  // Pick a new answer for the current mode
  const filtered = WORDS.filter(w => [...w].length === wordLen);
  const candidates = allowed && allowed.size ? Array.from(allowed) : filtered;
  const nextAnswer = candidates.length ? pickRandom(candidates) : 'ㅏ'.repeat(wordLen);
  setAnswer(nextAnswer);
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="brand"><div className="logo" /> K-Wordle</div>
        <div className="header-actions">
          <div className="segmented" role="group" aria-label="Word length selector">
            {[6,7,8].map((L)=> (
              <button
                key={L}
                type="button"
                className={`segmented-item ${wordLen===L ? 'active' : ''}`}
                aria-pressed={wordLen===L}
                onClick={() => { setGuesses([]); setCurrent(''); setStatus(''); setShakeRow(-1); setWinRow(-1); setGameOver(false); setWordLen(L); }}
                title={`${L}자`}
              >{L}</button>
            ))}
          </div>
          <button className="key" onClick={() => setShowHistory(true)}>History</button>
        </div>
      </div>
      <div className="panel">
        <Board guesses={guesses} current={current} answer={answer} shakeRowIndex={shakeRow} winRowIndex={winRow} wordLen={wordLen} />
      </div>
      <Keyboard onKey={onKey} guesses={guesses} answer={answer} />
      {status ? <div className="status">{status}</div> : null}
      {gameOver && (
        <div className="overlay">
          <div className="overlay-card history-card">
            <div className="overlay-title">{status || '게임 종료'}</div>
            <div className="overlay-sub">정답: {decomposeToJamo(answer)}</div>
            <div className="overlay-actions" style={{ marginBottom: 12 }}>
              <button className="key action" onClick={nextGame}>Next Game</button>
            </div>
            <HistoryView />
          </div>
        </div>
      )}
  {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      <canvas ref={confettiRef} className="confetti" />
        {isDev && (
          <div className="debug">DEBUG ANSWER: {answer} — JAMO: {decomposeToJamo(answer)} (len {wordLen})</div>
        )}
    </div>
  );
}
