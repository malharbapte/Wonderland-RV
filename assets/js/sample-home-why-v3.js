/* Samples, round 3: Why choose us. Sample only. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* A · annotated photo: hover, focus or click opens a dot; arrows move between dots */
  (function () {
    var fig = document.getElementById("xaFig"); if (!fig) return;
    var dots = [].slice.call(fig.querySelectorAll(".xa-dot"));
    function open(i) { dots.forEach(function (d, k) { d.classList.toggle("on", k === i); d.setAttribute("aria-expanded", k === i ? "true" : "false"); }); }
    dots.forEach(function (d, i) {
      d.addEventListener("mouseenter", function () { open(i); });
      d.addEventListener("focus", function () { open(i); });
      d.addEventListener("click", function () { open(i); });
      d.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = (i + 1) % dots.length;
        else if (k === "ArrowLeft" || k === "ArrowUp") n = (i - 1 + dots.length) % dots.length;
        else if (k === "Escape") { d.classList.remove("on"); d.setAttribute("aria-expanded", "false"); return; }
        if (n !== null) { e.preventDefault(); dots[n].focus(); }
      });
    });
  })();

  /* B · built in layers: the line fills to the stage you are on, later stages dim */
  (function () {
    var sec = document.getElementById("vB"), line = document.getElementById("xbLine"); if (!sec || !line) return;
    var st = [].slice.call(line.querySelectorAll(".xb-s")), pinned = -1;
    sec.classList.add("js");
    function lit(i) { st.forEach(function (s, k) { s.classList.toggle("dim", i >= 0 && k > i); }); }
    function rest() { lit(pinned); }
    st.forEach(function (s, i) {
      s.addEventListener("mouseenter", function () { lit(i); });
      s.addEventListener("mouseleave", rest);
      s.addEventListener("focus", function () { lit(i); });
      s.addEventListener("blur", rest);
      s.addEventListener("click", function () {
        pinned = pinned === i ? -1 : i;
        st.forEach(function (x, k) { x.classList.toggle("pin", k === pinned); });
        lit(pinned);
      });
      s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); s.click(); } });
    });
    function go() { sec.classList.add("in"); setTimeout(function () { sec.classList.add("live"); }, reduce ? 0 : 1800); }
    if (reduce || !("IntersectionObserver" in window)) go();
    else new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: 0.35 }).observe(sec);
  })();

  /* C · split: hover, focus or click a row; the orange mark rides to it */
  (function () {
    var list = document.getElementById("xcList"); if (!list) return;
    var rows = [].slice.call(list.querySelectorAll(".xc-row"));
    function show(i) {
      list.style.setProperty("--i", i);
      rows.forEach(function (r, k) { r.classList.toggle("on", k === i); r.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    }
    rows.forEach(function (r, i) {
      r.addEventListener("mouseenter", function () { show(i); });
      r.addEventListener("focus", function () { show(i); });
      r.addEventListener("click", function () { show(i); });
    });
  })();

  /* D · big numbers: each cell shows the matching slice of the faded photo, developed */
  (function () {
    var img = document.getElementById("xdImg"), grid = document.getElementById("xdGrid"); if (!img || !grid) return;
    var cells = [].slice.call(grid.querySelectorAll(".xd-cell"));
    function lay() {
      var nw = img.naturalWidth || 1600, nh = img.naturalHeight || 1067, r = img.getBoundingClientRect();
      var sc = Math.max(r.width / nw, r.height / nh), iw = nw * sc, ih = nh * sc;
      var ix = r.left + (r.width - iw) * 0.5, iy = r.top + (r.height - ih) * 0.5;
      cells.forEach(function (c) {
        var b = c.getBoundingClientRect();
        c.style.setProperty("--bs", iw + "px " + ih + "px");
        c.style.setProperty("--bp", (ix - b.left) + "px " + (iy - b.top) + "px");
      });
    }
    if (img.complete) lay(); else img.addEventListener("load", lay);
    window.addEventListener("resize", lay);
    window.addEventListener("load", lay);
  })();

  /* E · wipe: drag, click, arrow keys; hovering a claim slides the wipe to it */
  (function () {
    var cmp = document.getElementById("xeCmp"), claims = [].slice.call(document.querySelectorAll(".xe-claim")); if (!cmp) return;
    var p = 50, dragging = false;
    function set(v, animate) {
      p = Math.max(0, Math.min(100, v));
      cmp.classList.toggle("anim", !!animate && !reduce);
      cmp.style.setProperty("--p", p + "%");
      cmp.setAttribute("aria-valuenow", Math.round(p));
      cmp.setAttribute("data-near", p < 14 ? "l" : p > 86 ? "r" : "");
      claims.forEach(function (c) { c.classList.toggle("on", Math.abs(p - +c.getAttribute("data-p")) < 6); });
    }
    function fromEvent(e) { var r = cmp.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
    cmp.addEventListener("pointerdown", function (e) {
      dragging = true; cmp.classList.add("drag"); cmp.focus({ preventScroll: true });
      try { cmp.setPointerCapture(e.pointerId); } catch (x) {}
      set(fromEvent(e), false); e.preventDefault();
    });
    cmp.addEventListener("pointermove", function (e) { if (dragging) set(fromEvent(e), false); });
    function end() { dragging = false; cmp.classList.remove("drag"); }
    cmp.addEventListener("pointerup", end); cmp.addEventListener("pointercancel", end);
    cmp.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key];
      if (d) { e.preventDefault(); set(p + d, true); }
      else if (e.key === "Home") { e.preventDefault(); set(0, true); }
      else if (e.key === "End") { e.preventDefault(); set(100, true); }
    });
    claims.forEach(function (c) {
      var v = +c.getAttribute("data-p");
      c.addEventListener("mouseenter", function () { set(v, true); });
      c.addEventListener("focus", function () { set(v, true); });
      c.addEventListener("click", function () { set(v, true); });
    });
    set(50, false);
    /* one nudge the first time it scrolls into view: frame, then across to the finish, then back */
    if (!reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e, o) {
        if (!e[0].isIntersecting) return; o.disconnect();
        setTimeout(function () { if (!dragging && p === 50) set(88, true); }, 250);
        setTimeout(function () { if (!dragging && p === 88) set(50, true); }, 1500);
      }, { threshold: 0.6 }).observe(cmp);
    }
  })();
})();
