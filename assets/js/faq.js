/* ===========================================================================
   FAQs — the homepage accordion, one answer open at a time.

   DESKTOP ONLY this round; below 900 the section is display:none and this
   does nothing.

   Progressive enhancement on purpose: the CSS leaves every answer OPEN, and
   the closing is done here. With no JS the section degrades to a plain list
   of questions and answers — longer, but entirely readable and indexable —
   rather than five headings that cannot be opened. The +/- signs stay hidden
   until `is-live` is set, so nothing promises behaviour that is not there.
   =========================================================================== */
(function () {
  if (!window.matchMedia("(min-width: 901px)").matches) return;

  var faq = document.querySelector(".faq");
  if (!faq) return;

  var items = [].slice.call(faq.querySelectorAll(".faq-item"));
  if (!items.length) return;

  function body(it) { return it.querySelector(".faq-a"); }

  /* close everything except the first, with the transition switched off so
     the section does not animate itself shut on load */
  items.forEach(function (it, i) {
    var b = body(it);
    var q = it.querySelector(".faq-q");
    var open = i === 0;

    b.classList.add("no-anim");
    it.classList.toggle("is-on", open);
    b.style.height = open ? "auto" : "0px";
    q.setAttribute("aria-expanded", String(open));

    /* released on the next frame, or the first click would not animate */
    requestAnimationFrame(function () { b.classList.remove("no-anim"); });

    b.addEventListener("transitionend", function (e) {
      /* to auto, so a long answer can never be clipped by a stale number */
      if (e.propertyName === "height" && it.classList.contains("is-on")) {
        b.style.height = "auto";
      }
    });

    q.addEventListener("click", function () { toggle(it); });
  });

  function shut(it) {
    var b = body(it);
    b.style.height = b.scrollHeight + "px";   /* from auto to a real number */
    void b.offsetHeight;
    b.style.height = "0px";
    it.classList.remove("is-on");
    it.querySelector(".faq-q").setAttribute("aria-expanded", "false");
  }

  function toggle(it) {
    var willOpen = !it.classList.contains("is-on");

    /* one at a time */
    items.forEach(function (o) {
      if (o !== it && o.classList.contains("is-on")) shut(o);
    });

    if (!willOpen) { shut(it); return; }

    var b = body(it);
    it.classList.add("is-on");
    it.querySelector(".faq-q").setAttribute("aria-expanded", "true");
    b.style.height = "0px";
    void b.offsetHeight;
    b.style.height = b.scrollHeight + "px";
  }

  faq.classList.add("is-live");
})();
