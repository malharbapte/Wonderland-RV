/* Why choose us, homepage (desktop and phone): a looping three-up slider that runs off both screen edges. The middle three photos are the page column; the one either side is dimmed and waiting. */
(function () {
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var lb = document.querySelector(".wyc-lb"), lbImg = lb && lb.querySelector("img"), lbCap = lb && lb.querySelector("figcaption"), lbSet = [], lbAt = 0, lbOpener = null;
  function lbShow(i) { lbAt = (i + lbSet.length) % lbSet.length; var t = lbSet[lbAt], b = t.querySelector(".wd-c b"); lbImg.src = t.querySelector("img").getAttribute("src"); lbCap.innerHTML = "<b>" + b.textContent + "</b>" + b.nextElementSibling.textContent; }
  function lbOpen(list, i, o) { var keep = list.filter(function (t) { return t.querySelector("img"); }); i = keep.indexOf(list[i]); if (i < 0) return; lbSet = keep; lbOpener = o; lbShow(i); lb.hidden = false; lb.querySelector(".wyc-x").focus(); }
  function lbClose() { lb.hidden = true; lbImg.removeAttribute("src"); if (lbOpener) lbOpener.focus(); }

  [].forEach.call(document.querySelectorAll("[data-wyc]"), function (s) {
    var sec = s.closest("section"), tr = s.querySelector(".wyc-tr"), vp = s.querySelector(".wyc-vp"), orig = [].slice.call(tr.children), n = orig.length, VIS = 3, mq = window.matchMedia("(max-width: 900px)");
    /* three copies of the set, so there is always a photo on both sides; we start on the middle copy and quietly jump back to it after each slide */
    var frag = document.createDocumentFragment(), all = [];
    [0, 1, 2].forEach(function (copy) {
      orig.forEach(function (c, i) {
        var el = copy === 1 ? c : c.cloneNode(true);
        el.dataset.i = i; if (copy !== 1) { el.setAttribute("aria-hidden", "true"); el.tabIndex = -1; }
        frag.appendChild(el); all.push(el);
      });
    });
    tr.appendChild(frag);
    var idx = n, prevs = [].slice.call(sec.querySelectorAll(".wy-prev")), nexts = [].slice.call(sec.querySelectorAll(".wy-next")), count = sec.querySelector(".wy-count"), prog = sec.querySelector(".wyc-dots"), ticks = [];
    if (prog) orig.forEach(function (c, t) { var tk = document.createElement("button"); tk.type = "button"; tk.textContent = c.dataset.tab; tk.addEventListener("click", function () { var at0 = ((idx % n) + n) % n, d = t - at0; if (d > n / 2) d -= n; else if (d < -n / 2) d += n; if (d) go(d); }); prog.appendChild(tk); ticks.push(tk); });
    function gap() { return parseFloat(getComputedStyle(tr).columnGap) || 0; }
    function place(animate) {
      VIS = mq.matches ? 1 : 3;   /* phone: one photo in the middle, a sliver of its neighbours either side */
      var step = all[0].offsetWidth + gap(), left = mq.matches ? (vp.clientWidth - all[0].offsetWidth) / 2 : s.getBoundingClientRect().left - vp.getBoundingClientRect().left;
      tr.style.transition = animate ? "" : "none";
      tr.style.transform = "translateX(" + (left - step * idx) + "px)";
      if (!animate) { void tr.offsetWidth; tr.style.transition = ""; }
      var at = ((idx % n) + n) % n;
      all.forEach(function (el, k) { el.classList.toggle("is-out", k < idx || k >= idx + VIS); });
      ticks.forEach(function (tk, k) { tk.classList.toggle("on", ((k - at + n) % n) < VIS); });
      if (count) count.textContent = pad(at + 1) + "–" + pad((at + VIS - 1) % n + 1) + " / " + pad(n);
    }
    function go(d) { idx += d; place(true); }
    tr.addEventListener("transitionend", function (e) {
      if (e.target !== tr) return;
      if (idx >= 2 * n) { idx -= n; place(false); } else if (idx < n) { idx += n; place(false); }
    });
    prevs.forEach(function (b) { b.addEventListener("click", function () { go(-1); }); });
    nexts.forEach(function (b) { b.addEventListener("click", function () { go(1); }); });
    window.addEventListener("resize", function () { place(false); });
    var x0 = null, moved = false;
    vp.addEventListener("pointerdown", function (e) { x0 = e.clientX; moved = false; });
    window.addEventListener("pointerup", function (e) { if (x0 === null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) { moved = true; go(d < 0 ? 1 : -1); } });
    s.setAttribute("tabindex", "-1");
    s.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1); });
    /* a click on a dimmed photo slides it in; a click on a lit one opens it large */
    tr.addEventListener("click", function (e) {
      var card = e.target.closest(".wd"); if (!card) return;
      e.stopPropagation();
      if (moved) { moved = false; e.preventDefault(); return; }
      var k = all.indexOf(card);
      if (card.classList.contains("is-out")) { go(k < idx ? -1 : 1); return; }
      if (card.classList.contains("wd--tbc")) return;   /* no photo yet, nothing to enlarge */
      lbOpen(orig, +card.dataset.i, card);
    });
    tr.addEventListener("focusin", function (e) { var card = e.target.closest(".wd"), k = all.indexOf(card); if (k > -1 && (k < idx || k >= idx + VIS)) { idx = k < idx ? k : k - VIS + 1; place(true); } });
    /* it keeps moving by itself, one photo every 4 s; it stops while the pointer is over it or the tab is hidden, and waits 8 s after anyone touches it */
    var hold = 0, hover = false, seen = false;
    if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      [s, sec.querySelector(".wyc-bar")].forEach(function (el) { if (el) { el.addEventListener("mouseenter", function () { hover = true; }); el.addEventListener("mouseleave", function () { hover = false; }); } });
      ["pointerdown", "keydown", "focusin"].forEach(function (ev) { sec.addEventListener(ev, function () { hold = Date.now() + 8000; }); });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; }, { threshold: 0.3 }).observe(s); else seen = true;
      setInterval(function () { if (seen && !hover && !document.hidden && Date.now() >= hold) go(1); }, 4000);
    }
    place(false);
  });

  if (!lb) return;
  lb.addEventListener("click", function (e) { if (e.target.closest(".wyc-x") || e.target === lb) lbClose(); else if (e.target.closest(".wyc-pv")) lbShow(lbAt - 1); else if (e.target.closest(".wyc-nx")) lbShow(lbAt + 1); });
  document.addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbShow(lbAt - 1); else if (e.key === "ArrowRight") lbShow(lbAt + 1); });
})();
