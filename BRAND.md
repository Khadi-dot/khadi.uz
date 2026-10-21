# KHADI.UZ brand

Brainrot, glazed in Tashkent. The content is unhinged, so the design stays calm: one loud cobalt tile panel per page, cool white everywhere else, and the 3D emoji do the shouting.

Every value below lives as a CSS variable in `brand.css`. Components use the variables, never the raw hex.

## Colors

| Name | Hex | Variable | Use |
|---|---|---|---|
| Registan cobalt | `#1F3FBF` | `--cobalt` | the hero panel, primary buttons, links |
| Dome turquoise | `#0E9E96` | `--dome` | the tile, W and gains |
| Plov saffron | `#FFC629` | `--saffron` | the score color: aura numbers, stars, the main call to action |
| Pomegranate | `#C9293E` | `--pomegranate` | L, losses, errors |
| Paper | `#F4F6FB` | `--paper` | page background (cool, never cream) |
| Ink | `#12141D` | `--ink` | text and outlines |

Saffron is too light for text on white. Put ink text on a saffron fill, or saffron text on cobalt or ink. Turquoise is the same: ink text on it, or `--dome-deep` when it has to be text on white.

## Type

- **TikTok Sans**: everything you read. Headlines in black weight at a wide stretch (`--stretch-wide`), body and buttons at normal width. It's the typeface of the feed brainrot lives in.
- **Bodoni Moda italic**: creature names, dictionary words and quotes, the things that pretend to be important. Bodoni is from Parma, so the Italian brainrot names get the gravity they don't deserve.

## Voice

Deadpan and lowercase: the calmest person in the room saying the most unhinged thing. Fluent in Gen Alpha, never mean.

## Signature

The Samarkand tile: eight-point stars stored in the `--tile` variable as an inline SVG and used as a mask, so its color comes from the variables. (Inline rather than a file because browsers refuse mask images from disk.) It fills each page's hero, backs the mystery cards, sits behind creature art and closes the footer. Add `class="tile"` to any block to use it.

## Motion

- One orchestrated moment: the front page hero comes in once on load (lines rise, the phone settles), under 900ms.
- Everything else moves only when you touch it: buttons press down onto their lip, cards flip, toasts slide. UI transitions are 150 to 250ms, ease-out.
- No scroll-triggered fades, no hover lift on cards. `prefers-reduced-motion` turns the hero sequence and the effects off.
