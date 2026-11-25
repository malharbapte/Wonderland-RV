/* ==========================================================================
   DEALERS MAP -- wonderland-experience.html
   Pick a state on the map or in the bar and the column on the right follows.
   Dealer details are the ones listed on wonderlandrv.com.au/dealers. States
   with no dealer show the Outbound RVs (Melbourne) details. Get
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
  var reset = document.getElementById("wxReset");
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';
  var dir = document.getElementById("wxDir");
  if (!bar || !thumb || !panel || !states.length) return;

  var NAMES = { nsw: "New South Wales", qld: "Queensland", vic: "Victoria", wa: "Western Australia",
                sa: "South Australia", nt: "Northern Territory", tas: "Tasmania",
                act: "Australian Capital Territory" };
  /* the bar's names: dealer states first, then the rest */
  var ORDER = ["nsw", "qld", "vic", "wa", "sa", "nt", "tas"];   /* the ACT sits inside NSW and answers as NSW */
  var LABELS = { nsw: "NSW", qld: "QLD", vic: "VIC", wa: "WA", sa: "SA", nt: "NT", tas: "TAS", act: "ACT" };
  var cur = "nsw", btns = {};
  var DEALERS = {
    nsw: { name: "Off Grid Outfitters", logo: "off-grid-outfitters.png", locs: [
      { city: "Sydney", addr: "23 Badgally Road, Campbelltown NSW 2560", ll: "-34.0576281,150.8112213",
        tel: "(02) 4648 4181", mail: "sales@offgridoutfitters.com.au" } ] },
    qld: { name: "Aussie Escape Caravans", logo: "aussie-escape-caravans.svg", locs: [
      { city: "Brisbane", addr: "118 South Pine Rd, Brendale QLD 4500",
        tel: "(07) 3205 7738", mail: "wonderland@aussieescapecaravans.com.au" },
      { city: "Mackay", addr: "10/25 Transport Ave, Paget QLD 4740",
        tel: "0439 009 148", mail: "wonderland@aussieescapecaravans.com.au" } ] },
    vic: { name: "Outbound RVs", logo: "outbound-rvs.png", photo: "outbound-rvs-building.jpg", locs: [
      { city: "Melbourne", addr: "58B Lara Way, Campbellfield VIC 3061", ll: "-37.6630770,144.9676408",
        tel: "(03) 9958 6708", mail: "sales@outboundrvs.com.au" } ] }
  };

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
    states.forEach(function (s) { s.classList.toggle("is-on", s.dataset.s === k || (k === "nsw" && s.dataset.s === "act")); });
    ORDER.forEach(function (n) { btns[n].setAttribute("aria-selected", String(n === k)); });
    place(false);
    panel.textContent = "";
    panel.appendChild(el("h3", "wx-d-state", NAMES[k]));
    /* states with no dealer of their own show Outbound RVs, Melbourne */
    var d = DEALERS[k] || DEALERS.vic;
    var logo = el("div", "wx-d-logo");
    var img = document.createElement("img");
    img.src = "assets/img/experience/dealers/" + d.logo;
    img.alt = d.name;
    img.dataset.s = DEALERS[k] ? k : "vic";   /* its width comes from --logo-nsw / --logo-qld / --logo-vic */
    logo.appendChild(img);
    panel.appendChild(logo);
    panel.appendChild(el("p", "wx-d-name", d.name));
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
      body.appendChild(line("tel:" + l.tel.replace(/[^0-9+]/g, ""), l.tel));
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
    /* landscape placeholder for a photo of the dealership */
    var ph = el("div", "wx-d-photo");
    if (d.photo) {
      var pi = document.createElement("img");
      pi.src = "assets/img/experience/dealers/" + d.photo;
      pi.alt = d.name + ", " + d.locs[0].addr;
      ph.classList.add("has-img");
      ph.appendChild(pi);
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
    var src = "https://www.google.com/maps?q=" + (l.ll ? l.ll + "&z=17" : encodeURIComponent(l.addr) + "&z=15") + "&output=embed" + t;
    gmap.classList.toggle("has-card", !l.ll);
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
        '<div class="wx-dp-id"><img class="wx-dp-logo" alt=""><span class="wx-dp-name"></span></div>' +
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
        bd.appendChild(line("tel:" + loc.tel.replace(/[^0-9+]/g, ""), loc.tel));
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
      info.appendChild(line("tel:" + l.tel.replace(/[^0-9+]/g, ""), l.tel));
      info.appendChild(line("mailto:" + l.mail, l.mail));
      info.appendChild(el("p", "wx-d-addr", l.addr));
    }
    var map = dp.querySelector(".wx-dp-map"), fr = map.querySelector("iframe");
    var src = "https://www.google.com/maps?q=" + (l.ll ? l.ll + "&z=16" : encodeURIComponent(l.addr) + "&z=15") + "&output=embed";
    map.classList.toggle("has-card", !l.ll);
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
