/* Homepage dream van collage (desktop): pointing at, focusing or clicking a tile widens it; moving away restores the drawn layout. */
(function () {
  [].forEach.call(document.querySelectorAll("[data-dz]"), function (g) {
    var p = [].slice.call(g.querySelectorAll(".vp"));
    function on(x) {
      p.forEach(function (q) { q.classList.toggle("on", q === x); });
      g.setAttribute("data-open", x ? p.indexOf(x) + 1 : 0);
    }
    p.forEach(function (x) {
      x.addEventListener("mouseenter", function () { on(x); });
      x.addEventListener("focus", function () { on(x); });
      x.addEventListener("click", function () { on(x); });
      x.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on(x); } });
    });
    g.addEventListener("mouseleave", function () { if (!(document.activeElement && document.activeElement.classList.contains("vp") && g.contains(document.activeElement))) on(null); });
    g.addEventListener("focusout", function (e) { if (!g.contains(e.relatedTarget)) on(null); });
  });
})();
