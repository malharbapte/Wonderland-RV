/* "Different layouts we offer" (above the FAQs, desktop only). A row of tall reels: the chosen one grows and plays (muted, sound button),
   the others rest on their first frame. The specification side menu (left, docked) follows the centred reel. Arrows, the arrow keys or a swipe move the row.
   The panel slides in from the LEFT as a list of rows (the chosen sample).
   Specs are the stock vans shown in each reel (wonderlandrv.com.au/stock listings), to be checked against the production jotform. */
(function () {
  var DESK = window.matchMedia("(min-width: 901px)").matches;
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
  var ROWS = [["Tare", "tare"], ["Sleeps", "sleeps"], ["Suspension", "susp"], ["Electrical", "elec"]];
  var W = 3.48, WC = 4.2, GAP = 0.2, at = 2;      /* rem; the chosen card is wider, and so taller. Previews are 20% larger than the first version. */
  var AR = '<svg viewBox="0 0 24 24"><path d="%d"/></svg>';
  var SND = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="x" d="M17 9l4 6M21 9l-4 6"/></svg>';
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  if (!DESK) { phone(); return; }

  var sec = document.createElement("section");
  sec.className = "ins";
  sec.setAttribute("aria-label", "Different layouts we offer");
  sec.style.setProperty("--w", W + "rem"); sec.style.setProperty("--wc", WC + "rem"); sec.style.setProperty("--gap", GAP + "rem");
  /* two ways to show the specs: the side menu on the page edge, or a card beside the chosen reel (like an Instagram post, with the info on the left) */
  var MODE = (location.search.match(/[?&]mode=(menu|post)/) || [])[1] || (function () { try { return localStorage.getItem("insMode"); } catch (e) { return null; } })() || window.INS_MODE_DEFAULT || "menu";
  if (MODE !== "post") MODE = "menu";
  sec.classList.toggle("ins--post", MODE === "post");
  sec.innerHTML =
    '<div class="ins-mode" role="group" aria-label="How the specifications are shown"><button type="button" data-m="menu">Side menu</button><button type="button" data-m="post">Beside the reel</button></div>' +
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
      if (!opened && MODE !== "post") openSpec();
    });
    track.appendChild(el);
    return el;
  });
  var postEl = document.createElement("div"); postEl.className = "ins-post"; postEl.innerHTML = '<div class="ins-post-in"></div>'; track.appendChild(postEl);
  var postIn = postEl.querySelector(".ins-post-in"), postAt = -1;
  var P_ROWS = [["Tare", "tare"], ["Sleeps", "sleeps"], ["Suspension", "susp"], ["Electrical", "elec"], ["Water", "water"]];
  function postHTML(c) {
    var rows = P_ROWS.map(function (r) { var v = c.s[r[1]]; return '<div class="ins-sp-row' + (v === TBC ? " is-tbc" : "") + '"><dt>' + r[0] + '</dt><dd>' + esc(v) + "</dd></div>"; }).join("");
    var hasCode = c.s.code !== TBC, hasLen = c.s.len !== TBC;
    return '<div class="ins-sp-head"><h3 class="ins-sp-name">' + c.name + '</h3><p class="ins-sp-kind">' + c.kind + " · " + c.type + (hasLen ? " · " + c.s.len : "") + '</p></div>' +
      (hasCode ? '<div class="ins-sp-plan" data-ph="FLOORPLAN — ' + c.s.code + '"></div><p class="ins-sp-code">' + c.s.code + '</p>' : '') +
      '<dl class="ins-sp-list">' + rows + '</dl><p class="ins-sp-note">Specifications are for the van in the reel. Subject to change.</p>' +
      '<a class="btn-solid ins-sp-cta" href="range.html">Find your caravan</a>';
  }
  function postFill(i) {
    if (postAt === i) return; postAt = i;
    postIn.innerHTML = postHTML(CARDS[i]); postIn.classList.remove("is-new"); void postIn.offsetWidth; postIn.classList.add("is-new");
    var plan = postIn.querySelector(".ins-sp-plan"); if (!plan) return;
    var im = new Image(); im.onload = function () { if (postAt === i) { plan.style.backgroundImage = 'url("' + im.src + '")'; plan.classList.add("has-img"); } }; im.src = "assets/img/build/plans/" + CARDS[i].s.code + ".webp";
  }
  function setMode(m) {
    if (m === MODE) return; MODE = m;
    try { localStorage.setItem("insMode", m); } catch (e) {}
    sec.classList.toggle("ins--post", m === "post");
    [].forEach.call(sec.querySelectorAll(".ins-mode button"), function (b) { b.classList.toggle("is-on", b.getAttribute("data-m") === m); b.setAttribute("aria-pressed", b.getAttribute("data-m") === m); });
    if (m === "post") { closeSpec(); postAt = -1; } else if (secIn) openSpec();
    show();
  }
  sec.querySelector(".ins-mode").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setMode(b.getAttribute("data-m")); });
  [].forEach.call(sec.querySelectorAll(".ins-mode button"), function (b) { b.classList.toggle("is-on", b.getAttribute("data-m") === MODE); b.setAttribute("aria-pressed", b.getAttribute("data-m") === MODE); });
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
    /* the side menu is centred on the reels' vertical centre, and never rises above the subheading */
    var lede = sec.querySelector(".ins-lede"), mid = stage.offsetTop + stage.offsetHeight / 2, floor = lede.offsetTop + lede.offsetHeight + 0.2 * r;
    var pw = stage.clientWidth / 2 - (WC / 2 + W + 2 * GAP) * r;
    panel.style.setProperty("--pw", Math.round(Math.max(pw, 3.6 * r)) + "px");
    panel.style.height = Math.round(W * r * 16 / 9) + "px"; fitNote();   /* as tall as the reels either side of the chosen one */
    panel.style.top = Math.round(mid) + "px"; panel.style.maxHeight = Math.round(2 * (mid - floor)) + "px";
    if (opened) fill(at);
  }
  /* an endless loop: every reel sits at its (wrapped) distance from the chosen one, so the row never runs out and never leaves a gap.
     A reel that wraps round to the far side jumps there unseen, off screen, instead of sliding across. */
  var prevD = [];
  function layout(r) {
    var n = cards.length, sw = stage.clientWidth, post = MODE === "post", extra = post ? WC + GAP : 0;   /* in post mode the info card takes the slot left of the chosen reel */
    cards.forEach(function (el, i) {
      var d = (((i - at) % n) + n) % n; if (d > n / 2) d -= n;
      var left = d === 0 ? -WC / 2 : d > 0 ? WC / 2 + GAP + (d - 1) * (W + GAP) : -(WC / 2 + GAP + (-d) * W + (-d - 1) * GAP);
      left += extra / 2 - (d < 0 ? extra : 0);
      var jump = prevD[i] !== undefined && Math.abs(d - prevD[i]) > 1;
      if (jump) el.style.transition = "none";
      el.style.transform = "translate3d(" + Math.round(sw / 2 + left * r) + "px,-50%,0) scale(" + (d === 0 ? 1 : (W / WC).toFixed(4)) + ")";
      if (jump) { void el.offsetWidth; el.style.transition = ""; }
      prevD[i] = d;
    });
    /* the info card: the same size as the chosen reel, immediately to its left */
    var px = sw / 2 + (-WC / 2 + extra / 2 - extra) * r;
    postEl.style.height = Math.round(WC * r * 16 / 9) + "px";
    postEl.style.transform = "translate3d(" + Math.round(px) + "px,-50%,0)";
    postEl.style.opacity = post ? "1" : "0"; postEl.style.visibility = post ? "visible" : "hidden";
    if (post) { postFill(at); requestAnimationFrame(fitPostNote); }
  }
  function fitPostNote() {
    var note = postIn.querySelector(".ins-sp-note"), plan = postIn.querySelector(".ins-sp-plan"); if (!note || !plan) return;
    note.hidden = false; if (plan.clientHeight < 1.2 * rem()) note.hidden = true;
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
  var opened = false, curSpec = -1, secIn = false;
  function specHTML(c) {
    var rows = ROWS.map(function (r) { var v = c.s[r[1]]; return '<div class="ins-sp-row' + (v === TBC ? " is-tbc" : "") + '"><dt>' + r[0] + '</dt><dd>' + esc(v) + "</dd></div>"; }).join("");
    var hasCode = c.s.code !== TBC, hasLen = c.s.len !== TBC;
    return '<button class="ins-spec-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19"/></svg></button>' +
      '<div class="ins-sp-head"><h3 class="ins-sp-name">' + c.name + '</h3><p class="ins-sp-kind">' + c.kind + " · " + c.type + (hasLen ? " · " + c.s.len : "") + '</p></div>' +
      (hasCode ? '<div class="ins-sp-plan" data-ph="FLOORPLAN — ' + c.s.code + '"></div><p class="ins-sp-code">' + c.s.code + '</p>' : '') +
      '<dl class="ins-sp-list">' + rows + '</dl>' +
      '<p class="ins-sp-note">Specifications are for the van in the reel. Subject to change.</p>' +
      '<a class="btn-solid ins-sp-cta" href="range.html">Find your caravan</a>';
  }
  /* on a short window the floor plan gets squeezed: drop the small note first, so the plan keeps a readable size */
  function fitNote() {
    var note = body.querySelector(".ins-sp-note"), plan = body.querySelector(".ins-sp-plan"); if (!note || !plan) return;
    note.hidden = false; if (plan.clientHeight < 1.3 * rem()) note.hidden = true;
  }
  function fill(i) {   /* swaps the content in place for the chosen van */
    if (curSpec === i) return;
    curSpec = i; body.innerHTML = specHTML(CARDS[i]);
    body.classList.remove("is-new"); void body.offsetWidth; body.classList.add("is-new");
    var img = new Image(), plan = body.querySelector(".ins-sp-plan"); if (!plan) return;
    img.onload = function () { if (curSpec === i) { plan.style.backgroundImage = 'url("' + img.src + '")'; plan.classList.add("has-img"); } };
    img.src = "assets/img/build/plans/" + CARDS[i].s.code + ".webp";
    requestAnimationFrame(fitNote);
  }
  function openSpec() { if (MODE === "post") return; fill(at); opened = true; panel.classList.add("is-open"); }
  function closeSpec() { opened = false; panel.classList.remove("is-open"); }
  body.addEventListener("click", function (e) { if (e.target.closest(".ins-spec-x")) closeSpec(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSpec(); });
  /* a click anywhere outside the panel shuts it; the reels and arrows only change what it shows */
  document.addEventListener("click", function (e) { if (opened && !e.target.closest(".ins-spec, .ins-card, .ins-arrow")) closeSpec(); });
  if ("IntersectionObserver" in window) {
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


  /* ======================= PHONE: a swipe rail, the centred reel plays, a tap on it opens the specs as a bottom sheet ======================= */
  function phone() {
    var P_ROWS = [["Tare", "tare"], ["Sleeps", "sleeps"], ["Suspension", "susp"], ["Electrical", "elec"], ["Water", "water"]];
    var sec = document.createElement("section");
    sec.className = "ins ins--phone"; sec.setAttribute("aria-label", "Different layouts we offer");
    sec.innerHTML = '<h2 class="ins-title">Different layouts we offer</h2><p class="ins-lede">Discover the layouts in the vans we’ve built.</p><div class="ins-rail" tabindex="0"></div>';
    var rail = sec.querySelector(".ins-rail"), cur = -1, inView = false, sheetOpen = false;
    var cards = CARDS.map(function (c, i) {
      var hasCode = c.s.code !== TBC, el = document.createElement("div");
      el.className = "ins-pc"; el.setAttribute("role", "button");
      el.setAttribute("aria-label", c.name + (hasCode ? " " + c.s.code : "") + ", " + c.type);
      el.innerHTML = '<div class="ins-media"><img src="' + c.img + '" alt="' + c.name + (hasCode ? " " + c.s.code : "") + " " + c.type + '" loading="lazy">' +
        '<video src="' + c.video + '" poster="' + c.img + '" muted loop playsinline preload="none"></video>' +
        '<button class="ins-snd is-muted" type="button" aria-label="Sound on or off">' + SND + '</button>' +
        '<div class="ins-over"><div class="ins-name"><span>' + c.name + '</span><i class="ins-div" aria-hidden="true"></i><em>' + c.type + '</em></div>' + (hasCode ? '<div class="ins-sub">' + c.s.code + '</div>' : '') +
        '<span class="ins-more">Specifications ' + AR.replace("%d", "M9 5l7 7-7 7") + '</span></div></div>';
      el.addEventListener("click", function (e) {
        if (e.target.closest(".ins-snd")) { var v = el.querySelector("video"); v.muted = !v.muted; e.target.closest(".ins-snd").classList.toggle("is-muted", v.muted); return; }
        if (i !== cur) { el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); return; }
        openSheet(i);
      });
      rail.appendChild(el); return el;
    });
    function setCur(i) {
      if (i === cur) return; cur = i;
      cards.forEach(function (el, k) {
        var on = k === i, v = el.querySelector("video"); el.classList.toggle("is-on", on);
        if (on && inView) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); if (!on) { v.muted = true; el.querySelector(".ins-snd").classList.add("is-muted"); try { v.currentTime = 0; } catch (e) {} } }
      });
    }
    function nearest() {
      var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (el, k) { var d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setCur(best);
    }
    var ticking = false;
    rail.addEventListener("scroll", function () { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; nearest(); }); }, { passive: true });
    window.addEventListener("resize", nearest);

    /* the sheet */
    var scrim = document.createElement("div"); scrim.className = "ins-scrim";
    var sheet = document.createElement("aside"); sheet.className = "ins-sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true"); sheet.setAttribute("aria-label", "Specifications"); sheet.hidden = true;
    document.body.appendChild(scrim); document.body.appendChild(sheet);
    function sheetHTML(c) {
      var rows = P_ROWS.map(function (r) { var v = c.s[r[1]]; return '<div class="ins-sp-row' + (v === TBC ? " is-tbc" : "") + '"><dt>' + r[0] + '</dt><dd>' + esc(v) + "</dd></div>"; }).join("");
      var hasCode = c.s.code !== TBC, hasLen = c.s.len !== TBC;
      return '<div class="ins-sheet-grip" aria-hidden="true"></div><button class="ins-spec-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19"/></svg></button>' +
        '<h3 class="ins-sp-name">' + c.name + '</h3><p class="ins-sp-kind">' + c.kind + " · " + c.type + (hasLen ? " · " + c.s.len : "") + '</p>' +
        (hasCode ? '<div class="ins-sp-plan" data-ph="FLOORPLAN — ' + c.s.code + '"></div><p class="ins-sp-code">' + c.s.code + '</p>' : '') +
        '<dl class="ins-sp-list">' + rows + '</dl><p class="ins-sp-note">Specifications are for the van in the reel. Subject to change.</p>' +
        '<a class="btn-solid ins-sp-cta" href="range.html">Find your caravan</a>';
    }
    var closeT = 0;
    function openSheet(i) {
      clearTimeout(closeT); sheet.innerHTML = sheetHTML(CARDS[i]); sheet.hidden = false; sheet.scrollTop = 0;
      sheet.querySelector(".ins-spec-x").addEventListener("click", closeSheet);
      var plan = sheet.querySelector(".ins-sp-plan");
      if (plan) { var img = new Image(); img.onload = function () { plan.style.backgroundImage = 'url("' + img.src + '")'; plan.classList.add("has-img"); }; img.src = "assets/img/build/plans/" + CARDS[i].s.code + ".webp"; }
      void sheet.offsetWidth; scrim.classList.add("is-open"); sheet.classList.add("is-open"); document.body.classList.add("ins-lock"); sheetOpen = true;
    }
    function closeSheet() { if (!sheetOpen) return; sheetOpen = false; scrim.classList.remove("is-open"); sheet.classList.remove("is-open"); document.body.classList.remove("ins-lock"); closeT = setTimeout(function () { sheet.hidden = true; }, 480); }
    scrim.addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
    /* swipe the sheet down to close it */
    var y0 = null;
    sheet.addEventListener("touchstart", function (e) { y0 = sheet.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    sheet.addEventListener("touchend", function (e) { if (y0 !== null && e.changedTouches[0].clientY - y0 > 70) closeSheet(); y0 = null; }, { passive: true });

    faq.parentNode.insertBefore(sec, faq);
    rail.scrollLeft = 0; nearest();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; var k = cur; cur = -1; setCur(Math.max(k, 0)); }, { threshold: 0.35 }).observe(rail);
    } else { inView = true; setCur(0); }
  }
})();
