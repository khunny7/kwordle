/*
  Generate allowed jamo lists from raw Hangul words.
  Inputs (pick one):
   - lines: data/raw_words.txt (one word per line, Hangul syllable blocks)
   - csv/tsv: first column = word, second column = frequency (optional header)
  Output:
   - default: public/allowed.json (for len=6)
   - with --len N: public/allowed-N.json (unless --out provided)
   - with --len all: public/allowed-6.json, allowed-7.json, allowed-8.json

  CLI flags:
   --input <path>             default: data/raw_words.txt
   --format <lines|csv|tsv>   default: lines
   --len <6|7|8|all>          target jamo length(s); default 6
   --topN <int>               keep only the top N by frequency (for csv/tsv)
   --minCount <int>           keep rows with count >= minCount (for csv/tsv)
   --out <path>               explicit output path (single length only)
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--input') out.input = args[++i];
    else if (a === '--format') out.format = args[++i];
    else if (a === '--len') out.len = args[++i];
    else if (a === '--topN') out.topN = parseInt(args[++i], 10);
    else if (a === '--minCount') out.minCount = parseInt(args[++i], 10);
    else if (a === '--out') out.out = args[++i];
  }
  return out;
}

const opts = parseArgs();
const dataFile = path.resolve(projectRoot, opts.input || path.join('data', 'raw_words.txt'));
const format = (opts.format || 'lines').toLowerCase();

// Hangul decomposition to compatibility jamo
const LComp = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VComp = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const TComp = ['', 'ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const SBase = 0xac00, LCount = 19, VCount = 21, TCount = 28, NCount = VCount*TCount, SCount = LCount*NCount;
const KEYBOARD = new Set(['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ','ㅐ','ㅔ','ㅒ','ㅖ']);

function toCompatJamo(str){
  const out=[];
  for(const ch of str){
    const code=ch.codePointAt(0);
    if(code>=SBase && code<SBase+SCount){
      const s=code-SBase; const L=Math.floor(s/(VCount*TCount)); const V=Math.floor((s%(VCount*TCount))/TCount); const T=s%TCount;
      out.push(LComp[L], VComp[V]); const t=TComp[T]; if(t) out.push(...t.split(''));
    } else { out.push(ch);} 
  }
  return out.join('');
}

function parseLines(raw) {
  return raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(w => ({ word: w, count: 1 }));
}

function parseDelimited(raw, delim) {
  const rows = raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const out = [];
  for (let i=0;i<rows.length;i++) {
    const parts = rows[i].split(delim).map(s=>s.trim());
    if (!parts[0]) continue;
    let count = Number(parts[1]);
    // header detection
    if (i === 0 && Number.isNaN(count)) { continue; }
    if (Number.isNaN(count)) count = 1;
    out.push({ word: parts[0], count });
  }
  return out;
}

function run(){
  if(!fs.existsSync(dataFile)){
    console.error('Missing data file:', dataFile);
    process.exit(1);
  }
  const raw = fs.readFileSync(dataFile,'utf8');
  let rows;
  if (format === 'csv') rows = parseDelimited(raw, ',');
  else if (format === 'tsv') rows = parseDelimited(raw, '\t');
  else rows = parseLines(raw);

  if (opts.minCount) rows = rows.filter(r => r.count >= opts.minCount);
  if (opts.topN) rows = rows.sort((a,b)=>b.count-a.count).slice(0, opts.topN);

  const lensArg = (opts.len || '6').toLowerCase();
  const targets = lensArg === 'all' ? [6,7,8] : (/^\d+$/.test(lensArg) ? [parseInt(lensArg,10)] : null);
  if (!targets) {
    console.error('Invalid --len, expected 6|7|8|all. Got:', lensArg);
    process.exit(1);
  }

  for (const targetLen of targets) {
    const seen = new Set();
    const out = [];
    let considered = 0, kept = 0, filteredLen = 0, filteredKeyboard = 0;
    for(const r of rows){
      considered++;
      const j = toCompatJamo(r.word);
      const len = [...j].length;
      if(len!==targetLen) { filteredLen++; continue; }
      let ok=true; for(const c of j) if(!KEYBOARD.has(c)) { ok=false; break; }
      if(!ok) { filteredKeyboard++; continue; }
      if(!seen.has(j)) { seen.add(j); out.push(j); kept++; }
    }
    out.sort();
    // determine output path
    let outPath;
    if (opts.out && targets.length === 1) outPath = path.resolve(projectRoot, opts.out);
    else if (!opts.out && targets.length === 1 && targetLen === 6) outPath = path.resolve(projectRoot, 'public/allowed.json');
    else outPath = path.resolve(projectRoot, `public/allowed-${targetLen}.json`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[len=${targetLen}] Input rows: ${rows.length}, considered: ${considered}, kept: ${kept},`+
                ` filteredLen: ${filteredLen}, filteredByKeyboard: ${filteredKeyboard}`);
    console.log('Wrote', out.length, 'entries to', outPath);
  }
}

run();
