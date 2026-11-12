/* Thank-you page.
   - The construction video starts on its own (muted, as browsers require) with
     the sound and CC buttons top right.
   - The confetti fires once as the page loads.
   - Testimonial videos: the hero player plus one tab per video. Add a video by
     adding a line to TESTIMONIALS; the tabs rebuild themselves. */

var TESTIMONIALS = [
  { name: "8 Feet Travels", role: "Wonderlanders", url: "https://youtu.be/amfJS4mC4ZQ" }
  /* , { name: "...", role: "Wonderlanders", url: "https://youtu.be/..." } */
];

(function () {
  var frame = document.getElementById("tyVideo");
  if (frame && typeof mountVideo === "function") {
    mountVideo(frame, frame.getAttribute("data-video"), frame.getAttribute("data-title"), { captions: true, nudge: true });
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
    [].slice.call(media.querySelectorAll("iframe, video, .video-controls, .video-nudge")).forEach(function (n) { n.remove(); });
    mountVideo(media, t.url, t.name + " testimonial", { captions: true, nudge: true });
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
