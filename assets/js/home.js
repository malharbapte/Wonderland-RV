/* ==========================================================================
   Homepage behaviour.

   PASTE THE TWO VIDEO LINKS BELOW. Same rules as the Contact page: a YouTube
   link, a Vimeo link, a direct .mp4/.webm, or a local file path. Leave a
   string empty and its labelled placeholder stays in place.
   ========================================================================== */

const HERO_VIDEO_URL   = "https://youtu.be/mZVHIMStpF4";   // full-bleed clip behind "Adventure your way"
const SOLARA_VIDEO_URL = "https://youtu.be/HNcrbrGzMh0";   // clip in the Welcome Solara section

/* Queen of Hearts — five slots, in slide order. Same link rules as above. */
const COTY_VIDEOS = ["https://youtu.be/x0NoTZonq8Q",
                     "https://youtu.be/thFwJAod6Ng",
                     "https://youtu.be/Yk4vxl-iUcU",
                     "https://youtu.be/aGa1ek8HPsE",
                     "https://youtu.be/OZzB4zf4FGM",
                     "https://youtu.be/UBc2BtAu8eI"];


/* The hero runs clean: no sound control, no captions button, no prompt. Passing
   no options is what does it -- buildControls is only reached when options are
   given, so nothing is built and nothing has to be hidden afterwards. The clip
   still autoplays, muted, from the parameters in its own embed URL, and it does
   not need a YT.Player: only the Queen of Hearts deck reads frame.ytPlayer, to
   stop a video that has scrolled out of the deck. */
mountVideo(document.querySelector(".home-hero-media"), HERO_VIDEO_URL,
  "Wonderland RV — adventure your way");
mountVideo(document.querySelector(".solara-video"), SOLARA_VIDEO_URL, "Wonderland RV — Welcome Solara");

/* The mobile nav toggle used to live here. It now lives in nav.js, which
   every page loads — this copy would have bound a second listener on the
   same button, and two toggles on one click cancel out. */

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
      if (ON_PHONE.matches) return;      /* the phone scrolls it by hand */
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


/* Quote marks used to be measured and positioned here at runtime. They are
   now fixed in CSS as em offsets of their own font-size: exact at every scale,
   and no longer dependent on canvas font metrics being available. */

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
    const DUR = 1440, t0 = Date.now();   /* 1800 / 1.25 — same ease-out, 1.25x speed */
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

/* ------------------------------------------ Queen of Hearts: video slider --
   Heading, subheading and video sit on one slide, so they change together.
   Loops in both directions without a visible rewind.                      */
const ON_PHONE = window.matchMedia("(max-width: 900px)");

/* ------------------------------------------ Accordion, for the phone ------
   Used by the dream-van points and by Why choose us, so the two behave
   identically rather than drifting into two similar components.

   The description is inserted and removed rather than clipped: it is either
   in the layout at its natural height or it is not. Nothing depends on a
   style change to an element that is already there -- a class, a max-height
   and an inline style all failed that way here -- so the rule and the icon
   are swapped as nodes, and the height is animated through the animation API
   on the node that was just inserted.

   Built here rather than in the markup, so the desktop DOM is untouched: on a
   wide screen none of this exists and the original list shows.            */
