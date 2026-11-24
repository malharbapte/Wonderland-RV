/* Why choose us sample: a three-up slider (arrows, swipe, keys) and a lightbox for looking at a detail large. */
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


(function () {
  var s = document.getElementById("wySlider");
  if (!s) return;
  var tr = s.querySelector(".wy-tr"), cards = tr.children, prev = s.querySelector(".wy-arrow--prev"), next = s.querySelector(".wy-arrow--next"), vp = s.querySelector(".wy-vp");
  var VIS = 3, at = 0, max = Math.max(0, cards.length - VIS);
  function gap() { return parseFloat(getComputedStyle(tr).columnGap) || 0; }
  function go(i) {
    at = Math.max(0, Math.min(max, i));
    tr.style.transform = "translateX(" + (-(cards[0].offsetWidth + gap()) * at) + "px)";
    prev.disabled = at === 0; next.disabled = at === max;
  }
  prev.addEventListener("click", function () { go(at - 1); });
  next.addEventListener("click", function () { go(at + 1); });
  window.addEventListener("resize", function () { go(at); });
  /* a card out of view moves into view when it is focused (Tab) */
  tr.addEventListener("focusin", function (e) { var k = [].indexOf.call(cards, e.target.closest(".wd")); if (k > -1 && (k < at || k >= at + VIS)) go(k < at ? k : k - VIS + 1); });
  /* swipe / drag */
  var x0 = null, moved = false;
  vp.addEventListener("pointerdown", function (e) { x0 = e.clientX; moved = false; });
  window.addEventListener("pointerup", function (e) { if (x0 === null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) { moved = true; go(at + (d < 0 ? 1 : -1)); } });
  vp.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  document.addEventListener("keydown", function (e) { var lb = document.getElementById("wyLb"); if (lb && !lb.hidden) return; if (e.key === "ArrowLeft") go(at - 1); else if (e.key === "ArrowRight") go(at + 1); });
  go(0);
})();
