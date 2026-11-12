/* Thank-you page: the "next steps" video plays when the visitor presses play,
   as a normal player with its own controls and sound. */
(function () {
  var frame = document.getElementById("tyVideo");
  if (!frame) return;
  var btn = frame.querySelector(".kk-play");
  btn.addEventListener("click", function () {
    var poster = frame.querySelector(".video-poster");
    btn.remove();
    if (poster) poster.remove();
    mountVideo(frame, frame.getAttribute("data-video"), frame.getAttribute("data-title"), { player: true });
  });
})();
