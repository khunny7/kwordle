import React, { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import HistoryModal from './components/HistoryModal';
import HistoryView from './components/HistoryView';
import { WORDS } from './wordlist';
import { appendHistory } from './storage';

// Ensure we only use 6-jamo answers
const VALID_WORDS = WORDS.filter((w) => [...w].length === 6);
const ANSWER = VALID_WORDS.length
  ? VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)]
  : 'ㄱㅏㄴㅏㄷㅏ';

export default function App() {
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const [winRow, setWinRow] = useState(-1);
  const [gameOver, setGameOver] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allowed, setAllowed] = useState(null);
  const confettiRef = useRef(null);
  const composing = useRef(false);
  // jamo-based input (no composition)

  useEffect(() => {
    // expose for debugging
    window.__WORDLE_ANSWER__ = ANSWER;
    console.log('Answer:', ANSWER);
    // lazy-load allowed list
    fetch('/allowed.json').then(r => r.json()).then((list) => {
      if (Array.isArray(list)) {
        const union = new Set([...list, ...VALID_WORDS]);
        setAllowed(union);
      }
    }).catch(() => {
      // fallback to built-in WORDS if fetch fails
      setAllowed(new Set(VALID_WORDS));
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
    if ([...current].length !== 6) {
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
    if (current === ANSWER) {
      setStatus('정답!');
      setWinRow(next.length - 1);
      setGameOver(true);
      triggerConfetti();
      appendHistory({
        ts: Date.now(),
        answer: ANSWER,
        success: true,
        guesses: next.length,
      });
  // History will be shown inside the game-over overlay
    } else if (next.length >= 6) {
      setStatus('실패!');
      setGameOver(true);
      appendHistory({
        ts: Date.now(),
        answer: ANSWER,
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
      if (s.length >= 6) return s;
      return (s + key).slice(0, 6);
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
    // Force a refresh of the answer by reloading the page to re-run module init
    // Alternatively, we could refactor ANSWER to be stateful.
    window.location.reload();
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="brand"><div className="logo" /> K-Wordle</div>
        <div className="header-actions">
          <span className="chip">Jamo mode</span>
          <button className="key" onClick={() => setShowHistory(true)}>History</button>
        </div>
      </div>
      <div className="panel">
        <Board guesses={guesses} current={current} answer={ANSWER} shakeRowIndex={shakeRow} winRowIndex={winRow} />
      </div>
      <Keyboard onKey={onKey} guesses={guesses} answer={ANSWER} />
      {status ? <div className="status">{status}</div> : null}
      {gameOver && (
        <div className="overlay">
          <div className="overlay-card history-card">
            <div className="overlay-title">{status || '게임 종료'}</div>
            <div className="overlay-sub">정답: {decomposeToJamo(ANSWER)}</div>
            <div className="overlay-actions" style={{ marginBottom: 12 }}>
              <button className="key action" onClick={nextGame}>Next Game</button>
            </div>
            <HistoryView />
          </div>
        </div>
      )}
  {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      <canvas ref={confettiRef} className="confetti" />
      <div className="debug">DEBUG ANSWER: {ANSWER} — JAMO: {decomposeToJamo(ANSWER)}</div>
    </div>
  );
}
