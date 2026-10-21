# khadi.uz

The personal site and CV of Xadyatullox Muhammadjonov. Plain HTML and CSS, so nothing needs installing to run it.

## Pages

| Address | File | What it is |
|---|---|---|
| khadi.uz | `index.html` | Home: intro, experience, education and ACCA, recognition, skills, contact |
| khadi.uz/cv/ | `cv/index.html` | The full CV, laid out as an A4 page. It prints cleanly. |
| khadi.uz/cv.pdf | `cv.pdf` | The CV as a PDF, made from the page above |
| any missing address | `404.html` | "This page isn't here", with a link home |

## Files

```
BRAND.md      the brand: colors, typefaces, voice, the tile and the motion rules
brand.css     the brand as CSS variables, plus the tile, top bar and buttons every page shares
index.html    home, with its layout inside the file
cv/           the CV page, with its screen and print layout inside the file
cv.pdf        the CV as a PDF
404.html      shown for addresses that don't exist
img/          photo, favicon, home-screen icon and link-preview image
sitemap.xml, robots.txt, google42f0761f873f0cfb.html   for search engines
CNAME         points GitHub Pages at khadi.uz
```

## Update the CV

1. Edit `cv/index.html`. If the change belongs on the home page too (a new job, an exam passed), edit `index.html` as well.
2. Make a new `cv.pdf`: open khadi.uz/cv/ (or the local file) in Chrome, press Print, choose "Save as PDF", set margins to Default and turn on "Background graphics". Save it over `cv.pdf`.
3. Commit and push.

Keep a capital Q out of bold text in the CV. The font swaps in a different Q at heavier weights, and the PDF then reads it as missing, which matters because recruiters' screening software reads the PDF's text.

## Run it locally

Double-click `index.html`, or run `python3 -m http.server` in this folder and open http://localhost:8000.

## Put it online

The site is hosted on GitHub Pages from the `main` branch, and `CNAME` points it at khadi.uz. Push to `main` and the live site updates within a minute or two.

## Search engines

The site is verified in Google Search Console and `sitemap.xml` lists both pages. Keep `google42f0761f873f0cfb.html` and the `google-site-verification` tag in `index.html`, or Search Console stops trusting the site.
