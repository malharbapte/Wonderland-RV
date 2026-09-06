# Wonderland RV — working rules

How this site is built and the conventions to keep. Written for whoever picks it
up next, including future me.

Live: <https://malharbapte.github.io/Wonderland-RV/>
Pages that matter: `home.html`, `compact.html` (contact).
`index.html` is the original-scale reference, not the live design.

---

## 1. The scaling convention

Every value in the desktop layer is an SVG coordinate from the Figma artboard
divided by 100.

```css
html { font-size: min(calc(100vw / 23.76), 100px); }  /* 1rem = 100 artboard px */
body { max-width: 23.76rem; margin: 0 auto; }         /* the 2376 artboard      */
:root { --col: 16.24rem; }                            /* the content column     */
```

So `padding-top: 1.20rem` means 120px on the artboard, and the whole page scales
with the viewport.

**Do not "clean this up" into normal px.** It is what keeps the page
proportional to the design at every width.

**The cap matters.** The rem stops growing at 100px, so above a **2376px
viewport** the body caps at 23.76rem and centres. Anything that must reach the
screen edges has to break out of it — see §6.

---

## 2. The desktop gate

Malhar's standing instruction: **phone work never changes desktop.** Desktop is
signed off; the phone pass came later.

Three mechanisms, used together:

1. Every phone rule lives inside `@media (max-width: 900px)`.
2. Every phone-only DOM build sits behind `ON_PHONE.matches` (or a local
   `matchMedia("(max-width: 900px)")` in the shared scripts).
3. **Before every push, diff the desktop layer byte-for-byte** — everything in a
   stylesheet before the first `@media`:

```bash
python3 -c "
i=lambda t:t[:t.find('@media')]
print(i(open('/tmp/before.css').read())==i(open('assets/css/styles.css').read()))"
```

Copy the file to `/tmp` before editing, then compare. If it prints `False` and
you did not intend a desktop change, you have leaked.

**Deliberate desktop changes are allowed when asked for** — say so plainly in
the commit and in the reply, and list exactly which lines moved. It has happened
twice on purpose:

- the hero sound button (three lines: `.video-controls` z-index, and
  `pointer-events` on `.home-hero-copy` and `.home-hero-cta a`) — the bug was on
  desktop too, so the fix could not live in the phone block;
- the `.band` full-bleed break-out, and the footer legal measure.

**Note the asymmetry.** Because phone rules are all inside a media query, a
desktop edit *does* reach the phone unless the phone block already overrides
that property. Check both directions.

---

## 3. The rem-collapse trap

**The single most common bug in this codebase.** Below 900px,
`html { font-size: 16px }`. Any desktop rem value the phone block does not
override renders at roughly **one sixth** of intent.

It has bitten at least seven times:

| where | intended | rendered |
|---|---|---|
| `.footer-head` line-height | 26 | **4.16px** |
| `.link-col li` line-height | 27 | **4.32px** |
| `.field-grid` `grid-template-rows` | 40 / 108 / 109 | **6.4 / 17.3 / 17.5** — rows overlapped by 9 |
| `.home-chips` height | 74 | **12px** |
| `.home-pair .field--select` width | 393 | **63px** |
| `.home-contact-lede` margin-top | 22 | **3.5px** |
| `.range-icon` | 62 | **9.9px** |
| `.video-ctl` | 46 | **7.4px** |

**The checklist that catches it:**

- Setting `font-size` in a phone rule? Set `line-height` too.
- Setting `grid-template-columns`? Set `grid-template-rows` too.
- Overriding a width? Check height, margin and padding on the same element.
- **Check specificity.** `.home-pair .field--select` (0,2,0) outranks a shared
  `.field--select` (0,1,0), so the collapsed desktop value wins. Answer those
  directly rather than relying on a general phone rule.
- Suspect any measured value that is a clean multiple of the intended one over
  six.

There is a second, related trap: **deleting a phone override can be worse than
keeping it.** Removing `.home-chips .chip > span`'s phone font-size to "let the
shared rule govern" handed the labels back to `0.21rem` — 3.4px — because the
desktop rule has equal specificity and `homepage.css` loads second.

---

## 4. Type

Phone tokens, defined in the `styles.css` phone block:

```
--t-display 34/36   the hero line, and nothing else
--t-heading 30/33
--t-sub     16/24
--t-cta     16
--t-body    15/23
--t-caption 12/18
```

