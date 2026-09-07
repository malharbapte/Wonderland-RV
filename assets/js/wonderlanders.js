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

/* ------------------------------------------------------ the phone rail ----
   Only the ambassadors.html grid. The cards pair up two deep and slide, and
   the rail runs endlessly the same way the "meet more" strip does: a clone
   set either side of the real one, resting on the middle, jumping back a
   whole set width whenever a boundary is crossed. That lands on an identical
   card, so nothing moves on screen and there is no end to reach.

   Built once, on a phone, and left alone: a card that has been re-parented
   into the rail would have to be put back to render the desktop grid, so the
   rail is not torn down on resize. Rotating a phone stays inside the
   breakpoint; crossing it is a desktop window being dragged narrow, which
   reloads soon enough. */
(function () {
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  var inner = document.querySelector(".wl-cards-inner");
  if (!inner || inner.querySelector(".wl-rail")) return;

  var rail = document.createElement("div");
  rail.className = "wl-rail";
  while (inner.firstChild) rail.appendChild(inner.firstChild);
  inner.appendChild(rail);

  var real = [].slice.call(rail.children);
  if (real.length < 2) return;

  function cloneSet(where) {
    real.forEach(function (card) {
      var c = card.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      /* nothing inside a hidden clone may take focus */
      [].slice.call(c.querySelectorAll("a, button")).forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      if (where === "before") rail.insertBefore(c, rail.firstChild);
      else rail.appendChild(c);
    });
  }
  cloneSet("after");
  cloneSet("before");

  var n = real.length, w = 0, ready = false;
  function rest() {
    w = rail.children[n].offsetLeft - rail.children[0].offsetLeft;
    if (!w) return;
    inner.style.scrollBehavior = "auto";
    inner.scrollLeft = w;
    ready = true;
  }

  /* Not rAF-throttled: rAF never fires in a background tab (HANDOFF §9), and
     setting scrollLeft here fires another scroll event, so the guard flag is
     what stops it re-entering. */
  var wrapping = false;
  inner.addEventListener("scroll", function () {
    if (!ready || wrapping) return;
    if (inner.scrollLeft >= w * 2 || inner.scrollLeft <= 0) {
      wrapping = true;
      inner.scrollLeft += (inner.scrollLeft <= 0) ? w : -w;
      wrapping = false;
    }
  });

  window.addEventListener("resize", function () { ready = false; rest(); });
  /* the photos decide the card heights, so measure again once they are in */
  if (document.readyState === "complete") rest();
  else window.addEventListener("load", rest);
  rest();
})();
