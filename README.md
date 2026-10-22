# khadi.uz

The personal site and CV of Xadyatullox Muhammadjonov. Plain HTML, CSS and JavaScript with no build step, so nothing needs installing. The one library, three.js for the hero, is kept in `vendor/` and served from khadi.uz itself rather than a CDN, so a network that blocks CDNs can't break the page.

If the page's script can't run at all (a very old browser, a failed load, an error before the loading screen lifts), a small fallback script in `index.html` lifts the loading screen after a moment and shows everything as plain HTML with the still portrait.

## Pages

| Address | File | What it is |
|---|---|---|
| khadi.uz | `index.html` | Home: the hero, the ACCA so far, the path to audit, education and recognition, side projects, contact |
| khadi.uz/cv/ | `cv/index.html` | The full CV, laid out as an A4 page. It prints cleanly. |
| khadi.uz/cv.pdf | `cv.pdf` | The CV as a PDF, made from the page above |
| any missing address | `404.html` | "Off the map", with a link home |

## Files

```
BRAND.md      the brand: colours, typefaces, voice, signatures and motion
brand.css     the brand as CSS variables, plus the pieces every page shares
index.html    home, with its layout and all of its scripts inside the file
cv/           the CV page
cv.pdf        the CV as a PDF
vendor/       three.js 0.185 (MIT): the two files the hero imports
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
journey/    the photograph on the 2025 plate
education/  the cut-out in the education block
contact/    the cut-out at the foot of the page
photo.jpg   the CV photo
```

The cut-outs were made on this Mac with Apple's Vision framework. The depth and normal maps were derived from them, so they are approximations rather than scans.

## Change the home page

- **Text**: edit it in `index.html`. The words animate in on their own; nothing needs re-timing.
- **After an exam result** (FM in December, then the rest): in the script in `index.html`, move the paper into `PASSED` and set `NEXT_EXAM` to the next one. The map's trace, lit exams and pulse follow. Then update the numbers by hand: the hero's "ACCA progress" panel and "Next exam" panel, the ACCA block's intro, status line and plate, the journey's "Next" row, and the CV's ACCA table.
- **The strip of results** under education: edit the `LOG` list near the end of the script. Mark the one ahead `live` (it pulses) and the rest `done`.
- **The ACCA map's islands** are the `ISLANDS` list in the script; the Options island lists two `Option` papers until you choose them.

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
