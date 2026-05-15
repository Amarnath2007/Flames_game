/**
 * FLAMES — Relationship Destiny Logic
 * Optimized for performance and accessibility
 */

const DATA = {
  F: { label: 'Friends', emoji: '🤝', glow: 'rgba(80,160,255,0.15)', msg: 'A beautiful bond built on trust and laughter. You make each other\'s world brighter every single day.' },
  L: { label: 'Love', emoji: '❤️', glow: 'rgba(255,50,120,0.18)', msg: 'The stars have aligned just for you two. This connection runs deeper than words can ever capture.' },
  A: { label: 'Affection', emoji: '🥰', glow: 'rgba(255,150,80,0.16)', msg: 'Warm, caring and wonderfully sweet — you genuinely bring joy into each other\'s days.' },
  M: { label: 'Marriage', emoji: '💍', glow: 'rgba(255,220,80,0.18)', msg: 'Forever together? The universe thinks so. A match truly written in the stars.' },
  E: { label: 'Enemies', emoji: '⚔️', glow: 'rgba(200,50,50,0.18)', msg: 'Even the greatest rivals share electrifying stories. Who knows what sparks might fly?' },
  S: { label: 'Siblings', emoji: '🫂', glow: 'rgba(100,200,120,0.15)', msg: 'Like family — always there, occasionally annoying, bonded for a lifetime.' }
};

// DOM Cache
const refs = {
  n1: document.getElementById('n1'),
  n2: document.getElementById('n2'),
  calcBtn: document.getElementById('calcBtn'),
  err: document.getElementById('err'),
  load: document.getElementById('loading'),
  res: document.getElementById('result'),
  rEmoji: document.getElementById('rEmoji'),
  rWord: document.getElementById('rWord'),
  rPair: document.getElementById('rPair'),
  rMsg: document.getElementById('rMsg'),
  wCap: document.getElementById('wCap'),
  scEmoji: document.getElementById('scEmoji'),
  scRes: document.getElementById('scRes'),
  scNames: document.getElementById('scNamesEl'),
  sc: document.getElementById('sc'),
  actions: document.getElementById('actionsEl'),
  again: document.getElementById('btnAgain'),
  toast: document.getElementById('toast')
};

let state = {};

/* ── Core Algorithm ── */
const normalize = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

const countRemaining = (a, b) => {
  const A = a.split(''), B = b.split('');
  for (let i = 0; i < A.length; i++) {
    const j = B.indexOf(A[i]);
    if (j !== -1) { A[i] = null; B[j] = null; }
  }
  return A.filter(Boolean).length + B.filter(Boolean).length;
};

const calcFlames = (n) => {
  let f = ['F', 'L', 'A', 'M', 'E', 'S'], idx = 0;
  while (f.length > 1) {
    idx = (idx + n - 1) % f.length;
    f.splice(idx, 1);
    if (idx >= f.length) idx = 0;
  }
  return f[0];
};

const getEliminationOrder = (n) => {
  let f = ['F', 'L', 'A', 'M', 'E', 'S'], idx = 0, out = [];
  while (f.length > 1) {
    idx = (idx + n - 1) % f.length;
    out.push(f[idx]);
    f.splice(idx, 1);
    if (idx >= f.length) idx = 0;
  }
  return out;
};

/* ── UI Handlers ── */
const shakeElement = (el) => {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '_shk .36s ease';
  setTimeout(() => el.style.animation = '', 400);
};

const showToast = (msg) => {
  refs.toast.textContent = msg;
  refs.toast.classList.add('on');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => refs.toast.classList.remove('on'), 2600);
};

const handleGo = () => {
  const name1 = refs.n1.value.trim();
  const name2 = refs.n2.value.trim();

  if (!name1 || !name2) {
    refs.err.textContent = !name1 && !name2 ? 'Please enter both names 🔥' : !name1 ? 'Enter your name ✨' : 'Enter their name 💫';
    if (!name1) shakeElement(refs.n1);
    if (!name2) shakeElement(refs.n2);
    return;
  }

  const a = normalize(name1);
  const b = normalize(name2);
  const count = countRemaining(a, b) || (a.length + b.length);
  const winner = calcFlames(count);
  const order = getEliminationOrder(count);

  state = { name1, name2, count, winner, order, data: DATA[winner] };

  if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
  playSound('start');

  refs.load.classList.add('on');
  refs.load.setAttribute('aria-hidden', 'false');
  refs.calcBtn.disabled = true;

  setTimeout(() => {
    refs.load.classList.remove('on');
    refs.load.setAttribute('aria-hidden', 'true');
    refs.calcBtn.disabled = false;
    showResult();
  }, 1800);
};

const showResult = () => {
  const { name1, name2, winner, order, data } = state;

  refs.res.style.setProperty('--glow', data.glow);
  refs.rEmoji.textContent = data.emoji;
  refs.rWord.textContent = data.label.toUpperCase();
  refs.rPair.textContent = `${name1} & ${name2}`;
  refs.rMsg.textContent = data.msg;
  refs.scEmoji.textContent = data.emoji;
  refs.scRes.textContent = data.label.toUpperCase();
  refs.scNames.textContent = `${name1} 🔥 ${name2}`;

  // Reset Wheel
  document.querySelectorAll('.wl').forEach(el => el.classList.remove('lit', 'out', 'win'));
  refs.wCap.textContent = '';

  const animEls = [refs.rEmoji, refs.rWord, refs.rPair, refs.rMsg, refs.sc, refs.actions, refs.again];
  animEls.forEach(el => {
    el.classList.remove('anim-pop', 'anim-slide', 'anim-fade');
    el.style.opacity = '0';
  });

  refs.res.classList.add('on');
  refs.res.setAttribute('aria-hidden', 'false');
  playSound('reveal');

  if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80]);

  // Animation sequence
  triggerAnimation(refs.rPair, 'anim-slide', 100);
  setTimeout(() => runWheelAnimation(order, winner), 700);
};

