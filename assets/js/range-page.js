/* ==========================================================================
   FLOORPLANS — range.html

   COMPOSITION ONLY. Three behaviours, all of them called for by the
   artboard's own notes: the rail appearing on scroll, the rail collapsing,
   and the three controls staying in step with each other. No floorplan
   data sits behind any of it yet.
   ========================================================================== */
(function () {
  var rail   = document.getElementById("fpRail");
  var toggle = document.getElementById("fpRailToggle");
  var name   = document.getElementById("fpName");
  var plan   = document.getElementById("fpPlan");
  var size   = document.getElementById("fpSize");
  var rows   = [].slice.call(document.querySelectorAll(".fp-row"));
  var fill   = document.querySelector(".fp-size-fill");
  var value  = document.querySelector(".fp-size-value");
  if (!rail || !rows.length) return;

  /* ---- "should only pop out when scrolled to this section" --------------
     An observer rather than a scroll handler: scroll fires constantly and
     still has to measure, where this is told once at the threshold. A rail
     shut by hand stays shut -- the observer must not undo a deliberate
     close. */
  var section = document.querySelector(".fp");
  if (section && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (rail.classList.contains("is-shut")) return;
        rail.classList.toggle("is-in", e.isIntersecting);
      });
    }, { rootMargin: "-10% 0px -40% 0px" }).observe(section);
  } else {
    rail.classList.add("is-in");
  }

  /* ---- "this can be hidden in the side" --------------------------------- */
  toggle.addEventListener("click", function () {
    var shut = rail.classList.toggle("is-shut");
    if (!shut) rail.classList.add("is-in");
    toggle.setAttribute("aria-expanded", String(!shut));
    toggle.setAttribute("aria-label", shut ? "Show the layout list" : "Hide the layout list");
  });

  /* ---- one selection, three controls ------------------------------------
     The list, the slider and the pill are three views of the same choice,
     so they are all written from one function. Anything else lets them
     disagree. */
  function select(row, fromSlider) {
    rows.forEach(function (r) { r.classList.toggle("is-on", r === row); });

    var label = row.querySelector(".fp-row-name").textContent.trim();
    name.textContent = label;
    if (plan) plan.setAttribute("data-ph", "FLOORPLAN — " + label);

    var i = rows.indexOf(row);
    if (size && !fromSlider) size.value = String(i);
    if (fill) fill.style.width = (i / (rows.length - 1) * 100) + "%";
    if (value) value.innerHTML = row.querySelector(".fp-row-size").innerHTML;

    var radio = document.querySelector('.fp-kind input[value="' + row.dataset.kind + '"]');
    if (radio) radio.checked = true;
  }

  rows.forEach(function (r) { r.addEventListener("click", function () { select(r); }); });

  if (size) {
    size.max = String(rows.length - 1);
    size.addEventListener("input", function () {
      var row = rows[+size.value];
      if (row) { select(row, true); row.scrollIntoView({ block: "nearest" }); }
    });
  }

  /* the pill jumps to the first layout of the kind chosen, so picking
     "Family" cannot leave a couples layout on screen */
  [].forEach.call(document.querySelectorAll('.fp-kind input'), function (inp) {
    inp.addEventListener("change", function () {
      var first = rows.filter(function (r) { return r.dataset.kind === inp.value; })[0];
      if (first) { select(first); first.scrollIntoView({ block: "nearest" }); }
    });
  });

  select(rows[0]);
})();
