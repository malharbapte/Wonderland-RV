/* ===========================================================================
   The Wonderlander strip -- an endless rail of cards.

   Lifted verbatim out of ambassador.js so the homepage can run it without
   also loading that file's lightbox, spec table and tips mosaic. The
   Wonderlander pages should be moved onto this copy when they are next
   touched, so the two cannot drift apart.
   =========================================================================== */
/* ------------------------------------------------- meet more: endless rail --
   The strip is a native overflow scroller, so it stopped dead at the last
   Wonderlander. Same idea reviews.js uses for the review slider — park clones
   either side of the real set and step back into it, out of sight — but
   applied to scrollLeft rather than a transform, so the finger, the trackpad
   and the scrollbar all still drive it.

   Three sets sit in the rail: clones, the real cards, clones. It rests on the
   middle one, and whenever a scroll carries past a set boundary the position
   jumps back by exactly one set width. That lands on the identical card, so
   nothing moves on screen and the rail never reaches an end in either
   direction. The clones are hidden from assistive tech and taken out of the
   tab order — only the real five are reachable. */
(function () {
  var strip = document.querySelector(".amb-more-strip");
  if (!strip) return;
  var real = [].slice.call(strip.children);
  if (real.length < 2) return;
  /* Phones and tablets (Piyush, 21 Oct 2026): a plain finger-scroll row of
     the real cards. No drift, no endless loop and no clones there: the wrap
     jump fights momentum swiping and read as the strip "acting weird". The
     drifting endless rail is for desktops with a real mouse only. */
  if (!window.matchMedia("(min-width: 1025px) and (hover: hover)").matches) return;

  function cloneSet(where) {
    real.forEach(function (card) {
      var c = card.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.classList.add("is-clone");
      /* The card is a div now, not the link — so the things that can actually
         take focus are the name and the chevron inside it. */
      [].slice.call(c.querySelectorAll("a, button")).forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      /* Each "before" clone goes in ahead of the first REAL card, not the
         strip's first child, so the set keeps its order. Prepending at
         firstChild reversed it, which put the last clone (the first card)
         right next to the real first card: the same Wonderlander twice. */
      if (where === "before") strip.insertBefore(c, real[0]);
      else strip.appendChild(c);
    });
  }
  cloneSet("after");
  cloneSet("before");

  /* All cards sit in one inner track so the slow drift can move it with a
     transform (sub-pixel, composited, perfectly smooth) instead of stepping
     scrollLeft, which the browser rounds to whole pixels and judders at slow
     speed. The track inherits the rail's gap, so the layout is unchanged. */
  var track = document.createElement("div");
  track.className = "amb-more-track";
  track.style.cssText = "display:flex;gap:inherit;flex:0 0 auto;will-change:transform;backface-visibility:hidden";
  while (strip.firstChild) track.appendChild(strip.firstChild);
  strip.appendChild(track);

  var n = real.length;
  function setWidth() {
    // measured, not assumed, so the gap and any resize come along for free
    return track.children[n].offsetLeft - track.children[0].offsetLeft;
  }

  var w = 0, ready = false;
  function rest() {
    w = setWidth();
    if (!w) return;
    strip.style.scrollBehavior = "auto";
    strip.scrollLeft = w;      // start on the real set, a full set either side
    ready = true;
  }

  /* Deliberately not rAF-throttled. rAF never fires in a background tab
     (HANDOFF sec 9), and setting scrollLeft here fires another scroll event,
     so the guard flag is what stops it re-entering — not a frame callback. */
  var wrapping = false;
  strip.addEventListener("scroll", function () {
    if (!ready || wrapping) return;
    if (strip.scrollLeft >= w * 2 || strip.scrollLeft <= 0) {
      wrapping = true;
      strip.scrollLeft += (strip.scrollLeft <= 0) ? w : -w;
      wrapping = false;
    }
  });

  var tx = 0;   // drift offset applied as a transform (see below)
  window.addEventListener("resize", function () {
    ready = false;
    tx = 0; track.style.transform = "";
    rest();
  });

  /* Images decide the card heights, so measure once they are in. */
  if (document.readyState === "complete") rest();
  else window.addEventListener("load", rest);
  rest();

  /* ---- constant drift (Piyush, 21 Oct 2026): the rail moves slowly and
     continuously, eases to a stop while the pointer is over it (or a card has
     keyboard focus) and eases back up when it leaves. Movement is a transform
     on the track; a touch, drag or wheel folds that offset back into the
     native scroll position and hands control to the visitor for 6s. Still off
     screen, in a hidden tab and for reduced motion. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hover = false, focused = false, heldUntil = 0, last = 0;
  var v = window.innerWidth <= 900 ? 16 : 24;   // start at cruising speed, no ramp from zero
  function setTx() { track.style.transform = tx ? "translate3d(" + (-tx).toFixed(2) + "px,0,0)" : ""; }
  function normalise() {
    if (strip.scrollLeft >= w * 2) { wrapping = true; strip.scrollLeft -= w; wrapping = false; }
    else if (strip.scrollLeft <= 0) { wrapping = true; strip.scrollLeft += w; wrapping = false; }
  }
  function fold() {              // hand the drift offset back to the native scroller
    if (!tx) return;
    wrapping = true; strip.scrollLeft += tx; wrapping = false;
    tx = 0; setTx(); normalise();
  }
  strip.addEventListener("mouseenter", function () { hover = true; });
  strip.addEventListener("mouseleave", function () { hover = false; });
  strip.addEventListener("focusin", function () { focused = true; fold(); });
  strip.addEventListener("focusout", function () { focused = false; });
  ["pointerdown", "touchstart", "wheel"].forEach(function (ev) {
    strip.addEventListener(ev, function () { fold(); v = 0; heldUntil = Date.now() + 6000; }, { passive: true });
  });
  function onScreen() {
    var r = strip.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  }
  function speed() { return window.innerWidth <= 900 ? 16 : 24; }   // px per second
  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (ready && w && !document.hidden) {   // runs from page load, so it is already drifting when the visitor reaches it
      var held = hover || focused || Date.now() < heldUntil;
      var target = held ? 0 : speed();
      // settle fast when the pointer arrives (the card under it must not slide
      // away), pick up slowly and softly when it leaves
      var k = target < v ? 7 : 0.9;
      v += (target - v) * Math.min(1, dt * k);
      if (v < 0.3 && held) v = 0;
      var moving = v > 0.3;
      if (moving !== strip.classList.contains("is-moving")) strip.classList.toggle("is-moving", moving);
      if (v) {
        var cw = strip.clientWidth;
        if (cw < w * 0.98) {
          // keep the visible window inside the three sets while the track slides
          if (!tx && strip.scrollLeft > w * 2 - cw) { wrapping = true; strip.scrollLeft -= w; wrapping = false; }
          tx += v * dt;
          if (tx >= w) tx -= w;                             // identical card, one set back
          setTx();
        } else {                                            // very wide screen, few cards: plain scroll
          wrapping = true; strip.scrollLeft += v * dt; wrapping = false; normalise();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
