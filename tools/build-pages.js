/* ==========================================================
   KHADI.UZ page builder
   Turns every dictionary word and Italian brainrot creature
   into its own page, so each one can show up in search.
   Run from the project folder:  node tools/build-pages.js
   It rewrites meaning/, italian-brainrot/ and sitemap.xml.
   ========================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://khadi.uz/';
const DATA = require('../data.js');
const CONTENT = require('./content.js');
const CARD_COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--lime)', 'var(--orange)', 'var(--purple)'];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmt = n => n.toLocaleString('en-US');
const jsonLd = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const crumbs = list => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })),
});

/* ---------- the data, checked ---------- */
const words = DATA.dict.filter(w => w.slug).map(w => {
  const extra = CONTENT.words[w.slug];
  if (!extra) throw new Error(`tools/content.js has no entry for the word "${w.slug}"`);
  return { ...w, ...extra, say: extra.say || w.term, url: `${SITE}meaning/${w.slug}/` };
});
const creatures = DATA.italian.map((c, i) => {
  const s = slug(c.name);
  const extra = CONTENT.creatures[s];
  if (!extra) throw new Error(`tools/content.js has no entry for the creature "${s}"`);
  if (!fs.existsSync(path.join(ROOT, 'sounds/names', `${s}.mp3`))) throw new Error(`missing sounds/names/${s}.mp3`);
  return { ...c, ...extra, slug: s, color: CARD_COLORS[i % CARD_COLORS.length], url: `${SITE}italian-brainrot/${s}/` };
});
const wordBySlug = Object.fromEntries(words.map(w => [w.slug, w]));
const creatureBySlug = Object.fromEntries(creatures.map(c => [c.slug, c]));
for (const w of words) for (const r of w.related) if (!wordBySlug[r]) throw new Error(`"${w.slug}" links to unknown word "${r}"`);
for (const c of creatures) for (const r of c.related) if (!creatureBySlug[r]) throw new Error(`"${c.slug}" links to unknown creature "${r}"`);

