/* ==========================================================================
   Wonderlander cards — the phone rail and the bio toggle.

   Both pages that carry .wl-card load this: the grid on ambassadors.html and
   the "meet more" strip on each Wonderlander page.

   Desktop does nothing here. The bio opens on hover and the chevron is
   display:none, so neither branch below runs above 900px — the rail is only
   built for the grid, and only on a phone.
   ========================================================================== */

/* ---------------------------------------------------------- the bio toggle
   Delegated, so it covers the rail's clones as well as the real cards. The
   chevron only ever toggles; the name beside it is a real link and still
   goes through to that Wonderlander's page. */
document.addEventListener("click", function (e) {
  var btn = e.target.closest && e.target.closest(".wl-card-toggle");
  if (!btn) return;
  var card = btn.closest(".wl-card");
  if (!card) return;
  var open = card.classList.toggle("is-open");
  btn.setAttribute("aria-expanded", String(open));
});

/* The phone rail that used to live here was retired on 21 Oct 2026: on a
   phone the grid is now a stacked list (one card per row) set in
   ambassadors.css, so no script is needed. */

/* ------------------------------------------ FAQs: soft accordion --
   Piyush, 21-22 Oct 2026: the dropdowns open and close softly, and opening one
   gently closes whichever was open. Still native <details>, so the answers
   stay in the page for search engines and work without script.

   v2 (22 Oct, "a lot more smoother"): one frame loop drives every answer, so
   the one closing and the one opening move in step on the same ease-in-out
   curve (gentle start, soft landing, no rush-then-crawl). The row that was
   clicked is held still on screen while an answer above it folds away, a
   reversal mid-move carries on from the current height instead of jumping,
   and the text fades in a beat behind the height. Instant for reduced motion. */
(function () {
  var list = document.querySelector(".amb-faq-list");
  // the Wonderlander pages load both ambassador.js and wonderlanders.js, which
  // both carry this block: bind once, or every click opens and shuts again
  if (!list || list.dataset.accordion) return;
  list.dataset.accordion = "1";
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D = 560;                                     // ms, open and close alike
  function ease(t) { return (1 - Math.cos(Math.PI * t)) / 2; }   // ease-in-out sine

  var items = [].slice.call(list.querySelectorAll("details")).map(function (d) {
    return { d: d, b: d.querySelector(".amb-faq-body"), s: d.querySelector("summary"),
             h: 0, from: 0, to: 0, t0: 0, on: false, opening: false };
  });
  var anchor = null, looping = false;

  function kids(it) { return it.b ? [].slice.call(it.b.children) : []; }
  function fade(it, opening) {
    kids(it).forEach(function (k) {
      if (k._fade) k._fade.cancel();
      k._fade = opening
        ? k.animate([{ opacity: 0, transform: "translateY(-0.06rem)" }, { opacity: 1, transform: "none" }],
                    { duration: D * 0.8, delay: D * 0.18, easing: "cubic-bezier(.25,.1,.25,1)", fill: "backwards" })
        : k.animate([{ opacity: 1 }, { opacity: 0 }],
                    { duration: D * 0.45, easing: "ease-out", fill: "forwards" });
    });
  }
  function settle(it) {
    it.on = false;
    clearTimeout(it.dog);
    it.b.style.height = ""; it.b.style.overflow = "";
    it.d.classList.remove("is-opening", "is-closing");
    if (!it.opening) {
      it.d.open = false;
      kids(it).forEach(function (k) { if (k._fade) { k._fade.cancel(); k._fade = null; } });
    }
  }
  function start(it, opening) {
    var b = it.b;
    var cur = it.on ? it.h : (it.d.open ? b.getBoundingClientRect().height : 0);
    if (opening) it.d.open = true;
    b.style.overflow = "hidden";
    b.style.height = cur + "px";
    it.from = cur; it.h = cur;
    it.to = opening ? b.scrollHeight : 0;      // full answer height incl. padding
    it.t0 = performance.now(); it.on = true; it.opening = opening;
    it.d.classList.toggle("is-opening", opening);
    it.d.classList.toggle("is-closing", !opening);
    fade(it, opening);
    // safety net: if the browser pauses frames, still land in the right state
    clearTimeout(it.dog);
    it.dog = setTimeout(function () { if (it.on) settle(it); }, D + 250);
    if (!looping) { looping = true; requestAnimationFrame(tick); }
  }
  function tick(now) {
    var top = anchor ? anchor.getBoundingClientRect().top : 0;
    var busy = false;
    items.forEach(function (it) {
      if (!it.on) return;
      var p = Math.min(1, Math.max(0, (now - it.t0) / D));
      it.h = it.from + (it.to - it.from) * ease(p);
      it.b.style.height = it.h.toFixed(2) + "px";
      if (p >= 1) settle(it); else busy = true;
    });
    // keep the clicked row where the finger or pointer left it
    if (anchor) {
      var drift = anchor.getBoundingClientRect().top - top;
      if (Math.abs(drift) > 0.1) window.scrollBy({ top: drift, behavior: "instant" });
    }
    if (busy) requestAnimationFrame(tick);
    else { looping = false; anchor = null; }
  }

  items.forEach(function (it) {
    if (!it.s || !it.b) return;
    it.s.addEventListener("click", function (e) {
      e.preventDefault();
      var opening = !it.d.open || it.d.classList.contains("is-closing");
      if (calm) {
        items.forEach(function (o) { if (o !== it && opening) o.d.open = false; });
        it.d.open = opening; return;
      }
      anchor = it.s;
      if (opening) {
        items.forEach(function (o) {
          if (o !== it && o.d.open && !o.d.classList.contains("is-closing")) start(o, false);
        });
      }
      start(it, opening);
    });
  });
})();
