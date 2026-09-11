/* ==========================================================================
   Lightbox — click a photograph to see it full screen.

   Currently used by the travel-tips collage on an individual Wonderlander
   page, but it knows nothing about that section beyond the selector below:
   give it any set of elements that each contain one <img> and it will pick
   them up. Styles live in ambassador-page.css under .lb-.

   Wanted on the desktop and the phone both, so nothing here is gated on
   width. Touch gets a swipe, a pointer gets the arrows, and either can use
   the keyboard.
   ========================================================================== */
(function () {
  "use strict";

  var TILES = ".amb-tips .amb-tip-img";

  var tiles = [].slice.call(document.querySelectorAll(TILES));
  if (!tiles.length) return;

  function icon(d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
           '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" ' +
           'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photographs");
  lb.innerHTML =
    '<div class="lb-back"></div>' +
    '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
    '<button class="lb-close" type="button" aria-label="Close">' +
      icon("M6 6l12 12M18 6L6 18") + '</button>' +
    '<div class="lb-bar">' +
      '<button class="lb-prev" type="button" aria-label="Previous photograph">' + icon("M15 5l-7 7 7 7") + '</button>' +
      '<span class="lb-count" aria-live="polite"></span>' +
      '<button class="lb-next" type="button" aria-label="Next photograph">' + icon("M9 5l7 7-7 7") + '</button>' +
    '</div>';
  document.body.appendChild(lb);

  var lbImg   = lb.querySelector(".lb-img");
  var lbCount = lb.querySelector(".lb-count");
  var shots = [], at = 0, opener = null;

  /* The list is rebuilt in DOM order every time one of the photographs
     resolves, and a tile looks its own position up at the moment it is
     clicked. Numbering them as the files arrived instead put the collage in
     network order — the fourth still down the page announced itself as
     "5 / 6". A slot whose file is missing has had its <img> removed by the
     inline onerror, so it never enters the list and never becomes a button:
     there is nothing to enlarge. */
  function build() {
    if (lb.classList.contains("is-on")) return;   /* never under an open list */
    shots = [];
    tiles.forEach(function (tile) {
      var img = tile.querySelector("img");
      if (!img || !img.naturalWidth) return;
      shots.push({ src: img.currentSrc || img.src, alt: img.alt, tile: tile });
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
    });
    /* Counted AFTER the pass, over what actually resolved rather than over
       the slots in the markup. A collage whose photographs have not all been
       supplied announced "1 of 6" while the lightbox itself, which reads the
       same list, showed "1 / 4". */
    shots.forEach(function (s, k) {
      s.tile.setAttribute("aria-label",
        "Enlarge photograph " + (k + 1) + " of " + shots.length);
    });
  }

  tiles.forEach(function (tile) {
    var img = tile.querySelector("img");
    if (!img) return;
    if (img.complete) build(); else img.addEventListener("load", build);

    function go(e) {
      var n = -1;
      shots.forEach(function (s, k) { if (s.tile === tile) n = k; });
      if (n < 0) return;
      if (e) e.preventDefault();
      open(n);
    }
    tile.addEventListener("click", function () { go(); });
    tile.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") go(e);
    });
  });
  build();

  /* fade out, swap the file, fade back in — so stepping does not flash the
     next photograph in half-loaded */
  function paint() {
    var s = shots[at];
    lb.classList.add("is-swapping");
    var pre = new Image();
    pre.onload = function () {
      lbImg.src = s.src;
      lbImg.alt = s.alt || "";
      lb.classList.remove("is-swapping");
    };
    pre.src = s.src;
    setTimeout(function () { lb.classList.remove("is-swapping"); }, 500);
    lbCount.textContent = (at + 1) + " / " + shots.length;
  }
  function step(d) { at = (at + d + shots.length) % shots.length; paint(); }

  function open(n) {
    opener = shots[n].tile;
    at = n;
    lbImg.src = shots[n].src;
    lbImg.alt = shots[n].alt || "";
    lbCount.textContent = (at + 1) + " / " + shots.length;
    lb.classList.add("is-on");
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(function () { lb.classList.add("is-in"); });
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("is-in");
    setTimeout(function () {
      lb.classList.remove("is-on");
      document.documentElement.style.overflow = "";
      if (opener) opener.focus();
    }, 250);
  }

  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-back").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  /* the empty space around the photograph closes it the way the backdrop
     does — a click on the photograph itself does not */
  lb.querySelector(".lb-stage").addEventListener("click", function (e) {
    if (e.target === this) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-on")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") {
      /* keep the keyboard inside the dialog while it is open */
      var stops = [].slice.call(lb.querySelectorAll("button"));
      var k = stops.indexOf(document.activeElement);
      e.preventDefault();
      stops[(k + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
    }
  });

  /* The desktop mosaic (tips-mosaic.js) reshuffles its tiles, so it cannot be
     read once like the collage above. It hands over the photographs on
     screen at the moment of the click instead, and the tile to return
     focus to. */
  window.wlLightbox = {
    open: function (list, n, from) {
      shots = list.map(function (s) { return { src: s.src, alt: s.alt || "", tile: from }; });
      open(n);
    }
  };

  /* swipe, for touch */
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
})();
