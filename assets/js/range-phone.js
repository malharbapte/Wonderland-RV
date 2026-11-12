/* ==========================================================================
   RANGE VIEWER, PHONE -- home.html, below 901 only.
   Swipe cards (option B of sample-phone-range.html): one van per screen on a
   snapping row, dots and a count, the figures as a list under it.

   THE DATA AND THE ICONS ARE COPIED FROM range-viewer.js (the desktop viewer),
   which returns early on a phone and keeps them inside its own closure. If a
   figure or an icon changes there, change it here too. Folding both into one
   shared file is on the to-do list.
   ========================================================================== */
(function () {
  var phone = window.matchMedia("(max-width: 900px)");
  var mount = document.getElementById("rvpMount");
  if (!mount) return;

  var MODELS = [
    { id: "amaroo", name: "Amaroo", tag: "Classic off-road", price: "$127,288",
      badges: [],
      spec: [["solar", "Solar", "600W", "REDARC ALPHA 50"],
             ["water", "Water", "200L", "FRESH"],
             ["susp",  "Suspension", "COIL", "CRUISEMASTER ATX / XT"],
             ["brake", "Brakes", "12” DRUM", ""]] },

    { id: "hornet", name: "Hornet", tag: "Rugged off-road", price: "$151,176",
      badges: [],
      spec: [["solar", "Solar", "800W", "REDARC ALPHA 75"],
             ["water", "Water", "290L", "200L + 90L DRINKING"],
             ["susp",  "Suspension", "AIRBAG", "CRUISEMASTER XT L3"],
             ["brake", "Brakes", "12” DRUM", ""]] },

    { id: "solara", name: "Solara", tag: "Composite off-road", price: "$162,280",
      badges: ["2026 Judge’s Choice", "Full composite"],
      spec: [["solar", "Solar", "1000W", "VICTRON NEXUS"],
             ["water", "Water", "290L", "200L + 90L DRINKING"],
             ["susp",  "Suspension", "AIRBAG", "CRUISEMASTER XT L3"],
             ["batt",  "Battery", "400AH", "LITHIUM"]] },

    { id: "xtr", name: "XTR", tag: "Extreme off-road", price: "$195,701",
      badges: ["Flagship"],
      spec: [["solar", "Solar", "1000W", "VICTRON 24V"],
             ["water", "Water", "290L", "200L + 90L DRINKING"],
             ["susp",  "Suspension", "AIRBAG", "CRUISEMASTER ATX L5 BCS"],
             ["brake", "Brakes", "DISC", ""]] }
  ];

  /* The spec icons were dropped for the Lotus-style row, and with them the drawings. */

  var built = false, at = 0, N = MODELS.length;

  /* Phone layout, Lotus-style: label over value, four across, no icons. The
     small note under each figure sits behind the chevron (see .rvp-more). */
  function cells(m) {
    return m.spec.map(function (c) {
      return '<div class="rvp-cell"><p class="rvp-k">' + c[1] + '</p><p class="rvp-v">' + c[2] + '</p>' +
        (c[3] ? '<p class="rvp-n">' + c[3] + '</p>' : '') + '</div>';
    }).join("");
  }

  function build() {
    if (built) return;
    built = true;
    mount.innerHTML =
      '<div class="rvp-view">' +
      '<button class="rvp-arrow rvp-arrow--prev" id="rvpPrev" type="button" aria-label="Previous model"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="rvp-arrow rvp-arrow--next" id="rvpNext" type="button" aria-label="Next model"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="rvp-track" id="rvpTrack" tabindex="0" role="region" aria-label="Range models, swipe sideways">' +
      MODELS.map(function (m, k) {
        return '<div class="rvp-slide"><img src="assets/img/home/range/' + m.id + '-side.webp?v=11" alt="' + m.name + '"' +
          (k ? ' loading="lazy"' : '') + '>' +
          '<h3 class="rvp-name">' + m.name + '</h3><p class="rvp-tag">' + m.tag + '</p>' +
          '<div class="rvp-badges">' + m.badges.map(function (b) { return '<span class="rvp-badge">' + b + '</span>'; }).join("") + '</div></div>';
      }).join("") + '</div></div>' +
      '<div class="rvp-dots" id="rvpDots">' + MODELS.map(function (m, k) {
        return '<button type="button" data-k="' + k + '" aria-label="Show ' + m.name + '"></button>';
      }).join("") + '<span class="rvp-count" id="rvpCount"></span></div>' +
      '<div class="rvp-spec" id="rvpSpec" aria-live="polite"></div>' +
      '<button class="rvp-more" id="rvpMore" type="button" aria-expanded="false" aria-controls="rvpSpec" aria-label="Show details">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg></button>';

    /* the chevron opens the notes under each figure; the state belongs to the
       spec row, so it survives swiping to another model */
    var more = document.getElementById("rvpMore");
    more.addEventListener("click", function () {
      var open = more.getAttribute("aria-expanded") !== "true";
      more.setAttribute("aria-expanded", String(open));
      more.setAttribute("aria-label", open ? "Hide details" : "Show details");
      document.getElementById("rvpSpec").classList.toggle("open", open);
    });

    var track = document.getElementById("rvpTrack");
    var dots  = [].slice.call(document.querySelectorAll("#rvpDots button"));

    var prev = document.getElementById("rvpPrev"), next = document.getElementById("rvpNext");
    function paint() {
      prev.classList.toggle("is-off", at === 0);
      next.classList.toggle("is-off", at === N - 1);
      dots.forEach(function (d, k) { d.classList.toggle("on", k === at); });
      document.getElementById("rvpCount").textContent = (at + 1) + " / " + N;
      document.getElementById("rvpSpec").innerHTML = cells(MODELS[at]);
      /* the model on screen, for the brochure pop-up to open on */
      var box = mount.closest(".rvp"); if (box) box.dataset.model = MODELS[at].name;
    }

    var t;
    track.addEventListener("scroll", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        i = Math.max(0, Math.min(N - 1, i));
        if (i !== at) { at = i; paint(); }
      }, 60);
    }, { passive: true });

    /* the arrows hint that the row moves, and step it. Their nudge stops once the
       row has been used, by arrow or by swipe. */
    var view = track.parentNode;
    function used() { view.classList.add("is-used"); }
    prev.addEventListener("click", function () { used(); track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }); });
    next.addEventListener("click", function () { used(); track.scrollBy({ left: track.clientWidth, behavior: "smooth" }); });
    track.addEventListener("touchstart", used, { passive: true });

    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        track.scrollTo({ left: +d.dataset.k * track.clientWidth, behavior: "smooth" });
      });
    });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: track.clientWidth, behavior: "smooth" }); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }); }
    });

    paint();
  }

  if (phone.matches) build();
  else if (phone.addEventListener) phone.addEventListener("change", function (e) { if (e.matches) build(); });
})();
