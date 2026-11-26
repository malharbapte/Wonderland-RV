/* Hide / show the "Luxury off-road Caravans" block (description, quote, picture carousel) from a quiet control in the hero's corner. Remembered per browser. */
(function () {
  var hero = document.querySelector(".home-hero"); if (!hero) return;
  var root = document.documentElement, b = document.createElement("button");
  b.type = "button"; b.className = "lux-toggle";
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  function label() { var off = root.classList.contains("lux-off"); b.setAttribute("aria-label", off ? "Show the Luxury off-road Caravans section" : "Hide the Luxury off-road Caravans section"); b.setAttribute("aria-pressed", off ? "true" : "false"); b.title = off ? "Show the intro" : "Hide the intro"; }
  b.addEventListener("click", function () {
    var off = root.classList.toggle("lux-off");
    try { localStorage.setItem("wlLuxOff", off ? "1" : "0"); } catch (e) {}
    label();
  });
  label(); hero.appendChild(b);
})();
