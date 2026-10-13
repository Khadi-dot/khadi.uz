/* ==========================================================
   KHADI.UZ icon swap
   Every emoji on the page gets swapped for a 3D icon from
   Microsoft's Fluent Emoji set (MIT license, files in icons/),
   so the art looks the same, and sharp, on every device.
   ========================================================== */
(() => {
  'use strict';

  const ICONS = {
    '💀': 'skull', '🗿': 'moai', '🚽': 'toilet', '🔥': 'fire', '🔊': 'speaker-high-volume', '🤲': 'palms-up-together',
    '☕': 'hot-beverage', '😭': 'loudly-crying-face', '🤖': 'robot', '🦈': 'shark', '🐊': 'crocodile',
    '🌽': 'ear-of-corn', '🤫': 'shushing-face', '🐄': 'cow', '✈️': 'airplane', '🐒': 'monkey',
    '🗣️': 'speaking-head', '🤪': 'zany-face', '🍔': 'hamburger', '💯': 'hundred-points', '🎯': 'bullseye',
    '📯': 'postal-horn', '🐘': 'elephant', '🍌': 'banana', '🐱': 'cat-face', '🪿': 'goose', '🐪': 'camel', '🧊': 'ice',
    '📤': 'outbox-tray', '😮': 'face-with-open-mouth', '🚨': 'police-car-light', '🚇': 'metro', '🌀': 'cyclone',
    '📖': 'open-book', '⚗️': 'alembic', '❓': 'red-question-mark', '😐': 'neutral-face', '🎲': 'game-die',
    '📋': 'clipboard', '🐣': 'hatching-chick', '😏': 'smirking-face', '💪': 'flexed-biceps', '♾️': 'infinity',
    '6️⃣': 'keycap-6', '7️⃣': 'keycap-7', '🕶️': 'sunglasses', '🥤': 'cup-with-straw', '🌮': 'taco',
    '🔇': 'muted-speaker', '🧠': 'brain', '💥': 'collision', '🔩': 'nut-and-bolt', '🔔': 'bell', '🎺': 'trumpet',
    '❌': 'cross-mark', '🏎️': 'racing-car', '👟': 'running-shoe', '🪵': 'wood', '🏏': 'cricket-game',
    '🩰': 'ballet-shoes', '🌳': 'deciduous-tree', '🌵': 'cactus', '🗡️': 'dagger', '🦐': 'shrimp',
    '🪐': 'ringed-planet', '🦒': 'giraffe', '🐧': 'penguin', '🦫': 'beaver', '🐙': 'octopus', '🐸': 'frog',
    '🐔': 'chicken', '🍝': 'spaghetti', '🍕': 'pizza', '🩴': 'thong-sandal', '📱': 'mobile-phone', '🥟': 'dumpling',
    '🍚': 'cooked-rice', '🚐': 'minibus', '🚗': 'automobile', '🍉': 'watermelon', '👑': 'crown',
    '😜': 'winking-face-with-tongue', '😝': 'squinting-face-with-tongue', '🫨': 'shaking-face', '🏆': 'trophy',
    '🧏': 'deaf-person', '🧢': 'billed-cap', '🧻': 'roll-of-paper', '✨': 'sparkles', '🤓': 'nerd-face',
    '🤌': 'pinched-fingers', '👴': 'old-man', '🍩': 'doughnut', '🦄': 'unicorn', '🍳': 'cooking', '🐐': 'goat',
    '🫂': 'people-hugging', '🔪': 'kitchen-knife', '🤐': 'zipper-mouth-face', '👀': 'eyes', '💅': 'nail-polish',
    '🥶': 'cold-face', '🚣': 'person-rowing-boat',
  };

  // icons/ sits next to this script, so pages in subfolders find it too
  const base = new URL('icons/', document.currentScript.src).href;

  // emoji often carry an invisible U+FE0F, so look them up without it
  const strip = s => s.replace(/️/g, '');
  const file = {};
  for (const [emoji, name] of Object.entries(ICONS)) file[strip(emoji)] = name;

  const esc = ch => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = Object.keys(file)
    .sort((a, b) => b.length - a.length)
    .map(k => [...k].map(esc).join('\\uFE0F?') + '\\uFE0F?')
    .join('|');
  // split() with a capture group returns text, emoji, text, emoji, ...
  const splitter = new RegExp(`(${pattern})`, 'u');

  // text people type or copy has to stay real text
  const SKIP = 'textarea, input, output, script, style, noscript, canvas';
  const skip = el => !el || el.closest(SKIP);

  function icon(emoji) {
    const img = document.createElement('img');
    img.className = 'emo';
    img.src = `${base}${file[strip(emoji)]}.webp`;
    img.alt = emoji;
    img.draggable = false;
    img.decoding = 'async';
    return img;
  }

  function swapText(node) {
    const parts = node.nodeValue.split(splitter);
    if (parts.length === 1 || skip(node.parentElement)) return;
    node.replaceWith(...parts.map((part, i) => (i % 2 ? icon(part) : part)).filter(p => p !== ''));
  }

  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) return swapText(root);
    if (root.nodeType !== Node.ELEMENT_NODE || skip(root)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(swapText);
  }

  // swap what's on the page now, then anything added later (toasts, emoji rain, game faces…)
  scan(document.body);
  new MutationObserver(records => {
    for (const r of records) {
      if (r.type === 'characterData') swapText(r.target);
      else r.addedNodes.forEach(scan);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  // fetch the rest in the background so effects never pop in empty
  const preload = () => Object.values(file).forEach(name => { new Image().src = `${base}${name}.webp`; });
  window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(preload) : setTimeout(preload, 1500)));
})();