Four tiers only — display, heading, sub/body, caption. Reviews are excluded and
tuned separately. **11pt is the floor** (the unsubscribe line is the one
exemption). Ten distinct sizes were collapsed into six.

Brand faces only: **Aviano Sans** (headings, always Black weight) and
**Gordita**. No Montserrat, whatever the artboard says.

---

## 5. Spacing scales

Two scales are in use. Do not invent a third.

**Footer** — 48 between the footer's own sections, 32 between blocks inside a
section, 14 from a heading to the content it introduces, 10 between lines within
a block.

**Forms** — one 22 rhythm between every field row and every block.

Elsewhere, 48 is the section step and 40 the step between blocks within a
section. When something reads as a signature or an answer rather than a new
statement, bind it tighter — Kevin Dani's attribution sits 14 under its quote,
not the 24 that separates two statements.

---

## 6. Layout conventions

**Full-bleed break-out.** Anything that must span the viewport regardless of the
capped body:

```css
width: 100vw;
margin-left: calc(50% - 50vw);
```

The inner `.container` still centres correctly, because `body` is centred too.
Sections carrying it: `.hero`, `.video-band`, `.experience`, `.rules-band`,
`.next-band`, `.site-header`, `.band`, plus several in `homepage.css`.

On the phone it is **switched off** — `100vw` counts the scrollbar the viewport
does not give back, which produced 16px of sideways scroll. The phone block
resets those same selectors to `width: 100%; margin-left: 0`.

**Radius.** `--radius: 10px`, one curvature for the whole phone layout (the
sheets carried ten different ones). Media inside the page margin is rounded;
media running to the screen edge is square.

**Page margin.** 24px on the phone. Everything aligns to it — including the
menu panel and the social row.

**Tap targets.** 44px minimum. Anything interactive that measures less is a bug:
it has caught the video controls (22px), the social icons (22px), and six of
seven form controls (40px).

**`:hover` does not exist on a phone.** Controls revealed on hover must be shown
outright in the phone block, or they sit at `opacity: 0` forever.

---

## 7. Interaction patterns

**Carousels.** One pattern, used five times (luxury, range, reviews, Queen of
Hearts, dream van):

- `overflow-x: auto` + `scroll-snap-type: x mandatory` + `scroll-snap-stop:
  always` + `overscroll-behavior-x: contain`
- index chosen by **nearest to the viewport centre**, not the left edge — the
  last card can never reach the left edge
- driven by a **poll**, not scroll events (see §9)

**Infinite loops.** Lay the set down three times, open in the middle set, and
move a whole set width when a boundary is crossed. The pixels either side of the
seam are identical, so nothing shows. Use `while()`, not `if()` — a flung finger
can overshoot a whole set.

**The wrap must run in the poll**, not only at the end of an animation or after
a settle timer. Otherwise a free swipe has nothing holding it inside the middle
set and the rail strands at its last slide.

**Accordions.** Animate `height` from a **measured number**. `auto` does not
transition, and a grid `0fr → 1fr` resolves to zero inside an auto-height
parent. Both cost an afternoon.

---

## 8. Copy rules

- **Never invent content.** A sample once shipped a "Which model?" field that
  did not exist (the real one is State) and dropped the consent block entirely.
  Read the markup first.
- **Orphans.** Bind the last two words with ` `; bind hyphenated pairs with
  `‑` so "off-grid" cannot split. Never fix an orphan by reducing the font
  size, and avoid `<br>`.
- **Placed breaks.** Where a line must break in a specific place, wrap each half
  in `<span class="ln">` and make it `display: block` in the phone block. The
  spans stay inline on desktop, so the desktop line is untouched. Used for
  "Ready for / Adventure ?" and Kevin's quote.
- **Hard `<br>`s are suppressed on the phone** for prose, so the text can rewrap.
  When you do that, **make sure a space precedes each `<br>` in the source** —
  hiding one joins the text nodes and produces "inclusionsthan", "strengthand".
- Do not change punctuation silently. "Adventure ?" carries a space before the
  question mark because the artboard does; flag it, do not fix it.

---

## 9. What the preview pane cannot verify

This matters more than it sounds — several hours went into chasing "bugs" that
were the tooling.

- **CSS transitions and WAAPI animations never advance.** Measure end states with
  transitions disabled instead.
