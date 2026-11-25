/* "Inside our caravans" (above the FAQs). Sample mode: builds itself only when the URL has ?inside=cover|row|stagger|spot
   and optionally &style=a|b. One portrait reel per van. A card with `video` plays it muted when it is the active one. */
(function () {
  var QS = new URLSearchParams(location.search);
  var layout = (QS.get("inside") || "").toLowerCase();
  if (!layout || !window.matchMedia("(min-width: 901px)").matches) return;
  if (["cover", "row", "stagger", "spot"].indexOf(layout) < 0) layout = "cover";
  var style = (QS.get("style") || "a").toLowerCase() === "b" ? "b" : "a";

  /* one of each van. video = the Instagram reel; no video = placeholder tile until that reel is supplied */
  var CARDS = [
    { id: "solara", name: "Solara", sub: "Composite off-road", cap: "Step inside the Solara",    ph: "assets/img/experience/range/solara.jpg" },
    { id: "amaroo", name: "Amaroo", sub: "Classic off-road",   cap: "4 bunks, family of 6",      video: "assets/video/inside-amaroo.mp4", img: "assets/video/inside-amaroo.jpg" },
    { id: "xtr",    name: "XTR",    sub: "Extreme off-road",   cap: "The best 3 bunk family van", video: "assets/video/inside-xtr.mp4",    img: "assets/video/inside-xtr.jpg" },
    { id: "hornet", name: "Hornet", sub: "Lightweight off-road", cap: "Step inside the Hornet",  ph: "assets/img/experience/range/hornet.jpg" }
  ];
  var AR = '<svg viewBox="0 0 24 24"><path d="%d"/></svg>';
  var ARROW = AR.replace("%d", "M5 12h14M13 6l6 6-6 6");
  var SND = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="x" d="M17 9l4 6M21 9l-4 6"/></svg>';

  function media(c, withCap) {
    return '<div class="ins-media' + (c.ph ? " is-ph" : "") + '">' +
      (c.ph ? '<img class="ph" src="' + c.ph + '" alt="' + c.name + '"><span class="ins-soon">Reel to come</span>'
            : '<img src="' + c.img + '" alt="">' + '<video src="' + c.video + '" poster="' + c.img + '" muted loop playsinline preload="none"></video>') +
      (withCap && c.cap && !c.video ? '<span class="ins-cap">' + c.cap + '</span>' : '') +
      (c.video ? '<button class="ins-snd is-muted" type="button" aria-label="Sound on or off">' + SND + '</button>' : '') +
    '</div>';
  }
  function info(c) {
    return '<div class="ins-info"><img src="assets/img/home/range/' + c.id + '.png" alt=""><div><div class="ins-name">' + c.name + '</div><div class="ins-sub">' + c.sub + '</div></div></div>';
  }
  function more() { return '<a class="ins-more" href="range.html">See model ' + ARROW + '</a>'; }

  var sec = document.createElement("section");
  sec.className = "ins ins--" + style + " ins--" + layout;
  sec.setAttribute("aria-label", "Inside our caravans");
  var title = '<h2 class="ins-title">Inside our caravans</h2>';
  var play = function (el, on) {
    var v = el.querySelector("video"); if (!v) return;
    if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
  };

  /* sound buttons (all layouts) */
  function wireSound() {
    sec.addEventListener("click", function (e) {
      var b = e.target.closest(".ins-snd"); if (!b) return;
      e.stopPropagation();
      var v = b.parentNode.querySelector("video");
      v.muted = !v.muted; b.classList.toggle("is-muted", v.muted);
    }, true);
  }

  if (layout === "cover") buildCover(); else if (layout === "row") buildRow(); else if (layout === "stagger") buildStagger(); else buildSpot();
  wireSound();

  /* ---------- 1. coverflow: centre reel bigger ---------- */
  function buildCover() {
    var W = 2.9, WC = 3.5, GAP = 0.2, at = 1;
    sec.style.setProperty("--w", W + "rem"); sec.style.setProperty("--wc", WC + "rem"); sec.style.setProperty("--gap", GAP + "rem");
    sec.innerHTML = title + '<div class="ins-stage"><div class="ins-track"></div></div>' +
      '<div class="ins-arrows"><button class="ins-arrow" data-d="-1" type="button" aria-label="Previous">' + AR.replace("%d", "M15 5l-7 7 7 7") + '</button>' +
      '<button class="ins-arrow" data-d="1" type="button" aria-label="Next">' + AR.replace("%d", "M9 5l7 7-7 7") + '</button></div>';
    var track = sec.querySelector(".ins-track"), stage = sec.querySelector(".ins-stage");
    var cards = CARDS.map(function (c, i) {
      var el = document.createElement("div"); el.className = "ins-card";
      el.innerHTML = media(c, true) + info(c) + more();
      el.addEventListener("click", function (e) { if (i !== at && !e.target.closest("a")) go(i); });
      track.appendChild(el); return el;
    });
    var prev = sec.querySelector('[data-d="-1"]'), next = sec.querySelector('[data-d="1"]');
    var rem = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; };
    function show() {
      var r = rem();
      cards.forEach(function (el, i) { el.classList.toggle("is-on", i === at); play(el, i === at); });
      var cx = at * (W + GAP) * r + (WC * r) / 2;
      track.style.transform = "translateX(" + Math.round(stage.clientWidth / 2 - cx) + "px)";
      prev.disabled = at === 0; next.disabled = at === cards.length - 1;
    }
    function go(i) { at = Math.max(0, Math.min(cards.length - 1, i)); show(); }
    prev.addEventListener("click", function () { go(at - 1); });
    next.addEventListener("click", function () { go(at + 1); });
    sec.tabIndex = 0;
    sec.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(at - 1); else if (e.key === "ArrowRight") go(at + 1); });
    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 50) go(at + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    window.addEventListener("resize", show);
    sec._after = function () { show(); requestAnimationFrame(show); if (document.fonts && document.fonts.ready) document.fonts.ready.then(show); };
  }

  /* ---------- 2. four-up row: one tall tile per van, all playing ---------- */
  function buildRow() {
    sec.innerHTML = title + '<div class="ins-row">' + CARDS.map(function (c) {
      return '<div class="ins-tile">' + media(c, false) + '<div class="ins-over"><div class="ins-name">' + c.name + '</div><div class="ins-sub">' + c.sub + '</div></div>' + '</div>';
    }).join("") + '</div>';
    var tiles = [].slice.call(sec.querySelectorAll(".ins-tile"));
    sec._after = function () { tiles.forEach(function (t) { play(t, true); }); };
  }

  /* ---------- 3. staggered: offset heights, big model names ---------- */
  function buildStagger() {
    sec.innerHTML = title + '<div class="ins-stg">' + CARDS.map(function (c, i) {
      return '<a class="ins-tile" href="range.html" style="--o:' + [0.7, 0, 0.45, 1.1][i] + 'rem">' + media(c, false) +
        '<div class="ins-over"><span class="ins-num">0' + (i + 1) + '</span><div class="ins-name">' + c.name + '</div><div class="ins-sub">' + c.sub + '</div></div>' + '</a>';
    }).join("") + '</div>';
    var tiles = [].slice.call(sec.querySelectorAll(".ins-tile"));
    sec._after = function () { tiles.forEach(function (t) { play(t, true); }); };
  }

  /* ---------- 4. spotlight: one big reel, model list beside it ---------- */
  function buildSpot() {
    var at = 1;
    sec.innerHTML = '<div class="ins-spot"><div class="ins-spot-l"></div><div class="ins-spot-r">' + title +
      '<ul class="ins-tabs">' + CARDS.map(function (c, i) {
        return '<li><button type="button" class="ins-tab" data-i="' + i + '"><img src="assets/img/home/range/' + c.id + '.png" alt=""><span><span class="ins-name">' + c.name + '</span><span class="ins-sub">' + c.sub + '</span></span>' + ARROW + '</button></li>';
      }).join("") + '</ul><a class="ins-more ins-more--solo" href="range.html">See the full range ' + ARROW + '</a></div></div>';
    var left = sec.querySelector(".ins-spot-l");
    var stages = CARDS.map(function (c) { var d = document.createElement("div"); d.className = "ins-stage1"; d.innerHTML = media(c, true); left.appendChild(d); return d; });
    var tabs = [].slice.call(sec.querySelectorAll(".ins-tab"));
    function show() { stages.forEach(function (s, i) { s.classList.toggle("is-on", i === at); play(s, i === at); }); tabs.forEach(function (t, i) { t.classList.toggle("is-on", i === at); }); }
    tabs.forEach(function (t) { t.addEventListener("click", function () { at = +t.getAttribute("data-i"); show(); }); });
    sec._after = show;
  }

  /* above the FAQs */
  var faq = document.querySelector("section.faq");
  if (!faq) return;
  faq.parentNode.insertBefore(sec, faq);
  if (sec._after) sec._after();

  /* sample switcher */
  var bar = document.createElement("div");
  bar.className = "ins-bar";
  bar.innerHTML = '<b>Layout</b>' + [["cover", "Coverflow"], ["row", "Four-up"], ["stagger", "Staggered"], ["spot", "Spotlight"]].map(function (p) {
      return '<a class="' + (p[0] === layout ? "is-cur" : "") + '" href="?inside=' + p[0] + '&style=' + style + '">' + p[1] + '</a>'; }).join("") +
    '<b>Style</b>' + [["a", "Dark"], ["b", "Light"]].map(function (s) {
      return '<a class="' + (s[0] === style ? "is-cur" : "") + '" href="?inside=' + layout + '&style=' + s[0] + '">' + s[1] + '</a>'; }).join("");
  document.body.appendChild(bar);
  setTimeout(function () { window.scrollTo(0, sec.getBoundingClientRect().top + window.pageYOffset - 150); }, 50);
})();
