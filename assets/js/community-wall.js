/* Community wall: the real comment screenshots (community-data.js) in three columns
   (one on phones), 12 to start, then "Load more" adds 12 at a time. Each new card goes
   into the shortest column. While more are waiting the columns are cut level and the
   bottom fades into the page. A click opens the screenshot large (arrows or the left and
   right keys move on). Ambassador comments carry an "Ambassador" label. */
(function () {
  "use strict";
  var BATCH = 12, wall = document.getElementById("tyCm"), btn = document.getElementById("tyCmMore"), data = window.WL_COMMUNITY || [];
  if (!wall || !data.length) return;
  var cols = [], shown = 0;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function alt(d) { return "Comment from " + d.name + " on " + d.platform + (d.type === "ambassador" ? " (Wonderland ambassador)" : ""); }

  function card(d, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ty-cmc"; b.setAttribute("data-i", i); b.setAttribute("aria-label", alt(d) + ": open large");
    b.innerHTML = '<img src="' + esc(d.src) + '" width="' + d.w + '" height="' + d.h + '" alt="' + esc(alt(d)) + '" loading="lazy">' + (d.type === "ambassador" ? '<span class="ty-cmc-a">Ambassador</span>' : "");
    return b;
  }
  function build() {
    var n = window.matchMedia("(max-width:900px)").matches ? 1 : 3;
    wall.innerHTML = ""; cols = [];
    for (var c = 0; c < n; c++) { var d = document.createElement("div"); d.className = "ty-cmw-col"; wall.appendChild(d); cols.push(d); }
    var upto = shown; shown = 0; add(upto || BATCH);
  }
  function add(count) {
    var end = Math.min(data.length, shown + count);
    for (; shown < end; shown++) {
      var el = card(data[shown], shown), low = cols[0];
      cols.forEach(function (c) { if (c.offsetHeight < low.offsetHeight) low = c; });
      low.appendChild(el);
    }
    if (btn) btn.parentNode.hidden = shown >= data.length;
    fit();
  }
  function fit() {
    var more = shown < data.length;
    wall.classList.toggle("ty-wall--fade", more); wall.classList.toggle("ty-wall--w", more);
    if (!more) { wall.style.maxHeight = ""; return; }
    var low = Infinity; cols.forEach(function (c) { low = Math.min(low, c.offsetHeight); });
    wall.style.maxHeight = low + "px";
  }
  /* image heights are known from width/height, but the columns settle once fonts and images are in */
  window.addEventListener("load", fit);
  if (btn) btn.addEventListener("click", function () { add(BATCH); });

  var lb, lbImg, pos = 0, opener;
  function lbShow(k) { pos = (k + data.length) % data.length; lbImg.src = data[pos].src; lbImg.alt = alt(data[pos]); }
  function lbClose() { if (!lb) return; lb.hidden = true; lbImg.removeAttribute("src"); document.documentElement.classList.remove("ty-lb-open"); if (opener) opener.focus(); }
  function lbOpen(k, o) {
    if (!lb) {
      lb = document.createElement("div"); lb.className = "ty-lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Community comment");
      lb.innerHTML = '<button type="button" class="ty-lb-x" aria-label="Close">&times;</button><button type="button" class="ty-lb-p" aria-label="Previous comment">&#8249;</button><img alt=""><button type="button" class="ty-lb-n" aria-label="Next comment">&#8250;</button>';
      lbImg = lb.querySelector("img"); document.body.appendChild(lb);
      lb.addEventListener("click", function (e) {
        if (e.target.classList.contains("ty-lb-p")) lbShow(pos - 1);
        else if (e.target.classList.contains("ty-lb-n")) lbShow(pos + 1);
        else if (e.target !== lbImg) lbClose();
      });
      document.addEventListener("keydown", function (e) {
        if (!lb || lb.hidden) return;
        if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbShow(pos - 1); else if (e.key === "ArrowRight") lbShow(pos + 1);
      });
    }
    opener = o; lb.hidden = false; document.documentElement.classList.add("ty-lb-open"); lbShow(k); lb.querySelector(".ty-lb-x").focus();
  }
  wall.addEventListener("click", function (e) { var b = e.target.closest(".ty-cmc"); if (b) lbOpen(+b.getAttribute("data-i"), b); });

  build();
  var mq = window.matchMedia("(max-width:900px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(build);
})();
