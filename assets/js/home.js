/* ==========================================================================
   Homepage behaviour.

   PASTE THE TWO VIDEO LINKS BELOW. Same rules as the Contact page: a YouTube
   link, a Vimeo link, a direct .mp4/.webm, or a local file path. Leave a
   string empty and its labelled placeholder stays in place.
   ========================================================================== */

const HERO_VIDEO_URL   = "https://youtu.be/mZVHIMStpF4";   // full-bleed clip behind "Adventure your way"
const SOLARA_VIDEO_URL = "";     // clip in the Welcome Solara section

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

/* -------------------------------------- Luxury section: page-turn slides ---
   Loads assets/img/home/slide-1.jpg … slide-6.jpg, keeping whichever exist,
   and turns them like pages. Add or remove files; nothing here changes.   */
(function () {
  const box = document.getElementById("pullSlides");
  if (!box) return;

  const MAX = 6, HOLD = 5000;
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
      slides[next].classList.add("is-current");
      slides[cur].classList.remove("is-current");
      slides[cur].classList.add("is-leaving");
      void slides[cur].offsetWidth;
      slides[cur].classList.remove("is-leaving");   // turns away on its left edge
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
