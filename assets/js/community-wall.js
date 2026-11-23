/* Community wall: the real comment screenshots (community-data.js) as a mixed masonry wall.
   Desktop 3 columns, tablet 2, phone 1. 12 to start, then "Load more" adds 12 at a time.
   While more are waiting the columns are cut level and the bottom fades into the page.
   A click opens the screenshot large (arrows or the left and right keys move on).
   No visible Ambassador label on the cards (Piyush, 17 Nov 2026); the alt text carries it.

   Mix (Piyush, 23 Nov 2026: "mix it up a bit ... give it a good mix"; "comments from the same
   people dont have them recurring next to each other, mix it up and move them"):
   - Big cards: a tall screenshot (a post, a photo, a long comment: natural height 520 px or
     more at 900 wide) spans two columns (the whole row on tablet and phone). Short plain
     comments stay one column wide, so the rhythm changes as you scroll.
   - Order: each person's items are spread evenly through the list, owners and ambassadors are woven evenly (owners stay the majority), then every card is placed one at a time at a computed position. A card is
     never put next to (above, below or beside, diagonals included) another card from the same
     person, and a person's cards are kept as far apart as the list allows. Because positions
     are computed (not left to the browser), the order and the neighbours are exact, and they
     hold after "Load more".
   - Images are only placed and scaled down, never upscaled past their natural width, never cropped.
   The CSS for this wall is injected below and is scoped to #tyCm (class tycx-). */
