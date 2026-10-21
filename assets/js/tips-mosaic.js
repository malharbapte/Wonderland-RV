/* ==========================================================================
   Travel tips, desktop: the Q&A in the centre of a photo mosaic.

   Desktop only. Below 901 the section keeps the collage it has always had,
   and nothing here runs.

   The photographs are that family's own, listed on the section itself:

     <section class="amb-tips"
              data-photo-dir="assets/img/ambassadors/<slug>/"
              data-photos="tip-1.jpg tip-2.jpg ...">

   Add a file to the folder and its name to data-photos and it joins in.
   There are 14 tiles. Rules, in order:

   1. FIT. A portrait photo never goes in a wide tile and a landscape photo
      never goes in a tall one; the near-square tiles take either. Within
      that, each photo goes where it is cropped least.
   2. ORANGE. A tile with no photo to fit it is plain orange. The orange is
      placed by trying every arrangement (14 tiles is small enough) and
      taking the least bunched: no two side by side where the numbers allow
      it, then as few meeting at a corner as possible.
   3. SHUFFLE. Every 3s one change. With more photos than tiles, a fresh one
      comes in and the one it replaces rests for 8 changes before it can come
      back. Otherwise two tiles trade places, orange included, but only by a
      move that keeps rule 1 and leaves the orange no more bunched than it
      was. It pauses under the pointer or keyboard focus, off screen, in a
      hidden tab, while a photo is enlarged, and entirely for reduced motion.

   FIXED ORANGE + STRICT FIT (21 Oct 2026, Piyush). The section can carry
     data-orange="3 11 13"   tiles that are always orange (1-based), the same
                             three on every Wonderlander page
     data-strict             a photo only goes in a tile whose shape it was
                             cropped for (aspect within 12%), so every photo
                             sits properly; trades only happen between tiles of
                             the same shape and never move the fixed orange.
   ========================================================================== */
