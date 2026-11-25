/* ==========================================================================
   Enquire pop-up: "Enquire" from the side menu.

   Same format as the Factory tour, Brochure and Events pop-ups (evp-* classes):
   how to reach us on the left, the form on the right. Opens from the side menu's
   Enquire row, any [data-enquire] link, or a page address ending #enquire. The
   Call back / Get a quote / Virtual consultation pill is the Contact page's own
   choice of enquiry (the factory tour has its own pop-up). Closes with the cross,
   Escape or a click outside.

   Not wired to a service yet, like the site's other forms: a valid submit goes to
   the thank-you page, which already has wording for each of the three.
   ========================================================================== */
(function () {
  "use strict";

  var CONTACT = { phone: "(03) 8692 0032", tel: "+61386920032", mail: "sales@wonderlandrv.com.au", addr: "46 Lara Way, Campbellfield VIC 3061" };
  var TYPES = ["Call back", "Get a quote", "Virtual consultation"];
  var STATES = ["Victoria", "NSW / ACT", "Queensland", "South Australia", "Western Australia", "Northern Territory", "Tasmania", "New Zealand"];
  var MODELS = ["Solara", "XTR", "Hornet", "Amaroo", "Not sure yet"];
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function sel(name, ph, list, req) {
    return '<label class="evp-f evp-sel"><select name="' + name + '"' + (req ? " required" : "") + '><option value="" selected disabled>' + ph + "</option>" +
      list.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>" + CHEV + "</label>";
  }
  function inp(name, type, ph, req) {
    return '<label class="evp-f"><input name="' + name + '" type="' + type + '" placeholder="' + ph + '"' + (req ? " required" : "") + ' autocomplete="off"></label>';
  }

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "evp-scrim";
    wrap.id = "enqScrim";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="evp" id="enqCard" role="dialog" aria-modal="true" aria-labelledby="enqTitle" tabindex="-1">' +
        '<button class="evp-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor"/></svg></button>' +
        '<div class="evp-left evp-left-in">' +
          '<h2 class="evp-title" id="enqTitle">Enquire</h2>' +
          '<p class="evp-sub">Our experts will guide you through your caravan customisation. Tell us a little and we will be in touch.</p>' +
          '<div class="evp-show enq-show">' +
            '<div class="evp-row"><small>Call us</small><b><a href="tel:' + CONTACT.tel + '">' + esc(CONTACT.phone) + "</a></b><span>We will call you within one business day.</span></div>" +
            '<div class="evp-row"><small>Email</small><b><a href="mailto:' + CONTACT.mail + '">' + esc(CONTACT.mail) + "</a></b></div>" +
            '<div class="evp-row evp-find"><small>Visit</small><b>Wonderland RV Production</b><span>' + esc(CONTACT.addr) + "</span></div>" +
          "</div>" +
        "</div>" +
        '<form class="evp-form" action="#" method="post" autocomplete="off" novalidate>' +
          '<div class="evp-g2">' + inp("first-name", "text", "First Name*", true) + inp("last-name", "text", "Last Name*", true) + "</div>" +
          '<div class="evp-g2">' + inp("email", "email", "Email*", true) + inp("mobile", "tel", "Mobile*", true) + "</div>" +
          '<div class="evp-pill evp-pill3" role="radiogroup" aria-label="What would you like?"><span class="evp-pill-t" aria-hidden="true"></span>' +
            TYPES.map(function (t, i) {
              return '<label><input type="radio" name="enquiry-type" value="' + esc(t) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
            }).join("") + "</div>" +
          '<div class="evp-g2">' + sel("state", "State*", STATES, true) +
            '<details class="evp-ms"><summary><span class="evp-ms-t">Models that interest you</span>' + CHEV + '</summary><div class="pan">' +
              MODELS.map(function (m) { return '<label class="evp-ck"><input type="checkbox" name="model" value="' + esc(m) + '"><span>' + esc(m) + "</span></label>"; }).join("") +
            "</div></details></div>" +
          '<label class="evp-f evp-area"><textarea name="message" placeholder="Something you\'d like to tell us..." rows="3"></textarea></label>' +
          '<label class="evp-ck"><input type="checkbox" name="marketing"><span>I would like to receive marketing communications with discounts, updates, new releases and more. I understand I can unsubscribe at anytime.</span></label>' +
          '<p class="evp-priv">We use your details to answer your enquiry. <a href="#" style="color:inherit;text-decoration:underline">See our privacy policy.</a></p>' +
          '<button class="evp-submit" type="submit">Send enquiry</button>' +
        "</form>" +
      "</div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  var scrim, card, form, open = false, back = null;

  function wire() {
    form = card.querySelector("form");
    var ms = card.querySelector(".evp-ms"), mt = ms.querySelector(".evp-ms-t"), ph = mt.textContent;
    ms.addEventListener("change", function () {
      var v = [].map.call(ms.querySelectorAll("input:checked"), function (i) { return i.value; });
      mt.textContent = v.length ? v.join(", ") : ph;
      ms.classList.toggle("has", v.length > 0);
    });
    document.addEventListener("click", function (e) { if (!ms.contains(e.target)) ms.open = false; });

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
      var t = form.querySelector('input[name="enquiry-type"]:checked');
      try { sessionStorage.setItem("wlThanks", JSON.stringify({ route: "enquiry", type: t ? t.value : "" })); } catch (err) {}
      location.href = "thank-you.html";   /* not wired to a service yet */
    });
  }

  function show(from, type) {
    if (!scrim) { scrim = build(); card = scrim.querySelector("#enqCard"); wire(); }
    if (type) { var r = form.querySelector('input[name="enquiry-type"][value="' + type + '"]'); if (r) r.checked = true; }
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

  /* the side menu's Enquire row (it goes to the Experience page's form today), or any [data-enquire] link */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var side = a.classList.contains("wlqb__link") && a.getAttribute("aria-label") === "Enquire";
    var dock = a.closest && a.closest(".wlqb-sd") && /enquire/i.test(a.textContent || "");
    if (!a.hasAttribute("data-enquire") && !side && !dock) return;
    e.preventDefault(); e.stopImmediatePropagation();
    show(a, a.getAttribute("data-enquire") || "");
  }, true);

  if (location.hash === "#enquire") show();
})();
