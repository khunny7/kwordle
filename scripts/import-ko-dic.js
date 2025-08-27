// Parse data/ko.dic and write Hangul-only NFC words to data/raw_words.txt
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const inPath = path.join(root, 'data', 'ko.dic');
const outPath = path.join(root, 'data', 'raw_words.txt');
const backupPath = path.join(root, 'data', 'raw_words.prev.txt');

if (!fs.existsSync(inPath)) {
  console.error('Missing input:', inPath);
  process.exit(1);
}

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/);

// Compose to syllables then filter ^[가-힣]+$
const hangulSyllable = /^[\uAC00-\uD7A3]+$/;

const out = [];
const seen = new Set();
let considered = 0;

for (let i = 0; i < lines.length; i++) {
  let s = lines[i];
  if (!s) continue;
  if (i === 0 && /^\d+$/.test(s.trim())) continue; // header count in Hunspell dic
  // take token before first slash
  const idx = s.indexOf('/');
  if (idx !== -1) s = s.slice(0, idx);
  s = s.trim();
  if (!s) continue;
  considered++;
  const nfc = s.normalize('NFC');
  if (!hangulSyllable.test(nfc)) continue;
  if (seen.has(nfc)) continue;
  seen.add(nfc);
  out.push(nfc);
}

try {
  if (fs.existsSync(outPath)) fs.copyFileSync(outPath, backupPath);
} catch {}

fs.writeFileSync(outPath, out.join('\n') + (out.length ? '\n' : ''), 'utf8');
console.log('ko.dic import complete');
console.log('  Considered:', considered);
console.log('  Kept:', out.length);
console.log('  Wrote:', path.relative(root, outPath));
