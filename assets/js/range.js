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

  var N = shots.length, at = 0;

  var MOVE  = 760;   /* the transition plus its delay, plus a little */
  var QUIET = 150;   /* the wheel going silent is what ends a gesture */

  var moving = false;   /* the animation is still playing */
  var armed  = true;    /* ready to accept a NEW gesture */
  var endTimer = null;

  function show(i) {
    if (i === at || i < 0 || i > N - 1) { armed = true; return; }
    at = i;
    shots.forEach(function (x, k)  { x.classList.toggle("is-on", k === i); });
    panels.forEach(function (x, k) { x.classList.toggle("is-on", k === i); });
    dots.forEach(function (x, k)   { x.classList.toggle("is-on", k === i); });
    moving = true;
    setTimeout(function () { moving = false; }, MOVE);
  }

  dots.forEach(function (b) {
    b.addEventListener("click", function () { armed = false; show(+b.dataset.i); rearm(); });
  });

  /* Re-arm only once BOTH are true: the gesture has ended, and the animation
     has finished. A trackpad flick keeps firing for a second or more after
     the fingers lift -- that tail is the same gesture, so it must not buy a
     second van. */
  function rearm() {
    clearTimeout(endTimer);
    endTimer = setTimeout(function () {
      if (!moving) { armed = true; return; }
      setTimeout(function () { armed = true; }, MOVE);
    }, QUIET);
  }

  addEventListener("wheel", function (e) {
    var r = sec.getBoundingClientRect(), mid = innerHeight / 2;
    /* only while the section owns the middle of the screen */
    if (r.top > mid || r.bottom < mid) return;

    var down = e.deltaY > 0;
    /* at either end the wheel is left alone, so the page carries on out of
       the section instead of trapping you in it */
    if ((down && at === N - 1) || (!down && at === 0)) return;

    e.preventDefault();
    rearm();                 /* every event of the flick pushes the end back */

    if (!armed) return;      /* still the same gesture, or still animating */
    armed = false;
    show(at + (down ? 1 : -1));
  }, { passive: false });

  addEventListener("keydown", function (e) {
    var r = sec.getBoundingClientRect(), mid = innerHeight / 2;
    if (r.top > mid || r.bottom < mid) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
    if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  { e.preventDefault(); show(at - 1); }
  });
})();
