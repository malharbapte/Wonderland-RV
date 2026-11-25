/* "Inside our caravans" viewer. Sample mode: builds itself only when the URL has ?inside=1|2|3 (where to put it)
   and optionally &style=a|b. Cards take a poster photo now; give one a data-video (vertical mp4) and it plays muted on the centre card. */
(function () {
  var QS = new URLSearchParams(location.search);
  var place = QS.get("inside");
  if (!place || !window.matchMedia("(min-width: 901px)").matches) return;
  var style = (QS.get("style") || "a").toLowerCase() === "b" ? "b" : "a";

  var CARDS = [
    { id: "amaroo", name: "Amaroo", sub: "Classic off-road",   img: "assets/img/home/slide-1.jpg",               pos: "62% 50%", cap: "Built for the tough stuff" },
    { id: "solara", name: "Solara", sub: "Composite off-road", img: "assets/img/home/dream-field.jpg",           pos: "86% 50%", cap: "Step inside the Solara" },
    { id: "solara", name: "Solara", sub: "Composite off-road", img: "assets/img/home/slide-6.jpg",               pos: "32% 50%", cap: "A kitchen made for two" },
    { id: "amaroo", name: "Amaroo", sub: "Classic off-road",   img: "assets/img/home/slide-5.jpg",               pos: "55% 50%", cap: "Room for the whole family" },
    { id: "xtr",    name: "XTR",    sub: "Extreme off-road",   img: "assets/img/home/dream-family-xtr-desk.jpg", pos: "40% 50%", cap: "Goes where the road ends" }
  ];
  var W = 2.9, WC = 3.5, GAP = 0.2;           // rem; the centre card is bigger
  var AR = '<svg viewBox="0 0 24 24"><path d="%d"/></svg>';

  var sec = document.createElement("section");
  sec.className = "ins ins--" + style;
  sec.setAttribute("aria-roledescription", "carousel");
  sec.setAttribute("aria-label", "Inside our caravans");
  sec.style.setProperty("--w", W + "rem"); sec.style.setProperty("--wc", WC + "rem"); sec.style.setProperty("--gap", GAP + "rem");
  sec.innerHTML =
    '<h2 class="ins-title">Inside our caravans</h2>' +
    '<div class="ins-stage"><div class="ins-track"></div></div>' +
    '<div class="ins-arrows">' +
      '<button class="ins-arrow" data-d="-1" type="button" aria-label="Previous">' + AR.replace("%d", "M15 5l-7 7 7 7") + '</button>' +
      '<button class="ins-arrow" data-d="1" type="button" aria-label="Next">' + AR.replace("%d", "M9 5l7 7-7 7") + '</button>' +
    '</div>';
  var track = sec.querySelector(".ins-track"), stage = sec.querySelector(".ins-stage");
  var cards = CARDS.map(function (c, i) {
    var el = document.createElement("div");
    el.className = "ins-card"; if (c.video) el.className += " has-video";
    el.innerHTML =
      '<div class="ins-media"><img src="' + c.img + '" alt="" style="object-position:' + c.pos + '">' +
        (c.video ? '<video src="' + c.video + '" muted loop playsinline preload="none"></video>' : '') +
        '<span class="ins-cap">' + c.cap + '</span>' +
        '<button class="ins-snd" type="button" aria-label="Sound on or off"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zM17 9l4 6M21 9l-4 6"/></svg></button>' +
      '</div>' +
      '<div class="ins-info"><img src="assets/img/home/range/' + c.id + '.png" alt=""><div><div class="ins-name">' + c.name + '</div><div class="ins-sub">' + c.sub + '</div></div></div>' +
      '<a class="ins-more" href="range.html">See model ' + AR.replace("%d", "M5 12h14M13 6l6 6-6 6") + '</a>';
    el.addEventListener("click", function (e) { if (i !== at && !e.target.closest("a")) go(i); });
    track.appendChild(el);
    return el;
  });
  var prev = sec.querySelector('[data-d="-1"]'), next = sec.querySelector('[data-d="1"]');
  var at = 2;

  function rem() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; }
  function show() {
    var r = rem();
    cards.forEach(function (el, i) {
      var on = i === at;
      el.classList.toggle("is-on", on);
      var v = el.querySelector("video");
      if (v) { if (on) { v.play && v.play().catch(function () {}); } else { v.pause(); } }
    });
    var cx = at * (W + GAP) * r + (WC * r) / 2;
    track.style.transform = "translateX(" + Math.round(stage.clientWidth / 2 - cx) + "px)";
    prev.disabled = at === 0; next.disabled = at === cards.length - 1;
  }
  function go(i) { at = Math.max(0, Math.min(cards.length - 1, i)); show(); }
  prev.addEventListener("click", function () { go(at - 1); });
  next.addEventListener("click", function () { go(at + 1); });
  sec.setAttribute("tabindex", "0");
  sec.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(at - 1); else if (e.key === "ArrowRight") go(at + 1); });
  var x0 = null;
  stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  stage.addEventListener("pointerup", function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 50) go(at + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  window.addEventListener("resize", show);

  /* where it goes: 1 after Explore our range, 2 after Why choose us, 3 just before the videos */
  var anchor = place === "2" ? document.querySelector(".wyc")
             : place === "3" ? document.querySelector(".coty")
             : document.querySelector(".rvx");
  if (!anchor) return;
  if (place === "3") anchor.parentNode.insertBefore(sec, anchor.previousElementSibling && anchor.previousElementSibling.classList.contains("band") ? anchor.previousElementSibling : anchor);
  else anchor.parentNode.insertBefore(sec, anchor.nextSibling);
  show();
  requestAnimationFrame(show);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(show);

  var bar = document.createElement("div");
  bar.className = "ins-bar";
  function link(label, p, s) {
    var cur = (p === place && s === style) ? " is-cur" : "";
    return '<a class="' + cur.trim() + '" href="?inside=' + p + '&style=' + s + '">' + label + '</a>';
  }
  bar.innerHTML = '<b>Style</b>' + ["a", "b"].map(function (s) { return '<a class="' + (s === style ? "is-cur" : "") + '" href="?inside=' + place + '&style=' + s + '">' + (s === "a" ? "A dark" : "B light") + '</a>'; }).join("") +
    '<b>Place</b>' + [["1", "After range"], ["2", "After Why choose us"], ["3", "Before videos"]].map(function (p) { return '<a class="' + (p[0] === place ? "is-cur" : "") + '" href="?inside=' + p[0] + '&style=' + style + '">' + p[1] + '</a>'; }).join("") +
    '<i>photos stand in for the reels</i>';
  document.body.appendChild(bar);
  setTimeout(function () { window.scrollTo(0, sec.getBoundingClientRect().top + window.pageYOffset - 150); }, 50);
})();
