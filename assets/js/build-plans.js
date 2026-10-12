/* Build your Caravan: simplified top-down floor plans, drawn from a floorplan code.
   Not renders and not to survey accuracy: a clean plan that shows what a customer is actually choosing between.
   The layouts were decoded from the live configurator's own floorplan renders (see HANDOFF notes); family (bunk) plans are not drawn yet.

   WLPlans.spec(code, bedKey)   -> { len, door, layout, bed } or null when that plan is not drawn yet
   WLPlans.svg(spec, opts)      -> an <svg> string. Front of the van at the LEFT; the ROAD side is the top and the DOOR side the bottom,
                                   the same way round as the renders (which look in from the door side).
   Every plan is drawn at one scale (13 units to the foot), so a longer van is drawn longer.

   The grammar (couples):
     length   1906 = 19'06"
     bed      K king + table door side, K1 king + chest door side, Q queen + tables both sides, Q1 queen + chest road side & table door side,
              Q2 queen + chests both sides
     door     M door just behind the bed, R door at the rear next to the ensuite
     layout   L L-shaped lounge on the road side, kitchen on the door side
              C cafe dinette (two benches facing a table); on 18'06" vans the kitchen moves to the road side and the dinette to the door side
              SC a larger U-shaped lounge
              XLE as L, with a larger ensuite
              RC / RCL ensuite behind the bed, kitchen on the road side, a big lounge at the rear, door at the rear */
