/* ==========================================================================
   THE WONDERLAND EXPERIENCE -- wonderland-experience.html

   JOURNEY. Six steps, four visible. The row moves four ways, all landing on
   the same one-step-at-a-time positions:
     - the prev/next chevrons
     - a DRAG with the mouse, which follows the pointer and snaps on release
     - a SWIPE with a finger (same code: pointer events cover both)
     - a SIDEWAYS TRACKPAD gesture (wheel events with a horizontal delta)
   It stops at both ends instead of looping -- the steps are a sequence, and a
   loop would put step 6 beside step 1 -- and pulls against the end with some
   resistance so a drag past it feels like an edge rather than a fault.

   The offset is measured from the DOM (card to next card, which includes the
   chevron between them) rather than computed from rem, so it is right at
   every window width.

   OPTIONS. A tab list. Click or arrow keys choose; the panels are all in the
   DOM and only the chosen one is visible.

   Below 901 the page is a gated fallback (see wx-page.css): the journey is a
   plain scroller and nothing here drives it.
   ========================================================================== */
(function () {
  var PHONE = window.matchMedia("(max-width: 900px)");

  /* ------------------------------------------------------------ journey */
  var section = document.querySelector(".wx-journey");
  var track = document.getElementById("wxJourneyTrack");
  if (track && section) {
    var viewport = track.parentElement;
    var cards = [].slice.call(track.querySelectorAll(".wx-journey-card"));
    var titles = cards.map(function (c) { return c.querySelector(".wx-card-title"); });
    var prev = document.querySelector(".wx-journey-arrow--prev");
    var next = document.querySelector(".wx-journey-arrow--next");
    var VISIBLE = 4, at = 0;
    var last = Math.max(0, cards.length - VISIBLE);

    var pitch = function () {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    };
    var clamp = function (n) { return Math.max(0, Math.min(last, n)); };
    var setX = function (px, animate) {
      track.style.transition = animate ? "" : "none";
      track.style.transform = "translate3d(" + px + "px,0,0)";
    };
    var show = function (animate) {
      if (PHONE.matches) { track.style.transform = ""; return; }
      setX(-at * pitch(), animate);
      if (!animate) { void track.offsetWidth; track.style.transition = ""; }
      if (prev) prev.disabled = at === 0;
      if (next) next.disabled = at === last;
    };
    var go = function (d) { at = clamp(at + d); show(true); };

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    /* ---- drag / swipe ------------------------------------------------ */
    var drag = null;
    viewport.addEventListener("pointerdown", function (e) {
      if (PHONE.matches) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, base: -at * pitch(),
               moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.2) { drag = null; return; }   // it is a scroll
        drag.moved = true;
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already released: the drag still works */ }
        section.classList.add("is-dragging");
      }
      var pos = drag.base + dx, min = -last * pitch();
      /* past either end the row follows at a third of the finger's speed */
      if (pos > 0) pos = pos * 0.33;
      else if (pos < min) pos = min + (pos - min) * 0.33;
      setX(pos, false);
      var dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.lastX) / dt);   // px per ms
      drag.lastX = e.clientX; drag.lastT = e.timeStamp;
    });
    var release = function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.moved) return;
      section.classList.remove("is-dragging");
      var dx = e.clientX - d.x0, p = pitch() || 1;
      var steps = Math.round(-dx / p);                     // a long drag can carry several
      if (steps === 0 && (Math.abs(dx) > p * 0.15 || Math.abs(d.v) > 0.4)) {
        steps = (dx < 0 || d.v < -0.4) ? 1 : -1;           // a short drag or a flick is still one
      }
      if (Math.abs(d.v) > 0.9 && steps === 0) steps = d.v < 0 ? 1 : -1;
      at = clamp(at + steps);
      show(true);
    };
    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);

    /* ---- sideways trackpad -------------------------------------------- */
    var locked = false, unlock;
    viewport.addEventListener("wheel", function (e) {
      if (PHONE.matches) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
      e.preventDefault();                                  // do not also swipe the browser back
      clearTimeout(unlock);
      unlock = setTimeout(function () { locked = false; }, 180);   // re-armed until the inertia dies
      if (locked) return;
      locked = true;
      go(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });

    /* ---- keyboard: a card that takes focus must be on screen ---------- */
    viewport.addEventListener("focusin", function (e) {
      var k = cards.indexOf(e.target.closest(".wx-journey-card"));
      if (k < 0 || PHONE.matches) return;
      if (k < at) at = k; else if (k > at + VISIBLE - 1) at = k - VISIBLE + 1;
      show(true);
    });
    /* focus can scroll an overflow:hidden box; the track, not the box, moves */
    viewport.addEventListener("scroll", function () { if (!PHONE.matches) viewport.scrollLeft = 0; });

    /* ---- every band the same height at rest ---------------------------
       The titles are display type and wrap differently at each size. Measure
       the longest and give every title that many lines of height. */
    var fit = function () {
      section.style.setProperty("--wxc-lines", 1);
      var most = 1;
      titles.forEach(function (h) {
        var fs = parseFloat(getComputedStyle(h).fontSize) || 1;
        most = Math.max(most, Math.round(h.offsetHeight / (fs * 1.1)));
      });
      section.style.setProperty("--wxc-lines", most);
    };
    window.wxJourneyFit = fit;      // the sample page calls this when it changes the size

    window.addEventListener("resize", function () { fit(); show(false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); show(false); });
    fit(); show(false);
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
