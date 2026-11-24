/* SAMPLE ONLY: option switcher (?v=A..D), header height for the one-screen maths, and the video player. */
(function () {
  var secs = [].slice.call(document.querySelectorAll(".tyx")), btns = [].slice.call(document.querySelectorAll(".tyx-bar button"));
  var NOTES = {
    A: "Stack. Video takes what is left.",
    B: "Pill, line and steps share one band.",
    C: "Two bands: heading sits beside its line.",
    D: "Heading and line sit on the video."
  };
  function pick(v) {
    if (!NOTES[v]) v = "A";
    secs.forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-v") === v); });
    btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === v); });
    document.getElementById("tyxNote").textContent = NOTES[v];
    try { history.replaceState(null, "", "?v=" + v); } catch (e) {}
  }
  btns.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-v")); }); });
  var m = /[?&]v=([A-D])/.exec(location.search); pick(m ? m[1] : "A");
  document.addEventListener("keydown", function (e) { var i = "ABCD".indexOf(e.key.toUpperCase()); if (e.key.length === 1 && i > -1) pick("ABCD".charAt(i)); });

  var hdr = document.querySelector(".site-header");
  function setHdr() { if (hdr) document.documentElement.style.setProperty("--hdr", Math.ceil(hdr.getBoundingClientRect().bottom) + "px"); }
  setHdr(); window.addEventListener("resize", setHdr); window.addEventListener("load", setHdr);

  if (typeof mountVideo === "function") [].forEach.call(document.querySelectorAll(".tyx .ty-video"), function (f) { mountVideo(f, f.getAttribute("data-video"), f.getAttribute("data-title"), { popup: true }); });
})();
