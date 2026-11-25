/* Homepage dream van collage (desktop): pointing at, focusing or clicking a tile widens it; moving away restores the drawn layout.
   Optional modes, switched by classes on the grid (the sample's panel sets them; none are on by default):
     dz-click   open on click only, hover does nothing        dz-intent  hover must rest for 0.65 s before it opens */
(function () {
  [].forEach.call(document.querySelectorAll("[data-dz]"), function (g) {
    var p = [].slice.call(g.querySelectorAll(".vp")), timer = null, ptr = false;
    function mode(c) { return g.classList.contains(c); }
    function on(x) {
      p.forEach(function (q) { q.classList.toggle("on", q === x); });
      g.setAttribute("data-open", x ? p.indexOf(x) + 1 : 0);
    }
    p.forEach(function (x) {
      x.addEventListener("pointerdown", function () { ptr = true; });
      x.addEventListener("mouseenter", function () {
        if (mode("dz-click")) return;
        clearTimeout(timer);
        if (mode("dz-intent")) timer = setTimeout(function () { on(x); }, 650); else on(x);
      });
      x.addEventListener("mouseleave", function () { clearTimeout(timer); });
      x.addEventListener("focus", function () { if (ptr && mode("dz-click")) return; on(x); });   /* a click's own focus must not count twice */
      x.addEventListener("click", function () { ptr = false; if (mode("dz-click") && x.classList.contains("on")) on(null); else on(x); });
      x.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on(x); } });
    });
    g.addEventListener("mouseleave", function () { clearTimeout(timer); if (mode("dz-click")) return; if (!(document.activeElement && document.activeElement.classList.contains("vp") && g.contains(document.activeElement))) on(null); });
    g.addEventListener("focusout", function (e) { if (!g.contains(e.relatedTarget)) on(null); });
  });
})();
