/* SAMPLE ONLY: wires the five phone menu ideas. Vanilla; nothing is stored. */
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function each(s, f, r) { Array.prototype.forEach.call((r || document).querySelectorAll(s), f); }
  function frame(v) { return $('.scr[data-v="' + v + '"]'); }
  function toggle(scr, on, btn) { scr.classList.toggle("is-open", on); if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false"); each(".sheet,.drawer", function (s) { s.setAttribute("aria-hidden", on ? "false" : "true"); }, scr); }

  /* every link in a sample just stays on the page */
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (a && a.closest(".scr")) e.preventDefault(); });

  /* A: More opens a sheet; scrim or a second tap closes it */
  var A = frame("A");
  if (A) {
    var more = $(".tb-more", A);
    more.addEventListener("click", function () { toggle(A, !A.classList.contains("is-open"), more); });
    $(".scrim", A).addEventListener("click", function () { toggle(A, false, more); });
  }
  /* B: speed dial */
  var B = frame("B");
  if (B) {
    var fab = $(".sd-fab", B);
    fab.addEventListener("click", function () { toggle(B, !B.classList.contains("is-open"), fab); });
    $(".scrim", B).addEventListener("click", function () { toggle(B, false, fab); });
  }
  /* C: tap the handle, or drag it up and down */
  var C = frame("C");
  if (C) {
    var sh = $(".sheetC", C), hd = $(".handle", C), y0 = null, moved = false;
    function setC(on) { C.classList.toggle("is-open", on); hd.setAttribute("aria-expanded", on ? "true" : "false"); sh.style.transform = ""; }
    hd.addEventListener("pointerdown", function (e) { y0 = e.clientY; moved = false; });
    window.addEventListener("pointermove", function (e) { if (y0 === null) return; if (Math.abs(e.clientY - y0) > 8) moved = true; });
    window.addEventListener("pointerup", function (e) {
      if (y0 === null) return;
      var d = e.clientY - y0; y0 = null;
      if (moved) setC(d < 0); else setC(!C.classList.contains("is-open"));
    });
    $(".scrim", C).addEventListener("click", function () { setC(false); });
  }
  /* D: the dock tucks away on scroll down and returns on scroll up */
  var D = frame("D");
  if (D) {
    var pg = $(".pg", D), dock = $(".dock", D), last = 0;
    pg.addEventListener("scroll", function () {
      var t = pg.scrollTop, d = t - last;
      if (Math.abs(d) < 6) return;
      dock.classList.toggle("is-hidden", d > 0 && t > 80); last = t;
    }, { passive: true });
  }
  /* E: edge tab opens the drawer */
  var E = frame("E");
  if (E) {
    var tab = $(".etab", E);
    tab.addEventListener("click", function () { toggle(E, true, tab); });
    $(".dr-x", E).addEventListener("click", function () { toggle(E, false, tab); });
    $(".scrim", E).addEventListener("click", function () { toggle(E, false, tab); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") each(".scr.is-open", function (s) { s.classList.remove("is-open"); }); });
})();
