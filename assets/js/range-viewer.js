/* ===========================================================================
   RANGE VIEWER.

   Static markup is NOT shipped for this one: the section is desktop-only and
   hidden below 900, so there is nothing to degrade to on a phone. Above 900
   the script fills it on load.

   Four ways to move it, and the wheel is never taken vertically:
     arrows and dots      click
     a neighbour van      click
     arrow keys           while the section is on screen
     swipe                mouse drag, touch drag, and a trackpad's deltaX

   One step per gesture. A trackpad keeps firing long after the fingers lift
   and that tail is the same flick, so after a step the rest of the gesture
   is absorbed until QUIET passes with nothing arriving.
   =========================================================================== */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;

  var sec = document.querySelector(".rvx");
  if (!sec) return;

  var stage  = sec.querySelector("[data-rvx-stage]");
  var badges = sec.querySelector("[data-rvx-badges]");
  var panels = sec.querySelector("[data-rvx-panels]");
  var dotRows = [].slice.call(sec.querySelectorAll("[data-rvx-dots]"));
  if (!stage || !panels) return;

  /* Features and price are quoted from wonderlandrv.com.au/range/<model>/. */
  var MODELS = [
    { id: "amaroo", name: "Amaroo", tag: "Classic off-road", price: "$127,288",
      badges: [],
      spec: [["solar", "Solar", "600W", "Redarc Alpha 50"],
             ["water", "Water", "200L", "fresh"],
             ["susp",  "Suspension", "Coil", "Cruisemaster ATX / XT"],
             ["brake", "Brakes", "12″", "drum"]] },

    { id: "hornet", name: "Hornet", tag: "Rugged off-road", price: "$151,176",
      badges: [],
      spec: [["solar", "Solar", "800W", "Redarc Alpha 75"],
             ["water", "Water", "290L", "200L + 90L drinking"],
             ["susp",  "Suspension", "Airbag", "Cruisemaster XT L3"],
             ["brake", "Brakes", "12″", "drum"]] },

    { id: "solara", name: "Solara", tag: "Composite off-road", price: "$162,280",
      badges: [["fill", "2026 Judge’s Choice"], ["line", "Full composite body"]],
      spec: [["solar", "Solar", "1000W", "Victron Nexus"],
             ["water", "Water", "290L", "200L + 90L drinking"],
             ["susp",  "Suspension", "Airbag", "Cruisemaster XT L3"],
             ["batt",  "Battery", "400Ah", "lithium"]] },

    { id: "xtr", name: "XTR", tag: "Extreme off-road", price: "$195,701",
      badges: [["line", "Flagship"]],
      spec: [["solar", "Solar", "1000W", "Victron 24V"],
             ["water", "Water", "290L", "200L + 90L drinking"],
             ["susp",  "Suspension", "Airbag", "Cruisemaster ATX L5 BCS"],
             ["brake", "Brakes", "Disc", "the only one"]] }
  ];

  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
  var ICON = {
    solar: S + '<path d="M3.2 14.6 5.6 7h12.8l2.4 7.6z"/><path d="M4.6 11h14.8M10.4 7l-.9 7.6M13.6 7l.9 7.6"/><path d="M12 14.6V21M8.4 21h7.2"/></svg>',
    water: S + '<path d="M12 3.2s5.8 6.1 5.8 9.9A5.8 5.8 0 0 1 6.2 13c0-3.8 5.8-9.8 5.8-9.8Z"/><path d="M9 13.4A3 3 0 0 0 12 16.4"/></svg>',
    susp:  S + '<path d="M7.6 3.4h8.8M7.6 20.6h8.8"/><path d="M7.6 6.6h8.8l-8.8 3.1h8.8l-8.8 3.1h8.8l-8.8 3.1h8.8"/></svg>',
    brake: S + '<circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="2.6"/><path d="M12 4.2v2.4M12 17.4v2.4M4.2 12h2.4M17.4 12h2.4"/></svg>',
    batt:  S + '<rect x="2.6" y="7" width="15.4" height="10" rx="1.6"/><path d="M18 10.4h3v3.2h-3"/><path d="m11.6 9.4-2.3 3.4h3l-1.2 2.6"/></svg>'
  };

  var N = MODELS.length, at = 0, angle = "34", swallowClick = false;

  function buildStage() {
    [].slice.call(stage.querySelectorAll(".rvx-van")).forEach(function (x) { x.remove(); });
    stage.insertAdjacentHTML("afterbegin", MODELS.map(function (m, k) {
      var src = "assets/img/home/range/" + m.id + (angle === "34" ? "-34" : "-cut") + ".webp";
      return '<div class="rvx-van" data-k="' + k + '">' +
        '<img src="' + src + '" alt="' + m.name + '" onerror="this.remove();">' +
      '</div>';
    }).join(""));
    paint();
  }

  if (badges) {
    badges.innerHTML = MODELS.map(function (m) {
      return '<div class="rvx-badge-set">' + m.badges.map(function (b) {
        return '<span class="rvx-badge rvx-badge--' + b[0] + '">' + b[1] + '</span>';
      }).join("") + '</div>';
    }).join("");
  }

  panels.innerHTML = MODELS.map(function (m) {
    var cells = m.spec.map(function (c) {
      return '<div class="rvx-cell">' +
        '<i class="rvx-ico">' + ICON[c[0]] + '</i>' +
        '<p class="rvx-k">' + c[1] + '</p>' +
        '<p class="rvx-v">' + c[2] + '</p>' +
        '<p class="rvx-n">' + c[3] + '</p></div>';
    }).join("");
    return '<div class="rvx-panel">' +
      '<h3 class="rvx-name">' + m.name + '</h3>' +
      '<p class="rvx-price"><span>From</span>' + m.price + '</p>' +
      '<p class="rvx-tag">' + m.tag + '</p>' +
      '<div class="rvx-spec">' + cells + '</div>' +
      '<div class="rvx-act">' +
        '<a class="btn-solid" href="#">Explore ' + m.name + '</a>' +
        '<a class="rvx-quiet" href="#">Download brochure</a>' +
      '</div>' +
    '</div>';
  }).join("");

  dotRows.forEach(function (row) {
    row.innerHTML = MODELS.map(function (m, k) {
      return '<button class="rvx-dot" type="button" data-k="' + k + '" aria-label="' + m.name + '"></button>';
    }).join("");
  });

  function paint() {
    var vans = stage.querySelectorAll(".rvx-van");
    var bs = badges ? badges.querySelectorAll(".rvx-badge-set") : [];
    var ps = panels.querySelectorAll(".rvx-panel");
    for (var k = 0; k < N; k++) {
      var d = (k - at + N) % N;
      if (d > N / 2) { d -= N; }
      vans[k].dataset.d = d;
      if (bs[k]) { bs[k].classList.toggle("on", k === at); }
      ps[k].classList.toggle("on", k === at);
    }
    dotRows.forEach(function (row) {
      [].slice.call(row.children).forEach(function (b, k) {
        b.classList.toggle("on", k === at);
      });
    });
  }

  function go(i) { at = (i + N) % N; paint(); }

  sec.addEventListener("click", function (e) {
    if (swallowClick) { swallowClick = false; return; }
    var a = e.target.closest("[data-go]");
    if (a) { go(at + (+a.dataset.go)); return; }
    var dot = e.target.closest(".rvx-dot");
    if (dot) { go(+dot.dataset.k); return; }
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

  /* a trackpad swipe is a wheel with deltaX and fires no pointer events */
  var QUIET = 220, NEED = 60, accum = 0, lastX = 0, armed = true;
  sec.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   /* vertical: not ours */
    e.preventDefault();
    var now = performance.now();
    if (now - lastX > QUIET) { accum = 0; armed = true; }
    lastX = now;
    if (!armed) return;
    accum += e.deltaX;
    if (Math.abs(accum) >= NEED) {
      go(at + (accum > 0 ? 1 : -1));
      accum = 0;
      armed = false;
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
    swallowClick = true;      /* a drag off a neighbour would step twice */
  });

  /* the sample page's switches; absent on the real homepage */
  var bar = document.querySelector("[data-rvx-bar]");
  if (bar) {
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-set]");
      if (!b) return;
      var g = b.dataset.set, v = b.dataset.val;
      [].slice.call(bar.querySelectorAll('button[data-set="' + g + '"]'))
        .forEach(function (x) { x.classList.toggle("on", x === b); });
      if (g === "lay") {
        sec.classList.toggle("lay-stage", v === "stage");
        sec.classList.toggle("lay-right", v === "right");
      }
      if (g === "motion") { sec.classList.toggle("is-snap", v === "snap"); }
      if (g === "angle")  { angle = v; buildStage(); }
    });
  }

  buildStage();
})();
