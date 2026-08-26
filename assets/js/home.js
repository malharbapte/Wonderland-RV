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

/* -------------------------------------------------------------------------- */

let ytSeq = 0;

function mountVideo(frame, url, title, opts) {
  if (!frame || !url) return;
  url = url.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (yt) {
    node = document.createElement("iframe");
    node.id = "yt-" + (++ytSeq);
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1" +
      "&cc_load_policy=0&cc_lang_pref=en&iv_load_policy=3&enablejsapi=1&playlist=" + yt[1];
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
  return (node.id && opts) ? buildControls(frame, node.id, opts) : node;
}

/* ------------------------------------------- sound + caption controls -----
   A bare embed gives the viewer no way to turn sound or subtitles on, so the
   player is attached to the YouTube IFrame API. Both start OFF — sound because
   browsers refuse to autoplay otherwise, captions because they are meant to be
   opt-in — and neither turns on until the viewer clicks.

   opts.nudge asks for the "Tap for sound" prompt: it appears three seconds
   after the video has been on screen, and only while it is still muted.     */
function buildControls(frame, iframeId, opts) {
  opts = opts || {};

  const SPEAKER_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';
  const SPEAKER_ON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

  const bar = document.createElement("div");
  bar.className = "video-controls";

  const sound = document.createElement("button");
  sound.type = "button";
  sound.className = "video-ctl";
  sound.innerHTML = SPEAKER_OFF;
  sound.setAttribute("aria-label", "Unmute");
  sound.setAttribute("aria-pressed", "false");
  bar.appendChild(sound);

  let cc = null;
  if (opts.captions) {
    cc = document.createElement("button");
    cc.type = "button";
    cc.className = "video-ctl";
    cc.textContent = "CC";
    cc.setAttribute("aria-label", "Show captions");
    cc.setAttribute("aria-pressed", "false");
    bar.appendChild(cc);
  }
  frame.appendChild(bar);

  let nudge = null;
  if (opts.nudge) {
    nudge = document.createElement("div");
    nudge.className = "video-nudge";
    nudge.textContent = "Tap for sound";
    nudge.setAttribute("aria-hidden", "true");
    frame.appendChild(nudge);
  }

  let player = null, muted = true, captions = false;

  function killCaptions() {
    if (!player) return;
    try { player.unloadModule("captions"); player.unloadModule("cc"); } catch (e) {}
  }

  withYouTubeApi(function () {
    player = new YT.Player(iframeId, {
      events: {
        onReady: function () {
          player.mute();
          killCaptions();
          /* Handed to whoever owns the frame — the slider needs it to stop a
             player that has scrolled out of the deck. */
          frame.ytPlayer = player;
          frame.dispatchEvent(new CustomEvent("yt-ready", { bubbles: true }));
        },
        /* The captions module can load itself once playback starts, so it is
           turned off again on the first PLAYING rather than only on ready. */
        onStateChange: function (e) { if (e.data === 1 && !captions) killCaptions(); }
      }
    });
  });

  function setMuted(next) {
    muted = next;
    if (!player) return;
    if (muted) player.mute(); else { player.unMute(); player.setVolume(100); }
    sound.innerHTML = muted ? SPEAKER_OFF : SPEAKER_ON;
    sound.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    sound.setAttribute("aria-pressed", String(!muted));
    if (nudge && !muted) nudge.classList.remove("is-on");
  }

  sound.addEventListener("click", function () { setMuted(!muted); });

  if (cc) {
    cc.addEventListener("click", function () {
      if (!player) return;
      captions = !captions;
      try {
        if (captions) {
          player.loadModule("captions");
          player.loadModule("cc");
          player.setOption("captions", "track", { languageCode: "en" });
        } else { killCaptions(); }
      } catch (e) {}
      cc.setAttribute("aria-label", captions ? "Hide captions" : "Show captions");
      cc.setAttribute("aria-pressed", String(captions));
    });
  }

  /* Three seconds after the frame comes into view, offer the sound. Polled on
     an interval rather than an IntersectionObserver, which does not fire in a
     throttled or backgrounded pane. */
  if (nudge) {
    let seen = 0, shown = false;
    const tick = setInterval(function () {
      const r = frame.getBoundingClientRect();
      /* Horizontal as well as vertical: a slide parked off to the side of the
         deck is still at the right height, and would otherwise prompt. */
      const onScreen = r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15 &&
                       r.left < innerWidth * 0.95 && r.right > innerWidth * 0.05;
      seen = onScreen ? seen + 1 : 0;
      if (!shown && seen >= 6 && muted) {          // 6 x 500ms
        shown = true;
        nudge.classList.add("is-on");
        setTimeout(function () { nudge.classList.remove("is-on"); }, 6000);
      }
      if (shown && !muted) { nudge.classList.remove("is-on"); clearInterval(tick); }
    }, 500);
    nudge.addEventListener("click", function () { setMuted(false); });
  }

  return { unmute: function () { setMuted(false); }, isMuted: function () { return muted; } };
}

function withYouTubeApi(done) {
  if (window.YT && window.YT.Player) return done();
  if (!document.getElementById("ytApi")) {
    const tag = document.createElement("script");
    tag.id = "ytApi";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () { if (prev) prev(); done(); };
}

/* The hero carries sound. No browser will autoplay audible, so it starts muted
   with a working control and prompts for the click that turns it up. */
mountVideo(document.querySelector(".home-hero-media"), HERO_VIDEO_URL,
  "Wonderland RV — adventure your way", { nudge: true });
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
