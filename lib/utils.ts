export const FLAMES_DATA = {
  F: { label: 'Friends',   emoji: '🤝', glow: 'rgba(80,160,255,0.15)',  msg: "A beautiful bond built on trust and laughter. You make each other's world brighter every single day." },
  L: { label: 'Love',      emoji: '❤️', glow: 'rgba(255,50,120,0.18)',  msg: "The stars have aligned just for you two. This connection runs deeper than words can ever capture." },
  A: { label: 'Affection', emoji: '🥰', glow: 'rgba(255,150,80,0.16)',  msg: "Warm, caring and wonderfully sweet — you genuinely bring joy into each other's days." },
  M: { label: 'Marriage',  emoji: '💍', glow: 'rgba(255,220,80,0.18)',  msg: "Forever together? The universe thinks so. A match truly written in the stars." },
  E: { label: 'Enemies',   emoji: '⚔️', glow: 'rgba(200,50,50,0.18)',   msg: "Even the greatest rivals share electrifying stories. Who knows what sparks might fly?" },
  S: { label: 'Siblings',  emoji: '🫂', glow: 'rgba(100,200,120,0.15)', msg: "Like family — always there, occasionally annoying, bonded for a lifetime." }
} as const;

export type FlamesKey = keyof typeof FLAMES_DATA;

export function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

export function countRemaining(a: string, b: string) {
  const A = a.split('');
  const B = b.split('');
  for (let i = 0; i < A.length; i++) {
    const j = B.indexOf(A[i]);
    if (j !== -1) {
      A[i] = '';
      B[j] = '';
    }
  }
  return A.filter(Boolean).length + B.filter(Boolean).length;
}

export function calculateFlames(n: number): FlamesKey {
  let f: FlamesKey[] = ['F', 'L', 'A', 'M', 'E', 'S'];
  let idx = 0;
  while (f.length > 1) {
    idx = (idx + n - 1) % f.length;
    f.splice(idx, 1);
    if (idx >= f.length) idx = 0;
  }
  return f[0];
}

export function getEliminationOrder(n: number): FlamesKey[] {
  let f: FlamesKey[] = ['F', 'L', 'A', 'M', 'E', 'S'];
  let idx = 0;
  const out: FlamesKey[] = [];
  while (f.length > 1) {
    idx = (idx + n - 1) % f.length;
    out.push(f[idx]);
    f.splice(idx, 1);
    if (idx >= f.length) idx = 0;
  }
  return out;
}

// Sound Helpers
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(f: number, type: OscillatorType, dur: number, delay: number, vol: number) {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.type = type;
    o.frequency.setValueAtTime(f, ac.currentTime + delay);
    g.gain.setValueAtTime(vol, ac.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    o.start(ac.currentTime + delay);
    o.stop(ac.currentTime + delay + dur);
  } catch (e) {}
}

export function playSound(type: 'start' | 'reveal') {
  if (type === 'start') {
    [220, 330, 440].forEach((f, i) => playTone(f, 'sine', 0.15, i * 0.07, 0.18));
  } else if (type === 'reveal') {
    [440, 554, 659, 880].forEach((f, i) => playTone(f, 'triangle', 0.22, i * 0.09, 0.2));
    setTimeout(() => {
      [880, 1109, 1319].forEach((f, i) => playTone(f, 'sine', 0.18, i * 0.06, 0.17));
    }, 500);
  }
}
