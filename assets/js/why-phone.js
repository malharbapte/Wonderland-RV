/* ==========================================================================
   WHY CHOOSE US, PHONE -- home.html, below 901 only.
   The four points in the band are a tap-to-open list: one open at a time, the
   first open to start with. The open one turns orange (see home-order.css).
   ========================================================================== */
(function () {
  var items = [].slice.call(document.querySelectorAll(".band--why .why-points li"));
  if (!items.length) return;

  var done = false;

  function setup(li, k) {
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-expanded", String(k === 0));
    if (k === 0) li.classList.add("is-open");
  }

  function toggle(li) {
    var open = !li.classList.contains("is-open");
    items.forEach(function (x) { x.classList.remove("is-open"); x.setAttribute("aria-expanded", "false"); });
    if (open) { li.classList.add("is-open"); li.setAttribute("aria-expanded", "true"); }
  }

  /* only on a phone: on desktop the four points are plain text and must not
     become focusable buttons */
  function init() {
    if (done) return;
    done = true;
    items.forEach(setup);
    items.forEach(function (li) {
      li.addEventListener("click", function () { toggle(li); });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(li); }
      });
    });
  }

  var phone = window.matchMedia("(max-width: 900px)");
  if (phone.matches) init();
  else if (phone.addEventListener) phone.addEventListener("change", function (e) { if (e.matches) init(); });
})();
