/* Dream van mosaic: pointing at, focusing, or clicking a tile re-balances the grid so that tile becomes the big one. */
(function () {
  [].forEach.call(document.querySelectorAll("[data-vx]"), function (g) {
    var p = [].slice.call(g.querySelectorAll(".vp"));
    function on(x) {
      p.forEach(function (q) { q.classList.toggle("on", q === x); });
      g.setAttribute("data-open", p.indexOf(x) + 1);
    }
    p.forEach(function (x) {
      x.addEventListener("mouseenter", function () { on(x); });
      x.addEventListener("focus", function () { on(x); });
      x.addEventListener("click", function () { on(x); });
      x.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on(x); }
      });
    });
  });
})();
