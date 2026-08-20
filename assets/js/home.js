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

/* ------------------------------------- Legendary service: review slider ---
   Endless in both directions: a clone of the first review is parked after the
   last, so advancing past the end keeps moving forward and the jump back to
   the real first slide happens with the transition off, out of sight.    */
(function () {
  const track = document.getElementById("serviceTrack");
  if (!track) return;
  const real = [].slice.call(track.children);
  const n = real.length;
  if (!n) return;

  const EASE = "transform .9s cubic-bezier(.45, .05, .15, 1)";
  const RIDE = 900;      // matches EASE
  const HOLD = 10000;    // 10s between reviews

  if (n > 1) track.appendChild(real[0].cloneNode(true));   // the wrap-around copy

  let i = 0, busy = false, timer;

  function show(animate) {
    track.style.transition = animate ? EASE : "none";
    track.style.transform = "translateX(" + (-i * 100) + "%)";
  }

  function go(dir) {
    if (busy || n < 2) return;
    busy = true;
    if (dir < 0 && i === 0) {          // stand on the clone, then walk back
      i = n; show(false); void track.offsetWidth;
    }
    i += dir;
    show(true);
    setTimeout(function () {
      if (i === n) { i = 0; show(false); }   // landed on the clone: reset unseen
      busy = false;
    }, RIDE);
  }

  function auto() { clearInterval(timer); timer = setInterval(function () { go(1); }, HOLD); }

  const prev = document.querySelector(".service-arrow--prev");
  const next = document.querySelector(".service-arrow--next");
  if (prev) prev.addEventListener("click", function () { go(-1); auto(); });
  if (next) next.addEventListener("click", function () { go(1);  auto(); });

  show(false);
  auto();
  window.addEventListener("resize", function () { show(false); });
})();

/* ----------------------------------------- quote marks: tuck to the text ---
   House rule: the bottom-right corner of the mark's ink meets the top-left
   corner of the first letter. Font metrics decide that, not guesswork, so it
   is measured off the real glyph outlines and re-applied on resize.      */
(function () {
  /* Nudge applied after the corners are matched, in artboard px. The glyph
     reads high because a quote mark is drawn at superscript height, so it
     wants dropping by eye. One value, used everywhere. */
  const MARK_DROP  = 106;  // down from the matched corner
  const MARK_SHIFT = 29;   // and right

  /* Every quote block on the page, not just the first — the review slider
     holds one per slide and each has a different length. */
  const BLOCKS = [
    { scope: ".pull-quote",    mark: ".pull-mark",    dropAdj: 0 },
    /* the service copy is padded down 10, so the mark takes 10 off its drop
       and stays exactly where it was */
    { scope: ".service-quote", mark: ".service-mark", dropAdj: -10 }
  ];
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

  function tuck(mark, text, dropAdj) {
    if (!mark || !text || !ctx.measureText("M").actualBoundingBoxAscent) return;
    const first = (text.textContent || "").trim().charAt(0);
    if (!first) return;
    const mi = ink(mark, mark.textContent.trim());
    const ti = ink(text, first);
    const cs = getComputedStyle(mark);
    const unit = parseFloat(getComputedStyle(document.documentElement).fontSize) / 100;
    mark.style.left = (parseFloat(cs.left) + (ti.left - mi.right) + MARK_SHIFT * unit) + "px";
    mark.style.top  = (parseFloat(cs.top)  + (ti.top  - mi.bottom) + (MARK_DROP + (dropAdj || 0)) * unit) + "px";
  }

  function place() {
    BLOCKS.forEach(function (b) {
      document.querySelectorAll(b.scope).forEach(function (q) {
        tuck(q.querySelector(b.mark), q.querySelector("p"), b.dropAdj);
      });
    });
  }

  place();

  /* The tuck is a measurement, so it has to re-run whenever the geometry it
     measured can change — not just on load. Without this the mark keeps the
     pixel offset it was given at one viewport and drifts at every other. */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(function () { place(); });
    BLOCKS.forEach(function (b) {
      document.querySelectorAll(b.scope).forEach(function (q) { ro.observe(q); });
    });
  }
  window.addEventListener("load", place);
  window.addEventListener("orientationchange", place);

  window.addEventListener("resize", function () {
    BLOCKS.forEach(function (b) {
      document.querySelectorAll(b.scope + " " + b.mark).forEach(function (m) {
        m.style.left = ""; m.style.top = "";
      });
    });
    place();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* ------------------------------------------- caravans-built count-up ------
   Runs once, when the band first scrolls into view.                       */
(function () {
  const el = document.querySelector(".stat-number");
  if (!el) return;
  const target = parseInt(el.dataset.countTo, 10) || 0;
  const plus = el.querySelector("span");
  let done = false;

  function run() {
    if (done) return;
    done = true;
    /* a timer rather than rAF: rAF is paused in background tabs, which would
       leave the figure stuck at zero for anyone who opens the page there */
    const DUR = 1800, t0 = Date.now();
    const id = setInterval(function () {
      const k = Math.min(1, (Date.now() - t0) / DUR);
      const eased = 1 - Math.pow(1 - k, 3);            // ease-out
      el.firstChild.nodeValue = Math.round(target * eased).toLocaleString();
      if (k >= 1) { clearInterval(id); el.firstChild.nodeValue = target.toLocaleString(); }
    }, 32);
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.firstChild.nodeValue = target.toLocaleString();
    return;
  }
  /* A visibility poll rather than IntersectionObserver: IO callbacks are
     among the first things a browser stops dispatching in a background or
     throttled tab, which would leave the figure sitting at zero. */
  const watch = setInterval(function () {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      clearInterval(watch);
      run();
    }
  }, 200);
})();
