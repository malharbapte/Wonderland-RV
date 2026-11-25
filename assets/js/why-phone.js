/* ==========================================================================
   WHY CHOOSE US, PHONE -- home.html, below 901 only.
   The four points in the band are a tap-to-open list: one open at a time, the
   first open to start with. The open one turns orange (see home-order.css).
   ========================================================================== */
(function () {
  var items = [].slice.call(document.querySelectorAll(".band--why .why-points li"));
  if (!items.length) return;

  var done = false, clicks = new Map(), keys = new Map();

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
      var onClick = function () { toggle(li); };
      var onKey = function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(li); }
      };
      clicks.set(li, onClick); keys.set(li, onKey);
      li.addEventListener("click", onClick);
      li.addEventListener("keydown", onKey);
    });
  }

  /* and back to plain text above 901: no button role, no tab stop, nothing open */
  function undo() {
    if (!done) return;
    done = false;
    items.forEach(function (li) {
      li.removeAttribute("role");
      li.removeAttribute("tabindex");
      li.removeAttribute("aria-expanded");
      li.classList.remove("is-open");
      li.removeEventListener("click", clicks.get(li));
      li.removeEventListener("keydown", keys.get(li));
    });
  }

  var phone = window.matchMedia("(max-width: 900px)");
  if (phone.matches) init();
  if (phone.addEventListener) phone.addEventListener("change", function (e) { if (e.matches) init(); else undo(); });
})();
