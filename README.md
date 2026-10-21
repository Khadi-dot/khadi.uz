# khadi.uz

The personal site and CV of Xadyatullox Muhammadjonov. Plain HTML, CSS and JavaScript with no build step. The home page pulls in two libraries from a CDN (three.js for the hero, Lenis for smooth scrolling), so nothing needs installing.

## Pages

| Address | File | What it is |
|---|---|---|
| khadi.uz | `index.html` | Home: the hero, Chrono Spires, the journey so far, PocketPywel, contact |
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
games/      the Chrono Spires icon and screenshots, and a PocketPywel screenshot
journey/    the photograph on the 2025 plate
workshop/   the cut-out in the PocketPywel block
contact/    the cut-out at the foot of the page
photo.jpg   the CV photo
```

The cut-outs were made on this Mac with Apple's Vision framework. The depth and normal maps were derived from them, so they are approximations rather than scans.

## Change the home page

- **Text**: edit it in `index.html`. The words animate in on their own; nothing needs re-timing.
- **The development log** under PocketPywel: edit the `LOG` list near the end of the script in `index.html`. Mark one entry `live` (the pulsing one), finished ones `done`, upcoming ones `ring`.
- **Chrono Spires' numbers** (32 levels, 4 worlds): they are in the block's plate in the HTML, and the map's worlds are the `ISLANDS` list in the script.

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