const triggerAnimation = (el, cls, delay) => {
  setTimeout(() => {
    el.style.opacity = '';
    void el.offsetWidth;
    el.classList.add(cls);
    el.addEventListener('animationend', () => { el.style.opacity = '1'; }, { once: true });
  }, delay);
};

const finalReveal = () => {
  triggerAnimation(refs.rEmoji, 'anim-pop', 80);
  triggerAnimation(refs.rWord, 'anim-slide', 220);
  triggerAnimation(refs.rMsg, 'anim-fade', 360);
  triggerAnimation(refs.sc, 'anim-slide', 500);
  triggerAnimation(refs.actions, 'anim-fade', 620);
  triggerAnimation(refs.again, 'anim-fade', 720);
};

const runWheelAnimation = (order, winner) => {
  const wheels = Array.from(document.querySelectorAll('.wl'));
  let remaining = ['F', 'L', 'A', 'M', 'E', 'S'];
  let globalPos = 0;

  const doStep = (stepIdx) => {
    if (stepIdx >= order.length) {
      wheels.forEach(l => l.classList.remove('lit', 'out'));
      const winEl = wheels.find(l => l.dataset.l === winner);
      if (winEl) winEl.classList.add('win');
      refs.wCap.textContent = `✨ ${DATA[winner].label.toUpperCase()} ✨`;
      setTimeout(finalReveal, 600);
      return;
    }

    const target = order[stepIdx];
    const n = state.count % remaining.length || remaining.length;
    let swept = 0;
    let pos = globalPos;

    const sweep = () => {
      wheels.forEach(l => { if (!l.classList.contains('out')) l.classList.remove('lit'); });
      const currentLetter = remaining[pos % remaining.length];
      const el = wheels.find(l => l.dataset.l === currentLetter);
      if (el) el.classList.add('lit');
      refs.wCap.textContent = `Counting… ${swept + 1}`;
      swept++;
      pos = (pos + 1) % remaining.length;

      if (swept < n) {
        const delay = swept <= 2 || swept === n - 1 ? 170 : 85;
        setTimeout(sweep, delay);
      } else {
        wheels.forEach(l => l.classList.remove('lit'));
        const targetEl = wheels.find(l => l.dataset.l === target);
        if (targetEl) targetEl.classList.add('lit');
        refs.wCap.textContent = `❌ ${target} eliminated`;

        setTimeout(() => {
          if (targetEl) { targetEl.classList.remove('lit'); targetEl.classList.add('out'); }
          const targetIdx = remaining.indexOf(target);
          remaining.splice(targetIdx, 1);
          globalPos = remaining.length > 0 ? targetIdx % remaining.length : 0;
          setTimeout(() => doStep(stepIdx + 1), 330);
        }, 480);
      }
    };
    sweep();
  };
  doStep(0);
};

/* ── Action Handlers ── */
refs.calcBtn.addEventListener('click', handleGo);

[refs.n1, refs.n2].forEach(el => {
  el.addEventListener('input', () => refs.err.textContent = '');
  el.addEventListener('keydown', e => { if (e.key === 'Enter') handleGo(); });
});

refs.again.addEventListener('click', () => {
  refs.res.classList.remove('on');
  refs.res.setAttribute('aria-hidden', 'true');
  refs.n1.value = '';
  refs.n2.value = '';
  refs.err.textContent = '';
  refs.n1.focus();
});

document.getElementById('btnWa').addEventListener('click', () => {
  const { name1, name2, data } = state;
  const text = `🔥 FLAMES says: ${name1} & ${name2} = ${data.label.toUpperCase()} ${data.emoji}\n\n"${data.msg}"`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
});

document.getElementById('btnCp').addEventListener('click', () => {
  const { name1, name2, data } = state;
  navigator.clipboard.writeText(`${name1} & ${name2} = ${data.label.toUpperCase()} ${data.emoji} — "${data.msg}"`)
    .then(() => showToast('📋 Copied!'))
    .catch(() => showToast('⚠️ Failed'));
});

document.getElementById('btnDl').addEventListener('click', async () => {
  const btn = document.getElementById('btnDl');
  btn.disabled = true;
  btn.textContent = '⏳…';
  try {
    if (!window.html2canvas) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
    const canvas = await html2canvas(document.getElementById('scIn'), {
      scale: 3,
      backgroundColor: null,
      logging: false,
      useCORS: true
    });
    const link = document.createElement('a');
    link.download = `flames-${state.name1}-${state.name2}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('💾 Image saved!');
  } catch (e) {
    showToast('⚠️ Could not save');
    console.error(e);
  }
  btn.disabled = false;
  btn.innerHTML = '📸 Save';
});

/* ── Helpers ── */
const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = reject;
  document.head.appendChild(s);
});

/* ── Sound System ── */
let audioCtx;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

const playTone = (freq, type, duration, delay, volume) => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) { }
};

const playSound = (type) => {
  if (type === 'start') {
    [220, 330, 440].forEach((f, i) => playTone(f, 'sine', 0.15, i * 0.07, 0.18));
  } else if (type === 'reveal') {
    [440, 554, 659, 880].forEach((f, i) => playTone(f, 'triangle', 0.22, i * 0.09, 0.2));
    setTimeout(() => [880, 1109, 1319].forEach((f, i) => playTone(f, 'sine', 0.18, i * 0.06, 0.17)), 500);
  }
};

document.addEventListener('click', () => { try { getAudioCtx(); } catch (e) { } }, { once: true });
