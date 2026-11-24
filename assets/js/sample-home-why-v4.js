/* Why choose us sample: click a detail photo to look at it large; arrows / Esc work. */
(function () {
  var tiles = [].slice.call(document.querySelectorAll(".wd")), lb = document.getElementById("wyLb");
  if (!tiles.length || !lb) return;
  var img = lb.querySelector("img"), cap = lb.querySelector("figcaption"), at = 0, opener = null;
  function show(i) {
    at = (i + tiles.length) % tiles.length;
    var t = tiles[at];
    img.src = t.querySelector("img").getAttribute("src");
    cap.innerHTML = "<b>" + t.querySelector(".wd-c b").textContent + "</b>" + t.querySelector(".wd-c span").textContent;
  }
  function open(i, o) { opener = o; show(i); lb.hidden = false; lb.querySelector(".wy-x").focus(); }
  function close() { lb.hidden = true; img.removeAttribute("src"); if (opener) opener.focus(); }
  tiles.forEach(function (t, i) { t.addEventListener("click", function () { open(i, t); }); });
  lb.addEventListener("click", function (e) {
    if (e.target.closest(".wy-x") || e.target === lb) close();
    else if (e.target.closest(".wy-pv")) show(at - 1);
    else if (e.target.closest(".wy-nx")) show(at + 1);
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(at - 1); else if (e.key === "ArrowRight") show(at + 1);
  });
})();
