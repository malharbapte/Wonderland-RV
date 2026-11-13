/* Thank-you page.
   - The construction video starts on its own (muted, as browsers require) with
     the sound and CC buttons top right.
   - The confetti fires once, when the tick at the top has finished drawing.
   - Testimonial videos: the hero player plus one tab per video. Add a video by
     adding an entry to TESTIMONIALS; the thumbnail strip rebuilds itself. */

var TESTIMONIALS = [
  { names: "Adam, Jessy, Charlotte and Noah", role: "Wonderlanders",
    desc: "The Brett family travels full time on the road in their 21ft Amaroo, a 2 bunk van, with their dog.",
    quote: "Dealing with Wonderland RV for us has been an amazing experience. You can\u2019t beat the sales, the support and the reliability of the van.",
    url: "https://youtu.be/amfJS4mC4ZQ", poster: "assets/img/thanks/tv-brett.jpg", thumb: "assets/img/thanks/tv-brett-thumb.jpg" },
  { names: "Jess and Doug", role: "Wonderlanders",
    desc: "Jess and Doug travel Australia full time with their three children in their XTR.",
    quote: "Every little tiny detail has been thought of. It was faultless from the get-go, and the whole process was seamless.",
    url: "https://youtu.be/yz8DaA1Q4hE", poster: "assets/img/thanks/tv-sandy.jpg", thumb: "assets/img/thanks/tv-sandy-thumb.jpg" }
];

/* Route-specific line under the heading. The form the visitor used leaves a
   note in sessionStorage ("wlThanks") before it redirects here. No note (a
   direct visit) gives the general line. Copy: THANK-YOU-PAGE-COPY.md, block 1.
   {layout}, {show}, {van} and {model} come from the form; if one is missing the
   line falls back to a neutral wording. Add a route by adding a case. */
(function () {
  var el = document.getElementById("tyMsg");
  if (!el) return;
  var info = null;
  try { info = JSON.parse(sessionStorage.getItem("wlThanks") || "null"); } catch (e) {}
  info = info || {};
  var CALL = "within one business day from 03\u00a09958\u00a06708";
  var type = (info.type || "").toLowerCase();
  var text = "";

  if (info.route === "event") {
    text = "Your VIP appointment at " + (info.show || "the show") + " is in. Our team will call you " + CALL + " to lock in a time with you at the show.";
  } else if (info.route === "layouts") {
    text = "Your enquiry about " + (info.layout ? "the " + info.layout : "your layout") + " is in. Our team will call you " + CALL + " to talk it through and answer anything the floor plan can\u2019t.";
  } else if (info.route === "stock") {
    text = "Your enquiry about " + (info.van || "the van") + " is in. Our team will call you " + CALL + " to talk about the van and when you can come and see it.";
  } else if (info.route === "brochure") {
    text = "Your " + (info.model ? info.model + " " : "") + "brochure is on its way to your inbox. Our team will also give you a call " + CALL + " in case you have questions.";
  } else if (info.route === "build") {
    text = "Your quote request is in. Our team will go through the layout and options you picked and call you " + CALL + " to talk it over. Your quote is also on its way to your inbox.";
  } else if (info.route === "enquiry") {
    if (type === "call back") text = "Your call back request is in. Our team will ring you " + CALL + ", so pick up when you see that number.";
    else if (type === "book a factory tour") text = "Your factory tour request is in. Our team will call you " + CALL + " to lock in a day that suits you, then we\u2019ll walk you through how your van gets built at Campbellfield.";
    else if (type === "get a quote") text = "Your quote request is in. Our team will go through the layout and options you picked and call you " + CALL + " to talk it over.";
    else if (type.indexOf("virtual") === 0) text = "Your virtual consult request is in. Our team will call you " + CALL + " to find a time that suits you, then walk you through the vans on screen from wherever you are.";
  }
  if (!text) text = "Our team will give you a call " + CALL + ", so if that number pops up, it\u2019s us.";
  el.textContent = text;
})();

(function () {
  var frame = document.getElementById("tyVideo");
  if (frame && typeof mountVideo === "function") {
    mountVideo(frame, frame.getAttribute("data-video"), frame.getAttribute("data-title"), { popup: true });
  }
  /* the confetti waits for the tick to finish drawing (the animation ends on .tk), with a fallback in case it never reports */
  if (typeof wlConfetti === "function") {
    var fired = false, tk = document.querySelector(".ty-top-ck .tk");
    var fire = function () { if (fired) return; fired = true; wlConfetti(document.body.getAttribute("data-confetti") || "burst"); };
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (tk && !still) { tk.addEventListener("animationend", fire); setTimeout(fire, 2200); }
    else setTimeout(fire, 350);
  }

  /* ----------------------------------------------- testimonial video hero -- */
  var poster = document.getElementById("tyTvPoster"), tabs = document.getElementById("tyTvTabs"),
      q = document.getElementById("tyTvQ"), now = document.getElementById("tyTvNow"),
      desc = document.getElementById("tyTvDesc"), playBtn = document.getElementById("tyTvPlay");
  if (!poster || !tabs || !TESTIMONIALS.length) return;
  var current = -1;
  var QMARK = '<svg class="qmark" viewBox="0 0 352 208" aria-hidden="true"><path d="M159 208H289L352 0H249ZM0 208H130L193 0H90Z"/></svg>';

  function show(i) {
    current = i;
    var t = TESTIMONIALS[i];
    poster.src = t.poster;
    q.innerHTML = QMARK;
    q.appendChild(document.createTextNode(t.quote + "\u201d"));
    now.innerHTML = "<span></span><b></b>";
    now.lastChild.textContent = t.names; now.firstChild.textContent = t.role || "";
    desc.textContent = t.desc || "";
    playBtn.setAttribute("aria-label", "Play video: " + t.names);
    [].forEach.call(tabs.children, function (b, k) { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  }

  function ytId(u) { var m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/); return m && m[1]; }

  function play(opener) {
    var t = TESTIMONIALS[current], id = ytId(t.url);
    if (id && typeof openVideoPopup === "function") openVideoPopup(id, t.names + " testimonial", t.poster, opener);
  }
  playBtn.addEventListener("click", function () { play(playBtn); });

  TESTIMONIALS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ty-tv-card"; b.setAttribute("role", "tab");
    b.setAttribute("aria-label", t.names);
    b.innerHTML = '<img alt="" loading="lazy"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></i>';
    b.firstChild.src = t.thumb || t.poster;
    b.addEventListener("click", function () { if (i !== current) show(i); play(b); });
    tabs.appendChild(b);
  });
  show(0);
})();
