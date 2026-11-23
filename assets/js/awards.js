/* Awards & achievements. Four Caravan of the Year ribbons hang from a rail, newest on the left.
   Click one (or press left / right with a ribbon focused) and the grey strip below shows its title,
   line and, where there is an article, the button. The text lives in the data-* attributes on each
   ribbon button in thank-you.html: data-k (kicker), data-t (title), data-d (line), data-a ("1" shows
   Read the article). */
(function () {
  "use strict";
  var rail = document.getElementById("tyAwdRail"), info = document.getElementById("tyAwdInfo");
  if (!rail || !info) return;
  var btns = [].slice.call(rail.querySelectorAll("button")), cta = info.querySelector(".ty-awd-cta"),
      k = info.querySelector(".ty-awd-k"), t = info.querySelector(".ty-awd-t"), d = info.querySelector(".ty-awd-d"), cur = 1;
  function show(i) {
    cur = (i + btns.length) % btns.length;
    btns.forEach(function (b, n) { b.classList.toggle("is-sel", n === cur); b.setAttribute("aria-pressed", String(n === cur)); });
    var b = btns[cur];
    k.textContent = b.getAttribute("data-k"); t.innerHTML = b.getAttribute("data-t"); d.innerHTML = b.getAttribute("data-d");
    cta.hidden = b.getAttribute("data-a") !== "1";
    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
  }
  btns.forEach(function (b, n) { b.addEventListener("click", function () { show(n); }); });
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(cur - 1); btns[cur].focus(); }
    else if (e.key === "ArrowRight") { show(cur + 1); btns[cur].focus(); }
  });
  show(1);
})();
