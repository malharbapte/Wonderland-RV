/* ==========================================================================
   "Things you can't see" — video section
   --------------------------------------------------------------------------
   PASTE THE VIDEO LINK BELOW. That is the only line you need to change.

   Accepts:
     • a YouTube link   https://www.youtube.com/watch?v=XXXX  |  https://youtu.be/XXXX
     • a Vimeo link     https://vimeo.com/123456789
     • a direct file    https://.../clip.mp4  (also .webm, .mov)
     • a local file     assets/video/clip.mp4

   Leave it as "" and the labelled placeholder stays in place.
   ========================================================================== */

const VIDEO_URL = "https://www.youtube.com/watch?v=thFwJAod6Ng";

/* -------------------------------------------------------------------------- */

(function () {
  const frame = document.querySelector(".video-frame");
  if (!frame || !VIDEO_URL) return;

  const url = VIDEO_URL.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (yt) {
    node = document.createElement("iframe");
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=" + yt[1];
    node.allow = "autoplay; encrypted-media; picture-in-picture";
    node.allowFullscreen = true;
    node.title = "Wonderland RV — things you can't see";
  } else if (vimeo) {
    node = document.createElement("iframe");
    node.src = "https://player.vimeo.com/video/" + vimeo[1] +
      "?autoplay=1&muted=1&loop=1&background=1";
    node.allow = "autoplay; fullscreen; picture-in-picture";
    node.allowFullscreen = true;
    node.title = "Wonderland RV — things you can't see";
  } else {
    node = document.createElement("video");
    node.src = url;
    node.autoplay = true;
    node.muted = true;
    node.loop = true;
    node.playsInline = true;
    node.setAttribute("playsinline", "");
    node.controls = false;
    const poster = frame.querySelector(".video-poster");
    if (poster && poster.getAttribute("src")) node.poster = poster.getAttribute("src");
  }

  frame.classList.remove("ph");
  frame.removeAttribute("data-ph");
  frame.appendChild(node);
})();

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

/* ------------------------------------- State: chevron follows the value ---
   The artboard sits the arrow immediately after the word "State". A longer
   value like "Australian Capital Territory" would run underneath a fixed
   arrow, so it is measured and re-placed on every change.               */
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
    const chevW = chev.getBoundingClientRect().width;   /* SVG has no offsetWidth */
    const limit = sel.offsetWidth - (parseFloat(cs.paddingRight) || 0) - chevW;
    chev.style.left = Math.min(padL + textW + gap, Math.max(padL, limit)) + "px";
  }

  place();
  sel.addEventListener("change", place);
  window.addEventListener("resize", place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* --------------------------------- enquiry-type pill: gliding indicator ---
   The thumb travels on a transform so the browser composites it rather than
   re-laying out every frame. It contracts while in motion and swells back as
   it lands, which is what gives the movement its fluid feel.              */
(function () {
  const chips = document.querySelector(".chips");
  const thumb = chips && chips.querySelector(".chips-thumb");
  if (!chips || !thumb) return;

  const SQUASH = "scale(0.955, 0.78)";   // contraction while travelling
  const SETTLE = 250;                    // ms before it starts swelling back
  let timer, x = 0;

  function measure() {
    const checked = chips.querySelector('input[type="radio"]:checked');
    if (!checked) return null;
    const span = checked.parentElement.querySelector("span");
    if (!span) return null;
    const cb = chips.getBoundingClientRect();
    const sb = span.getBoundingClientRect();
    return { x: sb.left - cb.left - chips.clientLeft, w: sb.width };
  }

  function apply(squashed) {
    thumb.style.transform = "translateX(" + x + "px)" + (squashed ? " " + SQUASH : "");
  }

  function place(squashed) {
    const m = measure();
    if (!m) return;
    x = m.x;
    thumb.style.width = m.w + "px";
    apply(squashed);
  }

  function enable() {
    void thumb.offsetWidth;            // flush styles; rAF never fires in a
    thumb.classList.remove("is-init"); // background tab, so don't rely on it
  }

  place(false);
  enable();

  chips.addEventListener("change", function (e) {
    if (!e.target.matches('input[type="radio"]')) return;
    place(true);
    clearTimeout(timer);
    timer = setTimeout(function () { apply(false); }, SETTLE);
  });

  function reflow() {
    thumb.classList.add("is-init");
    place(false);
    enable();
  }
  window.addEventListener("resize", reflow);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reflow);
})();
