/* Factory tour pop-up: the day and time pickers. A week strip (Monday to Friday, earliest day tomorrow, about three months ahead)
   and a pill slider for the time (every 15 minutes, 9:00 am to 3:00 pm; the tour times are placeholders until the real ones are set).
   factory-tour-popup.js mounts it into .ftc-slot. It writes two hidden fields, "date" (yyyy-mm-dd) and "time", so the form posts them. */
(function () {
  "use strict";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>', R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  var T0 = 9 * 60, T1 = 15 * 60, STEP = 15;

  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function add(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function same(a, b) { return a && b && iso(a) === iso(b); }
  function long(d) { return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }); }
  function mondayOf(d) { return add(d, -((d.getDay() + 6) % 7)); }
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am", h12 = h % 12 === 0 ? 12 : h % 12; return h12 + ":" + ("0" + mm).slice(-2) + " " + ap; }

  function mount(slot, onChange) {
    var today = midnight(new Date()), min = add(today, 1);
    while (min.getDay() === 0 || min.getDay() === 6) min = add(min, 1);
    var last = add(today, 92), week = mondayOf(min), pick = { date: null, time: "" }, touched = false;
    var ok = function (d) { return d >= min && d <= last && d.getDay() !== 0 && d.getDay() !== 6; };

    var ticks = "", labels = "", n = (T1 - T0) / STEP;
    for (var i = 0; i <= n; i++) {
      var pc = i / n * 100, m = T0 + i * STEP;
      if (m % 60 === 0) {
        ticks += '<i class="ftc-tick" style="left:' + pc + '%"></i>';
        var h = m / 60, h12 = h % 12 === 0 ? 12 : h % 12;
        labels += '<span style="left:' + pc + '%">' + h12 + "<small>" + (h >= 12 ? "pm" : "am") + "</small></span>";
      }
    }
    slot.innerHTML = '<div class="ftc">' +
      '<input type="hidden" name="date"><input type="hidden" name="time">' +
      '<div class="ftc-dates"></div>' +
      '<div class="ftc-times"><div class="ftc-tl"><p class="ftc-lab">Pick a time</p><span class="ftc-hint">Drag to choose</span></div>' +
        '<div class="ftc-rng"><div class="ftc-rail"><span class="ftc-fill"></span>' + ticks + '</div><div class="ftc-bub"></div>' +
        '<input class="ftc-range" type="range" min="' + T0 + '" max="' + T1 + '" step="' + STEP + '" value="' + T0 + '" aria-label="Preferred time">' +
        '<div class="ftc-marks">' + labels + "</div></div></div>" +
      '<p class="ftc-err">Please choose a day and a time.</p></div>';
    var root = slot.querySelector(".ftc"), dates = root.querySelector(".ftc-dates"), box = root.querySelector(".ftc-rng"),
        slider = root.querySelector(".ftc-range"), fill = root.querySelector(".ftc-fill"), bub = root.querySelector(".ftc-bub"),
        hint = root.querySelector(".ftc-hint"), hd = root.querySelector('input[name="date"]'), ht = root.querySelector('input[name="time"]');

    function renderWeek() {
      var h = "";
      for (var i = 0; i < 5; i++) {
        var day = add(week, i);
        h += '<button type="button" class="ftc-card' + (same(day, pick.date) ? " is-on" : "") + '"' + (ok(day) ? "" : " disabled") + ' data-d="' + iso(day) + '" aria-label="' + long(day) + '">' +
          "<small>" + day.toLocaleDateString("en-AU", { weekday: "short" }) + "</small><b>" + day.getDate() + "</b><small>" + day.toLocaleDateString("en-AU", { month: "short" }) + "</small></button>";
      }
      var end = add(week, 4);
      dates.innerHTML = '<p class="ftc-lab">Pick a day</p><div class="ftc-strip"><button type="button" class="ftc-nav" data-w="-1" aria-label="Previous week"' + (add(week, -1) >= today ? "" : " disabled") + ">" + L + "</button>" +
        '<div class="ftc-cards">' + h + '</div><button type="button" class="ftc-nav" data-w="1" aria-label="Next week"' + (add(week, 7) <= last ? "" : " disabled") + ">" + R + "</button></div>" +
        '<p class="ftc-wk">' + week.getDate() + " " + MONTHS[week.getMonth()].slice(0, 3) + " to " + end.getDate() + " " + MONTHS[end.getMonth()].slice(0, 3) + "</p>";
    }
    function syncSlider() {
      var v = +slider.value, pc = (v - T0) / (T1 - T0) * 100;
      box.style.setProperty("--p", pc + "%"); fill.style.width = pc + "%";
      box.classList.toggle("is-set", touched); slider.classList.toggle("is-set", touched);
      bub.textContent = fmt(v); hint.hidden = touched;
    }
    function report() {
      hd.value = pick.date ? iso(pick.date) : ""; ht.value = pick.time;
      slot.classList.remove("is-err");
      if (onChange) onChange(pick.date ? long(pick.date) + (pick.time ? " at " + pick.time : "") : "Choose a day and time");
    }
    renderWeek(); syncSlider(); report();

    dates.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.w) { week = add(week, 7 * (+b.dataset.w)); renderWeek(); return; }
      if (b.dataset.d) { var p = b.dataset.d.split("-"); pick.date = new Date(+p[0], +p[1] - 1, +p[2]); renderWeek(); report(); }
    });
    slider.addEventListener("input", function () { touched = true; pick.time = fmt(+slider.value); syncSlider(); report(); });
    slot._ok = function () { var good = !!(pick.date && pick.time); slot.classList.toggle("is-err", !good); return good; };
  }
  window.WLFtCal = { mount: mount };
})();
