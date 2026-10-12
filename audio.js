/* ==========================================================
   KHADI.UZ sound lab
   Every sound here is synthesized live with the Web Audio API.
   No audio files, no copyright strikes. Just math and vibes.
   ========================================================== */
const Sfx = (() => {
  const VOLUME = 0.8;
  let ctx = null;
  let master = null;
  let verb = null;
  let noiseBuf = null;
  let muted = false;
  const curves = {};

  /* ---------- plumbing ---------- */
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : VOLUME;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 6;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function reverb(c) {
    if (verb) return verb;
    const len = Math.floor(c.sampleRate * 2.4);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    verb = c.createConvolver();
    verb.buffer = buf;
    verb.connect(master);
    return verb;
  }

  // route a node to the speakers, optionally with some reverb
  function send(c, node, wet = 0) {
    node.connect(master);
    if (wet > 0) {
      const g = c.createGain();
      g.gain.value = wet;
      node.connect(g);
      g.connect(reverb(c));
    }
  }

  function env(c, t, peak, attack, decay) {
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }

  function curve(amount) {
    if (curves[amount]) return curves[amount];
    const n = 1024;
    const k = new Float32Array(n);
    for (let i = 0; i < n; i++) k[i] = Math.tanh(((i / (n - 1)) * 2 - 1) * amount);
    return (curves[amount] = k);
  }

  function noise(c) {
    if (!noiseBuf) {
      const len = c.sampleRate * 2;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    return s;
  }

  function tone(c, { type = 'sine', freq, t, attack = 0.005, decay = 0.3, peak = 0.4, wet = 0 }) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    const g = env(c, t, peak, attack, decay);
    o.connect(g);
    send(c, g, wet);
    o.start(t);
    o.stop(t + attack + decay + 0.05);
    return o;
  }

  function burst(c, t, { type = 'highpass', freq = 2000, q = 0.7, peak = 0.4, decay = 0.1, wet = 0 } = {}) {
    const s = noise(c);
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = env(c, t, peak, 0.002, decay);
    s.connect(f);
    f.connect(g);
    send(c, g, wet);
    s.start(t, Math.random() * 1.5);
    s.stop(t + decay + 0.05);
  }

  // wrap every public sound so one weird browser can't crash the whole site
  const safe = fn => (...args) => {
    try { return fn(...args); } catch (e) { console.warn('[sfx]', e); return false; }
  };

  /* ---------- the sounds ---------- */
  function vineBoom() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    const shaper = c.createWaveShaper();
    shaper.curve = curve(5);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    const g = env(c, t, 0.9, 0.008, 1.5);
    shaper.connect(lp);
    lp.connect(g);
    send(c, g, 0.5);
    [1, 1.012, 0.988].forEach(m => {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(130 * m, t);
      o.frequency.exponentialRampToValueAtTime(42 * m, t + 0.7);
      o.connect(shaper);
      o.start(t);
      o.stop(t + 1.6);
    });
    burst(c, t, { type: 'lowpass', freq: 300, peak: 0.6, decay: 0.18, wet: 0.3 });
  }

  function metalPipe() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    const partials = [[523, 0.5, 2.2], [1310, 0.34, 1.6], [2093, 0.28, 1.3], [2960, 0.2, 1.0], [3905, 0.14, 0.8], [5280, 0.1, 0.55], [6870, 0.06, 0.4]];
    partials.forEach(([f, a, d]) => tone(c, { freq: f * (0.995 + Math.random() * 0.01), t, attack: 0.002, decay: d, peak: a, wet: 0.9 }));
    burst(c, t, { freq: 1800, peak: 0.7, decay: 0.06, wet: 0.6 });
    const t2 = t + 0.32; // the little bounce
    partials.slice(0, 5).forEach(([f, a, d]) => tone(c, { freq: f * 1.003, t: t2, attack: 0.002, decay: d * 0.6, peak: a * 0.35, wet: 0.9 }));
  }

  function airhorn() {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + 0.01;
    const shaper = c.createWaveShaper();
    shaper.curve = curve(3);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.6;
    const out = c.createGain();
    out.gain.value = 0.35;
    shaper.connect(bp);
    bp.connect(out);
    send(c, out, 0.25);
    [[0, 0.14], [0.2, 0.14], [0.4, 0.95]].forEach(([off, dur]) => {
      const t = t0 + off;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1, t + 0.02);
      g.gain.setValueAtTime(1, t + dur - 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(shaper);
      [466, 469, 463, 233].forEach(f => {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f * 0.97, t);
        o.frequency.linearRampToValueAtTime(f, t + 0.05);
        o.connect(g);
        o.start(t);
        o.stop(t + dur + 0.02);
      });
    });
  }

  function bruh() {
    if (speak('bruh', { pitch: 0.1, rate: 0.55 })) return;
    // no voices available: fake a deep "uhh"
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(95, t);
    o.frequency.linearRampToValueAtTime(78, t + 0.6);
    const g = env(c, t, 0.5, 0.03, 0.6);
    [650, 1100].forEach(f => {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = 5;
      o.connect(bp);
      bp.connect(g);
    });
    send(c, g, 0.2);
    o.start(t);
    o.stop(t + 0.7);
  }

  function tacoBell() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    const f = 233;
    [[1, 0.5, 2.0], [2.0, 0.25, 1.4], [2.76, 0.3, 1.1], [5.4, 0.12, 0.6], [8.93, 0.06, 0.35]]
      .forEach(([r, a, d]) => tone(c, { freq: f * r, t, attack: 0.003, decay: d, peak: a, wet: 0.5 }));
  }

  function sadTrombone() {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + 0.02;
    [[293.7, 0, 0.42], [277.2, 0.45, 0.42], [261.6, 0.9, 0.42], [246.9, 1.35, 1.3]].forEach(([f, off, dur], i) => {
      const t = t0 + off;
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(400, t);
      lp.frequency.linearRampToValueAtTime(1600, t + 0.12);
      lp.frequency.linearRampToValueAtTime(700, t + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.04);
      g.gain.setValueAtTime(0.35, t + dur - 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (i === 3) {
        const lfo = c.createOscillator();
        lfo.frequency.value = 6;
        const depth = c.createGain();
        depth.gain.value = 7;
        lfo.connect(depth);
        depth.connect(o.frequency);
        lfo.start(t + 0.25);
        lfo.stop(t + dur);
      }
      o.connect(lp);
      lp.connect(g);
      send(c, g, 0.2);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  }

  function hitmarker() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.005;
    tone(c, { type: 'square', freq: 2400, t, attack: 0.001, decay: 0.05, peak: 0.12 });
    burst(c, t, { freq: 3500, peak: 0.25, decay: 0.04 });
  }

  function buzz() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.005;
    tone(c, { type: 'square', freq: 110, t, attack: 0.005, decay: 0.25, peak: 0.18 });
    tone(c, { type: 'square', freq: 116, t, attack: 0.005, decay: 0.25, peak: 0.18 });
  }

  function coin(pitch = 1) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.005;
    tone(c, { type: 'square', freq: 988 * pitch, t, attack: 0.002, decay: 0.06, peak: 0.1 });
    tone(c, { type: 'square', freq: 1319 * pitch, t: t + 0.07, attack: 0.002, decay: 0.22, peak: 0.1 });
  }

  function crit() {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { type: 'triangle', freq: f, t: t + i * 0.06, attack: 0.003, decay: 0.3, peak: 0.25, wet: 0.3 }));
  }

  /* ---------- phonk loop (cowbell + 808, 130 bpm) ---------- */
  const STEP = 60 / 130 / 4;
  const BELL = [0, null, 0, null, 3, null, 0, 7, null, 5, null, 3, 2, null, 0, null,
                0, null, 0, null, 3, null, 0, 10, null, 8, null, 7, 5, null, 3, 2];
  const BASS = { 0: 0, 6: 0, 10: 3, 16: 0, 22: 0, 26: -2, 28: -2 };
  const CLAP = [4, 12, 20, 28];
  const phonk = { on: false, timer: 0, step: 0, next: 0 };

  function cowbell(c, t, semi) {
    const r = Math.pow(2, semi / 12);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400 * r;
    bp.Q.value = 1.2;
    const sh = c.createWaveShaper();
    sh.curve = curve(2.5);
    const g = env(c, t, 0.28, 0.002, 0.32);
    [540, 800].forEach(f => {
      const o = c.createOscillator();
      o.type = 'square';
      o.frequency.value = f * r;
      o.connect(bp);
      o.start(t);
      o.stop(t + 0.4);
    });
    bp.connect(sh);
    sh.connect(g);
    send(c, g, 0.2);
  }

  function bass808(c, t, semi) {
    const f = 49 * Math.pow(2, semi / 12);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(f * 3, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    const sh = c.createWaveShaper();
    sh.curve = curve(4);
    const g = env(c, t, 0.55, 0.004, 0.5);
    o.connect(sh);
    sh.connect(g);
    send(c, g);
    o.start(t);
    o.stop(t + 0.6);
  }

  function playStep(c, s, t) {
    if (BELL[s] !== null) cowbell(c, t, BELL[s]);
    if (s in BASS) bass808(c, t, BASS[s]);
    if (CLAP.includes(s)) burst(c, t, { type: 'bandpass', freq: 1600, q: 0.8, peak: 0.45, decay: 0.16, wet: 0.25 });
    if (s % 2 === 0 || s >= 28) burst(c, t, { freq: 8000, peak: s % 4 === 2 ? 0.18 : 0.1, decay: 0.035 });
  }

  function scheduler() {
    while (phonk.next < ctx.currentTime + 0.12) {
      playStep(ctx, phonk.step, phonk.next);
      phonk.next += STEP;
      phonk.step = (phonk.step + 1) % BELL.length;
    }
  }

  function togglePhonk() {
    const c = ac(); if (!c) return false;
    phonk.on = !phonk.on;
    if (phonk.on) {
      phonk.step = 0;
      phonk.next = c.currentTime + 0.05;
      phonk.timer = setInterval(scheduler, 25);
    } else {
      clearInterval(phonk.timer);
    }
    return phonk.on;
  }

  /* ---------- text to speech ---------- */
  let voices = [];
  function loadVoices() {
    try { voices = window.speechSynthesis.getVoices(); } catch (e) { voices = []; }
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // returns true if handled (or muted), false if this browser can't talk
  function speak(text, { lang = 'en-US', pitch = 1, rate = 1, queue = false } = {}) {
    if (!('speechSynthesis' in window)) return false;
    if (muted) return true;
    const synth = window.speechSynthesis;
    if (!queue) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.pitch = pitch;
    u.rate = rate;
    const base = lang.slice(0, 2);
    const v = voices.find(x => x.lang === lang) || voices.find(x => x.lang && x.lang.replace('_', '-').startsWith(base));
    if (v) u.voice = v;
    synth.speak(u);
    return true;
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.02);
    if (m && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  return {
    vineBoom: safe(vineBoom),
    metalPipe: safe(metalPipe),
    airhorn: safe(airhorn),
    bruh: safe(bruh),
    tacoBell: safe(tacoBell),
    sadTrombone: safe(sadTrombone),
    hitmarker: safe(hitmarker),
    buzz: safe(buzz),
    coin: safe(coin),
    crit: safe(crit),
    togglePhonk: safe(togglePhonk),
    speak: safe(speak),
    setMuted,
    isMuted: () => muted,
  };
})();
