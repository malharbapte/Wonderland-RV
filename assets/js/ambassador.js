/* ==========================================================================
   Wonderlander page behaviour. One file for all six Wonderlander pages.

   THE VIDEO LINK LIVES IN THE PAGE, not here: each page carries it on its own
   .amb-video element as data-video, so a new Wonderlander needs no change to
   this file. Same rules as the homepage and the Contact page — a YouTube
   link, a Vimeo link, a direct .mp4/.webm, or a local path. Leave the
   attribute empty (or off) and the labelled placeholder stays put, which is
   what every page whose film has not been supplied yet does.

     <div class="amb-video video-frame ph"
          data-video="https://youtu.be/…"
          data-title="Name of the Wonderlander"> …

   Requires video-embed.js, loaded before this file.
   ========================================================================== */

/* {captions:true} gives the sound and CC buttons — the same pair the Contact
   page's video carries. No nudge: the "Tap for sound" prompt is sized for a
   full-bleed clip and would sit on top of a column-width one. */
(function () {
  var frame = document.querySelector(".amb-video");
  if (!frame) return;
  var url = frame.getAttribute("data-video") || "";
  if (!url) return;                       /* placeholder stays, as designed */
  mountVideo(frame, url, frame.getAttribute("data-title") || "Wonderland RV",
             { captions: true });
})();

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

/* The "meet more" endless rail used to live here. It now lives in
   assets/js/wl-strip.js, which this page and the homepage both load, so
   there is one copy of it rather than two to keep in step. */
/* ------------------------------------------ phone: the film after the hook --
   On a phone the opening line reads as a lede, the film follows that hook and
   the rest of the story reads underneath. CSS does the ordering; the only
   thing markup cannot express is the split, since the paragraphs after the
   lede have to sit in their own box to be ordered past the film.

   Phone only, and built once. Putting the paragraphs back would be needed to
   render the desktop column, so this is not undone on resize — rotating a
   phone stays inside the breakpoint, and crossing it is a desktop window
   being dragged narrow, which reloads soon enough. Same call as the card
   rail in wonderlanders.js. */
(function () {
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  var copy = document.querySelector(".amb-intro-copy");
  if (!copy || document.querySelector(".amb-intro-rest")) return;

  var after = [].slice.call(copy.children).slice(1);   // everything past the lede
  if (!after.length) return;

  var rest = document.createElement("div");
  rest.className = "amb-intro-rest";
  after.forEach(function (el) { rest.appendChild(el); });
  copy.parentNode.insertBefore(rest, copy.nextSibling);
})();

/* ---------------------------------------- phone: van layout as a dropdown --
   The three sub-headings collapse behind a chevron. The row itself becomes
   the button so the whole width is tappable, which also keeps the chevron on
   the row rather than stacking under the name.

   Phone only: on desktop these open on hover and there is nothing to toggle.
   Built once, same as the other phone rearrangements on this page. */
(function () {
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  document.querySelectorAll(".amb-spec").forEach(function (spec) {
    var h = spec.querySelector("h3");
    if (!h || h.querySelector(".spec-toggle")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "spec-toggle";
    btn.setAttribute("aria-expanded", "false");
    while (h.firstChild) btn.appendChild(h.firstChild);
    h.appendChild(btn);

    btn.addEventListener("click", function () {
      var open = spec.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
})();
