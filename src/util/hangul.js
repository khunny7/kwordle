// Convert Hangul syllables to compatibility jamo used by the on-screen keyboard
// and expand final consonant clusters into multiple jamo.

const SBase = 0xac00;
const LBase = 0x1100; // choseong
const VBase = 0x1161; // jungseong
const TBase = 0x11a7; // jongseong (0 means none)
const LCount = 19;
const VCount = 21;
const TCount = 28;
const NCount = VCount * TCount; // 588
const SCount = LCount * NCount; // 11172

// Choseong to compatibility jamo
const LComp = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];
// Jungseong to compatibility jamo
const VComp = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
];
// Jongseong to compatibility jamo(s), index 0 is empty
const TComp = [
  '',
  'ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

export function toCompatJamo(str) {
  const out = [];
  for (const ch of str) {
    const code = ch.codePointAt(0);
    // Hangul syllables
    if (code >= SBase && code < SBase + SCount) {
      const SIndex = code - SBase;
      const LIndex = Math.floor(SIndex / NCount);
      const VIndex = Math.floor((SIndex % NCount) / TCount);
      const TIndex = SIndex % TCount;
      out.push(LComp[LIndex]);
      out.push(VComp[VIndex]);
      const t = TComp[TIndex];
      if (t) out.push(...t.split(''));
    } else {
      // Already jamo or other symbols, pass through if compatibility jamo
      out.push(ch);
    }
  }
  return out.join('');
}

export const KEYBOARD_JAMO = new Set([
  // consonants
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
  // vowels (include common combos on keyboard)
  'ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ','ㅐ','ㅔ','ㅒ','ㅖ'
]);
