/* ==========================================================================
   Confetti in the Wonderland palette. window.wlConfetti(mode):
     "burst"    one cannon from the top centre, falls with gravity
     "cannons"  two cannons, bottom left and bottom right, firing inwards
     "rain"     a gentle fall from the top edge, with the brand's mountain shape
     "kk"       two big cannons in the bottom corners, as on the King Kong confirmation page
   Plain canvas, no library. Skipped entirely for visitors who ask for reduced
   motion. The canvas ignores the pointer and removes itself when done.
   ========================================================================== */
(function () {
  var COLOURS = ["#DB7627", "#D99B88", "#F3B676", "#1B1B1B", "#8C4A12"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick() { return COLOURS[(Math.random() * COLOURS.length) | 0]; }

  function piece(x, y, vx, vy, big) {
    return {
      x: x, y: y, vx: vx, vy: vy,
      w: rnd(6, 11) * big, h: rnd(10, 18) * big,
      r: rnd(0, 6.28), vr: rnd(-0.28, 0.28),
      c: pick(), shape: ["rect", "rect", "circle", "tri", "ribbon"][(Math.random() * 5) | 0],
      sway: rnd(0, 6.28), swaySpd: rnd(0.04, 0.1), life: 0
    };
  }

  function draw(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.c;
    var squash = Math.abs(Math.cos(p.life * 0.12 + p.sway));     /* tumbling */
    ctx.scale(1, 0.25 + 0.75 * squash);
    if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.w * 0.55, 0, 6.28); ctx.fill(); }
    else if (p.shape === "tri") {                                  /* the mountain from the logo */
      ctx.beginPath(); ctx.moveTo(0, -p.h * 0.6); ctx.lineTo(p.w * 0.9, p.h * 0.5); ctx.lineTo(-p.w * 0.9, p.h * 0.5); ctx.closePath(); ctx.fill();
    } else if (p.shape === "ribbon") { ctx.fillRect(-p.w * 0.2, -p.h * 0.9, p.w * 0.4, p.h * 1.8); }
    else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
    ctx.restore();
  }

  /* "kk": the King Kong confirmation-page confetti, rebuilt here from how it behaves.
     Two cannons in the bottom corners (left at 65 degrees, right at 115), 250 flat
     pieces each, fanned +/-32 degrees. Launch speed is 5.2 x the window height per
     second, so it always reaches about the same height. Gravity 1700 px/s2 and air
     drag 3.5/s; every piece tumbles (squashes as it spins) and wobbles a little
     sideways. No fixed end: the canvas goes when the last piece has landed.
     Colours: the Wonderland palette. Swap in KK_COLOURS to try their rainbow. */
  var KK_COLOURS = ["#DB7627", "#F3B676", "#D99B88", "#1B1B1B", "#8C4A12", "#FFFFFF", "#F08A3C"];
  /* var KK_COLOURS = ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"];   their rainbow */
  function kingKongConfetti() {
    var cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none";
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W, H;
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
    size(); window.addEventListener("resize", size);
    var parts = [];
    [[0, 65], [1, 115]].forEach(function (c) {
      for (var n = 0; n < 250; n++) {
        var a = (c[1] + 65 * (Math.random() - 0.5)) * Math.PI / 180;
        var sp = 5.2 * H * (0.55 + 0.55 * Math.random());
        parts.push({
          x: c[0] * W, y: H, vx: Math.cos(a) * sp, vy: -Math.sin(a) * sp,
          size: 12 + 8 * Math.random(), round: Math.random() < 0.3,
          spin: Math.random() * Math.PI * 2, spinSpeed: 6 + 8 * Math.random(),
          colour: KK_COLOURS[n % KK_COLOURS.length]
        });
      }
    });
    var last = performance.now();
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter(function (p) {
        p.vx -= 3.5 * p.vx * dt;
        p.vy += (1700 - 3.5 * p.vy) * dt;
        p.spin += p.spinSpeed * dt;
        p.x += (p.vx + 40 * Math.sin(p.spin)) * dt;
        p.y += p.vy * dt;
        ctx.setTransform(dpr, 0, 0, dpr * Math.cos(p.spin), p.x * dpr, p.y * dpr);
        ctx.rotate(0.5 * p.spin);
        ctx.fillStyle = p.colour;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.5, 0, 6.2832); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        return p.y < H + 20 || p.vy < 0;
      });
      if (parts.length) requestAnimationFrame(frame);
      else { window.removeEventListener("resize", size); cv.remove(); }
    }
    requestAnimationFrame(frame);
  }

  window.wlConfetti = function (mode) {
    if (reduce) return;
    if (mode === "kk") return kingKongConfetti();
    var cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
    document.body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
    var ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    var w = innerWidth, h = innerHeight, parts = [], t = 0, spawnUntil = 0;
    var big = w < 700 ? 1 : 1.4;

    function cannon(x, y, ang, spread, n, speed) {
      for (var i = 0; i < n; i++) {
        var a = ang + rnd(-spread, spread), s = rnd(speed * 0.45, speed);
        parts.push(piece(x, y, Math.cos(a) * s, Math.sin(a) * s, big));
      }
    }
    var GRAV = 0.32, DRAG = 0.985, FADE_AT = 9999;
    /* Launch speed that carries the fastest pieces up to the bottom of the nav
       bar, whatever the screen height: the rise is simulated frame by frame
       with the same gravity and drag the pieces use. */
    var nav = document.querySelector("header");
    var navB = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
    function speedFor(angle, rise) {
      var lo = 5, hi = 90;
      for (var n = 0; n < 24; n++) {
        var mid = (lo + hi) / 2, v = Math.sin(angle) * mid, y = 0;
        while (v < 0) { v = v * DRAG + GRAV; y += v; }
        if (Math.abs(y) < rise) lo = mid; else hi = mid;
      }
      return hi;
    }
    var RISE = Math.max(200, h - navB - 10);
    var TOTAL = 2500, FADE_MS = 700;           /* everything is gone 2.5 seconds after the start */

    if (mode === "cannons") {
      var s1 = speedFor(1.15, RISE), s2 = speedFor(1.0, RISE * 0.85);
      cannon(0, h, -1.15, 0.38, 130, s1); cannon(w, h, -Math.PI + 1.15, 0.38, 130, s1);
      setTimeout(function () { cannon(0, h, -1.0, 0.4, 80, s2); cannon(w, h, -Math.PI + 1.0, 0.4, 80, s2); }, 380);
    } else if (mode === "rain") {
      spawnUntil = 1300; GRAV = 0.1; DRAG = 0.995; FADE_AT = 9999;
    } else {                                                        /* burst */
      cannon(w / 2, h * 0.34, -Math.PI / 2, 1.2, 150, 21);
      setTimeout(function () { cannon(w / 2, h * 0.34, -Math.PI / 2, 1.3, 70, 16); }, 300);
    }

    var start = performance.now();
    (function frame(now) {
      t++;
      var el = now - start;
      if (mode === "rain" && el < spawnUntil) {
        for (var k = 0; k < 2; k++) parts.push(piece(rnd(0, w), -20, rnd(-0.6, 0.6), rnd(1, 2.6), big));
      }
      ctx.clearRect(0, 0, w, h);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life++;
        p.vx *= DRAG; p.vy = p.vy * DRAG + GRAV;
        p.x += p.vx + (mode === "rain" ? Math.sin(p.sway + p.life * p.swaySpd) * 0.9 : 0);
        p.y += p.vy; p.r += p.vr;
        var a = el > TOTAL - FADE_MS ? Math.max(0, (TOTAL - el) / FADE_MS) : 1;
        if (a <= 0 || p.y > h + 40) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = a; draw(ctx, p);
      }
      ctx.globalAlpha = 1;
      if (el < TOTAL) requestAnimationFrame(frame);
      else cv.remove();
    })(start);
  };
})();