/* ---------- shared layout ---------- */
function page({ root, url, title, description, type = 'article', ld, body, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#0d0718">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="KHADI.UZ">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}icons/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="${root}icons/favicon.png">
  <link rel="apple-touch-icon" href="${root}icons/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Comic+Neue:wght@700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${root}style.css">
  ${jsonLd(ld)}
</head>
<body class="subpage">
  <header class="topbar">
    <a class="logo" href="${root}">KHADI<span>.UZ</span></a>
    <nav class="top-actions" aria-label="Site">
      <a class="chip-btn" href="${root}meaning/"><span aria-hidden="true">📖</span><span class="lbl">DICTIONARY</span></a>
      <a class="chip-btn" href="${root}italian-brainrot/"><span aria-hidden="true">🤌</span><span class="lbl">ITALIAN BRAINROT</span></a>
      <a class="chip-btn hot" href="${root}play.html"><span aria-hidden="true">🗿</span><span class="lbl">FARM AURA</span></a>
    </nav>
  </header>

  <main class="article" id="main">
${body}
    <aside class="cta">
      <p class="cta-title">this was the boring part. now lose some brain cells 🧠</p>
      <p>hear the real meme sounds, summon Italian brainrot, scan anyone’s aura and smash skibidi toilets on KHADI.UZ.</p>
      <a class="btn btn-lime" href="${root}play.html">ENTER THE BRAINROT</a>
    </aside>
  </main>

  <footer class="footer">
    <p class="big">KHADI.UZ</p>
    <p class="footer-links"><a href="${root}">home</a> · <a href="${root}meaning/">brainrot dictionary</a> · <a href="${root}italian-brainrot/">italian brainrot characters</a></p>
    <p>made with 0 brain cells in Tashkent · © 2026 · no cap</p>
  </footer>

  <script src="${root}icons.js"></script>${scripts}
</body>
</html>
`;
}

const pills = items => `<ul class="pills">${items.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>`;
const paras = list => list.map(p => `      <p>${esc(p)}</p>`).join('\n');
const PLAY_SCRIPT = `
  <script>
    // play buttons for the creature names
    document.querySelectorAll('[data-sound]').forEach(btn => {
      const audio = new Audio(btn.dataset.sound);
      btn.addEventListener('click', () => { audio.currentTime = 0; audio.play().catch(() => {}); });
    });
  </script>`;

/* ---------- dictionary ---------- */
function wordPage(w) {
  const root = '../../';
  const title = `What Does “${w.say[0].toUpperCase() + w.say.slice(1)}” Mean? Brainrot Slang Explained | KHADI.UZ`;
  const body = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="${root}">KHADI.UZ</a> / <a href="../">brainrot dictionary</a> / <span>${esc(w.term)}</span></nav>
    <div class="article-head">
      <span class="article-art" aria-hidden="true">${w.emoji}</span>
      <h1>What does “${esc(w.say)}” mean?</h1>
    </div>
    <p class="answer">${esc(w.def)}</p>

    <section>
      <h2>What it means</h2>
${paras(w.more)}
    </section>
    <section>
      <h2>Where it comes from</h2>
${paras(w.origin)}
    </section>
    <section>
      <h2>How to use it</h2>
      <ul class="examples">${w.examples.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
    </section>
    <section>
      <h2>Related words</h2>
      ${pills(w.related.map(r => [`../${r}/`, wordBySlug[r].term]))}
    </section>
`;
  return page({
    root, title, body, url: w.url,
    description: `${w.def} What “${w.say}” means, where it comes from and how kids use it.`,
    ld: [
      crumbs([['KHADI.UZ', SITE], ['Brainrot dictionary', `${SITE}meaning/`], [w.term, w.url]]),
      { '@context': 'https://schema.org', '@type': 'DefinedTerm', name: w.term, description: w.def, url: w.url, inDefinedTermSet: `${SITE}meaning/` },
    ],
  });
}

function dictionaryIndex() {
  const root = '../';
  const url = `${SITE}meaning/`;
  const entries = DATA.dict.map(w => {
    const href = w.link ? `${root}${w.link}` : `${w.slug}/`;
    return `        <div class="entry"><dt><a href="${href}">${esc(w.term)}</a></dt><dd>${esc(w.def)}</dd></div>`;
  }).join('\n');
  const body = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="${root}">KHADI.UZ</a> / <span>brainrot dictionary</span></nav>
    <div class="article-head">
      <span class="article-art" aria-hidden="true">📖</span>
      <h1>Brainrot dictionary</h1>
    </div>
    <p class="answer">Gen Alpha and Gen Z slang explained for parents, teachers and anyone over 25 who feels lost. Tap a word to see what it means, where it came from and how to use it without sounding like an unc.</p>
    <section>
      <dl class="dict">
${entries}
      </dl>
    </section>
`;
  return page({
    root, url, body, type: 'website',
    title: 'Brainrot Dictionary: Gen Alpha Slang Meanings | KHADI.UZ',
    description: 'What do skibidi, rizz, aura, 6 7, fanum tax and sigma mean? Gen Alpha slang explained simply, with origins and examples.',
    ld: [
      crumbs([['KHADI.UZ', SITE], ['Brainrot dictionary', url]]),
      { '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'Brainrot dictionary', url, hasDefinedTerm: words.map(w => ({ '@type': 'DefinedTerm', name: w.term, url: w.url })) },
    ],
  });
}

/* ---------- italian brainrot ---------- */
const art = c => `<span class="card-art" style="--card:${c.color}" aria-hidden="true"><span>${c.art[0]}</span><span>${c.art[1]}</span></span>`;

function creaturePage(c) {
  const root = '../../';
  const body = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="${root}">KHADI.UZ</a> / <a href="../">italian brainrot</a> / <span>${esc(c.name)}</span></nav>
    <div class="creature-hero">${art(c)}</div>
    <h1 class="creature-name">${esc(c.name)}</h1>
    <p class="answer">${esc(c.lore)}</p>
    <div class="creature-actions">
      <button class="btn btn-lime" type="button" data-sound="${root}sounds/names/${c.slug}.mp3">🔊 HEAR THE NAME</button>
      <span class="creature-aura">AURA ${fmt(c.aura)}</span>
    </div>

    <section>
      <h2>Who is ${esc(c.name)}?</h2>
${paras(c.more)}
    </section>
    <section>
      <h2>What is Italian brainrot?</h2>
      <p>${esc(CONTENT.italianIntro)} <a href="../">See all the characters</a>.</p>
    </section>
    <section>
      <h2>More creatures</h2>
      ${pills(c.related.map(r => [`../${r}/`, creatureBySlug[r].name]))}
    </section>
`;
  return page({
    root, body, url: c.url, scripts: PLAY_SCRIPT,
    title: `${c.name}: Italian Brainrot Character, Lore & Sound | KHADI.UZ`,
    description: `Who is ${c.name}? ${c.lore} Hear the name and read the lore.`,
    ld: [crumbs([['KHADI.UZ', SITE], ['Italian brainrot', `${SITE}italian-brainrot/`], [c.name, c.url]])],
  });
}

function italianIndex() {
  const root = '../';
  const url = `${SITE}italian-brainrot/`;
  const cards = creatures.map(c => `        <a class="card" href="${c.slug}/" style="--card:${c.color}">
          ${art(c)}
          <span class="card-name">${esc(c.name)}</span>
          <span class="card-lore">${esc(c.lore)}</span>
          <span class="card-meta"><span>AURA ${fmt(c.aura)}</span><span class="speak">read the lore →</span></span>
        </a>`).join('\n');
  const body = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="${root}">KHADI.UZ</a> / <span>italian brainrot</span></nav>
    <div class="article-head">
      <span class="article-art" aria-hidden="true">🤌</span>
      <h1>Italian brainrot characters</h1>
    </div>
    <p class="answer">${esc(CONTENT.italianIntro)}</p>
    <section>
      <h2>The hall of fame</h2>
      <div class="cards">
${cards}
      </div>
    </section>
`;
  return page({
    root, url, body, type: 'website',
    title: 'Italian Brainrot Characters: Names, Lore & Sounds | KHADI.UZ',
    description: 'Every Italian brainrot character explained: Tralalero Tralala, Bombardiro Crocodilo, Tung Tung Tung Sahur, Ballerina Cappuccina and more, with lore and sounds.',
    ld: [crumbs([['KHADI.UZ', SITE], ['Italian brainrot', url]])],
  });
}

/* ---------- write everything ---------- */
function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

for (const dir of ['meaning', 'italian-brainrot']) fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true });
write('meaning/index.html', dictionaryIndex());
words.forEach(w => write(`meaning/${w.slug}/index.html`, wordPage(w)));
write('italian-brainrot/index.html', italianIndex());
creatures.forEach(c => write(`italian-brainrot/${c.slug}/index.html`, creaturePage(c)));

const today = new Date().toISOString().slice(0, 10);
const urls = [SITE, `${SITE}play.html`, `${SITE}meaning/`, ...words.map(w => w.url), `${SITE}italian-brainrot/`, ...creatures.map(c => c.url)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`);

console.log(`built ${words.length} word pages, ${creatures.length} creature pages, 2 index pages, sitemap with ${urls.length} URLs`);
