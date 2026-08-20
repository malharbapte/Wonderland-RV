/* ==========================================================================
   Homepage behaviour.

   PASTE THE TWO VIDEO LINKS BELOW. Same rules as the Contact page: a YouTube
   link, a Vimeo link, a direct .mp4/.webm, or a local file path. Leave a
   string empty and its labelled placeholder stays in place.
   ========================================================================== */

const HERO_VIDEO_URL   = "https://youtu.be/mZVHIMStpF4";   // full-bleed clip behind "Adventure your way"
const SOLARA_VIDEO_URL = "https://youtu.be/HNcrbrGzMh0";   // clip in the Welcome Solara section

/* -------------------------------------------------------------------------- */

function mountVideo(frame, url, title) {
  if (!frame || !url) return;
  url = url.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (yt) {
    node = document.createElement("iframe");
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1" +
      "&cc_load_policy=0&iv_load_policy=3&playlist=" + yt[1];
    node.allow = "autoplay; encrypted-media; picture-in-picture";
    node.allowFullscreen = true;
  } else if (vimeo) {
    node = document.createElement("iframe");
    node.src = "https://player.vimeo.com/video/" + vimeo[1] + "?autoplay=1&muted=1&loop=1&background=1";
    node.allow = "autoplay; fullscreen; picture-in-picture";
    node.allowFullscreen = true;
  } else {
    node = document.createElement("video");
    node.src = url;
    node.autoplay = true; node.muted = true; node.loop = true;
    node.playsInline = true; node.setAttribute("playsinline", "");
    const poster = frame.querySelector(".video-poster");
    if (poster && poster.getAttribute("src")) node.poster = poster.getAttribute("src");
  }
  node.title = title;
  frame.classList.remove("ph");
  frame.removeAttribute("data-ph");
  frame.appendChild(node);
}

mountVideo(document.querySelector(".home-hero-media"), HERO_VIDEO_URL, "Wonderland RV — adventure your way");
mountVideo(document.querySelector(".solara-video"), SOLARA_VIDEO_URL, "Wonderland RV — Welcome Solara");

