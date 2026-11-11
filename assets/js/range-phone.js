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

  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';

  /* Suspension: the coil-over from set A, tilted 30 degrees to the right.
     The tilt is one transform on a group rather than re-plotted path data --
     the drawing is unchanged, so it can be straightened or re-angled by
     editing one number.

     It stays inside the box. Rotating the extremes about (12,12) puts the
     art at x 5.5..18.5 and y 3.4..20.6, and the widest half-stroke at this
     weight is 0.84, so the furthest ink reaches x 19.4 and y 21.5 against a
     24-unit viewBox. Nothing clips at any size. */
  var SUSP =
    S + '<g transform="rotate(30 12 12)">' +
        '<path d="M9.3 3.6h5.4M9.3 20.4h5.4"/><path d="M12 3.6v2.1M12 20.4v-2.1"/>' +
        '<path d="M9 8.2 15 6.8a1.2 1.2 0 0 1 0 2.4L9 10.6a1.2 1.2 0 0 0 0 2.4' +
        'l6-1.4a1.2 1.2 0 0 1 0 2.4L9 15.4a1.2 1.2 0 0 0 0 2.4l6-1.4"/>' +
        '</g></svg>';

  /* Set A. Each one is the part itself, drawn flat on. The brake is the
     exception and is left exactly as it was -- it was the drawing preferred
     over all three alternatives, so it is not touched. */
  var ICON = {
    /* panel, cells, stand. The old drawing was in perspective, which cost
       three segments and bought nothing at 27px. */
    solar: S + '<rect x="3.3" y="5.8" width="17.4" height="9.8" rx="1.1"/>' +
               '<path d="M3.3 10.7h17.4M9.1 5.8v9.8M14.9 5.8v9.8"/>' +
               '<path d="M12 15.6v3.5M9 19.1h6"/></svg>',
    /* a droplet with a water line. The old inner arc read as a crack. */
    water: S + '<path d="M12 3.4c3.7 4 5.7 6.9 5.7 9.4a5.7 5.7 0 1 1-11.4 0' +
               'c0-2.5 2-5.4 5.7-9.4Z"/>' +
               '<path d="M7.1 14.3c1.2-.9 2.3-.9 3.5 0s2.3.9 3.5 0 2.3-.9 3.5 0"/></svg>',
    /* unchanged: the disc with its hub and four ticks */
    brake: S + '<circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="2.6"/>' +
               '<path d="M12 4.2v2.4M12 17.4v2.4M4.2 12h2.4M17.4 12h2.4"/></svg>',
    /* charge bars rather than a bolt: the cell under it reads 400AH, which
       is a capacity, not a current. */
    batt:  S + '<rect x="2.8" y="7.3" width="15.3" height="9.4" rx="1.3"/>' +
               '<path d="M18.1 10.5h2.8v3h-2.8"/>' +
               '<path d="M6.1 10.3v3.4M9.3 10.3v3.4M12.5 10.3v3.4"/></svg>'
  };

  function icon(key) { return key === "susp" ? SUSP : ICON[key]; }

  var built = false, at = 0, N = MODELS.length;

  function cells(m) {
    return m.spec.map(function (c) {
      return '<div class="rvp-cell"><div class="rvp-cellhead"><i class="rvp-ico">' + icon(c[0]) + '</i>' +
        '<p class="rvp-k">' + c[1] + '</p></div><p class="rvp-v">' + c[2] + '</p>' +
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
      '<div class="rvp-spec" id="rvpSpec" aria-live="polite"></div>';

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
