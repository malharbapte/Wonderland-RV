/* ===========================================================================
   RANGE VIEWER. Laid out to "Range section.svg"; see range-viewer.css for how
   that drawing's numbers were mapped onto this site's scale.

   Desktop only -- below 900 the section is display:none and none of this runs,
   so the phone keeps the range carousel it already has.

   Ways to move it, unchanged from the working sample:
     the arrows, a click on either neighbour, the arrow keys, and a swipe --
     mouse drag, touch drag, and a trackpad's deltaX. The wheel is only ever
     taken when its horizontal component is the larger one, so the page still
     scrolls past the section normally, and one flick steps exactly once.
   =========================================================================== */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;

  var sec = document.querySelector(".rvx");
  if (!sec) return;

  var stage   = sec.querySelector("[data-rvx-stage]");
  var badges  = sec.querySelector("[data-rvx-badges]");
  var panels  = sec.querySelector("[data-rvx-panelset]");
  if (!stage || !panels) return;

  /* Features and price are quoted from wonderlandrv.com.au/range/<model>/.
     The drawing writes the brake cell as one line, "12”DRUM", with no note
     under it -- so brakes carry no note here either. */
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

  /* Suspension, after your reference: a coil-over. Two eyes with their
     bores, a rod showing above and below, and the spring drawn as ONE
     continuous wire -- a diagonal across the front, a half turn at the edge,
     the next diagonal back. Four separate bars would have read as a leaf
     pack; this winds. */
  var SUSP =
    S + '<circle cx="12" cy="3.4" r="2.2"/><circle cx="12" cy="3.4" r="0.8"/>' +
        '<circle cx="12" cy="20.6" r="2.2"/><circle cx="12" cy="20.6" r="0.8"/>' +
        '<path d="M12 5.6v2M12 18.6v-2"/>' +
        '<path d="M8.3 9.4 15.7 7.6a1.3 1.3 0 0 1 0 2.6L8.3 12a1.3 1.3 0 0 0 0 2.6' +
        'l7.4-1.8a1.3 1.3 0 0 1 0 2.6L8.3 17.2"/></svg>';

  var ICON = {
    solar: S + '<path d="M3.2 14.6 5.6 7h12.8l2.4 7.6z"/><path d="M4.6 11h14.8M10.4 7l-.9 7.6M13.6 7l.9 7.6"/><path d="M12 14.6V21M8.4 21h7.2"/></svg>',
    water: S + '<path d="M12 3.2s5.8 6.1 5.8 9.9A5.8 5.8 0 0 1 6.2 13c0-3.8 5.8-9.8 5.8-9.8Z"/><path d="M9 13.4A3 3 0 0 0 12 16.4"/></svg>',
    brake: S + '<circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="2.6"/><path d="M12 4.2v2.4M12 17.4v2.4M4.2 12h2.4M17.4 12h2.4"/></svg>',
    batt:  S + '<rect x="2.6" y="7" width="15.4" height="10" rx="1.6"/><path d="M18 10.4h3v3.2h-3"/><path d="m11.6 9.4-2.3 3.4h3l-1.2 2.6"/></svg>'
  };
  function icon(key) { return key === "susp" ? SUSP : ICON[key]; }

  var N = MODELS.length, at = 0, swallowClick = false;

  function buildStage() {
    [].slice.call(stage.querySelectorAll(".rvx-van")).forEach(function (x) { x.remove(); });
    stage.insertAdjacentHTML("afterbegin", MODELS.map(function (m, k) {
      var src = "assets/img/home/range/" + m.id + "-34.webp";
      return '<div class="rvx-van" data-k="' + k + '">' +
        '<img src="' + src + '" alt="' + m.name + '" onerror="this.remove();">' +
      '</div>';
    }).join(""));
    paint();
  }

  if (badges) {
    badges.innerHTML = MODELS.map(function (m) {
      return '<div class="rvx-badge-set">' + m.badges.map(function (b) {
        return '<span class="rvx-badge">' + b + '</span>';
      }).join("") + '</div>';
    }).join("");
  }

  function buildPanels() {
    panels.innerHTML = MODELS.map(function (m) {
      var cells = m.spec.map(function (c) {
        return '<div class="rvx-cell">' +
          '<div class="rvx-cellhead"><i class="rvx-ico">' + icon(c[0]) + '</i>' +
          '<p class="rvx-k">' + c[1] + '</p></div>' +
          '<p class="rvx-v">' + c[2] + '</p>' +
          (c[3] ? '<p class="rvx-n">' + c[3] + '</p>' : '') + '</div>';
      }).join("");
      return '<div class="rvx-panel">' +
        '<div class="rvx-head">' +
          '<div><h3 class="rvx-name">' + m.name + '</h3>' +
          '<p class="rvx-tag">' + m.tag + '</p></div>' +
          '<div class="rvx-money"><p class="rvx-from">From</p>' +
          '<p class="rvx-price">' + m.price + '</p></div>' +
        '</div>' +
        '<div class="rvx-spec">' + cells + '</div>' +
      '</div>';
    }).join("");
    paint();
  }

  function paint() {
    var vans = stage.querySelectorAll(".rvx-van");
    var bs = badges ? badges.querySelectorAll(".rvx-badge-set") : [];
    var ps = panels.querySelectorAll(".rvx-panel");
    for (var k = 0; k < N; k++) {
      var d = (k - at + N) % N;
      if (d > N / 2) { d -= N; }
      if (vans[k]) { vans[k].dataset.d = d; }
      if (bs[k]) { bs[k].classList.toggle("on", k === at); }
      if (ps[k]) { ps[k].classList.toggle("on", k === at); }
    }
  }

  function go(i) { at = (i + N) % N; paint(); }

  sec.addEventListener("click", function (e) {
    if (swallowClick) { swallowClick = false; return; }
    var a = e.target.closest("[data-go]");
    if (a) { go(at + (+a.dataset.go)); return; }
    var v = e.target.closest(".rvx-van");
    if (v) {
      var d = +v.dataset.d;
      if (d === -1 || d === 1) { go(at + d); }
    }
  });

  addEventListener("keydown", function (e) {
    var r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    if (e.key === "ArrowLeft")  { e.preventDefault(); go(at - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(at + 1); }
  });

  /* ONE STEP PER CROSSFADE, not one step per gesture.

     What was wrong: after a step it disarmed, and only re-armed on a gap of
     QUIET with no wheel events arriving. A swipe you never stop never
     produces that gap -- the events keep coming closer together than 220ms --
     so it re-armed only once you lifted off. One van per swipe, and a second
     van needed a second swipe. That is the "doesn't swipe after one swipe".

     The lock is now the animation itself: step, absorb everything until the
     crossfade has finished, then accept the next NEED of travel. Keep swiping
     and it keeps stepping, roughly a van per MOVE, and it still cannot skip
     one, because nothing is accepted while a step is playing. */
  var QUIET = 220;   /* a gap this long starts the travel count over    */
  var NEED  = 60;    /* horizontal px of travel one step costs          */
  var MOVE  = 820;   /* the crossfade (780ms) plus a little             */
  var accum = 0, lastX = 0, until = 0;

  sec.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   /* vertical: not ours */
    e.preventDefault();
    var now = performance.now();
    if (now - lastX > QUIET) { accum = 0; }
    lastX = now;
    if (now < until) { accum = 0; return; }                 /* mid-step: absorb */
    accum += e.deltaX;
    if (Math.abs(accum) >= NEED) {
      go(at + (accum > 0 ? 1 : -1));
      accum = 0;
      until = now + MOVE;
    }
  }, { passive: false });

  var fromX = null, fromY = null;
  sec.addEventListener("pointerdown", function (e) { fromX = e.clientX; fromY = e.clientY; });
  addEventListener("pointerup", function (e) {
    if (fromX === null) return;
    var dx = e.clientX - fromX, dy = e.clientY - fromY;
    fromX = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    go(at + (dx < 0 ? 1 : -1));
    swallowClick = true;
  });

  buildStage();
  buildPanels();
})();
