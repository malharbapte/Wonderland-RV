/* ==========================================================================
   Homepage behaviour.

   PASTE THE TWO VIDEO LINKS BELOW. Same rules as the Contact page: a YouTube
   link, a Vimeo link, a direct .mp4/.webm, or a local file path. Leave a
   string empty and its labelled placeholder stays in place.
   ========================================================================== */

const HERO_VIDEO_URL   = "https://youtu.be/mZVHIMStpF4";   // full-bleed clip behind "Adventure your way"
const SOLARA_VIDEO_URL = "https://youtu.be/HNcrbrGzMh0";   // clip in the Welcome Solara section

/* Queen of Hearts — five slots, in slide order. Same link rules as above. */
const COTY_VIDEOS = ["", "https://youtu.be/thFwJAod6Ng", ""];

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
        onReady: function () { player.mute(); killCaptions(); },
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
      const onScreen = r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15;
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

/* ------------------------------------------ Queen of Hearts: video slider --
   Heading, subheading and video sit on one slide, so they change together.
   Loops in both directions without a visible rewind.                      */
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
  function go(dir) {
    if (busy || n < 2) return;
    busy = true;
    i = (i + dir + n) % n;
    show(true);
    setTimeout(function () { busy = false; }, 900);
  }
  const prev = document.querySelector(".coty-arrow--prev");
  const next = document.querySelector(".coty-arrow--next");
  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });

  show(false);
  window.addEventListener("resize", function () { show(false); });
})();
