/* Build your Caravan: the progress road. One place that draws the checkpoint markers, parks the van and
   stretches the covered path, so every step of the configurator shows progress identically.

   WLProgress.set(roadElement, stepIndex)     jump or glide to a step (0-based: 0 = Layout, 1 = Size, 2 = Model, 3 = Plan, 4 = Details)
   WLProgress.enter(roadElement, stepIndex)   for a step page on arrival: start at the previous stop, then drive here

   Marker themes:
     pines    (ACTIVE)   four pines, then a flag as the last checkpoint, so the finish reads clearly
     outback  (RESERVE)  a different landmark per step: tree, hills, boab, peak, flag
   Preview the reserve theme on any step page with  ?markers=outback   (or switch THEME below).

   Glyphs are drawn in a 20 x 26 box with their base on y = 25.5. Classes: a = main shape, b = second tone,
   w = small white detail, s = stroke-only. Round joins on a 1.6px stroke give every corner a minimal curve. */
(function () {
  var N = 5, THEME = "pines";
  var GLYPH = {
    pine:  '<path class="a" d="M10 1.5L16 11H4Z"/><path class="a" d="M10 7L18 19H2Z"/><rect class="b" x="8.7" y="19" width="2.6" height="6.5" rx="1.2"/>',
    flag:  '<rect class="b" x="3" y="2" width="1.8" height="23.5" rx=".9"/><path class="a" d="M5 3H16.5L13.2 7.5L16.5 12H5Z"/>',
    tree:  '<circle class="a" cx="10" cy="9.5" r="8"/><rect class="b" x="8.6" y="15" width="2.8" height="10.5" rx="1.2"/>',
    hills: '<path class="a" d="M.8 25.5C.8 16.5 5.5 12 10 12C14.5 12 19.2 16.5 19.2 25.5Z"/>',
    boab:  '<path class="b" d="M7.2 25.5C6 17 6.2 12.5 7.6 9H12.4C13.8 12.5 14 17 12.8 25.5Z"/><circle class="a" cx="6" cy="7" r="3.4"/><circle class="a" cx="10" cy="5" r="3.6"/><circle class="a" cx="14" cy="7" r="3.4"/>',
    mill:  '<path class="b" d="M8.2 25.5L9.3 12H10.7L11.8 25.5Z"/><g transform="rotate(25 10 10)"><path class="s" d="M10 10V3M10 10H17M10 10V17M10 10H3"/></g><circle class="a" cx="10" cy="10" r="1.9"/>',
    peak:  '<path class="a" d="M1.5 25L8 8L14.5 25Z"/><path class="a" d="M9.5 25L14.5 13L18.5 25Z"/>'
  };
  var THEMES = {
    pines:   ["pine", "pine", "pine", "pine", "flag"],
    outback: ["tree", "hills", "boab", "peak", "flag"]
  };
  var q = (location.search.match(/[?&]markers=(\w+)/) || [])[1];
  if (q && THEMES[q]) THEME = q;

  function build(road) {
    if (road.querySelector(".mk")) return;
    var van = road.querySelector(".van");
    THEMES[THEME].forEach(function (k, i) {
      var m = document.createElement("span");
      m.className = "mk";
      m.style.left = "calc(var(--vw, 40px) / 2 + (100% - var(--vw, 40px)) * " + (i / (N - 1)) + ")";
      m.innerHTML = '<svg viewBox="0 0 20 26" aria-hidden="true">' + GLYPH[k] + "</svg>";
      road.insertBefore(m, van);
    });
  }
  /* The van's journey uses ease-in-out, so it is slow at the start and end and quick in the middle. A marker should light up
     when the van REACHES it, not when the journey starts, so we invert the easing curve: given how far along the road a marker
     is (0..1), find how far through the journey's TIME the van gets there. Same curve as --ease in the stylesheet. */
  var P1X = .65, P1Y = 0, P2X = .35, P2Y = 1;
  function bez(t, a, b) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; }
  function progressAt(tau) {                       /* eased distance (0..1) after a fraction tau of the time */
    var lo = 0, hi = 1, t;
    for (var i = 0; i < 28; i++) { t = (lo + hi) / 2; if (bez(t, P1X, P2X) < tau) lo = t; else hi = t; }
    return bez((lo + hi) / 2, P1Y, P2Y);
  }
  function timeAt(q) {                             /* fraction of the journey's time at which the van has covered fraction q of the road */
    var lo = 0, hi = 1, m;
    for (var i = 0; i < 28; i++) { m = (lo + hi) / 2; if (progressAt(m) < q) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  var qpm = parseInt((location.search.match(/[?&]pm=(\d+)/) || [])[1], 10);       /* ?pm=800 overrides the journey time, for testing */
  function journeyMs(road) { var v = parseFloat(getComputedStyle(road).getPropertyValue("--pm")); return isFinite(v) ? v : 1200; }

  function set(road, step) {
    build(road);
    if (qpm >= 200 && qpm <= 4000) road.style.setProperty("--pm", qpm + "ms");
    var from = road.dataset.step === undefined ? step : +road.dataset.step, ms = journeyMs(road);
    var p = step / (N - 1);
    road.querySelector(".van").style.left = "calc((100% - var(--vw, 40px)) * " + p + ")";
    road.querySelector(".done").style.width = "calc((100% - var(--vw, 40px)) * " + p + " + var(--vw, 40px) * .6)";
    road.querySelectorAll(".mk").forEach(function (m, i) {
      var delay = 0;
      if (from !== step && i >= Math.min(from, step) && i <= Math.max(from, step)) {
        var q = Math.abs(i - from) / Math.abs(step - from);                 /* how far along the road this marker is */
        delay = Math.round(Math.min(timeAt(q), .9) * ms);                  /* the moment the van gets there (the arrival marker hides just before it lands) */
      }
      m.style.setProperty("--md", delay + "ms");
      m.classList.toggle("passed", i < step); m.classList.toggle("cur", i === step);
    });
    road.dataset.step = step;
  }
  /* a step page calls this on arrival. The van starts where the journey was LAST (remembered for this browser session)
     and drives to this page's stop: forward when you move on, back by one milestone when you go back. With no history
     (a page opened directly) it drives in from the previous stop, so the motion can still be seen. */
  var KEY = "wl-step";
  function lastStep() { try { var v = parseInt(sessionStorage.getItem(KEY), 10); return v >= 0 && v < N ? v : null; } catch (e) { return null; } }
  function remember(step) { try { sessionStorage.setItem(KEY, step); } catch (e) {} }
  function enter(road, step) {
    road.dataset.pageStep = step;
    var prev = lastStep();
    if (prev === null) prev = step > 0 ? step - 1 : step;     /* no history: arrive from the previous stop */
    remember(step);                                           /* this page is now where the journey stands */
    if (prev === step) { set(road, step); return; }           /* a reload: no movement */
    road.classList.add("no-anim");
    set(road, prev);                                          /* park the van at the last stop... */
    void road.offsetWidth;
    road.classList.remove("no-anim");
    setTimeout(function () { set(road, step); }, 60);         /* ...then glide to this one */
  }
  /* returning to a page from the browser's back/forward cache restores it as it was: replay the glide from where the journey was */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    var road = document.querySelector(".road");
    if (road && road.dataset.pageStep !== undefined) { var st = +road.dataset.pageStep; road.dataset.step = st; enter(road, st); }
  });
  /* The customer's choices travel with the session so every step can use them (and the form can send them later).
     Choosing an earlier answer clears the later ones, since they may no longer apply. */
  var CK = "wl-choice", ORDER = ["type", "size", "model", "plan", "bed"];
  function choices() { try { return JSON.parse(sessionStorage.getItem(CK) || "{}"); } catch (e) { return {}; } }
  function choose(key, value) {
    var c = choices(); c[key] = value;
    ORDER.slice(ORDER.indexOf(key) + 1).forEach(function (k) { delete c[k]; });
    try { sessionStorage.setItem(CK, JSON.stringify(c)); } catch (e) {}
  }
  /* move to the next step after a short beat, so the tap's pressed state is seen. Test flags in the address (?guides, ?markers=...) are carried along. */
  function go(url, delay) { setTimeout(function () { location.href = url + location.search; }, delay == null ? 420 : delay); }

  window.WLProgress = { set: set, enter: enter, choices: choices, choose: choose, go: go, theme: THEME, themes: THEMES };
})();
