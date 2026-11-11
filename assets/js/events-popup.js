/* ==========================================================================
   Events pop-up: the VIP appointment form.

   The Events link in the menu (every page) opens it, until the Events page
   is rebuilt. Then repoint the link at the page and decide whether this
   stays. Built here once so no page carries its own copy of the markup.

   THE SHOW is the one block of data below: change it when the next show
   comes up. The form is not wired to a service yet, like the other forms
   on the site: a valid submit just closes the card.
   ========================================================================== */
(function () {
  "use strict";

  var SHOW = {
    name:   "Bendigo Caravan & Camping Leisurefest",
    logo:   "assets/img/events/bendigo-leisurefest.png",
    when:   "Fri 13 to Sun 15 November",
    hours:  "9am to 4pm daily",
    venue:  "Bendigo Racecourse",
    addr:   "Heinz Street, Ascot VIC 3551",
    dealer: "With Outbound RVs",          /* shown on desktop only */
    site:   "Site CO2",
    days:   ["Fri 13 Nov", "Sat 14 Nov", "Sun 15 Nov"]
  };
  var TIMES = ["9am to 10am", "10am to 11am", "11am to 12pm", "12pm to 1pm", "1pm to 2pm", "2pm to 3pm", "3pm to 4pm"];
  var STATES = ["Victoria", "NSW / ACT", "Queensland", "South Australia", "Western Australia", "Northern Territory", "Tasmania", "New Zealand"];
  var BUDGETS = ["$100,000 - $120,000", "$120,000 - $140,000", "$140,000 - $160,000", "$160,000+"];
  var MODELS = ["Solara", "XTR", "Hornet", "Amaroo", "Not sure yet"];
  var TRAVEL = ["Couple", "Family", "Not sure"];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';
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
    wrap.id = "evpScrim";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="evp" id="evpCard" role="dialog" aria-modal="true" aria-labelledby="evpTitle" tabindex="-1">' +
        '<button class="evp-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor"/></svg></button>' +
        '<div class="evp-left evp-left-in">' +
          '<h2 class="evp-title" id="evpTitle">VIP appointment</h2>' +
          '<p class="evp-sub">Pick a day and time and we will lock in a booking with our adventure experts.</p>' +
          '<img class="evp-logo" src="' + esc(SHOW.logo) + '" alt="' + esc(SHOW.name) + '">' +
          '<div class="evp-show">' +
            '<div class="evp-row"><small>When</small><b>' + esc(SHOW.when) + "</b><span>" + esc(SHOW.hours) + "</span></div>" +
            '<div class="evp-row"><small>Where</small><b>' + esc(SHOW.venue) + "</b><span>" + esc(SHOW.addr) + "</span></div>" +
            '<div class="evp-row evp-find"><small>Find us</small><b>' + esc(SHOW.dealer) + "</b><span>" + esc(SHOW.site) + "</span></div>" +
          "</div>" +
        "</div>" +
        '<form class="evp-form" action="#" method="post" autocomplete="off" novalidate>' +
          '<input type="hidden" name="show" value="' + esc(SHOW.name + ", " + SHOW.site) + '">' +
          '<div class="evp-g2">' + inp("first-name", "text", "First Name*", true) + inp("last-name", "text", "Last Name*", true) + "</div>" +
          '<div class="evp-g2">' + inp("email", "email", "Email*", true) + inp("mobile", "tel", "Mobile*", true) + "</div>" +
          '<div class="evp-g2">' + sel("state", "State*", STATES, true) + sel("time", "Preferred time*", TIMES, true) + "</div>" +
          '<div class="evp-pill evp-pill3" role="radiogroup" aria-label="Preferred day"><span class="evp-pill-t" aria-hidden="true"></span>' +
            SHOW.days.map(function (d, i) {
              return '<label><input type="radio" name="day" value="' + esc(d) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(d) + "</span></label>";
            }).join("") + "</div>" +
          '<div class="evp-bud">' +
            '<div class="evp-bud-h"><span class="evp-bud-l">Budget*</span><b class="evp-bud-v"></b>' +
              '<label class="evp-bud-ns"><input type="checkbox" name="budget-unsure"><span>Not sure yet</span></label></div>' +
            '<input class="evp-bud-r" type="range" min="0" max="3" step="1" value="1" aria-label="Budget">' +
            '<div class="evp-bud-s" aria-hidden="true">' + ["$100,000", "$120,000", "$140,000", "$160,000+"].map(function (t) { return "<span>" + t + "</span>"; }).join("") + "</div>" +
            '<input type="hidden" name="budget" value="">' +
          "</div>" +
          '<div class="evp-g2">' + sel("travelling", "Travelling as", TRAVEL, false) +
            '<details class="evp-ms"><summary><span class="evp-ms-t">Models that interest you</span>' + CHEV + "</summary><div class=\"pan\">" +
              MODELS.map(function (m) { return '<label class="evp-ck"><input type="checkbox" name="model" value="' + esc(m) + '"><span>' + esc(m) + "</span></label>"; }).join("") +
            "</div></details></div>" +
          '<label class="evp-f evp-area"><textarea name="message" placeholder="Anything we should know?" rows="3"></textarea></label>' +
          '<label class="evp-ck"><input type="checkbox" name="marketing"><span>I would like to receive marketing communications with discounts, updates, new releases and more. I understand I can unsubscribe at anytime.</span></label>' +
          '<p class="evp-priv">We use your details to arrange your appointment and share them with our dealer for this show. <a href="#" style="color:inherit;text-decoration:underline">See our privacy policy.</a></p>' +
          '<button class="evp-submit" type="submit">Request my appointment</button>' +
        "</form>" +
      "</div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  var scrim, card, form, open = false, back = null;

  function wire() {
    form = card.querySelector("form");

    /* budget slider */
    var bud = card.querySelector(".evp-bud"), rng = bud.querySelector(".evp-bud-r"),
        val = bud.querySelector(".evp-bud-v"), hid = bud.querySelector('input[name="budget"]'),
        ns = bud.querySelector('input[name="budget-unsure"]');
    function budUp() {
      var t = ns.checked ? "Not sure yet" : BUDGETS[+rng.value];
      val.textContent = t; hid.value = t;
      bud.style.setProperty("--p", (rng.value / 3 * 100) + "%");
      bud.classList.toggle("off", ns.checked);
    }
    rng.addEventListener("input", budUp); ns.addEventListener("change", budUp); budUp();

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
      hide();                        /* not wired to a service yet */
    });
  }

  function show() {
    if (!scrim) { scrim = build(); card = scrim.querySelector("#evpCard"); wire(); }
    open = true; back = document.activeElement;
    /* close the phone's menu panel if it is open */
    var nav = document.querySelector(".main-nav.is-open"), tg = document.querySelector(".nav-toggle");
    if (nav) { nav.classList.remove("is-open"); if (tg) tg.setAttribute("aria-expanded", "false"); }
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

  /* the Events link, wherever it sits in the menu (delegated: the phone panel is rebuilt by nav.js) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || a.getAttribute("href") !== "#") return;
    if (a.textContent.trim().toLowerCase() !== "events") return;
    e.preventDefault();
    show();
  });
})();
