/* ==========================================================================
   Shared video embed — mounting plus the sound/captions controls.

   Lifted out of home.js unchanged so more than one page can use it. The
   homepage was already calling mountVideo three times over; the Wonderlander
   pages need the same player with the same icons and the same interaction,
   and a second copy of 200 lines was the wrong way to get there.

   Load this BEFORE any script that calls mountVideo.

     mountVideo(frame, url, title, opts)
       frame  an element carrying .video-frame (its .ph placeholder is cleared)
       url    YouTube, Vimeo, a direct .mp4/.webm, or a local path; "" no-ops
       opts   omit for a clean autoplaying clip with no controls;
              {} or {captions:true} adds the sound button (and CC);
              {nudge:true} adds the "Tap for sound" prompt
   ========================================================================== */

/* -------------------------------------------------------------------------- */

let ytSeq = 0;

function mountVideo(frame, url, title, opts) {
  if (!frame || !url) return;
  url = url.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (yt) {
    node = document.createElement("iframe");
    node.id = "yt-" + (++ytSeq);
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1" +
      "&cc_load_policy=0&cc_lang_pref=en&iv_load_policy=3&enablejsapi=1&playlist=" + yt[1];
    node.allow = "autoplay; encrypted-media; picture-in-picture";
    node.allowFullscreen = true;
  } else if (vimeo) {
    node = document.createElement("iframe");
    node.src = "https://player.vimeo.com/video/" + vimeo[1] + "?autoplay=1&muted=1&loop=1&background=1";
    node.allow = "autoplay; fullscreen; picture-in-picture";
    node.allowFullscreen = true;
  } else {
    node = document.createElement("video");
    node.src = url;
    node.autoplay = true; node.muted = true; node.loop = true;
    node.playsInline = true; node.setAttribute("playsinline", "");
    const poster = frame.querySelector(".video-poster");
    if (poster && poster.getAttribute("src")) node.poster = poster.getAttribute("src");
  }
  node.title = title;
  frame.classList.remove("ph");
  frame.removeAttribute("data-ph");
  frame.appendChild(node);
  return (node.id && opts) ? buildControls(frame, node.id, opts) : node;
}

/* ------------------------------------------- sound + caption controls -----
   A bare embed gives the viewer no way to turn sound or subtitles on, so the
   player is attached to the YouTube IFrame API. Both start OFF — sound because
   browsers refuse to autoplay otherwise, captions because they are meant to be
   opt-in — and neither turns on until the viewer clicks.

   opts.nudge asks for the "Tap for sound" prompt: it appears three seconds
   after the video has been on screen, and only while it is still muted.     */
