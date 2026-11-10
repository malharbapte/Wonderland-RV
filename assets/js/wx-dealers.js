/* ==========================================================================
   DEALERS MAP -- wonderland-experience.html
   Pick a state on the map or in the bar and the column on the right follows.
   Dealer details are the ones listed on wonderlandrv.com.au/dealers. States
   with no dealer show the Melbourne team's virtual-meeting offer. Get
   directions opens Google Maps directions to that dealer's street address.
   ========================================================================== */
(function () {
  var bar = document.getElementById("wxBar");
  var thumb = bar && bar.querySelector(".wx-dealers-thumb");
  var prev = document.getElementById("wxPrev");
  var next = document.getElementById("wxNext");
  var panel = document.getElementById("wxDealerPanel");
  var states = [].slice.call(document.querySelectorAll(".wx-st"));
  if (!bar || !thumb || !panel || !states.length) return;

  var NAMES = { nsw: "New South Wales", qld: "Queensland", vic: "Victoria", wa: "Western Australia",
                sa: "South Australia", nt: "Northern Territory", tas: "Tasmania",
                act: "Australian Capital Territory" };
  /* the bar's names: dealer states first, then the rest */
  var ORDER = ["nsw", "qld", "vic", "wa", "sa", "nt", "tas", "act"];
  var LABELS = { act: "ACT" };
  var cur = "nsw", btns = {};
  var DEALERS = {
    nsw: { name: "Off Grid Outfitters", locs: [
      { city: "Sydney", addr: "23 Badgally Road, Campbelltown NSW 2560",
        tel: "(02) 4648 4181", mail: "sales@offgridoutfitters.com.au" } ] },
    qld: { name: "Aussie Escape Caravans", locs: [
      { city: "Brisbane", addr: "118 South Pine Rd, Brendale QLD 4500",
        tel: "(07) 3205 7738", mail: "wonderland@aussieescapecaravans.com.au" },
      { city: "Mackay", addr: "10/25 Transport Ave, Paget QLD 4740",
        tel: "0439 009 148", mail: "wonderland@aussieescapecaravans.com.au" } ] },
    vic: { name: "Outbound RVs", locs: [
      { city: "Melbourne", addr: "58B Lara Way, Campbellfield VIC 3061",
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
    b.addEventListener("click", function () { show(k); });
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
  function step(d) { show(ORDER[(ORDER.indexOf(cur) + d + ORDER.length) % ORDER.length]); }

  function show(k) {
    cur = k;
    states.forEach(function (s) { s.classList.toggle("is-on", s.dataset.s === k); });
    ORDER.forEach(function (n) { btns[n].setAttribute("aria-selected", String(n === k)); });
    place(false);
    panel.textContent = "";
    panel.appendChild(el("h3", "wx-d-state", NAMES[k]));
    var d = DEALERS[k];
    if (d) {
      panel.appendChild(el("div", "wx-ph wx-d-photo", "Dealer photo or logo"));
      panel.appendChild(el("p", "wx-d-name", d.name));
      d.locs.forEach(function (l) {
        var box = el("div", "wx-d-loc");
        box.appendChild(el("h4", "wx-d-city", l.city));
        box.appendChild(el("p", "wx-d-addr", l.addr));
        box.appendChild(line("tel:" + l.tel.replace(/[^0-9+]/g, ""), l.tel));
        box.appendChild(line("mailto:" + l.mail, l.mail));
        var cta = link("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(l.addr),
                       "Get directions", "btn-solid wx-d-cta");
        cta.target = "_blank"; cta.rel = "noopener";
        box.appendChild(cta);
        panel.appendChild(box);
      });
    } else {
      panel.appendChild(el("p", "wx-d-head", "Wonderland is available in " + NAMES[k] + "."));
      panel.appendChild(el("p", "wx-d-text", "Our Melbourne team can assist you even if you\u2019re in " + NAMES[k] +
        ". While we do not currently have a dealer there, we can do seamless virtual meetings with future " +
        "Wonderland owners \u2014 from concept to delivery."));
      panel.appendChild(el("p", "wx-d-text", "Just reach out to us for more information about the process."));
      panel.appendChild(link("compact.html", "Enquire now", "btn-solid wx-d-enq"));
    }
  }

  states.forEach(function (s) {
    s.addEventListener("click", function () { show(s.dataset.s); });
    s.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(s.dataset.s); }
    });
  });
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
  bar.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); btns[cur].focus(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); btns[cur].focus(); }
  });
  window.addEventListener("resize", function () { place(true); });
  show("nsw");
  place(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
})();
