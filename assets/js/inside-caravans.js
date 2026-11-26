/* "Inside our caravans" (above the FAQs, desktop only). A row of tall reels: the chosen one grows and plays (muted, with a sound
   button), the others rest on their first frame. Arrows, the arrow keys, a swipe or a click on a neighbour move it.
   Each card carries the model and its layout code. The reels are the Wonderland / Outbound RVs Instagram posts. */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;
  var faq = document.querySelector("section.faq");
  if (!faq) return;

  var CARDS = [
    { name: "Solara", code: "2100Q1-F2.0", type: "Family", video: "assets/video/inside-solara.mp4",         img: "assets/video/inside-solara.jpg" },
    { name: "Hornet", code: "1907Q1-F2.0", type: "Family", video: "assets/video/inside-hornet.mp4",         img: "assets/video/inside-hornet.jpg" },
    { name: "Amaroo", code: "1907Q1-F3.0", type: "Family", video: "assets/video/inside-amaroo-triple.mp4",  img: "assets/video/inside-amaroo-triple.jpg" },
    { name: "XTR",    code: "2300Q-F3.4", type: "Family",  video: "assets/video/inside-xtr.mp4",            img: "assets/video/inside-xtr.jpg" },
    { name: "Amaroo", code: "2107EW-F4.3", type: "Family", video: "assets/video/inside-amaroo.mp4",         img: "assets/video/inside-amaroo.jpg" }
  ];
  var W = 2.9, WC = 3.5, GAP = 0.2, at = 2;      /* rem; the chosen card is wider, and so taller */
  var AR = '<svg viewBox="0 0 24 24"><path d="%d"/></svg>';
  var SND = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="x" d="M17 9l4 6M21 9l-4 6"/></svg>';

  var sec = document.createElement("section");
  sec.className = "ins";
  sec.setAttribute("aria-label", "Inside our caravans");
  sec.style.setProperty("--w", W + "rem"); sec.style.setProperty("--wc", WC + "rem"); sec.style.setProperty("--gap", GAP + "rem");
  sec.innerHTML =
    '<h2 class="ins-title">Inside our caravans</h2>' +
    '<p class="ins-lede">Discover the layouts in the vans we\u2019ve built.</p>' +
    '<div class="ins-stage"><div class="ins-track"></div></div>' +
    '<div class="ins-arrows">' +
      '<button class="ins-arrow" data-d="-1" type="button" aria-label="Previous">' + AR.replace("%d", "M15 5l-7 7 7 7") + '</button>' +
      '<button class="ins-arrow" data-d="1" type="button" aria-label="Next">' + AR.replace("%d", "M9 5l7 7-7 7") + '</button>' +
    '</div>';
  var track = sec.querySelector(".ins-track"), stage = sec.querySelector(".ins-stage");
  var cards = CARDS.map(function (c, i) {
    var el = document.createElement("div");
    el.className = "ins-card";
    el.innerHTML =
      '<div class="ins-media"><img src="' + c.img + '" alt="' + c.name + ' ' + c.code + '">' +
        '<video src="' + c.video + '" poster="' + c.img + '" muted loop playsinline preload="none"></video>' +
        '<button class="ins-snd is-muted" type="button" aria-label="Sound on or off">' + SND + '</button>' +
        '<div class="ins-over"><div class="ins-name"><span>' + c.name + '</span><i class="ins-div" aria-hidden="true"></i><em>' + c.type + '</em></div><div class="ins-sub">' + c.code + '</div>' +
          '<a class="ins-more" href="range.html" tabindex="-1">See model ' + AR.replace("%d", "M9 5l7 7-7 7") + '</a></div>' +
      '</div>';
    el.addEventListener("click", function (e) { if (i !== at && !e.target.closest("a")) go(i); });
    track.appendChild(el);
    return el;
  });
  sec.addEventListener("click", function (e) {
    var b = e.target.closest(".ins-snd"); if (!b) return;
    var v = b.parentNode.querySelector("video"); v.muted = !v.muted; b.classList.toggle("is-muted", v.muted);
  });
  var prev = sec.querySelector('[data-d="-1"]'), next = sec.querySelector('[data-d="1"]');
  function rem() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; }
  function show() {
    var r = rem();
    cards.forEach(function (el, i) {
      var on = i === at, v = el.querySelector("video");
      el.classList.toggle("is-on", on);
      el.querySelector(".ins-more").tabIndex = on ? 0 : -1;
      if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else { v.pause(); v.muted = true; el.querySelector(".ins-snd").classList.add("is-muted"); try { v.currentTime = 0; } catch (e) {} }
    });
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

  faq.parentNode.insertBefore(sec, faq);
  show();
  requestAnimationFrame(show);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(show);
})();
