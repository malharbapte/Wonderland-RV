/* ==========================================================================
   Brochure pop-up: "Download brochure" from the side menu.

   Same format as the Factory tour and Events pop-ups (evp-* classes, the
   brochure on the left, the form on the right). Opens from the side menu's
   Download brochure row, any [data-brochure] link, or a page address ending
   #brochure. The model is a dropdown; the left panel shows that model's
   brochure (all four for All models). Closes with the cross, Escape or a
   click outside.

   Not wired to a service yet, like the site's other forms: a valid submit
   goes to the thank-you page, which already has its brochure wording.
   ========================================================================== */
(function () {
  "use strict";

  var MODELS = ["All models", "Solara", "XTR", "Hornet", "Amaroo"];
  var PIC = { Solara: "solara", XTR: "xtr", Hornet: "hornet", Amaroo: "amaroo" };
  var STATES = ["Victoria", "New South Wales", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory", "New Zealand"];
  var FOLLOW = ["Brochure only", "Call back", "Virtual consultation"];
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function sel(name, ph, list, req, chosen) {
    return '<label class="evp-f evp-sel"><select name="' + name + '"' + (req ? " required" : "") + '>' +
      (ph ? '<option value="" selected disabled>' + ph + "</option>" : "") +
      list.map(function (o) { return "<option" + (o === chosen ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>" + CHEV + "</label>";
  }
  function inp(name, type, ph, req, extra) {
    return '<label class="evp-f"><input name="' + name + '" type="' + type + '" placeholder="' + ph + '"' + (req ? " required" : "") + ' autocomplete="off"' + (extra || "") + "></label>";
  }

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "evp-scrim";
    wrap.id = "bspScrim";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="evp" id="bspCard" role="dialog" aria-modal="true" aria-labelledby="bspTitle" tabindex="-1">' +
        '<button class="evp-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor"/></svg></button>' +
        '<div class="evp-left evp-left-in">' +
          '<h2 class="evp-title" id="bspTitle">Download the brochure</h2>' +
          '<p class="evp-sub">Choose the model, then tell us where to send it.</p>' +
          '<div class="bsp-cover" id="bspCover"></div>' +
        "</div>" +
        '<form class="evp-form" action="#" method="post" autocomplete="off" novalidate>' +
          sel("model", "", MODELS, true, "All models") +
          '<div class="evp-g2 evp-g2--one">' + inp("name", "text", "Full Name*", true) + "</div>" +
          '<div class="evp-g2">' + inp("email", "email", "Email*", true) + inp("phone", "tel", "Phone*", true) + "</div>" +
          '<div class="evp-g2">' + sel("state", "State*", STATES, true) + inp("postcode", "text", "Post Code", false, ' inputmode="numeric"') + "</div>" +
          '<div class="evp-pill evp-pill3" role="radiogroup" aria-label="How would you like us to follow up?"><span class="evp-pill-t" aria-hidden="true"></span>' +
            FOLLOW.map(function (f, i) {
              return '<label><input type="radio" name="follow-up" value="' + esc(f) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(f) + "</span></label>";
            }).join("") + "</div>" +
          '<label class="evp-ck"><input type="checkbox" name="marketing"><span>I would like to receive marketing communications with discounts, updates, new releases and more. I understand I can unsubscribe at anytime.</span></label>' +
          '<button class="evp-submit" type="submit">Download</button>' +
        "</form>" +
      "</div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  var scrim, card, form, cover, open = false, back = null;

  function showCover(m) {
    cover.textContent = "";
    var all = m === "All models";
    cover.classList.toggle("is-all", all);
    (all ? ["Solara", "XTR", "Hornet", "Amaroo"] : [m]).forEach(function (n) {
      if (!PIC[n]) return;
      var i = document.createElement("img");
      i.src = "assets/img/home/brochure/" + PIC[n] + ".webp";
      i.alt = "The Wonderland RV " + n + " brochure";
      cover.appendChild(i);
    });
  }

  function wire() {
    form = card.querySelector("form");
    cover = card.querySelector("#bspCover");
    var model = form.querySelector('select[name="model"]');
    model.addEventListener("change", function () { showCover(model.value); });
    showCover(model.value);

    card.querySelector(".evp-x").addEventListener("click", hide);
    scrim.addEventListener("click", function (e) { if (e.target === scrim) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") { hide(); return; }
      if (e.key === "Tab") {
        var f = [].slice.call(card.querySelectorAll("button, input, select, textarea, summary, a[href]"))
                   .filter(function (n) { return !n.disabled && n.type !== "hidden" && n.offsetParent !== null; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === a || document.activeElement === card)) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      try { sessionStorage.setItem("wlThanks", JSON.stringify({ route: "brochure", model: model.value === "All models" ? "" : model.value })); } catch (err) {}
      location.href = "thank-you.html";   /* not wired to a service yet */
    });
  }

  function show(from, m) {
    if (!scrim) { scrim = build(); card = scrim.querySelector("#bspCard"); wire(); }
    if (m) { var sl = form.querySelector('select[name="model"]'); sl.value = m; showCover(m); }
    open = true; back = from || document.activeElement;
    scrim.hidden = false;
    document.body.classList.add("evp-lock");
    card.focus();
  }
  function hide() {
    if (!open) return;
    open = false; scrim.hidden = true;
    document.body.classList.remove("evp-lock");
    if (back && back.focus) { try { back.focus(); } catch (e) {} }
  }

  /* the side menu's row, or any [data-brochure] link (a link can name its model with data-model) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-brochure], [data-bsp]");
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    show(a, a.getAttribute("data-model") || "");
  }, true);

  if (location.hash === "#brochure") show();
})();
