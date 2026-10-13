# KHADI.UZ 💀 Ultimate Brainrot HQ

A one-page brainrot website. It's plain HTML, CSS and JavaScript, so there's no build step and nothing to install. The soundboard plays the real meme sounds, the Italian brainrot names are recorded with a neural Italian voice, and every emoji is shown as a high-resolution 3D icon.

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
index.html     page structure
style.css      all styling
app.js         everything interactive
audio.js       plays the sound files, plus text-to-speech for the translator
icons.js       swaps every emoji on the page for its 3D icon
subway.js      the split-screen runner game
icons/         3D emoji icons (.webp), favicon and home-screen icon
sounds/        meme sound effects and the phonk loop
sounds/names/  the 12 Italian brainrot names, one recording each
sounds/words/  the Fusion Lab words, stitched together when a creature is born
```

To add an icon for a new emoji, drop its `.webp` into `icons/` and add the emoji to the `ICONS` list at the top of `icons.js`. Emoji without an icon stay as normal emoji.

## Run it locally

Double-click `index.html` to open it in your browser. Everything works this way, but sounds start a little faster when the site is served from a web address, for example with `python3 -m http.server` and then opening http://localhost:8000.

## Put it online at khadi.uz

1. Log in to your hosting control panel at ahost.
2. Open **File Manager** and go into the site's web folder (usually `public_html`).
3. Upload the 6 files `index.html`, `style.css`, `app.js`, `audio.js`, `icons.js` and `subway.js`, plus the `icons` and `sounds` folders with everything inside them.
4. Open https://khadi.uz.

If you only bought the domain at ahost and have no hosting plan there, you can host the files for free on GitHub Pages, Cloudflare Pages or Netlify and point the domain's DNS records to it.

## Credits

- 3D emoji: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft, MIT license.
- Phonk loop: ["Phonk Type Beat"](https://freesound.org/people/Koolgs/sounds/785479/) by Koolgs on Freesound, CC0 (public domain).
- Meme sound effects (vine boom, metal pipe, MLG airhorn, bruh, Taco Bell bong, sad trombone, hitmarker, wrong buzzer, skibidi, six seven): the well-known clips as shared on [myinstants.com](https://www.myinstants.com). They belong to their original creators.
- Italian brainrot voices: Microsoft Edge neural text-to-speech (Diego, Italian; Ardi, Indonesian, for Tung Tung Tung Sahur). "Brr" is fed to the voice as "Brùr", otherwise it spells the letters out.
