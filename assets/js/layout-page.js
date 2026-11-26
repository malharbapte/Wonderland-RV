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
})();
