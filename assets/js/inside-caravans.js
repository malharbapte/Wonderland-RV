/* "Different layouts we offer" (above the FAQs, desktop only). A row of tall reels: the chosen one grows and plays (muted, sound button),
   the others rest on their first frame. The specification side menu (left, docked) follows the centred reel. Arrows, the arrow keys or a swipe move the row.
   The panel slides in from the LEFT as a list of rows (the chosen sample).
   Specs are the stock vans shown in each reel (wonderlandrv.com.au/stock listings), to be checked against the production jotform. */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;
  var faq = document.querySelector("section.faq");
  if (!faq) return;
  var VAR = "1", ANIM = "slide";
  var TBC = "To be confirmed";

  function tbc() { return { len: TBC, tare: TBC, atm: TBC, code: TBC, sleeps: TBC, susp: TBC, elec: TBC, water: TBC }; }
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
           elec: "Redarc Alpha 50 system, 600Ah Enerdrive lithium, 2600W inverter, 800W solar", water: "2 x 100L fresh, 100L grey" } },
    /* reels added from the Wonderland Instagram (layout codes still to be confirmed, so no code line shows) */
    { name: "XTR", type: "Family", kind: "Extreme off-road", video: "assets/video/inside-xtr-family5.mp4", img: "assets/video/inside-xtr-family5.jpg", s: tbc() },
    { name: "Family", type: "Family", kind: "Three bunks, extra storage", video: "assets/video/inside-family-3bunk.mp4", img: "assets/video/inside-family-3bunk.jpg", s: tbc() },
    { name: "Family", type: "Family", kind: "Four bunks", video: "assets/video/inside-family-quad.mp4", img: "assets/video/inside-family-quad.jpg", s: tbc() },
    { name: "XTR", type: "Family", kind: "Extreme off-road", video: "assets/video/inside-xtr-interior.mp4", img: "assets/video/inside-xtr-interior.jpg", s: tbc() },
    { name: "Solara", type: "Couple", kind: "Composite off-road", video: "assets/video/inside-solara-couple.mp4", img: "assets/video/inside-solara-couple.jpg", s: tbc() },
    { name: "Hornet", type: "Couple", kind: "Rugged off-road", video: "assets/video/inside-hornet-couple.mp4", img: "assets/video/inside-hornet-couple.jpg", s: tbc() },
    { name: "Amaroo", type: "Couple", kind: "Classic off-road", video: "assets/video/inside-amaroo-couple-a.mp4", img: "assets/video/inside-amaroo-couple-a.jpg", s: tbc() },
    { name: "Amaroo", type: "Couple", kind: "Classic off-road", video: "assets/video/inside-amaroo-couple-b.mp4", img: "assets/video/inside-amaroo-couple-b.jpg", s: tbc() },
    { name: "Amaroo", type: "Couple", kind: "Classic off-road", video: "assets/video/inside-amaroo-couple-c.mp4", img: "assets/video/inside-amaroo-couple-c.jpg", s: tbc() }
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
    el.setAttribute("role", "button"); var hasCode = c.s.code !== TBC; el.setAttribute("aria-label", c.name + (hasCode ? " " + c.s.code : "") + ", " + c.type + ", open its specifications");
    el.innerHTML =
      '<div class="ins-media"><img src="' + c.img + '" alt="' + c.name + (hasCode ? ' ' + c.s.code : '') + ' ' + c.type + '" loading="lazy">' +
        '<video src="' + c.video + '" poster="' + c.img + '" muted loop playsinline preload="none"></video>' +
        '<button class="ins-snd is-muted" type="button" aria-label="Sound on or off">' + SND + '</button>' +
        '<div class="ins-over"><div class="ins-name"><span>' + c.name + '</span><i class="ins-div" aria-hidden="true"></i><em>' + c.type + '</em></div>' + (hasCode ? '<div class="ins-sub">' + c.s.code + '</div>' : '') +
          '<span class="ins-more">Specifications ' + AR.replace("%d", "M9 5l7 7-7 7") + '</span></div>' +
      '</div>';
    el.addEventListener("click", function (e) {
      if (e.target.closest(".ins-snd")) return;
      if (i !== at) go(i);
      if (!opened) openSpec();
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
    layout(r);
    /* the side menu starts just below the section's heading and subheading */
    var lede = sec.querySelector(".ins-lede"), top = lede.offsetTop + lede.offsetHeight + 0.2 * r;
    panel.style.top = Math.round(top) + "px"; panel.style.maxHeight = "calc(100% - " + Math.round(top + 0.3 * r) + "px)";
    if (opened) fill(at);
  }
  /* an endless loop: every reel sits at its (wrapped) distance from the chosen one, so the row never runs out and never leaves a gap.
     A reel that wraps round to the far side jumps there unseen, off screen, instead of sliding across. */
  var prevD = [];
  function layout(r) {
    var n = cards.length, sw = stage.clientWidth;
    cards.forEach(function (el, i) {
      var d = (((i - at) % n) + n) % n; if (d > n / 2) d -= n;
      var left = d === 0 ? -WC / 2 : d > 0 ? WC / 2 + GAP + (d - 1) * (W + GAP) : -(WC / 2 + GAP + (-d) * W + (-d - 1) * GAP);
      var jump = prevD[i] !== undefined && Math.abs(d - prevD[i]) > 1;
      if (jump) el.style.transition = "none";
      el.style.transform = "translate3d(" + Math.round(sw / 2 + left * r) + "px,-50%,0)";
      if (jump) { void el.offsetWidth; el.style.transition = ""; }
      prevD[i] = d;
    });
  }
  function go(i) { var n = cards.length; at = ((i % n) + n) % n; show(); }
  prev.addEventListener("click", function () { go(at - 1); });
  next.addEventListener("click", function () { go(at + 1); });
  sec.tabIndex = 0;
  sec.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(at - 1); else if (e.key === "ArrowRight") go(at + 1); });
  var x0 = null;
  stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  stage.addEventListener("pointerup", function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 50) go(at + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  window.addEventListener("resize", show);

  /* ---- the specification panel: a side menu docked in the section, built like the Layouts rail on the Range page ----
     Shut it is a strip on the page edge with a vertical orange tab; open it slides out over the left reels and the page stays usable.
     It opens by itself when the section scrolls into view, follows the centred reel, and shuts once the section is fully out of view. */
  var panel = document.createElement("aside");
  panel.className = "ins-spec"; panel.setAttribute("aria-label", "Specifications");
  panel.innerHTML = '<div class="ins-spec-in"></div>';
  sec.appendChild(panel);
  var body = panel.querySelector(".ins-spec-in");
  var opened = false, curSpec = -1;
  function specHTML(c) {
    var rows = ROWS.map(function (r) { var v = c.s[r[1]]; return '<div class="ins-sp-row' + (v === TBC ? " is-tbc" : "") + '"><dt>' + r[0] + '</dt><dd>' + esc(v) + "</dd></div>"; }).join("");
    return '<button class="ins-spec-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19"/></svg></button>' +
      '<div class="ins-sp-head"><h3 class="ins-sp-name">' + c.name + '</h3><p class="ins-sp-kind">' + c.kind + " · " + c.type + '</p></div>' +
      (c.s.code === TBC ? '' : '<div class="ins-sp-plan" data-ph="FLOORPLAN — ' + c.s.code + '"></div>') +
      '<dl class="ins-sp-list">' + rows + '</dl>' +
      '<p class="ins-sp-note">Specifications are for the van in the reel. Subject to change.</p>' +
      '<a class="btn-solid ins-sp-cta" href="range.html">Find your caravan</a>';
  }
  function fill(i) {   /* swaps the content in place for the chosen van */
    if (curSpec === i) return;
    curSpec = i; body.innerHTML = specHTML(CARDS[i]);
    body.classList.remove("is-new"); void body.offsetWidth; body.classList.add("is-new");
    var img = new Image(), plan = body.querySelector(".ins-sp-plan"); if (!plan) return;
    img.onload = function () { if (curSpec === i) { plan.style.backgroundImage = 'url("' + img.src + '")'; plan.classList.add("has-img"); } };
    img.src = "assets/img/build/plans/" + CARDS[i].s.code + ".webp";
  }
  function openSpec() { fill(at); opened = true; panel.classList.add("is-open"); }
  function closeSpec() { opened = false; panel.classList.remove("is-open"); }
  body.addEventListener("click", function (e) { if (e.target.closest(".ins-spec-x")) closeSpec(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSpec(); });
  /* a click anywhere outside the panel shuts it; the reels and arrows only change what it shows */
  document.addEventListener("click", function (e) { if (opened && !e.target.closest(".ins-spec, .ins-card, .ins-arrow")) closeSpec(); });
  if ("IntersectionObserver" in window) {
    var secIn = false;
    new IntersectionObserver(function (es) {
      var e = es[0];
      if (!e.isIntersecting) { secIn = false; closeSpec(); }
      else if (e.intersectionRatio >= 0.2 && !secIn) { secIn = true; openSpec(); }
    }, { threshold: [0, 0.2] }).observe(sec);
  }

  faq.parentNode.insertBefore(sec, faq);
  /* the reels only start (and only download) once the section is on screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; show(); }, { threshold: 0.25 }).observe(stage);
  } else { inView = true; }
  show();
  requestAnimationFrame(show);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(show);

})();
