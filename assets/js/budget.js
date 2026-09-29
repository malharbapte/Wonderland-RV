/* ===========================================================================
   BUDGET — the stepped track under the enquiry pill. Shared by home.html and
   compact.html; both pills use name="enquiry-type", so this is one component.

   DESKTOP ONLY this round. The radios ship `disabled` in the markup, which is
   the safe default: with no JS, or below 900 where the field is hidden, no
   budget is submitted from a form that never asked the question. They are
   enabled only when the field is actually open on a desktop width.
   =========================================================================== */
(function () {
  var ON_DESKTOP = window.matchMedia("(min-width: 901px)");

  var field = document.querySelector(".budget");
  if (!field) return;

  var shell = field.querySelector(".budget-shell");
  var inner = field.querySelector(".budget-inner");
  var fill = field.querySelector(".budget-fill");
  var out = field.querySelector(".budget-value");
  var ins = [].slice.call(field.querySelectorAll('input[name="budget"]'));
  if (!shell || !inner || !fill || !out || !ins.length) return;

  /* Below 900 the field is display:none. Leaving the radios disabled is the
     whole of the phone behaviour, deliberately — nothing is designed here. */
  if (!ON_DESKTOP.matches) return;

  /* ---------------------------------------------------- the track ------- */
  function paint() {
    var chosen = null;
    ins.forEach(function (i) { if (i.checked) chosen = i; });

    field.classList.toggle("is-na", !!chosen && chosen.dataset.na === "1");

    if (!chosen) {
      fill.style.width = "0px";
      out.innerHTML = "&mdash;";
      ins.forEach(function (i) { i.parentElement.classList.remove("is-past"); });
      return;
    }

    out.innerHTML = chosen.value;

    var na = chosen.dataset.na === "1";
    var here = parseFloat(chosen.dataset.p);
    ins.forEach(function (i) {
      i.parentElement.classList.toggle(
        "is-past", !na && parseFloat(i.dataset.p) < here);
    });

    /* built from the same expression that places the node, so the fill can
       never end anywhere other than exactly on it */
    fill.style.width = na
      ? "0px"
      : "calc(0.16rem + (100% - 0.32rem) * " + chosen.dataset.p + ")";
  }

  ins.forEach(function (i) { i.addEventListener("change", paint); });
  paint();

  /* ------------------------------------------ the pill decides ---------- */
  /* Budget is only asked for a call back or a quote. The homepage pill has
     only two cells, Call back and Book a factory tour, so the same list shows
     the field on Call back there. */
  var ASKS_BUDGET = ["Call back", "Get a Quote"];

  var form = field.closest("form");
  var pill = form && form.querySelector(".chips");
  if (!pill) return;

  var open = null;

  function wanted() {
    var c = pill.querySelector('input[type="radio"]:checked');
    return !!c && ASKS_BUDGET.indexOf(c.value) >= 0;
  }

  function setOpen(next, animate) {
    if (next === open) return;
    open = next;

    /* Disabled rather than cleared: a disabled control is neither submitted
       nor tabbable, so no budget rides along on an enquiry that never asked
       for one — and switching away and back leaves the answer intact. */
    ins.forEach(function (i) { i.disabled = !next; });

    shell.classList.toggle("no-anim", !animate);
    if (!animate) { shell.style.height = next ? "auto" : "0px"; return; }

    /* from an explicit height, or there is nothing for the transition to
       run between */
    shell.style.height = (next ? 0 : inner.offsetHeight) + "px";
    void shell.offsetHeight;
    shell.style.height = (next ? inner.offsetHeight : 0) + "px";
  }

  shell.addEventListener("transitionend", function (e) {
    /* released to auto so the row can never clip if its content grows */
    if (e.propertyName === "height" && open) shell.style.height = "auto";
  });

  setOpen(wanted(), false);
  pill.addEventListener("change", function () { setOpen(wanted(), true); });
})();
