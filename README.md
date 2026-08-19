# Wonderland RV — Contact Us

Static HTML/CSS build of the redesigned **Contact Us** page, coded 1:1 from the
Figma export `Contact Us page-2.svg` (artboard 2376 × 6199).

Live: **https://malharbapte.github.io/Wonderland-RV/**

---

## 1. Assets

### a) The video — done

Set in `assets/js/video.js`:

```js
const VIDEO_URL = "https://www.youtube.com/watch?v=thFwJAod6Ng";
```

To swap it later, replace that one string. It accepts:

| Link type | Example |
|---|---|
| YouTube | `https://www.youtube.com/watch?v=XXXXXXXXXXX` or `https://youtu.be/XXXXXXXXXXX` |
| Vimeo | `https://vimeo.com/123456789` |
| Direct file | `https://…/clip.mp4`, `.webm`, `.mov` |
| Local file | `assets/video/clip.mp4` |

The script picks the right embed automatically and plays it muted + looping,
full-bleed, in the band above the "Things you can't see" heading. Left empty, the
labelled placeholder stays put.

### b) The three photos

Drop the files in `assets/img/` using these exact names:

| File | Size in the artboard | Where |
|---|---|---|
| `hero-contact.jpg` | 2378 × 881 | Top banner behind "Contact us" |
| `video-poster.jpg` | 2389 × 1184 | Still frame behind the video while it loads |
| `experience-band.jpg` | 2389 × 769 | "the wonderland experience" band |

Until a file exists, a labelled grey placeholder shows in its place — nothing
breaks, and the layout height never changes.

Already included: `wonderland-rv-logo.png` and `made-in-australia.png`.

---

## 2. Two type scales

| Page | Type | Notes |
|---|---|---|
| `index.html` | full artboard scale | 96px headings, matches the SVG 1:1 |
| `compact.html` | 0.5833 of it | same layout, smaller type |

`compact.html` is the same markup, loading `styles.css` and then
`assets/css/type-compact.css` on top. That override file changes **only**
font-size and line-height — every margin, padding, section gap and box height
is inherited, which is what gives the compact page its extra breathing space.
Layout fixes made in `styles.css` therefore land on both pages automatically.

The scale is anchored on "Our experts will reach out…" going 24 → 14, so the
factor is 14 / 24 = 0.5833. Nothing renders below 11, so the nav, footer links
and legal lines clamp there rather than following the factor to 10.5 / 9.3 /
9.1. The unsubscribe line is the one exception and follows the factor down to 9.

The overrides are scoped to `min-width: 901px`, so the mobile breakpoint in
`styles.css` keeps its own sizes on both pages.

---

## 3. How the layout works

The artboard is 2376 px wide. `html { font-size }` is set so that

```
1rem === 100 artboard px
```

at any viewport width. Every measurement in `styles.css` is therefore the SVG
coordinate divided by 100 — `font-size: 0.96rem` is the 96 px heading,
`height: 8.81rem` is the 881 px hero. The whole page scales proportionally and
stops growing past 2376 px.

Every text baseline and box edge was measured against the SVG coordinates in a
browser and tuned to land within ~1 px. Total document height renders at
6198.8 px against the artboard's 6199.

Below **900 px** the artboard is no longer legible when scaled down, so the page
switches to a stacked mobile layout with real type sizes.

### Deliberate deviations from the SVG

Three places where the export contains designer noise rather than intent:

1. **Left edges.** Body text in the SVG starts variously at x = 501, 502, 504,
   505, 506 and 507. All of it is set to one 1373 px content column
   (501.5 → 1874.5) so the left margin is consistent down the page.
2. **Required asterisks.** In the SVG the right-hand column's red asterisks sit
   33 px lower than the left column's. Here they all sit on their own label's
   baseline.
3. **Footer.** The SVG's footer is a screenshot of the live site, dropped in
   stretched (non-uniform scale) and cropped off-centre. It has been rebuilt as
   real HTML at uniform proportions, inside the same 1373 px content column as
   the rest of the page, and fills the same 1022 px band.

---

## 4. Fonts

Bundled in `assets/fonts/`, loaded via `@font-face`:

- **Aviano Sans** — Regular (400), Bold (700), Black (900). Display headings run
  at 900; nav, buttons and small caps labels run at 400.
- **Gordita** — Regular (400), Medium (500), Bold (700). All body copy and form
  fields.

OTF is served directly. If you want faster loads later, convert to WOFF2 and add
it ahead of the OTF in each `src`.

---

## 5. Wiring up the forms

Both forms (`.enquiry-form` and `.newsletter-form`) post nowhere — `action="#"`.
Point them at your endpoint (HubSpot, Formspree, a Netlify form, your CRM) and
the field `name` attributes are already set: `first-name`, `last-name`, `email`,
`phone`, `state`, `postcode`, `enquiry-type`, `message`, `marketing`.

---

## 6. Running it locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Open it over a server rather than
double-clicking the file, or the browser will block the fonts.

---

## Structure

```
index.html
assets/
  css/styles.css
  js/video.js          ← paste the video link here
  fonts/               ← Aviano Sans + Gordita
  img/                 ← logo, made-in badge, and your 3 photos
```
