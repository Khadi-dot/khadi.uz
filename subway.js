/* ==========================================================
   KHADI.UZ split-screen "subway runner"
   For the attention-span-challenged. Fully automatic: a tiny
   AI dodges trains forever while you read the rest of the site.
   ========================================================== */
const Subway = (() => {
  const LANES = [-1, 0, 1];
  const FAR = 90;        // where new stuff spawns
  const SPEED = 30;      // world units per second
  const RUNNER_Z = 3;    // runner's distance from the camera
  const JUMP = 0.6;      // seconds in the air
  const COLORS = ['#3d7bff', '#ffcc1f', '#ff4d5e', '#22c55e', '#a07bff', '#ff8a1f'];
  const TAGS = ['67', 'OHIO', 'SIGMA', 'RIZZ', 'W', 'AURA'];

  let canvas = null;
  let g = null;
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let running = false;
  let hooks = {};

  const S = {
    time: 0, scroll: 0, spawnIn: 0.4,
    objs: [], free: 0,       // `free` = the lane the level guarantees is escapable
    lane: 0, x: 0, jumpT: 0,
    score: 0, best: 0, coins: 0, crashT: 0,
    skyline: [],
  };

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const between = (a, b) => LANES.filter(l => l > Math.min(a, b) && l < Math.max(a, b));

  /* ---------- setup ---------- */
  function init(el, opts = {}) {
    canvas = el;
    g = canvas.getContext('2d');
    hooks = opts;
    for (let x = 0; x < 1;) {
      const bw = 0.03 + Math.random() * 0.07;
      S.skyline.push({ x, w: bw, h: 0.03 + Math.random() * 0.11 });
      x += bw;
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    resize();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = r.width;
    h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  /* ---------- fake 3D ---------- */
  const horizon = () => h * 0.3;
  function proj(x, z, y = 0) {
    const s = 1 / (1 + Math.max(z, -0.9) * 0.09);
    const hy = horizon();
    const unit = Math.min(w * 0.3, h * 0.42) * s;
    return { x: w / 2 + x * unit, y: hy + (h - hy) * s - y * unit, unit };
  }

  /* ---------- level generator ---------- */
  function trainBusy(lane, fromZ) {
    return S.objs.some(o => o.kind === 'train' && o.lane === lane && o.z + o.len > fromZ);
  }

  function spawn() {
    const open = LANES.filter(l => !trainBusy(l, FAR - 14));
    const near = open.filter(l => Math.abs(l - S.free) <= 1);
    const free = near.length ? pick(near) : S.free;
    const roll = Math.random();
    if (roll < 0.6) {
      const spots = shuffle(open.filter(l => l !== free));
      const n = Math.min(spots.length, Math.random() < 0.45 ? 2 : 1);
      for (let i = 0; i < n; i++) {
        S.objs.push({ kind: 'train', lane: spots[i], z: FAR, len: 12 + Math.random() * 16, color: pick(COLORS), tag: pick(TAGS) });
      }
      if (n) S.free = free;
    } else if (roll < 0.82) {
      S.objs.push({ kind: 'barrier', lane: S.free, z: FAR, len: 0.4 });
    }
    if (Math.random() < 0.7) {
      for (let k = 0; k < 5; k++) S.objs.push({ kind: 'coin', lane: S.free, z: FAR + 3 + k * 2.4, len: 0.2 });
    }
  }

  /* ---------- the "AI" ---------- */
  function dangerIn(lane) {
    let d = 999;
    for (const o of S.objs) {
      if (o.kind !== 'train' || o.lane !== lane) continue;
      if (o.z + o.len < RUNNER_Z - 0.5) continue;
      d = Math.min(d, Math.max(0, o.z - RUNNER_Z));
    }
    return d;
  }

  function think() {
    const cur = Math.round(S.x);
    const d = {};
    for (const l of LANES) d[l] = dangerIn(l);
    const passable = to => between(cur, to).every(l => d[l] > 3);

    let target = S.lane;
    if (target !== S.free && d[S.free] > 60 && passable(S.free)) target = S.free;
    if (d[target] < 14) {
      for (const l of LANES) if (d[l] > d[target] && passable(l)) target = l;
    }
    S.lane = target;

    if (S.jumpT === 0) {
      for (const o of S.objs) {
        const dist = o.z - RUNNER_Z;
        if (o.kind === 'barrier' && o.lane === cur && dist > 0.8 && dist < 4.5) { S.jumpT = 0.0001; break; }
      }
    }
  }

  const jumpHeight = () => (S.jumpT > 0 ? Math.sin(Math.PI * S.jumpT / JUMP) * 0.9 : 0);

  function collide() {
    const cur = Math.round(S.x);
    const centered = Math.abs(S.x - cur) < 0.3;
    const jh = jumpHeight();
    for (const o of S.objs) {
      if (o.kind === 'coin') {
        if (!o.taken && o.lane === cur && Math.abs(o.z - RUNNER_Z) < 1) {
          o.taken = true;
          S.coins++;
          if (hooks.coin) hooks.coin();
        }
        continue;
      }
      if (!centered || o.lane !== cur || S.crashT > 0) continue;
      if (o.kind === 'train' && RUNNER_Z > o.z - 0.2 && RUNNER_Z < o.z + o.len) return crash(o);
      if (o.kind === 'barrier' && Math.abs(o.z - RUNNER_Z) < 0.5 && jh < 0.35) return crash(o);
    }
  }

  function crash(o) {
    S.crashT = 1.3;
    S.best = Math.max(S.best, S.score);
    S.score = 0;
    S.objs = S.objs.filter(x => x !== o);
    if (hooks.crash) hooks.crash();
  }

  function update(dt) {
    S.time += dt;
    const v = SPEED * (S.crashT > 0 ? 0.35 : 1);
    S.scroll += v * dt;
    for (const o of S.objs) o.z -= v * dt;
    S.objs = S.objs.filter(o => o.z + o.len > -3);

    S.spawnIn -= dt;
    if (S.spawnIn <= 0) {
      spawn();
      S.spawnIn = 0.55 + Math.random() * 0.5;
    }

    think();
    const dx = S.lane - S.x;
    S.x += Math.sign(dx) * Math.min(Math.abs(dx), 9 * dt);
    if (S.jumpT > 0) {
      S.jumpT += dt;
      if (S.jumpT >= JUMP) S.jumpT = 0;
    }

    collide();
    if (S.crashT > 0) S.crashT -= dt;
    else S.score += dt * 41;
  }

  /* ---------- drawing ---------- */
  function poly(pts, fill) {
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = s => {
      const v = (n >> s) & 255;
      return Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    };
    return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
  }

  function roundRect(x, y, rw, rh, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + rw, y, x + rw, y + rh, r);
    g.arcTo(x + rw, y + rh, x, y + rh, r);
    g.arcTo(x, y + rh, x, y, r);
    g.arcTo(x, y, x + rw, y, r);
    g.closePath();
  }

  function drawWorld() {
    const hy = horizon();
    const sky = g.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, '#3a1d6e');
    sky.addColorStop(0.6, '#ff5fb8');
    sky.addColorStop(1, '#ffc46b');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, hy + 1);

    g.fillStyle = 'rgba(255, 236, 140, .95)';
    g.beginPath();
    g.arc(w * 0.72, hy, h * 0.07, Math.PI, 0);
    g.fill();

    g.fillStyle = '#2a1450';
    for (const b of S.skyline) g.fillRect(b.x * w, hy - b.h * h, b.w * w + 1, b.h * h + 1);

    const ground = g.createLinearGradient(0, hy, 0, h);
    ground.addColorStop(0, '#5b3b6b');
    ground.addColorStop(1, '#2b1838');
    g.fillStyle = ground;
    g.fillRect(0, hy, w, h - hy);

    poly([proj(-1.65, FAR), proj(1.65, FAR), proj(1.65, -0.9), proj(-1.65, -0.9)], '#6e5a4e');

    // sleepers scroll toward the camera
    const gap = 2.4;
    const z0 = gap - (S.scroll % gap);
    for (let z = z0 + Math.floor(FAR / gap) * gap; z > -0.9; z -= gap) {
      for (const l of LANES) {
        poly([proj(l - 0.42, z), proj(l + 0.42, z), proj(l + 0.42, z + 0.35), proj(l - 0.42, z + 0.35)], '#3b2a22');
      }
    }

    g.strokeStyle = '#d9d4e6';
    g.lineWidth = 2.5;
    for (const l of LANES) {
      for (const side of [-0.27, 0.27]) {
        const a = proj(l + side, FAR);
        const b = proj(l + side, -0.9);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }
  }

  function drawTrain(o) {
    const HW = 0.43;
    const H = 1.3;
    const zn = Math.max(o.z, -0.85);
    const zf = o.z + o.len;
    if (zf <= -0.85) return;
    const L = o.lane - HW;
    const R = o.lane + HW;

    if (o.lane !== 0) {
      // the side facing the middle of the screen
      const sx = o.lane < 0 ? R : L;
      poly([proj(sx, zn), proj(sx, zf), proj(sx, zf, H), proj(sx, zn, H)], shade(o.color, -0.3));
      poly([proj(sx, zn, H * 0.55), proj(sx, zf, H * 0.55), proj(sx, zf, H * 0.8), proj(sx, zn, H * 0.8)], 'rgba(190, 233, 255, .55)');
    }
    poly([proj(L, zn, H), proj(R, zn, H), proj(R, zf, H), proj(L, zf, H)], shade(o.color, 0.25));
    if (o.z < -0.5) return;

    const nl = proj(L, zn);
    const nr = proj(R, zn);
    const nlt = proj(L, zn, H);
    poly([nl, nr, proj(R, zn, H), nlt], o.color);
    const fw = nr.x - nl.x;
    const fh = nl.y - nlt.y;
    g.fillStyle = '#c8f0ff';
    g.fillRect(nl.x + fw * 0.12, nlt.y + fh * 0.1, fw * 0.76, fh * 0.3);
    g.fillStyle = 'rgba(0, 0, 0, .25)';
    g.fillRect(nl.x + fw * 0.48, nlt.y + fh * 0.1, fw * 0.04, fh * 0.3);
    g.fillStyle = '#fff6a0';
    for (const k of [0.2, 0.8]) {
      g.beginPath();
      g.arc(nl.x + fw * k, nl.y - fh * 0.16, fw * 0.065, 0, Math.PI * 2);
      g.fill();
    }
    if (fw > 26) {
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `${Math.round(fw * 0.2)}px Bungee, Impact, sans-serif`;
      g.fillText(o.tag, nl.x + fw / 2, nl.y - fh * 0.42);
    }
  }

  function drawBarrier(o) {
    if (o.z < -0.5) return;
    const top = proj(o.lane - 0.42, o.z, 0.5);
    const bot = proj(o.lane - 0.42, o.z, 0.28);
    const rt = proj(o.lane + 0.42, o.z, 0.5);
    const foot = proj(o.lane - 0.42, o.z);
    const bw = rt.x - top.x;
    const bh = bot.y - top.y;
    g.fillStyle = '#222';
    g.fillRect(top.x + bw * 0.08, top.y, bw * 0.06, foot.y - top.y);
    g.fillRect(top.x + bw * 0.86, top.y, bw * 0.06, foot.y - top.y);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? '#fff' : '#ff3b4e';
      g.fillRect(top.x + (bw / 6) * i, top.y, bw / 6 + 0.5, bh);
    }
    g.strokeStyle = '#000';
    g.lineWidth = 1.5;
    g.strokeRect(top.x, top.y, bw, bh);
  }

  function drawCoin(o) {
    if (o.z < 0) return;
    const p = proj(o.lane, o.z, 0.38 + Math.sin(S.time * 5 + o.z) * 0.04);
    const r = p.unit * 0.12;
    const squish = 0.25 + 0.75 * Math.abs(Math.cos(S.time * 5 + o.z * 0.5));
    g.fillStyle = '#ffd21f';
    g.strokeStyle = '#a86b00';
    g.lineWidth = Math.max(1, r * 0.22);
    g.beginPath();
    g.ellipse(p.x, p.y, r * squish, r, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }

  function drawRunner() {
    const jh = jumpHeight();
    const t = S.time * 15;
    const bob = jh > 0 ? 0 : Math.abs(Math.sin(t)) * 0.04;
    const p = proj(S.x, RUNNER_Z, jh + bob);
    const ground = proj(S.x, RUNNER_Z);
    const u = p.unit;

    g.fillStyle = 'rgba(0, 0, 0, .35)';
    g.beginPath();
    g.ellipse(ground.x, ground.y, u * 0.2 * (1 - jh * 0.4), u * 0.05, 0, 0, Math.PI * 2);
    g.fill();

    const swing = jh > 0 ? 0 : Math.sin(t);
    g.lineCap = 'round';
    g.strokeStyle = '#1f3a8a';
    g.lineWidth = u * 0.09;
    const hipY = p.y - u * 0.4;
    for (const [side, sw] of [[-1, swing], [1, -swing]]) {
      const lift = Math.max(0, sw) * u * 0.14;
      g.beginPath();
      g.moveTo(p.x + side * u * 0.07, hipY);
      g.lineTo(p.x + side * u * 0.08, p.y - u * 0.03 - lift);
      g.stroke();
      g.fillStyle = '#fff';
      g.beginPath();
      g.ellipse(p.x + side * u * 0.08, p.y - u * 0.02 - lift, u * 0.06, u * 0.035, 0, 0, Math.PI * 2);
      g.fill();
    }

    g.strokeStyle = '#ff3db8';
    g.lineWidth = u * 0.075;
    for (const [side, sw] of [[-1, -swing], [1, swing]]) {
      g.beginPath();
      g.moveTo(p.x + side * u * 0.15, p.y - u * 0.74);
      g.lineTo(p.x + side * u * 0.22, p.y - u * 0.5 - sw * u * 0.08);
      g.stroke();
    }

    g.fillStyle = '#ff3db8';
    roundRect(p.x - u * 0.16, p.y - u * 0.8, u * 0.32, u * 0.44, u * 0.08);
    g.fill();
    g.fillStyle = '#ffd21f';
    roundRect(p.x - u * 0.1, p.y - u * 0.74, u * 0.2, u * 0.24, u * 0.05);
    g.fill();

    g.fillStyle = '#2a170e';
    g.beginPath();
    g.arc(p.x, p.y - u * 0.92, u * 0.12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#22e4ff';
    g.beginPath();
    g.arc(p.x, p.y - u * 0.95, u * 0.125, Math.PI, 0);
    g.fill();
    g.fillRect(p.x - u * 0.07, p.y - u * 0.96, u * 0.14, u * 0.06);
  }

  function drawHud() {
    g.textBaseline = 'alphabetic';
    g.font = '700 14px "Space Grotesk", system-ui, sans-serif';
    const lines = [`SCORE ${Math.floor(S.score)}`, `COINS ${S.coins}`, `BEST ${Math.floor(Math.max(S.best, S.score))}`];
    g.textAlign = 'left';
    lines.forEach((txt, i) => {
      g.fillStyle = '#000';
      g.fillText(txt, 13, 23 + i * 18);
      g.fillStyle = '#fff';
      g.fillText(txt, 12, 22 + i * 18);
    });

    if (S.crashT > 0) {
      g.fillStyle = `rgba(255, 40, 60, ${Math.min(0.35, S.crashT * 0.3)})`;
      g.fillRect(0, 0, w, h);
      g.textAlign = 'center';
      g.font = `${Math.round(Math.min(w, h) * 0.1)}px Bungee, Impact, sans-serif`;
      g.fillStyle = '#000';
      g.fillText('BRO CRASHED 💀', w / 2 + 3, h * 0.45 + 3);
      g.fillStyle = '#fff';
      g.fillText('BRO CRASHED 💀', w / 2, h * 0.45);
    }
  }

  function draw() {
    if (!g || w < 2 || h < 2) return;
    drawWorld();

    const items = S.objs.filter(o => !o.taken).map(o => ({ z: o.z, o }));
    items.push({ z: RUNNER_Z, runner: true });
    items.sort((a, b) => b.z - a.z);
    for (const it of items) {
      g.globalAlpha = it.runner ? 1 : Math.max(0, Math.min(1, (FAR - it.z) / 12));
      if (it.runner) drawRunner();
      else if (it.o.kind === 'train') drawTrain(it.o);
      else if (it.o.kind === 'barrier') drawBarrier(it.o);
      else drawCoin(it.o);
    }
    g.globalAlpha = 1;
    drawHud();
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  return {
    init,
    start() {
      if (running || !g) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
})();
