/* ==========================================================================
   DEALERS MAP -- wonderland-experience.html
   Pick a state on the map or in the bar and the column on the right follows.
   Dealer details are the ones listed on wonderlandrv.com.au/dealers. States
   with no dealer show the Outbound RVs (Melbourne) details (SA, NT, TAS). Get
   directions opens Google Maps directions to that dealer's street address.
   ========================================================================== */
(function () {
  var bar = document.getElementById("wxBar");
  var thumb = bar && bar.querySelector(".wx-dealers-thumb");
  var prev = document.getElementById("wxPrev");
  var next = document.getElementById("wxNext");
  var panel = document.getElementById("wxDealerPanel");
  var states = [].slice.call(document.querySelectorAll(".wx-st"));
  var svg = document.querySelector(".wx-au");
  var stage = document.querySelector(".wx-stage");
  var gmap = document.getElementById("wxGmap");
  var frame = document.getElementById("wxGmapFrame");
  var gnote = document.getElementById("wxGmapNote");
  var row = document.querySelector(".wx-dealers-row");
  var reset = document.getElementById("wxReset");
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';
  var dir = document.getElementById("wxDir");
  if (!bar || !thumb || !panel || !states.length) return;

  var NAMES = { nsw: "NSW & ACT", qld: "Queensland", vic: "Victoria", wa: "Western Australia",
                sa: "South Australia", nt: "Northern Territory", tas: "Tasmania",
                act: "Australian Capital Territory" };
  /* the bar's names: dealer states first, then the rest */
  var ORDER = ["nsw", "qld", "vic", "wa", "sa", "nt", "tas"];   /* the ACT sits inside NSW and answers as NSW */
  var LABELS = { nsw: "NSW", qld: "QLD", vic: "VIC", wa: "WA", sa: "SA", nt: "NT", tas: "TAS", act: "ACT" };
  var cur = "nsw", btns = {};
  var IMG = "assets/img/experience/dealers/";
  var DEALERS = {
    nsw: { name: "Off Grid Outfitters", url: "https://offgridoutfitters.com.au/", logo: "off-grid-outfitters.png",
      /* two photos, swapped every 5 seconds; a click enlarges the one showing */
      photos: [ { src: "off-grid-building.jpg", alt: "Off Grid Outfitters showroom, Campbelltown", pos: "50% 55%" },
                { src: "off-grid-team.jpg", alt: "The Off Grid Outfitters team in the showroom", pos: "50% 28%" } ],
      locs: [
      { city: "Sydney", addr: "23 Badgally Road, Campbelltown NSW 2560",
        tel: "(02) 4648 4181", mail: "sales@offgridoutfitters.com.au" } ] },
    qld: { name: "Aussie Escape Caravans", url: "https://aussieescapecaravans.com.au/", logo: "aussie-escape-caravans.svg",
      /* the team photo from their own site is a wide banner, so its box takes the banner's shape */
      photos: [ { src: "aussie-escape-team.jpg", alt: "The Aussie Escape Caravans team", ar: "1920 / 500" } ],
      locs: [
      { city: "Brisbane", addr: "118 South Pine Rd, Brendale QLD 4500",
        tel: "(07) 3205 7738", mail: "wonderland@aussieescapecaravans.com.au" },
      { city: "Mackay", addr: "10/25 Transport Ave, Paget QLD 4740",
        tel: "0439 009 148", mail: "wonderland@aussieescapecaravans.com.au" } ] },
    vic: { name: "Outbound RVs", url: "https://www.outboundrvs.com.au/", logo: "outbound-rvs.png",
      photos: [ { src: "outbound-rvs-building.jpg", alt: "Outbound RVs showroom, Campbellfield" } ], locs: [
      { city: "Melbourne", addr: "58B Lara Way, Campbellfield VIC 3061",
        tel: "(03) 9958 6708", mail: "sales@outboundrvs.com.au" } ] },
    /* Mission RV: details from missionrv.com.au. The site publishes no phone number, so none is shown;
       its Contact page says "Appointment only" and the Bellevue address is the one in the site's own listing. */
    wa: { name: "Mission RV Australia", url: "https://www.missionrv.com.au/", logo: "mission-rv.png", locs: [
      { city: "Perth", addr: "135 Clayton Street, Bellevue WA 6056", mail: "jake@missionrv.com.au" } ] }
  };
  /* every location knows its business name, so the Google preview searches "name, address" and pins the showroom by name */
  Object.keys(DEALERS).forEach(function (k) { DEALERS[k].locs.forEach(function (l) { l.biz = DEALERS[k].name; }); });
  /* SA, NT and TAS have no dealer: Outbound RVs (Melbourne) answers for them, in Piyush's words */
  var REMOTE_PTS = [
    { h: "Talk to our adventure experts", t: "Our adventure experts at Outbound RVs in VIC will help you with your questions." },
    { h: "See the vans without leaving home", t: "We offer virtual tours of the vans at the showroom." } ];
  var TRIP = { h: "$2,000 towards your trip", t: "We offer a $2,000 discount on flights and accommodation if you\u2019d like to see the vans in person and take a factory tour at our showroom and factory in Campbellfield." };
  var slideTimer = 0, lb = null, lbOpen = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(href, text, extra) {
    var a = el("a", extra || "", text);
    a.href = href;
    return a;
  }
  function ext(a, url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; return a; }
  /* the two points for SA, NT and TAS: a line icon in an orange ring, title over text */
  var PT_ICONS = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg>' ];
  function pts(into) {
    REMOTE_PTS.forEach(function (x, i) {
      var r = el("div", "wx-d-pt");
      r.insertAdjacentHTML("beforeend", '<span class="wx-d-pi">' + PT_ICONS[i] + "</span>");
      var t = el("div", "wx-d-ptx"); t.appendChild(el("b", "", x.h)); t.appendChild(el("span", "", x.t)); r.appendChild(t); into.appendChild(r);
    });
  }
  /* the offer under the map: a white banner, "$2,000 discount" in orange Aviano Black, then the line, then T&C in caption size */
  function tripNote(into) {
    into.textContent = "";
    into.appendChild(el("b", "", "$2,000 discount"));
    into.appendChild(document.createTextNode("on flights and accommodation if you\u2019d like to see the vans in person and take a tour of our factory in Campbellfield."));
    into.appendChild(el("small", "wx-tc", "T&C apply."));
  }
  function closeLb() { if (lb) lb.hidden = true; lbOpen = false; document.body.classList.remove("wx-lb-lock"); }
  function openLb(p, d) {
    if (!lb) {
      lb = el("div", "wx-lb"); lb.hidden = true; lb.innerHTML = "<img alt=\"\">";
      document.body.appendChild(lb);
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });   /* a click outside the photo closes it */
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lbOpen) closeLb(); });
    }
    var im = lb.querySelector("img"); im.src = IMG + p.src; im.alt = p.alt || d.name;
    lb.hidden = false; lbOpen = true; document.body.classList.add("wx-lb-lock");
  }
  function buildPhoto(ph, d) {
    ph.classList.add("has-img");
    if (d.photos[0].ar) ph.style.aspectRatio = d.photos[0].ar;
    var n = 0;
    var imgs = d.photos.map(function (p, i) {
      var im = document.createElement("img"); im.src = IMG + p.src; im.alt = p.alt || d.name;
      if (p.pos) im.style.objectPosition = p.pos;
      if (i === 0) im.className = "is-on";
      ph.appendChild(im); return im;
    });
    ph.setAttribute("role", "button"); ph.tabIndex = 0; ph.setAttribute("aria-label", "Enlarge photo: " + d.name);
    if (imgs.length > 1) slideTimer = setInterval(function () {
      if (lbOpen) return;
      imgs[n].classList.remove("is-on"); n = (n + 1) % imgs.length; imgs[n].classList.add("is-on");
    }, 5000);
    function enlarge() { openLb(d.photos[n], d); }
    ph.addEventListener("click", enlarge);
    ph.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enlarge(); } });
  }
  function line(href, text) {
    var p = el("p", "wx-d-line");
    p.appendChild(link(href, text));
    return p;
  }

  ORDER.forEach(function (k) {
    var b = el("button", "", LABELS[k] || NAMES[k]);
    b.type = "button"; b.setAttribute("role", "tab"); b.dataset.s = k;
    b.addEventListener("click", function () { pick(k); });
    bar.appendChild(b); btns[k] = b;
  });

  /* the orange block sits under whichever name is chosen */
  function place(instant) {
    var b = btns[cur];
    if (instant) thumb.classList.add("is-init");
    thumb.style.left = b.offsetLeft + "px";
    thumb.style.width = b.offsetWidth + "px";
    if (instant) { void thumb.offsetWidth; thumb.classList.remove("is-init"); }
    var vis = b.offsetLeft - 8, end = b.offsetLeft + b.offsetWidth + 8;
    if (vis < bar.scrollLeft) bar.scrollLeft = vis;
    else if (end > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = end - bar.clientWidth;
  }
  function step(d) { pick(ORDER[(ORDER.indexOf(cur) + d + ORDER.length) % ORDER.length]); }

  function show(k) {
    cur = k;
    clearInterval(slideTimer);
    states.forEach(function (s) { s.classList.toggle("is-on", s.dataset.s === k || (k === "nsw" && s.dataset.s === "act")); });
    ORDER.forEach(function (n) { btns[n].setAttribute("aria-selected", String(n === k)); });
    place(false);
    panel.textContent = "";
    panel.appendChild(el("h3", "wx-d-state", NAMES[k]));
    /* states with no dealer of their own show Outbound RVs, Melbourne */
    var d = DEALERS[k] || DEALERS.vic, remote = !DEALERS[k];
    row.classList.toggle("is-remote", remote);
    gnote.hidden = !remote;
    if (remote) tripNote(gnote);
    var logo = el("div", "wx-d-logo");
    var img = document.createElement("img");
    img.src = "assets/img/experience/dealers/" + d.logo;
    img.alt = d.name;
    img.dataset.s = DEALERS[k] ? k : "vic";   /* its width comes from --logo-nsw / --logo-qld / --logo-vic */
    var la = ext(el("a", "wx-d-logo-link"), d.url); la.setAttribute("aria-label", d.name + " website");
    la.appendChild(img); logo.appendChild(la);
    panel.appendChild(logo);
    var nm = el("p", "wx-d-name"); nm.appendChild(ext(el("a", "", d.name), d.url)); panel.appendChild(nm);
    if (remote) { var rp = el("div", "wx-d-remote"); pts(rp); panel.appendChild(rp); }
    /* each branch is a drop-down titled with its city; the first is open, opening one closes the others */
    d.locs.forEach(function (l, i) {
      var box = el("details", "wx-d-loc wx-d-acc");
      box.setAttribute("name", "wx-loc");
      if (i === 0) box.open = true;
      var city = el("summary", "wx-d-city");
      city.appendChild(el("span", "", l.city));
      city.insertAdjacentHTML("beforeend", CHEV);
      box.appendChild(city);
      var body = el("div", "wx-d-body");
      if (l.tel) body.appendChild(line("tel:" + l.tel.replace(/[^0-9+]/g, ""), l.tel));
      body.appendChild(line("mailto:" + l.mail, l.mail));
      body.appendChild(el("p", "wx-d-addr", l.addr));
      /* the phone has no map preview, so each branch carries its own Get directions */
      var dl = link("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.addr), "Get directions", "btn-solid wx-d-dir");
      dl.target = "_blank"; dl.rel = "noopener";
      body.appendChild(dl);
      box.appendChild(body);
      box.addEventListener("toggle", function () {
        if (box.open) preview(l);
        fitPanel();
      });
      panel.appendChild(box);
    });
    /* Enquire now: opens the same enquiry pop-up as the side menu's Enquire */
    var enq = el("a", "btn-solid wx-d-enq", "Enquire now"); enq.href = "#enquire"; enq.setAttribute("data-enquire", "");
    panel.appendChild(enq);
    /* landscape placeholder for a photo of the dealership */
    var ph = el("div", "wx-d-photo");
    if (d.photos) {
      buildPhoto(ph, d);
    } else {
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", "Photo of " + d.name + " (to come)");
      ph.appendChild(el("span", "", "Dealership photo"));
    }
    panel.appendChild(ph);

    fitPanel();
    if (zoomed) { preview(d.locs[0]); zoomTo(k); }
  }

  /* the row is one screen tall; if a dealer's details are taller than the row (Queensland has two
     branches, or the window is short), the panel scales down just enough to fit */
  function fitPanel() {
    panel.style.zoom = "";
    if (!desktop.matches) return;
    var over = panel.scrollHeight - panel.clientHeight;
    if (over > 1) panel.style.zoom = Math.max(0.6, panel.clientHeight / panel.scrollHeight - 0.01);
  }

  /* preview look, for the samples only: ?map=muted|grey|warm|dark|satellite|hybrid (the page itself passes none) */
  var QS = new URLSearchParams(location.search), MAPSTYLE = QS.get("map") || "";
  var MAPTYPE = { satellite: "k", hybrid: "h" };
  if (MAPSTYLE) gmap.classList.add("map-" + MAPSTYLE);

  /* ---- Google Maps preview (no key: the plain embed of an address) ---- */
  function preview(l) {
    /* a point on the map (latitude, longitude) shows a pin and nothing else; an address makes Google add its
       "Open in Maps" card at the top left, which the stylesheet then lifts out of view (.has-card) */
    /* the phone has no preview stage; its dealer pop-up has its own map */
    dir.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.addr);
    if (!desktop.matches) return;
    var t = MAPTYPE[MAPSTYLE] ? "&t=" + MAPTYPE[MAPSTYLE] : "";
    var src = "https://www.google.com/maps?q=" + encodeURIComponent(l.biz + ", " + l.addr) + "&z=16&output=embed" + t;
    gmap.classList.add("has-card");
    if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
    /* Get directions sits under the preview, on the left, and follows the branch shown */
    dir.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.addr);
  }

  /* ---- the zoom: the map's viewBox glides to the chosen state ---- */
  var HOME = [0, 0, 1000, 950], vb = HOME.slice(), raf = 0, zoomed = false;
  var markers = [].slice.call(svg.querySelectorAll(".wx-mk"));
  var desktop = window.matchMedia("(min-width: 901px)");
  function paint() {
    svg.setAttribute("viewBox", vb.join(" "));
    var k = vb[2] / 1000;   /* markers keep their on-screen size while the map zooms */
    markers.forEach(function (m) {
      var dot = m.querySelector(".wx-mk-dot"), pulse = m.querySelector(".wx-mk-pulse");
      dot.setAttribute("r", 9 * k); dot.style.strokeWidth = 3.5 * k;
      pulse.setAttribute("r", 10 * k);
    });
  }
  function fly(to) {
    cancelAnimationFrame(raf);
    var from = vb.slice(), t0 = null, dur = 700;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      vb = from.map(function (v, i) { return v + (to[i] - v) * e; });
      paint();
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }
  /* the view that fits a state, in the shape of the space the map has once the preview is open */
  function frameOf(k) {
    var path = states.filter(function (s) { return s.dataset.s === k; })[0];
    var bb = path.getBBox();
    var w = Math.max(bb.width, 150), h = Math.max(bb.height, 150);
    var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    var W = stage.clientWidth * (1 - GMAP_SHARE), H = stage.clientHeight;
    var ar = W / H;
    w *= 1.14; h *= 1.14;
    if (w / h < ar) w = h * ar; else h = w / ar;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  var GMAP_SHARE = 0.46;
  function zoomTo(k) { fly(frameOf(k)); }
  function open() {
    zoomed = true;
    stage.classList.add("is-zoomed");
    gmap.setAttribute("aria-hidden", "false");
    reset.hidden = false; dir.hidden = false;
  }
  function close() {
    zoomed = false;
    stage.classList.remove("is-zoomed");
    gmap.setAttribute("aria-hidden", "true");
    reset.hidden = true; dir.hidden = true;
    fly(HOME);
  }
  /* a pick on the map or in the bar opens the zoom (not on the phone, which keeps the whole map) */
  function pick(k) {
    if (desktop.matches && !zoomed) open();
    show(k);
    if (!desktop.matches) popupOpen(k);
  }


  /* ---- phone: a pick opens the dealer as a pop-up. The map first, then the details, the CTA last;
     arrows (or a swipe) go to the next and previous state; the cross closes it. ---- */
  var dp = null;
  function popupBuild() {
    dp = el("div", "wx-dp"); dp.hidden = true;
    dp.style.setProperty("--dp-pad", (parseInt(QS.get("pad"), 10) || 24) + "px");   /* padding around the card's content: 24px (?pad= to try another) */
    dp.innerHTML =
      '<div class="wx-dp-card" role="dialog" aria-modal="true" aria-label="Dealer details" tabindex="-1">' +
        '<header class="wx-dp-head"><h2 class="wx-dp-state"></h2>' +
          '<button class="wx-dp-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor"/></svg></button></header>' +
        '<div class="wx-dp-map"><iframe title="Dealer location on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
          '<button class="wx-dp-arrow wx-dp-arrow--prev" type="button" aria-label="Previous state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor"/></svg></button>' +
          '<button class="wx-dp-arrow wx-dp-arrow--next" type="button" aria-label="Next state"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor"/></svg></button></div>' +
        '<a class="wx-dp-id" target="_blank" rel="noopener"><img class="wx-dp-logo" alt=""><span class="wx-dp-name"></span></a>' +
        '<div class="wx-dp-body">' +
          '<div class="wx-dp-tabs" role="tablist"></div>' +
          '<div class="wx-dp-info"></div>' +
        "</div>" +
        '<a class="btn-solid wx-dp-cta" target="_blank" rel="noopener">Get directions</a>' +
      "</div>";
    document.body.appendChild(dp);
    dp.querySelector(".wx-dp-x").addEventListener("click", popupClose);
    dp.addEventListener("click", function (e) { if (e.target === dp) popupClose(); });
    dp.querySelector(".wx-dp-arrow--prev").addEventListener("click", function () { popupGo(-1); });
    dp.querySelector(".wx-dp-arrow--next").addEventListener("click", function () { popupGo(1); });
    document.addEventListener("keydown", function (e) {
      if (dp.hidden) return;
      if (e.key === "Escape") popupClose();
      else if (e.key === "ArrowRight") popupGo(1);
      else if (e.key === "ArrowLeft") popupGo(-1);
    });
    var x0 = null;
    dp.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    dp.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) popupGo(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  function popupFill(k, i) {
    var d = DEALERS[k] || DEALERS.vic, l = d.locs[i || 0];
    dp.querySelector(".wx-dp-state").textContent = NAMES[k];
    var lg = dp.querySelector(".wx-dp-logo");
    lg.src = "assets/img/experience/dealers/" + d.logo; lg.alt = d.name;
    dp.querySelector(".wx-dp-name").textContent = d.name;
    dp.querySelector(".wx-dp-id").href = d.url;
    var acc = d.locs.length > 1 && QS.get("multi") !== "pill";   /* two dealerships: a drop-down per branch (?multi=pill for the pill) */
    var tabs = dp.querySelector(".wx-dp-tabs"); tabs.textContent = "";
    tabs.hidden = d.locs.length < 2 || acc;
    d.locs.forEach(function (loc, n) {
      var b = el("button", n === (i || 0) ? "is-on" : "", loc.city);
      b.type = "button"; b.setAttribute("role", "tab");
      b.addEventListener("click", function () { popupFill(k, n); });
      tabs.appendChild(b);
    });
    var info = dp.querySelector(".wx-dp-info"); info.textContent = "";
    if (acc) {   /* one drop-down per branch, the shown one open */
      d.locs.forEach(function (loc, n) {
        var det = el("details", "wx-dp-acc");
        if (n === (i || 0)) det.open = true;
        var sm = el("summary", "", loc.city); sm.insertAdjacentHTML("beforeend", CHEV);
        det.appendChild(sm);
        var bd = el("div", "wx-dp-acc-b");
        if (loc.tel) bd.appendChild(line("tel:" + loc.tel.replace(/[^0-9+]/g, ""), loc.tel));
        bd.appendChild(line("mailto:" + loc.mail, loc.mail));
        bd.appendChild(el("p", "wx-d-addr", loc.addr));
        det.appendChild(bd);
        det.addEventListener("click", function (e) {
          if (e.target.closest("summary")) { e.preventDefault(); if (!det.open) popupFill(k, n); }
        });
        info.appendChild(det);
      });
    } else {
      if (d.locs.length < 2) info.appendChild(el("p", "wx-dp-city", l.city));
      if (l.tel) info.appendChild(line("tel:" + l.tel.replace(/[^0-9+]/g, ""), l.tel));
      info.appendChild(line("mailto:" + l.mail, l.mail));
      info.appendChild(el("p", "wx-d-addr", l.addr));
    }
    if (!DEALERS[k]) { var rb = el("div", "wx-d-remote"); pts(rb); info.appendChild(rb); var tn = el("p", "wx-d-trip"); tripNote(tn); info.appendChild(tn); }
    var penq = el("a", "btn-solid wx-d-enq", "Enquire now"); penq.href = "#enquire"; penq.setAttribute("data-enquire", ""); info.appendChild(penq);
    var map = dp.querySelector(".wx-dp-map"), fr = map.querySelector("iframe");
    var src = "https://www.google.com/maps?q=" + encodeURIComponent(l.biz + ", " + l.addr) + "&z=16&output=embed";
    map.classList.add("has-card");
    if (fr.getAttribute("src") !== src) fr.setAttribute("src", src);
    dp.querySelector(".wx-dp-cta").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.addr);
  }
  function popupOpen(k) {
    if (!dp) popupBuild();
    popupFill(k, 0);
    dp.hidden = false;
    document.body.classList.add("wx-dp-lock");
    dp.querySelector(".wx-dp-card").focus();
  }
  function popupClose() { if (dp) { dp.hidden = true; document.body.classList.remove("wx-dp-lock"); } }
  function popupGo(d) {
    var k = ORDER[(ORDER.indexOf(cur) + d + ORDER.length) % ORDER.length];
    show(k); popupFill(k, 0);
  }

  function key(s) { return s.dataset.s === "act" ? "nsw" : s.dataset.s; }
  states.forEach(function (s) {
    s.addEventListener("click", function () { pick(key(s)); });
    s.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(key(s)); }
    });
  });
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
  bar.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); btns[cur].focus(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); btns[cur].focus(); }
  });
  if (reset) reset.addEventListener("click", close);
  window.addEventListener("resize", function () {
    place(true); fitPanel();
    if (zoomed) { cancelAnimationFrame(raf); vb = frameOf(cur); paint(); }
  });
  dir.hidden = true;
  paint();
  show("nsw");
  place(true);
  /* ?open=vic opens that state and scrolls to the section (used by the samples) */
  if (QS.get("open") && btns[QS.get("open")]) {
    pick(QS.get("open"));
    var hd = document.querySelector(".wx-dealers h2");
    if (hd) window.scrollTo(0, hd.getBoundingClientRect().top + window.scrollY - 108);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
})();
