/* SAMPLE: ?squeeze=a|b|c|now on range.html. See layouts-squeeze.css. Desktop only; does nothing without the param. */
(function () {
  var mode = (new URLSearchParams(location.search).get("squeeze") || "").toLowerCase();
  if (!mode || !window.matchMedia("(min-width: 901px)").matches) return;
  var body = document.querySelector(".fp-body"), dock = document.getElementById("fpRailDock"),
      grid = document.querySelector(".fp-grid"), plan = document.getElementById("fpPlan"),
      nameEl = document.getElementById("fpName"), inner = document.querySelector(".fp-inner"), fp = document.querySelector(".fp");
  if (!body || !dock || !grid || !plan) return;

  var bar = document.createElement("div");
  bar.className = "sq-bar";
  bar.innerHTML = "<b>Rail open</b>" + [["now", "Now (covers plan)"], ["a", "A  Squeeze both"], ["b", "B  Plan only"], ["c", "C  Scale + slide"]].map(function (m) {
    return '<a class="' + (m[0] === mode ? "is-cur" : "") + '" href="?squeeze=' + m[0] + '">' + m[1] + "</a>"; }).join("") + "<i>click LAYOUTS to open / close</i>";
  document.body.appendChild(bar);
  if (mode !== "a" && mode !== "b" && mode !== "c") { scrollTo(); return; }

  body.classList.add("sq", "sq-" + mode);
  var probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;width:var(--railw);height:0";
  fp.appendChild(probe);
  var remPx = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; };

  function measure() {
    plan.style.height = ""; body.style.removeProperty("--sq-h");
    body.classList.remove("sq");
    var h = plan.getBoundingClientRect().height;
    body.classList.add("sq");
    body.style.setProperty("--sq-h", Math.round(h) + "px");
    update();
  }
  function open() { return dock.classList.contains("is-in") && !dock.classList.contains("is-shut"); }
  function update() {
    var gridLeft = inner.getBoundingClientRect().left + parseFloat(getComputedStyle(inner).paddingLeft || 0);
    var gridW = grid.offsetWidth;                       /* layout width, unaffected by transform */
    var push = open() ? Math.max(0, probe.offsetWidth + 0.3 * remPx() - gridLeft) : 0;
    body.style.setProperty("--sq-push", Math.round(push) + "px");
    body.style.setProperty("--sq-s", (1 - push / Math.max(gridW + (mode === "a" ? push : 0), 1)).toFixed(4));
  }
  new MutationObserver(update).observe(dock, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", measure);

  /* real floor plan where one is drawn; the family plans are not drawn yet, so those keep the grey placeholder */
  function setPlan() {
    var n = (nameEl.textContent || "").trim(), src = "assets/img/build/plans/" + n + ".webp", im = new Image();
    im.onload = function () { plan.style.backgroundImage = 'url("' + src + '")'; plan.classList.add("has-img"); };
    im.onerror = function () { plan.style.backgroundImage = ""; plan.classList.remove("has-img"); };
    im.src = src;
  }
  new MutationObserver(setPlan).observe(nameEl, { childList: true, characterData: true, subtree: true });
  setPlan();
  measure();
  scrollTo();
  function scrollTo() { setTimeout(function () { window.scrollTo(0, grid.getBoundingClientRect().top + window.pageYOffset - 260); }, 60); }
})();
