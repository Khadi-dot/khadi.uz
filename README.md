# KHADI.UZ 💀 Ultimate Brainrot HQ

A brainrot website. It's plain HTML, CSS and JavaScript, so nothing needs installing to run it. Every dictionary word and Italian brainrot creature also has its own page, so each one can show up in search. The soundboard plays the real meme sounds, the Italian brainrot names are recorded with a neural Italian voice, and every emoji is shown as a high-resolution 3D icon.

## What's on the site

The front page (`index.html`) introduces the site: a hero with a phone you can tap to hear the Italian brainrot creatures, the six features, reviews and a contact form. The contact form opens the visitor's email app addressed to `me@khadi.uz`. To have messages delivered from the page instead, paste a Formspree form URL into `FORM_ENDPOINT` near the bottom of `index.html`.

Everything interactive lives on the play page (`play.html`, at khadi.uz/play.html):

| Section | What it does |
|---|---|
| **Hero** | Tap the moai to farm aura, or pick one of three mystery cards: one gives aura, one takes it, one gives a mega boost, shuffled every round. Aura and rank are saved in the visitor's browser. |
| **01 Soundboard** | Vine boom, metal pipe, MLG airhorn, bruh, Taco Bell bong, sad trombone, phonk loop, skibidi, six seven, hitmarker, sigma meow |
| **02 Italian Brainrot** | 12 creature cards that speak their names in an Italian voice, plus a Fusion Lab that invents new creatures |
| **03 Aura Scanner** | Type any name to get rizz, sigma, cooked and NPC stats. The same name always gives the same result. |
| **04 Skibidi Smash** | 30-second whack-a-toilet game. The score converts to aura. |
| **05 Translator** | Turns normal English into Gen Alpha slang, with 3 levels |
| **06 Dictionary** | Brainrot words explained for parents and teachers |
| **Subway Mode** | Split screen with real Subway Surfers gameplay for your attention span, embedded from the official Subway Surfers YouTube channel |

Secret codes (type them anywhere on the play page): `67`, `skibidi`, `sigma`, `ohio`, and the Konami code `↑↑↓↓←→←→BA`.

## Files

```
BRAND.md              the brand: colors, typefaces, voice, the tile and the motion rules
brand.css             the brand as CSS variables, plus buttons, fields, the tile and the footer every page shares
index.html            the front page, with its layout and script inside the file
play.html             the soundboard, games and tools
style.css             layout for the play page and the dictionary and creature pages (loads after brand.css)
app.js                everything interactive on the play page
data.js               the dictionary words and Italian brainrot creatures
audio.js              plays the sound files, plus text-to-speech for the translator
icons.js              swaps every emoji for its 3D icon
subway.js             a drawn runner game, shown in Subway Mode only when the page is opened from disk (YouTube won't play there)
icons/                3D emoji icons (.webp), favicon, home-screen icon and link-preview image (og-image.jpg)
sounds/               meme sound effects and the phonk loop
sounds/names/         the 12 Italian brainrot names, one recording each
sounds/words/         the Fusion Lab words, stitched together when a creature is born
meaning/              one page per dictionary word (built, don't edit by hand)
italian-brainrot/     one page per creature (built, don't edit by hand)
tools/content.js      the longer text for those pages
tools/build-pages.js  builds meaning/, italian-brainrot/ and sitemap.xml
robots.txt, sitemap.xml, google42f0761f873f0cfb.html   for search engines
```

To add an icon for a new emoji, drop its `.webp` into `icons/` and add the emoji to the `ICONS` list at the top of `icons.js`. Emoji without an icon stay as normal emoji.

## Change a word or a creature

1. Edit the short definition or lore in `data.js`, and the longer text in `tools/content.js`. A new word needs an entry in both, keyed by its `slug`. A new creature also needs its name recorded in `sounds/names/`.
2. Run `node tools/build-pages.js` from this folder. It rebuilds every page and the sitemap, and stops with a message if something is missing.
3. Commit and push.

## Run it locally

Double-click `index.html` to open it in your browser. Everything works this way, but sounds start a little faster when the site is served from a web address, for example with `python3 -m http.server` and then opening http://localhost:8000.

## Put it online at khadi.uz

The site is hosted on GitHub Pages from the `main` branch of this repo, and the `CNAME` file points it at khadi.uz. Push to `main` and the live site updates within a minute or two.

## Search engines

The site is verified in Google Search Console, and `sitemap.xml` lists every page. Keep `google42f0761f873f0cfb.html` and the `google-site-verification` tag in `index.html`, or Search Console stops trusting the site.

## Credits

- 3D emoji: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT license.
- Phonk loop: ["Phonk Type Beat"](https://freesound.org/people/Koolgs/sounds/785479/) by Koolgs on Freesound, CC0 (public domain).
- Subway Mode gameplay: ["Subway Surfers (2024) - Gameplay [4K 9x16] No Copyright"](https://www.youtube.com/watch?v=QPW3XwBoQlw) and ["Subway Surfers (2026) - Gameplay [4K 16x9] No Copyright"](https://www.youtube.com/watch?v=i0M4ARe9v0Y) by the official Subway Surfers channel, embedded with YouTube's player.
- Meme sound effects (vine boom, metal pipe, MLG airhorn, bruh, Taco Bell bong, sad trombone, hitmarker, wrong buzzer, skibidi, six seven, deep meow): the well-known clips as shared on [myinstants.com](https://www.myinstants.com). They belong to their original creators.
- Italian brainrot voices: Microsoft Edge neural text-to-speech (Diego, Italian; Ardi, Indonesian, for Tung Tung Tung Sahur). "Brr" is fed to the voice as "Brùr", otherwise it spells the letters out.
