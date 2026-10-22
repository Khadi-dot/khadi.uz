# khadi.uz brand

The personal site of Xadyatullox Muhammadjonov: an ACCA student working toward a career in audit, from Tashkent, with games on the side. A light, art-directed sheet with black type, near-black blocks that come and go, and one cyan accent. It is laid out like an instrument panel: bracket corners, chamfered buttons, dashed grids, figures in a condensed face.

Every value below lives as a CSS variable in `brand.css`, in two tiers. Tier 1 (`--raw-…`) is the only place a hex code appears. Components read the tier 2 roles (`--background`, `--accent`…), never the raw values.

## Colors

| Role | Hex | Variable | Use |
|---|---|---|---|
| Page | `#f7fafb` | `--background` | the light ground |
| Ink | `#090a0b` | `--foreground`, `--surface-black` | all copy, and the dark blocks |
| Panel | `#0e0f14` | `--surface-dark` | dark buttons and panels |
| Cyan | `#02d2e3` | `--accent` | the one accent: rules, mastheads on dark, fills, glows |
| Cyan ink | `#007a85` | `--accent-ink` | the accent as text on the light ground |
| Hairline | `#dfe5e9` | `--surface-soft`, `--border-muted` | dividers and the contour lines |
| Steel | `#b6c1c8` | `--foreground-on-dark-muted` | muted copy on dark |
| Orange | `#ff6b00` | `--danger` | errors only, never decoration |

Cyan on the light ground is too pale for text. Use `--accent-ink` for words there and keep `--accent` for shapes, or put cyan type on a dark slab (that is what the buttons do).

## Type

- **Oswald** (700, 500): the name, the block mastheads, the years and every figure. Always uppercase, tight leading (0.95, 0.72 for figures).
- **Space Grotesk** (400, 500, 700): everything you read, nav and labels included. Usually uppercase at small sizes.
- Nothing on screen is set below 12px (`--type-floor`). Small labels take `max(their size, var(--type-floor))`, and the ACCA map sizes its labels against the map's own scale. Words on the journey's plates are HTML in real pixels, never text inside a scaled image.

## Voice

Plain and specific. Say what was done and what it changed, in short sentences. No buzzwords.

## Signatures

- **Bracket corners**: one path (`M0 0.5H10V10.5`) drawn at four corners of a panel instead of a border.
- **The chamfered button**: a dark slab with a cut bottom-right corner and cyan type that floods cyan on hover.
- **The stepped plate**: the journey's frames, a rounded rectangle with a step cut out of its foot. Each job sits on one as a route card: a white line with a cyan point for every month there.
- **Contours**: slow rolling contour lines behind the light blocks, white at 10% behind the contact panel.
- **Soft seams**: where a light block meets a dark one, the colour of the block above lies over the top of the next and fades as it rises.
- **Flat islands**: the ACCA map draws each level as a flat isometric slab. A thick cyan line covers the exams behind; grey dashes show the ones still to come.

## Motion

- Everything that moves is a spring (tension and friction, mass 1). There are no CSS keyframes. The only CSS transitions are hover colours, the button floods, the side plates' inset, and the route cards' points and month tooltip.
- Scrolling is the browser's own. Nothing takes over the wheel or the trackpad; in-page links scroll smoothly with the browser's smooth scroll.
- Text reveals start as soon as a block reaches the screen and only reset once it is entirely below it, so text on screen is never hidden.
- Once the hero is half gone, a dock with the menu slides down from the top and marks the section on screen.
- Text arrives word by word or letter by letter, rising 0.35em.
- A route card's line draws itself when its row arrives, and each month's point appears as the line reaches it. A job still running pulses on its latest month.
- The first three blocks are a stack: each pins to the top and the next slides over it while the covered one shrinks to 90% and darkens.
- The hero opens behind a veil (your silhouette filling from the top). Then a halftone blueprint of the portrait burns away crown to chin, and comes back wherever the cursor has just been.
- `prefers-reduced-motion` shows everything at once: no smooth scrolling, no reveals, and the hero settles on its final frame.
