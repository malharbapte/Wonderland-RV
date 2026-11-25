/* ==========================================================================
   Factory tour pop-up: "Book a factory tour" from the side menu.

   Built in the Events (VIP appointment) pop-up's format and with its own
   classes (evp-*), so the two read as one family: the tour on the left, the
   form on the right. Opens from the side menu's "Book a factory tour" row (the
   one that goes to the scheduling page today), from any [data-factory-tour]
   link, or from a page address ending #factory-tour. Closes with the cross,
   Escape or a click outside, and gives focus back to what opened it.

   Not wired to a service yet, like the site's other forms: a valid submit
   goes to the thank-you page, which already has its factory tour wording.
   The tour details below are the one block of data: change them here.
   ========================================================================== */
(function () {
  "use strict";

  var TOUR = {
    place: "Outbound RVs factory",
    addr:  "58B Lara Way, Campbellfield VIC 3061",
    when:  "By appointment",
    whenN: "Weekdays. Our team confirms your day.",
    see:   "How a Wonderland is built",
    seeN:  "Every chassis is made here in Australia."
  };
  var STATES = ["Victoria", "NSW / ACT", "Queensland", "South Australia", "Western Australia", "Northern Territory", "Tasmania", "New Zealand"];
  var TIMES = ["9:00 am", "10:00 am", "11:00 am", "1:00 pm", "2:00 pm", "3:00 pm"];   /* placeholder tour times: set the real ones */
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
    wrap.id = "ftpScrim";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="evp" id="ftpCard" role="dialog" aria-modal="true" aria-labelledby="ftpTitle" tabindex="-1">' +
        '<button class="evp-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor"/></svg></button>' +
        '<div class="evp-left evp-left-in">' +
          '<h2 class="evp-title" id="ftpTitle">Book a factory tour</h2>' +
          '<p class="evp-sub">See where your Wonderland is built. Pick a day and we will confirm your tour.</p>' +
          '<div class="ftp-photo" role="img" aria-label="Photo of the factory (to come)"><span>Factory photo</span></div>' +
          '<div class="evp-show">' +
            '<div class="evp-row"><small>Where</small><b>' + esc(TOUR.place) + "</b><span>" + esc(TOUR.addr) + "</span></div>" +
            '<div class="evp-row"><small>When</small><b>' + esc(TOUR.when) + "</b><span>" + esc(TOUR.whenN) + "</span></div>" +
            '<div class="evp-row evp-find"><small>On the tour</small><b>' + esc(TOUR.see) + "</b><span>" + esc(TOUR.seeN) + "</span></div>" +
          "</div>" +
        "</div>" +
        '<form class="evp-form" action="#" method="post" autocomplete="off" novalidate>' +
          '<div class="evp-g2">' + inp("first-name", "text", "First Name*", true) + inp("last-name", "text", "Last Name*", true) + "</div>" +
          '<div class="evp-g2">' + inp("email", "email", "Email*", true) + inp("mobile", "tel", "Mobile*", true) + "</div>" +
          '<div class="evp-g2">' + sel("state", "State*", STATES, true) +
            '<label class="evp-f"><input name="date" type="text" placeholder="Preferred day*" required autocomplete="off" onfocus="this.type=\'date\'" onblur="if(!this.value)this.type=\'text\'"></label></div>' +
          '<div class="evp-g2">' + sel("time", "Preferred time*", TIMES, true) +
            '<details class="evp-ms"><summary><span class="evp-ms-t">Models that interest you</span>' + CHEV + '</summary><div class="pan">' +
              MODELS.map(function (m) { return '<label class="evp-ck"><input type="checkbox" name="model" value="' + esc(m) + '"><span>' + esc(m) + "</span></label>"; }).join("") +
            "</div></details></div>" +
          '<label class="evp-f evp-area"><textarea name="message" placeholder="Anything we should know?" rows="3"></textarea></label>' +
          '<label class="evp-ck"><input type="checkbox" name="marketing"><span>I would like to receive marketing communications with discounts, updates, new releases and more. I understand I can unsubscribe at anytime.</span></label>' +
          '<p class="evp-priv">We use your details to arrange your tour. <a href="#" style="color:inherit;text-decoration:underline">See our privacy policy.</a></p>' +
          '<button class="evp-submit" type="submit">Request tour</button>' +
        "</form>" +
      "</div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  var scrim, card, form, open = false, back = null;

  function wire() {
    form = card.querySelector("form");

    /* the earliest day is tomorrow */
    var d = new Date(); d.setDate(d.getDate() + 1);
    var iso = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    form.querySelector('input[name="date"]').min = iso;

    /* models multi-select */
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
      if (e.key === "Tab") {        /* keep the keyboard inside the card */
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
      /* the thank-you page has wording for this route already */
      try { sessionStorage.setItem("wlThanks", JSON.stringify({ route: "enquiry", type: "Book a factory tour" })); } catch (err) {}
      location.href = "thank-you.html";   /* not wired to a service yet */
    });
  }

  function show(from) {
    if (!scrim) { scrim = build(); card = scrim.querySelector("#ftpCard"); wire(); }
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

  /* the side menu's row (built by side-bar.js), or any [data-factory-tour] link */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (!a.hasAttribute("data-factory-tour") && h.indexOf("acuityscheduling.com") < 0) return;
    e.preventDefault();
    show(a);
  }, true);

  /* a direct link: ...#factory-tour opens it on load (handy for sharing) */
  if (location.hash === "#factory-tour") show();
})();
