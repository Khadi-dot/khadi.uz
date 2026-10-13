# KHADI.UZ 💀 Ultimate Brainrot HQ

A brainrot website. It's plain HTML, CSS and JavaScript, so nothing needs installing to run it. Every dictionary word and Italian brainrot creature also has its own page, so each one can show up in search. The soundboard plays the real meme sounds, the Italian brainrot names are recorded with a neural Italian voice, and every emoji is shown as a high-resolution 3D icon.

## What's on the page

| Section | What it does |
|---|---|
| **Hero** | Tap the moai to farm aura. Aura and rank are saved in the visitor's browser. |
| **01 Soundboard** | Vine boom, metal pipe, MLG airhorn, bruh, Taco Bell bong, sad trombone, phonk loop, skibidi, six seven, hitmarker |
| **02 Italian Brainrot** | 12 creature cards that speak their names in an Italian voice, plus a Fusion Lab that invents new creatures |
| **03 Aura Scanner** | Type any name to get rizz, sigma, cooked and NPC stats. The same name always gives the same result. |
| **04 Skibidi Smash** | 30-second whack-a-toilet game. The score converts to aura. |
| **05 Translator** | Turns normal English into Gen Alpha slang, with 3 levels |
| **06 Dictionary** | Brainrot words explained for parents and teachers |
| **Subway Mode** | Split screen with an auto-running subway game for your attention span |

Secret codes (type them anywhere on the page): `67`, `skibidi`, `sigma`, `ohio`, and the Konami code `↑↑↓↓←→←→BA`.

## Files

```
index.html            the home page
style.css             all styling, for every page
app.js                everything interactive on the home page
data.js               the dictionary words and Italian brainrot creatures
audio.js              plays the sound files, plus text-to-speech for the translator
icons.js              swaps every emoji for its 3D icon
subway.js             the split-screen runner game
icons/                3D emoji icons (.webp), favicon, home-screen icon and link-preview image
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
- Meme sound effects (vine boom, metal pipe, MLG airhorn, bruh, Taco Bell bong, sad trombone, hitmarker, wrong buzzer, skibidi, six seven): the well-known clips as shared on [myinstants.com](https://www.myinstants.com). They belong to their original creators.
- Italian brainrot voices: Microsoft Edge neural text-to-speech (Diego, Italian; Ardi, Indonesian, for Tung Tung Tung Sahur). "Brr" is fed to the voice as "Brùr", otherwise it spells the letters out.
