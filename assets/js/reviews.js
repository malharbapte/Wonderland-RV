/* ==========================================================================
   Legendary Service — the review slider.
   Its own file: the homepage and the contact page both carry the section, so
   neither page's script owns it.
   ========================================================================== */
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
