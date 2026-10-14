/* Build your Caravan: the app. ONE page for the whole journey. The header (logo, road, van), the back chevron and the Next circle stay put;
   only the heading and the step beneath them change, with a short slide, so there is never a page load between steps.
   The next step's pictures are fetched before the move, so nothing pops in late.

   Steps (assets/css/build-app.css holds each step's styles, scoped to .s1 ... .s6):
     1 Layout   2 Size   3 Model   4 Bed   5 Floorplan   6 Details

   Previews:  ?step=bed|plan|...   ?couples|family   ?compact|mid|spacious   ?m=xtr|solara|hornet|amaroo   ?bed=queen-dual-table
              ?s5=list|hero|bleed|grid   (four layouts of the floorplan step)   ?guides   ?pm=800 (van journey time)
   Depends on: assets/js/build-data.js (live prices and plans), assets/js/build-progress.js (the road). All px, no rem. */
(function () {
  "use strict";
  var Q = location.search;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return "$" + Math.round(n).toLocaleString("en-AU"); };
  var nowrap = function (s) { return '<span style="white-space:nowrap">' + s + '</span>'; };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* what has been chosen so far (with the preview flags in the address able to override) */
  function ctx() {
    var c = WLProgress.choices();
    return {
      type: (Q.match(/[?&](couples|family)\b/) || [])[1] || c.type || "couples",
      size: (Q.match(/[?&](compact|mid|spacious)\b/) || [])[1] || c.size || "compact",
      model: (Q.match(/[?&]m=(xtr|solara|hornet|amaroo)/) || [])[1] || c.model || "xtr",
      bed: (Q.match(/[?&]bed=([\w-]+)/) || [])[1] || c.bed, plan: c.plan
    };
  }
  /* fetch pictures ahead of time. Resolves when they are all in, or after `ms`, whichever is first, so a slow network never freezes the app. */
  function fetchImgs(urls, ms) {
    return new Promise(function (res) {
      var n = urls.length, done = function () { if (--n <= 0) res(); }; if (!n) return res();
      urls.forEach(function (u) { var i = new Image(); i.onload = i.onerror = done; i.src = u; });
      setTimeout(res, ms || 1000);
    });
  }
  function wireImgs(root) { $$("img[data-ld]", root).forEach(function (i) { var on = function () { i.classList.add("ld"); }; if (i.complete && i.naturalWidth) on(); else i.addEventListener("load", on); }); }

  /* ============================== the shell: show a step, slide between steps ============================== */
  var phone, stage, h1, plabel, road, backBtn, goBtn, cur = -1, curRoot = null, curUnmount = null, busy = false, goFn = null;
  var STEPS;
  var anim = function (el, kf, o) { if (reduce || !el.animate) return Promise.resolve(); try { return el.animate(kf, o).finished.catch(function () {}); } catch (e) { return Promise.resolve(); } };
  var urlFor = function (n) { return location.pathname + Q + "#" + STEPS[n].id; };

  var App = {
    setGo: function (fn) { goFn = fn || null; goBtn.classList.toggle("show", !!fn); goBtn.classList.remove("on"); goBtn.tabIndex = fn ? 0 : -1; },
    /* move to the next step after a beat (so the tap's pressed state is seen); `gate` is a promise to wait for first (images) */
    next: function (delay, gate) {
      if (busy || cur >= STEPS.length - 1) return;
      var go = function () { show(cur + 1, { dir: 1 }); };
      setTimeout(function () { (gate ? gate : Promise.resolve()).then(go); }, delay == null ? 320 : delay);
    }
  };

  function show(n, o) {
    o = o || {};
    if (busy && cur >= 0) return;
    var def = STEPS[n], dir = o.dir || (n >= cur ? 1 : -1), first = cur < 0, old = curRoot, oldUnmount = curUnmount;
    busy = true;
    App.setGo(null);
    var root = document.createElement("div"); root.className = "step s" + (n + 1); root.dataset.step = def.id;
    stage.appendChild(root);
    curUnmount = def.mount(root, ctx()) || null; curRoot = root; cur = n;
    if (o.push !== false) { try { history[first || o.push === "replace" ? "replaceState" : "pushState"]({ s: n }, "", urlFor(n)); } catch (e) {} }
    $(".prog").setAttribute("aria-label", "Step " + (n + 1) + " of " + STEPS.length);
    backBtn.setAttribute("aria-label", n ? "Back" : "Back to the Wonderland home page");

    var setTexts = function () { h1.innerHTML = def.title; plabel.textContent = def.label; };
    if (first) {
      setTexts();
      road.classList.add("no-anim"); WLProgress.set(road, n); void road.offsetWidth; road.classList.remove("no-anim");
      busy = false; return;
    }
    WLProgress.set(road, n);                                                  /* the van drives on, or back, while the step changes */
    var x = 46 * dir, E = "cubic-bezier(.2,.8,.2,1)";
    /* the words swap on a timer, not on the animation's end, so a throttled tab can never leave the old heading behind */
    anim(h1, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-x / 2) + "px)" }], { duration: 200, easing: "ease-in" });
    setTimeout(function () { setTexts(); anim(h1, [{ opacity: 0, transform: "translateX(" + (x / 2) + "px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: E }); }, reduce ? 0 : 190);
    anim(plabel, [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 500 });
    var outP = old ? anim(old, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-x) + "px)" }], { duration: 300, easing: "ease-in", fill: "forwards" }) : Promise.resolve();
    anim(root, [{ opacity: 0, transform: "translateX(" + x + "px)" }, { opacity: 1, transform: "none" }], { duration: 440, delay: 140, easing: E, fill: "backwards" });
    outP.then(function () { if (old) { if (oldUnmount) oldUnmount(); old.remove(); } });
    setTimeout(function () { busy = false; $$(".step", stage).forEach(function (s) { if (s !== curRoot) s.remove(); }); }, reduce ? 0 : 620);
  }

  /* ============================== Step 1: who is coming along ============================== */
  function s1(root) {
    root.innerHTML = '<div class="wrap"><div class="circle">' +
      '<button class="half L" type="button" data-t="couples" aria-label="Couple&rsquo;s"><svg viewBox="0 0 72 64" aria-hidden="true"><use href="#couples"/></svg></button>' +
      '<button class="half R" type="button" data-t="family" aria-label="Family"><svg viewBox="0 0 72 64" aria-hidden="true"><use href="#family"/></svg></button></div>' +
      '<div class="captions"><div class="cap L" data-t="couples"><b>Couple&rsquo;s</b><small>I&rsquo;m looking to travel with my&nbsp;partner.</small></div>' +
      '<div class="cap R" data-t="family"><b>Family</b><small>I&rsquo;m looking to travel with my&nbsp;family.</small></div></div></div>';
    $$("[data-t]", root).forEach(function (el) {
      el.addEventListener("click", function () {
        $('.half[data-t="' + el.dataset.t + '"]', root).classList.add("on");
        WLProgress.choose("type", el.dataset.t); App.next(380);
      });
    });
  }

  /* ============================== Step 2: how much room ============================== */
  function s2(root) {
    var SIZES = [
      { k: "compact",  nm: "Compact",  ln: "17′09″ – 20′", mid: 18.875, w: 76, ink: [-5.5, -3.4], src: "assets/img/build/size-compact.png" },
      { k: "mid",      nm: "Mid-size", ln: "20′06″ – 22′", mid: 21.25,  w: 85, ink: [-6.3, -1.1], src: "assets/img/build/size-mid.png" },
      { k: "spacious", nm: "Spacious", ln: "22′06″ – 24′", mid: 23.25,  w: 94, ink: [-4.6, -3.1], src: "assets/img/build/size-spacious.png" }
    ];
    var D = 88, GAP = (327 - 3 * D) / 2, H = 448, RB = 64;
    var P = SIZES.map(function (z, i) { return { cx: D / 2 + i * (D + GAP), t: [232, 118, 4][i], d: D, s: [50, 56, 60][i] }; });
    var xb = function (ft) { return (ft - 17.75) / 6.25 * 327; };
    var SPANS = [[17.75, 20], [20.5, 22], [22.5, 24]];
    var scale = '<defs><linearGradient id="gB" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="327" y2="0"><stop offset="0" stop-color="#FFC47F"/><stop offset=".52" stop-color="#E37921"/><stop offset="1" stop-color="#B04C07"/></linearGradient></defs>';
    SIZES.forEach(function (z, i) {
      var w = xb(SPANS[i][1]) - xb(SPANS[i][0]);
      scale += '<rect class="seg seg-' + z.k + '" x="' + xb(SPANS[i][0]) + '" y="14" width="' + w + '" height="12" rx="6" fill="url(#gB)"/><text class="sl sl-' + z.k + '" x="' + (xb(SPANS[i][0]) + w / 2) + '" y="46">' + z.ln + '</text>';
    });
    var nudge = function (z, s) { var k = s / z.w; return 'translate(' + (-z.ink[0] * k).toFixed(2) + 'px,' + (-z.ink[1] * k).toFixed(2) + 'px)'; };
    root.innerHTML = '<div class="v9"><div class="wrap">' +
      '<svg class="rule" viewBox="0 0 327 ' + H + '" aria-hidden="true"><g transform="translate(0 ' + (H - RB) + ')">' + scale + '</g></svg>' +
      SIZES.map(function (z, i) { var p = P[i]; return '<button class="p" data-k="' + z.k + '" style="left:' + (p.cx - p.d / 2) + 'px;top:' + p.t + 'px;width:' + p.d + 'px"><span class="disc cta" style="width:' + p.d + 'px;height:' + p.d + 'px"><img class="ico" src="' + z.src + '" alt="" style="width:' + p.s + 'px;transform:' + nudge(z, p.s) + '"></span><span class="nm">' + z.nm + '</span><span class="ln">' + z.ln + '</span></button>'; }).join("") + '</div></div>';
    $$(".p", root).forEach(function (b) { b.addEventListener("click", function () { b.classList.add("on"); WLProgress.choose("size", b.dataset.k); App.next(380); }); });
  }

  /* ============================== Step 3: where will you take it ============================== */
  var MODELS = [
    { k: "xtr",    nm: "XTR",    tag: "Complete Offroad – Flagship",     ink: [-2.6, -7.0], H: 343 },
    { k: "solara", nm: "Solara", tag: "Luxury Offroad – Full Composite", ink: [-4.8, -4.6], H: 386 },
    { k: "hornet", nm: "Hornet", tag: "Rugged Offroad",                       ink: [-2.9, -7.1], H: 343 },
    { k: "amaroo", nm: "Amaroo", tag: "Classic Offroad",                      ink: [-4.6, -5.6], H: 327 }
  ];
  var MPRICES = {
    "couples|compact":  { amaroo: 127288.44, hornet: 151175.87, solara: 162279.87, xtr: 195701.21 },
    "couples|mid":      { amaroo: 141935.21, hornet: 161912.74, solara: 181010.25, xtr: 206226.72 },
    "couples|spacious": { amaroo: 151681.52, hornet: 172514.15,                    xtr: 216619.44 },
    "family|compact":   { amaroo: 135844.75, hornet: 158574.05,                    xtr: 202953.75 },
    "family|mid":       { amaroo: 144241.65, hornet: 164201.16, solara: 185678.21, xtr: 208470.10 },
    "family|spacious":  { amaroo: 150140.04, hornet: 170984.71,                    xtr: 215120.11 }
  };
  function s3(content) {
    var c = ctx(), TAB = MPRICES[c.type + "|" + c.size], BY = {};
    var ms = MODELS.map(function (m) { var o = {}; for (var i in m) o[i] = m[i]; o.price = TAB[m.k]; o.na = TAB[m.k] === undefined; BY[m.k] = o; return o; });
    var off = function (m) { return m.na; };
    var HERO_DISC = 184, HERO_W = 266, MINI_DISC = 66, MINI_W = +(MINI_DISC * HERO_W / HERO_DISC).toFixed(1), MS = 850;
    var heroK = (CHOICE_MODEL(c) && !off(BY[CHOICE_MODEL(c)]) ? CHOICE_MODEL(c) : ms.filter(function (m) { return !off(m); })[0].k), busy3 = false;
    function mv(m, w) { var h = w * m.H / 900; return '<img class="mv" src="assets/img/build/model-' + m.k + '.webp" alt="" style="width:' + w + 'px;--nx:' + (-m.ink[0] / 100 * w).toFixed(1) + 'px;--ny:' + (-m.ink[1] / 100 * h).toFixed(1) + 'px;--gy:' + (3 * w / 266).toFixed(2) + 'px;--sh:' + (6 * w / 266).toFixed(2) + 'px">'; }
    content.innerHTML = '<div class="hero"><button class="hov" id="heroBtn" type="button" style="display:flex;flex-direction:column;align-items:center"><span class="disc" id="heroDisc"></span><span class="nm" id="hNm"></span><span class="pr" id="hPr"></span><span class="tag" id="hTag"></span></button></div><div class="dock" id="dock"></div><div class="sr" id="live" aria-live="polite"></div>';
    var hero = $(".hero", content), dock = $("#dock", content), heroDisc = $("#heroDisc", content), hNm = $("#hNm", content), hPr = $("#hPr", content), hTag = $("#hTag", content), heroBtn = $("#heroBtn", content);
    function setHeroText(m) { hNm.textContent = m.nm; hTag.textContent = m.tag; hPr.className = "pr" + (off(m) ? " na" : ""); hPr.innerHTML = off(m) ? "Not offered in this size" : '<span class="pf">From</span><span class="pv">' + fmt(m.price) + '</span>'; }
    function setHero(k) { var m = BY[k]; heroK = k; heroDisc.innerHTML = mv(m, HERO_W); setHeroText(m); hero.classList.toggle("off", off(m)); }
    function miniHTML(m) { return '<button class="mini' + (off(m) ? ' off' : '') + '" type="button" data-k="' + m.k + '" aria-label="' + m.nm + (off(m) ? ', not offered in this size' : ', ' + fmt(m.price)) + '"><span class="disc hov">' + mv(m, MINI_W) + '</span><span class="nm">' + m.nm + '</span><span class="mp">' + (off(m) ? '' : fmt(m.price)) + '</span></button>'; }
    function renderDock() {
      dock.innerHTML = ms.filter(function (m) { return m.k !== heroK; }).map(miniHTML).join("");
      $$(".mini", dock).forEach(function (b) { b.addEventListener("click", function () {
        if (b.classList.contains("off")) { if (b.animate && !reduce) b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 300 }); return; }
        promote(b);
      }); });
    }
    function rectIn(el) { var r = el.getBoundingClientRect(), cr = content.getBoundingClientRect(); return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height }; }
    function flier(m, B) { var d = document.createElement("span"); d.className = "disc fly"; d.style.cssText = "left:" + B.x + "px;top:" + B.y + "px;width:" + B.w + "px;height:" + B.h + "px;transform-origin:0 0;will-change:transform"; d.innerHTML = mv(m, HERO_W); content.appendChild(d); return d; }
    function tf(B, T, k, lift) { var s = (T.w / B.w) * k, w = B.w * s, h = B.h * s; return "translate(" + ((T.x + T.w / 2) - B.x - w / 2).toFixed(2) + "px," + ((T.y + T.h / 2) - B.y - h / 2 - (lift || 0)).toFixed(2) + "px) scale(" + s.toFixed(4) + ")"; }
    function promote(btn) {
      if (busy3 || btn.dataset.k === heroK) return;
      var newK = btn.dataset.k, oldK = heroK, nm = BY[newK], om = BY[oldK], slotDisc = $(".disc", btn), A = rectIn(slotDisc), B = rectIn(heroDisc);
      busy3 = true;
      var texts = [hNm, hPr, hTag];
      btn.dataset.k = oldK; btn.classList.toggle("off", off(om)); btn.setAttribute("aria-label", om.nm + ", " + fmt(om.price));
      slotDisc.innerHTML = mv(om, MINI_W); $(".nm", btn).textContent = om.nm; $(".mp", btn).textContent = fmt(om.price);
      setHero(newK); heroDisc.style.visibility = "hidden"; slotDisc.style.visibility = "hidden";
      var done = function () { if (!busy3) return; busy3 = false; $$(".fly", content).forEach(function (f) { f.remove(); }); heroDisc.style.visibility = ""; slotDisc.style.visibility = ""; $("#live", content).textContent = nm.nm + ", " + nm.tag + (off(nm) ? "" : ", from " + fmt(nm.price)) + ". Selected."; };
      if (reduce || !heroDisc.animate) { done(); return; }
      var up = flier(nm, B);
      up.animate([
        { offset: 0,   transform: tf(B, A, 1, 0),    filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",        easing: "cubic-bezier(.2,.8,.2,1)" },
        { offset: .55, transform: tf(B, B, 1.1, 16), filter: "drop-shadow(0 18px 16px rgba(0,0,0,.22))", easing: "ease-in-out" },
        { offset: .8,  transform: tf(B, B, 0.97, 0), filter: "drop-shadow(0 6px 8px rgba(0,0,0,.12))",   easing: "ease-out" },
        { offset: 1,   transform: tf(B, B, 1, 0),    filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }
      ], { duration: MS, fill: "forwards" });
      var dn = flier(om, B);
      dn.animate([{ offset: 0, transform: tf(B, B, 1, 0), easing: "cubic-bezier(.5,0,.2,1)" }, { offset: .72, transform: tf(B, A, 1.08, 0), easing: "ease-out" }, { offset: 1, transform: tf(B, A, 1, 0) }], { duration: Math.round(MS * .77), fill: "forwards" });
      texts.forEach(function (t, i) { t.animate([{ opacity: 0, transform: "translateY(12px) scale(.94)" }, { opacity: 1, transform: "translateY(-2px) scale(1.04)", offset: .6 }, { opacity: 1, transform: "none" }], { duration: 380 * MS / 600, delay: (200 + i * 70) * MS / 600, fill: "backwards", easing: "cubic-bezier(.2,.9,.3,1.2)" }); });
      setTimeout(done, MS + 60);
    }
    heroBtn.addEventListener("click", function () {
      if (hero.classList.contains("off")) return;
      heroBtn.classList.add("on"); WLProgress.choose("model", heroK);
      App.next(380, fetchImgs(bedPrefetch(ctx()), 1200));
    });
    setHero(heroK); renderDock();
  }
  function CHOICE_MODEL(c) { return WLProgress.choices().model || null; }

  /* ============================== Step 4: your bed ============================== */
  var BEDLINE = { "king-table": "King, side table on the door side", "king-chest": "King, storage chest on the door side", "king-lift": "King, electric lift-up", "queen-dual-table": "Queen, a table each side", "queen-dual-chest": "Queen, a storage chest each side", "queen-chest-table": "Queen, chest on the road side, table on the door side", "queen-ew": "Queen, east–west, storage at the bed head" };
  /* ---------- geometry, in feet. Head of the bed at the front, road side at the back right, door side open towards us. ---------- */
