/* ==========================================================
   KHADI.UZ sound lab
   The real meme sounds live in sounds/, the Italian brainrot
   names in sounds/names/ and sounds/words/. Only the little
   arcade blips (coin, rank up) are still synthesized live.
   ========================================================== */
const Sfx = (() => {
  const VOLUME = 0.8;
  let ctx = null;
  let master = null;
  let verb = null;
  let muted = false;

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

  // wrap every public sound so one weird browser can't crash the whole site
  const safe = fn => (...args) => {
    try { return fn(...args); } catch (e) { console.warn('[sfx]', e); return false; }
  };

  /* ---------- recorded clips ---------- */
  const url = name => `sounds/${name}.mp3`;
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const loads = {};
  const groups = {};      // clips that cut each other off (voices), so the newest one wins
  const tags = new Set(); // <audio> elements in use, so mute can silence them

  // decoded clip, or null when the page can't fetch its own files (opened straight from disk)
  function load(name) {
    if (!loads[name]) {
      const c = ac();
      loads[name] = !c || location.protocol === 'file:'
        ? Promise.resolve(null)
        : fetch(url(name))
          .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
          .then(data => c.decodeAudioData(data))
          .catch(e => { console.warn('[sfx] falling back to <audio> for', name, e); return null; });
    }
    return loads[name];
  }

  function stopGroup(group) {
    (groups[group] || []).forEach(n => { try { n.stop ? n.stop() : n.pause(); } catch (e) { /* already done */ } });
    delete groups[group];
  }

  function viaWebAudio(c, bufs, gain, gap) {
    const out = c.createGain();
    out.gain.value = gain;
    out.connect(master);
    let t = c.currentTime + 0.01;
    return bufs.map(buf => {
      const s = c.createBufferSource();
      s.buffer = buf;
      s.connect(out);
      s.start(t);
      t += buf.duration + gap;
      return s;
    });
  }

  function viaTags(names, gain) {
    const list = names.map(n => {
      const a = new Audio(url(n));
      a.volume = Math.min(1, VOLUME * gain);
      return a;
    });
    list.forEach((a, i) => {
      tags.add(a);
      a.onended = () => {
        tags.delete(a);
        if (list[i + 1] && !muted) list[i + 1].play().catch(() => {});
      };
    });
    list[0].play().catch(() => {});
    return list;
  }

  // play one clip, or several back to back
  function play(names, { gain = 1, gap = 0.05, group = '' } = {}) {
    if (muted) return;
    names = [].concat(names);
    ac(); // unlock audio while we're still inside the click
    Promise.all(names.map(load)).then(bufs => {
      if (muted) return;
      if (group) stopGroup(group);
      if (group === 'voice' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      const nodes = ctx && bufs.every(Boolean) ? viaWebAudio(ctx, bufs, gain, gap) : viaTags(names, gain);
      if (group) groups[group] = nodes;
    }).catch(e => console.warn('[sfx]', e));
  }

  // grab the common clips on the first tap so they fire instantly afterwards
  const PRELOAD = ['vine-boom', 'metal-pipe', 'airhorn', 'bruh', 'taco-bell', 'sad-trombone', 'hitmarker', 'buzzer', 'six-seven', 'skibidi', 'meow'];
  const warmUp = () => { if (ac()) PRELOAD.forEach(load); };
  ['pointerdown', 'keydown'].forEach(type => window.addEventListener(type, warmUp, { once: true, capture: true }));

  /* ---------- phonk loop (CC0 beat, 150 bpm) ---------- */
  const phonk = { on: false };

  function togglePhonk() {
    phonk.on = !phonk.on;
    if (!phonk.on) {
      stopGroup('phonk');
      return false;
    }
    ac();
    load('phonk').then(buf => {
      if (!phonk.on) return;
      if (ctx && buf) {
        const s = ctx.createBufferSource();
        s.buffer = buf;
        s.loop = true;
        s.connect(master);
        s.start();
        groups.phonk = [s];
      } else {
        const a = new Audio(url('phonk'));
        a.loop = true;
        a.volume = VOLUME;
        groups.phonk = [a];
        if (!muted) a.play().catch(() => {});
      }
    });
    return true;
  }

  /* ---------- synthesized arcade blips ---------- */
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

  /* ---------- text to speech (only for text we can't record ahead, like the translator) ---------- */
  let voices = [];
  function loadVoices() {
    try { voices = window.speechSynthesis.getVoices(); } catch (e) { voices = []; }
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // novelty voices and old engines that sound like a 2005 robot
  const ROBOTIC = /compact|eloquence|espeak|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy/i;
  function voiceScore(v, lang) {
    let s = 0;
    if (/natural|neural/i.test(v.name)) s += 8;        // Edge's online voices
    if (/premium|enhanced|siri/i.test(v.name)) s += 6; // Apple's downloadable voices
    if (/google/i.test(v.name)) s += 4;                // Chrome's voices
    if (v.localService === false) s += 1;
    if (v.lang.replace('_', '-') === lang) s += 2;
    if (ROBOTIC.test(v.name)) s -= 10;
    return s;
  }
  function bestVoice(lang) {
    const base = lang.slice(0, 2);
    const fits = voices.filter(v => v.lang && v.lang.replace('_', '-').startsWith(base));
    return fits.sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang))[0];
  }

  // returns true if handled (or muted), false if this browser can't talk
  function speak(text, { lang = 'en-US', pitch = 1, rate = 1, queue = false } = {}) {
    if (!('speechSynthesis' in window)) return false;
    if (muted) return true;
    const synth = window.speechSynthesis;
    if (!queue) {
      synth.cancel();
      stopGroup('voice');
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.pitch = pitch;
    u.rate = rate;
    const v = bestVoice(lang);
    if (v) u.voice = v;
    synth.speak(u);
    return true;
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.02);
    if (m) {
      tags.forEach(a => a.pause());
      tags.clear();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    // the <audio> fallback for the phonk loop isn't routed through master, so pause it by hand
    (groups.phonk || []).forEach(n => { if (n.pause) m ? n.pause() : n.play().catch(() => {}); });
  }

  return {
    vineBoom: safe(() => play('vine-boom')),
    metalPipe: safe(() => play('metal-pipe')),
    airhorn: safe(() => play('airhorn')),
    bruh: safe(() => play('bruh')),
    tacoBell: safe(() => play('taco-bell')),
    sadTrombone: safe(() => play('sad-trombone')),
    hitmarker: safe(() => play('hitmarker', { gain: 0.7 })),
    buzz: safe(() => play('buzzer', { gain: 0.6 })),
    sixSeven: safe(() => play('six-seven', { group: 'six-seven' })),
    skibidi: safe(() => play('skibidi', { group: 'skibidi' })),
    meow: safe(() => play('meow')),
    // a creature card's full name, recorded in one take
    creature: safe(name => play('names/' + slug(name), { group: 'voice' })),
    // a fusion lab name, stitched together word by word
    words: safe(list => play(list.map(w => 'words/' + slug(w)), { group: 'voice' })),
    coin: safe(coin),
    crit: safe(crit),
    togglePhonk: safe(togglePhonk),
    speak: safe(speak),
    setMuted,
    isMuted: () => muted,
  };
})();
