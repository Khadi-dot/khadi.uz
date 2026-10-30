# khadi.uz

The personal site and CV of Xadyatullox Muhammadjonov. Plain HTML, CSS and JavaScript with no build step, so nothing needs installing. The one library, three.js for the hero, is kept in `vendor/` and served from khadi.uz itself rather than a CDN, so a network that blocks CDNs can't break the page.

If the page's script can't run at all (a very old browser, a failed load, an error before the loading screen lifts), a small fallback script in `index.html` lifts the loading screen after a moment and shows everything as plain HTML with the still portrait.

## Pages

| Address | File | What it is |
|---|---|---|
| khadi.uz | `index.html` | Home: the hero, the ACCA so far, the path to audit, education and recognition, skills and languages, side projects, contact |
| khadi.uz/cv/ | `cv/index.html` | The full CV, laid out as an A4 page. It prints cleanly. |
| khadi.uz/cv.pdf | `cv.pdf` | The CV as a PDF, made from the page above |
| khadi.uz/architecture/ | `architecture/` | How the site is built: its parts as floating 3D bubbles (three.js, from `vendor/`), mapped by graphify. The bracketed button in the top corner opens it. |
| any missing address | `404.html` | "Off the map", with a link home |

## Files

```
BRAND.md      the brand: colours, typefaces, voice, signatures and motion
brand.css     the brand as CSS variables, plus the pieces every page shares
index.html    home, with its layout and all of its scripts inside the file
cv/           the CV page
cv.pdf        the CV as a PDF
vendor/       three.js 0.185 (MIT): the two files the hero imports
architecture/ the architecture page and graph.json, the map it draws
tools/        export-architecture.py, which turns graphify's graph into that graph.json
404.html      shown for addresses that don't exist
img/          everything the pages show (see below)
sitemap.xml, robots.txt, google42f0761f873f0cfb.html   for search engines
CNAME         points GitHub Pages at khadi.uz
```

`img/` holds:

```
hero/       the hero portrait and the maps the WebGL scene needs: diffuse.jpg, alpha.png
            (the cut-out), depth.png and normal.png (for the parallax and the relight),
            silhouette.png (the loading veil), portrait.png (the still fallback)
games/      the side projects: the Chrono Spires icon and banner, and a PocketPywel screenshot
education/  portrait.webp, the cut-out in the education block
contact/    portrait.webp, the cut-out at the foot of the page
photo.jpg   the CV photo
```

The cut-outs were made on this Mac with Apple's Vision framework. The depth and normal maps were derived from them, so they are approximations rather than scans.

The photos arrived at 768×1024, smaller than the page shows them on a Retina screen, so each was enlarged 4× with Real-ESRGAN (open source, run on this Mac) before being cut out. Over each face the enlargement is a plain resample instead, so the model can't change a feature. Full-size originals straight from the phone would be sharper still.

## Change the home page

- **Text**: edit it in `index.html`. The words animate in on their own; nothing needs re-timing.
- **After an exam result** (FM in December, then the rest): in the script in `index.html`, move the paper into `PASSED` and set `NEXT_EXAM` to the next one. The map's trace, lit exams and pulse follow. Then update the numbers by hand: the hero's "ACCA progress" panel and "Next exam" panel, the ACCA block's intro, status line and plate, the journey's "Next" row (its count and the `done` / `next` cells), and the CV's ACCA table.
- **The journey** is a list of rows in `index.html`, in date order. A job is a *route card*: a line with one point per month there, and hovering or tapping a point names the month. Its `data-from` and `data-to` give the first and last month (`2025-04`); `data-to="now"` keeps the job running, so the card adds a point each month and its count updates by itself. The words on the card (name, role, dates, tags) are plain HTML beside them, so edit those to match. `data-seed` only changes the line's bends. Shorter rows between the jobs are *note cards* (a degree, an award, an exam). A centre row is a job or the "Next" card; a side row is a note card, alternating `data-align="right"` and `"left"`.
- **Skills and languages** are plain HTML in `index.html`: three language cards, then three groups of skills, each with where it was used. Keep each "where" line to one fact. After an exam result, update the Accounting & audit group too.
- **The strip of results** under education: edit the `LOG` list near the end of the script. Mark the one ahead `live` (it pulses) and the rest `done`.
- **The ACCA map's islands** are the `ISLANDS` list in the script; the Options island lists two `Option` papers until you choose them. On a phone the map only names the exams sat and still to sit; the exemptions keep their markers.

## Refresh the architecture map

The map is a snapshot. After changing the site, rebuild it in Claude Code with `/graphify . --update` (or `/graphify .` for a full rebuild), then run `python3 tools/export-architecture.py` and commit `architecture/graph.json`. graphify's own output stays in `graphify-out/`, which is never committed. The export joins the same real-world thing named in several files into one part, and `FIXES` in the script corrects any note graphify got wrong.

## Update the CV

1. Edit `cv/index.html`. If the change belongs on the home page too (a new job, an exam passed), edit `index.html` as well.
2. Make a new `cv.pdf`: open khadi.uz/cv/ (or the local page) in Chrome, press Print, choose "Save as PDF", set margins to Default and turn on "Background graphics". Save it over `cv.pdf`.
3. Commit and push.

The CV page loads static font files from Fontsource rather than Google Fonts' variable ones. Chrome's PDF export splits words set in the variable fonts ("ACCOUNTIN G"), and recruiters' screening software reads the PDF's text, so keep it that way.

## Run it locally

Run `python3 -m http.server` in this folder and open http://localhost:8000. Opening `index.html` straight from disk won't work: browsers block the hero's textures and the module imports on `file://` pages.

## Put it online

The site is hosted on GitHub Pages from the `main` branch, and `CNAME` points it at khadi.uz. Push to `main` and the live site updates within a minute or two.

## Search engines

The site is verified in Google Search Console and `sitemap.xml` lists both pages. Keep `google42f0761f873f0cfb.html` and the `google-site-verification` tag in `index.html`, or Search Console stops trusting the site.