function phoneAccordion(opts) {
  const list = document.querySelector(opts.list);
  if (!list) return null;

  const EASE = "cubic-bezier(.4, 0, .2, 1)", OPEN_MS = 380, SHUT_MS = 300;
  const heads = [].map.call(list.querySelectorAll(opts.head), function (h) { return h.textContent.trim(); });
  const copy  = [].map.call(list.querySelectorAll(opts.copy), function (p) { return noOrphan(p.textContent.trim()); });

  let acc = null, openIndex = -1;

  function setIcon(item, i, on) {
    const span = document.createElement("span");
    span.className = on ? "ic ic-on" : "ic";
    span.innerHTML = opts.icons[i];
    item.querySelector(".ic").replaceWith(span);
  }

  function close(i) {
    if (i < 0) return;
    const item = acc.children[i];
    const body = item.querySelector(".acc-body"), rule = item.querySelector(".acc-rule");
    item.classList.remove("is-open");
    setIcon(item, i, false);
    item.querySelector(".acc-head").setAttribute("aria-expanded", "false");
    openIndex = -1;
    if (body) {
      const from = body.getBoundingClientRect().height;
      if (body.animate && from > 0) {
        const a = body.animate([{ height: from + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
                               { duration: SHUT_MS, easing: EASE });
        a.onfinish = a.oncancel = function () { body.remove(); };
        setTimeout(function () { if (body.isConnected) body.remove(); }, SHUT_MS + 150);
      } else { body.remove(); }
    }
    if (rule) {
      if (rule.animate) {
        const a = rule.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
                               { duration: SHUT_MS, easing: EASE });
        a.onfinish = a.oncancel = function () { rule.remove(); };
        setTimeout(function () { if (rule.isConnected) rule.remove(); }, SHUT_MS + 150);
      } else { rule.remove(); }
    }
  }

  function open(i) {
    const item = acc.children[i];
    const rule = document.createElement("i");
    rule.className = "acc-rule";
    rule.setAttribute("aria-hidden", "true");
    item.insertBefore(rule, item.firstChild);
    const body = document.createElement("div");
    body.className = "acc-body";
    body.innerHTML = "<p>" + copy[i] + "</p>";
    item.appendChild(body);
    item.classList.add("is-open");
    setIcon(item, i, true);
    item.querySelector(".acc-head").setAttribute("aria-expanded", "true");
    openIndex = i;

    if (body.animate) {
      const h = body.getBoundingClientRect().height;
      const grow = body.animate(
        [{ height: "0px", opacity: 0, transform: "translateY(-5px)" },
         { height: h + "px", opacity: 1, transform: "none" }],
        { duration: OPEN_MS, easing: EASE });
      const bar = rule.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
                               { duration: OPEN_MS, easing: EASE });
      /* The copy matters more than the easing: if the animation has not run by
         the time it should have finished, it is cancelled so the row falls back
         to its natural height rather than sitting collapsed. */
      setTimeout(function () {
        if (!item.classList.contains("is-open")) return;
        if (body.getBoundingClientRect().height < 4) {
          try { grow.cancel(); bar.cancel(); } catch (e) {}
        }
      }, OPEN_MS + 120);
    }
  }

  function build() {
    if (acc) return;
    acc = document.createElement("div");
    acc.className = opts.className;
    heads.forEach(function (h, i) {
      const item = document.createElement("div");
      item.className = "acc-item";
      item.innerHTML =
        '<button class="acc-head" aria-expanded="false">' +
          '<span class="ic">' + opts.icons[i] + "</span>" +
          '<span class="ttl">' + h + "</span></button>";
      acc.appendChild(item);
    });
    const host = opts.mount ? document.querySelector(opts.mount) : list.parentElement;
    const before = opts.before ? host.querySelector(opts.before) : null;
    /* copy before media, as everywhere else on the phone */
    if (before) host.insertBefore(acc, before); else host.appendChild(acc);
    open(0);
    list.style.display = "none";
  }

  function tear() {
    if (acc) { acc.remove(); acc = null; openIndex = -1; }
    list.style.display = "";
  }

  document.addEventListener("click", function (e) {
    if (!acc || !e.target.closest) return;
    const head = e.target.closest("." + opts.className + " .acc-head");
    if (!head || !acc.contains(head)) return;
    const i = [].indexOf.call(acc.children, head.parentElement);
    const wasOpen = i === openIndex;
    close(openIndex);
    if (!wasOpen) open(i);
  });

  function sync() { ON_PHONE.matches ? build() : tear(); }
  sync();
  ON_PHONE.addEventListener("change", sync);
  return { sync: sync };
}

/* Bind the last two words, and hold hyphenated pairs together, so no line ends
   on a single word and "off-grid" does not split at its own hyphen. */
function noOrphan(t) {
  return t.replace(/(\w)-(\w)/g, "$1\u2011$2").replace(/\s+([^\s]+)\s*$/, "\u00A0$1");
}

const COMPASS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/></svg>';
const SHIELD  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.2 2.7v6c0 4.2-3 7.5-7.2 9.3-4.2-1.8-7.2-5.1-7.2-9.3v-6z"/><path d="M9 12l2.1 2.1L15.3 10"/></svg>';
const LOUNGE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5V8.2a2 2 0 012-2h12a2 2 0 012 2v3.3"/><path d="M3 11.5h18v5.2H3z"/><path d="M6 16.7v1.9M18 16.7v1.9"/><path d="M7.5 6.2v-1h9v1"/></svg>';

