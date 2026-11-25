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
  var ORDER = ["nsw", "qld", "vic", "wa", "sa", "nt", "tas", "act"];
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
    vic: { name: "Outbound RVs", logo: "outbound-rvs.png", locs: [
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
    states.forEach(function (s) { s.classList.toggle("is-on", s.dataset.s === k); });
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
      box.appendChild(body);
      box.addEventListener("toggle", function () {
        if (box.open) preview(l);
        fitPanel();
      });
      panel.appendChild(box);
    });
    /* landscape placeholder for a photo of the dealership */
    var ph = el("div", "wx-d-photo");
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", "Photo of " + d.name + " (to come)");
    ph.appendChild(el("span", "", "Dealership photo"));
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

  /* ---- Google Maps preview (no key: the plain embed of an address) ---- */
  function preview(l) {
    /* a point on the map (latitude, longitude) shows a pin and nothing else; an address makes Google add its
       "Open in Maps" card at the top left, which the stylesheet then lifts out of view (.has-card) */
    var src = "https://www.google.com/maps?q=" + (l.ll ? l.ll + "&z=17" : encodeURIComponent(l.addr) + "&z=15") + "&output=embed";
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
  }

  states.forEach(function (s) {
    s.addEventListener("click", function () { pick(s.dataset.s); });
    s.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(s.dataset.s); }
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
})();
