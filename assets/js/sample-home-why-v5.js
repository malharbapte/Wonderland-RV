/* Why choose us, v5: every slider is three-up with the next photo peeking in; arrows, swipe, keys; one lightbox for the photos. */
(function () {
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  [].forEach.call(document.querySelectorAll("[data-wy]"), function (s) {
    var sec = s.closest("section"), tr = s.querySelector(".wy-tr"), cards = tr.children, n = cards.length, VIS = 3, at = 0, max = Math.max(0, n - VIS);
    var prevs = [].slice.call(sec.querySelectorAll(".wy-prev")), nexts = [].slice.call(sec.querySelectorAll(".wy-next")), count = sec.querySelector(".wy-count"), prog = sec.querySelector(".wy-prog i"), vp = s.querySelector(".wy-vp");
    function gap() { return parseFloat(getComputedStyle(tr).columnGap) || 0; }
    function go(i) {
      at = Math.max(0, Math.min(max, i));
      tr.style.transform = "translateX(" + (-(cards[0].offsetWidth + gap()) * at) + "px)";
      prevs.forEach(function (b) { b.disabled = at === 0; }); nexts.forEach(function (b) { b.disabled = at === max; });
      if (count) count.textContent = pad(at + 1) + "\u2013" + pad(at + VIS) + " / " + pad(n);
      if (prog) { prog.style.width = (VIS / n * 100) + "%"; prog.style.left = (at / n * 100) + "%"; }
    }
    prevs.forEach(function (b) { b.addEventListener("click", function () { go(at - 1); }); });
    nexts.forEach(function (b) { b.addEventListener("click", function () { go(at + 1); }); });
    window.addEventListener("resize", function () { go(at); });
    tr.addEventListener("focusin", function (e) { var k = [].indexOf.call(cards, e.target.closest(".wd")); if (k > -1 && (k < at || k >= at + VIS)) go(k < at ? k : k - VIS + 1); });
    var x0 = null, moved = false;
    vp.addEventListener("pointerdown", function (e) { x0 = e.clientX; moved = false; });
    window.addEventListener("pointerup", function (e) { if (x0 === null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) { moved = true; go(at + (d < 0 ? 1 : -1)); } });
    vp.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    s.setAttribute("tabindex", "-1");
    s.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(at - 1); else if (e.key === "ArrowRight") go(at + 1); });
    go(0);
  });

  /* lightbox: the photos of the slider you clicked in */
  var lb = document.getElementById("wyLb"); if (!lb) return;
  var img = lb.querySelector("img"), cap = lb.querySelector("figcaption"), set = [], at = 0, opener = null;
  function show(i) { at = (i + set.length) % set.length; var t = set[at]; img.src = t.querySelector("img").getAttribute("src"); cap.innerHTML = "<b>" + t.querySelector(".wd-c b").textContent + "</b>" + t.querySelector(".wd-c span").textContent; }
  function open(list, i, o) { set = list; opener = o; show(i); lb.hidden = false; lb.querySelector(".wy-x").focus(); }
  function close() { lb.hidden = true; img.removeAttribute("src"); if (opener) opener.focus(); }
  [].forEach.call(document.querySelectorAll("[data-wy]"), function (s) {
    var list = [].slice.call(s.querySelectorAll(".wd"));
    list.forEach(function (t, i) { t.addEventListener("click", function () { open(list, i, t); }); });
  });
  lb.addEventListener("click", function (e) { if (e.target.closest(".wy-x") || e.target === lb) close(); else if (e.target.closest(".wy-pv")) show(at - 1); else if (e.target.closest(".wy-nx")) show(at + 1); });
  document.addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(at - 1); else if (e.key === "ArrowRight") show(at + 1); });
})();
