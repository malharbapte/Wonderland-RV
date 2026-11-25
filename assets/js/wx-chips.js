/* Experience page, phone: arrows and white fades on the option chips. The left arrow stays hidden until the row has been
   swiped or the right arrow used; the right arrow goes at the end of the row. */
(function () {
  var list = document.querySelector(".wx-options-list");
  if (!list || !window.matchMedia("(max-width: 900px)").matches) return;
  var wrap = document.createElement("div");
  wrap.className = "wx-chips has-right";
  list.parentNode.insertBefore(wrap, list);
  wrap.appendChild(list);
  function btn(dir, d) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "wx-chips-btn wx-chips-btn--" + dir;
    b.setAttribute("aria-label", dir === "next" ? "More options" : "Earlier options");
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
    b.addEventListener("click", function () { list.scrollBy({ left: (dir === "next" ? 1 : -1) * list.clientWidth * 0.6, behavior: "smooth" }); });
    wrap.appendChild(b);
  }
  btn("prev", "M15 5l-7 7 7 7");
  btn("next", "M9 5l7 7-7 7");
  function update() {
    var max = list.scrollWidth - list.clientWidth, x = list.scrollLeft;
    wrap.classList.toggle("has-left", x > 6);
    wrap.classList.toggle("has-right", x < max - 6);
  }
  list.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