(function () {
  var U = 13, WFT = 7.5, PAD = 6, MAXFT = 24;
  var VBW = MAXFT * U + PAD * 2, VBH = WFT * U + PAD * 2;
  var C = { wall: "#2B2B2B", floor: "#FBF8F4", bed: "#F3D5B8", runner: "#E3C7A4", pillow: "#FFFFFF", furn: "#DDD3C8", furnEdge: "#B5AA9D", table: "#F1E7DA", dark: "#3D3D3D", ens: "#E7EFF2", ensEdge: "#A8BEC7", fixture: "#6A6A6A", accent: "#D57114", fridge: "#3D3D3D" };

  var BED = {
    "king-table":        { len: 6.5,  w: 6.0, near: "table", far: null },
    "king-chest":        { len: 6.5,  w: 6.0, near: "chest", far: null },
    "queen-dual-table":  { len: 6.25, w: 5.0, near: "table", far: "table" },
    "queen-dual-chest":  { len: 6.5,  w: 5.0, near: "chest", far: "chest" },
    "queen-chest-table": { len: 6.5,  w: 5.0, near: "table", far: "chest" }
  };

  /* ---- decode a code ---- */
  function spec(code, bedKey) {
    var m = /^(\d{2})(\d{2})(K1|K|Q1|Q2|Q|EW|KL)(.*)$/.exec(code);
    if (!m) return null;
    var s = m[4], len = +m[1] + (+m[2]) / 12, out = { code: code, len: len, bed: bedKey };
    if (!BED[bedKey]) return null;                                   /* king lift-up and east-west beds are not drawn yet */
    var mm;
    if ((mm = /^-(M|R)-(L|C|SC)$/.exec(s))) { out.door = mm[1] === "M" ? "front" : "rear"; out.layout = mm[2]; return out; }
    if (/^-M-XLE$/.test(s)) { out.door = "front"; out.layout = "XLE"; return out; }
    if (/^-RCL?$/.test(s)) { out.door = "rear"; out.layout = "RC"; return out; }
    return null;                                                      /* family bunk plans: not drawn yet */
  }

  /* ---- little drawing helpers (everything is in feet; the group is scaled by U) ---- */
  function rect(x, y, w, h, fill, edge, rx, sw) { return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (edge ? ' stroke="' + edge + '" stroke-width="' + (sw || .07) + '"' : '') + '/>'; }
  function circ(x, y, r, fill, edge, sw) { return '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + r + '" fill="' + fill + '"' + (edge ? ' stroke="' + edge + '" stroke-width="' + (sw || .07) + '"' : '') + '/>'; }
  function line(x1, y1, x2, y2, col, sw) { return '<line x1="' + x1.toFixed(2) + '" y1="' + y1.toFixed(2) + '" x2="' + x2.toFixed(2) + '" y2="' + y2.toFixed(2) + '" stroke="' + col + '" stroke-width="' + (sw || .07) + '" stroke-linecap="round"/>'; }

  function bedModule(sp) {
    var b = BED[sp.bed], o = "", x0 = .42, bw = b.w, far = b.far, near = b.near, y0;
    if (bw > 5.5) y0 = .32; else y0 = 1.25;                           /* king sits against the road-side wall; queen is centred with room either side */
    o += rect(x0, y0, b.len, bw, C.bed, null, .35);
    var ph = bw / 2 - .28;
    o += rect(x0 + .14, y0 + .2, .78, ph, C.pillow, null, .22) + rect(x0 + .14, y0 + bw - .2 - ph, .78, ph, C.pillow, null, .22);
    o += rect(x0 + b.len * .46, y0, .95, bw, C.runner, null, 0);
    var item = function (kind, y) { return kind === "table" ? rect(x0, y, 1.0, 1.0, C.accent, null, .25) : rect(x0, y, b.len, .95, C.accent, null, .3); };   /* a chest is a long low unit along the side of the bed */
    if (far) o += item(far, y0 - 1.06);
    if (near) o += item(near, y0 + bw + .06);
    return { svg: o, end: x0 + b.len, lx: x0 + b.len * .76, ly: y0 + bw / 2 };
  }

  function ensuiteModule(L, big) {
    var len = big ? 5.6 : 3.7, x = L - len, o = "";
    o += rect(x, .16, len - .16, WFT - .32, C.ens, null, 0) + line(x, .16, x, WFT - .16, C.ensEdge, .1);
    o += rect(x + .3, .5, .5, 1.1, "#fff", C.fixture, .12) + circ(x + 1.25, 1.05, .6, "#fff", C.fixture, .08);        /* toilet: cistern + bowl */
    o += circ(x + 2.55, .95, .5, "#fff", C.fixture, .08);                                                              /* basin */
    var sx = L - 2.9, sy = WFT - 2.9;
    o += rect(sx, sy, 2.7, 2.7, "#fff", C.ensEdge, .1) + line(sx + .2, sy + .2, sx + 2.5, sy + 2.5, C.ensEdge, .05) + line(sx + 1.3, sy + .2, sx + 2.5, sy + 1.4, C.ensEdge, .05) + line(sx + .2, sy + 1.3, sx + 1.4, sy + 2.5, C.ensEdge, .05);
    if (big) o += rect(x + .4, WFT - 2.7, 2.3, 2.5, "#fff", C.ensEdge, .2);
    return { svg: o, x: x };
  }

  function tag(t, x, y) { return '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" text-anchor="middle" dominant-baseline="central" font-family="Aviano Sans, Trebuchet MS, sans-serif" font-weight="700" font-size=".56" letter-spacing=".07" fill="#8a7e70">' + t + '</text>'; }
  function door(x1, x2) { return rect(x1, WFT - .3, x2 - x1, .6, C.floor, null, 0) + line(x1, WFT, x2, WFT, C.accent, .34); }
  function bench(x, y, w, h, withSink, withHob) {
    var o = rect(x, y, w, h, C.furn, C.furnEdge, .12);
    if (withSink) o += rect(x + w * .55, y + .45, Math.min(1.3, w * .3), h - .9, C.dark, null, .18);
    if (withHob) o += circ(x + w * .22, y + h * .32, .22, "none", C.fixture, .07) + circ(x + w * .22 + .65, y + h * .32, .22, "none", C.fixture, .07) + circ(x + w * .22, y + h * .72, .22, "none", C.fixture, .07) + circ(x + w * .22 + .65, y + h * .72, .22, "none", C.fixture, .07);
    return o;
  }
  function lounge(sx, ex, kind) {
    var o = "", span = ex - sx;
    if (kind === "L") {
      o += rect(sx, .16, span, 1.9, C.furn, C.furnEdge, .15) + rect(ex - 1.9, 2.0, 1.9, 2.5, C.furn, C.furnEdge, .15);
      o += rect(sx + span * .18, 2.35, Math.min(3.2, span * .5), 1.6, C.table, C.furnEdge, .18);
    } else if (kind === "SC") {
      o += rect(sx, .16, span, 1.9, C.furn, C.furnEdge, .15) + rect(sx, 2.0, 1.9, 2.5, C.furn, C.furnEdge, .15) + rect(ex - 1.9, 2.0, 1.9, 2.5, C.furn, C.furnEdge, .15);
      o += rect(sx + 2.6, 2.4, span - 5.2, 1.6, C.table, C.furnEdge, .18);
    } else {                                                          /* C: café dinette, two benches facing across a table */
      var tw = 2.2, bw2 = 1.8, tot = bw2 * 2 + tw, x0 = sx + (span - tot) / 2;
      o += rect(x0, .16, tot, .75, C.furn, C.furnEdge, .12) + rect(x0, .16, bw2, 3.0, C.furn, C.furnEdge, .15) + rect(x0 + bw2 + tw, .16, bw2, 3.0, C.furn, C.furnEdge, .15);
      o += rect(x0 + bw2 + .12, 1.0, tw - .24, 2.0, C.table, C.furnEdge, .15);
    }
    return o;
  }
  function dinetteNear(sx, ex) {
    var tw = 2.2, bw2 = 1.7, tot = bw2 * 2 + tw, x0 = sx + (ex - sx - tot) / 2, o = "";
    o += rect(x0, WFT - 3.0, bw2, 2.85, C.furn, C.furnEdge, .15) + rect(x0 + bw2 + tw, WFT - 3.0, bw2, 2.85, C.furn, C.furnEdge, .15);
    o += rect(x0 + bw2 + .12, WFT - 2.9, tw - .24, 1.9, C.table, C.furnEdge, .15) + rect(x0, WFT - .85, tot, .7, C.furn, C.furnEdge, .12);
    return o;
  }

  /* ---- the whole plan ---- */
  function svg(sp, opts) {
    opts = opts || {};
    var L = sp.len, o = "", bedM = bedModule(sp), bedEnd = bedM.end + 1.5, lab = bedM.lx ? tag("BED", bedM.lx, bedM.ly) : "";
    var shell = 'M1.4 0H' + (L - .5) + 'A.5 .5 0 0 1 ' + L + ' .5V' + (WFT - .5) + 'A.5 .5 0 0 1 ' + (L - .5) + ' ' + WFT + 'H1.4A1.4 1.4 0 0 1 0 ' + (WFT - 1.4) + 'V1.4A1.4 1.4 0 0 1 1.4 0Z';
    o += '<path d="' + shell + '" fill="' + C.floor + '" stroke="' + C.wall + '" stroke-width=".2" stroke-linejoin="round"/>';
    o += bedM.svg;

    if (sp.layout === "RC") {
      /* ensuite behind the bed, kitchen on the road side, big lounge at the rear, door at the rear */
      var ex0 = bedEnd - .3, o2 = "";
      o2 += rect(ex0, .16, 3.4, 3.5, C.ens, null, 0) + rect(ex0 + .3, .5, .5, 1.1, "#fff", C.fixture, .12) + circ(ex0 + 1.3, 1.05, .6, "#fff", C.fixture, .08) + circ(ex0 + 2.5, 1.0, .5, "#fff", C.fixture, .08);
      o2 += rect(ex0, WFT - 3.1, 3.2, 2.95, "#fff", C.ensEdge, .1) + line(ex0 + .2, WFT - 2.9, ex0 + 3.0, WFT - .35, C.ensEdge, .05) + line(ex0 + 1.5, WFT - 2.9, ex0 + 3.0, WFT - 1.5, C.ensEdge, .05);
      var fx = ex0 + 3.6; o2 += rect(fx, .16, 2.0, 2.0, C.fridge, null, .1);
      var kx = fx + 2.2, loungeX = Math.max(kx + 4.4, L - 8.6);
      o2 += bench(kx, .16, loungeX - kx - .2, 1.95, true, true);
      var doorX2 = L - .5, doorX1 = doorX2 - 2.3;
      o2 += bench(ex0 + 3.5, WFT - 2.1, doorX1 - ex0 - 3.8, 1.95, true, false);
      o2 += rect(loungeX, .16, L - loungeX - .2, 1.9, C.furn, C.furnEdge, .15) + rect(L - 2.1, 2.0, 1.9, 3.3, C.furn, C.furnEdge, .15) + rect(loungeX + (L - loungeX) * .2, 2.4, 3.0, 1.7, C.table, C.furnEdge, .22);
      lab += tag("ENSUITE", ex0 + 1.7, 3.0) + tag("KITCHEN", kx + 1.5, 1.1) + tag("LOUNGE", loungeX + (L - loungeX) / 2, 1.1);
      o += o2 + door(doorX1, doorX2);
    } else {
      var ens = ensuiteModule(L, sp.layout === "XLE"), fridgeX = ens.x - 2.1;
      o += ens.svg + rect(fridgeX, .16, 2.0, 2.0, C.fridge, null, .1);
      lab += tag("ENSUITE", ens.x + (L - ens.x) / 2 - (sp.layout === "XLE" ? .6 : .1), 3.15);
      var dx1, dx2, kx1, kx2;
      if (sp.door === "front") { dx1 = bedEnd - .1; dx2 = dx1 + 2.3; kx1 = dx2 + .1; kx2 = ens.x - .2; }
      else { dx2 = ens.x - .4; dx1 = dx2 - 2.3; kx1 = bedEnd - .2; kx2 = dx1 - .1; }
      o += door(dx1, dx2);
      if (sp.layout === "C" && L < 19) {                              /* short van: kitchen on the road side, café dinette on the door side */
        o += bench(bedEnd + .1, .16, fridgeX - bedEnd - .3, 1.95, true, true) + dinetteNear(dx2 + .2, ens.x - .1);
        lab += tag("KITCHEN", bedEnd + (fridgeX - bedEnd) / 2, 2.6) + tag("DINETTE", (dx2 + ens.x) / 2, WFT - 1.0);
      } else {
        o += bench(kx1, WFT - 2.1, kx2 - kx1, 1.95, true, false);
        o += lounge(bedEnd + .2, fridgeX - .15, sp.layout === "XLE" ? "L" : sp.layout);
        lab += tag("KITCHEN", (kx1 + kx2) / 2, WFT - 2.55) + tag("LOUNGE", bedEnd + (fridgeX - bedEnd) * (sp.layout === "C" ? .5 : .34), sp.layout === "C" ? 1.05 : 1.1);
      }
    }
    var vbw = opts.fit ? L * U + PAD * 2 : opts.maxFt ? opts.maxFt * U + PAD * 2 : VBW;
    return '<svg class="plan" viewBox="0 0 ' + vbw + ' ' + VBH + '" role="img" aria-label="' + (opts.label || "Floor plan") + '"><g transform="translate(' + PAD + ' ' + PAD + ') scale(' + U + ')">' + o + (opts.labels ? lab : '') + '</g></svg>';
  }

  window.WLPlans = { spec: spec, svg: svg, VBW: VBW, VBH: VBH, U: U, PAD: PAD };
})();