/* the four in Why choose us keep the marks the desktop already draws */
const WHY_ICONS = [].map.call(document.querySelectorAll(".why-list .why-icon"),
                              function (s) { return s.innerHTML; });

phoneAccordion({ list: ".dream-points", head: "h3", copy: "p",
                 className: "dream-acc", icons: [COMPASS, SHIELD, LOUNGE] });

phoneAccordion({ list: ".why-list", head: "h3", copy: "p",
                 className: "why-acc", mount: ".why-grid", before: ".why-figure",
                 icons: WHY_ICONS });

/* ---------------------------------------------- Our range, on a phone -----
   The desktop shows one baked PNG of all four models. At phone width that
   renders at a third scale, which puts its names under the legibility floor
   and leaves its chevrons as pixels rather than links. Here the four become
   real cards on a horizontal scroll, with the same snap, peek, dots and
   counter as the slideshow above, so the page has one gesture.

   Built here rather than in the markup so the desktop DOM is untouched: on a
   wide screen none of this exists.                                        */
(function () {
  const figure = document.querySelector(".range-figure");
  if (!figure) return;

  const MODELS = [
    ["solara", "SOLARA", "Composite off-road", "https://wonderlandrv.com.au/range/solara/"],
    ["xtr",    "XTR",    "Extreme off-road",   "https://wonderlandrv.com.au/range/xtr/"],
    ["hornet", "HORNET", "Rugged off-road",    "https://wonderlandrv.com.au/range/hornet/"],
    ["amaroo", "AMAROO", "Classic off-road",   "https://wonderlandrv.com.au/range/amaroo/"]
  ];

  let scroll = null, rail = null, poll, last = -1;

  function build() {
    if (scroll) return;
    scroll = document.createElement("div");
    scroll.className = "range-scroll";
    /* The set is laid down twice. The scroller runs on past Amaroo into a copy
       of the same four, and once a whole set has gone by the scroll position is
       moved back by exactly one set width -- at an identical snap point, so the
       jump is invisible and the track never ends. */
    function card(m, clone) {
      const a = document.createElement("a");
      a.className = "range-card";
      a.href = m[3];
      if (clone) a.setAttribute("aria-hidden", "true");
      a.innerHTML =
        '<div class="shot"><img src="assets/img/home/range/' + m[0] + '.png" alt=""></div>' +
        "<h3>" + m[1] + "</h3><p>" + m[2] + "</p>";
      return a;
    }
    MODELS.forEach(function (m) { scroll.appendChild(card(m, false)); });
    MODELS.forEach(function (m) { scroll.appendChild(card(m, true)); });

    rail = document.createElement("div");
    rail.className = "range-rail";
    MODELS.forEach(function (_, i) {
      const d = document.createElement("span");
      d.className = "range-dot" + (i ? "" : " is-on");
      rail.appendChild(d);
    });
    const count = document.createElement("span");
    count.className = "range-count";
    count.textContent = "1 / " + MODELS.length;
    rail.appendChild(count);

    figure.parentElement.appendChild(scroll);
    figure.parentElement.appendChild(rail);
    last = -1;
    poll = setInterval(onScroll, 150);
  }

  function tear() {
    if (!scroll) return;
    clearInterval(poll);
    scroll.remove(); rail.remove();
    scroll = rail = null;
  }

  /* Polled, not driven by the scroll event: during iOS momentum the event is
     sparse, and in a throttled tab it does not arrive at all. */
  function onScroll() {
    if (!scroll || scroll.scrollLeft === last) return;
    const cards = scroll.querySelectorAll(".range-card");
    const dots = rail.querySelectorAll(".range-dot");

    /* wrap: once a full set has passed, step back one set and carry on */
    const setW = cards[dots.length] ? cards[dots.length].offsetLeft - cards[0].offsetLeft : 0;
    if (setW > 0 && scroll.scrollLeft >= setW) {   /* a whole set has gone by */
      scroll.scrollLeft = scroll.scrollLeft - setW;
    }
    last = scroll.scrollLeft;
    /* Whichever card is nearest the middle of the viewport, not nearest its
       left edge. The last card can never reach the left edge -- the scroller
       runs out of travel first -- so an edge test can never select it. */
    const mid = scroll.scrollLeft + scroll.clientWidth / 2;
    let i = 0, best = Infinity;
    cards.forEach(function (c, k) {
      const centre = c.offsetLeft - scroll.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(centre - mid);
      if (d < best) { best = d; i = k; }
    });
    i = i % dots.length;            /* a clone reports as its original */
    dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
    rail.querySelector(".range-count").textContent = (i + 1) + " / " + dots.length;   /* not the clones */
  }

  function sync() { ON_PHONE.matches ? build() : tear(); }
  sync();
  ON_PHONE.addEventListener("change", sync);
})();

