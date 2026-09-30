/* ===========================================================================
   Range — a stepper. One swipe moves one van, and then it stops.

   The section is one screen tall. While it owns the middle of the screen a
   wheel gesture is taken as a single step rather than as scrolling, so the
   transition plays through with nothing competing with it -- which is the
   whole reason the earlier scroll-linked versions could not look smooth.

   A new step is only accepted once BOTH the animation has finished and the
   wheel has been silent for 150ms: a trackpad keeps firing long after the
   fingers lift, and that tail is the same gesture.

   DESKTOP ONLY this round; below 900 the section is display:none and none of
   this runs. At the first van scrolling up and the last scrolling down the
   wheel is not intercepted, so the page carries on out of the section.
   =========================================================================== */
/* Static markup: with no script every model is on the page and readable. */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var sec    = document.querySelector(".rs");
  var shots  = [].slice.call(document.querySelectorAll(".rs-shot"));
  var panels = [].slice.call(document.querySelectorAll(".rs-panel"));
  var dots   = [].slice.call(document.querySelectorAll(".rs-dot"));
  if (!sec || !shots.length) return;

  var N = shots.length;

  var QUIET = 150;   /* a gap this long between wheel events ends a gesture */
  var MOVE  = 620;   /* the crossfade; the lock lasts exactly this, no more */
  var ALIGN = 620;   /* the one-off scroll that centres the section */

  var at = 0;
  var engaged  = false;   /* the section has taken the wheel */
  var lastWheel = 0;      /* when the previous wheel event arrived */
  var until = 0;          /* nothing may step before this moment */

  function show(i) {
    if (i === at || i < 0 || i > N - 1) return;
    at = i;
    shots.forEach(function (x, k)  { x.classList.toggle("is-on", k === i); });
    panels.forEach(function (x, k) { x.classList.toggle("is-on", k === i); });
    dots.forEach(function (x, k)   { x.classList.toggle("is-on", k === i); });
    until = performance.now() + MOVE;
  }

  dots.forEach(function (b) {
    b.addEventListener("click", function () { show(+b.dataset.i); });
  });

  function onScreen() {
    var r = sec.getBoundingClientRect();
    var seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return seen >= Math.min(r.height, innerHeight) * 0.8;
  }

  /* One smooth scroll so the section sits centred the moment it takes over.
     Without it the takeover happens wherever the flick happened to stop,
     which is what made it feel like the page had died rather than like the
     section had caught you. */
  function centre() {
    var r = sec.getBoundingClientRect();
    var off = (r.top + r.bottom) / 2 - innerHeight / 2;
    if (Math.abs(off) < 30) return;
    scrollTo({ top: scrollY + off, behavior: "smooth" });
  }

  addEventListener("wheel", function (e) {
    if (!onScreen()) { engaged = false; return; }

    var now = performance.now();
    var fresh = (now - lastWheel) > QUIET;   /* the start of a new gesture */
    lastWheel = now;

    /* FIRST CONTACT: arrive, do not advance. The van on screen is the one you
       came to see; stepping here would skip it. */
    if (!engaged) {
      engaged = true;
      e.preventDefault();
      centre();
      until = now + ALIGN;
      return;
    }

    var down = e.deltaY > 0;
    var end  = (down && at === N - 1) || (!down && at === 0);

    /* At an end, the page is released only by a NEW gesture. The tail of the
       flick that just landed the last van is absorbed instead -- letting it
       through is what scrolled the page away before XTR had appeared. */
    if (end) {
      if (fresh && now >= until) { engaged = false; return; }
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (!fresh || now < until) return;       /* same gesture, or still moving */
    show(at + (down ? 1 : -1));
  }, { passive: false });

  addEventListener("keydown", function (e) {
    if (!onScreen()) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
    if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  { e.preventDefault(); show(at - 1); }
  });
})();
