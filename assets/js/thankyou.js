/* Thank-you page.
   - The construction video starts on its own (muted, as browsers require) with
     the sound and CC buttons top right.
   - The confetti fires once as the page loads.
   - Testimonial videos: the hero player plus one tab per video. Add a video by
     adding a line to TESTIMONIALS; the tabs rebuild themselves. */

var TESTIMONIALS = [
  { name: "8 Feet Travels", role: "Ambassadors", url: "https://youtu.be/amfJS4mC4ZQ" }
  /* , { name: "...", role: "Ambassadors", url: "https://youtu.be/..." } */
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
  if (typeof wlConfetti === "function") {
    setTimeout(function () { wlConfetti(document.body.getAttribute("data-confetti") || "burst"); }, 350);
  }

  /* ----------------------------------------------- testimonial video hero -- */
  var media = document.getElementById("tyTvMedia"), tabs = document.getElementById("tyTvTabs"), now = document.getElementById("tyTvNow");
  if (!media || !tabs || !TESTIMONIALS.length || typeof mountVideo !== "function") return;
  var started = false, current = -1;

  function play(i) {
    if (i === current) return;
    current = i;
    var t = TESTIMONIALS[i];
    [].slice.call(media.querySelectorAll("iframe, video, .video-controls, .video-nudge, .kk-play")).forEach(function (n) { n.remove(); });
    mountVideo(media, t.url, t.name + " testimonial", { popup: true });
    now.innerHTML = "<b></b><span></span>";
    now.firstChild.textContent = t.name; now.lastChild.textContent = t.role || "";
    [].forEach.call(tabs.children, function (b, k) { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  }

  TESTIMONIALS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.textContent = t.name;
    b.addEventListener("click", function () { started = true; play(i); });
    tabs.appendChild(b);
  });

  /* Load the player when the hero is nearly in view, so it is already playing
     when the visitor gets there and the page does not start two videos at once. */
  function go() { if (!started) { started = true; play(0); } }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: "900px 0px" });
    io.observe(document.getElementById("tyTv"));
  } else { go(); }
})();
