/* Range page: the layouts side menu starts where the floor plan starts and ends where it ends. */
(function () {
  var dock = document.getElementById("fpRailDock"), tog = document.getElementById("fpRailToggle"), plan = document.getElementById("fpPlan");
  if (!dock || !tog || !plan) return;
  var wide = window.matchMedia("(min-width: 901px)");
  function fit() {
    if (!wide.matches) { dock.style.top = dock.style.bottom = tog.style.top = tog.style.bottom = ""; return; }
    var host = dock.offsetParent; if (!host) return;
    var h = host.getBoundingClientRect(), p = plan.getBoundingClientRect();
    var top = Math.round(p.top - h.top) + "px", bottom = Math.round(h.bottom - p.bottom) + "px";
    dock.style.top = tog.style.top = top; dock.style.bottom = tog.style.bottom = bottom;
  }
  fit(); window.addEventListener("resize", fit); window.addEventListener("load", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.body);
})();
