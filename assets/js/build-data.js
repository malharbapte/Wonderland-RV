/* Build your Caravan: the compatibility data, read from the live configurator on 2026-10-12.
   BEDS["type|size"][bedKey][model] = the lowest starting price (GST inclusive) of that model with that bed, across its floorplans.
   A model that is missing for a bed is not offered with that bed. A bed missing for a type|size is not offered at all.
   BED_INFO holds the live wording and the plain-language version used in the UI. */
var WL_BEDS = {"family|compact":{"king-table":{"amaroo":142939.25,"hornet":162908.94,"xtr":207203.31},"king-chest":{"amaroo":143629.17,"hornet":163593.47,"xtr":207874.36},"queen-dual-chest":{"amaroo":141372.15,"hornet":161354.08,"xtr":205679.06},"queen-chest-table":{"amaroo":140682.23,"hornet":160669.55,"xtr":205008.0},"queen-ew":{"amaroo":135844.75,"hornet":158574.05,"xtr":202953.75}},"family|mid":{"king-table":{"amaroo":148962.67,"hornet":168885.3,"xtr":213062.03},"king-chest":{"amaroo":149652.59,"hornet":169569.83,"xtr":213733.08},"queen-dual-table":{"amaroo":144241.65,"hornet":164201.16,"xtr":208470.1},"queen-dual-chest":{"amaroo":147395.57,"hornet":167330.44,"xtr":211537.78},"queen-chest-table":{"amaroo":146705.65,"hornet":166645.91,"xtr":210866.72,"solara":185678.21},"queen-ew":{"amaroo":146465.55,"hornet":167319.37,"xtr":211526.92,"solara":186361.67}},"family|spacious":{"king-table":{"amaroo":155129.6,"hornet":175935.29,"xtr":219973.24},"king-chest":{"amaroo":155819.52,"hornet":176619.82,"xtr":220644.29},"king-lift":{"amaroo":165410.99,"hornet":186136.35,"xtr":229973.49},"queen-dual-table":{"amaroo":150408.58,"hornet":171251.15,"xtr":215381.31},"queen-dual-chest":{"amaroo":153562.5,"hornet":174380.43,"xtr":218448.99},"queen-chest-table":{"amaroo":152872.58,"hornet":173695.9,"xtr":217777.93},"queen-ew":{"amaroo":150140.04,"hornet":170984.71,"xtr":215120.11}},"couples|compact":{"king-table":{"amaroo":132009.46,"hornet":155860.01,"xtr":200293.14},"king-chest":{"amaroo":139693.87,"hornet":159688.91,"xtr":204046.67},"queen-dual-table":{"amaroo":127288.44,"solara":162279.87,"hornet":151175.87,"xtr":195701.21},"queen-dual-chest":{"amaroo":137436.84,"hornet":157449.52,"xtr":201851.36},"queen-chest-table":{"amaroo":129752.44,"hornet":153620.62,"xtr":198097.83}},"couples|mid":{"queen-dual-table":{"amaroo":141935.21,"hornet":161912.74,"xtr":206226.72,"solara":181010.25},"queen-chest-table":{"amaroo":149837.04,"hornet":170684.08,"xtr":214825.4}},"couples|spacious":{"queen-dual-table":{"amaroo":151681.52,"hornet":172514.15,"xtr":216619.44},"queen-chest-table":{"amaroo":154145.52,"hornet":174958.9,"xtr":219016.07}}};

var WL_BED_INFO = {
  "king-table":        { group: "King",  name: "King",            len: "6\u20326\u2033", detail: "Bedside table, door side",               short: "Table",         live: "King (6'6\") bed with single bedside table on doorside",                          img: "assets/img/build/bed-king-table.webp",         src: 800 },
  "king-chest":        { group: "King",  name: "King",            len: "6\u20326\u2033", detail: "Storage chest, door side",               short: "Chest",         live: "King (6'6\") bed with single storage chest on doorside",                         img: "assets/img/build/bed-king-chest.webp",         src: 800 },
  "king-lift":         { group: "King",  name: "King lift-up",    len: "6\u20326\u2033", detail: "Electric lift-up bed",                   short: "Lift-up",       live: "King (6'6\") electric lift-up bed",                                               img: "assets/img/build/bed-king-lift.webp",          src: 800 },
  "queen-dual-table":  { group: "Queen", name: "Queen",           len: "6\u20323\u2033", detail: "Bedside tables, both sides",             short: "2 tables",      live: "Queen (6'3\") bed with dual bedside tables",                                      img: "assets/img/build/bed-queen-dual-table.webp",   src: 200 },
  "queen-dual-chest":  { group: "Queen", name: "Queen",           len: "6\u20326\u2033", detail: "Storage chests, both sides",             short: "2 chests",      live: "Queen (6'6\") bed with dual storage chests",                                      img: "assets/img/build/bed-queen-dual-chest.webp",   src: 200 },
  "queen-chest-table": { group: "Queen", name: "Queen",           len: "6\u20326\u2033", detail: "Chest road side, table door side",       short: "Chest+table", live: "Queen (6'6\") bed with storage chest roadside & bedside table doorside",         img: "assets/img/build/bed-queen-chest-table.webp",  src: 200 },
  "queen-ew":          { group: "Queen", name: "Queen east\u2013west", len: "6\u20328\u2033", detail: "Bedhead chest, road side",         short: "East\u2013west", live: "Queen (6'8\") east west bed with bedhead storage chest on roadside",             img: "assets/img/build/bed-queen-ew.webp",           src: 200 }
};
var WL_BED_ORDER = ["king-table", "king-chest", "king-lift", "queen-dual-table", "queen-dual-chest", "queen-chest-table", "queen-ew"];

/* the beds for a chosen type, size and model: every bed that exists for the type and size, in a fixed order,
   with its price for the model, or price = null when that bed is not offered with that model */
function wlBeds(type, size, model) {
  var t = WL_BEDS[type + "|" + size] || {};
  var list = WL_BED_ORDER.filter(function (k) { return t[k]; }).map(function (k) {
    var p = t[k][model];
    var o = {}; for (var i in WL_BED_INFO[k]) o[i] = WL_BED_INFO[k][i];
    o.key = k; o.price = p === undefined ? null : p; return o;
  });
  var prices = list.filter(function (b) { return b.price !== null; }).map(function (b) { return b.price; });
  var base = prices.length ? Math.min.apply(null, prices) : null;
  list.forEach(function (b) { b.delta = b.price === null ? null : Math.round(b.price - base); });
  return list;
}
