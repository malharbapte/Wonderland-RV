/* Reviews wall: one stream of review cards in 3 columns (1 on phones).
   Shows the first BATCH, then a "Load more" button with a chevron adds the
   next BATCH until none are left. Each new card goes into the shortest column,
   so cards already on screen never jump.

   Data: window.WL_REVIEWS = [{ name, text, stars?, url?, photo?, images?[], img?, alt? }, ...]
   images = the photos the reviewer posted: shown under the text, click opens a lightbox.
   A review with no text draws grey bars (sample only). Mount point: #tyWall. */
(function () {
  "use strict";
  var BATCH = 30;
  var wall = document.getElementById("tyWall");
  var data = arrange(window.WL_REVIEWS || []);

  /* Order: reviews with photos first, newest first within each group. Each row
     of three also gets one real profile picture where there are enough of them
     (r.pic marks a real picture, not Google's coloured-letter default): at most
     one per row, and when a row has none one is pulled forward from later. */
  function arrange(list) {
    function byDate(a, b) { return (b.date || "").localeCompare(a.date || ""); }
    var pool = list.filter(function (r) { return r.images && r.images.length; }).sort(byDate)
      .concat(list.filter(function (r) { return !(r.images && r.images.length); }).sort(byDate));
    var out = [];
    while (pool.length) {
      var row = [], hasPic = false, k = 0;
      while (row.length < 3 && k < pool.length) {
        var r = pool[k];
        if (r.pic && hasPic) { k++; continue; }
        row.push(pool.splice(k, 1)[0]); if (r.pic) hasPic = true;
      }
      if (!hasPic && row.length) {
        var j = -1; for (var m = 0; m < pool.length; m++) if (pool[m].pic) { j = m; break; }
        if (j > -1) row[row.length - 1] = pool.splice(j, 1, row[row.length - 1])[0];
      }
      while (row.length < 3 && pool.length) row.push(pool.shift());
      out = out.concat(row);
    }
    return out;
  }
  if (!wall || !data.length) return;

  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1A73E8"/><path d="M7 12.4l3.3 3.3L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function when(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? (+m[3]) + " " + MONTHS[+m[2] - 1] + " " + m[1] : ""; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function stars(n) { n = Math.max(1, Math.min(5, n || 5)); return "\u2605".repeat(n) + "\u2606".repeat(5 - n); }
  var MAXTHUMBS = 6;
  function gallery(r, idx) {
    var im = r.images; if (!im || !im.length) return "";
    var n = Math.min(im.length, MAXTHUMBS), h = '<div class="ty-gal ty-gal--' + Math.min(n, 3) + '">';
    for (var k = 0; k < n; k++) {
      var more = (k === n - 1 && im.length > n) ? '<span class="ty-gal-more">+' + (im.length - n) + "</span>" : "";
      h += '<button type="button" class="ty-gal-b" data-r="' + idx + '" data-i="' + k + '" aria-label="Open photo ' + (k + 1) + " of " + im.length + '"><img src="' + esc(im[k]) + '" alt="" loading="lazy">' + more + "</button>";
    }
    return h + "</div>";
  }
  function card(r, i) {
    var el = document.createElement("figure");
    el.className = "ty-rc" + (r.img ? " ty-rc--img" : "") + (r.text ? "" : " ty-rc--sk");
    var body;
    if (r.text) body = "<blockquote>&ldquo;" + esc(r.text) + "&rdquo;</blockquote>";
    else {
      var w = [96, 88, 92, 70, 100, 84][i % 6], n = [3, 2, 4, 2, 3, 5, 2][i % 7], bars = "";
      for (var k = 0; k < n; k++) bars += '<i style="width:' + (w - k * 9) + '%"></i>';
      body = '<div class="sk">' + bars + "</div>";
    }
    var nm = r.name || "Reviewer name";
    var avatar = r.photo
      ? '<img class="ty-av" src="' + esc(r.photo) + '" alt="" loading="lazy">'
      : '<span class="ty-av ty-av--l" aria-hidden="true">' + esc(nm.charAt(0).toUpperCase()) + "</span>";
    var dt = when(r.date), label = !dt ? "" : r.url
      ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + dt + "</a>"
      : "<span>" + dt + "</span>";
    el.innerHTML =
      (r.img ? '<div class="ty-rc-img"><img src="' + esc(r.img) + '" alt="' + esc(r.alt || "") + '" loading="lazy"></div>' : "") +
      '<div class="ty-rc-body">' + gallery(r, i) + '<div class="top"><span class="ty-st" aria-label="' + (r.stars || 5) + ' out of 5 stars">' + stars(r.stars) + "</span><span class=\"ty-vr\">Verified review" + TICK + "</span></div>" +
      body + '<figcaption>' + avatar + '<div class="ty-who"><b>' + esc(nm) + "</b>" + label + "</div></figcaption></div>";
    return el;
  }

  var cols = [], shown = 0, btn;
  function build() {
    var n = window.matchMedia("(max-width:900px)").matches ? 1 : 3;
    wall.innerHTML = ""; cols = [];
    for (var c = 0; c < n; c++) { var d = document.createElement("div"); d.className = "ty-rc-col"; wall.appendChild(d); cols.push(d); }
    var upto = shown; shown = 0; add(upto || BATCH, true);
  }
  function add(count, quiet) {
    var end = Math.min(data.length, shown + count);
    for (; shown < end; shown++) {
      var el = card(data[shown], shown);
      if (!quiet) el.classList.add("ty-rc--in");
      var low = cols[0];
      cols.forEach(function (c) { if (c.offsetHeight < low.offsetHeight) low = c; });
      low.appendChild(el);
    }
    if (btn) btn.hidden = shown >= data.length;
  }

  /* Lightbox for reviewer photos */
  var lb, lbImg, lbSet = [], lbPos = 0, lbOpener;
  function lbShow(k) {
    lbPos = (k + lbSet.length) % lbSet.length; lbImg.src = lbSet[lbPos];
    lb.classList.toggle("ty-lb--one", lbSet.length < 2);
  }
  function lbClose() { if (!lb) return; lb.hidden = true; lbImg.removeAttribute("src"); document.documentElement.classList.remove("ty-lb-open"); if (lbOpener) lbOpener.focus(); }
  function lbOpen(r, k, opener) {
    if (!lb) {
      lb = document.createElement("div"); lb.className = "ty-lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Review photo");
      lb.innerHTML = '<button type="button" class="ty-lb-x" aria-label="Close">&times;</button><button type="button" class="ty-lb-p" aria-label="Previous photo">&#8249;</button><img alt=""><button type="button" class="ty-lb-n" aria-label="Next photo">&#8250;</button>';
      lbImg = lb.querySelector("img"); document.body.appendChild(lb);
      lb.addEventListener("click", function (e) {
        if (e.target.classList.contains("ty-lb-p")) lbShow(lbPos - 1);
        else if (e.target.classList.contains("ty-lb-n")) lbShow(lbPos + 1);
        else if (e.target !== lbImg) lbClose();
      });
      document.addEventListener("keydown", function (e) {
        if (lb.hidden) return;
        if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbShow(lbPos - 1); else if (e.key === "ArrowRight") lbShow(lbPos + 1);
      });
    }
    lbSet = data[r].images; lbOpener = opener; lb.hidden = false; document.documentElement.classList.add("ty-lb-open"); lbShow(k);
    lb.querySelector(".ty-lb-x").focus();
  }
  wall.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".ty-gal-b");
    if (b) lbOpen(+b.getAttribute("data-r"), +b.getAttribute("data-i"), b);
  });

  btn = document.getElementById("tyMore");
  if (btn) btn.addEventListener("click", function () { add(BATCH); });
  build();
  var mq = window.matchMedia("(max-width:900px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(build);
})();
