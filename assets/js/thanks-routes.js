/* Thank-you page versions (Piyush, 25 Nov 2026: "i want to use this thank you page as replacement for all thank you pages
   on the website. for brochure, facotry tour, inquiry all of them").
   One page, one version per visitor. The form the visitor used leaves a note in sessionStorage ("wlThanks", as in
   thankyou.js) before it redirects here; a link can also name it: thank-you.html?route=brochure&model=Amaroo,
   ?route=tour, ?route=layout&layout=2107EW-F4.3. No note and no link = the general enquiry version, unchanged.
   Each version sets the three steps, the pill, the intro line and the preview loop; the brochure version adds a
   button that downloads the model's PDF. Copy: Marketing/Website/Thank you page/THANK-YOU-VARIANTS-v1.md (picks).
   Videos: every version plays the construction video for now; Piyush will record a Kev intro per version, then the
   VIDEO entries below change. Add a version by adding an entry to ROUTES. */
(function () {
  "use strict";
  var MODELS = { solara: "Solara", xtr: "XTR", hornet: "Hornet", amaroo: "Amaroo" };
  var PDF = "https://wonderlandrv.com.au/wp-content/uploads/2026/09/Wonderland-RV-{}-Brochure.pdf";
  var ROUTES = {
    brochure: {
      steps: ["Brochure sent", "We call you", "Visit us or a dealer"],
      msg: "Your {model} brochure is on its way.",
      intro: "It is really important to watch this video, it will help you choose the perfect {model} for you.",
      button: "Download your {model} brochure",
      loop: "brochure"
    },
    tour: {
      steps: ["Tour request in", "We lock in a day", "Your factory tour"],
      msg: "We are looking forward to showing you around.",
      intro: "It is really important to watch this video before your tour, it will help you choose the perfect caravan for you.",
      loop: "tour"
    },
    callback: {
      steps: ["Call back requested", "We call you", "Visit us or a dealer"],
      msg: "We will call you within one business day.",
      intro: "It is really important to watch this video, it will help you get the most out of our call."
    },
    quote: {
      steps: ["Quote request in", "We put your quote together", "We talk it through"],
      msg: "Our team is putting your quote together.",
      intro: "It is really important to watch this video, it will help you see what goes into your quote."
    },
    virtual: {
      steps: ["Consult request in", "We find a time", "Your virtual consultation"],
      msg: "We are looking forward to meeting you on screen.",
      intro: "It is really important to watch this video before your consultation, it will help you choose the perfect caravan for you."
    },
    event: {
      steps: ["Appointment request in", "We lock in a time", "See you at the show"],
      msg: "We are looking forward to seeing you at the show.",
      intro: "It is really important to watch this video before the show, it will help you choose the perfect caravan for you."
    },
    build: {
      steps: ["Quote request in", "We go through your build", "We talk it through"],
      msg: "Your build is with our team.",
      intro: "It is really important to watch this video, it will help you see how your caravan comes together."
    },
    layout: {
      steps: ["Layout question in", "We call you", "Visit us or a dealer"],
      msg: "We are looking forward to speaking with you.",
      intro: "It is really important to watch this video, it will help you see if this layout is perfect for you.",
      loop: "layout"
    }
  };

  var q = new URLSearchParams(location.search), info = {};
  try { info = JSON.parse(sessionStorage.getItem("wlThanks") || "null") || {}; } catch (e) {}
  /* the form's note is used once: a later visit to the plain page in the same tab shows the general version again */
  if (!q.get("route")) { try { sessionStorage.removeItem("wlThanks"); } catch (e) {} }
  var route = (q.get("route") || info.route || "").toLowerCase();
  if (route === "enquiry" && String(info.type || "").toLowerCase() === "book a factory tour") route = "tour";
  if (route === "layouts") route = "layout";
  if (route === "enquiry") {   /* the Contact page, the Enquire pop-up and the homepage form name what the visitor asked for */
    var kind = String(info.type || "").toLowerCase();
    if (kind === "call back") route = "callback";
    else if (kind === "get a quote") route = "quote";
    else if (kind.indexOf("virtual") === 0) route = "virtual";
  }
  var c = ROUTES[route];
  if (!c) return;
  var model = MODELS[String(q.get("model") || info.model || "").toLowerCase()] || "";

  /* {model} becomes the model name; with no model the line still reads ("your brochure", "the perfect caravan") */
  function fill(s) { return model ? s.replace(/\{model\}/g, model) : s.replace(/\{model\} /g, "").replace(/perfect \{model\}/g, "perfect caravan"); }
  function setText(sel, txt) { var el = document.querySelector(sel); if (el) el.textContent = txt; }

  document.documentElement.setAttribute("data-ty-route", route);
  [].forEach.call(document.querySelectorAll(".ty-first .ty-steps b"), function (b, i) { if (c.steps[i]) b.textContent = c.steps[i]; });
  setText(".ty-first .ty-pill-msg", fill(c.msg));
  setText(".ty-first .ty-hero-lede", fill(c.intro));

  if (c.button && model) {
    var p = document.createElement("p"), a = document.createElement("a");
    p.className = "ty-dl";
    a.className = "ty-dl-b";
    a.href = PDF.replace("{}", model);
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = fill(c.button);
    p.appendChild(a);
    var lede = document.querySelector(".ty-first .ty-hero-lede");
    if (lede) lede.parentNode.insertBefore(p, lede.nextSibling);
  }

  /* the preview loop for this version: its own picture first, then Kev, then the points of difference */
  var v = document.querySelector("#tyVideo .ty-vloop"), still = document.querySelector("#tyVideo .video-poster");
  if (v && c.loop) {
    /* the brochure version opens on that model's own brochure cover */
    var base = "assets/img/thanks/loop-" + c.loop + (c.loop === "brochure" && model ? "-" + model.toLowerCase() : ""), ver = "?v=1";
    v.setAttribute("poster", base + "-poster.jpg" + ver);
    if (still) { still.src = base + "-poster.jpg" + ver; still.setAttribute("data-still", base + "-poster.jpg" + ver); }
    while (v.firstChild) v.removeChild(v.firstChild);
    [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (f) { var s = document.createElement("source"); s.src = base + "." + f[0] + ver; s.type = f[1]; v.appendChild(s); });
    try { v.load(); v.muted = true; var pl = v.play(); if (pl && pl.catch) pl.catch(function () {}); } catch (e) {}
  }
})();
