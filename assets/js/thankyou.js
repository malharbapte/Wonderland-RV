/* Thank-you page: the construction video starts on its own (muted, as browsers
   require) with the sound and CC buttons top right, and the confetti fires once
   as the page loads. */
(function () {
  var frame = document.getElementById("tyVideo");
  if (frame && typeof mountVideo === "function") {
    mountVideo(frame, frame.getAttribute("data-video"), frame.getAttribute("data-title"), { captions: true, nudge: true });
  }
  if (typeof wlConfetti === "function") {
    setTimeout(function () { wlConfetti(document.body.getAttribute("data-confetti") || "burst"); }, 350);
  }
})();