/* -------------------------------------------------- mobile nav toggle ---- */
(function () {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();

/* ------------------------------------- State: chevron follows the value --- */
(function () {
  const field = document.querySelector(".field--select");
  if (!field) return;
  const sel = field.querySelector("select");
  const chev = field.querySelector(".chev");
  if (!sel || !chev) return;
  const ctx = document.createElement("canvas").getContext("2d");

  function place() {
    const cs = getComputedStyle(sel);
    ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    const opt = sel.options[sel.selectedIndex];
    const textW = opt ? ctx.measureText(opt.text).width : 0;
    const padL = parseFloat(cs.paddingLeft) || 0;
    const gap = (parseFloat(cs.fontSize) || 24) * 0.58;
    const chevW = chev.getBoundingClientRect().width;
    const limit = sel.offsetWidth - (parseFloat(cs.paddingRight) || 0) - chevW;
    chev.style.left = Math.min(padL + textW + gap, Math.max(padL, limit)) + "px";
  }
  place();
  sel.addEventListener("change", place);
  window.addEventListener("resize", place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* ------------------------------- enquiry-type pill: gliding indicator ----- */
(function () {
  const chips = document.querySelector(".chips");
  const thumb = chips && chips.querySelector(".chips-thumb");
  if (!chips || !thumb) return;
  let settle;

  function place() {
    const checked = chips.querySelector('input[type="radio"]:checked');
    if (!checked) return;
    const span = checked.parentElement.querySelector("span");
    if (!span) return;
    const cb = chips.getBoundingClientRect();
    const sb = span.getBoundingClientRect();
    thumb.style.left = (sb.left - cb.left - chips.clientLeft) + "px";
    thumb.style.width = sb.width + "px";
  }
  function enable() { void thumb.offsetWidth; thumb.classList.remove("is-init"); }

  place(); enable();

  chips.addEventListener("change", function (e) {
    if (!e.target.matches('input[type="radio"]')) return;
    thumb.classList.add("is-moving");
    place();
    clearTimeout(settle);
    settle = setTimeout(function () { thumb.classList.remove("is-moving"); }, 300);
  });
  function reflow() { thumb.classList.add("is-init"); place(); enable(); }
  window.addEventListener("resize", reflow);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reflow);
})();

/* ------------------------------------- Luxury section: push slider --------
   Loads assets/img/home/slide-1.jpg … slide-6.jpg, keeping whichever exist.
   Each new frame enters from the right and pushes the last one off to the
   left. Add or remove files; nothing here changes.                       */
(function () {
  const box = document.getElementById("pullSlides");
  if (!box) return;

  const MAX = 6, HOLD = 5000, TURN = 1050;   // TURN matches the CSS transition
  const found = [];
  let pending = MAX;

  for (let i = 1; i <= MAX; i++) {
    const img = new Image();
    img.onload = function () { found.push({ i: i, src: img.src }); done(); };
    img.onerror = done;
    img.src = "assets/img/home/slide-" + i + ".jpg";
  }

  function done() {
    if (--pending) return;
    if (!found.length) return;                 // no slides yet: placeholder stays
    found.sort(function (a, b) { return a.i - b.i; });

    const slides = found.map(function (f, n) {
      const d = document.createElement("div");
      d.className = "pull-slide" + (n === 0 ? " is-current" : "");
      const im = document.createElement("img");
      im.src = f.src; im.alt = "";
      d.appendChild(im);
      box.appendChild(d);
      return d;
    });
    box.classList.add("has-slides");
    if (slides.length < 2) return;

    let cur = 0;
    setInterval(function () {
      const next = (cur + 1) % slides.length;
      const out = slides[cur];
      out.classList.remove("is-current");
      out.classList.add("is-leaving");          // pushed off to the left
      slides[next].classList.add("is-current"); // arrives from the right
      setTimeout(function () {
        out.classList.add("no-anim");           // park it back on the right
        out.classList.remove("is-leaving");     // without animating the reset
        void out.offsetWidth;
        out.classList.remove("no-anim");
      }, TURN);
      cur = next;
    }, HOLD);
  }
})();

/* ------------------------------------- Legendary service: review slider --- */
(function () {
  const track = document.getElementById("serviceTrack");
  if (!track) return;
  const slides = track.children.length;
  const prev = document.querySelector(".service-arrow--prev");
  const next = document.querySelector(".service-arrow--next");
  let i = 0;

  function show() { track.style.transform = "translateX(" + (-i * 100) + "%)"; }
  if (prev) prev.addEventListener("click", function () { i = (i - 1 + slides) % slides; show(); });
  if (next) next.addEventListener("click", function () { i = (i + 1) % slides; show(); });
  show();
})();

/* ----------------------------------------- quote marks: tuck to the text ---
   House rule: the bottom-right corner of the mark's ink meets the top-left
   corner of the first letter. Font metrics decide that, not guesswork, so it
   is measured off the real glyph outlines and re-applied on resize.      */
(function () {
  /* Nudge applied after the corners are matched, in artboard px. The glyph
     reads high because a quote mark is drawn at superscript height, so it
     wants dropping by eye. One value, used everywhere. */
  const MARK_DROP  = 104;  // down from the matched corner
  const MARK_SHIFT = 26;   // and right

  const PAIRS = [[".pull-mark", ".pull-quote p"], [".service-mark", ".service-quote p"]];
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");

  /* The baseline is read straight off the DOM with a zero-size inline-block
     probe — exact, and independent of whether the font reports sane metrics.
     Ink is then measured from the real glyph outline. A quote mark's ink sits
     entirely above the baseline, so its descent comes back negative. */
  function baselineOf(el) {
    const p = document.createElement("span");
    p.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    el.insertBefore(p, el.firstChild);
    const y = p.getBoundingClientRect().top;
    p.remove();
    return y;
  }

  function ink(el, ch) {
    const cs = getComputedStyle(el);
    ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    const m = ctx.measureText(ch);
    const r = el.getBoundingClientRect();
    const baseline = baselineOf(el);
    return {
      left:   r.left - m.actualBoundingBoxLeft,
      right:  r.left + m.actualBoundingBoxRight,
      top:    baseline - m.actualBoundingBoxAscent,
      bottom: baseline + m.actualBoundingBoxDescent
    };
  }

  function tuck(markSel, textSel) {
    const mark = document.querySelector(markSel);
    const text = document.querySelector(textSel);
    if (!mark || !text || !ctx.measureText("M").actualBoundingBoxAscent) return;
    const first = (text.textContent || "").trim().charAt(0);
    if (!first) return;
    const mi = ink(mark, mark.textContent.trim());
    const ti = ink(text, first);
    const cs = getComputedStyle(mark);
    const unit = parseFloat(getComputedStyle(document.documentElement).fontSize) / 100;
    mark.style.left = (parseFloat(cs.left) + (ti.left - mi.right) + MARK_SHIFT * unit) + "px";
    mark.style.top  = (parseFloat(cs.top)  + (ti.top  - mi.bottom) + MARK_DROP  * unit) + "px";
  }

  function place() { PAIRS.forEach(function (p) { tuck(p[0], p[1]); }); }

  place();
  window.addEventListener("resize", function () {
    PAIRS.forEach(function (p) {
      const m = document.querySelector(p[0]);
      if (m) { m.style.left = ""; m.style.top = ""; }
    });
    place();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();
