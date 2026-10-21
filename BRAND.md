# khadi.uz brand

The personal site of Xadyatullox Muhammadjonov: accounting and finance, from Tashkent. One cobalt tile panel opens and closes each page, everything between is calm cool white, and the content does the work.

Every value below lives as a CSS variable in `brand.css`. Components use the variables, never the raw hex.

## Colors

| Name | Hex | Variable | Use |
|---|---|---|---|
| Registan cobalt | `#1F3FBF` | `--cobalt` | the hero panel, primary buttons, links |
| Dome turquoise | `#0E9E96` | `--dome` | passed, done, positive |
| Plov saffron | `#FFC629` | `--saffron` | the main call to action, highlights |
| Pomegranate | `#C9293E` | `--pomegranate` | errors (rarely needed) |
| Paper | `#F4F6FB` | `--paper` | page background (cool, never cream) |
| Ink | `#12141D` | `--ink` | text and outlines |

Saffron is too light for text on white. Put ink text on a saffron fill, or saffron text on cobalt or ink. Turquoise is the same: ink text on it, or `--dome-deep` when it has to be text on white.

## Type

- **Bodoni Moda**: the name, headings and the wordmark. A classic serif from Parma, with the authority of the financial press.
- **TikTok Sans**: everything you read, at normal width. A clean grotesque that also covers Cyrillic, so Uzbek and Russian pages can follow.

## Voice

Plain and specific: say what was done and what it changed, in short sentences. No buzzwords, no jokes.

## Signature

The Samarkand tile: eight-point stars stored in the `--tile` variable as an inline SVG and used as a mask, so its color comes from the variables. (Inline rather than a file because browsers refuse mask images from disk.) It fills the hero and the contact panel at the end of the page, and backs the favicon and the link-preview image. Add `class="tile"` to any block to use it.

## Motion

- One orchestrated moment: on the home page the name rises and the "at a glance" ledger fills in, under 900ms.
- Everything else moves only when you touch it: buttons press down onto their lip. UI transitions are 150 to 250ms, ease-out.
- No scroll-triggered fades. `prefers-reduced-motion` turns the hero sequence off.