var U = 13, WFT = 7.5, PADD = 6, O = "#D57114";
var DIM = { "king-table": { l: 6.5, w: 6.0, near: "t" }, "king-chest": { l: 6.5, w: 6.0, near: "c" }, "king-lift": { l: 6.5, w: 6.0, up: 1 },
  "queen-dual-table": { l: 6.25, w: 5.0, near: "t", far: "t" }, "queen-dual-chest": { l: 6.5, w: 5.0, near: "c", far: "c" }, "queen-chest-table": { l: 6.5, w: 5.0, near: "t", far: "c" }, "queen-ew": { ew: 1 } };
function geo(k) {
  var b = DIM[k], x0 = .42;
  if (b.ew) return { bed: { x: x0, y: 1.3, l: 5.0, w: 5.95 }, items: [{ t: "c", x: x0, y: .18, l: 5.0, w: .95 }], ew: 1 };
  var y0 = b.w > 5.5 ? .32 : 1.25, items = [];
  var item = function (kind, y) { return kind === "t" ? { t: "t", x: x0, y: y, l: 1, w: 1 } : { t: "c", x: x0, y: y, l: b.l, w: .95 }; };
  if (b.far) items.push(item(b.far, y0 - 1.06));
  if (b.near) items.push(item(b.near, y0 + b.w + .06));
  return { bed: { x: x0, y: y0, l: b.l, w: b.w }, items: items, up: b.up, ew: 0 };
}
var uidN = 0, uid = function () { return "g" + (++uidN); };
var n2 = function (v) { return (+v).toFixed(2); };

