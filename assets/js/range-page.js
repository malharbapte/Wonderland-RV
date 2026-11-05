/* ==========================================================================
   LAYOUTS — range.html

   THE FILTERS DRIVE THE LIST, not the other way round. The pill and the
   slider narrow what the rail shows; choosing a row from the rail sets the
   plan on the right and changes neither filter. The earlier version had
   this backwards -- picking a layout rewrote the pill -- which meant the
   controls described the selection instead of governing it.

     pill    kind: couples or family
     slider  MAXIMUM length. Its stops are the lengths that actually exist
             for the kind in view, so it cannot be dragged to a length that
             kind does not come in.

   That last point is the answer to both questions behind this change. The
   published set has NO 18'00" layout at all -- family starts at 18'06" --
   and 23'11" is family only, so a couples slider has no 23'11" stop to
   land on. Rebuilding the stops per kind makes both facts structural
   rather than something to remember.
   ========================================================================== */
(function () {
  var rail   = document.getElementById("fpRail");
  var toggle = document.getElementById("fpRailToggle");
  /* THE STATE LIVES ON THE DOCK, not the panel. The dock is what opens, and
     the strip is its sibling rather than its child, so a class on the dock
     is the one place both can be driven from. */
  var dock   = document.getElementById("fpRailDock");
  var name   = document.getElementById("fpName");
  var plan   = document.getElementById("fpPlan");
  var size   = document.getElementById("fpSize");
  var rows   = [].slice.call(document.querySelectorAll(".fp-row"));
  var fill   = document.querySelector(".fp-size-fill");
  var value  = document.querySelector(".fp-size-value");
  var count  = document.querySelector(".fp-size-count");
  var minEl  = document.getElementById("fpSizeMin");
  var maxEl  = document.getElementById("fpSizeMax");
  var list   = document.querySelector(".fp-rail-list");
  if (!rail || !dock || !rows.length) return;

  function ft(row) { return +row.dataset.ft; }
  function label(n) { return String(n).slice(0, 2) + "’" + String(n).slice(2) + "”"; }
  function kind() {
    var on = document.querySelector('.fp-kind input:checked');
    return on ? on.value : "couples";
  }

  var empty = document.createElement("p");
  empty.className = "fp-rail-empty";
  empty.hidden = true;
  empty.textContent = "No layouts at this length.";
  list.parentNode.insertBefore(empty, list.nextSibling);

  /* the stops are rebuilt from the data every time the kind changes, so the
     slider can only offer lengths that kind is actually built in */
  var stops = [];
  function rebuildStops(keepMax) {
    var k = kind();
    stops = rows.filter(function (r) { return r.dataset.kind === k; })
                .map(ft)
                .filter(function (v, i, a) { return a.indexOf(v) === i; })
                .sort(function (a, b) { return a - b; });
    size.min = "0";
    size.max = String(Math.max(0, stops.length - 1));
    var i = stops.length - 1;
    if (keepMax != null) {
      /* keep the nearest stop at or below the old maximum rather than
         snapping back to the top every time the pill moves */
      for (var j = 0; j < stops.length; j++) if (stops[j] <= keepMax) i = j;
    }
    size.value = String(i);
  }

  /* the row set the last pass produced, so this one can tell whether the
     filters actually changed anything. null until the first pass has run. */
  var lastSig = null;

  function apply() {
    var k = kind();
    var max = stops.length ? stops[+size.value] : 0;
    var shown = [];

    rows.forEach(function (r) {
      var ok = r.dataset.kind === k && ft(r) <= max;
      r.parentNode.hidden = !ok;
      if (ok) shown.push(r);
    });

    empty.hidden = shown.length > 0;
    if (value) value.textContent = stops.length ? label(max) : "—";
    if (count) count.textContent = shown.length
      ? shown.length + (shown.length === 1 ? " layout" : " layouts") : "";
    if (minEl) minEl.textContent = stops.length ? label(stops[0]) : "";
    if (maxEl) maxEl.textContent = stops.length ? label(stops[stops.length - 1]) : "";
    if (fill) fill.style.width = stops.length < 2
      ? "100%" : ((+size.value) / (stops.length - 1) * 100) + "%";

    /* if the filters have hidden whatever was selected, move to the first
       row still standing -- leaving a plan on screen that the list no
       longer offers is the kind of thing nobody notices until a demo */
    var on = shown.filter(function (r) { return r.classList.contains("is-on"); })[0];
    if (!on && shown.length) select(shown[0]);
    else if (!shown.length) { name.textContent = "—"; }

    /* ---- the rail answers the filters ------------------------------------
       Shut, the rail is out of the way rather than switched off: a filter
       that changes what the list holds has something new to show, so the
       rail comes back on its own.

       THE TEST IS THE RESULT, NOT THE INPUT. Dragging the slider inside one
       length bracket leaves the same rows standing, so it stays shut --
       popping out to show you what you were already looking at is the
       version of this that would annoy. Re-picking the pill that is already
       on never reaches here at all: a radio fires change only when it
       changes.

       THE FIRST PASS ONLY RECORDS. On load the rail is closed by design and
       the observer owns the entrance; opening here as well would make it
       arrive twice, which is the two-grammars fault all over again. */
    var sig = shown.map(function (r) { return rows.indexOf(r); }).join(",");
    if (lastSig !== null && sig !== lastSig) {
      dock.classList.remove("is-shut");
      dock.classList.add("is-in");
      syncRail();
    }
    lastSig = sig;
  }

  function select(row) {
    rows.forEach(function (r) { r.classList.toggle("is-on", r === row); });
    var text = row.querySelector(".fp-row-name").textContent.trim();
    name.textContent = text;
    if (plan) plan.setAttribute("data-ph", "FLOORPLAN — " + text);
  }

  rows.forEach(function (r) { r.addEventListener("click", function () { select(r); }); });
  size.addEventListener("input", apply);
  [].forEach.call(document.querySelectorAll('.fp-kind input'), function (inp) {
    inp.addEventListener("change", function () {
      rebuildStops(stops.length ? stops[+size.value] : null);
      apply();
    });
  });

  /* ---- the rail, per the artboard's notes -------------------------------
     It should only appear once this section is scrolled to, and it can be
     hidden from the side. Both are the SAME gesture now -- the dock's
     max-width opening -- so arriving and being reopened look alike. */
  function syncRail() {
    var open = dock.classList.contains("is-in") && !dock.classList.contains("is-shut");
    /* the markup starts shut, so this has to run on the observer's pass too
       and not only on a click, or the strip would announce the wrong state
       for the whole time the rail sat open by itself */
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Hide the layout list" : "Show the layout list");
  }

  var section = document.querySelector(".fp");
  if (section && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (dock.classList.contains("is-shut")) return;
        dock.classList.toggle("is-in", e.isIntersecting);
        syncRail();
      });
    }, { rootMargin: "-10% 0px -40% 0px" }).observe(section);
  } else {
    dock.classList.add("is-in");
    syncRail();
  }

  toggle.addEventListener("click", function () {
    var shut = dock.classList.toggle("is-shut");
    if (!shut) dock.classList.add("is-in");
    syncRail();
  });

  rebuildStops();
  apply();
})();