function buildControls(frame, iframeId, opts) {
  opts = opts || {};

  const SPEAKER_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';
  const SPEAKER_ON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

  const bar = document.createElement("div");
  bar.className = "video-controls";

  const sound = document.createElement("button");
  sound.type = "button";
  sound.className = "video-ctl";
  sound.innerHTML = SPEAKER_OFF;
  sound.setAttribute("aria-label", "Unmute");
  sound.setAttribute("aria-pressed", "false");
  bar.appendChild(sound);

  let cc = null;
  if (opts.captions) {
    cc = document.createElement("button");
    cc.type = "button";
    cc.className = "video-ctl";
    cc.textContent = "CC";
    cc.setAttribute("aria-label", "Show captions");
    cc.setAttribute("aria-pressed", "false");
    bar.appendChild(cc);
  }
  frame.appendChild(bar);

  let nudge = null;
  if (opts.nudge) {
    nudge = document.createElement("div");
    nudge.className = "video-nudge";
    nudge.textContent = "Tap for sound";
    nudge.setAttribute("aria-hidden", "true");
    frame.appendChild(nudge);
  }

  let player = null, muted = true, captions = false;

  /* YouTube names the caption module differently depending on which player it
     serves: "captions" on the HTML5 player, "cc" on the older one. getOptions()
     reports what THIS player actually carries, so ask it rather than guess --
     setOption against the wrong name is accepted silently and does nothing. */
  function ccName() {
    try {
      const opts = player.getOptions() || [];
      if (opts.indexOf("cc") >= 0) return "cc";
    } catch (e) {}
    return "captions";
  }

  function killCaptions() {
    if (!player) return;
    try { player.setOption(ccName(), "track", {}); } catch (e) {}
    try { player.unloadModule("captions"); } catch (e) {}
    try { player.unloadModule("cc"); } catch (e) {}
  }

  function showCaptions() {
    if (!player) return;
    try { player.loadModule("captions"); } catch (e) {}
    /* loadModule is not synchronous. Setting the track in the same tick lands
       before the module exists and is dropped on the floor -- which is why the
       button appeared to do nothing. Set it once the module has arrived, and
       poll briefly rather than trusting a single delay. */
    let tries = 0;
    const grab = setInterval(function () {
      tries++;
      try { player.setOption(ccName(), "track", { languageCode: "en" }); } catch (e) {}
      let on = false;
      try { on = (player.getOptions() || []).length > 0; } catch (e) {}
      if (on || tries > 12) clearInterval(grab);
    }, 150);
  }

  withYouTubeApi(function () {
    player = new YT.Player(iframeId, {
      events: {
        onReady: function () {
          player.mute();
          killCaptions();
          /* Handed to whoever owns the frame — the slider needs it to stop a
             player that has scrolled out of the deck. */
          frame.ytPlayer = player;
          frame.dispatchEvent(new CustomEvent("yt-ready", { bubbles: true }));
        },
        /* The captions module can load itself once playback starts, so it is
           turned off again on the first PLAYING rather than only on ready. */
        onStateChange: function (e) { if (e.data === 1 && !captions) killCaptions(); }
      }
    });
  });

  function setMuted(next) {
    muted = next;
    if (!player) return;
    if (muted) player.mute(); else { player.unMute(); player.setVolume(100); }
    sound.innerHTML = muted ? SPEAKER_OFF : SPEAKER_ON;
    sound.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    sound.setAttribute("aria-pressed", String(!muted));
    if (nudge && !muted) nudge.classList.remove("is-on");
  }

  sound.addEventListener("click", function () { setMuted(!muted); });

  if (cc) {
    cc.addEventListener("click", function () {
      if (!player) return;
      captions = !captions;
      if (captions) showCaptions(); else killCaptions();
      cc.setAttribute("aria-label", captions ? "Hide captions" : "Show captions");
      cc.setAttribute("aria-pressed", String(captions));
    });
  }

  /* Three seconds after the frame comes into view, offer the sound. Polled on
     an interval rather than an IntersectionObserver, which does not fire in a
     throttled or backgrounded pane. */
  if (nudge) {
    let seen = 0, shown = false;
    const tick = setInterval(function () {
      const r = frame.getBoundingClientRect();
      /* Horizontal as well as vertical: a slide parked off to the side of the
         deck is still at the right height, and would otherwise prompt. */
      const onScreen = r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15 &&
                       r.left < innerWidth * 0.95 && r.right > innerWidth * 0.05;
      seen = onScreen ? seen + 1 : 0;
      if (!shown && seen >= 6 && muted) {          // 6 x 500ms
        shown = true;
        nudge.classList.add("is-on");
        setTimeout(function () { nudge.classList.remove("is-on"); }, 6000);
      }
      if (shown && !muted) { nudge.classList.remove("is-on"); clearInterval(tick); }
    }, 500);
    nudge.addEventListener("click", function () { setMuted(false); });
  }

  return { unmute: function () { setMuted(false); }, isMuted: function () { return muted; } };
}

function withYouTubeApi(done) {
  if (window.YT && window.YT.Player) return done();
  if (!document.getElementById("ytApi")) {
    const tag = document.createElement("script");
    tag.id = "ytApi";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () { if (prev) prev(); done(); };
}
