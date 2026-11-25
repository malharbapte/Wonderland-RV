/* Layouts (range.html), desktop: when the Layouts rail is open the plan and the dimension panel squeeze and slide
   right of it instead of sitting under it (option A). The block keeps its height; the plan keeps its proportions inside
   a narrower box. The rail's own open/close lives in range-page.js; this watches the dock's class and follows it. */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;
  var body = document.querySelector(".fp-body"), dock = document.getElementById("fpRailDock"),
      grid = document.querySelector(".fp-grid"), plan = document.getElementById("fpPlan"),
      inner = document.querySelector(".fp-inner"), fp = document.querySelector(".fp");
  if (!body || !dock || !grid || !plan || !inner || !fp) return;

  body.classList.add("sq", "sq-a");
  var probe = document.createElement("div");           /* the rail's width, whatever the window size */
  probe.style.cssText = "position:absolute;visibility:hidden;width:var(--railw);height:0";
  fp.appendChild(probe);
  var remPx = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; };

  function measure() {                                 /* the plan's natural height, held while the width changes */
    body.classList.remove("sq");
    body.style.removeProperty("--sq-h");
    var h = plan.getBoundingClientRect().height;
    body.classList.add("sq");
    body.style.setProperty("--sq-h", Math.round(h) + "px");
    update();
  }
  function open() { return dock.classList.contains("is-in") && !dock.classList.contains("is-shut"); }
  function update() {
    var gridLeft = inner.getBoundingClientRect().left + parseFloat(getComputedStyle(inner).paddingLeft || 0);
    var push = open() ? Math.max(0, probe.offsetWidth + 0.3 * remPx() - gridLeft) : 0;
    body.style.setProperty("--sq-push", Math.round(push) + "px");
  }
  new MutationObserver(update).observe(dock, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", measure);
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();
