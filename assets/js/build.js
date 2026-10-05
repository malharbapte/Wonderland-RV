/* Build your Caravan — step shell. Step 1 is designed; later steps are stubs. */
(function () {
  var STEPS = ["Layout", "Size", "Model", "Bed", "Selection", "Customise"];
  var screens = document.querySelectorAll(".screen");
  var segs = document.querySelectorAll(".prog-seg i");
  var label = document.getElementById("prog-label");
  var prev = document.getElementById("prev");
  var choice = {};
  var at = 0;

  function show(n) {
    at = n;
    screens.forEach(function (s, i) { s.hidden = i !== n; });
    segs.forEach(function (s, i) { s.classList.toggle("on", i <= n); });
    label.textContent = "Step " + (n + 1) + " of " + STEPS.length + " · " + STEPS[n];
    // step 1 has nowhere earlier to go in the flow, so Previous leaves to the homepage
    prev.setAttribute("href", n === 0 ? "home.html" : "#");
  }

  prev.addEventListener("click", function (e) {
    if (at > 0) { e.preventDefault(); show(at - 1); }
  });

  document.querySelectorAll(".choice").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".choice").forEach(function (b) { b.classList.remove("is-picked"); });
      btn.classList.add("is-picked");
      choice.type = btn.dataset.type;
      setTimeout(function () { show(1); }, 260);
    });
  });

  show(0);
})();