/* ------------------------------------ the slideshow's phone affordances ---
   On a phone the slideshow becomes a scroller the finger drags, which gives
   no clue that there is more than one photo. Dots and a counter say so, and
   follow the scroll rather than driving it.

   Built here rather than in the markup so the desktop DOM is untouched: on a
   wide screen this never runs and the elements do not exist.              */
(function () {
  const media = document.getElementById("pullSlides");
  if (!media) return;
  let rail = null;

  function build() {
    const slides = media.querySelectorAll(".pull-slide");
    if (rail || slides.length < 2) return;
    rail = document.createElement("div");
    rail.className = "pull-rail";
    slides.forEach(function (_, i) {
      const d = document.createElement("span");
      d.className = "pull-dot" + (i ? "" : " is-on");
      rail.appendChild(d);
    });
    const count = document.createElement("span");
    count.className = "pull-count";
    count.textContent = "1 / " + slides.length;
    rail.appendChild(count);
    media.parentElement.appendChild(rail);
    /* Polled rather than driven by the scroll event: during iOS momentum the
       event is sparse, and in a throttled tab it does not arrive at all.
       Reading scrollLeft is cheap and always tells the truth. */
    last = -1;
    poll = setInterval(onScroll, 150);
  }

  function tear() {
    if (!rail) return;
    clearInterval(poll);
    rail.remove();
    rail = null;
  }

  let poll, last = -1;
  function onScroll() {
    if (!rail || media.scrollLeft === last) return;
    last = media.scrollLeft;
    (function () {
      const dots = rail.querySelectorAll(".pull-dot");
      /* Measured off the slides rather than worked out from the container:
         clientWidth includes the scroller's own padding, so arithmetic on it
         drifts and the dots stop matching what is on screen. */
      const slides = media.querySelectorAll(".pull-slide");
      const mid = media.scrollLeft + media.clientWidth / 2;
      let i = 0, best = Infinity;
      slides.forEach(function (sl, k) {
        const centre = sl.offsetLeft - media.offsetLeft + sl.offsetWidth / 2;
        const d = Math.abs(centre - mid);
        if (d < best) { best = d; i = k; }
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
      rail.querySelector(".pull-count").textContent = (i + 1) + " / " + dots.length;
    })();
  }

  function sync() { ON_PHONE.matches ? build() : tear(); }

  /* the slides are created by the slideshow script, so wait for them */
  const wait = setInterval(function () {
    if (media.querySelector(".pull-slide")) { clearInterval(wait); sync(); }
  }, 120);
  setTimeout(function () { clearInterval(wait); }, 6000);
  ON_PHONE.addEventListener("change", sync);
})();

(function () {
  const track = document.getElementById("cotyTrack");
  if (!track) return;
  const slides = [].slice.call(track.children);
  const n = slides.length;
  if (!n) return;

  slides.forEach(function (sl, i) {
    mountVideo(sl.querySelector(".coty-figure"), COTY_VIDEOS[i] || "",
               "Wonderland RV — feature " + (i + 1), { captions: true, nudge: true });
  });

  const EASE = "transform .9s cubic-bezier(.45, .05, .15, 1)";
  let i = 0, busy = false;

  function show(animate) {
    track.style.transition = animate ? EASE : "none";
    track.style.transform = "translateX(" + (-i * 100) + "%)";
  }

  /* One video runs at a time: the slide you are on plays from where it left
     off, every other slide stops. Players arrive asynchronously, so this also
     runs whenever one announces itself. */
  function syncPlayback() {
    slides.forEach(function (sl, k) {
      const p = (sl.querySelector(".coty-figure") || {}).ytPlayer;
      if (!p) return;
      try { if (k === i) p.playVideo(); else p.pauseVideo(); } catch (e) {}
    });
  }
  track.addEventListener("yt-ready", syncPlayback);

  function go(dir) {
    if (busy || n < 2) return;
    busy = true;
    i = (i + dir + n) % n;
    show(true);
    syncPlayback();
    setTimeout(function () { busy = false; }, 900);
  }

  const viewport = track.parentElement;

  /* ------------------------------------------------- the phone deck (R1) ---
     Swiped rather than driven. The heading and subheading are lifted out of
     the slides into a block above the deck, and a dot rail goes underneath.

     The live slide is the one whose centre sits nearest the viewport's centre,
     and both are read off getBoundingClientRect. The earlier version compared
     offsetLeft against scrollLeft -- offsetLeft is measured from the element's
     offsetParent, scrollLeft from inside the scroller, so the two differ by
     however far the scroller sits down the page and the dots were wrong by a
     constant. Rects are in one frame, so there is nothing to reconcile.

     Polled rather than listened for: scroll events are not dependable. */
  function phoneDeck() {
    const shell = viewport.parentElement;
    if (!shell || shell.querySelector(".coty-head")) return;

    const head = document.createElement("div");
    head.className = "coty-head";
    const caps = slides.map(function (sl, k) {
      const cap = document.createElement("div");
      cap.className = "coty-cap" + (k ? "" : " is-on");
      const t = sl.querySelector(".coty-title"), s = sl.querySelector(".coty-sub");
      if (t) cap.appendChild(t.cloneNode(true));
      if (s) cap.appendChild(s.cloneNode(true));
      head.appendChild(cap);
      return cap;
    });
    shell.insertBefore(head, viewport);

    const rail = document.createElement("div");
    rail.className = "coty-rail";
    const dots = slides.map(function (_, k) {
      const d = document.createElement("span");
      d.className = "coty-dot" + (k ? "" : " is-on");
      rail.appendChild(d);
      return d;
    });
    const count = document.createElement("span");
    count.className = "coty-count";
    count.textContent = "01 / " + String(n).padStart(2, "0");
    rail.appendChild(count);
    shell.insertBefore(rail, viewport.nextSibling);

    let last = 0;
    setInterval(function () {
      const box = viewport.getBoundingClientRect();
      if (!box.width) return;                 // pane collapsed; measure nothing
      const mid = box.left + box.width / 2;
      let best = 0, gap = Infinity;
      for (let k = 0; k < n; k++) {
        const b = slides[k].getBoundingClientRect();
        const d = Math.abs(b.left + b.width / 2 - mid);
        if (d < gap) { gap = d; best = k; }
      }
      if (best === last) return;
      caps[last].classList.remove("is-on"); caps[best].classList.add("is-on");
      dots[last].classList.remove("is-on"); dots[best].classList.add("is-on");
      count.textContent = String(best + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
      last = best;
      i = best;                               // whichever slide you are on plays
      syncPlayback();
    }, 150);
  }

  if (ON_PHONE.matches) phoneDeck();

  const prev = document.querySelector(".coty-arrow--prev");
  const next = document.querySelector(".coty-arrow--next");
  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });

  show(false);
  window.addEventListener("resize", function () { show(false); });
})();

/* ------------------------------------------ your dream van awaits: rail ---
   On a phone the four tiles become a slideshow that runs on its own. The set is
   laid down three times and the rail moves a whole set width whenever it
   crosses one -- the pixels either side of that seam are identical, so it never
   reaches an end and never rewinds.

   It is a real scroller rather than a transform track, so a finger can take it
   over; touching it stops the timer and it starts again once the finger is off.
*/
(function () {
  if (!ON_PHONE.matches) return;
  const mosaic = document.querySelector(".dream-mosaic");
  if (!mosaic || mosaic.dataset.rail) return;

  const shots = [].slice.call(mosaic.querySelectorAll(".dream-shot"));
  const N = shots.length;
  if (N < 2) return;

  /* SETTLE is only long enough for the snap to land after a finger leaves --
     the dwell then starts from zero, so a swipe resets the countdown rather
     than dropping the reader into the middle of one. */
  const SETS = 3, DWELL = 3400, TRAVEL = 620, SETTLE = 450;

  const rail = document.createElement("div");
  rail.className = "dream-rail";
  for (let s = 0; s < SETS; s++) {
    shots.forEach(function (shot) {
      const img = shot.querySelector("img");
      if (!img) return;
      const slide = document.createElement("div");
      slide.className = "dream-slide";
      const frame = document.createElement("div");
      frame.className = "dream-frame";
      const copy = document.createElement("img");
      copy.src = img.getAttribute("src");
      copy.alt = "";
      frame.appendChild(copy);
      slide.appendChild(frame);
      rail.appendChild(slide);
    });
  }
  const cta = mosaic.querySelector(".dream-quote");
  mosaic.insertBefore(rail, cta || null);
  mosaic.dataset.rail = "1";

  const slides = [].slice.call(rail.children);
  if (!slides.length) return;

  /* the slide takes 74% of the rail, so 13% of each neighbour shows */
  function measure() {
    const w = rail.clientWidth;
    rail.style.setProperty("--dream-slide", Math.round(w * 0.74) + "px");
    rail.style.paddingLeft = Math.round(w * 0.13) + "px";
    rail.style.paddingRight = Math.round(w * 0.13) + "px";
  }
  /* offsetWidth, not a rect: the side slides carry a scale and a rect reports
     the TRANSFORMED box, which makes every step land short of centre. */
  function pitch() { return slides[0].offsetWidth + 10; }
  function setWidth() { return pitch() * N; }

  let index = N;                       // start in the middle set
  let raf = null, timer = null, idle = null;
  let gliding = false, glideAt = 0;    // the timer owns the rail while true

  /* The live slide is arithmetic, not a measurement. It used to read a rect off
     all twelve slides on every animation frame -- twelve forced layouts a frame
     -- which is what made the movement judder. The slides are a uniform pitch,
     so rounding the scroll position gives the same answer for nothing, and the
     classes are only touched when the answer changes. */
  let lastOn = -1;
  function paint(force) {
    const i = Math.round(rail.scrollLeft / pitch());
    if (i === lastOn && !force) return;
    lastOn = i;
    slides.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
  }

  /* while(), not if(): a flung finger can overshoot a whole set, and one
     subtraction would leave it stranded outside the middle set. */
  function wrap() {
    const W = setWidth();
    while (rail.scrollLeft >= W * 2 - 1) { rail.scrollLeft -= W; index -= N; }
    while (rail.scrollLeft < W - 1) { rail.scrollLeft += W; index += N; }
    paint(true);
  }

  /* scrollLeft is animated by hand rather than with scrollTo({behavior:"smooth"}),
     which cannot be timed and cannot be interrupted cleanly. Eased in and out,
     matching the curve the review slider and the enquiry pill already use. */
  function glide(to) {
    cancelAnimationFrame(raf);
    gliding = true; glideAt = performance.now();
    const from = rail.scrollLeft, delta = to - from, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / TRAVEL);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      rail.scrollLeft = from + delta * e;
      paint();
      if (p < 1) { raf = requestAnimationFrame(step); }
      else { gliding = false; wrap(); }
    })(performance.now());
  }

  function play() {
    clearInterval(timer);
    timer = setInterval(function () { index++; glide(index * pitch()); }, DWELL);
  }
  function pause() { clearInterval(timer); cancelAnimationFrame(raf); gliding = false; }

  rail.addEventListener("pointerdown", function () {
    pause(); clearTimeout(idle);
    rail.classList.add("is-touch");   // snap belongs to the finger, not the timer
  });
  rail.addEventListener("pointerup", function () {
    clearTimeout(idle);
    idle = setTimeout(function () {
      rail.classList.remove("is-touch");
      index = Math.round(rail.scrollLeft / pitch());
      wrap(); play();                 // play() clears and restarts: dwell from 0
    }, SETTLE);
  });
  window.addEventListener("resize", function () {
    measure(); rail.scrollLeft = index * pitch(); paint();
  });

  measure();
  rail.scrollLeft = index * pitch();
  paint(true);
  /* The poll wraps as well as reading. wrap() used to run only at the end of a
     glide and after the finger settled, so a free swipe had nothing keeping it
     inside the middle set: fling hard enough and the rail reached the twelfth
     slide and stopped. Held here on every tick the timer is not driving, which
     also keeps index in step with wherever a finger has left the rail. */
  setInterval(function () {
    /* requestAnimationFrame is throttled in a background tab, so a glide begun
       before the reader scrolled away can leave `gliding` stuck true -- and the
       wrap below would then never run again, which is the very thing that
       stranded the rail at its last slide. A glide cannot outlast its own
       duration, so anything older than that is written off. */
    if (gliding && performance.now() - glideAt > TRAVEL + 300) {
      gliding = false;
      cancelAnimationFrame(raf);
    }
    if (!gliding) {
      const p = pitch();
      if (p > 0) index = Math.round(rail.scrollLeft / p);
      wrap();
    }
    paint();
  }, 200);
  play();
})();
