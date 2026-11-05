/* ==========================================================================
   FLOORPLANS — range.html

   COMPOSITION ONLY. This wires the three things the artboard's notes call
   for and nothing beyond them: the rail appearing on scroll, the rail
   collapsing, and the controls staying in step with the list. There is no
   floorplan data behind any of it yet.
   ========================================================================== */
(function () {
  var rail   = document.getElementById("fpRail");
  var toggle = document.getElementById("fpRailToggle");
  var name   = document.getElementById("fpName");
  var size   = document.getElementById("fpSize");
  var rows   = [].slice.call(document.querySelectorAll(".fp-row"));
  if (!rail || !rows.length) return;

  /* ---- "should only pop out when scrolled to this section" ---------------
     An IntersectionObserver on the section rather than a scroll handler:
     scroll events fire constantly and still have to measure, where this is
     told once when the threshold is crossed. Once shut by hand it stays
     shut -- the observer must not undo a deliberate close. */
  var section = document.querySelector(".fp");
  if (section && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (rail.classList.contains("is-shut")) return;
        rail.classList.toggle("is-in", e.isIntersecting);
      });
    }, { rootMargin: "-10% 0px -40% 0px" }).observe(section);
  } else {
    rail.classList.add("is-in");          /* no observer: just show it */
  }

  /* ---- "this can be hidden in the side" --------------------------------- */
  toggle.addEventListener("click", function () {
    var shut = rail.classList.toggle("is-shut");
    if (!shut) rail.classList.add("is-in");
    toggle.setAttribute("aria-expanded", String(!shut));
    toggle.setAttribute("aria-label", shut ? "Show the layout list" : "Hide the layout list");
  });

  /* ---- selecting a layout ----------------------------------------------- */
  function select(row) {
    rows.forEach(function (r) { r.classList.toggle("is-on", r === row); });
    name.textContent = row.textContent.trim();
    /* the slider tracks the list, so the two controls never disagree */
    var i = rows.indexOf(row);
    if (size && i >= 0) size.value = String(i);
    /* the pill follows the layout's own kind */
    var kind = row.dataset.kind;
    var radio = document.querySelector('.fp-kind input[value="' + kind + '"]');
    if (radio) radio.checked = true;
  }
  rows.forEach(function (r) { r.addEventListener("click", function () { select(r); }); });

  /* ---- the slider drives the same selection ----------------------------- */
  if (size) {
    size.max = String(rows.length - 1);
    size.addEventListener("input", function () {
      var row = rows[+size.value];
      if (row) {
        select(row);
        row.scrollIntoView({ block: "nearest" });
      }
    });
  }
})();
