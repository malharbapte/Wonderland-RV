/* Layout page: accordion, resizing plan and photo boxes, similar caravans with Load more. */
(function () {
  /* accordion: one open at a time, Bedding to start */
  var secs = [].slice.call(document.querySelectorAll(".lp-sec"));
  secs.forEach(function (s) {
    var b = s.querySelector("button");
    b.addEventListener("click", function () {
      var open = s.classList.contains("is-open");
      secs.forEach(function (o) { o.classList.remove("is-open"); o.querySelector("button").setAttribute("aria-expanded", "false"); });
      if (!open) { s.classList.add("is-open"); b.setAttribute("aria-expanded", "true"); }
    });
  });
  /* the box you point at widens */
  function grow(box, items, attr, cls) {
    if (!box) return;
    items.forEach(function (it, i) {
      it.addEventListener("mouseenter", function () { box.setAttribute("data-open", it.getAttribute(attr) || String(i + 1)); if (cls) it.classList.add(cls); });
      it.addEventListener("mouseleave", function () { if (cls) it.classList.remove(cls); });
    });
    box.addEventListener("mouseleave", function () { box.setAttribute("data-open", "0"); });
  }
  var plans = document.querySelector(".lp-plans");
  if (plans) grow(plans, [].slice.call(plans.querySelectorAll(".lp-plan")), "data-i");
  var gal = document.querySelector(".lp-gal");
  if (gal) grow(gal, [].slice.call(gal.querySelectorAll(".lp-ph")), "data-c", "on");

  /* similar caravans: the family layouts of the same length class, three at a time */
  var SIM = [
    ["1806EW-F3.0", "18’ 06” · Family", "East-west queen, triple bunks"],
    ["1906EW-F2.0", "19’ 06” · Family", "East-west queen, twin bunks"],
    ["1906EW-F3.0", "19’ 06” · Family", "East-west queen, triple bunks"],
    ["1907Q1-F2.0", "19’ 07” · Family", "Island queen, twin bunks"],
    ["1907Q1-F3.0", "19’ 07” · Family", "Island queen, triple bunks"],
    ["1907K-F2.0", "19’ 07” · Family", "Island king, twin bunks"]
  ];
  var wrap = document.querySelector(".lp-cards"), more = document.querySelector(".lp-more");
  if (wrap) {
    SIM.forEach(function (c, i) {
      var a = document.createElement("a");
      a.className = "lp-card"; a.href = "range.html"; if (i > 2) a.hidden = true;
      a.innerHTML = '<div class="lp-card-img" style="background-image:url(assets/img/build/plans/' + c[0] + '.webp)" role="img" aria-label="' + c[0] + ' floorplan"></div>' +
        "<h3>" + c[0] + "<small>" + c[1] + "</small></h3><p>" + c[2] + '</p><span class="lp-card-go">See details &gt;</span>';
      wrap.appendChild(a);
    });
    more.addEventListener("click", function () {
      var hid = [].slice.call(wrap.querySelectorAll(".lp-card[hidden]"));
      hid.slice(0, 3).forEach(function (c) { c.hidden = false; });
      if (hid.length <= 3) more.hidden = true;
    });
  }

  /* photo lightbox: click a photo to enlarge it, then swipe, drag, use the arrows or the arrow keys to move through the set; Esc or a click outside closes */
  var tiles = [].slice.call(document.querySelectorAll(".lp-ph"));
  if (tiles.length) {
    var items = tiles.map(function (t) { var im = t.querySelector("img"); return { src: im.getAttribute("src"), alt: im.getAttribute("alt") || "" }; });
    var lb = document.createElement("div");
    lb.className = "lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = '<button class="lb-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19"/></svg></button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<p class="lb-count" aria-live="polite"></p>';
    document.body.appendChild(lb);
    var img = lb.querySelector(".lb-img"), count = lb.querySelector(".lb-count"), cur = 0, isOpen = false, busy = 0;
    function show(i, dir) {
      var n = items.length; cur = ((i % n) + n) % n;
      clearTimeout(busy);
      if (dir) { img.style.transition = "opacity .18s ease, transform .18s ease"; img.style.opacity = "0"; img.style.transform = "translateX(" + (dir * -40) + "px)"; }
      busy = setTimeout(function () {
        img.src = items[cur].src; img.alt = items[cur].alt;
        if (dir) { img.style.transition = "none"; img.style.transform = "translateX(" + (dir * 40) + "px)"; void img.offsetWidth; img.style.transition = "opacity .3s ease, transform .35s cubic-bezier(.45, 0, .2, 1)"; }
        img.style.opacity = "1"; img.style.transform = "none";
      }, dir ? 180 : 0);
      /* safety net: if the browser has paused transitions (a hidden tab), still end on the finished state */
      var want = cur; clearTimeout(show.t);
      show.t = setTimeout(function () { if (cur === want) { img.src = items[cur].src; img.style.transition = "none"; img.style.opacity = "1"; img.style.transform = "none"; } }, dir ? 620 : 200);
      count.textContent = (cur + 1) + " / " + n;
      var pre = new Image(); pre.src = items[(cur + 1) % n].src;
    }
    function open(i) { isOpen = true; lb.hidden = false; void lb.offsetWidth; lb.classList.add("is-open"); document.body.classList.add("lb-lock"); show(i, 0); lb.querySelector(".lb-x").focus(); }
    function close() { if (!isOpen) return; isOpen = false; lb.classList.remove("is-open"); document.body.classList.remove("lb-lock"); setTimeout(function () { if (!isOpen) lb.hidden = true; }, 350); }
    tiles.forEach(function (t, i) {
      t.setAttribute("role", "button"); t.setAttribute("tabindex", "0"); t.setAttribute("aria-label", "Enlarge photo " + (i + 1));
      t.addEventListener("click", function () { open(i); });
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });
    lb.querySelector(".lb-x").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1, -1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1, 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1, -1); else if (e.key === "ArrowRight") show(cur + 1, 1);
    });
    /* swipe (touch) or drag (mouse) */
    var x0 = null, y0 = 0;
    lb.addEventListener("pointerdown", function (e) { if (e.target.closest(".lb-nav, .lb-x")) return; x0 = e.clientX; y0 = e.clientY; });
    lb.addEventListener("pointerup", function (e) {
      if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    lb.addEventListener("pointercancel", function () { x0 = null; });
  }
})();
