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
              {nudge:true} adds the "Tap for sound" prompt;
              {popup:true} shows only the poster image with the big play button;
              nothing loads until it is pressed, then the video opens in a
              separate player pop-up with our own controls (YouTube's are off)
   ========================================================================== */

/* -------------------------------------------------------------------------- */

let ytSeq = 0;

function mountVideo(frame, url, title, opts) {
  if (!frame || !url) return;
  url = url.trim();
  let node;

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  /* Thumbnail + play: nothing loads until the visitor presses play. */
  if (yt && opts && opts.popup) {
    frame.classList.remove("ph");
    frame.removeAttribute("data-ph");
    addPopupPlay(frame, yt[1], title);
    return;
  }

  if (yt && opts && opts.player) {
    /* Click-to-play (the visitor pressed play on a thumbnail): a normal player
       with its own controls and sound, playing once, not the muted ambient loop. */
    node = document.createElement("iframe");
    node.src = "https://www.youtube-nocookie.com/embed/" + yt[1] +
      "?autoplay=1&playsinline=1&rel=0&modestbranding=1&cc_lang_pref=en&iv_load_policy=3";
    node.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    node.allowFullscreen = true;
  } else if (yt) {
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
  return (node.id && opts && !opts.player) ? buildControls(frame, node.id, opts) : node;
}

/* ---------------------------------------------- separate player pop-up -----
   The page shows the poster and the big play button, nothing else. Play opens
   a full player over the page: sound on, our own control bar (play/pause,
   scrub, sound, fullscreen), with YouTube's controls switched off and its
   hover bar kept out of reach. While the video is paused or not yet running
   the poster covers the player, so YouTube's paused-state strip (title, More
   videos) is never on show. At the end the pop-up closes.                  */
const VP_ICON = {
  play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>',
  vol:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
  full:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
};

function addPopupPlay(frame, id, title) {
  frame.classList.add("video-frame--pop");
  const play = document.createElement("button");
  play.type = "button";
  play.className = "kk-play";
  play.setAttribute("aria-label", "Play video: " + title);
  play.innerHTML = VP_ICON.play;
  frame.appendChild(play);
  const poster = frame.querySelector(".video-poster");
  play.addEventListener("click", function () {
    openVideoPopup(id, title, poster ? poster.getAttribute("src") : "", play);
  });
}

function openVideoPopup(id, title, poster, opener) {
  if (document.getElementById("vpop")) return;
  const q = String(title).replace(/"/g, "&quot;");
  const base = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&enablejsapi=1&origin=" + encodeURIComponent(location.origin);
  const wrap = document.createElement("div");
  wrap.id = "vpop";
  wrap.className = "vpop";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", title);
  wrap.innerHTML =
    '<div class="vpop-box">' +
      '<iframe id="vpopYt" src="' + base + '&controls=0" title="' + q + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
      '<div class="vpop-cover">' + (poster ? '<img src="' + poster + '" alt="">' : "") + "</div>" +
      '<button type="button" class="vpop-hit" aria-label="Play or pause"></button>' +
      '<div class="vpop-bar">' +
        '<button type="button" class="vpop-b" data-a="play" aria-label="Pause">' + VP_ICON.pause + "</button>" +
        '<input class="vpop-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">' +
        '<span class="vpop-time">0:00</span>' +
        '<button type="button" class="vpop-b" data-a="vol" aria-label="Mute">' + VP_ICON.vol + "</button>" +
        '<button type="button" class="vpop-b" data-a="full" aria-label="Fullscreen">' + VP_ICON.full + "</button>" +
      "</div>" +
    "</div>" +
    '<button type="button" class="vpop-x video-ctl" aria-label="Close video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  document.body.appendChild(wrap);
  document.documentElement.classList.add("vpop-open");

  const box = wrap.querySelector(".vpop-box");
  const hit = wrap.querySelector(".vpop-hit");
  const bPlay = wrap.querySelector('[data-a="play"]');
  const bVol = wrap.querySelector('[data-a="vol"]');
  const bFull = wrap.querySelector('[data-a="full"]');
  const seek = wrap.querySelector(".vpop-seek");
  const time = wrap.querySelector(".vpop-time");
  const x = wrap.querySelector(".vpop-x");
  x.focus();

  let player = null, ready = false, playing = false, muted = false, dragging = false, idle = null, tick = null;
  const fmt = function (t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };

  function setPlaying(on) {
    playing = on;
    box.classList.toggle("is-playing", on);
    bPlay.innerHTML = on ? VP_ICON.pause : VP_ICON.play;
    bPlay.setAttribute("aria-label", on ? "Pause" : "Play");
    if (!on) box.classList.remove("is-idle");
  }
  function toggle() {
    if (!player || !ready) return;
    /* Cover first, then pause: the poster must already be up when YouTube
       paints its paused-state strip, or the strip flashes through. */
    try { if (playing) { setPlaying(false); player.pauseVideo(); } else player.playVideo(); } catch (e) {}
  }

  withYouTubeApi(function () {
    if (!document.getElementById("vpopYt")) return;      /* closed before the API arrived */
    player = new YT.Player("vpopYt", {
      events: {
        onReady: function () {
          ready = true;
          try { player.unMute(); player.setVolume(100); player.playVideo(); } catch (e) {}
        },
        onStateChange: function (e) {
          if (e.data === 1) setPlaying(true);                 /* playing */
          else if (e.data === 2) setPlaying(false);           /* paused */
          else if (e.data === 0) close();                     /* ended: skip YouTube's end screen */
        }
      }
    });
  });

  /* If the YouTube API never answers (blocked, offline) fall back to a plain
     player rather than leaving a dead pop-up. */
  const fallback = setTimeout(function () {
    if (ready) return;
    const f = document.getElementById("vpopYt");
    if (!f) return;
    f.src = base + "&controls=1";
    box.classList.add("is-plain");
  }, 6000);

  tick = setInterval(function () {
    if (!ready || !player || dragging) return;
    try {
      const d = player.getDuration() || 0, t = player.getCurrentTime() || 0;
      if (d) seek.value = Math.round(t / d * 1000);
      seek.style.setProperty("--p", (t / (d || 1) * 100) + "%");
      time.textContent = fmt(t) + " / " + fmt(d);
    } catch (e) {}
  }, 250);

  seek.addEventListener("input", function () {
    dragging = true;
    seek.style.setProperty("--p", (seek.value / 10) + "%");
  });
  seek.addEventListener("change", function () {
    dragging = false;
    try { player.seekTo(seek.value / 1000 * player.getDuration(), true); } catch (e) {}
  });
  hit.addEventListener("click", toggle);
  bPlay.addEventListener("click", toggle);
  bVol.addEventListener("click", function () {
    if (!player) return;
    muted = !muted;
    try { if (muted) player.mute(); else { player.unMute(); player.setVolume(100); } } catch (e) {}
    bVol.innerHTML = muted ? VP_ICON.mute : VP_ICON.vol;
    bVol.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  });
  bFull.addEventListener("click", function () {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const go = box.requestFullscreen || box.webkitRequestFullscreen;
    if (go) go.call(box);
  });

  /* the bar sits out of the way while the video plays and returns on movement */
  function wake() {
    box.classList.remove("is-idle");
    clearTimeout(idle);
    if (playing) idle = setTimeout(function () { box.classList.add("is-idle"); }, 2500);
  }
  box.addEventListener("mousemove", wake);
  box.addEventListener("touchstart", wake, { passive: true });
  box.addEventListener("keydown", wake);

  function close() {
    clearInterval(tick); clearTimeout(idle); clearTimeout(fallback);
    document.removeEventListener("keydown", onKey, true);
    try { if (player && player.destroy) player.destroy(); } catch (e) {}
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    if (wrap.parentNode) wrap.remove();
    document.documentElement.classList.remove("vpop-open");
    if (opener) opener.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === " " && e.target !== seek) { e.preventDefault(); toggle(); }
    else if (e.key === "Tab") {
      const f = [].slice.call(wrap.querySelectorAll("button, input")).filter(function (n) { return !n.disabled && n.offsetParent !== null && !n.classList.contains("vpop-hit"); });
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  document.addEventListener("keydown", onKey, true);
  x.addEventListener("click", close);
  wrap.addEventListener("click", function (e) { if (e.target === wrap) close(); });
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

  /* King Kong style: while muted the button shows the sound waves (press for
     sound); once unmuted it shows the slash (press to mute). */
  const SPEAKER_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const SPEAKER_ON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>';

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
    cc.innerHTML = '<span class="cc-box">CC</span>';
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
