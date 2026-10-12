/* Build your Caravan: the progress road. One place that draws the checkpoint markers, parks the van and
   stretches the covered path, so every step of the configurator shows progress identically.

   WLProgress.set(roadElement, stepIndex)   stepIndex is 0-based: 0 = Layout ... 5 = Details

   Marker themes:
     pines    (ACTIVE)   five pines, then a flag as the last checkpoint, so the finish reads clearly
     outback  (RESERVE)  a different landmark per step: tree, hills, boab, windmill, peak, flag
   Preview the reserve theme on any step page with  ?markers=outback   (or switch THEME below).

   Glyphs are drawn in a 20 x 26 box with their base on y = 25.5. Classes: a = main shape, b = second tone,
   w = small white detail, s = stroke-only. Round joins on a 1.6px stroke give every corner a minimal curve. */
(function () {
  var N = 6, THEME = "pines";
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
    pines:   ["pine", "pine", "pine", "pine", "pine", "flag"],
    outback: ["tree", "hills", "boab", "mill", "peak", "flag"]
  };
  var q = (location.search.match(/[?&]markers=(\w+)/) || [])[1];
  if (q && THEMES[q]) THEME = q;

  function build(road) {
    if (road.querySelector(".mk")) return;
    var van = road.querySelector(".van");
    THEMES[THEME].forEach(function (k, i) {
      var m = document.createElement("span");
      m.className = "mk";
      m.style.left = "calc(20px + (100% - 40px) * " + (i / (N - 1)) + ")";
      m.innerHTML = '<svg viewBox="0 0 20 26" aria-hidden="true">' + GLYPH[k] + "</svg>";
      road.insertBefore(m, van);
    });
  }
  function set(road, step) {
    build(road);
    var p = step / (N - 1);
    road.querySelector(".van").style.left = "calc((100% - 40px) * " + p + ")";
    road.querySelector(".done").style.width = "calc((100% - 40px) * " + p + " + 24px)";
    road.querySelectorAll(".mk").forEach(function (m, i) { m.classList.toggle("passed", i < step); m.classList.toggle("cur", i === step); });
  }
  window.WLProgress = { set: set, theme: THEME, themes: THEMES };
})();