- **`requestAnimationFrame` may not run.** Anything animated by hand cannot be
  observed; drive `scrollLeft` directly to test the arithmetic.
- **Scroll events do not fire** even as `scrollLeft` changes. Hence the polls.
- **`getComputedStyle` returns stale values** after a JS-driven class change, and
  for pseudo-elements. It is also a **live object** — read it *before* you change
  state, or you get the new value back.
- **YouTube embeds do not load at all**, so anything using the IFrame API is
  unverifiable here.
- The pane collapses to zero width and returns garbage; guard with
  `if (!box.width) return;`.

**Geometry and arithmetic can be proven here. Motion and feel cannot.** Say so
rather than implying something was watched.

---

## 10. JavaScript conventions

- Four files: `home.js` (homepage), `video.js` (contact), `reviews.js` and
  `footer.js` (both pages). **A section on both pages gets its own file** —
  neither page's script should own shared furniture.
- `ON_PHONE` is a `const` declared partway down `home.js`. **Anything
  referencing it must sit below that line** or it dies in the temporal dead
  zone, silently, taking the rest of the file with it.
- Phone DOM is built once at load behind the media check. Resizing across the
  breakpoint does not rebuild — accepted, and consistent throughout.
- **Collect before you mutate.** Walking a live child list while moving nodes out
  of it drops every second item.
- Measure layout with `offsetWidth`/`offsetLeft`. `getBoundingClientRect()`
  reports the **transformed** box — a slide at `scale(.86)` measured 249 instead
  of 278 and every step landed short.
- Absolute positioning is measured from the container's **padding** box;
  `getBoundingClientRect` reports from its **border** box. Subtract
  `clientLeft`/`clientTop` or you land a pixel out per border.

---

## 11. Workflow

- **Sample before implementing.** Build a standalone `sample-*.html`, give three
  options with the trade-offs stated, get a pick, then implement. Samples are
  throwaway and never linked from a live page.
- Samples must be **live and interactive** — a static mockup of an accordion was
  correctly called out.
- Samples must show the **real** thing: real colours (the footer is white, not
  dark), the real video rather than its poster frame, the real copy.
- **State what a change costs.** Side-by-side CTAs need the type at 13 instead of
  15; correct tap targets make a block taller. Say it before it is discovered.
- Bump the `?v=` query on both pages' stylesheet and script links every push.
- Verify at **375 and 430**. Several bugs only appear at 430 — the "Ready for
  Adventure ?" break orphaned the question mark there and nowhere else.

---

## 12. File map

```
home.html        homepage
compact.html     contact page
index.html       original-scale reference, not live

assets/css/styles.css        shared: header, footer, forms, reviews, phone block
assets/css/homepage.css      homepage sections
assets/css/type-compact.css  desktop-only type overrides (min-width: 901px)

assets/js/home.js      homepage; owns ON_PHONE, video mounting, the dream rail
assets/js/video.js     contact page
assets/js/reviews.js   Legendary Service slider — both pages
assets/js/footer.js    footer link accordion + contact rows — both pages

sample-*.html    throwaway samples, never linked
```

Brand fonts: `~/Desktop/Wonderland RV/Branding Fonts` (Aviano Sans + Gordita,
OTF).

---

## 13. Known debt

Two things that break the rules above. Both were found by checking this document
against the code rather than trusting it, and neither is fixed — changing either
risks a regression that nobody has asked for.

**The enquiry pill script is duplicated.** The sliding `.chips-thumb` runs on
both pages, so by §10 it should be its own shared file. Instead there is a copy
in `home.js` and another in `video.js`, and **the two copies have drifted** —
they are not identical. A change to the pill has to be made twice, and it is
easy to fix one and ship the other broken. If you touch the pill, extract it to
`assets/js/chips.js` first and have both pages load it.

**`type-compact.css` says it is for one page and is loaded by both.** Its header
comment reads "loaded by compact.html on top of styles.css", but `home.html`
loads it too. The rules all sit inside `@media (min-width: 901px)`, so the effect
is desktop-wide rather than contact-page-only. Either the comment is stale or the
homepage link is unintended — worth asking Malhar which, because removing the
link would change the homepage's desktop type.

---

## 14. Two standing content rules

- **Crop photos around the van.** The van is the subject; protect it over the
  landscape.
- **wonderlandrv.com.au is read-only.** Take reference from it, change nothing.