(function () {
  "use strict";

  var section = document.querySelector(".amb-tips[data-photos]");
  if (!section) return;
  if (!window.matchMedia("(min-width: 901px)").matches) return;

  var band = section.querySelector(".amb-tips-band");
  if (!band || !section.querySelector(".amb-tips-panel")) return;

  var dir = section.getAttribute("data-photo-dir") || "";
  var names = (section.getAttribute("data-photos") || "").trim().split(/\s+/).filter(Boolean);

  var SLOTS = 14, EVERY = 3000, COOLDOWN = 8, ORANGE = "orange";
  var FIXED = (section.getAttribute("data-orange") || "").trim().split(/\s+/)
    .filter(Boolean).map(function (n) { return (+n) - 1; })
    .filter(function (k) { return k >= 0 && k < SLOTS; });
  var STRICT = section.hasAttribute("data-strict");
  function fixed(k) { return FIXED.indexOf(k) >= 0; }

  section.classList.add("is-mosaic");

  var tiles = [];
  for (var i = 1; i <= SLOTS; i++) {
    var t = document.createElement("div");
    t.className = "tc-tile";
    t.style.gridArea = "t" + i;
    t.setAttribute("aria-hidden", "true");
    t.innerHTML = '<div class="tc-face on"></div><div class="tc-face"></div>';
    band.appendChild(t);
    tiles.push(t);
  }

  function rnd(n) { return Math.random() * n | 0; }
  function shuffle(a) {
    for (var j = a.length - 1; j > 0; j--) { var k = rnd(j + 1), x = a[j]; a[j] = a[k]; a[k] = x; }
    return a;
  }
  function isPhoto(x) { return x && x !== ORANGE; }

  /* ---- the grid, read off the page rather than typed in: each tile's shape,
     and which tiles share a side (edge) or only a corner */
  var shapes = [], edge = [], corner = [];
  function measure() {
    var g = parseFloat(getComputedStyle(band).columnGap) || 0;
    var r = tiles.map(function (el) { return el.getBoundingClientRect(); });
    shapes = r.map(function (b) {
      var k = b.width / b.height;
      return { r: k, kind: k > 1.5 ? "wide" : k < 0.75 ? "tall" : "square" };
    });
    edge = tiles.map(function () { return []; });
    corner = tiles.map(function () { return []; });
    for (var a = 0; a < SLOTS; a++) for (var b = 0; b < SLOTS; b++) {
      if (a === b) continue;
      var ox = Math.min(r[a].right, r[b].right) - Math.max(r[a].left, r[b].left);
      var oy = Math.min(r[a].bottom, r[b].bottom) - Math.max(r[a].top, r[b].top);
      var nx = Math.abs(r[a].right + g - r[b].left) < 2 || Math.abs(r[b].right + g - r[a].left) < 2;
      var ny = Math.abs(r[a].bottom + g - r[b].top) < 2 || Math.abs(r[b].bottom + g - r[a].top) < 2;
      if ((nx && oy > 2) || (ny && ox > 2)) edge[a].push(b);
      else if (nx && ny) corner[a].push(b);
    }
  }

  function fits(p, k) {
    if (!isPhoto(p)) return !STRICT || fixed(k) || !FIXED.length;
    if (fixed(k)) return false;
    if (STRICT) return Math.abs(p.r / shapes[k].r - 1) < 0.12;
    var s = shapes[k].kind;
    if (s === "wide") return p.o !== "portrait";
    if (s === "tall") return p.o !== "landscape";
    return true;
  }
  function loss(p, k) { var a = p.r, b = shapes[k].r; return 1 - Math.min(a / b, b / a); }

  function clump(list) {
    var e = 0, c = 0;
    for (var a = 0; a < SLOTS; a++) if (list[a] === ORANGE) {
      edge[a].forEach(function (b) { if (b > a && list[b] === ORANGE) e++; });
      corner[a].forEach(function (b) { if (b > a && list[b] === ORANGE) c++; });
    }
    return { e: e, c: c };
  }
  function worse(x, y) { return x.e > y.e || (x.e === y.e && x.c > y.c); }

  /* ---- first layout. For each possible set of orange tiles, a matching of
     photos to the remaining tiles that honours rule 1 (tightest tiles first,
     each trying its least-cropped photos first). The fewest orange tiles
     that can be made to work wins, then the least bunched of those. */
  var pool = [];
  function assign(orange) {
    var slots = [];
    for (var k = 0; k < SLOTS; k++) if (!orange[k]) slots.push(k);
    if (slots.length > pool.length) return null;
    var owner = pool.map(function () { return -1; });
    var cand = {};
    slots.forEach(function (s) {
      cand[s] = shuffle(pool.map(function (p, n) { return n; }))
        .filter(function (n) { return fits(pool[n], s); })
        .sort(function (x, y) { return loss(pool[x], s) - loss(pool[y], s); });
    });
    function grab(s, seen) {
      for (var q = 0; q < cand[s].length; q++) {
        var n = cand[s][q];
        if (seen[n]) continue;
        seen[n] = true;
        if (owner[n] < 0 || grab(owner[n], seen)) { owner[n] = s; return true; }
      }
      return false;
    }
    slots.sort(function (a, b) { return cand[a].length - cand[b].length; });
    for (var z = 0; z < slots.length; z++) if (!grab(slots[z], {})) return null;
    var out = tiles.map(function () { return ORANGE; });
    owner.forEach(function (s, n) { if (s >= 0) out[s] = pool[n]; });
    return out;
  }

  function place() {
    if (FIXED.length) {
      var mask = tiles.map(function (t, k) { return fixed(k); });
      var a = assign(mask);
      if (a) return a;
    }
    for (var k = Math.max(0, SLOTS - pool.length); k <= SLOTS; k++) {
      var best = [], bestScore = Infinity, pick = [];
      (function each(start, left) {
        if (left === 0) {
          var mask = tiles.map(function () { return false; });
          pick.forEach(function (x) { mask[x] = true; });
          var trial = mask.map(function (m) { return m ? ORANGE : null; });
          var s = clump(trial), score = s.e * 1000 + s.c;
          if (score > bestScore) return;
          var a = assign(mask);
          if (!a) return;
          if (score < bestScore) { bestScore = score; best = [a]; } else best.push(a);
          return;
        }
        for (var x = start; x <= SLOTS - left; x++) { pick.push(x); each(x + 1, left - 1); pick.pop(); }
      })(0, k);
      if (best.length) return best[rnd(best.length)];
    }
    return tiles.map(function () { return ORANGE; });
  }

  /* ---- drawing */
  var shown = [];
  function paint(face, what) {
    face.classList.toggle("is-orange", !isPhoto(what));
    face.style.backgroundImage = isPhoto(what) ? 'url("' + what.src + '")' : "none";
  }
  function label(k) {
    var el = tiles[k];
    if (isPhoto(shown[k])) {
      el.removeAttribute("aria-hidden");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Enlarge photograph");
    } else {
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("role");
      el.removeAttribute("tabindex");
      el.removeAttribute("aria-label");
    }
  }
  function flip(k, what) {
    var el = tiles[k], on = el.querySelector(".tc-face.on"), off = el.querySelector(".tc-face:not(.on)");
    paint(off, what);
    void off.offsetWidth;   /* a reflow, not rAF: rAF pauses in background tabs */
    off.classList.add("on");
    on.classList.remove("on");
  }
  /* One change can touch two tiles (a trade). Every photo involved is loaded
     FIRST and then all the tiles flip in the same instant. Flipping each as
     its own photo arrived let an orange tile land before the photo leaving
     for it had, so for a moment the photo was gone and two orange tiles could
     sit side by side, which is the one thing rule 2 forbids. */
  function show(changes) {
    changes.forEach(function (c) { shown[c[0]] = c[1]; label(c[0]); });
    var photos = changes.filter(function (c) { return isPhoto(c[1]); });
    var waiting = photos.length;
    function go() { changes.forEach(function (c) { flip(c[0], c[1]); }); }
    if (!waiting) return go();
    photos.forEach(function (c) {
      var pre = new Image();
      pre.onload = pre.onerror = function () { if (--waiting === 0) go(); };
      pre.src = c[1].src;
    });
  }

  /* ---- the shuffle */
  var resting = [], lastSlot = -1, hovering = false, onScreen = true;
  band.addEventListener("mouseenter", function () { hovering = true; });
  band.addEventListener("mouseleave", function () { hovering = false; });
  /* ENTRANCE (21 Oct 2026, Piyush): when the wall scrolls into view, two or
     three tiles change one after another so the movement is seen on arrival,
     then the 3s shuffle carries on. It replays every time the wall comes back
     into view (after it has dropped below 15% visible), never closer than 5s
     apart; nothing for reduced motion. Was once per visit, which Piyush read
     as "not working" when he scrolled back to the section. */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bursting = false, lastBurst = 0, seenOff = true;
  function burst() {
    if (reduced || bursting || !pool.length || Date.now() - lastBurst < 5000) return;
    bursting = true; lastBurst = Date.now();
    [350, 1150, 1950].forEach(function (ms, n) {
      setTimeout(function () {
        if (!document.hidden && !document.querySelector(".lb.is-on")) tick(true);
        if (n === 2) bursting = false;
      }, ms);
    });
  }
  /* Visibility is measured on scroll (throttled) rather than with an
     IntersectionObserver alone: the observer can stay silent in embedded and
     background views, and this check behaves the same everywhere. */
  var vTimer = 0;
  function checkVisible() {
    vTimer = 0;
    var r = band.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    var seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    var part = seen / Math.max(1, Math.min(r.height, vh));
    onScreen = seen > 0;
    if (part < 0.15) { seenOff = true; return; }
    if (part >= 0.3 && seenOff) { seenOff = false; burst(); }
  }
  function queueCheck() { if (!vTimer) vTimer = setTimeout(checkVisible, 120); }
  window.addEventListener("scroll", queueCheck, { passive: true });
  window.addEventListener("resize", queueCheck);
  /* Keyboard focus pauses it, so a tile never changes under someone tabbing
     through. Plain focus does not: closing an enlarged photo hands focus back
     to its tile, and a mouse user would otherwise leave the wall frozen until
     they clicked somewhere else. :focus-visible is the browser's own call on
     which kind of focus it is. */
  function paused() {
    return hovering || !onScreen || document.hidden ||
           !!band.querySelector(":focus-visible") ||
           !!document.querySelector(".lb.is-on");
  }

  function tick(force) {
    if (!force && (paused() || bursting)) return;
    var inPlay = shown.filter(isPhoto).length;

    /* 1. a fresh photo, if the pool is bigger than the tiles showing it */
    if (pool.length > inPlay) {
      var cap = Math.max(0, Math.min(COOLDOWN, pool.length - inPlay - 1));
      var fresh = [];
      shown.forEach(function (x, k) {
        if (!isPhoto(x) || k === lastSlot) return;
        pool.forEach(function (p) {
          if (shown.indexOf(p) < 0 && resting.indexOf(p) < 0 && fits(p, k)) fresh.push([k, p]);
        });
      });
      if (fresh.length) {
        var f = fresh[rnd(fresh.length)], out = shown[f[0]];
        show([[f[0], f[1]]]);
        resting.push(out);
        while (resting.length > cap) resting.shift();
        lastSlot = f[0];
        return;
      }
    }

    /* 2. otherwise two tiles trade places. Every allowed trade is listed
          first and one is drawn from the list, so a turn is never wasted. */
    var before = clump(shown), moves = [];
    for (var a = 0; a < SLOTS; a++) for (var b = a + 1; b < SLOTS; b++) {
      if (shown[a] === shown[b] || a === lastSlot || b === lastSlot) continue;
      if (fixed(a) || fixed(b)) continue;
      if (!fits(shown[b], a) || !fits(shown[a], b)) continue;
      var trial = shown.slice(); trial[a] = shown[b]; trial[b] = shown[a];
      if (worse(clump(trial), before)) continue;
      moves.push([a, b]);
    }
    if (!moves.length) return;
    var m = moves[rnd(moves.length)], x0 = shown[m[0]], x1 = shown[m[1]];
    show([[m[0], x1], [m[1], x0]]);
    lastSlot = m[rnd(2)];
  }

  /* ---- enlarge: whatever is in the tiles at the moment of the click */
  function enlarge(k) {
    if (!isPhoto(shown[k]) || !window.wlLightbox) return;
    var list = [], n = 0;
    shown.forEach(function (x, j) {
      if (!isPhoto(x)) return;
      if (j === k) n = list.length;
      list.push({ src: x.src });
    });
    window.wlLightbox.open(list, n, tiles[k]);
  }
  tiles.forEach(function (el, k) {
    el.addEventListener("click", function () { enlarge(k); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enlarge(k); }
    });
  });

  /* ---- start once every photo has reported its shape */
  function orient(im) {
    var w = im.naturalWidth, h = im.naturalHeight;
    return { r: w / h, o: h > w * 1.05 ? "portrait" : w > h * 1.05 ? "landscape" : "square" };
  }
  Promise.all(names.map(function (n) {
    return new Promise(function (done) {
      var im = new Image();
      im.onload = function () { var s = orient(im); done({ src: dir + n, r: s.r, o: s.o }); };
      im.onerror = function () { done(null); };
      im.src = dir + n;
    });
  })).then(function (list) {
    pool = list.filter(Boolean);
    measure();
    shown = place();
    shown.forEach(function (x, k) { paint(tiles[k].querySelector(".tc-face.on"), x); label(k); });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(tick, EVERY);
    checkVisible();
    window.addEventListener("resize", measure);
  });
})();
