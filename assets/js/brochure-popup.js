/* ==========================================================================
   BROCHURE DOWNLOAD POP-UP -- home.html
   Opens from every [data-brochure] link, on the model the range viewer is showing, (the Download brochure buttons in the
   range section, desktop and phone). The model is chosen with the underlined
   tabs (desktop) or the dropdown (phone); the heading follows the choice. Closes
   with the cross, Escape or a click outside, and gives focus back to the button.
   The form is not wired to anything yet, like the site's other forms, and the
   brochure file per model is still to come: Download only closes it.
   ========================================================================== */
(function () {
  /* the card is built here on pages that do not carry its markup (every page but the homepage, which has it in the HTML) */
  if (document.getElementById("broScrim")) return;
  var d = document.createElement("div");
  d.innerHTML = "<div class=\"bro-scrim\" id=\"broScrim\" hidden>\n  <div class=\"bro\" id=\"broCard\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"broTitle\" tabindex=\"-1\">\n    <button class=\"bro-x\" id=\"broClose\" type=\"button\" aria-label=\"Close\">\n      <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 5L19 19M19 5L5 19\" fill=\"none\" stroke=\"currentColor\"/></svg>\n    </button>\n    <div class=\"bro-left\">\n      <div class=\"bro-lt\">\n        <h2 class=\"bro-title\" id=\"broTitle\">Download the Brochure</h2>\n        <p class=\"bro-intro\">Choose the model,<br class=\"bro-phbr\"> then tell us where to send it.</p>\n      </div>\n      <div class=\"bro-cover\" id=\"broCover\"></div>\n    </div>\n    <div class=\"bro-right\">\n    <div class=\"bro-tabs\" id=\"broTabs\" role=\"tablist\" aria-label=\"Model\"><span class=\"bro-tabs-i\" aria-hidden=\"true\"></span><button type=\"button\" role=\"tab\" data-m=\"All models\" aria-selected=\"true\">All models</button><button type=\"button\" role=\"tab\" data-m=\"Solara\" aria-selected=\"false\">Solara</button><button type=\"button\" role=\"tab\" data-m=\"XTR\" aria-selected=\"false\">XTR</button><button type=\"button\" role=\"tab\" data-m=\"Hornet\" aria-selected=\"false\">Hornet</button><button type=\"button\" role=\"tab\" data-m=\"Amaroo\" aria-selected=\"false\">Amaroo</button></div>\n    <div class=\"bro-msel\"><label class=\"bro-f bro-sel\"><select id=\"broModel\" aria-label=\"Model\"><option value=\"All models\" selected>All models</option><option value=\"Solara\">Solara</option><option value=\"XTR\">XTR</option><option value=\"Hornet\">Hornet</option><option value=\"Amaroo\">Amaroo</option></select><svg viewBox=\"0 0 14 8\" aria-hidden=\"true\"><path d=\"M0 0L7 7L14 0\" fill=\"none\" stroke=\"currentColor\"/></svg></label></div>\n    <form class=\"bro-form\" id=\"broForm\" action=\"#\" method=\"post\" autocomplete=\"off\" novalidate>\n      <div class=\"bro-g2 bro-one\"><label class=\"bro-f\"><input name=\"name\" type=\"text\" placeholder=\"Full Name*\" required autocomplete=\"off\"></label></div>\n      <div class=\"bro-g2\">\n        <label class=\"bro-f\"><input name=\"email\" type=\"email\" placeholder=\"Email*\" required autocomplete=\"off\"></label>\n        <label class=\"bro-f\"><input name=\"phone\" type=\"tel\" placeholder=\"Phone*\" required autocomplete=\"off\"></label>\n      </div>\n      <div class=\"bro-g2\">\n        <label class=\"bro-f bro-sel bro-state\"><select name=\"state\" required><option value=\"\" selected disabled>State*</option><option>Victoria</option><option>New South Wales</option><option>Queensland</option><option>South Australia</option><option>Western Australia</option><option>Tasmania</option><option>Northern Territory</option><option>Australian Capital Territory</option><option>New Zealand</option></select><span class=\"bro-sv\" aria-hidden=\"true\">State*</span><svg viewBox=\"0 0 14 8\" aria-hidden=\"true\"><path d=\"M0 0L7 7L14 0\" fill=\"none\" stroke=\"currentColor\"/></svg></label>\n        <label class=\"bro-f\"><input name=\"postcode\" type=\"text\" inputmode=\"numeric\" placeholder=\"Post Code\" autocomplete=\"off\"></label>\n      </div>\n      <div class=\"bro-pill\" role=\"radiogroup\" aria-label=\"How would you like us to follow up?\">\n        <span class=\"bro-pill-t\" aria-hidden=\"true\"></span>\n        <label><input type=\"radio\" name=\"follow-up\" value=\"Brochure only\" checked><span>Brochure only</span></label>\n        <label><input type=\"radio\" name=\"follow-up\" value=\"Call back\"><span>Call back</span></label>\n        <label><input type=\"radio\" name=\"follow-up\" value=\"Virtual consultation\"><span>Virtual consultation</span></label>\n      </div>\n      <label class=\"bro-ck\"><input type=\"checkbox\" name=\"marketing\"><span>I would like to receive marketing communications with discounts, updates, new releases and more. I understand I can unsubscribe at anytime.</span></label>\n      <button class=\"bro-submit\" type=\"submit\">Download</button>\n    </form>\n    </div>\n  </div>\n</div>";
  document.body.appendChild(d.firstElementChild);
})();
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
  /* DESKTOP ONLY: the brochure photo for the model, in the grey panel. All models
     shows all four. The phone has no photo and never fetches one. */
  var cover = document.getElementById("broCover");
  var WIDE  = window.matchMedia("(min-width: 901px)");
  var PIC   = { "Solara": "solara", "XTR": "xtr", "Hornet": "hornet", "Amaroo": "amaroo" };
  function showCover(m) {
    if (!cover || !WIDE.matches) return;
    var all = m === "All models";
    cover.textContent = "";
    cover.classList.toggle("bro-cover--all", all);
    (all ? ["Solara", "XTR", "Hornet", "Amaroo"] : [m]).forEach(function (name) {
      if (!PIC[name]) return;
      var img = document.createElement("img");
      img.src = "assets/img/home/brochure/" + PIC[name] + ".webp";
      img.alt = "The Wonderland RV " + name + " brochure";
      cover.appendChild(img);
    });
  }

  function setModel(m) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.m === m)); });
    model.value = m;
    /* desktop: the heading never names the model (the tabs do that); phone: it follows */
    title.textContent = WIDE.matches ? "Download the Brochure"
      : (m === "All models" ? "Download the brochure" : "Download the " + m + " brochure");
    showCover(m);
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
    a.addEventListener("click", function (e) {
      e.preventDefault();
      /* a button can name its model (data-model); otherwise it is the van the
         range viewer around it is showing right now */
      var box = a.closest(".rvx, .rvp");
      open(a, a.dataset.model || (box && box.dataset.model) || "All models");
    });
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
  /* dragged across 900 with the card open: heading and cover follow the width it is at now */
  if (WIDE.addEventListener) WIDE.addEventListener("change", function () { if (isOpen) setModel(current()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();
