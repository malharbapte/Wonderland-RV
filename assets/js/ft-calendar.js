/* Factory tour pop-up: date and time pickers. SAMPLE: three layouts, switched on with ?cal=a|b|c on any page that
   carries the pop-up (factory-tour-popup.js mounts one into .ftc-slot and opens the pop-up). Tours run on weekdays only;
   the earliest day is tomorrow. Writes two hidden fields, "date" (yyyy-mm-dd) and "time", so the form still posts them. */
(function () {
  "use strict";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW = ["M","T","W","T","F","S","S"];
  var ARW = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var L = ARW("M15 5l-7 7 7 7"), R = ARW("M9 5l7 7-7 7"), CH = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor"/></svg>';

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function add(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function same(a, b) { return a && b && iso(a) === iso(b); }
  function long(d) { return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }); }
  function short(d) { return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }); }
  function mondayOf(d) { var w = (d.getDay() + 6) % 7; return add(d, -w); }

  function mount(slot, v, TIMES, onChange) {
    var today = midnight(new Date()), min = add(today, 1);
    while (min.getDay() === 0 || min.getDay() === 6) min = add(min, 1);   /* first bookable weekday */
    var last = add(today, 92);                                              /* about three months ahead */
    var pick = { date: null, time: "" };
    var view = new Date(min.getFullYear(), min.getMonth(), 1);
    var week = mondayOf(min);
    var ok = function (d) { return d >= min && d <= last && d.getDay() !== 0 && d.getDay() !== 6; };

    slot.innerHTML = '<div class="ftc ftc--' + v + '">' +
      '<input type="hidden" name="date"><input type="hidden" name="time">' +
      (v === "b" ? '<button class="ftc-field" type="button" aria-haspopup="dialog" aria-expanded="false"><span class="ftc-field-t">Preferred day and time*</span>' + CH + "</button>" : "") +
      '<div class="ftc-main"' + (v === "b" ? ' hidden role="dialog" aria-label="Choose a day and time"' : "") + ">" +
        '<div class="ftc-body"><div class="ftc-dates"></div><div class="ftc-times"></div></div>' +
      "</div>" +
      '<p class="ftc-sum" aria-live="polite"></p><p class="ftc-err">Please choose a day and a time.</p>' +
      '<p class="ftc-note">Tours run on weekdays. Our team will confirm your booking.</p>' +
    "</div>";
    var root = slot.querySelector(".ftc"), dates = root.querySelector(".ftc-dates"), times = root.querySelector(".ftc-times"),
        sum = root.querySelector(".ftc-sum"), main = root.querySelector(".ftc-main"),
        hd = root.querySelector('input[name="date"]'), ht = root.querySelector('input[name="time"]');
    var field = root.querySelector(".ftc-field"), fieldT = root.querySelector(".ftc-field-t");

    /* C: a slider for the time. Every 15 minutes from 9:00 am to 3:00 pm, hours marked, so 9:30, 10:30 or 12:45 are all possible.
       Three looks: ?slider=1 (bubble), 2 (ruler), 3 (pill). */
    var SV = (new URLSearchParams(location.search).get("slider") || "1"); if (["1", "2", "3"].indexOf(SV) < 0) SV = "1";
    var T0 = 9 * 60, T1 = 15 * 60, STEP = 15, touched = false, slider = null, readout = null, fill = null, bub = null, tickEls = [];
    function fmt(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am", h12 = h % 12 === 0 ? 12 : h % 12; return h12 + ":" + ("0" + mm).slice(-2) + " " + ap; }
    function buildSlider() {
      var ticks = "", labels = "", n = (T1 - T0) / STEP;
      for (var i = 0; i <= n; i++) {
        var pc = i / n * 100, m = T0 + i * STEP, hr = m % 60 === 0, half = m % 30 === 0;
        ticks += '<i class="ftc-tick' + (hr ? " is-hr" : half ? " is-half" : "") + '" style="left:' + pc + '%"></i>';
        if (hr) { var h = m / 60, h12 = h % 12 === 0 ? 12 : h % 12; labels += '<span style="left:' + pc + '%">' + h12 + "<small>" + (h >= 12 ? "pm" : "am") + "</small></span>"; }
      }
      times.innerHTML = '<div class="ftc-tl"><p class="ftc-lab">Pick a time</p><span class="ftc-hint">Drag to choose</span><output class="ftc-out"></output></div>' +
        '<div class="ftc-rng ftc-sv' + SV + '"><div class="ftc-rail"><span class="ftc-fill"></span>' + ticks + '</div><div class="ftc-bub"></div>' +
        '<input class="ftc-range" type="range" min="' + T0 + '" max="' + T1 + '" step="' + STEP + '" value="' + T0 + '" aria-label="Preferred time">' +
        '<div class="ftc-marks">' + labels + "</div></div>";
      var box = times.querySelector(".ftc-rng");
      slider = times.querySelector(".ftc-range"); readout = times.querySelector(".ftc-out"); fill = times.querySelector(".ftc-fill"); bub = times.querySelector(".ftc-bub");
      tickEls = [].slice.call(times.querySelectorAll(".ftc-tick"));
      var hint = times.querySelector(".ftc-hint");
      function sync() {
        var v = +slider.value, pc = (v - T0) / (T1 - T0) * 100;
        box.style.setProperty("--p", pc + "%"); fill.style.width = pc + "%";
        tickEls.forEach(function (t, i) { t.classList.toggle("is-on", touched && i <= (v - T0) / STEP); });
        box.classList.toggle("is-set", touched); slider.classList.toggle("is-set", touched);
        bub.textContent = touched ? fmt(v) : "";
        readout.textContent = touched ? fmt(v) : "";
        hint.hidden = touched && SV === "2";
        readout.style.display = SV === "2" && touched ? "block" : "none";
        if (SV === "3") bub.textContent = fmt(v);
      }
      slider.addEventListener("input", function () { touched = true; pick.time = fmt(+slider.value); sync(); renderSum(); });
      sync();
    }
    function renderTimes() {
      if (v === "c") { if (!slider) buildSlider(); return; }
      times.innerHTML = '<p class="ftc-lab">Pick a time</p><div class="ftc-slots">' +
        TIMES.map(function (t) { return '<button type="button" class="ftc-t' + (pick.time === t ? " is-on" : "") + '"' + (pick.date ? "" : " disabled") + ' data-t="' + t + '">' + t + "</button>"; }).join("") + "</div>";
    }
    function renderMonth() {
      var first = new Date(view.getFullYear(), view.getMonth(), 1), pad = (first.getDay() + 6) % 7;
      var n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), h = "";
      for (var i = 0; i < pad; i++) h += '<span class="ftc-day is-blank"></span>';
      for (var d = 1; d <= n; d++) {
        var day = new Date(view.getFullYear(), view.getMonth(), d);
        h += '<button type="button" class="ftc-day' + (same(day, pick.date) ? " is-on" : "") + (same(day, today) ? " is-today" : "") + '"' + (ok(day) ? "" : " disabled") + ' data-d="' + iso(day) + '" aria-label="' + long(day) + '">' + d + "</button>";
      }
      var prevOk = new Date(view.getFullYear(), view.getMonth(), 0) >= today, nextOk = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= last;
      dates.innerHTML = '<div class="ftc-head"><button type="button" class="ftc-nav" data-n="-1" aria-label="Previous month"' + (prevOk ? "" : " disabled") + ">" + L + "</button>" +
        '<b class="ftc-mon">' + MONTHS[view.getMonth()] + " " + view.getFullYear() + '</b><button type="button" class="ftc-nav" data-n="1" aria-label="Next month"' + (nextOk ? "" : " disabled") + ">" + R + "</button></div>" +
        '<div class="ftc-dow">' + DOW.map(function (x) { return "<span>" + x + "</span>"; }).join("") + '</div><div class="ftc-grid">' + h + "</div>";
    }
    function renderWeek() {
      var h = "";
      for (var i = 0; i < 5; i++) {
        var day = add(week, i);
        h += '<button type="button" class="ftc-card' + (same(day, pick.date) ? " is-on" : "") + '"' + (ok(day) ? "" : " disabled") + ' data-d="' + iso(day) + '" aria-label="' + long(day) + '">' +
          "<small>" + day.toLocaleDateString("en-AU", { weekday: "short" }) + "</small><b>" + day.getDate() + "</b><small>" + day.toLocaleDateString("en-AU", { month: "short" }) + "</small></button>";
      }
      var end = add(week, 4);
      var prevOk = add(week, -1) >= today, nextOk = add(week, 7) <= last;
      dates.innerHTML = '<div class="ftc-lab">Pick a day</div><div class="ftc-strip"><button type="button" class="ftc-nav" data-w="-1" aria-label="Previous week"' + (prevOk ? "" : " disabled") + ">" + L + "</button>" +
        '<div class="ftc-cards">' + h + '</div><button type="button" class="ftc-nav" data-w="1" aria-label="Next week"' + (nextOk ? "" : " disabled") + ">" + R + "</button></div>" +
        '<p class="ftc-wk">' + week.getDate() + " " + MONTHS[week.getMonth()].slice(0, 3) + " to " + end.getDate() + " " + MONTHS[end.getMonth()].slice(0, 3) + "</p>";
    }
    function renderSum() {
      var t = pick.date ? "<b>" + long(pick.date) + "</b>" + (pick.time ? " at <b>" + pick.time + "</b>" : ", now pick a time") : "Choose a day, then a time.";
      sum.innerHTML = t;
      if (onChange) onChange(pick.date ? long(pick.date) + (pick.time ? " at " + pick.time : "") : "Choose a day and time");
      hd.value = pick.date ? iso(pick.date) : ""; ht.value = pick.time;
      if (fieldT) { fieldT.textContent = pick.date && pick.time ? short(pick.date) + ", " + pick.time : "Preferred day and time*"; field.classList.toggle("has", !!(pick.date && pick.time)); }
      slot.classList.toggle("is-err", false);
    }
    function render() { if (v === "c") renderWeek(); else renderMonth(); renderTimes(); renderSum(); }
    render();

    root.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || !root.contains(b)) return;
      if (b === field) { setOpen(main.hidden); return; }
      if (b.dataset.n) { view = new Date(view.getFullYear(), view.getMonth() + (+b.dataset.n), 1); render(); return; }
      if (b.dataset.w) { week = add(week, 7 * (+b.dataset.w)); render(); return; }
      if (b.dataset.d) { var p = b.dataset.d.split("-"); pick.date = new Date(+p[0], +p[1] - 1, +p[2]); render(); return; }
      if (b.dataset.t) { pick.time = b.dataset.t; render(); if (v === "b" && pick.date) setTimeout(function () { setOpen(false); }, 260); }
    });
    function setOpen(o) {
      if (v !== "b") return;
      main.hidden = !o; field.setAttribute("aria-expanded", String(o));
    }
    if (v === "b") {
      document.addEventListener("click", function (e) { if (!main.hidden && !root.contains(e.target)) setOpen(false); });
      root.addEventListener("keydown", function (e) { if (e.key === "Escape" && !main.hidden) { e.stopPropagation(); setOpen(false); field.focus(); } });
    }
    slot._ok = function () { var good = !!(pick.date && pick.time); slot.classList.toggle("is-err", !good); if (!good && v === "b") setOpen(true); return good; };
  }

  /* the sample's own switcher (not part of the pop-up) */
  function bar(v) {
    var el = document.createElement("div"); el.className = "ftc-bar";
    var sv = (new URLSearchParams(location.search).get("slider") || "1");
    el.innerHTML = "<b>Date picker</b>" + [["a", "A  Month and times"], ["b", "B  One field, pop-over"], ["c", "C  Week strip"]].map(function (x) {
      return '<a class="' + (x[0] === v ? "is-cur" : "") + '" href="?cal=' + x[0] + '#factory-tour">' + x[1] + "</a>"; }).join("") +
      (v === "c" ? '<span class="ftc-sep"></span><b>Slider</b>' + [["1", "1  Bubble"], ["2", "2  Ruler"], ["3", "3  Pill"]].map(function (x) {
        return '<a class="' + (x[0] === sv ? "is-cur" : "") + '" href="?cal=c&slider=' + x[0] + '#factory-tour">' + x[1] + "</a>"; }).join("") : "<i>times are placeholders</i>");
    document.body.appendChild(el);
  }
  window.WLFtCal = { mount: mount, bar: bar };
})();
