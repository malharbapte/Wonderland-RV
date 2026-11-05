/* =========================================================================
   360 ICONS  —  Wonderland RV
   Generated for Adobe Illustrator. Run with File > Scripts > Other Script…

   MATCHES THE EXISTING SET BY CONSTRUCTION, not by eye:
     24 x 24 artboard, so the exported viewBox is 0 0 24 24 like every other
     icon on the site
     stroke only, no fill
     0.96pt stroke, which is --icon-stroke
     round cap, round join, as the why- and range- icons use

   Each icon is written to its own document and exported as SVG beside this
   file, then left open so the paths can be edited by hand.
   ========================================================================= */
#target illustrator

var OUT = new Folder(new File($.fileName).parent);

function style(p) {
  p.filled = false;
  p.stroked = true;
  p.strokeWidth = 0.96;               // --icon-stroke
  p.strokeCap = StrokeCap.ROUNDENDCAP;
  p.strokeJoin = StrokeJoin.ROUNDENDJOIN;
  var k = new RGBColor(); k.red = 0; k.green = 0; k.blue = 0;
  p.strokeColor = k;
}

function addPt(p, anchor, lef, rig, type) {
  var pt = p.pathPoints.add();
  pt.anchor = anchor;
  pt.leftDirection = lef;
  pt.rightDirection = rig;
  pt.pointType = type;
}

function makeIcon(name, draw) {
  var doc = app.documents.add(DocumentColorSpace.RGB, 24, 24);
  draw(doc);
  var f = new File(OUT.fsName + "/360-" + name + ".svg");
  var o = new ExportOptionsSVG();
  o.embedRasterImages = false;
  o.fontType = SVGFontType.OUTLINEFONT;
  o.coordinatePrecision = 3;
  o.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
  doc.exportFile(f, ExportType.SVG, o);
  doc.saveAs(new File(OUT.fsName + "/360-" + name + ".ai"));
}

makeIcon("room", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [12.0000,20.6000], [12.0000,20.6000], [12.0000,20.6000], PointType.CORNER);
    addPt(p, [20.6000,16.0000], [20.6000,16.0000], [20.6000,16.0000], PointType.CORNER);
    addPt(p, [12.0000,11.4000], [12.0000,11.4000], [12.0000,11.4000], PointType.CORNER);
    addPt(p, [3.4000,16.0000], [3.4000,16.0000], [3.4000,16.0000], PointType.CORNER);
    p.closed = true;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [3.4000,16.0000], [3.4000,16.0000], [3.4000,16.0000], PointType.CORNER);
    addPt(p, [3.4000,8.0000], [3.4000,8.0000], [3.4000,8.0000], PointType.CORNER);
    addPt(p, [12.0000,3.4000], [12.0000,3.4000], [12.0000,3.4000], PointType.CORNER);
    addPt(p, [20.6000,8.0000], [20.6000,8.0000], [20.6000,8.0000], PointType.CORNER);
    addPt(p, [20.6000,16.0000], [20.6000,16.0000], [20.6000,16.0000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [12.0000,11.4000], [12.0000,11.4000], [12.0000,11.4000], PointType.CORNER);
    addPt(p, [12.0000,3.4000], [12.0000,3.4000], [12.0000,3.4000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
});

makeIcon("sphere", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [20.4000,12.0000], [20.4000,12.0000], [20.4000,7.3608], PointType.SMOOTH);
    addPt(p, [12.0000,3.6000], [16.6392,3.6000], [7.3608,3.6000], PointType.SMOOTH);
    addPt(p, [3.6000,12.0000], [3.6000,7.3608], [3.6000,16.6392], PointType.SMOOTH);
    addPt(p, [12.0000,20.4000], [7.3608,20.4000], [16.6392,20.4000], PointType.SMOOTH);
    addPt(p, [20.4000,12.0000], [20.4000,16.6392], [20.4000,12.0000], PointType.SMOOTH);
    p.closed = true;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [4.6000,14.6000], [4.6000,14.6000], [4.6000,14.6000], PointType.CORNER);
    addPt(p, [19.4000,14.6000], [19.4000,14.6000], [19.4000,14.6000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [4.6000,9.4000], [4.6000,9.4000], [4.6000,9.4000], PointType.CORNER);
    addPt(p, [19.4000,9.4000], [19.4000,9.4000], [19.4000,9.4000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [15.5280,12.0000], [15.5280,12.0000], [15.5280,7.3608], PointType.SMOOTH);
    addPt(p, [12.0000,3.6000], [13.9485,3.6000], [10.0515,3.6000], PointType.SMOOTH);
    addPt(p, [8.4720,12.0000], [8.4720,7.3608], [8.4720,16.6392], PointType.SMOOTH);
    addPt(p, [12.0000,20.4000], [10.0515,20.4000], [13.9485,20.4000], PointType.SMOOTH);
    addPt(p, [15.5280,12.0000], [15.5280,16.6392], [15.5280,12.0000], PointType.SMOOTH);
    p.closed = true;
    style(p);
  })();
});

makeIcon("panorama", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [3.4000,17.8000], [3.4000,17.8000], [8.0000,15.6000], PointType.SMOOTH);
    addPt(p, [20.6000,17.8000], [16.0000,15.6000], [20.6000,17.8000], PointType.SMOOTH);
    addPt(p, [20.6000,6.2000], [20.6000,6.2000], [16.0000,8.4000], PointType.SMOOTH);
    addPt(p, [3.4000,6.2000], [8.0000,8.4000], [3.4000,6.2000], PointType.SMOOTH);
    p.closed = true;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [9.0000,16.4000], [9.0000,16.4000], [9.0000,16.4000], PointType.CORNER);
    addPt(p, [9.0000,7.6000], [9.0000,7.6000], [9.0000,7.6000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [15.0000,16.4000], [15.0000,16.4000], [15.0000,16.4000], PointType.CORNER);
    addPt(p, [15.0000,7.6000], [15.0000,7.6000], [15.0000,7.6000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
});

// no alert: this script is run headless as well as by hand
