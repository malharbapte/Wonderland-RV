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
   Piyush, 21 Oct 2026: the dropdowns open and close softly, and opening one
   gently closes whichever was open. Still native <details>, so the answers
   stay in the page for search engines and work without script; this only
   animates the height and fade of the answer. Instant for reduced motion. */
(function () {
  var list = document.querySelector(".amb-faq-list");
  if (!list) return;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.33,0,.15,1)", D = 520;

  function bodyOf(d) { return d.querySelector(".amb-faq-body"); }
  function animate(d, opening) {
    var b = bodyOf(d);
    if (!b || calm) { d.open = opening; return; }
    if (d._anim) d._anim.cancel();
    b.style.overflow = "hidden";
    var full = b.scrollHeight;
    if (opening) d.open = true;
    d.classList.toggle("is-closing", !opening);
    var from = opening ? 0 : b.getBoundingClientRect().height;
    var to = opening ? full : 0;
    var a = b.animate([{ height: from + "px", opacity: opening ? 0 : 1 },
                       { height: to + "px", opacity: opening ? 1 : 0 }],
                      { duration: D, easing: EASE });
    d._anim = a;
    a.onfinish = function () {
      d._anim = null; b.style.overflow = "";
      if (!opening) { d.open = false; d.classList.remove("is-closing"); }
    };
  }

  list.querySelectorAll("details").forEach(function (d) {
    var s = d.querySelector("summary");
    if (!s) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      var opening = !d.open || d.classList.contains("is-closing");
      if (opening) {
        list.querySelectorAll("details[open]").forEach(function (o) {
          if (o !== d && !o.classList.contains("is-closing")) animate(o, false);
        });
      }
      animate(d, opening);
    });
  });
})();
