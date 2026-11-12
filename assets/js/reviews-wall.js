/* Reviews wall: one stream of review cards in 3 columns (1 on phones).
   Shows the first BATCH, then a "Load more" button with a chevron adds the
   next BATCH until none are left. Each new card goes into the shortest column,
   so cards already on screen never jump.

   Data: window.WL_REVIEWS = [{ name, text, img?, alt? }, ...]
   A review with no text draws grey bars (sample only). Mount point: #tyWall. */
(function () {
  "use strict";
  var BATCH = 30;
  var wall = document.getElementById("tyWall");
  var data = window.WL_REVIEWS || [];
  if (!wall || !data.length) return;

  var G = '<svg class="gm" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3a11.5 11.5 0 0 0 10.2 6.3z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z"/></svg>';
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

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
    el.innerHTML =
      (r.img ? '<div class="ty-rc-img"><img src="' + esc(r.img) + '" alt="' + esc(r.alt || "") + '" loading="lazy"></div>' : "") +
      '<div class="ty-rc-body"><div class="top"><span class="ty-st" aria-label="5 out of 5 stars">★★★★★</span>' + G + "</div>" +
      body + "<figcaption><b>" + esc(r.name || "Reviewer name") + "</b><span>Google review</span></figcaption></div>";
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

  btn = document.getElementById("tyMore");
  if (btn) btn.addEventListener("click", function () { add(BATCH); });
  build();
  var mq = window.matchMedia("(max-width:900px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(build);
})();
