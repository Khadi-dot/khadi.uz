/* ==========================================================
   KHADI.UZ — the brainrot engine
   ========================================================== */
(() => {
  'use strict';

  /* ================= helpers ================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const main = $('#main');
  const fx = $('#fx');

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('khadi.' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('khadi.' + key, JSON.stringify(value)); } catch (e) { /* private mode, whatever */ }
    },
  };

  // FNV-1a hash + mulberry32, so "random" results are the same for the same input
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seeded(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  // where a click happened (keyboard "clicks" have no position, so use the element's center)
  const pointFrom = (e, el) => (e && e.detail > 0 ? [e.clientX, e.clientY] : centerOf(el));

  /* ================= visual effects ================= */
  function spawnFx(cls, text, x, y, vars = {}) {
    const el = document.createElement('div');
    el.className = cls;
    if (text) el.textContent = text;
    if (x != null) {
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 6000);
    fx.appendChild(el);
    return el;
  }

  const pop = (text, x, y, cls = '') => spawnFx('pop ' + cls, text, x, y, { '--dx': rand(-50, 50) + 'px' });
  const flash = color => spawnFx('flash', '', null, null, { '--flash': color });
  const mega = (text, cls = '') => spawnFx('mega ' + cls, text);

  function rain(emojis, count = 30) {
    const n = reduceMotion ? Math.min(6, count) : count;
    for (let i = 0; i < n; i++) {
      const el = spawnFx('drop', pick(emojis), null, null, { '--spin': rand(-540, 540) + 'deg' });
      el.style.left = rand(-2, 96) + 'vw';
      el.style.fontSize = rand(26, 66) + 'px';
      el.style.animationDuration = rand(1.6, 3.2) + 's';
      el.style.animationDelay = rand(0, 0.9) + 's';
    }
  }

  function restartClass(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function shake() {
    if (!reduceMotion) restartClass(main, 'shake');
  }
  main.addEventListener('animationend', e => {
    if (e.target === main) main.classList.remove('shake');
  });

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function say(text, opts) {
    if (!Sfx.speak(text, opts)) toast("your browser can't talk 😭 try Chrome, Edge or Safari");
  }

  /* ================= breaking news ticker ================= */
  const HEADLINES = [
    'local man loses 10,000 aura after tripping at Chorsu bazaar',
    'scientists confirm Ohio is 67% skibidi, 33% unexplained',
    'Tung Tung Tung Sahur spotted on the Tashkent metro, refuses to pay fare',
    'fanum taxes entire wedding plov, guests left with only bread',
    'student answers every math question with "67", somehow gets 3 right',
    'Duolingo owl seen near your house. you missed your lesson.',
    'Bombardiro Crocodilo denied landing in Tashkent (no passport)',
    'Damas reaches 120 km/h on the ring road, achieves sigma status',
    'man mews for 67 days straight, jawline now classified as a weapon',
    'experts warn: touching grass may cause sudden loss of brainrot',
    'Ballerina Cappuccina opens coffee shop. every drink is a cappuccino.',
    'khadi.uz declared most sigma domain in Central Asia (source: trust me)',
  ];
  const ticker = $('#ticker');
  [false, true].forEach(isClone => {
    HEADLINES.forEach(text => {
      const s = document.createElement('span');
      s.textContent = text;
      if (isClone) s.setAttribute('aria-hidden', 'true');
      ticker.appendChild(s);
    });
  });

  /* ================= hero word rotator ================= */
  const WORDS = ['sigma', 'skibidi', 'ohio', 'bussin', 'unhinged', 'goated', 'cooked', 'delulu', '67'];
  const rotator = $('#rotator');
  let wordIdx = 0;
  setInterval(() => {
    wordIdx = (wordIdx + 1) % WORDS.length;
    rotator.textContent = WORDS[wordIdx];
    restartClass(rotator, 'flip');
  }, 1700);

  /* ================= aura economy ================= */
  const RANKS = [
    [-Infinity, 'NEGATIVE AURA 💀'],
    [0, 'NPC 🤖'],
    [500, 'ROOKIE 🐣'],
    [2500, 'LOWKEY SIGMA 😏'],
    [10000, 'SIGMA 🗿'],
    [50000, 'GIGACHAD 💪'],
    [250000, 'SKIBIDI LORD 🚽'],
    [1000000, 'OHIO FINAL BOSS 🌽'],
    [6767676, 'INFINITE AURA ♾️'],
  ];
  const rankIndex = a => RANKS.reduce((idx, [min], i) => (a >= min ? i : idx), 0);

  let aura = Number(store.get('aura', 0)) || 0;
  let rankIdx = rankIndex(aura);
  let saveTimer = 0;
  const auraPill = $('#aura-pill');

  function renderAura() {
    const i = rankIndex(aura);
    $('#aura-val').textContent = fmt(aura);
    $('#hero-aura').textContent = fmt(aura);
    $('#aura-rank').textContent = RANKS[i][1];
    $('#hero-rank').textContent = RANKS[i][1];
    if (i > rankIdx) {
      toast(`RANK UP → ${RANKS[i][1]}`);
      Sfx.crit();
    } else if (i < rankIdx) {
      toast(`rank down → ${RANKS[i][1]} 😭`);
    }
    rankIdx = i;
  }

  function addAura(n, x, y) {
    aura += n;
    renderAura();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set('aura', aura), 300);
    if (x != null) pop(`${n >= 0 ? '+' : ''}${fmt(n)} aura`, x, y, n >= 0 ? '' : 'bad');
    restartClass(auraPill, 'bump');
  }
  renderAura();

  /* ================= farm aura (the moai) ================= */
  const LOSSES = [
    'you tripped in front of your crush. −aura',
    'you said "you too" when the waiter said "enjoy your meal"',
    'your mom called your full name in public',
    'you laughed at your own joke. nobody else did.',
    'you waved back at someone who was waving at the person behind you',
    'you pushed a door that said PULL',
    'your phone rang in class. the ringtone was crazy frog.',
    'you got fanum taxed. half your somsa is gone.',
  ];
  const farm = $('#farm');
  let farmClicks = 0;
  farm.addEventListener('click', e => {
    farmClicks++;
    const [x, y] = pointFrom(e, farm);
    const roll = Math.random();
    if (farmClicks % 67 === 0) {
      addAura(6767, x, y);
      sixSeven();
    } else if (roll < 0.02) {
      addAura(randInt(5000, 15000), x, y);
      Sfx.vineBoom();
      mega('CRITICAL AURA', 'crit');
      flash('rgba(255, 225, 77, .45)');
      shake();
    } else if (roll < 0.07) {
      addAura(-randInt(67, 999), x, y);
      Sfx.buzz();
      toast(pick(LOSSES));
    } else {
      addAura(randInt(1, 67), x, y);
      Sfx.coin(1 + Math.min(farmClicks, 80) / 160);
    }
    restartClass(farm, 'squish');
  });

  /* ================= big events ================= */
  let lastSixSeven = 0;
  function sixSeven() {
    const now = Date.now();
    if (now - lastSixSeven < 900) return;
    lastSixSeven = now;
    Sfx.sixSeven();
    Sfx.vineBoom();
    mega('6 7', 'six7');
    rain(['6️⃣', '7️⃣', '🤲'], 40);
    if (!reduceMotion) {
      restartClass(body, 'is67');
      setTimeout(() => body.classList.remove('is67'), 1800);
    }
  }

  function toggleOhio() {
    const on = body.classList.toggle('ohio');
    $('#btn-ohio').setAttribute('aria-pressed', String(on));
    if (on) {
      Sfx.metalPipe();
      toast('welcome to ohio. nothing makes sense here. 🌽');
    } else {
      toast('you escaped ohio. for now.');
    }
  }

  let mlgTimer = 0;
  function mlg() {
    Sfx.airhorn();
    mega('MLG MODE', 'mlg');
    rain(['🕶️', '🔥', '💯', '🎯', '🥤', '🌮'], 45);
    body.classList.add('mlg');
    toast('MLG MODE: every click is a hitmarker now (15s)');
    clearTimeout(mlgTimer);
    mlgTimer = setTimeout(() => body.classList.remove('mlg'), 15000);
  }

  /* ================= header buttons ================= */
  const muteBtn = $('#btn-mute');
  function setMuted(m) {
    Sfx.setMuted(m);
    muteBtn.setAttribute('aria-pressed', String(m));
    $('#mute-icon').textContent = m ? '🔇' : '🔊';
    store.set('muted', m);
  }
  setMuted(Boolean(store.get('muted', false)));
  muteBtn.addEventListener('click', () => {
    setMuted(!Sfx.isMuted());
    toast(Sfx.isMuted() ? 'muted. coward. 🤫' : 'sound on. let him cook 🔊');
  });

  $('#btn-67').addEventListener('click', sixSeven);
  $('#btn-ohio').addEventListener('click', toggleOhio);

  let subwayReady = false;
  function setSubway(on) {
    body.classList.toggle('split', on);
    $('#btn-subway').setAttribute('aria-pressed', String(on));
    if (on) {
      if (!subwayReady) {
        Subway.init($('#subway-canvas'), { coin: () => addAura(1) });
        subwayReady = true;
      }
      Subway.start();
      toast('attention span support activated 🧠');
    } else {
      Subway.stop();
    }
  }
  $('#btn-subway').addEventListener('click', () => setSubway(!body.classList.contains('split')));
  $('#subway-close').addEventListener('click', () => setSubway(false));

  /* ================= 01 soundboard ================= */
  const PADS = [
    { emoji: '💥', label: 'VINE BOOM', color: 'var(--yellow)', play: () => { Sfx.vineBoom(); shake(); } },
    { emoji: '🔩', label: 'METAL PIPE', color: 'var(--cyan)', play: () => Sfx.metalPipe() },
    { emoji: '📯', label: 'MLG AIRHORN', color: 'var(--orange)', play: () => { Sfx.airhorn(); rain(['📯', '🔥', '💯', '🎯'], 14); } },
    { emoji: '🗿', label: 'BRUH', color: 'var(--purple)', play: () => Sfx.bruh() },
    { emoji: '🔔', label: 'TACO BELL', color: 'var(--pink)', play: () => Sfx.tacoBell() },
    { emoji: '🎺', label: 'SAD TROMBONE', color: 'var(--blue)', play: () => Sfx.sadTrombone() },
    { emoji: '🐄', label: 'PHONK LOOP', color: 'var(--lime)', toggle: true, play: () => Sfx.togglePhonk() },
    { emoji: '🚽', label: 'SKIBIDI', color: 'var(--cyan)', play: () => Sfx.skibidi() },
    { emoji: '🤲', label: 'SIX SEVEN', color: 'var(--yellow)', play: () => sixSeven() },
    { emoji: '❌', label: 'HITMARKER', color: 'var(--red)', play: () => { Sfx.hitmarker(); flash('rgba(255, 255, 255, .2)'); } },
  ];
  const padsEl = $('#pads');
  PADS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pad';
    b.style.setProperty('--pad', p.color);
    b.innerHTML = `<span class="pad-emoji" aria-hidden="true">${p.emoji}</span><span>${p.label}</span>`;
    if (p.toggle) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', e => {
      const result = p.play();
      if (p.toggle) {
        const on = Boolean(result);
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
        toast(on ? 'phonk activated. drift mode on 🏎️' : 'phonk off. the cows can rest.');
      }
      restartClass(b, 'hit');
      const [x, y] = pointFrom(e, b);
      pop(p.emoji, x, y - 20, 'big');
    });
    padsEl.appendChild(b);
  });

  /* ================= 02 italian brainrot ================= */
  const ITALIAN = KHADI_DATA.italian;
  const CARD_COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--lime)', 'var(--orange)', 'var(--purple)'];
  const cardsEl = $('#cards');
  ITALIAN.forEach((c, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'card';
    el.style.setProperty('--card', CARD_COLORS[i % CARD_COLORS.length]);
    el.setAttribute('aria-label', `${c.name}. ${c.lore} Tap to hear the name.`);
    el.innerHTML = `
      <span class="card-art" aria-hidden="true"><span>${c.art[0]}</span><span>${c.art[1]}</span></span>
      <span class="card-name">${c.name}</span>
      <span class="card-lore">${c.lore}</span>
      <span class="card-meta"><span>AURA ${fmt(c.aura)}</span><span class="speak">🔊 tap to summon</span></span>`;
    el.addEventListener('click', e => {
      Sfx.creature(c.name);
      restartClass(el, 'summoned');
      const [x, y] = pointFrom(e, el);
      pop('🗣️ ' + c.name.split(' ')[0].toUpperCase(), x, y);
    });
    cardsEl.appendChild(el);
  });

  // ---- fusion lab ----
  const FUSE = {
    chants: ['Tralala', 'Tung Tung', 'Brr Brr', 'Bim Bam', 'Patapim', 'Lirili', 'Zibra Zubra', 'Bombombo', 'Trulimero', 'Ding Dong', 'Pataplov', 'Skibidini'],
    creatures: [['Crocodilo', '🐊'], ['Gattino', '🐱'], ['Elefantino', '🐘'], ['Squalino', '🦈'], ['Giraffina', '🦒'], ['Pinguino', '🐧'], ['Capibarino', '🦫'], ['Scimmietta', '🐒'], ['Polpetto', '🐙'], ['Ranocchio', '🐸'], ['Pollo Pollini', '🐔'], ['Mucchina', '🐄'], ['Camelo', '🐪'], ['Gusino', '🪿']],
    objects: [['Bombardiro', '✈️'], ['Frigorifero', '🧊'], ['Cappuccino', '☕'], ['Spaghettini', '🍝'], ['Pizzarino', '🍕'], ['Ciabattino', '🩴'], ['Telefonino', '📱'], ['Toilettini', '🚽'], ['Somsalino', '🥟'], ['Plovino', '🍚'], ['Damasino', '🚐'], ['Cobaltino', '🚗'], ['Melonetti', '🍉'], ['Bananini', '🍌']],
    places: ['Ohio', 'a Napoli pizzeria', 'the Tashkent metro', 'Chorsu bazaar', 'the backrooms', 'a Samarkand rooftop', 'your group chat', 'a Damas going 120 km/h', 'the Duolingo owl’s basement'],
    powers: ['Steals your fries every lunch (fanum tax).', 'Mews so hard that mirrors crack.', 'Turns every number it sees into 67.', 'Plays phonk at 3 AM. Every night.', 'Gains aura by doing absolutely nothing.', 'Only speaks in Italian text-to-speech.', 'Can mog the sun.', 'Teleports every time you blink.', 'Eats plov with a fork and survives.'],
    weaknesses: ['Ohio', 'touching grass', 'the Duolingo owl', 'a 4% phone battery', 'mom saying “we have food at home”', 'reading', 'sunlight', 'homework', 'unseasoned chicken'],
  };
  // every word here has its own recording in sounds/words/
  let lastFused = [];
  function fuse() {
    const [cName, cEmoji] = pick(FUSE.creatures);
    const [oName, oEmoji] = pick(FUSE.objects);
    const chant = pick(FUSE.chants);
    const patterns = [
      [oName, cName],
      [chant, cName],
      [cName, oName],
      [chant, chant, oName],
    ];
    lastFused = pick(patterns);
    $('#fuse-art').textContent = cEmoji + oEmoji;
    $('#fuse-name').textContent = lastFused.join(' ');
    $('#fuse-lore').textContent = `Born in ${pick(FUSE.places)}. ${pick(FUSE.powers)} Only weakness: ${pick(FUSE.weaknesses)}. Aura: ${fmt(randInt(-999, 99999))}.`;
    $('#fuse-speak').hidden = false;
    restartClass($('#fuse-result'), 'new');
    Sfx.words(lastFused);
  }
  $('#fuse-btn').addEventListener('click', fuse);
  $('#fuse-speak').addEventListener('click', () => Sfx.words(lastFused));

  /* ================= 03 aura scanner ================= */
  const VERDICTS = [
    ['aura in debt. the bank of Ohio is calling.', 'negative aura detected. even the NPCs are avoiding this one.'],
    ['certified NPC. says "it is what it is" unironically.', 'background character energy. respawns every morning at 7.'],
    ['potential detected. touch grass, then come back.', 'baby sigma. still learning how to mew.'],
    ['lowkey sigma, highkey trying too hard.', 'decent aura. would let them hold the aux cord.'],
    ['sigma grindset confirmed. wakes up at 4 AM to mew.', 'does not text back. on purpose. respect.'],
    ['gigachad energy. mirrors say thank you.', 'walks into a room and the music switches to phonk.'],
    ['skibidi lord. the toilets bow when this person walks by.', 'aura so strong the wifi gets faster.'],
    ['final boss of Ohio. even the corn is scared.'],
    ['infinite aura. this is not a person, this is a legend.'],
  ];

  function scanStats(name) {
    const key = name.toLowerCase().replace(/\s+/g, ' ').trim();
    const r = seeded(hash(key));
    const s = {
      aura: Math.round(Math.pow(r(), 3) * 320000 - 4000),
      rizz: Math.round(r() * 100),
      sigma: Math.round(r() * 100),
      cooked: Math.round(r() * 100),
      npc: Math.round(r() * 100),
      ohio: 1 + Math.floor(r() * 10),
      mewing: Math.floor(r() * 420),
      roll: r(),
      special: '',
    };
    if (/^(khadi|hadi|xadi|хади)/.test(key)) {
      Object.assign(s, { aura: 999999999, rizz: 100, sigma: 100, cooked: 0, npc: 0, ohio: 0, mewing: 6767, special: 'OWNER OF KHADI.UZ. the scanner overheated trying to measure this aura. respect the domain.' });
    } else if (/^(67|6 7|6-7|six seven)$/.test(key)) {
      Object.assign(s, { aura: 676767, rizz: 67, sigma: 67, cooked: 67, npc: 67, ohio: 6.7, mewing: 67, special: 'you are not a person. you are a meme. 🤲' });
    }
    return s;
  }

  const scanResult = $('#scan-result');
  function renderScan(name, s) {
    const idx = rankIndex(s.aura);
    const pool = VERDICTS[idx];
    const verdict = s.special || pool[Math.floor(s.roll * pool.length)];
    const sign = s.aura >= 0 ? '+' : '';
    const bar = (label, v, color) =>
      `<div class="stat"><span>${label}</span><div class="bar"><i style="--v:${v}%;--c:${color}"></i></div><b>${v}%</b></div>`;
    scanResult.classList.remove('go');
    scanResult.innerHTML = `
      <p class="scan-name">${esc(name)}</p>
      <p class="scan-aura">${sign}${fmt(s.aura)} <small>aura</small></p>
      <p class="scan-rank">${RANKS[idx][1]}</p>
      ${bar('RIZZ', s.rizz, 'var(--pink)')}
      ${bar('SIGMA', s.sigma, 'var(--lime)')}
      ${bar('COOKED', s.cooked, 'var(--orange)')}
      ${bar('NPC CHANCE', s.npc, 'var(--cyan)')}
      <div class="scan-facts">
        <span>🌽 ohio level <b>${s.ohio}/10</b></span>
        <span>🤫 mewing streak <b>${fmt(s.mewing)} days</b></span>
      </div>
      <p class="scan-verdict">“${esc(verdict)}”</p>
      <button class="btn btn-small" type="button" id="scan-share">📤 SHARE RESULT</button>`;
    requestAnimationFrame(() => requestAnimationFrame(() => scanResult.classList.add('go')));
    $('#scan-share').addEventListener('click', () =>
      share(`${name}'s aura on khadi.uz: ${sign}${fmt(s.aura)} (${RANKS[idx][1]}) 🗿 scan yours → https://khadi.uz/#scan`));
    return idx;
  }

  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg);
    } catch (e) {
      window.prompt('copy this:', text);
    }
  }

  async function share(text) {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    copyText(text, 'copied. go flex in the group chat 📤');
  }

  const SCAN_STEPS = ['measuring aura…', 'checking mewing streak…', 'counting rizz…', 'consulting Ohio…', 'asking Tung Tung Tung Sahur…'];
  const scanBtn = $('#scan-btn');
  $('#scan-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#scan-name');
    const name = input.value.trim();
    if (!name) {
      toast('type a name first gang');
      input.focus();
      return;
    }
    const loading = $('#scan-loading');
    const status = $('#scan-status');
    scanBtn.disabled = true;
    $('#scan-idle').hidden = true;
    scanResult.hidden = true;
    loading.hidden = false;
    restartClass(loading, 'run');
    let step = 0;
    status.textContent = SCAN_STEPS[0];
    const stepTimer = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length) status.textContent = SCAN_STEPS[step];
    }, 280);

    setTimeout(() => {
      clearInterval(stepTimer);
      loading.hidden = true;
      scanResult.hidden = false;
      scanBtn.disabled = false;
      const idx = renderScan(name, scanStats(name));
      if (idx >= 6) {
        Sfx.airhorn();
        rain(['🗿', '🔥', '👑'], 30);
      } else if (idx <= 1) {
        Sfx.sadTrombone();
      } else {
        Sfx.vineBoom();
      }
    }, 1500);
  });

  /* ================= 04 skibidi smash ================= */
  const GAME_LEN = 30;
  const TYPES = {
    skibidi: { faces: ['😮', '🤪', '😜', '😝', '🫨'], pts: 1 },
    sigma: { faces: ['🗿'], pts: 5 },
    fanum: { faces: ['🍔'], pts: -5 },
  };
  const G = { on: false, score: 0, left: GAME_LEN, best: Number(store.get('best', 0)) || 0, tick: 0, spawnTimer: 0 };
  const board = $('#board');
  const gameOver = $('#game-over');
  const startBtn = $('#g-start');
  const holes = [];

  for (let i = 0; i < 9; i++) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'hole';
    el.setAttribute('aria-label', `toilet ${i + 1}`);
    el.innerHTML = '<span class="head"></span><span class="bowl" aria-hidden="true">🚽</span>';
    const hole = { el, head: el.firstElementChild, type: null, timer: 0 };
    holes.push(hole);
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      whack(hole);
    });
    el.addEventListener('click', e => {
      if (e.detail === 0) whack(hole); // keyboard players
    });
    board.insertBefore(el, gameOver);
  }

  function resetHole(h) {
    clearTimeout(h.timer);
    h.type = null;
    h.el.classList.remove('up', 'hit', 'is-skibidi', 'is-sigma', 'is-fanum');
  }

  function renderHud() {
    $('#g-score').textContent = G.score;
    $('#g-time').textContent = Math.max(0, G.left).toFixed(1);
    $('#g-best').textContent = G.best;
  }

  function popUp() {
    const free = holes.filter(h => !h.type && !h.el.classList.contains('hit'));
    if (!free.length) return;
    const h = pick(free);
    const roll = Math.random();
    const type = roll < 0.1 ? 'sigma' : roll < 0.27 ? 'fanum' : 'skibidi';
    const progress = 1 - G.left / GAME_LEN;
    resetHole(h);
    h.type = type;
    h.head.textContent = pick(TYPES[type].faces);
    h.el.classList.add('up', 'is-' + type);
    h.timer = setTimeout(() => resetHole(h), (type === 'sigma' ? 750 : 1150) - progress * 380);
  }

  function spawnLoop() {
    if (!G.on) return;
    popUp();
    const progress = 1 - G.left / GAME_LEN;
    G.spawnTimer = setTimeout(spawnLoop, 720 - progress * 360);
  }

  function whack(h) {
    if (!G.on || !h.type) return;
    const { pts } = TYPES[h.type];
    const type = h.type;
    clearTimeout(h.timer);
    h.type = null;
    h.el.classList.add('hit');
    setTimeout(() => { if (!h.type) resetHole(h); }, 200);

    G.score = Math.max(0, G.score + pts);
    renderHud();
    const [x, y] = centerOf(h.el);
    if (type === 'fanum') {
      pop('−5 FANUM TAX', x, y, 'bad');
      Sfx.buzz();
      shake();
    } else if (type === 'sigma') {
      pop('+5 SIGMA', x, y, 'big');
      Sfx.coin(1.5);
    } else {
      pop('+1', x, y);
      Sfx.hitmarker();
    }
  }

  function startGame() {
    if (G.on) return;
    G.on = true;
    G.score = 0;
    G.left = GAME_LEN;
    gameOver.hidden = true;
    startBtn.disabled = true;
    startBtn.textContent = 'SMASHING…';
    renderHud();
    G.tick = setInterval(() => {
      G.left -= 0.1;
      if (G.left <= 0) endGame();
      renderHud();
    }, 100);
    spawnLoop();
    if (window.matchMedia('(max-width: 900px)').matches) board.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function endGame() {
    G.on = false;
    G.left = 0;
    clearInterval(G.tick);
    clearTimeout(G.spawnTimer);
    holes.forEach(resetHole);

    const newBest = G.score > G.best;
    if (newBest) {
      G.best = G.score;
      store.set('best', G.best);
    }
    const s = G.score;
    const verdict =
      s < 10 ? "you got skibidi'd. the toilets are laughing." :
      s < 25 ? 'mid. the toilets barely noticed you.' :
      s < 45 ? 'solid. lowkey cameraman material.' :
      s < 70 ? 'cameraman energy. the toilets fear you.' :
      'TITAN CAMERAMAN STATUS. this is unreal.';
    gameOver.innerHTML = `
      <p class="go-title">GAME OVER</p>
      <p class="go-score">${s}</p>
      <p class="go-verdict">${verdict}</p>
      ${newBest && s > 0 ? '<p class="go-best">🏆 NEW PERSONAL BEST</p>' : ''}`;
    gameOver.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = 'PLAY AGAIN';
    renderHud();

    if (newBest && s > 0) Sfx.airhorn();
    else if (s < 10) Sfx.sadTrombone();
    else Sfx.vineBoom();
    if (s > 0) {
      const [x, y] = centerOf(board);
      addAura(s * 10, x, y);
    }
  }

  startBtn.addEventListener('click', startGame);
  renderHud();

  /* ================= 05 translator ================= */
  const SLANG = [
    [/\b(i agree|exactly|that's true|so true)\b/gi, 'real'],
    [/\b(oh my god|omg|wow)\b/gi, 'sheeeesh'],
    [/\b(for real|honestly|seriously|truly)\b/gi, 'no cap'],
    [/\b(hello|hi|hey|greetings)\b/gi, 'wsg'],
    [/\b(goodbye|bye|see you later|see you)\b/gi, 'im out, stay sigma'],
    [/\b(thank you|thanks)\b/gi, 'W'],
    [/\b(very|really|extremely|super)\b/gi, 'lowkey'],
    [/\b(good|great|delicious|tasty)\b/gi, 'bussin'],
    [/\b(amazing|awesome|excellent|perfect|the best)\b/gi, 'goated'],
    [/\b(cool|impressive)\b/gi, 'sigma'],
    [/\b(bad|boring|mediocre|average)\b/gi, 'mid'],
    [/\b(weird|strange|odd|cursed)\b/gi, 'ohio'],
    [/\b(friends|guys|everyone|people)\b/gi, 'gang'],
    [/\b(friend|bro|buddy|dude)\b/gi, 'twin'],
    [/\b(lie|lies|lying)\b/gi, 'cap'],
    [/\b(tired|exhausted|doomed|in trouble)\b/gi, 'cooked'],
    [/\b(angry|furious|mad)\b/gi, 'crashing out'],
    [/\b(handsome|beautiful|attractive|charming|pretty)\b/gi, 'rizzed up'],
    [/\b(confident)\b/gi, 'full of aura'],
    [/\b(teacher|boss|mom|mother|dad|father)\b/gi, 'final boss'],
    [/\b(parents)\b/gi, 'final bosses'],
    [/\b(strict|serious)\b/gi, 'built different'],
    [/\b(school|work|office|class)\b/gi, 'the ohio dungeon'],
    [/\b(stole|steal|took)\b/gi, 'fanum taxed'],
    [/\b(embarrassing|cringe|awkward)\b/gi, 'minus 1000 aura'],
    [/\b(crazy|insane|wild)\b/gi, 'unhinged'],
    [/\b(i understand|understood|got it|okay|ok)\b/gi, 'say less'],
    [/\b(delusional)\b/gi, 'delulu'],
    [/\b(excited|happy|thrilled)\b/gi, 'hyped fr'],
    [/\b(sad|upset|depressed)\b/gi, 'down bad'],
    [/\b(funny|hilarious)\b/gi, 'sending me 💀'],
    [/\b(ugly)\b/gi, 'chopped'],
    [/\b(old man|uncle|grandpa)\b/gi, 'unc'],
    [/\b(failed|lost|lose|fail)\b/gi, 'took an L'],
    [/\b(won|win|succeeded)\b/gi, 'got the W'],
    [/\b(movie|film)\b/gi, 'skibidi episode'],
    [/\b(phone)\b/gi, 'doomscroll device'],
    [/\b(sleep)\b/gi, 'mew in bed'],
    [/\b(weekend)\b/gi, 'aura farming days'],
    [/\b(test|exam)\b/gi, 'boss fight'],
    [/\b(outfit|clothes)\b/gi, 'fit'],
    [/\b(yes|yeah)\b/gi, 'bet'],
    [/\b(math)\b/gi, '67'],
  ];
  const FILLERS = ['fr fr', 'no cap', '💀', '😭', 'ong', 'skibidi', 'frfr 🔥', '(real)', '🗿', "it's giving ohio", 'chat is this real'];
  const OPENERS = ['bro ', 'nah cuz ', 'ngl ', 'lowkey ', 'chat, ', 'yo ', 'not gonna lie gang, '];
  const EXAMPLES = [
    'Hello friends! Honestly, this food is very good. My teacher is really strict and school is so boring. I am tired. Thank you, goodbye.',
    'I am very excited about the weekend. My friends and I will watch a movie. It will be amazing.',
    'Please do not lie to me. I know you took my fries. That is very weird behavior.',
    'Good morning, boss. The meeting was boring and I failed the test. I am sad.',
    'Wow, your outfit is very cool. You look handsome and confident today.',
    'My parents said I need to sleep more and use my phone less. That is crazy.',
  ];

  function matchCase(src, rep) {
    if (src.length > 1 && src === src.toUpperCase() && /[A-Z]/.test(src)) return rep.toUpperCase();
    if (/^[A-Z]/.test(src)) return rep.charAt(0).toUpperCase() + rep.slice(1);
    return rep;
  }

  function translate(text, level) {
    if (!text.trim()) return '';
    const rng = seeded(hash(text + '|' + level));
    const pr = arr => arr[Math.floor(rng() * arr.length)];

    // swap words via placeholders so a replacement never gets replaced again
    const saved = [];
    let out = text;
    for (const [re, rep] of SLANG) {
      out = out.replace(re, m => {
        saved.push(matchCase(m, rep));
        return `\u0001${saved.length - 1}\u0002`;
      });
    }
    out = out.replace(/\u0001(\d+)\u0002/g, (_, i) => saved[Number(i)]);

    const fillChance = [0, 0.4, 0.7, 1][level];
    out = out.replace(/[^.!?\n]+[.!?]*/g, chunk => {
      const [, lead, core, end] = chunk.match(/^(\s*)([\s\S]*?)([.!?]*)$/);
      if (!core.trim()) return chunk;
      let s = core;
      if (level >= 2 && rng() < 0.3 * level) s = pr(OPENERS) + s.charAt(0).toLowerCase() + s.slice(1);
      if (rng() < fillChance) s = s.replace(/[\s,]*$/, '') + ' ' + pr(FILLERS);
      if (level === 3) s = s.split(' ').map(word => (word && rng() < 0.12 ? `${word} skibidi` : word)).join(' ');
      return lead + s + (level === 3 ? end.replace(/\./g, '!!') : end);
    });

    if (level >= 2) out = out.toLowerCase();
    if (level === 3) out += ' 67 🤲';
    return out;
  }

  const trIn = $('#tr-in');
  const trOut = $('#tr-out');
  const level = () => Number(document.querySelector('input[name="lvl"]:checked').value);
  let trTimer = 0;
  const runTranslate = () => { trOut.textContent = translate(trIn.value, level()); };

  trIn.value = EXAMPLES[0];
  runTranslate();
  trIn.addEventListener('input', () => {
    clearTimeout(trTimer);
    trTimer = setTimeout(runTranslate, 120);
  });
  document.querySelectorAll('input[name="lvl"]').forEach(r => r.addEventListener('change', runTranslate));
  $('#tr-example').addEventListener('click', () => {
    let next = trIn.value;
    while (next === trIn.value) next = pick(EXAMPLES);
    trIn.value = next;
    runTranslate();
  });
  $('#tr-copy').addEventListener('click', () => {
    if (trOut.textContent) copyText(trOut.textContent, 'copied. send it to your mom 💀');
  });
  $('#tr-speak').addEventListener('click', () => {
    if (trOut.textContent) say(trOut.textContent.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''), { rate: 1.1 });
  });

  /* ================= 06 dictionary ================= */
  const DICT = KHADI_DATA.dict;
  const dictEl = $('#dict');
  const dictEmpty = $('#dict-empty');
  function renderDict(q = '') {
    const query = q.trim().toLowerCase();
    const list = DICT.filter(w => !query || w.term.toLowerCase().includes(query) || w.def.toLowerCase().includes(query));
    dictEl.innerHTML = list.map(w =>
      `<div class="entry"><dt><a href="${w.link || `meaning/${w.slug}/`}">${w.term}</a></dt><dd>${w.def}${w.ex ? `<span class="ex">${w.ex}</span>` : ''}</dd></div>`).join('');
    dictEmpty.hidden = list.length > 0;
  }
  renderDict();
  $('#dict-search').addEventListener('input', e => renderDict(e.target.value));

  /* ================= secret codes ================= */
  const CODES = [
    ['67', sixSeven],
    ['skibidi', () => {
      Sfx.skibidi();
      mega('SKIBIDI', 'skibidi');
      rain(['🚽', '🚽', '🧻', '😮'], 40);
    }],
    ['sigma', () => {
      Sfx.vineBoom();
      mega('🗿');
      rain(['🗿'], 30);
      addAura(1000, window.innerWidth / 2, window.innerHeight / 2);
    }],
    ['ohio', toggleOhio],
    ['arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowrightba', mlg],
  ];
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey || !e.key) return;
    typed = (typed + e.key.toLowerCase()).slice(-90);
    for (const [code, run] of CODES) {
      if (typed.endsWith(code)) {
        typed = '';
        run();
        break;
      }
    }
  });

  /* ================= global chaos ================= */
  // hitmarker on every click, with sound in MLG mode
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    spawnFx('hitmark', '', e.clientX, e.clientY);
    if (body.classList.contains('mlg')) Sfx.hitmarker();
  }, { passive: true });

  // emoji cursor trail in ohio / mlg mode
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    let lastTrail = 0;
    document.addEventListener('pointermove', e => {
      if (!body.classList.contains('mlg') && !body.classList.contains('ohio')) return;
      const now = performance.now();
      if (now - lastTrail < 50) return;
      lastTrail = now;
      spawnFx('trail', pick(['✨', '💀', '🗿', '🔥', '🚽']), e.clientX, e.clientY);
    }, { passive: true });
  }

  // guilt-trip in the tab title when they leave
  const baseTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden
      ? pick(['come back gang 😭', 'bro left 💀', '−1000 aura (you left)', 'the toilets miss you 🚽'])
      : baseTitle;
  });

  console.log('%cKHADI.UZ', 'font: 900 42px Bungee, Impact, sans-serif; color: #c6ff00; text-shadow: 3px 3px 0 #ff3db8;');
  console.log('%cyou opened devtools. +1000 nerd aura 🤓\nsecret codes: 67 · skibidi · sigma · ohio · ↑↑↓↓←→←→BA', 'font-size: 14px;');
})();
