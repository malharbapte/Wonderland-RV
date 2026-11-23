/* SAMPLE ONLY: phone-fit options for thank-you.html. Builds every 390 x 700 screen from the
   real copy (build steps, path steps, awards) and the real data files (reviews-data.js,
   community-data.js). Plain JS, no libraries. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ copy */
  var BUILD = [
    { n: "01", t: "Chassis &amp; suspension", img: "assets/img/build/chassis-suspension.jpg", alt: "Cruisemaster suspension fitted to a Wonderland chassis in the factory",
      p: "Every van starts with its chassis and Cruisemaster suspension, fitted in our own factory in Campbellfield." },
    { n: "02", t: "Frame &amp; panels", img: "assets/img/build/frame-insulation.jpg", alt: "Insulated aluminium frame with the wiring run through, before the panels go on",
      p: "Insulated aluminium side frames, SPR (self-piercing riveted), with a one-piece composite front, roof and back wall on the XTR, Hornet and Amaroo. Solara goes frameless composite." },
    { n: "03", t: "Cabinetry &amp; fit-out", img: "assets/img/build/cnc-cabinetry.jpg", alt: "CNC router cutting cabinetry panels in the Wonderland factory",
      p: "Cabinetry is CNC cut for a precise, interlocking fit, then the wiring and interior are fitted in the same factory." }
  ];
  var PATH = [
    { k: "Step 01", t: "Your quote", img: "assets/img/experience/step-4.jpg", p: "We put together a quote around the layout and options you want." },
    { k: "Step 02", t: "Your layout", img: "assets/img/experience/opt-layout.jpg", p: "Pick the layout you have been picturing, or let us help you find the one that suits how your family or the two of you travel." },
    { k: "Step 03", t: "Your build", img: "assets/img/experience/step-5.webp", p: "Your van is built at our own factory in Campbellfield." },
    { k: "Step 04", t: "After handover", img: "assets/img/experience/step-1.webp", p: "Delivery isn’t the end of our care. Every van comes with a 5 year structural warranty, a 3 year factory-backed warranty and premium aftersales service." },
    { k: "Then", t: "Your first trip", img: "assets/img/experience/step-6.jpg", p: "Hitch up and go." }
  ];
  var AWARDS = [
    { y: "2023", k: "Caravan of the Year 2023", t: "XTR 2200", d: "Finalist.", img: "assets/img/awards/coty-2023-finalist-xtr-2200.jpg" },
    { y: "2024", k: "Caravan of the Year 2024", t: "XTR 1906", d: "Second place in the couples category.", img: "assets/img/awards/coty-2024-finalist-xtr-1906.jpg" },
    { y: "2024", k: "Caravan of the Year 2024", t: "XTR 2211", d: "Best Overall Caravan, Best Family Caravan and Most Innovative Build.", img: "assets/img/awards/coty-2024-best-overall.jpg" },
    { y: "2026", k: "Caravan of the Year 2026", t: "Solara 20’06", d: "Judges’ Choice Award, The Queen of Hearts.", img: "assets/img/awards/coty-2026-judges-choice.png" }
  ];
  var SECS = { reviews: "Reviews", community: "Community", awards: "Awards", build: "Build" };

  /* ------------------------------------------------------------------ helpers */
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1A73E8"/><path d="M7 12.4l3.3 3.3L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV = '<svg viewBox="0 0 14 8" aria-hidden="true"><path d="M0 0L7 7L14 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function when(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? (+m[3]) + " " + MONTHS[+m[2] - 1] + " " + m[1] : ""; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function stars(n) { n = Math.max(1, Math.min(5, n || 5)); return '<span class="st" aria-label="' + n + ' out of 5 stars">' + "★".repeat(n) + "☆".repeat(5 - n) + "</span>"; }

  var REV = window.WL_REVIEWS || [], COM = window.WL_COMMUNITY || [];
  function rev(name) { for (var i = 0; i < REV.length; i++) if (REV[i].name === name && REV[i].text) return REV[i]; return null; }
  function pickRev(names) { return names.map(rev).filter(Boolean); }
  var CARO = pickRev(["Josh Lowe", "8FeetTravels", "Nick Barnett", "Cassandra Chalk"]);
  var LIST = pickRev(["Matt Kennelly", "Jill De Vos", "Keenan Elliott", "Brent harvey"]);
  function more(used) {   /* next reviews with text, newest first, not already shown */
    var u = used.map(function (r) { return r.name + r.date; });
    return REV.filter(function (r) { return r.text && u.indexOf(r.name + r.date) < 0; });
  }
  var CMIDS = ["cm-05", "cm-10", "cm-11", "cm-32", "cm-12", "cm-13", "cm-40", "cm-24", "cm-30", "cm-42", "cm-47", "cm-48"];
  var CM = CMIDS.map(function (id) { return COM.filter(function (c) { return c.src.indexOf(id + ".") > -1; })[0]; }).filter(Boolean);
  function cmAlt(c) { return "Comment from " + c.name + " on " + c.platform + (c.type === "ambassador" ? " (Wonderland ambassador)" : ""); }

  /* swipe tracks: index from scroll, go to a card, mouse drag so desktop can swipe too */
  function padL(tr) { return parseFloat(getComputedStyle(tr).scrollPaddingLeft) || 0; }
  function idxOf(tr) {
    var best = 0, bd = 1e9, p = padL(tr);
    for (var i = 0; i < tr.children.length; i++) {
      var d = Math.abs(tr.children[i].offsetLeft - p - tr.scrollLeft);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function goTo(tr, i, instant) {
    var k = tr.children[Math.max(0, Math.min(tr.children.length - 1, i))];
    if (k) tr.scrollTo({ left: k.offsetLeft - padL(tr), behavior: instant ? "auto" : "smooth" });
  }
  function track(tr, onIdx) {
    var raf, last = -1;
    function fire() { var i = idxOf(tr); if (i !== last) { last = i; onIdx && onIdx(i); } }
    tr.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(fire); }, { passive: true });
    var sx = 0, sl = 0, down = false, moved = false;
    tr.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; tr.classList.add("drag"); }
      if (moved) tr.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      if (moved) { tr.classList.remove("drag"); goTo(tr, idxOf(tr)); }
    });
    tr.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    return { go: function (i) { goTo(tr, i); }, idx: function () { return idxOf(tr); } };
  }
  function setDots(box, i) { $$("button,span", box).forEach(function (d, k) { d.classList.toggle("on", k === i); }); }
  function dotsHTML(n, plusLast) {
    var h = '<div class="dots" role="tablist">';
    for (var i = 0; i < n; i++) h += '<button type="button" aria-label="Go to ' + (i + 1) + '" class="' + (i === 0 ? "on" : "") + (plusLast && i === n - 1 ? " plus" : "") + '"></button>';
    return h + "</div>";
  }

  /* accordion: one row open at a time; tapping the open row closes it */
  function accordion(root, openFirst) {
    var rows = $$(".acc-i", root);
    rows.forEach(function (row, i) {
      var b = $(".acc-h", row);
      b.setAttribute("aria-expanded", "false");
      b.addEventListener("click", function () {
        var was = row.classList.contains("on");
        rows.forEach(function (r) { r.classList.remove("on"); $(".acc-h", r).setAttribute("aria-expanded", "false"); });
        if (!was) { row.classList.add("on"); b.setAttribute("aria-expanded", "true"); }
      });
      if (openFirst && i === 0) { row.classList.add("on"); b.setAttribute("aria-expanded", "true"); }
    });
  }

  /* heading blocks */
  function hd(h, lede) { return '<div class="hd"><h2 class="h">' + h + "</h2>" + (lede ? '<p class="lede">' + lede + "</p>" : "") + "</div>"; }
  var H_BUILD = "How a Wonderland RV is built";
  var H_PATH = "From our first chat to your first trip";
  var H_REV = "What Wonderland RV <i>owners</i> say";
  var H_COM = "What the <i>Wonderlanders are saying</i>";
  var L_PATH = "We understand buying a caravan is a big decision, so here is the whole path, so nothing comes as a surprise.";
  var L_REV = "Instead of us telling you, see what our Wonderlanders say about their journey with us.";
  var L_COM = "Comments from our owners and ambassadors on social, from the road.";

  /* ------------------------------------------------------------------ review pieces */
  function avatar(r, cls) {
    return r.photo ? '<img class="av ' + (cls || "") + '" src="' + esc(r.photo) + '" alt="" loading="lazy">'
      : '<span class="av ' + (cls || "") + '" style="display:flex;align-items:center;justify-content:center;background:#C03E12;color:#fff;font-weight:700">' + esc((r.name || "?").charAt(0).toUpperCase()) + "</span>";
  }
  function flat(t) { return String(t).replace(/\s*\n+\s*/g, " "); }
  function longish(r, n) { return flat(r.text).length > (n || 150); }
  function reviewCard(r, i, o) {
    o = o || {};
    var ph = !o.nophoto && r.images && r.images.length ? '<div class="rv-ph"><img src="' + esc(r.images[0]) + '" alt="Photo posted with the review" loading="lazy"></div>' : "";
    return '<article class="rv' + (ph ? "" : " noph") + (o.compact ? " rv--c" : "") + '" data-i="' + i + '">' +
      '<div class="rv-top">' + avatar(r) + '<div class="who"><b>' + esc(r.name) + "</b>" + stars(r.stars) + "</div></div>" + ph +
      '<p class="rv-q">&ldquo;' + esc(flat(r.text)) + "&rdquo;</p>" +
      (longish(r, o.compact ? 110 : 150) ? '<button type="button" class="rv-more" data-i="' + i + '">Read more</button>' : "") +
      '<div class="rv-foot"><span>' + when(r.date) + '</span><span class="vr">Verified review' + TICK + "</span></div></article>";
  }

  /* bottom sheet for "Read more", lives inside the screen */
  function sheet(scr) {
    var el = document.createElement("div");
    el.className = "shx";
    el.innerHTML = '<div class="shx-sc"></div><div class="shx-bx" role="dialog" aria-label="Full review"><button type="button" class="shx-x" aria-label="Close">&times;</button>' +
      '<div class="shx-hd"></div><div class="shx-tx"></div><div class="shx-ft"></div></div>';
    scr.appendChild(el);
    function close() { el.classList.remove("open"); }
    $(".shx-sc", el).addEventListener("click", close);
    $(".shx-x", el).addEventListener("click", close);
    return {
      open: function (r) {
        $(".shx-hd", el).innerHTML = avatar(r) + '<div class="who"><b>' + esc(r.name) + "</b>" + stars(r.stars) + "</div>";
        $(".shx-tx", el).innerHTML = String(r.text).split(/\n+/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
        $(".shx-tx", el).scrollTop = 0;
        $(".shx-ft", el).innerHTML = "<span>" + when(r.date) + '</span><span class="vr">Verified review' + TICK + "</span>";
        el.classList.add("open");
      }, close: close
    };
  }
  function wireMore(scr, getList) {
    var sh = sheet(scr);
    scr.addEventListener("click", function (e) {
      var b = e.target.closest(".rv-more");
      if (!b) return;
      var r = getList()[+b.dataset.i];
      if (r) sh.open(r);
    });
    return sh;
  }

  /* lightbox for the community screenshots, lives inside the screen */
  function lightbox(scr, items) {
    var el = document.createElement("div"), cur = 0;
    el.className = "lb";
    el.innerHTML = '<div class="lb-top"><span class="cnt"></span><button type="button" class="lb-x" aria-label="Close">&times;</button></div><div class="lb-st"><img alt=""></div>' +
      '<div class="lb-bt"><button type="button" class="ar" aria-label="Previous"></button><div class="meta"></div><button type="button" class="ar ar--r" aria-label="Next"></button></div>';
    scr.appendChild(el);
    var im = $("img", el), prev = $(".ar", el), next = $(".ar--r", el);
    function show(i) {
      cur = Math.max(0, Math.min(items().length - 1, i)); var c = items()[cur];
      im.src = c.src; im.alt = cmAlt(c);
      $(".cnt", el).innerHTML = (cur + 1) + ' <em>/ ' + items().length + "</em>";
      $(".meta", el).innerHTML = "<b>" + esc(c.name) + "</b>" + esc(c.platform) + " &middot; " + when(c.date) + (c.type === "ambassador" ? ' <span class="tag">Ambassador</span>' : "");
      prev.disabled = cur === 0; next.disabled = cur === items().length - 1;
      $(".lb-st", el).scrollTop = 0;
    }
    prev.addEventListener("click", function () { show(cur - 1); });
    next.addEventListener("click", function () { show(cur + 1); });
    $(".lb-x", el).addEventListener("click", function () { el.classList.remove("open"); });
    return { open: function (i) { show(i); el.classList.add("open"); } };
  }
  function thumb(c, i, withTag) {
    return '<button type="button" class="cmt" data-i="' + i + '" aria-label="Open comment from ' + esc(c.name) + '"><img src="' + esc(c.src) + '" alt="' + esc(cmAlt(c)) + '" loading="lazy"><span>' + esc(c.platform === "Facebook group" ? "Facebook" : c.platform) + (withTag && c.type === "ambassador" ? " &middot; Ambassador" : "") + "</span></button>";
  }

  /* ------------------------------------------------------------------ the frames */
  var F = {};

  /* 1A accordion */
  F["1a"] = function (s) {
    s.innerHTML = hd(H_BUILD) + '<div class="bd"><div class="acc">' + BUILD.map(function (b) {
      return '<div class="acc-i"><button type="button" class="acc-h"><span class="n">' + b.n + '</span><span class="t">' + b.t + '</span><span class="cv"></span></button>' +
        '<div class="acc-p"><div class="acc-pi"><div class="acc-b"><div class="pic"><img src="' + b.img + '" alt="' + esc(b.alt) + '" loading="lazy"></div><p class="cp">' + b.p + "</p></div></div></div></div>";
    }).join("") + "</div></div>";
    accordion($(".acc", s), true);
  };

  /* 1B tabs, swipeable */
  F["1b"] = function (s) {
    s.innerHTML = hd(H_BUILD) + '<div class="bd" style="padding-top:18px"><div class="pills" role="tablist">' +
      BUILD.map(function (b, i) { return '<button type="button" role="tab" class="pill' + (i ? "" : " on") + '" aria-selected="' + (i ? "false" : "true") + '">' + b.n + "</button>"; }).join("") + "</div></div>" +
      '<div class="trk" style="margin-top:16px">' + BUILD.map(function (b) {
        return '<div class="sl"><div class="pic"><img src="' + b.img + '" alt="' + esc(b.alt) + '" loading="lazy"></div><h3 class="t">' + b.t + '</h3><p class="cp">' + b.p + "</p></div>";
      }).join("") + "</div>";
    var pills = $$(".pill", s), tr = $(".trk", s);
    var T = track(tr, function (i) { pills.forEach(function (p, k) { p.classList.toggle("on", k === i); p.setAttribute("aria-selected", k === i); }); });
    pills.forEach(function (p, i) { p.addEventListener("click", function () { T.go(i); }); });
  };

  /* 1C swipe cards */
  F["1c"] = function (s) {
    s.innerHTML = hd(H_BUILD) + '<div class="trk cds" style="margin-top:20px">' + BUILD.map(function (b) {
      return '<article class="cd"><div class="pic"><img src="' + b.img + '" alt="' + esc(b.alt) + '" loading="lazy"></div><div class="cd-b"><span class="n">' + b.n + '</span><h3 class="t">' + b.t + '</h3><p class="cp">' + b.p + "</p></div></article>";
    }).join("") + "</div>" + '<div style="padding-top:18px" id="d1c">' + dotsHTML(3) + "</div>";
    var d = $("#d1c", s), T = track($(".trk", s), function (i) { setDots(d, i); });
    $$("button", d).forEach(function (b, i) { b.addEventListener("click", function () { T.go(i); }); });
  };

  /* 2A path, picture on top */
  F["2a"] = function (s) {
    s.innerHTML = hd(H_PATH, L_PATH) + '<div class="bd" style="padding-top:16px"><div class="pk-pic">' +
      PATH.map(function (p, i) { return '<img src="' + p.img + '" alt="" class="' + (i ? "" : "on") + '">'; }).join("") + '</div><div class="chips" role="tablist" aria-label="Steps">' +
      PATH.map(function (p, i) { return '<button type="button" role="tab" class="chip' + (i ? "" : " on") + '" aria-label="' + p.k + ": " + p.t + '" aria-selected="' + (i ? "false" : "true") + '">' + (i + 1) + "</button>"; }).join("") +
      '</div><div class="pk-cap" aria-live="polite"></div></div>';
    var imgs = $$(".pk-pic img", s), chips = $$(".chip", s), cap = $(".pk-cap", s);
    function set(i) {
      imgs.forEach(function (m, k) { m.classList.toggle("on", k === i); });
      chips.forEach(function (c, k) { c.classList.toggle("on", k === i); c.setAttribute("aria-selected", k === i); });
      cap.innerHTML = '<span class="k">' + PATH[i].k + '</span><h3 class="t">' + PATH[i].t + '</h3><p class="cp">' + PATH[i].p + "</p>";
    }
    chips.forEach(function (c, i) { c.addEventListener("click", function () { set(i); }); });
    set(0);
  };

  /* 2B path, compact accordion */
  F["2b"] = function (s) {
    s.innerHTML = hd(H_PATH, L_PATH) + '<div class="bd"><div class="acc" style="gap:6px">' + PATH.map(function (p, i) {
      return '<div class="acc-i"><button type="button" class="acc-h" style="height:50px"><span class="n">0' + (i + 1) + '</span><span class="t">' + p.t + '</span><span class="cv"></span></button>' +
        '<div class="acc-p"><div class="acc-pi"><div class="acc-b" style="padding-bottom:12px;display:flex;gap:12px;align-items:flex-start"><div class="pic" style="width:122px;aspect-ratio:4/3;margin:0;flex:none"><img src="' + p.img + '" alt="" loading="lazy"></div><p class="cp" style="padding:0;font-size:13.5px;line-height:20px">' + p.p + "</p></div></div></div></div>";
    }).join("") + "</div></div>";
    accordion($(".acc", s), true);
  };

  /* 2C reviews: swipe one at a time */
  F["2c"] = function (s) {
    var list = CARO.slice(), pool = more(list);
    s.innerHTML = hd(H_REV) + '<div class="trk rvc" style="margin-top:16px"></div><div class="foot-col"><span class="cnt" id="c2c"></span><div id="d2c"></div></div>';
    var tr = $(".trk", s), cnt = $("#c2c", s), dz = $("#d2c", s), T;
    var sh = wireMore(s, function () { return list; });
    function build() {
      var cur = T ? T.idx() : 0;
      tr.innerHTML = list.map(function (r, i) { return reviewCard(r, i); }).join("") +
        (pool.length ? '<div class="lm"><h3 class="t">There are more<br>owner reviews</h3><p class="cp">Real Google reviews, word for word.</p><button type="button" class="btn" id="lm2c">Load more reviews ' + CHEV + "</button></div>" : "");
      dz.innerHTML = dotsHTML(list.length + (pool.length ? 1 : 0), !!pool.length);
      $$("button", dz).forEach(function (b, i) { b.addEventListener("click", function () { T.go(i); }); });
      var lm = $("#lm2c", s);
      if (lm) lm.addEventListener("click", function () {
        var at = list.length; list = list.concat(pool.splice(0, 4)); build(); setTimeout(function () { T.go(at); }, 30);
      });
      upd(cur); goTo(tr, cur, true);
    }
    function upd(i) {
      setDots(dz, i);
      cnt.innerHTML = Math.min(i + 1, list.length) + " <em>/ " + list.length + "</em>";
    }
    T = track(tr, upd);
    build();
  };

  /* 2D reviews: compact accordion list */
  F["2d"] = function (s) {
    var list = LIST.slice(), pool = more(list);
    s.innerHTML = hd(H_REV) + '<div class="rva-list grow"><div class="acc rva"></div></div><div class="foot-col" style="padding-bottom:18px"><button type="button" class="btn btn--o" id="lm2d">Load more reviews ' + CHEV + "</button></div>";
    var acc = $(".acc", s), box = $(".rva-list", s), lm = $("#lm2d", s);
    wireMore(s, function () { return list; });
    function row(r, i) {
      return '<div class="acc-i"><button type="button" class="acc-h">' + avatar(r, "av--s") + '<span class="who"><b>' + esc(r.name) + "</b>" + stars(r.stars) + '</span><span class="cv"></span></button>' +
        '<div class="acc-p"><div class="acc-pi"><div class="rva-b"><p class="rv-q">&ldquo;' + esc(flat(r.text)) + "&rdquo;</p>" +
        (longish(r, 190) ? '<button type="button" class="rv-more" data-i="' + i + '">Read more</button>' : "") +
        '<div class="rv-foot rv-ft"><span>' + when(r.date) + '</span><span class="vr">Verified review' + TICK + "</span></div></div></div></div></div>";
    }
    function build() {
      var open = $$(".acc-i", acc).map(function (r) { return r.classList.contains("on"); });
      acc.innerHTML = list.map(row).join("");
      accordion(acc, false);
      var rows = $$(".acc-i", acc);
      (open.indexOf(true) < 0 ? [0] : [open.indexOf(true)]).forEach(function (i) { if (rows[i]) { rows[i].classList.add("on"); $(".acc-h", rows[i]).setAttribute("aria-expanded", "true"); } });
      lm.hidden = !pool.length;
    }
    lm.addEventListener("click", function () {
      list = list.concat(pool.splice(0, 4)); build(); box.classList.add("scrolls");
      var rows = $$(".acc-i", acc); box.scrollTo({ top: rows[list.length - 4].offsetTop - 8, behavior: "smooth" });
    });
    build();
  };

  /* 2E community grid + lightbox */
  F["2e"] = function (s) {
    var shown = 6;
    s.innerHTML = hd(H_COM) + '<div class="cmw grow"><div class="cmg"></div></div><div class="foot-col" style="padding-bottom:18px"><button type="button" class="btn btn--o" id="lm2e">Load more ' + CHEV + "</button></div>";
    var g = $(".cmg", s), lm = $("#lm2e", s), box = $(".cmw", s);
    var lb = lightbox(s, function () { return CM; });
    function build() { g.innerHTML = CM.slice(0, shown).map(function (c, i) { return thumb(c, i); }).join(""); lm.hidden = shown >= CM.length; }
    g.addEventListener("click", function (e) { var b = e.target.closest(".cmt"); if (b) lb.open(+b.dataset.i); });
    lm.addEventListener("click", function () { var at = shown; shown = Math.min(CM.length, shown + 6); build(); box.scrollTo({ top: g.children[at].offsetTop - 4, behavior: "smooth" }); });
    build();
  };

  /* 2F community carousel */
  F["2f"] = function (s) {
    s.innerHTML = hd(H_COM, L_COM) + '<div class="trk cmc" style="margin-top:16px">' + CM.map(function (c) {
      return '<div class="cs"><div class="cs-im"><img src="' + esc(c.src) + '" alt="' + esc(cmAlt(c)) + '" loading="lazy"></div><div class="cs-m"><span><b>' + esc(c.name) + "</b>" + (c.type === "ambassador" ? ' <span class="tag">Ambassador</span>' : "") + "</span><span>" + esc(c.platform) + " &middot; " + when(c.date) + "</span></div></div>";
    }).join("") + '</div><div class="cm-nav"><button type="button" class="ar" aria-label="Previous"></button><span class="cnt" id="c2f"></span><button type="button" class="ar ar--r" aria-label="Next"></button></div>';
    var tr = $(".trk", s), cnt = $("#c2f", s), pv = $(".ar", s), nx = $(".ar--r", s);
    var T = track(tr, upd);
    function upd(i) { cnt.innerHTML = (i + 1) + " <em>/ " + CM.length + "</em>"; pv.disabled = i === 0; nx.disabled = i === CM.length - 1; }
    pv.addEventListener("click", function () { T.go(T.idx() - 1); });
    nx.addEventListener("click", function () { T.go(T.idx() + 1); });
    upd(0);
  };

  /* ---------------- group 3: section bars ---------------- */
  function barContent(key, scr) {
    var el = document.createElement("div");
    if (key === "reviews") {
      var l = CARO;
      el.innerHTML = '<div class="trk rvc">' + l.map(function (r, i) { return reviewCard(r, i, { compact: true, nophoto: true }); }).join("") + "</div>" + dotsHTML(l.length) +
        '<a class="sb-link" href="#" onclick="return false">Read all reviews</a>';
      var d = $(".dots", el), T = track($(".trk", el), function (i) { setDots(d, i); });
      $$("button", d).forEach(function (b, i) { b.addEventListener("click", function () { T.go(i); }); });
    } else if (key === "community") {
      el.innerHTML = '<div class="mini-g">' + CM.slice(0, 4).map(function (c, i) { return thumb(c, i, true); }).join("") + '</div><a class="sb-link" href="#" onclick="return false">Read all comments</a>';
      el.addEventListener("click", function (e) { var b = e.target.closest(".cmt"); if (b) scr._lb.open(+b.dataset.i); });
    } else if (key === "awards") {
      el.innerHTML = '<div class="aw">' + AWARDS.map(function (a, i) {
        return '<button type="button" class="' + (i === 2 ? "on" : "") + '" aria-pressed="' + (i === 2) + '"><span class="yr">' + a.y + '</span><span class="rb"><img src="' + a.img + '" alt="" loading="lazy"></span></button>';
      }).join("") + '</div><div class="aw-i" aria-live="polite"></div>';
      var info = $(".aw-i", el), bs = $$(".aw button", el);
      var set = function (i) { bs.forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", k === i); }); info.innerHTML = '<span class="k">' + AWARDS[i].k + "</span><b>" + AWARDS[i].t + "</b><p>" + AWARDS[i].d + "</p>"; };
      bs.forEach(function (b, i) { b.addEventListener("click", function () { set(i); }); });
      set(2);
    } else {
      el.innerHTML = '<div class="pic bq-ph"><img alt="" loading="lazy"></div><div class="bq-s">' + BUILD.map(function (b, i) { return '<button type="button" class="' + (i ? "" : "on") + '">' + b.n + "</button>"; }).join("") + '</div><div class="bq-t"></div>';
      var im = $("img", el), tx = $(".bq-t", el), pb = $$(".bq-s button", el);
      var sb = function (i) { pb.forEach(function (b, k) { b.classList.toggle("on", k === i); }); im.src = BUILD[i].img; im.alt = BUILD[i].alt; tx.innerHTML = '<h3 class="t">' + BUILD[i].t + '</h3><p class="cp">' + BUILD[i].p + "</p>"; };
      pb.forEach(function (b, i) { b.addEventListener("click", function () { sb(i); }); });
      sb(0);
    }
    return el;
  }
  var BARS = [
    { k: "reviews", n: "01", t: "Owner reviews", s: "Real Google reviews from Wonderlanders" },
    { k: "community", n: "02", t: "Community", s: "What the Wonderlanders say, from the road" },
    { k: "awards", n: "03", t: "Awards", s: "Caravan of the Year, 2023 to 2026" },
    { k: "build", n: "04", t: "How it&rsquo;s built", s: "Three steps in our own factory" }
  ];
  function bars(s, dark) {
    s.innerHTML = '<div class="sbs' + (dark ? " sbs--b" : "") + '"></div>';
    var wrap = $(".sbs", s);
    s._lb = lightbox(s, function () { return CM; });
    sheet(s);
    var els = BARS.map(function (b, i) {
      var el = document.createElement("section");
      el.className = "sb" + (dark && i % 2 === 0 ? " sb--dk" : "") + (i === 0 ? " on" : "");
      el.innerHTML = '<button type="button" class="sb-h" aria-expanded="' + (i === 0) + '"><span class="n">' + b.n + '</span><span class="sb-tt"><b>' + b.t + "</b><span>" + b.s + '</span></span><span class="cv"></span></button><div class="sb-p"></div>';
      $(".sb-p", el).appendChild(barContent(b.k, s));
      $(".sb-p", el).firstChild.style.cssText = "display:flex;flex-direction:column;flex:1;min-height:0";
      wrap.appendChild(el);
      $(".sb-h", el).addEventListener("click", function () {
        var was = el.classList.contains("on");
        els.forEach(function (x) { x.classList.remove("on"); $(".sb-h", x).setAttribute("aria-expanded", "false"); });
        if (!was) { el.classList.add("on"); $(".sb-h", el).setAttribute("aria-expanded", "true"); }
      });
      return el;
    });
  }
  F["3a"] = function (s) { bars(s, false); };
  F["3b"] = function (s) { bars(s, true); };

  /* ---------------- group 4: where am I ---------------- */
  var SEC_N = 9;
  function secPath() {
    return '<h2 class="h">' + H_PATH + '</h2><p class="lede">' + L_PATH + '</p><div class="pk-pic"><img src="' + PATH[0].img + '" alt="" class="on"></div><div class="pk-cap" style="margin-top:14px"><span class="k">' + PATH[0].k + '</span><h3 class="t">' + PATH[0].t + '</h3><p class="cp">' + PATH[0].p + "</p></div>";
  }
  function secRev() {
    var l = CARO.slice(0, 2);
    return '<h2 class="h">' + H_REV + '</h2><p class="lede">' + L_REV + '</p><div class="stack">' + l.map(function (r, i) { return reviewCard(r, i, { compact: true, nophoto: true }); }).join("") + '</div><button type="button" class="btn btn--o">Load more ' + CHEV + "</button>";
  }
  function secBuild() {
    return '<h2 class="h">' + H_BUILD + '</h2><div class="stack">' + BUILD.map(function (b) {
      return '<article class="bcard"><div class="pic"><img src="' + b.img + '" alt="' + esc(b.alt) + '" loading="lazy"></div><div class="cd-b"><span class="n">' + b.n + '</span><h3 class="t">' + b.t + '</h3><p class="cp">' + b.p + "</p></div></article>";
    }).join("") + "</div>";
  }
  function secAwards() {
    return '<h2 class="h">Awards &amp; achievements</h2><p class="lede">Recognised by the Caravan of the Year judges.</p><div class="aw">' + AWARDS.map(function (a) {
      return '<button type="button"><span class="yr">' + a.y + '</span><span class="rb"><img src="' + a.img + '" alt="" loading="lazy"></span></button>';
    }).join("") + '</div><div class="aw-i" style="margin-top:14px"><span class="k">' + AWARDS[2].k + "</span><b>" + AWARDS[2].t + "</b><p>" + AWARDS[2].d + "</p></div>";
  }
  var SEQ = [
    { n: 2, name: "Path", html: secPath },
    { n: 3, name: "Reviews", html: secRev },
    { n: 4, name: "Build", html: secBuild },
    { n: 6, name: "Awards", html: secAwards }
  ];
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function scrollToJoint(sc) {   /* open with the Reviews / Build joint about 40% down the screen */
    var j = $('[data-n="4"]', sc);
    if (j) sc.scrollTop = j.offsetTop - Math.round(sc.clientHeight * 0.42);
  }

  F["4a"] = function (s) {
    var bg = ["s-w", "s-g", "s-d", "s-w"];
    s.innerHTML = '<div class="sc sc--a">' + SEQ.map(function (q, i) {
      return '<section class="sec ' + bg[i] + '" data-n="' + q.n + '"><span class="kick">' + pad2(q.n) + ' <em>/ ' + pad2(SEC_N) + "</em> &middot; " + q.name + "</span>" + q.html() + "</section>";
    }).join("") + "</div>";
    var sc = $(".sc", s); wireMore(s, function () { return CARO; });
    requestAnimationFrame(function () { scrollToJoint(sc); });
    window.addEventListener("load", function () { scrollToJoint(sc); });
  };

  F["4b"] = function (s) {
    s.innerHTML = '<div class="mh"><img src="assets/img/wonderland-rv-logo.png" alt="Wonderland RV"><i></i></div><div class="sc sc--b"><div class="cur"><span class="cur-n"><b></b><span></span></span><span class="cur-c"></span><span class="cur-l"></span></div>' +
      SEQ.map(function (q) { return '<section class="sec" data-n="' + q.n + '" data-name="' + q.name + '">' + q.html() + "</section>"; }).join("") + "</div>";
    var sc = $(".sc", s), nm = $(".cur-n span", s), nb = $(".cur-n b", s), cc = $(".cur-c", s), ln = $(".cur-l", s);
    wireMore(s, function () { return CARO; });
    function set(sec) { nb.textContent = pad2(+sec.dataset.n); nm.textContent = sec.dataset.name; cc.textContent = pad2(+sec.dataset.n) + " / " + pad2(SEC_N); }
    function prog() { var m = sc.scrollHeight - sc.clientHeight; ln.style.width = (m > 0 ? sc.scrollTop / m * 100 : 0) + "%"; }
    var secs = $$(".sec", sc), vis = {};
    if ("IntersectionObserver" in window) {
      /* a section is "current" while it crosses the line just under the sticky bar */
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vis[e.target.dataset.n] = e.isIntersecting; });
        for (var i = 0; i < secs.length; i++) if (vis[secs[i].dataset.n]) { set(secs[i]); break; }
      }, { root: sc, rootMargin: "-40px 0px -" + (sc.clientHeight - 80) + "px 0px", threshold: 0 });
      secs.forEach(function (x) { io.observe(x); });
    }
    sc.addEventListener("scroll", prog, { passive: true });
    set(secs[0]);
    function start() { scrollToJoint(sc); prog(); }
    requestAnimationFrame(start); window.addEventListener("load", start);
  };

  F["4c"] = function (s) {
    s.innerHTML = '<div class="sc sc--c">' + SEQ.map(function (q, i) {
      var band = i === 0 ? "" : '<div class="band"><div class="band-n">' + pad2(q.n) + '<em>/ ' + pad2(SEC_N) + '</em></div><div class="band-t">' + q.name + '</div><div class="band-r"></div></div>';
      return band + '<section class="sec" data-n="' + q.n + '">' + q.html() + "</section>";
    }).join("") + "</div>";
    var sc = $(".sc", s); wireMore(s, function () { return CARO; });
    function start() { var j = $('[data-n="4"]', sc); sc.scrollTop = j.offsetTop - j.previousElementSibling.offsetHeight - Math.round(sc.clientHeight * 0.3); }
    requestAnimationFrame(start); window.addEventListener("load", start);
  };

  /* ------------------------------------------------------------------ go */
  $$(".scr[data-f]").forEach(function (s) { var f = F[s.dataset.f]; if (f) f(s); });
})();
