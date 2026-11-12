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
    else if (!shown.length) { name.textContent = "—"; setPick("—"); setEnq("—", ""); }

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
    setPick(text + "  ·  " + row.dataset.size);
    setEnq(text, row.dataset.size);
  }

  /* ---- phone: the list is a sheet ----------------------------------------
     The button, the scrim and Done are hidden above 900px by the stylesheet,
     so none of this can be reached on desktop. */
  var pick   = document.getElementById("fpPick");
  var pickNm = document.getElementById("fpPickName");
  var scrim  = document.getElementById("fpScrim");
  var close  = document.getElementById("fpSheetClose");
  var phone  = window.matchMedia("(max-width: 900px)");
  function setPick(t) { if (pickNm) pickNm.textContent = t; }
  /* the pop-up names whichever layout is selected */
  var eqName = document.getElementById("eqName");
  var eqSize = document.getElementById("eqSize");
  var eqLay  = document.getElementById("eqLayout");
  var eqPlan = document.getElementById("eqPlan");
  function setEnq(n, sz) {
    if (eqName) eqName.textContent = n;
    if (eqSize) eqSize.textContent = sz || "";
    if (eqLay)  eqLay.value = n + (sz ? " " + sz : "");
    if (eqPlan) eqPlan.setAttribute("data-ph", "FLOORPLAN — " + n);
  }
  function sheet(open) {
    dock.classList.toggle("is-sheet-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    document.body.classList.toggle("fp-sheet-lock", open);
    if (pick) pick.setAttribute("aria-expanded", String(open));
  }
  if (pick) pick.addEventListener("click", function () { sheet(true); });
  if (scrim) scrim.addEventListener("click", function () { sheet(false); });
  if (close) close.addEventListener("click", function () { sheet(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") sheet(false); });
  if (phone.addEventListener) phone.addEventListener("change", function () { sheet(false); });

  rows.forEach(function (r) {
    r.addEventListener("click", function () { select(r); if (phone.matches) sheet(false); });
  });
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
  /* the first row is marked on in the markup, so select() has not run for it */
  var first = rows.filter(function (r) { return r.classList.contains("is-on"); })[0];
  if (first) {
    var fn = first.querySelector(".fp-row-name").textContent.trim();
    setPick(fn + "  ·  " + first.dataset.size);
    setEnq(fn, first.dataset.size);
  }

  /* ---- the enquiry pop-up ------------------------------------------------
     Opens after 5 seconds of time spent in the Layouts section: the clock
     runs only while the section is in view (same band the rail uses) and the
     tab is showing, and it keeps what it has counted if you scroll away and
     come back. Once per page view, and again on every revisit; it waits if the phone's layout sheet is open. */
  var eqScrim = document.getElementById("eqScrim");
  var eqCard  = document.getElementById("eqCard");
  var eqForm  = document.getElementById("eqForm");
  var eqX     = document.getElementById("eqClose");
  var EQ_MS   = 5000;
  var eqSeen  = false, eqOpen = false, eqBack = null;   /* nothing is remembered: every visit opens it again */

  function eqShow() {
    eqOpen = true; eqSeen = true;
    eqBack = document.activeElement;
    eqScrim.hidden = false;
    document.body.classList.add("eq-lock");
    eqCard.focus();
  }
  function eqHide() {
    if (!eqOpen) return;
    eqOpen = false;
    eqScrim.hidden = true;
    document.body.classList.remove("eq-lock");
    if (eqBack && eqBack.focus) { try { eqBack.focus(); } catch (e) {} }
  }

  if (eqScrim && eqCard && eqForm) {
    eqX.addEventListener("click", eqHide);
    eqScrim.addEventListener("click", function (e) { if (e.target === eqScrim) eqHide(); });
    document.addEventListener("keydown", function (e) {
      if (!eqOpen) return;
      if (e.key === "Escape") { eqHide(); return; }
      if (e.key === "Tab") {      /* keep the keyboard inside the card */
        var f = [].slice.call(eqCard.querySelectorAll("button, input, select, textarea, a[href]"))
                   .filter(function (n) { return !n.disabled && n.type !== "hidden" && n.offsetParent !== null; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === a || document.activeElement === eqCard)) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    eqForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!eqForm.checkValidity()) { eqForm.reportValidity(); return; }
      location.href = "thank-you.html";   /* not wired to a service yet, like the other forms */
    });

    if (!eqSeen && section && "IntersectionObserver" in window) {
      var inView = false, counted = 0, since = 0, timer = null;
      var tick = function () {
        timer = null;
        if (dock.classList.contains("is-sheet-open")) { timer = setTimeout(tick, 1000); return; }
        eqShow();
      };
      var run = function () {
        var want = inView && !document.hidden && !eqSeen;
        if (want && !timer) { since = Date.now(); timer = setTimeout(tick, Math.max(0, EQ_MS - counted)); }
        else if (!want && timer) { clearTimeout(timer); timer = null; counted += Date.now() - since; }
      };
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView = en.isIntersecting; });
        run();
      }, { rootMargin: "-10% 0px -40% 0px" }).observe(section);
      document.addEventListener("visibilitychange", run);
    }

    /* the pill's indicator is CSS only; nothing to measure */
  }
})();
