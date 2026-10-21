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
