/* ==========================================================================
   "Things you can't see" — video section
   --------------------------------------------------------------------------
   PASTE THE VIDEO LINK BELOW. That is the only line you need to change.

   Accepts:
     • a YouTube link   https://www.youtube.com/watch?v=XXXX  |  https://youtu.be/XXXX
     • a Vimeo link     https://vimeo.com/123456789
     • a direct file    https://.../clip.mp4  (also .webm, .mov)
     • a local file     assets/video/clip.mp4

   Leave it as "" and the labelled placeholder stays in place.
   ========================================================================== */

const VIDEO_URL = "";

/* -------------------------------------------------------------------------- */

(function () {
  const frame = document.querySelector(".video-frame");
  if (!frame || !VIDEO_URL) return;

  const url = VIDEO_URL.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (yt) {
    node = document.createElement("iframe");
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=" + yt[1];
    node.allow = "autoplay; encrypted-media; picture-in-picture";
    node.allowFullscreen = true;
    node.title = "Wonderland RV — things you can't see";
  } else if (vimeo) {
    node = document.createElement("iframe");
    node.src = "https://player.vimeo.com/video/" + vimeo[1] +
      "?autoplay=1&muted=1&loop=1&background=1";
    node.allow = "autoplay; fullscreen; picture-in-picture";
    node.allowFullscreen = true;
    node.title = "Wonderland RV — things you can't see";
  } else {
    node = document.createElement("video");
    node.src = url;
    node.autoplay = true;
    node.muted = true;
    node.loop = true;
    node.playsInline = true;
    node.setAttribute("playsinline", "");
    node.controls = false;
    const poster = frame.querySelector(".video-poster");
    if (poster && poster.getAttribute("src")) node.poster = poster.getAttribute("src");
  }

  frame.classList.remove("ph");
  frame.removeAttribute("data-ph");
  frame.appendChild(node);
})();

/* -------------------------------------------------- mobile nav toggle ---- */
(function () {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", function () {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();
