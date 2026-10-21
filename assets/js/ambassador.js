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
  if (!url) {
    /* No film chosen yet but a placeholder thumbnail is in: its play button
       opens the family's YouTube channel (data-channel) in a new tab. */
    var chan = frame.getAttribute("data-channel") || "";
    var pb = frame.querySelector(".amb-play");
    if (chan && pb) pb.addEventListener("click", function () { window.open(chan, "_blank", "noopener"); });
    return;                               /* placeholder stays, as designed */
  }
  var title = frame.getAttribute("data-title") || "Wonderland RV";
  /* With a branded thumbnail (.video-poster) the frame shows it and waits for
     a press: nothing from YouTube loads until then, which keeps the page fast. */
  var thumb = frame.querySelector(".video-poster");
  var play = frame.querySelector(".amb-play");
  if (thumb && play) {
    play.addEventListener("click", function () {
      play.remove(); thumb.remove();
      mountVideo(frame, url, title, { player: true });
    }, { once: true });
    return;
  }
  mountVideo(frame, url, title, { captions: true });
})();

/* ------------------------------------------------------------ travel tips --
   Pages the Q&A in place; the stills never move. With this blocked every tip
   is still in the markup, the first one just stays showing. */
(function () {
  var tips = [].slice.call(document.querySelectorAll(".amb-tip"));
  if (tips.length < 2) return;
  /* Soft slide, same easing as the reviews slider (21 Oct 2026): the tip
     leaving glides out one way while the next glides in from the side of
     the arrow pressed. --dir on the panel carries the direction to the CSS. */
  var at = 0, panel = tips[0].parentNode;
  function show(next, dir) {
    var out = tips[at];
    at = (next + tips.length) % tips.length;
    panel.style.setProperty("--dir", dir);
    out.classList.remove("is-on");
    out.classList.add("is-leaving");
    setTimeout(function () { out.classList.remove("is-leaving"); }, 900);
    tips[at].classList.remove("is-leaving");
    tips[at].classList.add("is-on");
  }
  var prev = document.querySelector(".amb-tip-prev");
  var nxt = document.querySelector(".amb-tip-next");
  if (prev) prev.addEventListener("click", function () { show(at - 1, -1); });
  if (nxt) nxt.addEventListener("click", function () { show(at + 1, 1); });
})();

/* The "meet more" endless rail used to live here. It now lives in
   assets/js/wl-strip.js, which this page and the homepage both load, so
   there is one copy of it rather than two to keep in step. */
/* ------------------------------------------ phone: the film after the hook --
   On a phone the opening line reads as a lede, the film follows that hook and
   the rest of the story reads underneath. CSS does the ordering; the only
   thing markup cannot express is the split, since the paragraphs after the
   lede have to sit in their own box to be ordered past the film.

   Phone only. It is now undone when the screen crosses back above 900px
   (21 Oct 2026): an iPad loaded in portrait (768) and turned to landscape
   (1024) crosses the breakpoint, and the split left the desktop column with
   the film dropped under the lede. Split below 900, put back above it. */
(function () {
  var mq = window.matchMedia("(max-width: 900px)");
  var copy = document.querySelector(".amb-intro-copy");
  if (!copy) return;

  function split() {
    if (document.querySelector(".amb-intro-rest")) return;
    var after = [].slice.call(copy.children).slice(1);   // everything past the lede
    if (!after.length) return;
    var rest = document.createElement("div");
    rest.className = "amb-intro-rest";
    after.forEach(function (el) { rest.appendChild(el); });
    copy.parentNode.insertBefore(rest, copy.nextSibling);
  }
  function join() {
    var rest = document.querySelector(".amb-intro-rest");
    if (!rest) return;
    while (rest.firstChild) copy.appendChild(rest.firstChild);
    rest.remove();
  }
  function apply() { if (mq.matches) split(); else join(); }
  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else if (mq.addListener) mq.addListener(apply);
  window.addEventListener("resize", apply);   // belt and braces: some views resize without a change event
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

/* ------------------------------------------ FAQs: soft accordion --
   Piyush, 21 Oct 2026: the dropdowns open and close softly, and opening one
   gently closes whichever was open. Still native <details>, so the answers
   stay in the page for search engines and work without script; this only
   animates the height and fade of the answer. Instant for reduced motion. */
(function () {
  var list = document.querySelector(".amb-faq-list");
  // the Wonderlander pages load both ambassador.js and wonderlanders.js, which
  // both carry this block: bind once, or every click opens and shuts again
  if (!list || list.dataset.accordion) return;
  list.dataset.accordion = "1";
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.33,0,.15,1)", D = 520;

  function bodyOf(d) { return d.querySelector(".amb-faq-body"); }
  function animate(d, opening) {
    var b = bodyOf(d);
    if (!b || calm) { d.open = opening; return; }
    if (d._anim) d._anim.cancel();
    b.style.overflow = "hidden";
    var full = b.scrollHeight;
    if (opening) d.open = true;
    d.classList.toggle("is-closing", !opening);
    var from = opening ? 0 : b.getBoundingClientRect().height;
    var to = opening ? full : 0;
    var a = b.animate([{ height: from + "px", opacity: opening ? 0 : 1 },
                       { height: to + "px", opacity: opening ? 1 : 0 }],
                      { duration: D, easing: EASE });
    d._anim = a;
    a.onfinish = function () {
      d._anim = null; b.style.overflow = "";
      if (!opening) { d.open = false; d.classList.remove("is-closing"); }
    };
  }

  list.querySelectorAll("details").forEach(function (d) {
    var s = d.querySelector("summary");
    if (!s) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      var opening = !d.open || d.classList.contains("is-closing");
      if (opening) {
        list.querySelectorAll("details[open]").forEach(function (o) {
          if (o !== d && !o.classList.contains("is-closing")) animate(o, false);
        });
      }
      animate(d, opening);
    });
  });
})();
