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

/* ------------------------------------------------- meet more: endless rail --
   The strip is a native overflow scroller, so it stopped dead at the last
   Wonderlander. Same idea reviews.js uses for the review slider — park clones
   either side of the real set and step back into it, out of sight — but
   applied to scrollLeft rather than a transform, so the finger, the trackpad
   and the scrollbar all still drive it.

   Three sets sit in the rail: clones, the real cards, clones. It rests on the
   middle one, and whenever a scroll carries past a set boundary the position
   jumps back by exactly one set width. That lands on the identical card, so
   nothing moves on screen and the rail never reaches an end in either
   direction. The clones are hidden from assistive tech and taken out of the
   tab order — only the real five are reachable. */
(function () {
  var strip = document.querySelector(".amb-more-strip");
  if (!strip) return;
  var real = [].slice.call(strip.children);
  if (real.length < 2) return;

  function cloneSet(where) {
    real.forEach(function (card) {
      var c = card.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.classList.add("is-clone");
      /* The card is a div now, not the link — so the things that can actually
         take focus are the name and the chevron inside it. */
      [].slice.call(c.querySelectorAll("a, button")).forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      if (where === "before") strip.insertBefore(c, strip.firstChild);
      else strip.appendChild(c);
    });
  }
  cloneSet("after");
  cloneSet("before");          // prepended in reverse, which is still one full set

  var n = real.length;
  function setWidth() {
    // measured, not assumed, so the gap and any resize come along for free
    return strip.children[n].offsetLeft - strip.children[0].offsetLeft;
  }

  var w = 0, ready = false;
  function rest() {
    w = setWidth();
    if (!w) return;
    strip.style.scrollBehavior = "auto";
    strip.scrollLeft = w;      // start on the real set, a full set either side
    ready = true;
  }

  /* Deliberately not rAF-throttled. rAF never fires in a background tab
     (HANDOFF sec 9), and setting scrollLeft here fires another scroll event,
     so the guard flag is what stops it re-entering — not a frame callback. */
  var wrapping = false;
  strip.addEventListener("scroll", function () {
    if (!ready || wrapping) return;
    if (strip.scrollLeft >= w * 2 || strip.scrollLeft <= 0) {
      wrapping = true;
      strip.scrollLeft += (strip.scrollLeft <= 0) ? w : -w;
      wrapping = false;
    }
  });

  window.addEventListener("resize", function () {
    ready = false;
    rest();
  });

  /* Images decide the card heights, so measure once they are in. */
  if (document.readyState === "complete") rest();
  else window.addEventListener("load", rest);
  rest();
})();

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
