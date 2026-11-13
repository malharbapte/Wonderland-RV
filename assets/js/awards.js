/* Awards & achievements. Four Caravan of the Year ribbons across the left two
   thirds (newest left); click one, use the arrows, or press left/right with a
   ribbon focused, and it comes to the front at 1.15x while the card on the right
   shows its title, line and (where there is an article) a button. Sizes are set
   here so the ribbons always fill the column: width from the overlap, length from
   the artwork's proportions, white margin as a share of the width. */
(function () {
  "use strict";
  var aw = document.getElementById("tyAw"), wrap = document.getElementById("tyAwWrap"), box = document.getElementById("tyAwRbs"),
      mv = document.getElementById("tyAwMv"), info = document.getElementById("tyAwInfo");
  if (!aw || !wrap || !box || !mv || !info) return;
  var items = [].slice.call(box.children), mp = mv.querySelector(".ty-aw-p"), mn = mv.querySelector(".ty-aw-n"),
      cta = info.querySelector(".ty-aw-cta"), cur = 1, OV = 0.25, UN = 0.85, GAP = 0.32;

  /* newest first. a = there is an article to link to (hrefs are placeholders in this mock) */
  var DATA = [
    { k: "Caravan of the Year 2026", t: "Solara 20\u201906", d: "Judges\u2019 Choice Award, The Queen of Hearts.", a: true },
    { k: "Caravan of the Year 2024", t: "XTR 2211", d: "Best Overall Caravan, Best Family Caravan and Most Innovative Build.", a: true },
    { k: "Caravan of the Year 2024", t: "XTR 1906", d: "Second place in the couples category.", a: true },
    { k: "Caravan of the Year 2023", t: "XTR 2200", d: "Finalist.", a: false }
  ];

  function rem() { return parseFloat(getComputedStyle(document.documentElement).fontSize); }
  function size() {
    var k = rem(), A = wrap.clientWidth, rw = A / (1 + 3 * (1 - OV)), bh = rw * 2.366;
    aw.style.setProperty("--rw", (rw / k).toFixed(3) + "rem");
    aw.style.setProperty("--bh", (bh / k).toFixed(3) + "rem");
    aw.style.setProperty("--pad", (rw * 0.0757 / k).toFixed(3) + "rem");
    var lo = rw * (1 - UN) / 2, bw = mp.offsetWidth, gap = GAP * k;       // arrows: same distance from the set's visible ends
    mp.style.left = (lo - gap - bw) + "px"; mn.style.left = (A - lo + gap) + "px";
  }
  function show(i) {
    cur = (i + items.length) % items.length;
    items.forEach(function (c, n) { c.classList.toggle("is-open", n === cur); c.setAttribute("aria-pressed", String(n === cur)); });
    var d = DATA[cur];
    info.querySelector(".ty-aw-k").textContent = d.k; info.querySelector(".ty-aw-t").textContent = d.t; info.querySelector(".ty-aw-d").textContent = d.d;
    cta.hidden = !d.a;
    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
  }
  box.addEventListener("click", function (e) { var b = e.target.closest(".ty-aw-rb"); if (b) show(items.indexOf(b)); });
  mv.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(cur + (b.classList.contains("ty-aw-p") ? -1 : 1)); });
  aw.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { show(cur - 1); items[cur].focus(); } else if (e.key === "ArrowRight") { show(cur + 1); items[cur].focus(); } });
  window.addEventListener("resize", size);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  size(); show(1);
})();
