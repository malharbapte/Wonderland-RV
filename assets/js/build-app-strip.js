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
  /* THE GATE. The iPad layout switches on only for a touch device at least 744px wide AND 600px tall (an iPad, either way up). A phone, a phone turned
     sideways (too short) and a desktop browser (a mouse, not touch) all stay on the layout they have always had. ?device=tablet forces it on, ?device=phone forces it off. */
  var TABQ = window.matchMedia ? matchMedia("(hover: none) and (pointer: coarse) and (min-width: 744px) and (min-height: 600px)") : null;
  var FORCE = (Q.match(/[?&]device=(tablet|phone)/) || [])[1];
  var isTab = function () { return FORCE ? FORCE === "tablet" : !!(TABQ && TABQ.matches); };
  var isLand = function () { return window.innerWidth > window.innerHeight; };
  var gateKey = "";
  function applyGate() {
    var on = isTab(), land = on && isLand(), el = document.documentElement;
    el.classList.toggle("tab", on); el.classList.toggle("tab-land", land);
    var k = (on ? "t" : "p") + (land ? "l" : "p"), changed = gateKey !== "" && k !== gateKey; gateKey = k; return changed;
  }
  applyGate();

  /* what has been chosen so far (with the preview flags in the address able to override) */
  var edited = false;                                      /* once the customer changes something in Step 6, the saved choices win over any preview flags in the address */
  function ctx() {
    var c = WLProgress.choices(), q = !edited;
    return {
      type: (q && Q.match(/[?&](couples|family)\b/) || [])[1] || c.type || "couples",
      size: (q && Q.match(/[?&](compact|mid|spacious)\b/) || [])[1] || c.size || "compact",
      model: (q && Q.match(/[?&]m=(xtr|solara|hornet|amaroo)/) || [])[1] || c.model || "xtr",
      bed: (q && Q.match(/[?&]bed=([\w-]+)/) || [])[1] || c.bed, plan: c.plan
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
    setGo: function (fn, icon, dim) { goFn = fn || null; App.hintFn = null; goBtn.classList.toggle("show", !!fn); goBtn.classList.toggle("dim", !!fn && !!dim); goBtn.classList.remove("on"); goBtn.tabIndex = fn ? 0 : -1; $("path", goBtn).setAttribute("d", icon === "tick" ? "M5 12.5l4.5 4.5L19 7.5" : "M9 5l7 7-7 7"); goBtn.setAttribute("aria-label", icon === "tick" ? "Send" : "Next"); },
    dimGo: function (d) { goBtn.classList.toggle("dim", !!d); },
    hintFn: null,
    backHook: null,                                   /* a step can take over Back for its own inner screens: return true when it handled it */
    /* move to the next step after a beat (so the tap's pressed state is seen); `gate` is a promise to wait for first (images) */
    next: function (delay, gate) {
      if (busy || cur >= STEPS.length - 1) return;
      var go = function () { show(cur + 1, { dir: 1 }); };
      setTimeout(function () { (gate ? gate : Promise.resolve()).then(go); }, delay == null ? 320 : delay);
    }
  };

  function fitH1() { h1.classList.remove("wrap"); if (h1.scrollWidth > h1.clientWidth + 1) h1.classList.add("wrap"); }
  window.addEventListener("resize", function () { if (h1) fitH1(); });
  function show(n, o) {
    o = o || {};
    if (busy && cur >= 0) return;
    document.body.dataset.step = STEPS[n].id;
    var def = STEPS[n], dir = o.dir || (n >= cur ? 1 : -1), first = cur < 0, old = curRoot, oldUnmount = curUnmount;
    busy = true;
    App.setGo(null); App.backHook = null; App.popQ = null; phone.classList.remove("d5mode");
    if (first) { h1.innerHTML = def.title; plabel.textContent = def.label + " · " + (n + 1) + " of " + STEPS.length; fitH1(); }   /* the heading is in place before the step measures its room */
    var root = document.createElement("div"); root.className = "step s" + (n + 1); root.dataset.step = def.id;
    stage.appendChild(root);
    curUnmount = def.mount(root, ctx()) || null; curRoot = root; cur = n;
    if (o.push !== false) { try { history[first || o.push === "replace" ? "replaceState" : "pushState"]({ s: n }, "", urlFor(n)); } catch (e) {} }
    $(".prog").setAttribute("aria-label", "Step " + (n + 1) + " of " + STEPS.length);
    backBtn.setAttribute("aria-label", n ? "Back" : "Back to the Wonderland home page");

    var setTexts = function () { h1.innerHTML = def.title; plabel.textContent = def.label + " · " + (n + 1) + " of " + STEPS.length; fitH1(); };
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
        WLProgress.choose("type", el.dataset.t); App.dimGo(false); App.next(380);
      });
    });
    /* the Next arrow is there from the start: faded until a choice is made (or already made, coming back) */
    App.setGo(function () { App.next(120); }, null, !WLProgress.choices().type);
    App.hintFn = function () { $$(".half", root).forEach(function (h) { if (h.animate && !reduce) h.animate([{ transform: "scale(1)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }], { duration: 520, easing: "ease-in-out" }); }); };
  }

  /* ============================== Step 2: how much room ============================== */
  function s2(root) {
    /* three equally weighted options in one row, each with its name and one measurement under it */
    var SIZES = [
      { k: "compact",  nm: "Compact",  ln: "17′09″ – 20′", w: 76, ink: [-5.5, -3.4], src: "assets/img/build/size-compact.png" },
      { k: "mid",      nm: "Mid-size", ln: "20′06″ – 22′", w: 85, ink: [-6.3, -1.1], src: "assets/img/build/size-mid.png" },
      { k: "spacious", nm: "Spacious", ln: "22′06″ – 24′", w: 94, ink: [-4.6, -3.1], src: "assets/img/build/size-spacious.png" }
    ];
    var tab = isTab(), W = Math.min(root.clientWidth || 327, tab ? 620 : 480), gx = Math.round(W * .035);
    var D = Math.round(Math.min((W - 2 * gx) / 3, tab ? 176 : 150)), ik = D / 88, tk = Math.max(.85, Math.min(1.35, D / 100));
    root.style.setProperty("--K", tk);
    var nudge = function (z, s) { var k = s / z.w; return 'translate(' + (-z.ink[0] * k).toFixed(2) + 'px,' + (-z.ink[1] * k).toFixed(2) + 'px)'; };
    root.innerHTML = '<div class="v9" style="width:' + W + 'px"><div class="wrap">' +
      SIZES.map(function (z, i) { var s = [50, 56, 60][i] * ik; return '<button class="p" data-k="' + z.k + '" style="width:' + D + 'px"><span class="disc cta" style="width:' + D + 'px;height:' + D + 'px"><img class="ico" src="' + z.src + '" alt="" style="width:' + s.toFixed(1) + 'px;transform:' + nudge(z, s) + '"></span><span class="nm">' + z.nm + '</span><span class="ln">' + z.ln + '</span></button>'; }).join("") + '</div></div>';
    $$(".p", root).forEach(function (b) { b.addEventListener("click", function () { b.classList.add("on"); WLProgress.choose("size", b.dataset.k); App.dimGo(false); App.next(380); }); });
    App.setGo(function () { App.next(120); }, null, !WLProgress.choices().size);
    App.hintFn = function () { $$(".p .disc", root).forEach(function (d) { if (d.animate && !reduce) d.animate([{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }], { duration: 520, easing: "ease-in-out" }); }); };
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
    var K = 1;
    if (isTab()) { var cs3 = getComputedStyle(content), av3 = content.clientHeight - parseFloat(cs3.paddingTop) - parseFloat(cs3.paddingBottom); K = Math.max(1, Math.min(1.5, av3 / 505)); }
    else { var cs3p = getComputedStyle(content), av3p = content.clientHeight - parseFloat(cs3p.paddingTop) - parseFloat(cs3p.paddingBottom); K = Math.max(.5, Math.min(1.3, av3p / 535, (content.clientWidth || 327) / 295)); }
    content.style.setProperty("--K", K);
    var HERO_DISC = 221 * K, HERO_W = 319 * K, MINI_DISC = 66 * K, MINI_W = +(MINI_DISC * HERO_W / HERO_DISC).toFixed(1), MS = 850;
    var heroK = (CHOICE_MODEL(c) && !off(BY[CHOICE_MODEL(c)]) ? CHOICE_MODEL(c) : (!off(BY.amaroo) ? "amaroo" : ms.filter(function (m) { return !off(m); })[0].k)), busy3 = false;   /* Amaroo is shown first unless the customer already chose another */
    function mv(m, w) { var h = w * m.H / 900; return '<img class="mv" src="assets/img/build/model-' + m.k + '.webp" alt="" style="width:' + w + 'px;--nx:' + (-m.ink[0] / 100 * w).toFixed(1) + 'px;--ny:' + (-m.ink[1] / 100 * h).toFixed(1) + 'px;--gy:' + (3 * w / 266).toFixed(2) + 'px;--sh:' + (6 * w / 266).toFixed(2) + 'px">'; }
    content.innerHTML = '<div class="hero"><button class="hov" id="heroBtn" type="button" style="display:flex;flex-direction:column;align-items:center"><span class="disc" id="heroDisc"></span><span class="nm" id="hNm"></span><span class="tag" id="hTag"></span><span class="pr" id="hPr"></span></button></div><div class="dock" id="dock"></div><div class="sr" id="live" aria-live="polite"></div>';
    var hero = $(".hero", content), dock = $("#dock", content), heroDisc = $("#heroDisc", content), hNm = $("#hNm", content), hPr = $("#hPr", content), hTag = $("#hTag", content), heroBtn = $("#heroBtn", content);
    function setHeroText(m) { hNm.textContent = m.nm; hTag.textContent = m.tag; hPr.className = "pr" + (off(m) ? " na" : ""); hPr.innerHTML = off(m) ? "Not offered in this size" : '<span class="pf">From</span><span class="pv">' + fmt(m.price) + '</span>'; }
    function setHero(k) { var m = BY[k]; heroK = k; heroDisc.style.width = heroDisc.style.height = HERO_DISC + "px"; heroDisc.innerHTML = mv(m, HERO_W); setHeroText(m); hero.classList.toggle("off", off(m)); App.dimGo(off(m)); }
    function miniHTML(m) { return '<button class="mini' + (off(m) ? ' off' : '') + '" type="button" data-k="' + m.k + '" aria-label="' + m.nm + (off(m) ? ', not offered in this size' : ', ' + fmt(m.price)) + '"><span class="disc hov" style="width:' + MINI_DISC + 'px;height:' + MINI_DISC + 'px">' + mv(m, MINI_W) + '</span><span class="nm">' + m.nm + '</span><span class="mp">' + (off(m) ? '' : fmt(m.price)) + '</span></button>'; }
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
      var texts = [hNm, hTag, hPr];
      btn.dataset.k = oldK; btn.classList.toggle("off", off(om)); btn.setAttribute("aria-label", om.nm + ", " + fmt(om.price));
      slotDisc.innerHTML = mv(om, MINI_W); $(".nm", btn).textContent = om.nm; $(".mp", btn).textContent = fmt(om.price);
      setHero(newK); heroDisc.style.visibility = "hidden"; slotDisc.style.visibility = "hidden";
      var done = function () { if (!busy3) return; busy3 = false; $$(".fly", content).forEach(function (f) { f.remove(); }); heroDisc.style.visibility = ""; slotDisc.style.visibility = ""; $("#live", content).textContent = nm.nm + ", " + nm.tag + (off(nm) ? "" : ", from " + fmt(nm.price)) + ". Selected."; };
      if (reduce || !heroDisc.animate) { done(); return; }
      var up = flier(nm, B);
      /* touch tablets: the flier moves on transform alone (an animated drop-shadow filter is the usual thing to stall on iPad Safari) */
      var sh = !isTab(), ks = [
        { offset: 0,   transform: tf(B, A, 1, 0),    easing: "cubic-bezier(.2,.8,.2,1)" },
        { offset: .55, transform: tf(B, B, 1.1, 16), easing: "ease-in-out" },
        { offset: .8,  transform: tf(B, B, 0.97, 0), easing: "ease-out" },
        { offset: 1,   transform: tf(B, B, 1, 0) }
      ];
      if (sh) { var fs = ["drop-shadow(0 0 0 rgba(0,0,0,0))", "drop-shadow(0 18px 16px rgba(0,0,0,.22))", "drop-shadow(0 6px 8px rgba(0,0,0,.12))", "drop-shadow(0 0 0 rgba(0,0,0,0))"]; ks.forEach(function (k, i) { k.filter = fs[i]; }); }
      up.animate(ks, { duration: MS, fill: "forwards" });
      var dn = flier(om, B);
      dn.animate([{ offset: 0, transform: tf(B, B, 1, 0), easing: "cubic-bezier(.5,0,.2,1)" }, { offset: .72, transform: tf(B, A, 1.08, 0), easing: "ease-out" }, { offset: 1, transform: tf(B, A, 1, 0) }], { duration: Math.round(MS * .77), fill: "forwards" });
      texts.forEach(function (t, i) { t.animate([{ opacity: 0, transform: "translateY(12px) scale(.94)" }, { opacity: 1, transform: "translateY(-2px) scale(1.04)", offset: .6 }, { opacity: 1, transform: "none" }], { duration: 380 * MS / 600, delay: (200 + i * 70) * MS / 600, fill: "backwards", easing: "cubic-bezier(.2,.9,.3,1.2)" }); });
      setTimeout(done, MS + 60);
    }
    var pick3 = function (d) {
      if (hero.classList.contains("off")) return;
      heroBtn.classList.add("on"); WLProgress.choose("model", heroK);
      App.next(d, fetchImgs(bedPrefetch(ctx()), 1200));
    };
    heroBtn.addEventListener("click", function () { pick3(380); });
    App.setGo(function () { pick3(160); }, null, false);
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
        '<div class="dg">' + drawIso(S.k, { crop: 7.2, blur: ISO.blur, wall: ISO.wall }) + '</div>' +
        '<div class="foot"><div class="leg">' + (hasT ? '<span><i style="background:' + TABLE[1] + '"></i>Side table</span>' : '') + (hasC ? '<span><i style="background:' + CHEST[1] + '"></i>Storage chest</span>' : '') + '</div></div>';
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
  var planImg = function (p) { return "assets/img/build/plans/" + p.code + ".webp"; };   /* the site's 3D renders with the white background cut away, so they sit on any colour */
  function bedPrefetch(c) { var D = plansFor(c); return D.plans.slice(0, 3).map(planImg); }
  var img = function (p, lazy) { return '<img data-ld src="' + planImg(p) + '" alt="" decoding="async"' + (lazy ? ' loading="lazy"' : '') + '>'; };

  /* ============================== Step 5, the chosen design: card swipe or side by side, with a filter sheet; price by the Next button ============================== */
  function s5app(root, c) {
    var D = plansFor(c), S = { sel: 0, mode: "swipe", f: { len: null, lay: null, door: null, bun: null } };
    root.classList.add("has-go");
    root.innerHTML = '<div class="pane"><div class="ctl5"></div><div class="body5"></div></div><div class="pf5"></div>';
    var ctl = $(".ctl5", root), body = $(".body5", root), pf = $(".pf5", root), sheet = null;
    var match = function (p, f) { return (f.len == null || p.len === f.len) && (f.lay == null || p.lname === f.lay) && (f.door == null || p.door === f.door) && (f.bun == null || p.bunks === f.bun); };
    var L = function () { return D.plans.filter(function (p) { return match(p, S.f); }); };
    var nActive = function () { return ["len", "lay", "door", "bun"].filter(function (k) { return S.f[k] != null; }).length; };
    var deltaTxt = function (p) { var d = Math.round(p.price - D.base); return d ? "+" + fmt(d) + " on the base plan" : "The base plan"; };

    function footer() {
      var l = L(), p = l[S.sel];
      if (!p) { pf.innerHTML = ""; App.setGo(null); return; }
      pf.innerHTML = '<span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span><span class="fl">' + deltaTxt(p) + '</span>';
    }
    function drawCtl() {
      var n = nActive();
      ctl.innerHTML = '<div class="vt" role="group" aria-label="View"><button type="button" data-m="swipe" class="' + (S.mode === "swipe" ? "on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="3"/></svg>Swipe</button><button type="button" data-m="grid" class="' + (S.mode === "grid" ? "on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="7" height="6" rx="2"/><rect x="13" y="5" width="7" height="6" rx="2"/><rect x="4" y="13" width="7" height="6" rx="2"/><rect x="13" y="13" width="7" height="6" rx="2"/></svg>Side by side</button></div>' +
        '<button type="button" class="fb' + (n ? " on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/></svg>Filter' + (n ? '<i>' + n + '</i>' : '') + '</button>';
      $$(".vt button", ctl).forEach(function (b) { b.addEventListener("click", function () { if (S.mode !== b.dataset.m) { S.mode = b.dataset.m; drawCtl(); drawBody(); } }); });
      $(".fb", ctl).addEventListener("click", openSheet);
    }
    function drawBody() {
      var l = L(); if (S.sel >= l.length) S.sel = 0;
      if (!l.length) { body.innerHTML = '<div class="empty">No plans match those filters.<br><button type="button" class="lnk" id="clr5">Clear filters</button></div>'; $("#clr5", body).addEventListener("click", function () { S.f = { len: null, lay: null, door: null, bun: null }; S.sel = 0; drawCtl(); drawBody(); }); footer(); App.setGo(null); return; }
      if (S.mode === "swipe") drawSwipe(l); else drawGrid(l);
      footer();
      App.setGo(function () { var p = L()[S.sel]; if (p) { WLProgress.choose("plan", p.code); App.next(300); } });
    }
    function drawSwipe(l) {
      body.innerHTML = '<div class="rail3">' + l.map(function (p, i) { return '<div class="sl3"><span class="shot card">' + img(p, i > 1) + '</span><span class="info5"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span></div>'; }).join("") + '</div>' +
        '<div class="thumbs3">' + l.map(function (p, i) { return '<button class="t2" type="button" data-i="' + i + '" aria-label="Plan ' + (i + 1) + ' of ' + l.length + '"><img data-ld src="' + planImg(p) + '" alt="" decoding="async" loading="lazy"></button>'; }).join("") + '</div>';
      var rail = $(".rail3", body), strip = $(".thumbs3", body), ths = $$(".t2", body), pw = rail.clientWidth || 327;
      var paint = function (smooth) { ths.forEach(function (b, i) { b.classList.toggle("on", i === S.sel); }); var on = ths[S.sel]; if (on) { var want = on.offsetLeft - (pw - on.offsetWidth) / 2; if (strip.scrollTo) strip.scrollTo({ left: Math.max(0, want), behavior: smooth ? "smooth" : "auto" }); else strip.scrollLeft = Math.max(0, want); } };
      rail.addEventListener("scroll", function () { var i = Math.max(0, Math.min(l.length - 1, Math.round(rail.scrollLeft / pw))); if (i !== S.sel) { S.sel = i; paint(true); footer(); } });
      ths.forEach(function (b, i) { b.addEventListener("click", function () { rail.scrollTo ? rail.scrollTo({ left: i * pw, behavior: "smooth" }) : (rail.scrollLeft = i * pw); }); });
      rail.scrollLeft = S.sel * pw; paint(false); wireImgs(body);
    }
    function drawGrid(l) {
      body.innerHTML = '<div class="grid5">' + l.map(function (p, i) { var d = Math.round(p.price - D.base); return '<button class="tile5' + (i === S.sel ? " on" : "") + '" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot sm">' + img(p, i > 5) + '</span><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.ls + '</span><span class="tp"><b>' + fmt(p.price) + '</b>' + (d ? '<em>+' + fmt(d) + '</em>' : '<em>Base</em>') + '</span></button>'; }).join("") + '</div>';
      var tiles = $$(".tile5", body);
      tiles.forEach(function (b, i) { b.addEventListener("click", function () { S.sel = i; tiles.forEach(function (x, j) { x.classList.toggle("on", j === i); }); footer(); }); });
      var on = tiles[S.sel]; if (on && S.sel > 3) $(".grid5", body).scrollTop = Math.max(0, on.offsetTop - 8);
      wireImgs(body);
    }

    /* the filter sheet: Length, Layout, Door (and Bunks for families). One choice per group, or Any. The button says how many plans it will show. */
    function openSheet() {
      if (sheet) return;
      var tmp = {}; for (var k in S.f) tmp[k] = S.f[k];
      var uniq = function (get, sortf) { var seen = [], out = []; D.plans.forEach(function (p) { var v = get(p); if (v != null && v !== "" && seen.indexOf(v) < 0) { seen.push(v); out.push({ v: v, p: p }); } }); return sortf ? out.sort(sortf) : out; };
      var G = [
        { k: "len", title: "Length", opts: uniq(function (p) { return p.len; }, function (a, b) { return a.v - b.v; }).map(function (o) { return { v: o.v, l: o.p.lenTxt }; }) },
        { k: "lay", title: "Layout", opts: uniq(function (p) { return p.lname; }).map(function (o) { return { v: o.v, l: o.v }; }) },
        { k: "door", title: "Door", opts: uniq(function (p) { return p.door; }).map(function (o) { return { v: o.v, l: o.v }; }) },
        { k: "bun", title: "Bunks", opts: uniq(function (p) { return p.bunks || null; }, function (a, b) { return a.v - b.v; }).map(function (o) { return { v: o.v, l: o.v + (o.v > 1 ? " bunks" : " bunk") }; }) }
      ].filter(function (g) { return g.opts.length > 1 && (g.k !== "lay" || g.opts.length <= 8); });
      sheet = document.createElement("div"); sheet.className = "fsheet";
      var count = function () { return D.plans.filter(function (p) { return match(p, tmp); }).length; };
      function draw() {
        var n = count();
        sheet.innerHTML = '<div class="fpanel" role="dialog" aria-label="Filter the floorplans"><div class="fh"><b>Filter</b><button type="button" class="fx" aria-label="Close"><svg viewBox="0 0 18 18"><path d="M3 3l12 12M15 3L3 15"/></svg></button></div>' +
          G.map(function (g) { return '<div class="fg"><div class="ft5">' + g.title + '</div><div class="fchips">' + [{ v: null, l: "Any" }].concat(g.opts).map(function (o) { return '<button type="button" class="chip' + ((tmp[g.k] == null && o.v == null) || tmp[g.k] === o.v ? " on" : "") + '" data-g="' + g.k + '" data-v="' + (o.v == null ? "" : o.v) + '">' + o.l + '</button>'; }).join("") + '</div></div>'; }).join("") +
          '<div class="fbtns"><button type="button" class="fclear">Clear</button><button type="button" class="fshow"' + (n ? "" : " disabled") + '>' + (n ? "Show " + n + " plan" + (n > 1 ? "s" : "") : "No plans") + '</button></div></div>';
        $$(".chip", sheet).forEach(function (b) { b.addEventListener("click", function () { var g = G.filter(function (x) { return x.k === b.dataset.g; })[0], raw = b.dataset.v; tmp[b.dataset.g] = raw === "" ? null : (typeof g.opts[0].v === "number" ? +raw : raw); draw(); }); });
        $(".fclear", sheet).addEventListener("click", function () { tmp = { len: null, lay: null, door: null, bun: null }; draw(); });
        $(".fshow", sheet).addEventListener("click", function () { S.f = tmp; S.sel = 0; close(); drawCtl(); drawBody(); });
        $(".fx", sheet).addEventListener("click", close);
      }
      function close() { sheet.classList.remove("in"); var s = sheet; sheet = null; setTimeout(function () { s.remove(); }, 320); }
      sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); });
      draw(); phone.appendChild(sheet); void sheet.offsetWidth; sheet.classList.add("in");
    }
    drawCtl(); drawBody();
    body.addEventListener("scroll", function (e) { var s = e.target; if (s && s.scrollTop != null) ctl.classList.toggle("lift", s.scrollTop > 4); }, true);
    return function () { if (sheet) sheet.remove(); };
  }

  /* ============================== Step 5 as designed (Step 5 layout.svg): the chosen plan large in an outlined card, its length and layout, the price right-aligned,
     and a strip of the other plans beneath, each with its bunk count when it has bunks. Tap a plan in the strip to look at it; the Next arrow takes it on. ============================== */
  function s5design(root, c) {
    var D = plansFor(c), P = D.plans, saved = WLProgress.choices().plan, sel = Math.max(0, P.findIndex ? P.findIndex(function (p) { return p.code === saved; }) : 0);
    phone.classList.add("d5mode");
    root.classList.add("d5", "has-go");
    if (!P.length) { root.innerHTML = '<div class="pane"><div class="empty">No plans are available for that combination.</div></div>'; return; }
    root.innerHTML = '<div class="pane d5pane"><div class="d5hero"><img data-ld alt="" decoding="async"></div><div class="d5txt"><span class="ln"></span><span class="lt"></span><span class="ft"></span></div>' +
      '<div class="d5band">' + (P.some(function (p) { return p.bunks; }) ? '<div class="d5cap">The number on each plan is its bunk count</div>' : '') + '<div class="d5th">' + P.map(function (p, i) { return '<button type="button" class="d5t" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + (p.bunks ? ', ' + p.bunks + ' bunks' : '') + '"><img data-ld src="' + planImg(p) + '" alt="" decoding="async"' + (i > 2 ? ' loading="lazy"' : '') + '>' + (p.bunks ? '<i>' + p.bunks + '</i>' : '') + '</button>'; }).join("") + '</div></div></div>';
    var hero = $(".d5hero img", root), ln = $(".ln", root), lt = $(".lt", root), ft = $(".ft", root), ths = $$(".d5t", root), strip = $(".d5th", root), txt = $(".d5txt", root), band = $(".d5band", root);
    function show1(i, first) {
      sel = i; var p = P[i];
      ths.forEach(function (b, j) { b.classList.toggle("on", j === i); });
      var apply = function () { hero.classList.remove("ld"); hero.src = planImg(p); if (hero.complete && hero.naturalWidth) hero.classList.add("ld"); var cm = p.lay.indexOf(", "); ln.textContent = p.lenTxt; lt.textContent = cm < 0 ? p.lay : p.lay.slice(0, cm); ft.textContent = cm < 0 ? "" : p.lay.slice(cm + 2).replace(/^./, function (ch) { return ch.toUpperCase(); }); };
      if (first || reduce || !txt.animate) apply(); else { txt.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 300 }); setTimeout(apply, 140); }
      var on = ths[i]; if (on && strip.scrollTo) strip.scrollTo({ left: Math.max(0, on.offsetLeft - 12), behavior: first || reduce ? "auto" : "smooth" });
      App.setGo(function () { WLProgress.choose("plan", p.code); App.next(300); });
    }
    ths.forEach(function (b, i) { b.addEventListener("click", function () { if (i !== sel) show1(i, false); }); });
    wireImgs(root); show1(sel, true);
    if (P.length < 2) band.style.display = "none";
  }

  var variantOverride = null;
  function s5(root, c) {
    var D = plansFor(c), S = { bun: null, sel: 0 };
    var variant = variantOverride || (Q.match(/[?&]s5=(\w+)/) || [])[1] || "design";
    if (variant === "design") return s5design(root, c);
    if (variant === "app") return s5app(root, c);
    var V = VARIANTS[variant] ? VARIANTS[variant].v : v5card;
    root.classList.toggle("has-go", true);
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
      var sc = $(".list, .grid, .rows", pane), ch = $(".chips", pane); if (sc && ch) sc.addEventListener("scroll", function () { ch.classList.toggle("lift", sc.scrollTop > 4); });
    }
    render();
  }
  var rowTxt = function (p, d) { return '<span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span>'; };

  /* list: big cards, one under another, tap to choose */
  var v5list = {
    html: function (L) { return '<div class="list">' + L.map(function (p, i) { return '<button class="card" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot">' + img(p, i > 1) + '</span><span class="row"><span>' + rowTxt(p) + '</span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl" data-d="' + i + '"></span></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) { pickWire($$(".card", pane), L, S, H, "The base plan"); }
  };
  /* tap a plan to select it (it gets the orange outline); the Next arrow then appears and takes you on with it */
  function pickWire(els, L, S, H, baseTxt) {
    var saved = WLProgress.choices().plan; S.selCode = S.selCode || (saved && L.some(function (p) { return p.code === saved; }) ? saved : null);
    if (S.selCode && !L.some(function (p) { return p.code === S.selCode; })) S.selCode = null;
    var go = function (p) { App.setGo(function () { H.choose(p, null); }); };
    els.forEach(function (b) {
      var p = L[+b.dataset.i], fl = $(".fl", b); if (fl) fl.textContent = H.delta(p, baseTxt);
      b.classList.toggle("on", p.code === S.selCode);
      b.addEventListener("click", function () { S.selCode = p.code; els.forEach(function (x) { x.classList.toggle("on", x === b); }); go(p); });
    });
    var cur = L.filter(function (p) { return p.code === S.selCode; })[0]; if (cur) go(cur);
  }
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
  function swipe(slide, nav, opts) {
    opts = opts || {};
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
        if (!opts.noGo) App.setGo(function () { H.choose(L[S.sel], null); });
        if (opts.after) opts.after(pane, L, S, H);
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

  /* 6 sheet: the picture, and a white sheet that overlaps its foot with the facts, the price and an explicit "Choose this plan" button; dots */
  var v5sheet = swipe(function (p, i) { return pic(p, i) + '<span class="sheetp"><span class="row3 tight"><span class="who"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span>' + priceBlock(p) + '</span><button class="cta" type="button" data-i="' + i + '">Choose this plan</button></span>'; }, "dots", { noGo: true, after: function (pane, L, S, H) { $$(".cta", pane).forEach(function (b) { b.addEventListener("click", function () { H.choose(L[+b.dataset.i], b); }); }); } });
  /* 7 price first: the price is the headline above the picture; length and layout follow it; thumbnails */
  var v5pricefirst = swipe(function (p, i) { return '<span class="pf1"><span class="pr"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span></span><span class="fl"></span></span>' + pic(p, i) + '<span class="line"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span>'; }, "thumbs");
  var VARIANTS = {
    design: { n: "Supplied design", v: v5card }, app: { n: "Card + filter", v: v5card }, card: { n: "Card", v: v5card }, overlay: { n: "Overlay", v: v5overlay }, spec: { n: "Spec panel", v: v5spec }, pricebar: { n: "Price bar", v: v5pricebar }, center: { n: "Centred", v: v5center },
    sheet: { n: "Sheet + button", v: v5sheet }, pricefirst: { n: "Price first", v: v5pricefirst },
    hero: { n: "Hero + rows", v: v5hero }, grid: { n: "Grid", v: v5grid }, list: { n: "List", v: v5list }
  };
  App.variants = function () { return Object.keys(VARIANTS).map(function (k) { return { k: k, n: VARIANTS[k].n }; }); };
  App.setVariant = function (k) {
    variantOverride = k;
    try { history.replaceState(history.state, "", location.pathname + Q.replace(/([?&])s5=\w+&?/, "$1").replace(/[?&]$/, "") + (Q.indexOf("?") < 0 ? "?" : "&") + "s5=" + k + location.hash); } catch (e) {}
    if (cur === 4 && curRoot) { curRoot.innerHTML = ""; STEPS[4].mount(curRoot, ctx()); }
  };

  /* grid: two columns of smaller pictures, so more plans are on screen at once; tap to choose */
  var v5grid = {
    html: function (L) { return '<div class="grid">' + L.map(function (p, i) { return '<button class="tile" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot sm">' + img(p, i > 5) + '</span><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.ls + '</span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) { pickWire($$(".tile", pane), L, S, H, "Base"); }
  };

  /* ---- five layouts of the swipe, all inside the page margins. Each slide is one plan; the Next circle confirms the one on screen. ---- */
  function swipe(slide, nav, opts) {
    opts = opts || {};
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
        if (!opts.noGo) App.setGo(function () { H.choose(L[S.sel], null); });
        if (opts.after) opts.after(pane, L, S, H);
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

  /* 6 sheet: the picture, and a white sheet that overlaps its foot with the facts, the price and an explicit "Choose this plan" button; dots */
  var v5sheet = swipe(function (p, i) { return pic(p, i) + '<span class="sheetp"><span class="row3 tight"><span class="who"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span>' + priceBlock(p) + '</span><button class="cta" type="button" data-i="' + i + '">Choose this plan</button></span>'; }, "dots", { noGo: true, after: function (pane, L, S, H) { $$(".cta", pane).forEach(function (b) { b.addEventListener("click", function () { H.choose(L[+b.dataset.i], b); }); }); } });
  /* 7 price first: the price is the headline above the picture; length and layout follow it; thumbnails */
  var v5pricefirst = swipe(function (p, i) { return '<span class="pf1"><span class="pr"><span class="pfrom">From</span><span class="pv">' + fmt(p.price) + '</span></span><span class="fl"></span></span>' + pic(p, i) + '<span class="line"><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.lay + '</span></span>'; }, "thumbs");
  var VARIANTS = {
    design: { n: "Supplied design", v: v5card }, app: { n: "Card + filter", v: v5card }, card: { n: "Card", v: v5card }, overlay: { n: "Overlay", v: v5overlay }, spec: { n: "Spec panel", v: v5spec }, pricebar: { n: "Price bar", v: v5pricebar }, center: { n: "Centred", v: v5center },
    sheet: { n: "Sheet + button", v: v5sheet }, pricefirst: { n: "Price first", v: v5pricefirst },
    hero: { n: "Hero + rows", v: v5hero }, grid: { n: "Grid", v: v5grid }, list: { n: "List", v: v5list }
  };
  App.variants = function () { return Object.keys(VARIANTS).map(function (k) { return { k: k, n: VARIANTS[k].n }; }); };
  App.setVariant = function (k) {
    variantOverride = k;
    try { history.replaceState(history.state, "", location.pathname + Q.replace(/([?&])s5=\w+&?/, "$1").replace(/[?&]$/, "") + (Q.indexOf("?") < 0 ? "?" : "&") + "s5=" + k + location.hash); } catch (e) {}
    if (cur === 4 && curRoot) { curRoot.innerHTML = ""; STEPS[4].mount(curRoot, ctx()); }
  };

  /* grid: two columns of smaller pictures, so more plans are on screen at once; tap to choose */
  var v5grid = {
    html: function (L) { return '<div class="grid">' + L.map(function (p, i) { return '<button class="tile" type="button" data-i="' + i + '" aria-label="' + p.lenTxt + ', ' + p.lay + ', ' + fmt(p.price) + '"><span class="shot sm">' + img(p, i > 5) + '</span><span class="ln">' + p.lenTxt + '</span><span class="ft">' + p.ls + '</span><span class="pr"><span class="pv">' + fmt(p.price) + '</span><span class="fl"></span></span></button>'; }).join("") + '</div>'; },
    wire: function (pane, L, S, H) { $$(".tile", pane).forEach(function (b) { var p = L[+b.dataset.i]; $(".fl", b).textContent = H.delta(p, "Base"); b.addEventListener("click", function () { H.choose(p, b); }); }); }
  };

  /* ============================== Step 6: details (the contact form comes here) ============================== */
  var variant6Override = null;
  var STATES = ["New South Wales / ACT", "Northern Territory", "Queensland", "South Australia", "Victoria", "Western Australia", "Tasmania", "New Zealand"];
  var TYPE_N = { couples: "Couple’s", family: "Family" }, SIZE_N = { compact: "Compact", mid: "Mid-size", spacious: "Spacious" }, MODEL_N = { xtr: "XTR", solara: "Solara", hornet: "Hornet", amaroo: "Amaroo" };
  /* what the customer has built, for the recap and the price */
  function recap() {
    var cx = ctx(), C = WLProgress.choices(), D = plansFor(cx), plan = D.plans.filter(function (p) { return p.code === C.plan; })[0] || D.plans[0];
    return { cx: cx, plan: plan, bedKey: D.bed, bed: BEDLINE[D.bed] || "", model: MODEL_N[cx.model], type: TYPE_N[cx.type], size: SIZE_N[cx.size] };
  }
  var tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function recapHTML(R, editable) {
    var p = R.plan; if (!p) return "";
    return '<div class="rc"><span class="th"><img data-ld src="' + planImg(p) + '" alt=""></span><span class="tx"><b>' + R.model + ' · ' + R.size + ' · ' + R.type + '</b><span>' + R.bed + '</span><span>' + p.lenTxt + ' · ' + p.lay + '</span>' + (editable ? '<button type="button" class="rcedit">Customise<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' : '') + '</span></div>';
  }
  /* the pinned summary card on the chat screen: the words on the left, the customer's van on the right, changing every 2 seconds (model, bed, floorplan) */
  function cardHTML(R) {
    var p = R.plan; if (!p) return "";
    var cm = p.lay.indexOf(", "), main = cm < 0 ? p.lay : p.lay.slice(0, cm);
    return '<div class="rc6"><span class="tx"><b>' + R.model + ' · ' + R.size + ' · ' + R.type + '</b><span>' + R.bed + '</span><span>' + p.lenTxt + ' · ' + p.lay + '</span><button type="button" class="rcedit">Customise<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></span><span class="pic"><img alt=""></span></div>';
  }
  function cycleImgs(host, R) {
    var im = $(".pic img", host); if (!im || !R.plan) return null;
    var L = ["assets/img/build/model-" + (R.cx.model) + ".webp", "assets/img/build/bed-" + R.bedKey + ".webp", planImg(R.plan)], k = 0;
    L.forEach(function (u) { var x = new Image(); x.src = u; }); im.src = L[0];
    if (reduce) return null;
    return setInterval(function () {
      if (!im.isConnected) return;
      im.classList.add("dim"); setTimeout(function () { k = (k + 1) % L.length; im.src = L[k]; im.classList.remove("dim"); }, 950);
    }, 2000);
  }
  /* confetti: plain canvas, brand colours, about 2.5 seconds, nothing to load */
  function confetti() {
    if (reduce) return;
    var cv = document.createElement("canvas"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1, W = window.innerWidth, H = window.innerHeight, P = [], COL = ["#FFC47F", "#E37921", "#B04C07", "#FFE8C2", "#D57114", "#ffffff"];
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:80"; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); document.body.appendChild(cv);
    for (var n = 0; n < 120; n++) P.push({ x: W / 2 + (Math.random() - .5) * W * .6, y: -10 - Math.random() * 60, vx: (Math.random() - .5) * 4, vy: 1 + Math.random() * 3, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .35, c: COL[Math.random() * COL.length | 0], life: 0, max: 130 + Math.random() * 60 });
    (function tick() {
      cx.clearRect(0, 0, W, H);
      P = P.filter(function (p) { return p.life < p.max && p.y < H + 30; });
      P.forEach(function (p) { p.life++; p.vy += .22; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, (p.max - p.life) / 40)); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 1.6)) + 1); cx.restore(); });
      if (P.length) requestAnimationFrame(tick); else cv.remove();
    })();
  }
  function priceNear(R) { return R.plan ? '<div class="pf6"><span class="pfrom">From</span><span class="pv">' + fmt(R.plan.price) + '</span><span class="fl">Price as of ' + new Date().toLocaleDateString("en-AU") + '</span></div>' : ""; }
  /* the form fields, shared by all three layouts */
  var FIELDS = {
    first: { l: "First name", req: 1, ac: "given-name", type: "text" }, last: { l: "Last name", req: 1, ac: "family-name", type: "text" },
    phone: { l: "Phone", req: 1, ac: "tel", type: "tel", inputmode: "tel" }, email: { l: "Email", req: 1, ac: "email", type: "email", inputmode: "email" },
    tow: { l: "Tow vehicle", ac: "off", type: "text", ph: "e.g. Toyota LandCruiser 300" },
    state: { l: "State", req: 1, type: "select" }, date: { l: "Preferred delivery date", req: 1, type: "date" }
  };
  function fieldHTML(k, val) {
    var f = FIELDS[k], v = val || "", id = "f_" + k;
    var inp = f.type === "select" ? '<select id="' + id + '" name="' + k + '"><option value="">Choose a state</option>' + STATES.map(function (s) { return '<option' + (s === v ? " selected" : "") + '>' + s + '</option>'; }).join("") + '</select>'
      : '<input id="' + id + '" name="' + k + '" type="' + f.type + '"' + (f.inputmode ? ' inputmode="' + f.inputmode + '"' : "") + (f.ac ? ' autocomplete="' + f.ac + '"' : "") + (f.ph ? ' placeholder="' + f.ph + '"' : "") + ' value="' + v + '"' + (f.type === "date" ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : "") + '>';
    return '<label class="fld" data-k="' + k + '"><span class="fl6">' + f.l + (f.req ? "" : ' <i>optional</i>') + '</span>' + inp + '<span class="er"></span></label>';
  }
  var VALID = {
    first: function (v) { return v.trim() ? "" : "Please enter your first name"; }, last: function (v) { return v.trim() ? "" : "Please enter your last name"; },
    phone: function (v) { return v.replace(/[^\d]/g, "").length >= 8 ? "" : "Please enter a phone number we can call"; },
    email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address"; },
    tow: function () { return ""; }, state: function (v) { return v ? "" : "Please choose your state"; }, date: function (v) { return v ? "" : "Please choose a date"; }
  };
  function checkField(root, k, quiet) {
    var el = $('.fld[data-k="' + k + '"]', root), inp = $("input,select", el), msg = VALID[k](inp.value);
    if (!quiet || !msg) { el.classList.toggle("bad", !!msg); $(".er", el).textContent = msg; }
    return !msg;
  }
  function wireFields(root, keys, onChange) {
    keys.forEach(function (k) { var inp = $("#f_" + k, root); if (!inp) return; inp.addEventListener("blur", function () { if (inp.value) checkField(root, k); }); inp.addEventListener("input", function () { if ($('.fld[data-k="' + k + '"]', root).classList.contains("bad")) checkField(root, k, true); if (onChange) onChange(); }); });
  }
  var LEAD = { custom: null };
  function valuesOf(root) { var o = {}; Object.keys(FIELDS).forEach(function (k) { var i = $("#f_" + k, root); if (i) { o[k] = i.value; LEAD[k] = i.value; } else if (LEAD[k] != null) o[k] = LEAD[k]; }); return o; }
  /* send: for now nothing leaves the page; the details are kept for this visit so the real form can be wired in later */
  function finish(root, R, vals) {
    try { sessionStorage.setItem("wl-lead", JSON.stringify({ details: vals, custom: LEAD.custom, plan: R.plan && R.plan.code, at: new Date().toISOString() })); } catch (e) {}
    App.setGo(null); App.backHook = null;
    var name = (vals.first || "").trim();
    root.className = "step s6 done6";
    root.innerHTML = '<div class="thanks">' +
      '<h2>Thank you' + (name ? ', ' + name.replace(/[<>&]/g, "") : "") + '.</h2>' + (R.plan ? '<div class="rvp"><span class="pf">From</span><span class="pv">' + fmt(R.plan.price) + '</span><span class="pd">Price as of ' + new Date().toLocaleDateString("en-AU") + '</span></div>' : "") + '<p>' + (LEAD.custom === "customise" ? 'Your quote is on its way, and we’ll be in touch to keep customising your caravan with you.' : 'Your personalised quote is on its way to ' + (vals.email || "your inbox").replace(/[<>&]/g, "") + '.') + '</p>' + recapHTML(R) +
      '<button type="button" class="again">Start a new build</button></div>';
    wireImgs(root);
    confetti(); setTimeout(function () { var rv = $(".rvp", root); if (rv) rv.classList.add("on"); }, reduce ? 0 : 500);
    $(".again", root).addEventListener("click", function () { try { sessionStorage.removeItem("wl-choice"); sessionStorage.removeItem("wl-step"); } catch (e) {} LEAD = { custom: null }; show(0, { dir: -1, push: "replace" }); });
    root.animate && !reduce && $(".thanks", root).animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" });
  }
  function submitAll(root, R, keys) {
    var ok = true, first = null; keys.forEach(function (k) { if (!checkField(root, k)) { ok = false; if (!first) first = k; } });
    if (!ok) { var el = $('.fld[data-k="' + first + '"]', root); el.scrollIntoView && el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); var i = $("input,select", el); i && i.focus({ preventScroll: true }); return false; }
    finish(root, R, valuesOf(root)); return true;
  }
  var CUSTOM = [{ k: "quote", t: "No, just email me a quote", d: "A personalised quote, straight to your inbox." }, { k: "customise", t: "Yes, let’s keep customising", d: "Best on a PC or tablet. We’ll be in touch to continue." }];
  function customHTML() { return '<div class="cust" role="radiogroup" aria-label="Would you like to further customise your caravan?">' + CUSTOM.map(function (o) { return '<button type="button" role="radio" class="co' + (LEAD.custom === o.k ? " on" : "") + '" data-c="' + o.k + '" aria-checked="' + (LEAD.custom === o.k) + '"><span class="dot"></span><span><b>' + o.t + '</b><em>' + o.d + '</em></span></button>'; }).join("") + '</div>'; }

  function s6(root, c) {
    var v = variant6Override || (Q.match(/[?&]s6=(\w+)/) || [])[1] || "chat";
    return ({ scroll: s6scroll, steps: s6steps, one: s6one, review: s6review, chat: s6chat }[v] || s6scroll)(root, c);
  }
  /* A: one scrolling form. The recap on top, the choice, then the details; the price beside the send button. */
  function s6scroll(root) {
    var R = recap(), keys = ["first", "last", "phone", "email", "tow", "state", "date"];
    root.classList.add("form6");
    root.innerHTML = '<div class="pane6"><div class="scr">' + recapHTML(R) +
      '<div class="sec">Further customise your caravan?</div>' + customHTML() +
      '<div class="sec">Your details</div><p class="sub6">Complete your details to receive a personalised quote.</p>' +
      '<div class="row2c">' + fieldHTML("first", LEAD.first) + fieldHTML("last", LEAD.last) + '</div>' + fieldHTML("phone", LEAD.phone) + fieldHTML("email", LEAD.email) + fieldHTML("tow", LEAD.tow) + fieldHTML("state", LEAD.state) + fieldHTML("date", LEAD.date) +
      '<p class="fine">By sending, you agree we may contact you about this quote.</p></div></div>' + priceNear(R);
    $$(".co", root).forEach(function (b) { b.addEventListener("click", function () { LEAD.custom = b.dataset.c; $$(".co", root).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); $(".cust", root).classList.remove("bad"); }); });
    wireFields(root, keys); wireImgs(root);
    App.setGo(function () { if (!LEAD.custom) { var cu = $(".cust", root); cu.classList.add("bad"); cu.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); goBtn.classList.remove("on"); return; } if (!submitAll(root, R, keys)) goBtn.classList.remove("on"); }, "tick");
  }
  /* B: two quick screens. First the choice, then the details; Back goes from the second to the first. */
  function s6steps(root) {
    var R = recap(), keys = ["first", "last", "phone", "email", "tow", "state", "date"], at = 1;
    root.classList.add("form6");
    root.innerHTML = '<div class="pane6"><div class="dots6"><i class="on"></i><i></i></div><div class="sub" id="sub"></div></div><div id="pfw"></div>';
    var sub = $("#sub", root), pfw = $("#pfw", root);
    function draw(n, dir) {
      at = n; var html;
      if (n === 1) html = '<h3 class="q">How would you like your quote?</h3>' + customHTML() + '<p class="fine">Prices shown are a guide and may change.</p>';
      else html = '<h3 class="q">Where should we send it?</h3><div class="scr2">' + recapHTML(R) + '<div class="row2c">' + fieldHTML("first", LEAD.first) + fieldHTML("last", LEAD.last) + '</div>' + fieldHTML("phone", LEAD.phone) + fieldHTML("email", LEAD.email) + fieldHTML("tow", LEAD.tow) + fieldHTML("state", LEAD.state) + fieldHTML("date", LEAD.date) + '</div>';
      var el = document.createElement("div"); el.className = "subin"; el.innerHTML = html; var old = sub.firstChild; sub.appendChild(el);
      $$(".dots6 i", root).forEach(function (d, i) { d.classList.toggle("on", i === n - 1); });
      if (old) { anim(old, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-30 * dir) + "px)" }], { duration: 220, fill: "forwards" }); setTimeout(function () { old.remove(); }, reduce ? 0 : 230); anim(el, [{ opacity: 0, transform: "translateX(" + (30 * dir) + "px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 90, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); }
      if (n === 1) { App.setGo(null); pfw.innerHTML = ""; App.backHook = null; $$(".co", el).forEach(function (b) { b.addEventListener("click", function () { LEAD.custom = b.dataset.c; $$(".co", el).forEach(function (x) { x.classList.toggle("on", x === b); }); setTimeout(function () { draw(2, 1); }, 280); }); }); }
      else { pfw.innerHTML = priceNear(R); wireFields(el, keys); wireImgs(el); App.backHook = function () { draw(1, -1); return true; }; App.setGo(function () { if (!submitAll(root, R, keys)) goBtn.classList.remove("on"); }, "tick"); }
    }
    draw(LEAD.custom ? 2 : 1, 1);
  }
  /* C: one question at a time, big and simple, like a conversation. Next moves on; Back steps back through the questions. */
  function s6one(root) {
    var R = recap(), Qs = [
      { id: "custom", q: "Would you like to keep customising your caravan?", type: "choice" },
      { id: "name", q: "What’s your name?", keys: ["first", "last"] }, { id: "phone", q: "What’s the best number to reach you on?", keys: ["phone"] }, { id: "email", q: "And your email address?", keys: ["email"] },
      { id: "tow", q: "What will you tow it with?", keys: ["tow"], skip: 1 }, { id: "state", q: "Which state are you in?", keys: ["state"] }, { id: "date", q: "When would you like it delivered?", keys: ["date"] }
    ], i = 0;
    root.classList.add("form6", "one6");
    root.innerHTML = '<div class="pane6"><div class="bars6"></div><div class="sub" id="sub"></div></div><div id="pfw"></div>';
    var sub = $("#sub", root), pfw = $("#pfw", root), bars = $(".bars6", root);
    function draw(n, dir) {
      i = n; var Qn = Qs[n], el = document.createElement("div"); el.className = "subin q1";
      bars.innerHTML = Qs.map(function (_, j) { return '<i class="' + (j < n ? "d" : j === n ? "on" : "") + '"></i>'; }).join("");
      el.innerHTML = '<h3 class="q">' + Qn.q + '</h3>' + (Qn.type === "choice" ? customHTML() : '<div class="fq">' + Qn.keys.map(function (k) { return fieldHTML(k, LEAD[k]); }).join("") + '</div>' + (Qn.skip ? '<button type="button" class="skip">Skip this</button>' : ''));
      var old = sub.firstChild; sub.appendChild(el);
      if (old) { anim(old, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-30 * dir) + "px)" }], { duration: 220, fill: "forwards" }); setTimeout(function () { old.remove(); }, reduce ? 0 : 230); anim(el, [{ opacity: 0, transform: "translateX(" + (30 * dir) + "px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 90, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); }
      App.backHook = n ? function () { draw(n - 1, -1); return true; } : null;
      var advance = function () { if (n < Qs.length - 1) draw(n + 1, 1); else { var ks = ["first", "last", "phone", "email", "tow", "state", "date"]; ks.forEach(function (k) { if (!$("#f_" + k, root)) return; }); valuesOf(root); finish(root, R, collect()); } };
      if (Qn.type === "choice") { pfw.innerHTML = ""; App.setGo(null); $$(".co", el).forEach(function (b) { b.addEventListener("click", function () { LEAD.custom = b.dataset.c; $$(".co", el).forEach(function (x) { x.classList.toggle("on", x === b); }); setTimeout(advance, 280); }); }); }
      else {
        pfw.innerHTML = priceNear(R); wireFields(el, Qn.keys);
        var go = function () { var ok = true; Qn.keys.forEach(function (k) { var inp = $("#f_" + k, el); if (inp) LEAD[k] = inp.value; if (!(Qn.skip && !inp.value) && !checkField(el, k)) ok = false; }); if (!ok) { goBtn.classList.remove("on"); return; } advance(); };
        App.setGo(go, n === Qs.length - 1 ? "tick" : null);
        var sk = $(".skip", el); if (sk) sk.addEventListener("click", function () { LEAD.tow = ""; advance(); });
        var first = $("input,select", el); if (first && !reduce) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 420);
        $$("input", el).forEach(function (inp) { inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); goBtn.click(); } }); });
      }
    }
    function collect() { var o = {}; Object.keys(FIELDS).forEach(function (k) { o[k] = LEAD[k] || ""; }); return o; }
    draw(0, 1);
  }
  /* D: review first. A proper look at what has been built, with a Change link on every line, then the details. */
  function s6review(root) {
    var R = recap(), keys = ["first", "last", "phone", "email", "tow", "state", "date"], p = R.plan;
    root.classList.add("form6");
    root.innerHTML = '<div class="pane6"><div class="dots6"><i class="on"></i><i></i></div><div class="sub" id="sub"></div></div><div id="pfw"></div>';
    var sub = $("#sub", root), pfw = $("#pfw", root);
    var rows = [["Layout", R.type, 0], ["Size", R.size, 1], ["Model", R.model, 2], ["Bed", R.bed, 3], ["Floorplan", p ? p.lenTxt + " · " + p.lay : "", 4]];
    function draw(n, dir) {
      var html;
      if (n === 1) html = '<h3 class="q">Your caravan</h3>' + (p ? '<span class="shot rv"><img data-ld src="' + planImg(p) + '" alt=""></span>' : '') + '<div class="spec6">' + rows.map(function (r) { return '<div class="sr6"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span><button type="button" class="chg" data-go="' + r[2] + '">Change</button></div>'; }).join("") + '</div>';
      else html = '<h3 class="q">Where should we send your quote?</h3><div class="scr2"><div class="sec first">Further customise?</div>' + customHTML() + '<div class="sec">Your details</div><div class="row2c">' + fieldHTML("first", LEAD.first) + fieldHTML("last", LEAD.last) + '</div>' + fieldHTML("phone", LEAD.phone) + fieldHTML("email", LEAD.email) + fieldHTML("tow", LEAD.tow) + fieldHTML("state", LEAD.state) + fieldHTML("date", LEAD.date) + '</div>';
      var el = document.createElement("div"); el.className = "subin"; el.innerHTML = html; var old = sub.firstChild; sub.appendChild(el);
      $$(".dots6 i", root).forEach(function (d, i) { d.classList.toggle("on", i === n - 1); });
      if (old) { anim(old, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-30 * dir) + "px)" }], { duration: 220, fill: "forwards" }); setTimeout(function () { old.remove(); }, reduce ? 0 : 230); anim(el, [{ opacity: 0, transform: "translateX(" + (30 * dir) + "px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 90, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); }
      pfw.innerHTML = priceNear(R); wireImgs(el);
      if (n === 1) { App.backHook = null; $$(".chg", el).forEach(function (b) { b.addEventListener("click", function () { if (!busy) show(+b.dataset.go, { dir: -1, push: "replace" }); }); }); App.setGo(function () { draw(2, 1); }); }
      else {
        $$(".co", el).forEach(function (b) { b.addEventListener("click", function () { LEAD.custom = b.dataset.c; $$(".co", el).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); $(".cust", el).classList.remove("bad"); }); });
        wireFields(el, keys); App.backHook = function () { draw(1, -1); return true; };
        App.setGo(function () { if (!LEAD.custom) { var cu = $(".cust", el); cu.classList.add("bad"); cu.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); goBtn.classList.remove("on"); return; } if (!submitAll(root, R, keys)) goBtn.classList.remove("on"); }, "tick");
      }
    }
    draw(1, 1);
  }
  /* E: chat. The app asks in bubbles, the customer answers by typing or tapping a reply; the circle sends. */
  /* Customise: every choice made on the way here can be changed from one sheet, with the price following along. Changing an earlier choice quietly
     re-checks the later ones (a model not offered in that size, a bed or floorplan that no longer exists) and keeps the nearest valid answer. */
  function openCustomise(onChange) {
    var c0 = ctx(), D0 = plansFor(c0), st = { type: c0.type, size: c0.size, model: c0.model, bed: D0.bed, plan: WLProgress.choices().plan || (D0.plans[0] && D0.plans[0].code) };
    var sheet = document.createElement("div"); sheet.className = "fsheet cust";
    var SZ = [["compact", "Compact"], ["mid", "Mid-size"], ["spacious", "Spacious"]], TY = [["couples", "Couple’s"], ["family", "Family"]];
    function reval() {
      var tab = MPRICES[st.type + "|" + st.size] || {};
      if (tab[st.model] === undefined) { var f = MODELS.filter(function (m) { return tab[m.k] !== undefined; })[0]; if (f) st.model = f.k; }
      var beds = wlBeds(st.type, st.size, st.model).filter(function (b) { return b.price !== null; });
      if (!beds.some(function (b) { return b.key === st.bed; })) st.bed = (beds.slice().sort(function (a, b) { return a.price - b.price; })[0] || {}).key;
      var D = plansFor({ type: st.type, size: st.size, model: st.model, bed: st.bed }); st.bed = D.bed;
      if (!D.plans.some(function (p) { return p.code === st.plan; })) st.plan = D.plans[0] && D.plans[0].code;
      return { D: D, beds: beds, tab: tab };
    }
    function chip(g, v, label, on, off) { return '<button type="button" class="chip' + (on ? " on" : "") + '" data-g="' + g + '" data-v="' + v + '"' + (off ? " disabled" : "") + '>' + label + '</button>'; }
    function draw() {
      var X = reval(), D = X.D, pl = D.plans.filter(function (p) { return p.code === st.plan; })[0];
      var oldP = $(".fpanel", sheet), keepY = oldP ? oldP.scrollTop : 0;
      sheet.innerHTML = '<div class="fpanel" role="dialog" aria-label="Customise your caravan"><div class="fh"><b>Customise</b><button type="button" class="fx" aria-label="Close without saving"><svg viewBox="0 0 18 18"><path d="M3 3l12 12M15 3L3 15"/></svg></button></div>' +
        '<div class="fg"><div class="ft5">Who’s coming along</div><div class="fchips">' + TY.map(function (o) { return chip("type", o[0], o[1], st.type === o[0]); }).join("") + '</div></div>' +
        '<div class="fg"><div class="ft5">Size</div><div class="fchips">' + SZ.map(function (o) { return chip("size", o[0], o[1], st.size === o[0]); }).join("") + '</div></div>' +
        '<div class="fg"><div class="ft5">Model</div><div class="fchips">' + MODELS.map(function (m) { var p = X.tab[m.k]; return chip("model", m.k, m.nm + (p !== undefined ? ' · <span class="px">' + fmt(p) + '</span>' : ''), st.model === m.k, p === undefined); }).join("") + '</div>' + (MODELS.some(function (m) { return X.tab[m.k] === undefined; }) ? '<div class="cnote">Greyed models are not offered in this size.</div>' : '') + '</div>' +
        '<div class="fg"><div class="ft5">Bed</div><div class="fchips">' + X.beds.map(function (b) { return chip("bed", b.key, b.group + ' · ' + b.short, st.bed === b.key); }).join("") + '</div></div>' +
        '<div class="fg"><div class="ft5">Floorplan</div><div class="fchips">' + D.plans.map(function (p) { return chip("plan", p.code, p.lenTxt + ' · ' + p.ls, st.plan === p.code); }).join("") + '</div></div>' +
        '<div class="cprice"><span class="cp"><span class="pfrom">From</span><span class="pv">' + (pl ? fmt(pl.price) : "") + '</span></span><button type="button" class="fshow">Done</button></div></div>';
      $$(".chip", sheet).forEach(function (b) { b.addEventListener("click", function () { st[b.dataset.g] = b.dataset.v; draw(); }); });
      $(".fpanel", sheet).scrollTop = keepY;
      $(".fx", sheet).addEventListener("click", close);
      $(".fshow", sheet).addEventListener("click", function () {
        WLProgress.choose("type", st.type); WLProgress.choose("size", st.size); WLProgress.choose("model", st.model); WLProgress.choose("bed", st.bed); WLProgress.choose("plan", st.plan);
        edited = true; close(); onChange();
      });
    }
    function close() { sheet.classList.remove("in"); phone.classList.remove("sheet-open"); var s = sheet; setTimeout(function () { s.remove(); }, 320); }
    sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); });
    /* the page behind is locked: only the pop-up scrolls (a touch or wheel anywhere else, or on a pop-up that has nothing to scroll, is stopped) */
    function guard(e) { var p = $(".fpanel", sheet); if (!p || !p.contains(e.target) || p.scrollHeight <= p.clientHeight + 1) e.preventDefault(); }
    sheet.addEventListener("touchmove", guard, { passive: false }); sheet.addEventListener("wheel", guard, { passive: false });
    draw(); phone.appendChild(sheet); phone.classList.add("sheet-open"); void sheet.offsetWidth; sheet.classList.add("in");
  }
  function s6chat(root) {
    var R = recap(), thread, reply, psub, i = 0, marks = [], busyQ = false, qDepth = 0;
    root.classList.add("form6", "chat6");
    root.innerHTML = '<div class="pane6"><div class="psub"></div><div class="thread"></div><div class="reply"></div></div>';
    thread = $(".thread", root); reply = $(".reply", root); psub = $(".psub", root);
    /* the price is the subheading under the page heading, pinned: it stays put while the chat scrolls and follows any change made in Customise */
var cyc = null;
    function drawPrice() { if (cyc) clearInterval(cyc); psub.innerHTML = cardHTML(R); cyc = cycleImgs(psub, R); var b = $(".rcedit", psub); if (b) b.addEventListener("click", function () { openCustomise(function () { R = recap(); drawPrice(); }); }); }
    function drawCard() {}
    drawPrice();
    var esc = function (s) { return String(s).replace(/[<>&]/g, ""); };
    var Qs = [
      { k: "custom", q: "Hi! Here’s the caravan you’ve built. Would you like to keep customising it, or shall I just email you a quote?", type: "choice" },
      { k: "first", q: "Great. What’s your first name?", ph: "First name" },
      { k: "last", q: function () { return "Nice to meet you, " + esc(LEAD.first) + ". And your last name?"; }, ph: "Last name" },
      { k: "phone", q: "What’s the best number to reach you on?", ph: "Phone", type: "tel" },
      { k: "email", q: "And your email address?", ph: "Email", type: "email" },
      { k: "tow", q: "What will you tow it with? You can skip this one.", ph: "Tow vehicle", skip: 1 },
      { k: "state", q: "Which state are you in?", type: "chips" },
      { k: "date", q: "Last one: when would you like it delivered?", type: "date" }
    ];
    var node = function (cls, html) { var d = document.createElement("div"); d.className = cls; d.innerHTML = html; thread.appendChild(d); thread.scrollTop = thread.scrollHeight; setTimeout(function () { thread.scrollTop = thread.scrollHeight; }, 330); if (!reduce && d.animate) d.animate([{ opacity: 0, transform: "translateY(10px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "cubic-bezier(.2,.9,.3,1.2)" }); return d; };
    function bot(h) { return node("bub bot", h); } function me(h) { return node("bub me", h); }
    function ask(n, instant) {
      if (!instant) { try { history.pushState({ s: 5, q: n }, "", location.href); qDepth++; } catch (e) {} }     /* each new question is a history step, so the device Back gesture undoes a reply too */
      i = n; marks[n] = thread.children.length; App.setGo(null); reply.innerHTML = ""; busyQ = true;
      var Qn = Qs[n], q = typeof Qn.q === "function" ? Qn.q() : Qn.q;
      var show1 = function () {
        var typing = $(".typing", thread); if (typing) typing.remove();
        bot(q); busyQ = false; drawReply(Qn, n);
      };
      if (instant || reduce) show1(); else { node("bub bot typing", "<i></i><i></i><i></i>"); setTimeout(show1, 520); }
    }
    function answer(label, nextFn) { me(esc(label)); setTimeout(nextFn, 260); }
    function drawReply(Qn, n) {
      App.backHook = n > 0 ? function () { if (busyQ) return true; if (qDepth > 0) { history.back(); return true; } undo(); return true; } : null;
      if (Qn.type === "choice") { reply.innerHTML = '<div class="rchips">' + CUSTOM.map(function (o) { return '<button type="button" class="rc1" data-c="' + o.k + '">' + o.t + '</button>'; }).join("") + '</div>'; $$(".rc1", reply).forEach(function (b) { b.addEventListener("click", function () { LEAD.custom = b.dataset.c; reply.innerHTML = ""; answer(b.textContent, function () { ask(n + 1); }); }); }); return; }
      if (Qn.type === "chips") { reply.innerHTML = '<div class="rchips wrap">' + STATES.map(function (s) { return '<button type="button" class="rc1" data-s="' + s + '">' + s + '</button>'; }).join("") + '</div>'; $$(".rc1", reply).forEach(function (b) { b.addEventListener("click", function () { LEAD.state = b.dataset.s; reply.innerHTML = ""; answer(b.dataset.s, function () { ask(n + 1); }); }); }); return; }
      var type = Qn.type === "date" ? "date" : (Qn.type || "text"), last = n === Qs.length - 1;
      reply.innerHTML = '<div class="box"><input id="cin" type="' + type + '"' + (Qn.ph ? ' placeholder="' + Qn.ph + '"' : "") + (type === "date" ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : "") + ' autocomplete="off" value="' + esc(LEAD[Qn.k] || "") + '"></div>' + (Qn.skip ? '<button type="button" class="skip">Skip</button>' : "");
      var inp = $("#cin", reply);
      var send = function () {
        var v = inp.value; if (!(Qn.skip && !v)) { var msg = VALID[Qn.k](v); if (msg) { bot("Hmm, " + msg.charAt(0).toLowerCase() + msg.slice(1) + "."); goBtn.classList.remove("on"); return; } }
        LEAD[Qn.k] = v; App.setGo(null); reply.innerHTML = "";
        var shown = Qn.type === "date" && v ? new Date(v + "T00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : (v || "Skip");
        answer(shown, function () { if (last) { bot("Perfect. Sending your quote now."); setTimeout(function () { finish(root, R, collect()); }, 700); } else ask(n + 1); });
      };
      App.setGo(send, last ? "tick" : null);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); goBtn.click(); } });
      var sk = $(".skip", reply); if (sk) sk.addEventListener("click", function () { inp.value = ""; send(); });
      if (!reduce) setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 350);
    }
    function undoTo(n) { if (n >= i) return; qDepth = Math.max(0, n); while (thread.children.length > marks[n]) thread.removeChild(thread.lastChild); ask(n, true); }
    function undo() { if (busyQ || i < 1) return; undoTo(i - 1); }
    App.popQ = function (q) { undoTo(q); };
    function collect() { var o = {}; Object.keys(FIELDS).forEach(function (k) { o[k] = LEAD[k] || ""; }); return o; }
    thread.innerHTML = ""; ask(0, true);
  }
  App.variants6 = function () { return [{ k: "scroll", n: "1 · One form" }, { k: "steps", n: "2 · Two screens" }, { k: "one", n: "3 · One question at a time" }, { k: "review", n: "4 · Review, then details" }, { k: "chat", n: "5 · Chat" }]; };
  App.setVariant6 = function (k) { variant6Override = k; LEAD = { custom: null }; if (cur === 5 && curRoot) { curRoot.className = "step s6"; curRoot.innerHTML = ""; App.setGo(null); App.backHook = null; STEPS[5].mount(curRoot, ctx()); } };

  /* ============================== start ============================== */
  STEPS = [
    { id: "layout",  label: "Layout",    title: "Who&rsquo;s coming <br>along?", mount: s1 },
    { id: "size",    label: "Size",      title: "Choose your <br>size", mount: s2 },
    { id: "model",   label: "Model",     title: "Choose your <br>model", mount: s3 },
    { id: "bed",     label: "Bed",       title: "Choose your <br>bed setup", mount: s4 },
    { id: "plan",    label: "Floorplan", title: "Choose your <br>floorplan", mount: s5 },
    { id: "details", label: "Details",   title: "Get your <br>quote", mount: s6 }
  ];
  function indexOf(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i; return -1; }
  function init() {
    phone = $("#phone"); stage = $("#stage"); h1 = $("#h1"); plabel = $("#plabel"); road = $(".road"); backBtn = $("#back"); goBtn = $("#go");
    if (/[?&]guides/.test(Q)) phone.classList.add("guides");
    /* the on-screen keyboard: the app follows the visible part of the screen, so the chat box sits just above the keyboard */
    var vv = window.visualViewport;
    window.WLApp = App;
    App.applyKb = function (h, top, open) {
      var root = document.documentElement;
      root.classList.toggle("kb", !!open);
      if (open) { phone.style.height = h + "px"; phone.style.top = top + "px"; }
      else { phone.style.height = ""; phone.style.top = ""; }
      if (open) { var th = $(".thread", phone); if (th) { th.scrollTop = th.scrollHeight; setTimeout(function () { th.scrollTop = th.scrollHeight; }, 120); } }
    };
    if (vv) {
      var kbRaf = 0, kbSync = function () {
        kbRaf = 0;
        var open = window.innerHeight - vv.height > 120;                       /* the visible part of the screen is much shorter than the page: a keyboard is up */
        App.applyKb(vv.height, vv.pageTop != null ? vv.pageTop : vv.offsetTop + window.scrollY, open);
      };
      var kbQueue = function () { if (!kbRaf) kbRaf = requestAnimationFrame(kbSync); };
      vv.addEventListener("resize", kbQueue); vv.addEventListener("scroll", kbQueue);
      document.addEventListener("focusin", function (e) { if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { setTimeout(kbQueue, 250); setTimeout(kbQueue, 600); } });
      document.addEventListener("focusout", function () { setTimeout(kbQueue, 250); });
    }
    if (/[?&]compare/.test(Q)) {                         /* ?compare: a bar of floorplan layouts to switch between on one page */
      document.body.classList.add("cmp");
      var bar = document.createElement("div"); bar.className = "cmpbar"; bar.id = "cmpbar";
      var cv = (Q.match(/[?&]s5=(\w+)/) || [])[1] || "list";
      var cv6 = (Q.match(/[?&]s6=(\w+)/) || [])[1] || "chat";
      bar.innerHTML = '<div class="cg g5"><b>Floorplan</b>' + App.variants().map(function (v) { return '<button type="button" data-k="' + v.k + '"' + (v.k === cv ? ' class="on"' : '') + '>' + v.n + '</button>'; }).join("") + '</div><div class="cg g6"><b>Details</b>' + App.variants6().map(function (v) { return '<button type="button" data-k6="' + v.k + '"' + (v.k === cv6 ? ' class="on"' : '') + '>' + v.n + '</button>'; }).join("") + '</div>';
      document.body.insertBefore(bar, document.body.firstChild);
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        if (b.dataset.k6) { $$("button[data-k6]", bar).forEach(function (x) { x.classList.toggle("on", x === b); }); if (cur !== 5) { variant6Override = b.dataset.k6; show(5, { dir: 1 }); } else App.setVariant6(b.dataset.k6); return; }
        $$("button[data-k]", bar).forEach(function (x) { x.classList.toggle("on", x === b); });
        if (cur !== 4) { variantOverride = b.dataset.k; show(4, { dir: 1 }); } else App.setVariant(b.dataset.k);
      });
    }
    var relayout = function () { if (applyGate() && cur >= 0 && cur < 5 && curRoot) { curRoot.innerHTML = ""; if (curUnmount) curUnmount(); curUnmount = STEPS[cur].mount(curRoot, ctx()) || null; } };
    window.addEventListener("resize", relayout); window.addEventListener("orientationchange", function () { setTimeout(relayout, 250); });
    goBtn.addEventListener("click", function () { if (!goFn) return; if (goBtn.classList.contains("dim")) { if (App.hintFn) App.hintFn(); if (!reduce && goBtn.animate) goBtn.animate([{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 300 }); return; } goBtn.classList.add("on"); goFn(); });
    backBtn.addEventListener("click", function (e) { if (App.backHook && App.backHook()) { e.preventDefault(); return; } if (cur > 0) { e.preventDefault(); if (!busy) show(cur - 1, { dir: -1, push: "replace" }); } });
    window.addEventListener("popstate", function (e) { var s = e.state && e.state.s; if (s == null) s = Math.max(0, indexOf((location.hash || "").slice(1))); if (s === cur && App.popQ) { App.popQ((e.state && e.state.q) || 0); return; } if (s !== cur) show(s, { push: false }); });
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
