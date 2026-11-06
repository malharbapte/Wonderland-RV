/* ==========================================================================
   THE WONDERLAND EXPERIENCE -- wonderland-experience.html

   Two small behaviours, each inert when its markup is absent.

   JOURNEY. Six steps, four visible, one press moves the row one step. The
   offset is measured from the DOM (card to next card, which includes the
   chevron between them) rather than computed from rem, so it stays right at
   every window width. It stops at both ends instead of looping: the steps
   are a sequence, and a loop would put step 6 next to step 1.

   OPTIONS. A tab list. Click or arrow keys choose; the panels are all in
   the DOM and only the chosen one is visible.

   Below 901 the page is a gated fallback (see wx-page.css): the journey is a
   plain scroller and nothing here drives it.
   ========================================================================== */
(function () {
  var PHONE = window.matchMedia("(max-width: 900px)");

  /* ------------------------------------------------------------ journey */
  var track = document.getElementById("wxJourneyTrack");
  if (track) {
    var cards = [].slice.call(track.querySelectorAll(".wx-journey-card"));
    var prev  = document.querySelector(".wx-journey-arrow--prev");
    var next  = document.querySelector(".wx-journey-arrow--next");
    var VISIBLE = 4, at = 0;
    var last = Math.max(0, cards.length - VISIBLE);

    var pitch = function () {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    };
    var show = function (animate) {
      track.style.transition = animate ? "" : "none";
      track.style.transform = PHONE.matches ? "" : "translateX(" + (-at * pitch()) + "px)";
      if (!animate) { void track.offsetWidth; track.style.transition = ""; }
      if (prev) prev.disabled = at === 0;
      if (next) next.disabled = at === last;
    };
    if (prev) prev.addEventListener("click", function () { at = Math.max(0, at - 1); show(true); });
    if (next) next.addEventListener("click", function () { at = Math.min(last, at + 1); show(true); });
    window.addEventListener("resize", function () { show(false); });
    show(false);
  }

  /* ------------------------------------------------------------ options */
  var tabs = [].slice.call(document.querySelectorAll(".wx-options-list [role=tab]"));
  var panels = [].slice.call(document.querySelectorAll(".wx-opt-panel"));
  if (tabs.length && tabs.length === panels.length) {
    var pick = function (k, focus) {
      tabs.forEach(function (t, j) {
        var on = j === k;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panels[j].classList.toggle("is-on", on);
      });
      if (focus) tabs[k].focus();
    };
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { pick(k, false); });
      t.addEventListener("keydown", function (e) {
        var n = tabs.length, to = -1;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") to = (k + 1) % n;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = (k - 1 + n) % n;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = n - 1;
        if (to < 0) return;
        e.preventDefault();
        pick(to, true);
      });
    });
  }
})();