/* colours: tables are orange, chests are teal, in both versions. Everything else is warm (colour) or neutral grey (monotone). */
var TABLE = ["#F29A4B", "#D57114", "#A8560A"], CHEST = ["#5DB0BE", "#2F7C8A", "#1E5963"];
var PAL = { floor: "#CFC6BA", plank: "#BFB5A8", wall: ["#FFFFFF", "#EEE9E2", "#D2CABF"], bed: ["#EDE4D6", "#D9CCB9", "#C4B49D"], linen: ["#F8F4EC", "#EFE8DD", "#DFD5C6"], pillow: ["#FFFFFF", "#E7DFD3", "#D2C8B8"], runner: "#CDC1AD", glass: "#CFE0E8", shadow: "rgba(40,25,10,.30)" };

/* ---------- the cutaway, true isometric (30 degree axes, right angles) ---------- */
function drawIso(k, o) {
  var G = geo(k), H = 3.9, C30 = .8660254, L = o.crop, id = uid(), s = "", T = .25, ic = o.icon, Pl = PAL;
  var MG = ic ? .3 : .9, ox = (WFT + T) * C30 + .2 + MG, oy = H + T + .2 + MG;
  var P = function (x, y, z) { return [((x - y) * C30 + ox) * U + PADD, ((x + y) * .5 - z + oy) * U + PADD]; };
  var poly = function (pts, fill, sw) { return '<polygon points="' + pts.map(function (p) { return n2(p[0]) + "," + n2(p[1]); }).join(" ") + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="' + (sw || .8) + '" stroke-linejoin="round"/>'; };
  var xz = function (y, x1, x2, z1, z2, fill, sw) { return poly([P(x1, y, z1), P(x2, y, z1), P(x2, y, z2), P(x1, y, z2)], fill, sw); };
  var yz = function (x, y1, y2, z1, z2, fill, sw) { return poly([P(x, y1, z1), P(x, y2, z1), P(x, y2, z2), P(x, y1, z2)], fill, sw); };
  var xy = function (z, x1, x2, y1, y2, fill, sw) { return poly([P(x1, y1, z), P(x2, y1, z), P(x2, y2, z), P(x1, y2, z)], fill, sw); };
  /* sw makes the edges of a piece softer: a thick stroke in the piece's own colour rounds every corner */
  var box = function (x, y, z, l, w, h, c, sw) { return xy(z + h, x, x + l, y, y + w, c[0], sw) + xz(y + w, x, x + l, z, z + h, c[1], sw) + yz(x + l, y, y + w, z, z + h, c[2], sw); };
  var pw = { h: .06, c: ["url(#" + id + "p)", Pl.pillow[1], Pl.pillow[2]] };      /* almost flat pillows, shaded with a diagonal gradient: light at the top, dark at the bottom */
  var ZB = -.6;
  s += '<defs><filter id="' + id + 'b" x="-10%" y="-10%" width="120%" height="140%"><feGaussianBlur stdDeviation="' + (ic ? 1 : 2.2) + '"/></filter>' +
    '<linearGradient id="' + id + 'p" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".4" stop-color="#F2EDE4"/><stop offset="1" stop-color="#C9BFAF"/></linearGradient></defs>';
  /* The floor runs on past the end of the walls (to Lf) and is blurred out there: the van carries on. The dark lower wall on the door side goes with it. */
  var Lf = L + (ic ? 1.8 : 3.0), fl = xy(0, 0, Lf, 0, WFT, Pl.floor);
  if (!ic) for (var yy = .75; yy < WFT; yy += .75) { var a1 = P(0, yy, 0), a2 = P(Lf, yy, 0); fl += '<line x1="' + n2(a1[0]) + '" y1="' + n2(a1[1]) + '" x2="' + n2(a2[0]) + '" y2="' + n2(a2[1]) + '" stroke="' + Pl.plank + '" stroke-width=".7"/>'; }
  fl += xz(WFT, 0, Lf, ZB, 0, "#2B2B2B");
  var Lw = L + (ic ? .6 : 1.0), wl = box(-T, -T, 0, Lw + T, T, H, Pl.wall) + box(-T, 0, 0, T, WFT, H, Pl.wall);        /* road-side wall, front wall (with thickness); they fade out at the rear */
  /* one window, in the road-side wall: an outline, the glass, and two flat streaks of reflection */
  var wp = function (pts) { return pts.map(function (p) { var q = P(p[0], 0, p[1]); return n2(q[0]) + "," + n2(q[1]); }).join(" "); };
  wl += '<polygon points="' + wp([[2.2, 1.8], [5.8, 1.8], [5.8, 3.5], [2.2, 3.5]]) + '" fill="' + Pl.glass + '" stroke="#5E6A72" stroke-width="' + (ic ? .9 : 1.5) + '" stroke-linejoin="round"/>';
  if (!ic) wl += '<polygon points="' + wp([[2.75, 1.8], [3.55, 1.8], [4.55, 3.5], [3.75, 3.5]]) + '" fill="#fff" fill-opacity=".62"/><polygon points="' + wp([[3.85, 1.8], [4.2, 1.8], [5.2, 3.5], [4.85, 3.5]]) + '" fill="#fff" fill-opacity=".4"/>';
  s += '<g mask="url(#' + id + 'mw)">' + wl + '</g>';
  var B = G.bed, ph = B.w / 2 - .28;
  s += xy(0, B.x - .1, B.x + B.l + .45, B.y + .1, B.y + B.w + .4, Pl.shadow).replace("<polygon", '<polygon filter="url(#' + id + 'b)"');
  var piece = function (it) { return box(it.x, it.y, 0, it.l, it.w, it.t === "t" ? 1.9 : 1.35, it.t === "t" ? TABLE : CHEST, 1.6); };
  G.items.forEach(function (it) { if (it.y < B.y) s += piece(it); });
  s += box(B.x, B.y, 0, B.l, B.w, 1.2, Pl.bed);
  if (G.ew) {
    s += box(B.x + .06, B.y + 1.1, 1.2, B.l - .12, B.w - 1.16, .2, Pl.linen, 1.8) + xy(1.4, B.x + .06, B.x + B.l - .06, B.y + B.w * .5, B.y + B.w * .5 + .85, Pl.runner);
    s += box(B.x + .22, B.y + .14, 1.2, B.l / 2 - .32, .85, pw.h, pw.c, 3.4) + box(B.x + B.l / 2 + .1, B.y + .14, 1.2, B.l / 2 - .32, .85, pw.h, pw.c, 3.4);
  } else {
    s += box(B.x + .95, B.y + .1, 1.2, B.l - 1.05, B.w - .2, .2, Pl.linen, 1.8) + xy(1.4, B.x + B.l * .46, B.x + B.l * .46 + .95, B.y + .1, B.y + B.w - .1, Pl.runner);
    s += [B.y + .22, B.y + B.w - .22 - ph + .04].map(function (py) { return xy(1.4, B.x + .1, B.x + .98, py + .06, py + ph + .08, "rgba(70,50,25,.30)").replace("<polygon", '<polygon filter="url(#' + id + 'b)"'); }).join("") + box(B.x + .14, B.y + .22, 1.2, .76, ph - .04, pw.h, pw.c, 3.4) + box(B.x + .14, B.y + B.w - .22 - ph + .04, 1.2, .76, ph - .04, pw.h, pw.c, 3.4);
    if (G.up) { var ax = B.x + B.l * .72, ay = B.y + B.w * .5, q0 = P(ax, ay, 1.6), q1 = P(ax, ay, 3.4); s += '<path d="M' + n2(q0[0]) + ' ' + n2(q0[1]) + 'L' + n2(q1[0]) + ' ' + n2(q1[1]) + 'M' + n2(q1[0] - 5) + ' ' + n2(q1[1] + 6) + 'L' + n2(q1[0]) + ' ' + n2(q1[1]) + 'L' + n2(q1[0] + 5) + ' ' + n2(q1[1] + 6) + '" fill="none" stroke="' + O + '" stroke-width="' + (ic ? 2 : 2.6) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  }
  G.items.forEach(function (it) { if (it.y >= B.y) s += piece(it); });
  var vbw = ((Lf + WFT + T) * C30 + .4 + 2 * MG) * U + PADD * 2, vbh = ((Lf + WFT) * .5 + H + T - ZB + .4 + 2 * MG) * U + PADD * 2;
  /* how the floor blurs out, one of three:  fade = fades to nothing, no blur   prog = sharp, then blurring, then gone   heavy = sharp, then a short stretch of strong blur, then gone */
  var BL = { fade: { sharp: [[0, 1], [.12, 1], [1, 0]], blur: null, sd: 0 }, prog: { sharp: [[0, 1], [.1, 1], [.65, 0]], blur: [[0, 0], [.12, 0], [.5, 1], [.75, 1], [1, 0]], sd: 3.4 }, heavy: { sharp: [[0, 1], [.2, 1], [.3, 0]], blur: [[0, 0], [.2, 0], [.32, 1], [.62, 1], [1, 0]], sd: 7 } }[o.blur || "prog"];
  var xs = L - 1.5, S0 = P(xs, WFT / 2, 0), S1 = P(Lf, WFT / 2, 0), vx = S1[0] - S0[0], vy = S1[1] - S0[1], dd = vx * .5 + vy * .866;          /* the fade runs across the van, with its contours parallel to the width, not tilted */
  var gv = 'gradientUnits="userSpaceOnUse" x1="' + n2(S0[0]) + '" y1="' + n2(S0[1]) + '" x2="' + n2(S0[0] + dd * .5) + '" y2="' + n2(S0[1] + dd * .866) + '"', mr = 'x="-50" y="-50" width="' + n2(vbw + 100) + '" height="' + n2(vbh + 100) + '"';
  var gstops = function (a) { return a.map(function (q) { var v = Math.round(q[1] * 255); return '<stop offset="' + q[0] + '" stop-color="rgb(' + v + ',' + v + ',' + v + ')"/>'; }).join(""); };
  var flr = '<defs><g id="' + id + 'fl">' + fl + '</g><linearGradient id="' + id + 'gs" ' + gv + '>' + gstops(BL.sharp) + '</linearGradient><mask id="' + id + 'ms" maskUnits="userSpaceOnUse" ' + mr + '><rect ' + mr + ' fill="url(#' + id + 'gs)"/></mask>' +
    (BL.blur ? '<linearGradient id="' + id + 'gb" ' + gv + '>' + gstops(BL.blur) + '</linearGradient><mask id="' + id + 'mb" maskUnits="userSpaceOnUse" ' + mr + '><rect ' + mr + ' fill="url(#' + id + 'gb)"/></mask><filter id="' + id + 'k" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="' + (ic ? BL.sd * .35 : BL.sd) + '"/></filter>' : '') + '</defs>' +
    '<g mask="url(#' + id + 'ms)"><use href="#' + id + 'fl"/></g>' + (BL.blur ? '<g mask="url(#' + id + 'mb)"><use href="#' + id + 'fl" filter="url(#' + id + 'k)"/></g>' : '');
  /* The walls fade out along their length. A wall stands up, so the fade is laid across the SCREEN (vertical contours), not along the floor, or the top edge would outlast the base.
     long = begins early, soft   short = begins late   melt = tilted, so the top edge dissolves before the base */
  var WM = { long: { xs: Lw - 4.0, xe: Lw + .1, tilt: 0 }, short: { xs: Lw - 1.9, xe: Lw + .1, tilt: 0 }, melt: { xs: Lw - 3.8, xe: Lw + .5, tilt: .7 } }[o.wall || "long"];
  if (ic) { WM = { xs: Lw - (WM.xe - WM.xs) * .6, xe: WM.xe, tilt: WM.tilt }; }
  var W0 = P(WM.xs, 0, 0), W1 = P(WM.xe, 0, 0), wx = W1[0] - W0[0];
  var wgv = 'gradientUnits="userSpaceOnUse" x1="' + n2(W0[0]) + '" y1="' + n2(W0[1]) + '" x2="' + n2(W1[0]) + '" y2="' + n2(W0[1] - wx * WM.tilt) + '"';
  flr += '<defs><linearGradient id="' + id + 'gw" ' + wgv + '>' + gstops([[0, 1], [.1, 1], [1, 0]]) + '</linearGradient><mask id="' + id + 'mw" maskUnits="userSpaceOnUse" ' + mr + '><rect ' + mr + ' fill="url(#' + id + 'gw)"/></mask></defs>';
  s = flr + s;
  if (!ic) {
    var tag = function (txt, x, y, z, rot, col) { var q = P(x, y, z); return '<text x="' + n2(q[0]) + '" y="' + n2(q[1]) + '" transform="rotate(' + rot + ' ' + n2(q[0]) + ' ' + n2(q[1]) + ')" text-anchor="middle" dominant-baseline="central" font-family="Aviano Sans, Trebuchet MS, sans-serif" font-weight="700" font-size="8.5" letter-spacing="1.3" fill="' + (col || "#a89d90") + '">' + txt + '</text>'; };
    s += tag("ROAD SIDE", L * .5, -T - 1.1, H, 30) + tag("FRONT", -T - 1.2, WFT * .5, H, -30) + tag("DOOR SIDE", L * .5, WFT + 1.1, -.6, 30);
  }
  return '<svg viewBox="0 0 ' + n2(vbw) + ' ' + n2(vbh) + '" role="img" aria-label="' + BEDLINE[k] + '">' + s + '</svg>';
}


  function s4(root, c) {
    var BEDS = wlBeds(c.type, c.size, c.model).filter(function (b) { return b.price !== null; });
    var GROUPS = ["King", "Queen"].filter(function (g) { return BEDS.some(function (b) { return b.group === g; }); });
    var cheapest = function (list) { return list.slice().sort(function (a, b) { return a.price - b.price; })[0]; };
    var S = { g: null, k: WLProgress.choices().bed || null };
    var had = BEDS.filter(function (b) { return b.key === S.k; })[0]; S.g = had ? had.group : cheapest(BEDS).group;
    root.innerHTML = '<div class="pane"></div>';
    var out = $(".pane", root);
    function render() {
      var inG = BEDS.filter(function (b) { return b.group === S.g; });
      if (!inG.some(function (b) { return b.key === S.k; })) S.k = cheapest(inG).key;
      var cur = inG.filter(function (b) { return b.key === S.k; })[0], gg = geo(S.k), hasT = gg.items.some(function (i) { return i.t === "t"; }), hasC = gg.items.some(function (i) { return i.t === "c"; });
      var ISO = { blur: "fade", wall: "long" };
      out.innerHTML =
        '<div class="seg" role="group" aria-label="Bed size">' + GROUPS.map(function (g) { return '<button type="button" class="' + (g === S.g ? "on" : "") + '" data-g="' + g + '"><span>' + g + '</span></button>'; }).join("") + '</div>' +
        '<div class="ics">' + inG.map(function (b) { return '<button type="button" class="ic' + (b.key === S.k ? " on" : "") + '" data-k="' + b.key + '" aria-label="' + BEDLINE[b.key] + '">' + drawIso(b.key, { crop: 7.6, icon: true, blur: ISO.blur, wall: ISO.wall }) + '</button>'; }).join("") + '</div>' +
        '<div class="cap1">' + BEDLINE[S.k] + '</div>' +
        '<div class="dg">' + drawIso(S.k, { crop: 8.4, blur: ISO.blur, wall: ISO.wall }) + '</div>' +
        '<div class="foot"><div class="leg">' + (hasT ? '<span><i style="background:' + TABLE[1] + '"></i>Side table</span>' : '') + (hasC ? '<span><i style="background:' + CHEST[1] + '"></i>Storage chest</span>' : '') + '</div><div class="pb"><span class="pr"><span class="pf">From</span><span class="pv">' + fmt(cur.price) + '</span></span><span class="fl">' + (cur.delta ? '+' + fmt(cur.delta) + ' on the base bed' : 'The base bed') + '</span></div></div>';
      $$(".seg button", out).forEach(function (b) { b.addEventListener("click", function () { if (S.g !== b.dataset.g) { S.g = b.dataset.g; S.k = null; render(); } }); });
      $$(".ic", out).forEach(function (b) { b.addEventListener("click", function () { S.k = b.dataset.k; render(); }); });
    }
    render();
    App.setGo(function () {
      WLProgress.choose("bed", S.k);
      var c2 = ctx(); c2.bed = S.k;
      App.next(220, fetchImgs(bedPrefetch(c2), 1200));
    });
  }

  /* ============================== Step 5: your floorplan ============================== */
  var LAY = { L: "L-shaped lounge", C: "Café dinette", SC: "U-shaped lounge", XLE: "L-shaped lounge, large ensuite", RC: "Rear lounge, ensuite beside the bed" };
  var LAYS = { L: "L lounge", C: "Café dinette", SC: "U lounge", XLE: "L lounge, big ensuite", RC: "Rear lounge" };
  var nice = function (s) { s = s.replace(/roadside/g, "road side").replace(/doorside/g, "door side"); return s.charAt(0).toUpperCase() + s.slice(1); };
  function plansFor(c) {
    var ALL = [], RAW = WL_PLANS[c.type + "|" + c.size] || {};
    Object.keys(RAW).forEach(function (code) {
      var r = RAW[code], price = r.p[c.model]; if (price == null) return;
      var ft = +code.slice(0, 2), inch = +code.slice(2, 4), m = /^(\d{2})(\d{2})(K1|K|Q1|Q2|Q|EW|KL)(.*)$/.exec(code), s = m ? m[4] : "", lay = "", ls = "", lname = "", door = "", mm;
      if ((mm = /^-(M|R)-(L|C|SC|XLE)$/.exec(s))) { lname = LAY[mm[2]]; door = mm[1] === "M" ? "Beside the bed" : "At the rear"; lay = LAY[mm[2]] + (mm[1] === "M" ? ", door beside the bed" : ", door at the rear"); ls = LAYS[mm[2]] + (mm[1] === "M" ? " · door by bed" : " · door at rear"); }
      else if (/^-RCL?$/.test(s)) { lname = LAY.RC; door = "At the rear"; lay = LAY.RC + ", door at the rear"; ls = LAYS.RC + " · door at rear"; }
      else { lay = nice(r.desc || ""); ls = lay; lname = lay; }
      ALL.push({ code: code, bed: r.bed, bunks: r.bunks || 0, price: price, len: ft + inch / 12, lenTxt: ft + "′" + (inch < 10 ? "0" : "") + inch + "″", lay: lay, ls: ls, lname: lname, door: door });
    });
    ALL.sort(function (a, b) { return a.len - b.len || a.price - b.price; });
    var bed = c.bed; if (!ALL.some(function (p) { return p.bed === bed; })) bed = (ALL.slice().sort(function (a, b) { return a.price - b.price; })[0] || {}).bed;
    var P = ALL.filter(function (p) { return p.bed === bed; }), base = Math.min.apply(null, P.map(function (p) { return p.price; })), buns = [];
    P.forEach(function (p) { if (p.bunks && buns.indexOf(p.bunks) < 0) buns.push(p.bunks); }); buns.sort(function (a, b) { return a - b; });
    return { bed: bed, plans: P, base: base, buns: buns };
  }
  var planImg = function (p) { return "assets/img/build/plans/" + p.code + ".jpg"; };
  function bedPrefetch(c) { var D = plansFor(c); return D.plans.slice(0, 3).map(planImg); }
  var img = function (p, lazy) { return '<img data-ld src="' + planImg(p) + '" alt="" decoding="async"' + (lazy ? ' loading="lazy"' : '') + '>'; };

  function s5(root, c) {
    var D = plansFor(c), S = { bun: null, sel: 0 };
    var variant = (Q.match(/[?&]s5=(\w+)/) || [])[1] || "card";
    var V = { list: v5list, hero: v5hero, bleed: v5bleed, grid: v5grid, card: v5card, overlay: v5overlay, spec: v5spec, pricebar: v5pricebar, center: v5center }[variant] || v5card;
    root.classList.toggle("has-go", variant !== "list" && variant !== "grid");
    root.innerHTML = '<div class="pane"></div>'; var pane = $(".pane", root);
    var list = function () { return D.plans.filter(function (p) { return !S.bun || p.bunks === S.bun; }); };
    var chips = function () { return D.buns.length > 1 ? '<div class="chips">' + [0].concat(D.buns).map(function (n) { return '<button type="button" class="chip' + ((S.bun || 0) === n ? " on" : "") + '" data-n="' + n + '">' + (n ? n + (n > 1 ? " bunks" : " bunk") : "Any bunks") + '</button>'; }).join("") + '</div>' : ""; };
    var delta = function (p, base) { var d = Math.round(p.price - D.base); return d ? "+" + fmt(d) : base; };
    var choose = function (p, el) { if (el) el.classList.add("on"); WLProgress.choose("plan", p.code); App.next(320); };
    function render() {
      var L = list(); if (S.sel >= L.length) S.sel = 0;
      App.setGo(null);
      pane.className = "pane v-" + variant;
      pane.innerHTML = chips() + (L.length ? V.html(L, S) : '<div class="empty">No plans match those choices.</div>');
      $$(".chip", pane).forEach(function (b) { b.addEventListener("click", function () { S.bun = +b.dataset.n || null; S.sel = 0; render(); }); });
      if (L.length) V.wire(pane, L, S, { choose: choose, delta: delta, render: render });
      wireImgs(pane);
    }
    render();
  }
  var rowTxt = function (p, d) { return '<span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span>'; };

  /* list: big cards, one under another, tap to choose */
  var v5list = {
    html: function (L) { return '<div class="list">' + L.map(function (p, i) { return '<button class="card" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot">' + img(p, i > 1) + '</span><span class="row"><span>' + rowTxt(p) + '</span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl" data-d="' + i + '"></span></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) { $$(".card", pane).forEach(function (b) { var p = L[+b.dataset.i]; $(".fl", b).textContent = H.delta(p, "The base plan"); b.addEventListener("click", function () { H.choose(p, b); }); }); }
  };
  /* hero: the chosen plan large at the top, the others as compact rows beneath; the Next circle confirms */
  var v5hero = {
    html: function (L, S) { return '<div class="hh"><span class="shot big">' + img(L[S.sel]) + '</span></div><div class="rows">' + L.map(function (p, i) { return '<button class="r1' + (i === S.sel ? " on" : "") + '" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="th"><img data-ld src="' + planImg(p) + '" alt="" decoding="async" loading="lazy"></span><span class="tx"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) {
      var big = $(".hh img", pane), rows = $$(".r1", pane);
      rows.forEach(function (b, i) { $(".fl", b).textContent = H.delta(L[i], "Base plan"); b.addEventListener("click", function () {
        if (S.sel === i) return; S.sel = i; rows.forEach(function (r, j) { r.classList.toggle("on", j === i); });
        big.classList.remove("ld"); big.src = planImg(L[i]); if (big.complete && big.naturalWidth) big.classList.add("ld");
      }); });
      App.setGo(function () { H.choose(L[S.sel], null); });
    }
  };
  /* bleed: a full-width carousel; each slide is the picture and its facts, and swipes as one */
  var v5bleed = {
    html: function (L) {
      return '<div class="rail2">' + L.map(function (p, i) { return '<div class="sl2"><span class="shot wide">' + img(p, i > 1) + '</span><span class="row2"><span class="who"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span><span class="pr"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></span></div>'; }).join("") + '</div>' +
        '<div class="thumbs2">' + L.map(function (p, i) { return '<button class="t2" type="button" data-i="' + i + '" aria-label="Plan ' + (i + 1) + ' of ' + L.length + '"><img data-ld src="' + planImg(p) + '" alt="" decoding="async" loading="lazy"></button>'; }).join("") + '</div>';
    },
    wire: function (pane, L, S, H) {
      var rail = $(".rail2", pane), strip = $(".thumbs2", pane), pw = phone.clientWidth || 375, ths = $$(".t2", pane);
      rail.style.width = pw + "px"; rail.style.marginLeft = (-(pw - 327) / 2) + "px"; strip.style.width = pw + "px"; strip.style.marginLeft = (-(pw - 327) / 2) + "px";
      $$(".sl2", pane).forEach(function (s, i) { s.style.width = pw + "px"; var f = $(".fl", s); f.textContent = H.delta(L[i], "The base plan"); if (f.textContent.charAt(0) === "+") f.textContent += " on the base plan"; });
      var paint = function (smooth) { ths.forEach(function (b, i) { b.classList.toggle("on", i === S.sel); }); var on = ths[S.sel]; if (on) { var want = on.offsetLeft - (pw - on.offsetWidth) / 2; if (strip.scrollTo) strip.scrollTo({ left: Math.max(0, want), behavior: smooth ? "smooth" : "auto" }); else strip.scrollLeft = Math.max(0, want); } };
      rail.addEventListener("scroll", function () { var i = Math.max(0, Math.min(L.length - 1, Math.round(rail.scrollLeft / pw))); if (i !== S.sel) { S.sel = i; paint(true); } });
      ths.forEach(function (b, i) { b.addEventListener("click", function () { rail.scrollTo ? rail.scrollTo({ left: i * pw, behavior: "smooth" }) : (rail.scrollLeft = i * pw); }); });
      rail.scrollLeft = S.sel * pw; paint(false);
      App.setGo(function () { H.choose(L[S.sel], null); });
    }
  };
  /* ---- five layouts of the swipe, all inside the page margins. Each slide is one plan; the Next circle confirms the one on screen. ---- */
  function swipe(slide, nav) {
    return {
      html: function (L) {
        return '<div class="rail3">' + L.map(function (p, i) { return '<div class="sl3">' + slide(p, i) + '</div>'; }).join("") + '</div>' +
          (nav === "thumbs" ? '<div class="thumbs3">' + L.map(function (p, i) { return '<button class="t2" type="button" data-i="' + i + '" aria-label="Plan ' + (i + 1) + ' of ' + L.length + '"><img data-ld src="' + planImg(p) + '" alt="" decoding="async" loading="lazy"></button>'; }).join("") + '</div>' : '<div class="dots2"></div>');
      },
      wire: function (pane, L, S, H) {
        var rail = $(".rail3", pane), pw = rail.clientWidth || 327, nv = nav === "thumbs" ? $(".thumbs3", pane) : $(".dots2", pane), ths = $$(".t2", pane);
        $$(".sl3", pane).forEach(function (s, i) { var f = $(".fl", s); if (f) { f.textContent = H.delta(L[i], "The base plan"); if (f.textContent.charAt(0) === "+") f.textContent += " on the base plan"; } });
        var paint = function (smooth) {
          if (nav === "thumbs") { ths.forEach(function (b, i) { b.classList.toggle("on", i === S.sel); }); var on = ths[S.sel]; if (on) { var want = on.offsetLeft - (pw - on.offsetWidth) / 2; if (nv.scrollTo) nv.scrollTo({ left: Math.max(0, want), behavior: smooth ? "smooth" : "auto" }); else nv.scrollLeft = Math.max(0, want); } }
          else nv.innerHTML = L.length > 9 ? '<span class="cnt">' + (S.sel + 1) + ' of ' + L.length + '</span>' : L.map(function (_, i) { return '<i' + (i === S.sel ? ' class="on"' : '') + '></i>'; }).join("");
        };
        rail.addEventListener("scroll", function () { var i = Math.max(0, Math.min(L.length - 1, Math.round(rail.scrollLeft / pw))); if (i !== S.sel) { S.sel = i; paint(true); } });
        ths.forEach(function (b, i) { b.addEventListener("click", function () { rail.scrollTo ? rail.scrollTo({ left: i * pw, behavior: "smooth" }) : (rail.scrollLeft = i * pw); }); });
        rail.scrollLeft = S.sel * pw; paint(false);
        App.setGo(function () { H.choose(L[S.sel], null); });
      }
    };
  }
  var pic = function (p, i, extra) { return '<span class="shot card' + (extra || "") + '">' + img(p, i > 1) + (extra === " ov" ? '<span class="lenchip">' + p.lenTxt + '</span><span class="pricechip"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span></span>' : "") + '</span>'; };
  var priceBlock = function (p) { return '<span class="pr"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span>'; };
  /* 1 card: the picture in a rounded card, length and layout left, price right, thumbnails beneath */
  var v5card = swipe(function (p, i) { return pic(p, i) + '<span class="row3"><span class="who"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span>' + priceBlock(p) + '</span>'; }, "thumbs");
  /* 2 overlay: the length and the price sit on the picture, in chips; the layout is the only line below; dots */
  var v5overlay = swipe(function (p, i) { return pic(p, i, " ov") + '<span class="under"><span class="ft">' + p.lay + '</span><span class="fl"></span></span>'; }, "dots");
  /* 3 spec: the picture, then a small panel of labelled facts with the price beside them; thumbnails */
  var v5spec = swipe(function (p, i) { return pic(p, i) + '<span class="spec"><span class="facts"><span class="f"><i>Length</i><b>' + p.lenTxt + '</b></span><span class="f"><i>Layout</i><b>' + p.lname + '</b></span>' + (p.door ? '<span class="f"><i>Door</i><b>' + p.door + '</b></span>' : '') + '</span>' + priceBlock(p) + '</span>'; }, "thumbs");
  /* 4 price bar: the price in a solid orange pill, the first thing the eye lands on; dots */
  var v5pricebar = swipe(function (p, i) { return pic(p, i) + '<span class="row3"><span class="who"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span><span class="pr"><span class="pill"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span></span><span class="fl"></span></span></span>'; }, "dots");
  /* 5 centred: everything on one axis under the picture, the price largest of all; dots */
  var v5center = swipe(function (p, i) { return pic(p, i) + '<span class="ctr"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span><span class="pr"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></span>'; }, "dots");

  /* grid: two columns of smaller pictures, so more plans are on screen at once; tap to choose */
  var v5grid = {
    html: function (L) { return '<div class="grid">' + L.map(function (p, i) { return '<button class="tile" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot sm">' + img(p, i > 5) + '</span><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.ls + '</span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) { $$(".tile", pane).forEach(function (b) { var p = L[+b.dataset.i]; $(".fl", b).textContent = H.delta(p, "Base"); b.addEventListener("click", function () { H.choose(p, b); }); }); }
  };

  /* ============================== Step 6: details (the contact form comes here) ============================== */
  function s6(root, c) {
    var C = WLProgress.choices(), T = { couples: "Couple’s", family: "Family" }, Z = { compact: "Compact", mid: "Mid-size", spacious: "Spacious" }, M = { xtr: "XTR", solara: "Solara", hornet: "Hornet", amaroo: "Amaroo" };
    var bed = C.bed && WL_BED_INFO[C.bed] ? WL_BED_INFO[C.bed].live.split(" bed")[0].replace(/ \(.*\)/, "") + " · " + WL_BED_INFO[C.bed].short : null;
    var bits = [T[C.type], Z[C.size], M[C.model], bed, C.plan ? C.plan.replace(/-/g, "‑") : null].filter(Boolean);
    root.innerHTML = '<div class="stub"><p>The contact form will go here. This step is next on the rebuild.</p><div class="sum">' + bits.join(" · ") + '</div></div>';
  }

  /* ============================== start ============================== */
  STEPS = [
    { id: "layout",  label: "Layout",    title: "Who&rsquo;s " + nowrap("coming along?"), mount: s1 },
    { id: "size",    label: "Size",      title: nowrap("How much room") + " " + nowrap("do you need?"), mount: s2 },
    { id: "model",   label: "Model",     title: nowrap("Where will you") + " " + nowrap("take it?"), mount: s3 },
    { id: "bed",     label: "Bed",       title: "Your bed", mount: s4 },
    { id: "plan",    label: "Floorplan", title: "Your floorplan", mount: s5 },
    { id: "details", label: "Details",   title: "Details", mount: s6 }
  ];
  function indexOf(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i; return -1; }
  function init() {
    phone = $("#phone"); stage = $("#stage"); h1 = $("#h1"); plabel = $("#plabel"); road = $(".road"); backBtn = $("#back"); goBtn = $("#go");
    if (/[?&]guides/.test(Q)) phone.classList.add("guides");
    goBtn.addEventListener("click", function () { if (goFn) { goBtn.classList.add("on"); goFn(); } });
    backBtn.addEventListener("click", function (e) { if (cur > 0) { e.preventDefault(); if (!busy) show(cur - 1, { dir: -1, push: "replace" }); } });
    window.addEventListener("popstate", function (e) { var s = e.state && e.state.s; if (s == null) s = Math.max(0, indexOf((location.hash || "").slice(1))); if (s !== cur) show(s, { push: false }); });
    var start = indexOf(((Q.match(/[?&]step=(\w+)/) || [])[1]) || (location.hash || "").slice(1)); if (start < 0) start = 0;
    show(start, { push: true });
    /* warm the cache for the steps ahead while the first one is being looked at */
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 400); };
    idle(function () {
      var u = ["assets/img/build/size-compact.png", "assets/img/build/size-mid.png", "assets/img/build/size-spacious.png"]; MODELS.forEach(function (m) { u.push("assets/img/build/model-" + m.k + ".webp"); });
      u.forEach(function (s) { var i = new Image(); i.src = s; });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.WLApp = App;
})();