(function () {
  "use strict";
  var BATCH = 12, BIG_H = 520, WINDOW = 14;
  var wall = document.getElementById("tyCm"), btn = document.getElementById("tyCmMore"), src = window.WL_COMMUNITY || [];
  if (!wall || !src.length) return;

  /* ---------------------------------------------------------------- scoped CSS */
  var css = document.createElement("style");
  css.id = "tycx-css";
  css.textContent =
    "#tyCm.tycx-wall{display:block;position:relative}" +
    "#tyCm.tycx-wall.tycx-part{overflow:hidden}" +
    "#tyCm.tycx-wall.tycx-part::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2.4rem;background:linear-gradient(to bottom,rgba(248,248,247,0),#F8F8F7 92%);pointer-events:none;z-index:2}" +
    "#tyCm .tycx-card{position:absolute;box-sizing:border-box;margin:0;animation:tycx-in .45s ease both;transition:box-shadow .25s ease}" +
    "#tyCm .tycx-card:hover{box-shadow:0 .05rem .22rem rgba(17,17,17,.1)}" +
    "#tyCm .tycx-card img{display:block;width:100%;height:100%}" +
    "@keyframes tycx-in{from{opacity:0;transform:translate3d(0,.1rem,0)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion:reduce){#tyCm .tycx-card{animation:none;transition:none}}" +
    ".ty-lb.tycx-lb-tall{overflow-y:auto;align-items:flex-start;justify-content:center}" +
    ".ty-lb.tycx-lb-tall img{max-height:none;width:min(900px,100%);height:auto;margin:0 auto}" +
    ".ty-lb.tycx-lb-tall button{position:fixed}";
  document.head.appendChild(css);

  /* ---------------------------------------------------------------- helpers */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function alt(d) { return "Comment from " + d.name + " on " + d.platform + (d.type === "ambassador" ? " (Wonderland ambassador)" : ""); }
  /* one key per person: "Sharyn (Wheatland Wanderers)" and "Wheatland Wanderers" are the same account */
  function keyOf(d) {
    var n = String(d.name || ""), m = n.match(/\(([^)]+)\)/);
    return (m ? m[1] : n).toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  var items = src.map(function (d, i) {
    return { d: d, i: i, key: keyOf(d), amb: d.type === "ambassador", big: d.h >= BIG_H };
  });

  /* spread each person evenly through a list: item j of n goes at (j + 0.5) / n */
  function spread(list) {
    var by = {};
    list.forEach(function (it) { (by[it.key] = by[it.key] || []).push(it); });
    var out = [];
    Object.keys(by).forEach(function (k) {
      var g = by[k]; g.forEach(function (it, j) { out.push({ it: it, f: (j + 0.5) / g.length, n: g.length, i: it.i }); });
    });
    out.sort(function (a, b) { return a.f - b.f || b.n - a.n || a.i - b.i; });
    return out.map(function (o) { return o.it; });
  }
  /* base order: owners and ambassadors woven evenly (owners are the larger share, so they lead and stay the majority
     all the way down), each person spread through their own list first */
  function baseQueue(rnd) {
    var jo = rnd ? rnd() * 0.5 : 0.3, ja = rnd ? rnd() * 0.5 + 0.4 : 0.7;
    var o = spread(items.filter(function (it) { return !it.amb; })), a = spread(items.filter(function (it) { return it.amb; })), q = [];
    var mix = o.map(function (it, j) { return { it: it, f: (j + jo) / o.length, o: 1 }; })
      .concat(a.map(function (it, j) { return { it: it, f: (j + ja) / a.length, o: 0 }; }));
    mix.sort(function (x, y) { return x.f - y.f || y.o - x.o; });
    mix.forEach(function (m) { q.push(m.it); });
    if (rnd) for (var k = 0, nSwap = 2 + Math.floor(rnd() * 10); k < nSwap; k++) {   /* a few short hops, so another run can end differently */
      var i = Math.floor(rnd() * q.length), j = Math.min(q.length - 1, i + 1 + Math.floor(rnd() * 8)), t = q[i]; q[i] = q[j]; q[j] = t;
    }
    return q;
  }

  /* ---------------------------------------------------------------- layout */
  var seq = [], pos = [], shown = 0, colInfo = { n: 3, w: 0, gap: 12 };

  function near(a, b, gap) {
    var hx = Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)), vy = Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h));
    var ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 0 && vy <= gap * 2) return true;            /* stacked */
    if (hx <= gap * 2 && oy > -150) return true;           /* side by side, diagonals included (within 150 px up or down) */
    return false;
  }

  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* one placement run; seed 0 is the plain run, other seeds shake the order a little */
  function attempt(seed, n, cw, gap) {
    var r = seed ? rng(seed) : null, win = WINDOW + (seed ? Math.floor(r() * 12) : 0), shake = seed % 3 === 0 ? 9 : 2.5;
    var queue = baseQueue(r), bottoms = [], c, seq = [], pos = [], viol = 0, soft = 0;
    for (c = 0; c < n; c++) bottoms.push(0);
    var prev = null, lastBig = -9;

    function slot(it, col, span) {
      var slotW = span * cw + (span - 1) * gap, w = Math.min(slotW, it.d.w + 2), h = (w - 2) * it.d.h / it.d.w + 2;
      var y = 0;
      for (var k = col; k < col + span; k++) y = Math.max(y, bottoms[k]);
      if (y > 0) y += gap;
      var waste = 0;
      for (k = col; k < col + span; k++) waste += y - (bottoms[k] > 0 ? bottoms[k] + gap : 0);
      return { x: col * (cw + gap) + (slotW - w) / 2, y: y, w: w, h: Math.round(h), col: col, span: span, waste: waste };
    }

    while (queue.length) {
      var best = null, wq = queue.slice(0, win), minB = Math.min.apply(null, bottoms);
      for (var pass = 0; pass < 2 && !best; pass++) {      /* pass 1 keeps the columns level; pass 2 only if nothing fits */
        wq.forEach(function (it, qi) {
          var span = it.big && n > 1 ? 2 : 1, opts = [];
          for (var col = 0; col + span <= n; col++) opts.push(slot(it, col, span));
          opts.forEach(function (p) {
            var top = Math.min.apply(null, bottoms.slice(p.col, p.col + span));
            if (pass === 0 && span === 1 && top - minB > 220) return;
            var score = (r ? r() * shake : 0) + qi * 2 + p.waste / (span === 1 ? 3 : 5) + (span === 1 ? (top - minB) / 6 : 0), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            for (var j = 0; j < pos.length; j++) {
              var o = pos[j];
              if (o.it.key !== it.key) continue;
              if (near(p, o, gap)) score += 10000;
              else {
                var dist = Math.abs(cx - (o.x + o.w / 2)) * 0.6 + Math.abs(cy - (o.y + o.h / 2));
                if (dist < 1100) score += (1100 - dist) / 25;
              }
              if (seq.length - j < 6) score += 8;
            }
            if (prev && prev.amb === it.amb && it.amb) score += 3;
            if (prev && prev.big === it.big) score += 2;
            if (it.big && seq.length - lastBig < 5) score += 8;
            if (it.big && !seq.length) score += 6;
            if (!best || score < best.score) best = { score: score, it: it, p: p, qi: qi };
          });
        });
      }
      queue.splice(queue.indexOf(best.it), 1);
      var p = best.p; p.it = best.it;
      if (best.score >= 10000) viol++; else soft += best.score || 0;
      for (c = p.col; c < p.col + p.span; c++) bottoms[c] = p.y + p.h;
      if (best.it.big) lastBig = seq.length;
      seq.push(best.it); pos.push(p); prev = best.it;
    }
    return { seq: seq, pos: pos, viol: viol, soft: soft };
  }

  function compute() {
    var W = wall.clientWidth || 800;
    var n = window.matchMedia("(max-width:600px)").matches ? 1 : window.matchMedia("(max-width:900px)").matches ? 2 : 3;
    var gap = parseFloat(getComputedStyle(wall).columnGap) || 12;
    var cw = (W - gap * (n - 1)) / n, best = null;
    colInfo = { n: n, w: cw, gap: gap };
    for (var seed = 0; seed < 200; seed++) {
      var a = attempt(seed, n, cw, gap);
      if (!best || a.viol < best.viol || (a.viol === best.viol && a.soft < best.soft)) best = a;
      if (!a.viol && a.soft < 40) break;   /* clean and tidy enough */
    }
    seq = best.seq; pos = best.pos;
  }

  /* ---------------------------------------------------------------- draw */
  function card(it, k) {
    var d = it.d, p = pos[k], b = document.createElement("button");
    b.type = "button"; b.className = "ty-cmc tycx-card"; b.setAttribute("data-i", k); b.setAttribute("aria-label", alt(d) + ": open large");
    b.style.cssText = "left:" + p.x.toFixed(1) + "px;top:" + p.y + "px;width:" + p.w.toFixed(1) + "px;height:" + p.h + "px";
    b.innerHTML = '<img src="' + esc(d.src) + '" width="' + d.w + '" height="' + d.h + '" alt="' + esc(alt(d)) + '" loading="lazy">';
    return b;
  }
  function render(count) {
    compute();
    wall.classList.add("tycx-wall");
    wall.innerHTML = "";
    shown = Math.min(seq.length, count);
    for (var k = 0; k < shown; k++) wall.appendChild(card(seq[k], k));
    fit();
  }
  function fit() {
    var more = shown < seq.length, n = colInfo.n, bottoms = [], c, k;
    for (c = 0; c < n; c++) bottoms.push(0);
    for (k = 0; k < shown; k++) for (c = pos[k].col; c < pos[k].col + pos[k].span; c++) bottoms[c] = Math.max(bottoms[c], pos[k].y + pos[k].h);
    wall.classList.toggle("tycx-part", more);
    wall.style.height = (more ? Math.min.apply(null, bottoms) : Math.max.apply(null, bottoms)) + "px";
    if (btn) btn.parentNode.hidden = !more;
  }
  function more() {
    var end = Math.min(seq.length, shown + BATCH);
    for (; shown < end; shown++) wall.appendChild(card(seq[shown], shown));
    fit();
  }
  if (btn) btn.addEventListener("click", more);

  /* ---------------------------------------------------------------- lightbox */
  var lb, lbImg, at = 0, opener;
  function lbShow(k) {
    at = (k + seq.length) % seq.length; var d = seq[at].d;
    lbImg.src = d.src; lbImg.alt = alt(d);
    var tall = d.h / d.w > 1.6;
    lb.classList.toggle("tycx-lb-tall", tall); lb.scrollTop = 0;
  }
  function lbClose() { if (!lb) return; lb.hidden = true; lbImg.removeAttribute("src"); document.documentElement.classList.remove("ty-lb-open"); if (opener) opener.focus(); }
  function lbOpen(k, o) {
    if (!lb) {
      lb = document.createElement("div"); lb.className = "ty-lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Community comment");
      lb.innerHTML = '<button type="button" class="ty-lb-x" aria-label="Close">&times;</button><button type="button" class="ty-lb-p" aria-label="Previous comment">&#8249;</button><img alt=""><button type="button" class="ty-lb-n" aria-label="Next comment">&#8250;</button>';
      lbImg = lb.querySelector("img"); document.body.appendChild(lb);
      lb.addEventListener("click", function (e) {
        if (e.target.classList.contains("ty-lb-p")) lbShow(at - 1);
        else if (e.target.classList.contains("ty-lb-n")) lbShow(at + 1);
        else if (e.target !== lbImg) lbClose();
      });
      document.addEventListener("keydown", function (e) {
        if (!lb || lb.hidden) return;
        if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbShow(at - 1); else if (e.key === "ArrowRight") lbShow(at + 1);
      });
    }
    opener = o; lb.hidden = false; document.documentElement.classList.add("ty-lb-open"); lbShow(k); lb.querySelector(".ty-lb-x").focus();
  }
  wall.addEventListener("click", function (e) { var b = e.target.closest(".ty-cmc"); if (b) lbOpen(+b.getAttribute("data-i"), b); });

  /* ---------------------------------------------------------------- go */
  render(BATCH);
  var rt, lastW = wall.clientWidth;
  window.addEventListener("load", function () { if (wall.clientWidth !== lastW) { lastW = wall.clientWidth; render(shown || BATCH); } });
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (wall.clientWidth !== lastW) { lastW = wall.clientWidth; render(shown || BATCH); } }, 120);
  });
})();
