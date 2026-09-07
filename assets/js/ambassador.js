/* ==========================================================================
   Wonderlander page behaviour.

   PASTE THE VIDEO LINK BELOW — same rules as the homepage and the Contact
   page: a YouTube link, a Vimeo link, a direct .mp4/.webm, or a local path.
   Leave it "" and the labelled placeholder stays put.

   Requires video-embed.js, loaded before this file.
   ========================================================================== */

const AMBASSADOR_VIDEO_URL = "https://youtu.be/yz8DaA1Q4hE";   // Sandy Van Travels

/* -------------------------------------------------------------------------- */

/* {captions:true} gives the sound and CC buttons — the same pair the Contact
   page's video carries. No nudge: the "Tap for sound" prompt is sized for a
   full-bleed clip and would sit on top of a column-width one. */
mountVideo(document.querySelector(".amb-video"), AMBASSADOR_VIDEO_URL,
           "Sandy Van Travels", { captions: true });

/* ------------------------------------------------------------ travel tips --
   Pages the Q&A in place; the stills never move. With this blocked every tip
   is still in the markup, the first one just stays showing. */
(function () {
  var tips = [].slice.call(document.querySelectorAll(".amb-tip"));
  if (tips.length < 2) return;
  var at = 0;
  function show(next) {
    tips[at].classList.remove("is-on");
    at = (next + tips.length) % tips.length;
    tips[at].classList.add("is-on");
  }
  var prev = document.querySelector(".amb-tip-prev");
  var nxt = document.querySelector(".amb-tip-next");
  if (prev) prev.addEventListener("click", function () { show(at - 1); });
  if (nxt) nxt.addEventListener("click", function () { show(at + 1); });
})();
