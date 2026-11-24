/* SAMPLE ONLY: sets the header height for the one-screen maths and starts the video player. */
(function () {
  var hdr = document.querySelector(".site-header");
  function setHdr() { if (hdr) document.documentElement.style.setProperty("--hdr", Math.ceil(hdr.getBoundingClientRect().bottom) + "px"); }
  setHdr(); window.addEventListener("resize", setHdr); window.addEventListener("load", setHdr);
  if (typeof mountVideo === "function") [].forEach.call(document.querySelectorAll(".tyx .ty-video"), function (f) { mountVideo(f, f.getAttribute("data-video"), f.getAttribute("data-title"), { popup: true }); });
})();
