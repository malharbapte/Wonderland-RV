/* Awards & achievements: click a banner to open it (1.4x, in front of the rest),
   arrows or the left/right keys step to the neighbour, Escape or a second click
   closes it. The arrows are placed once the banner has finished growing. */
(function () {
  "use strict";
  var st = document.getElementById("tyAw"), box = document.getElementById("tyAwRbs"), mv = document.getElementById("tyAwMv");
  if (!st || !box || !mv) return;
  var items = [].slice.call(box.children), mp = mv.querySelector(".ty-aw-p"), mn = mv.querySelector(".ty-aw-n"), cur = -1, tm;

  var vid = st.querySelector("video");
  if (vid && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { vid.removeAttribute("autoplay"); vid.pause(); }

  function park() {
    clearTimeout(tm);
    mv.classList.remove("on");
    if (cur < 0) return;
    tm = setTimeout(function () {
      var r = items[cur].getBoundingClientRect(), sr = st.getBoundingClientRect(),
          k = parseFloat(getComputedStyle(document.documentElement).fontSize), bw = 0.56 * k, y = r.top - sr.top + r.height * 0.5;
      mp.style.left = (r.left - sr.left - bw - 0.04 * k) + "px";
      mn.style.left = (r.right - sr.left + 0.04 * k) + "px";
      mp.style.top = mn.style.top = y + "px";
      mv.classList.add("on");
    }, 640);
  }
  function open(i) {
    cur = (i < 0 || i >= items.length) ? -1 : i;
    items.forEach(function (c, k) { var o = k === cur; c.classList.toggle("is-open", o); c.setAttribute("aria-pressed", String(o)); });
    park();
  }
  box.addEventListener("click", function (e) { var b = e.target.closest(".ty-aw-rb"); if (!b) return; var i = items.indexOf(b); open(i === cur ? -1 : i); });
  mv.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || cur < 0) return;
    open((cur + (b.classList.contains("ty-aw-p") ? -1 : 1) + items.length) % items.length);
  });
  document.addEventListener("keydown", function (e) {
    if (cur < 0) return;
    if (e.key === "Escape") open(-1);
    else if (e.key === "ArrowLeft") open((cur - 1 + items.length) % items.length);
    else if (e.key === "ArrowRight") open((cur + 1) % items.length);
  });
  window.addEventListener("resize", park);
})();
