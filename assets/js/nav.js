/* ==========================================================================
   The header nav — the hamburger toggle, and the phone panel's accordion.

   One file for every page. The toggle used to be copied into home.js and
   video.js, which between them missed sandy-van-travels.html: that page
   loads neither, so its hamburger did nothing at all. Both copies are gone
   now and this is the only binding — two of them on one page would toggle
   twice on a single click and the menu would never open.

   Desktop does nothing here. The panel is the desktop mega-menu above 901px
   and this script leaves it alone: the accordion is built only below the
   breakpoint, so nothing above it changes.
   ========================================================================== */
(function () {
  "use strict";

  var btn = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (!btn || !nav) return;

  /* ------------------------------------------------------------- toggle */
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  /* ---------------------------------------------------------- accordion
     The panel used to pour all 15 links onto one screen: the six top-level
     items plus the whole About mega-menu, every Wonderlander name included.
     About becomes a row you tap instead, and its children ride the same
     0fr -> 1fr grid the Wonderlander cards and the van-layout headings use.

     Built once, on a phone. A card re-parented into the wrapper would have
     to be put back to render the desktop mega-menu, so it is not torn down
     on resize — rotating a phone stays inside the breakpoint, and crossing
     it is a desktop window being dragged narrow, which reloads soon enough.
     Same reasoning as the Wonderlander rail in wonderlanders.js. */
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  var item = nav.querySelector(".nav-item");
  var dd   = item && item.querySelector(".nav-dropdown");

  if (item && dd) {
    var label = item.querySelector("a") ? item.querySelector("a").textContent.trim() : "About";

    var row = document.createElement("button");
    row.type = "button";
    row.className = "nav-row";
    row.setAttribute("aria-expanded", "false");
    row.innerHTML =
      "<span></span>" +
      '<svg class="nav-chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    row.firstChild.textContent = label;
    item.insertBefore(row, item.firstChild);

    var wrap  = document.createElement("div");
    wrap.className = "nav-dropdown-wrap";
    var inner = document.createElement("div");
    inner.className = "nav-dropdown-inner";
    item.appendChild(wrap);
    wrap.appendChild(inner);
    inner.appendChild(dd);

    row.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      row.setAttribute("aria-expanded", String(open));
    });
  }

  /* The primary action, which is display:none on the phone in the bar — so
     the one thing the header most wants you to do was the one thing the
     menu would not offer. Cloned rather than moved, so the desktop bar's
     own button is untouched. */
  var build = document.querySelector(".header-inner > .btn-build");
  if (build) {
    var cta = document.createElement("div");
    cta.className = "nav-cta";
    cta.appendChild(build.cloneNode(true));
    nav.appendChild(cta);
  }
})();
