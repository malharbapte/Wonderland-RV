/* Brand logo marquee ("Brands we trust" on the homepage, "Premium brand partners" on the thank-you page):
   ONE speed everywhere. Malhar, 24 Nov 2026: 25% slower than the homepage ran before (85 s for half a track at 1440 wide, about 61 px/s).
   The track is a different length on each page and at each width, so the duration is worked out from the track itself:
   seconds = (half the track) / speed.
   Desktop speed is 0.889 rem per second (45.6 px/s at 1440, and it grows with the page the way the old fixed duration did);
   phones run at 31 px/s, which is the same 25% off the old phone speed. The CSS durations are only the fallback. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var tracks = [].slice.call(document.querySelectorAll(".brand-track"));
  if (!tracks.length) return;
  var DESKTOP_REM_PER_S = 0.889, PHONE_PX_PER_S = 31, START = 0.27;   /* START: how far round it already is when the page loads */
  var phone = window.matchMedia("(max-width: 900px)");
  function set() {
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var speed = phone.matches ? PHONE_PX_PER_S : DESKTOP_REM_PER_S * rem;
    tracks.forEach(function (t) {
      var half = t.scrollWidth / 2;
      if (!half || !speed) return;
      var dur = half / speed, at = START * dur;
      /* already running (a resize): keep it where it is on the track, so dragging the window does not snap it back to the start */
      var a = t.getAnimations && t.getAnimations()[0];
      if (a && t.style.animationDuration) {
        var c = a.currentTime / 1000, d0 = parseFloat(t.style.animationDuration), p = ((c - parseFloat(t.style.animationDelay)) / d0) % 1;
        at = p * dur - c;
        at = (at % dur + dur) % dur;
      }
      t.style.animationDuration = dur.toFixed(1) + "s";
      t.style.animationDelay = (-at).toFixed(1) + "s";
    });
  }
  set();
  window.addEventListener("load", set);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(set, 200); });
  if (phone.addEventListener) phone.addEventListener("change", set);
})();
