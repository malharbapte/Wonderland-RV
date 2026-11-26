/* "Different layouts we offer" (above the FAQs, desktop only). A row of tall reels: the chosen one grows and plays (muted, sound button),
   the others rest on their first frame. A click on a reel opens its specification panel from the right. Arrows, the arrow keys or a swipe move the row.
   The panel slides in from the LEFT as a list of rows (the chosen sample).
   Specs are the stock vans shown in each reel (wonderlandrv.com.au/stock listings), to be checked against the production jotform. */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;
  var faq = document.querySelector("section.faq");
  if (!faq) return;
  var VAR = "1", ANIM = "slide";
  var TBC = "To be confirmed";

  var CARDS = [
    { name: "Solara", type: "Family", kind: "Composite off-road", video: "assets/video/inside-solara.mp4", img: "assets/video/inside-solara.jpg",
      s: { len: "8.8 m", tare: "3,000 kg", atm: "4,500 kg", code: "2100Q1-F2.0", sleeps: "4", susp: "4.5T Cruisemaster XT L3 airbag with BCS levelling",
           elec: "Nexus and Victron system, 900Ah lithium, 3000W inverter, 1350W solar", water: "2 x 100L fresh, 70L and 90L drinking, 100L grey" } },
    { name: "Hornet", type: "Family", kind: "Rugged off-road", video: "assets/video/inside-hornet.mp4", img: "assets/video/inside-hornet.jpg",
      s: { len: "8.6 m", tare: "2,909 kg", atm: "3,500 kg", code: "1907Q1-F2.0", sleeps: "4", susp: "4.5T Cruisemaster XT L3 manual",
           elec: "Victron system, 600Ah lithium, 3000VA inverter, 1550W solar", water: "2 x 100L fresh, 70L drinking, 100L grey" } },
    { name: "Amaroo", type: "Family", kind: "Classic off-road", video: "assets/video/inside-amaroo-triple.mp4", img: "assets/video/inside-amaroo-triple.jpg",
      s: { len: "8.2 m", tare: "2,803 kg", atm: "3,500 kg", code: "1907Q1-F3.0", sleeps: "5", susp: "4.5T Cruisemaster XT L3 manual airbag",
           elec: "Redarc Alpha 50 system, 400Ah lithium, 2600W inverter, 800W solar", water: "2 x 90 to 100L fresh, 100L grey" } },
    { name: "XTR", type: "Family", kind: "Extreme off-road", video: "assets/video/inside-xtr.mp4", img: "assets/video/inside-xtr.jpg",
      s: { len: TBC, tare: TBC, atm: TBC, code: "2300Q-F3.4", sleeps: TBC, susp: TBC, elec: TBC, water: TBC } },
    { name: "Amaroo", type: "Family", kind: "Classic off-road", video: "assets/video/inside-amaroo.mp4", img: "assets/video/inside-amaroo.jpg",
      s: { len: "9.0 m", tare: TBC, atm: "3,500 kg", code: "2107EW-F4.3", sleeps: "6", susp: "3.7T Tuff-Ride coil, airbag ready",
           elec: "Redarc Alpha 50 system, 600Ah Enerdrive lithium, 2600W inverter, 800W solar", water: "2 x 100L fresh, 100L grey" } }
  ];
  var ROWS = [["Travel length", "len"], ["Tare", "tare"], ["ATM", "atm"], ["Layout code", "code"], ["Sleeps", "sleeps"], ["Suspension", "susp"], ["Electrical", "elec"], ["Water", "water"]];
  var W = 3.48, WC = 4.2, GAP = 0.2, at = 2;      /* rem; the chosen card is wider, and so taller. Previews are 20% larger than the first version. */
  var AR = '<svg viewBox="0 0 24 24"><path d="%d"/></svg>';
  var SND = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="x" d="M17 9l4 6M21 9l-4 6"/></svg>';
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  var sec = document.createElement("section");
  sec.className = "ins";
  sec.setAttribute("aria-label", "Different layouts we offer");
  sec.style.setProperty("--w", W + "rem"); sec.style.setProperty("--wc", WC + "rem"); sec.style.setProperty("--gap", GAP + "rem");
  sec.innerHTML =
    '<h2 class="ins-title">Different layouts we offer</h2>' +
    '<p class="ins-lede">Discover the layouts in the vans we’ve built.</p>' +
    '<div class="ins-stage"><div class="ins-track"></div></div>' +
    '<div class="ins-foot">' +
      '<button class="ins-arrow" data-d="-1" type="button" aria-label="Previous">' + AR.replace("%d", "M15 5l-7 7 7 7") + '</button>' +
      '<button class="ins-arrow" data-d="1" type="button" aria-label="Next">' + AR.replace("%d", "M9 5l7 7-7 7") + '</button>' +
    '</div>';
  var track = sec.querySelector(".ins-track"), stage = sec.querySelector(".ins-stage");
  var cards = CARDS.map(function (c, i) {
    var el = document.createElement("div");
    el.className = "ins-card";
    el.setAttribute("role", "button"); el.setAttribute("aria-label", c.name + " " + c.s.code + ", open its specifications");
    el.innerHTML =
      '<div class="ins-media"><img src="' + c.img + '" alt="' + c.name + ' ' + c.s.code + '" loading="lazy">' +
        '<video src="' + c.video + '" poster="' + c.img + '" muted loop playsinline preload="none"></video>' +
        '<button class="ins-snd is-muted" type="button" aria-label="Sound on or off">' + SND + '</button>' +
        '<div class="ins-over"><div class="ins-name"><span>' + c.name + '</span><i class="ins-div" aria-hidden="true"></i><em>' + c.type + '</em></div><div class="ins-sub">' + c.s.code + '</div>' +
          '<span class="ins-more">Specifications ' + AR.replace("%d", "M9 5l7 7-7 7") + '</span></div>' +
      '</div>';
    el.addEventListener("click", function (e) {
      if (e.target.closest(".ins-snd")) return;
      if (i !== at) go(i);
      openSpec(i);
    });
    track.appendChild(el);
    return el;
  });
  sec.addEventListener("click", function (e) {
    var b = e.target.closest(".ins-snd"); if (!b) return;
    e.stopPropagation();
    var v = b.parentNode.querySelector("video"); v.muted = !v.muted; b.classList.toggle("is-muted", v.muted);
  }, true);
  var prev = sec.querySelector('[data-d="-1"]'), next = sec.querySelector('[data-d="1"]');
  var inView = false;
  function rem() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; }
  function show() {
    var r = rem();
    cards.forEach(function (el, i) {
      var on = i === at, v = el.querySelector("video");
      el.classList.toggle("is-on", on);
      if (on && inView) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else { v.pause(); if (!on) { v.muted = true; el.querySelector(".ins-snd").classList.add("is-muted"); try { v.currentTime = 0; } catch (e) {} } }
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

  /* ---- the specification panel ---- */
  var scrim = document.createElement("div"); scrim.className = "ins-scrim";
  var panel = document.createElement("aside");
  panel.className = "ins-spec ins-spec--" + ANIM + " ins-spec--v" + VAR; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-label", "Specifications"); panel.hidden = true;
  document.body.appendChild(scrim); document.body.appendChild(panel);
  var opened = false, curSpec = -1, closeT = 0;
  function specHTML(c) {
    var rows = ROWS.map(function (r) { var v = c.s[r[1]]; return '<div class="ins-sp-row' + (v === TBC ? " is-tbc" : "") + '"><dt>' + r[0] + '</dt><dd>' + esc(v) + "</dd></div>"; }).join("");
    return '<div class="ins-spec-in">' +
      '<button class="ins-spec-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19"/></svg></button>' +
      '<div class="ins-sp-head"><h3 class="ins-sp-name">' + c.name + '</h3><p class="ins-sp-kind">' + c.kind + " · " + c.type + '</p></div>' +
      '<div class="ins-sp-plan" data-ph="FLOORPLAN — ' + c.s.code + '"></div>' +
      '<dl class="ins-sp-list">' + rows + '</dl>' +
      '<p class="ins-sp-note">Specifications are for the van in the reel. Subject to change.</p>' +
      '<a class="btn-solid ins-sp-cta" href="range.html">Find your caravan</a>' +
    "</div>";
  }
  function openSpec(i) {
    clearTimeout(closeT);
    curSpec = i; panel.innerHTML = specHTML(CARDS[i]); panel.hidden = false;
    panel.querySelector(".ins-spec-x").addEventListener("click", closeSpec);
    var img = new Image(), plan = panel.querySelector(".ins-sp-plan"), code = CARDS[i].s.code;
    img.onload = function () { plan.style.backgroundImage = 'url("' + img.src + '")'; plan.classList.add("has-img"); }; img.src = "assets/img/build/plans/" + code + ".webp";
    void panel.offsetWidth;
    scrim.classList.add("is-open"); panel.classList.add("is-open"); document.body.classList.add("ins-lock"); opened = true;
    setTimeout(function () { var x = panel.querySelector(".ins-spec-x"); if (x) x.focus(); }, 400);
  }
  function closeSpec() {
    if (!opened) return;
    opened = false; scrim.classList.remove("is-open"); panel.classList.remove("is-open"); document.body.classList.remove("ins-lock");
    closeT = setTimeout(function () { panel.hidden = true; }, 520);
  }
  scrim.addEventListener("click", closeSpec);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSpec(); });

  faq.parentNode.insertBefore(sec, faq);
  /* the reels only start (and only download) once the section is on screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; show(); }, { threshold: 0.25 }).observe(stage);
  } else { inView = true; }
  show();
  requestAnimationFrame(show);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(show);

})();
