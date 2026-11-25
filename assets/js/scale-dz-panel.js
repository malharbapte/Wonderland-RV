/* SAMPLE ONLY: a small panel of switches for the Your dream van awaits collage, shown while that section is on screen.
   Each switch puts a class on the grid (see scale-b.css and home-dream.js). Choices are kept for the visit (sessionStorage). */
(function () {
  var g = document.querySelector("[data-dz]"), sec = document.querySelector(".dz");
  if (!g || !sec || !window.matchMedia("(min-width: 901px)").matches) return;
  var OPTS = [["dz-calm", "Slower, softer motion"], ["dz-intent", "Wait half a second before opening"], ["dz-click", "Open on click only (no hover)"],
              ["dz-still", "Keep the tiles still (no widening)"], ["dz-text", "Always show the descriptions"], ["dz-nodim", "Do not dim the other tiles"]];
  var GENTLE = ["dz-calm", "dz-intent", "dz-nodim"];
  var saved = []; try { saved = JSON.parse(sessionStorage.getItem("dzOpts") || "[]"); } catch (e) {}
  var box = document.createElement("div"); box.className = "dzp"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Dream van motion options");
  box.innerHTML = '<b role="button" tabindex="0" title="Click to fold the panel away">Dream van motion <i>\u2013</i></b>' + OPTS.map(function (o, i) { return '<label><input type="checkbox" data-c="' + o[0] + '"><span>' + o[1] + '</span></label>'; }).join("") +
    '<div class="dzp-row"><button type="button" data-p="gentle">Gentle preset</button><button type="button" data-p="reset">Reset</button></div>';
  document.body.appendChild(box);
  var boxes = [].slice.call(box.querySelectorAll("input"));
  function apply(list) { boxes.forEach(function (b) { b.checked = list.indexOf(b.dataset.c) > -1; g.classList.toggle(b.dataset.c, b.checked); }); try { sessionStorage.setItem("dzOpts", JSON.stringify(list)); } catch (e) {} }
  function current() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.dataset.c; }); }
  boxes.forEach(function (b) { b.addEventListener("change", function () { apply(current()); }); });
  box.addEventListener("click", function (e) { var t = e.target.closest("button"); if (!t) return; apply(t.dataset.p === "gentle" ? GENTLE : []); });
  var head = box.querySelector("b");
  function fold() { box.classList.toggle("is-folded"); head.querySelector("i").textContent = box.classList.contains("is-folded") ? "+" : "\u2013"; }
  head.addEventListener("click", fold); head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fold(); } });
  apply(saved);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { box.classList.toggle("is-on", en[0].isIntersecting); }, { threshold: 0.25 }).observe(sec); else box.classList.add("is-on");
})();
