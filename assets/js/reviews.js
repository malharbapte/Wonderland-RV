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

  const PHONE = window.matchMedia("(max-width: 900px)");

  if (n > 1) {
    const clone = real[0].cloneNode(true);
    clone.classList.add("is-clone");   // hidden on the phone: it is a duplicate there
    track.appendChild(clone);
  }

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

  /* ----------------------------------------------------- the phone rail ---
     On the phone the viewport scrolls and snaps, so the translate slider is
     off entirely — auto() would fight the finger. What is left to build is the
     read-out: a dot per review and a count. The live index is the slide whose
     centre sits nearest the viewport's centre, because the last card can never
     reach the left edge; and it is polled rather than listened for, since
     scroll events do not fire reliably here. */
  function phoneRail() {
    const port = track.parentElement;
    if (!port || port.querySelector(".service-rail")) return;

    const rail = document.createElement("div");
    rail.className = "service-rail";
    const dots = real.map(function (_, k) {
      const d = document.createElement("span");
      d.className = "service-dot" + (k ? "" : " is-on");
      rail.appendChild(d);
      return d;
    });
    const count = document.createElement("span");
    count.className = "service-count";
    count.textContent = "01 / " + String(n).padStart(2, "0");
    rail.appendChild(count);
    port.parentElement.insertBefore(rail, port.nextSibling);

    let last = 0;
    setInterval(function () {
      const mid = port.scrollLeft + port.clientWidth / 2;
      let best = 0, gap = Infinity;
      for (let k = 0; k < n; k++) {
        const s = real[k];
        const c = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < gap) { gap = d; best = k; }
      }
      if (best === last) return;
      dots[last].classList.remove("is-on");
      dots[best].classList.add("is-on");
      count.textContent = String(best + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
      last = best;
    }, 150);
  }

  if (PHONE.matches) {
    track.style.transform = "none";
    phoneRail();
  } else {
    show(false);
    auto();
    window.addEventListener("resize", function () { show(false); });
  }
})();
