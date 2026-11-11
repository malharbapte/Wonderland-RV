/* ==========================================================================
   BROCHURE DOWNLOAD POP-UP -- home.html
   Opens from every [data-brochure] link (the Download brochure buttons in the
   range section, desktop and phone). The model is chosen with the underlined
   tabs (desktop) or the dropdown (phone); the heading follows the choice. Closes
   with the cross, Escape or a click outside, and gives focus back to the button.
   The form is not wired to anything yet, like the site's other forms, and the
   brochure file per model is still to come: Download only closes it.
   ========================================================================== */
(function () {
  var scrim = document.getElementById("broScrim");
  var card  = document.getElementById("broCard");
  if (!scrim || !card) return;

  var closeBtn = document.getElementById("broClose");
  var title    = document.getElementById("broTitle");
  var form     = document.getElementById("broForm");
  var tabsBar  = document.getElementById("broTabs");
  var tabs     = [].slice.call(tabsBar.querySelectorAll("button"));
  var ind      = tabsBar.querySelector(".bro-tabs-i");
  var model    = document.getElementById("broModel");
  var stateSel = form.querySelector("select[name=state]");
  var stateVal = form.querySelector(".bro-sv");
  var pill     = form.querySelector(".bro-pill");
  var pillT    = pill.querySelector(".bro-pill-t");
  var opener   = null, isOpen = false;

  function current() {
    var on = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
    return on ? on.dataset.m : "All models";
  }
  function setModel(m) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.m === m)); });
    model.value = m;
    title.textContent = m === "All models" ? "Download the brochure" : "Download the " + m + " brochure";
    place();
  }
  /* the orange blocks sit under the chosen name / segment; they are measured, so
     this runs once the card is on screen, and again if the window or fonts change */
  function place() {
    if (!isOpen) return;
    var on = tabsBar.querySelector('[aria-selected="true"]');
    if (on && on.offsetWidth) { ind.style.left = on.offsetLeft + "px"; ind.style.width = on.offsetWidth + "px"; }
    var chosen = pill.querySelector("input:checked");
    if (chosen) { var lab = chosen.parentNode; pillT.style.left = lab.offsetLeft + "px"; pillT.style.width = lab.offsetWidth + "px"; }
  }

  function open(from, m) {
    opener = from || document.activeElement;
    isOpen = true;
    scrim.hidden = false;
    document.body.classList.add("bro-lock");
    setModel(m || "All models");
    card.focus();
    setTimeout(place, 30);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    scrim.hidden = true;
    document.body.classList.remove("bro-lock");
    if (opener && opener.focus) { try { opener.focus(); } catch (e) {} }
  }

  [].forEach.call(document.querySelectorAll("[data-brochure]"), function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(a, a.dataset.model); });
  });
  closeBtn.addEventListener("click", close);
  scrim.addEventListener("click", function (e) { if (e.target === scrim) close(); });
  tabs.forEach(function (t) { t.addEventListener("click", function () { setModel(t.dataset.m); }); });
  model.addEventListener("change", function () { setModel(model.value); });
  [].forEach.call(pill.querySelectorAll("input"), function (i) { i.addEventListener("change", place); });
  stateSel.addEventListener("change", function () { stateVal.textContent = stateSel.value; stateVal.classList.add("on"); });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {                     /* keep the keyboard inside the card */
      var f = [].slice.call(card.querySelectorAll("button, input, select, a[href]"))
                .filter(function (n) { return !n.disabled && n.type !== "hidden" && n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    close();                                    /* not wired to a service yet */
  });
  window.addEventListener("resize", place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();
