/* =========================================================================
   360 ICONS  —  Wonderland RV   (drawn to the icon libraries' conventions)

   Run with File > Scripts > Other Script… in Adobe Illustrator.

   WHY THESE SHAPES. Lucide's answer to 360 is rotate-3d: two crossed ellipses,
   each left OPEN, with an arrowhead on the gap. The gaps are the whole trick --
   CLOSED crossed ellipses are a wireframe globe, and a globe says WORLD, not
   "look around this room". Lucide's actual globe icon is circle + meridian +
   equator, which is what the earlier sphere attempt had accidentally drawn.
   Only rotate3d is based on a checked library icon. orbitring, roomturn and
   panoframe are my own drawings -- an earlier version of this comment claimed
   Material and "the panorama convention" as sources without checking either.

   MATCHES THE EXISTING SET BY CONSTRUCTION:
     24 x 24 artboard, so the export carries viewBox 0 0 24 24
     stroke only, no fill
     0.96pt stroke, which is --icon-stroke
     round cap, round join, as the why- and range- icons use

   Geometry is generated, not dragged: elliptical arcs become cubics with
   explicit anchors and handles, and every arrowhead sits on the arc's real
   TANGENT -- at angle a that direction is (-rx*sin a, ry*cos a), not the
   radius, which is what the first attempt wrongly used. ai_y = 24 - y, because
   Illustrator's artboard origin is not where -y assumes.

   NEVER PATCH THIS FILE BY STRING SURGERY. Two attempts to do that corrupted
   it (Error 14: no matching closing brace). Regenerate it whole from gen360.py.
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
  pt.anchor = anchor; pt.leftDirection = lef; pt.rightDirection = rig;
  pt.pointType = type;
}

function makeIcon(name, draw) {
  var doc = app.documents.add(DocumentColorSpace.RGB, 24, 24);
  draw(doc);
  var o = new ExportOptionsSVG();
  o.embedRasterImages = false;
  o.fontType = SVGFontType.OUTLINEFONT;
  o.coordinatePrecision = 3;
  o.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
  doc.exportFile(new File(OUT.fsName + "/360-" + name + ".svg"), ExportType.SVG, o);
  doc.saveAs(new File(OUT.fsName + "/360-" + name + ".ai"));
}

makeIcon("rotate3d", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [9.7935,3.8769], [9.7935,3.8769], [7.8205,5.9303], PointType.SMOOTH);
    addPt(p, [7.4935,14.6129], [6.8589,10.4191], [8.1282,18.8068], PointType.SMOOTH);
    addPt(p, [12.4096,21.1650], [10.1836,21.5462], [14.6357,20.7838], PointType.SMOOTH);
    addPt(p, [16.6698,13.0415], [16.4168,17.3873], [16.9227,8.6956], PointType.SMOOTH);
    addPt(p, [13.4524,3.2503], [15.5776,4.6019], [13.4524,3.2503], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [3.4699,10.2393], [3.4699,10.2393], [1.8314,12.3112], PointType.SMOOTH);
    addPt(p, [6.9222,15.9193], [3.2748,14.6859], [10.5696,17.1526], PointType.SMOOTH);
    addPt(p, [18.5054,15.3234], [15.4125,16.9035], [21.5983,13.7433], PointType.SMOOTH);
    addPt(p, [19.6717,9.4059], [22.0859,11.2692], [17.2576,7.5425], PointType.SMOOTH);
    addPt(p, [8.5536,7.6422], [12.6091,6.8052], [8.5536,7.6422], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [14.5735,5.5962], [14.5735,5.5962], [14.5735,5.5962], PointType.CORNER);
    addPt(p, [13.4524,3.2503], [13.4524,3.2503], [13.4524,3.2503], PointType.CORNER);
    addPt(p, [16.0523,3.2710], [16.0523,3.2710], [16.0523,3.2710], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
});

makeIcon("orbitring", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [3.8432,12.1327], [3.8432,12.1327], [5.6267,13.8751], PointType.SMOOTH);
    addPt(p, [13.9480,14.4028], [9.8280,14.8189], [18.0679,13.9867], PointType.SMOOTH);
    addPt(p, [21.0000,10.4000], [21.0000,12.3224], [21.0000,8.4776], PointType.SMOOTH);
    addPt(p, [13.9480,6.3972], [18.0679,6.8133], [9.8280,5.9811], PointType.SMOOTH);
    addPt(p, [3.8432,8.6673], [5.6267,6.9249], [3.8432,8.6673], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [6.2855,8.1333], [6.2855,8.1333], [6.2855,8.1333], PointType.CORNER);
    addPt(p, [3.8432,8.6673], [3.8432,8.6673], [3.8432,8.6673], PointType.CORNER);
    addPt(p, [4.4340,6.2381], [4.4340,6.2381], [4.4340,6.2381], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [14.9000,14.6000], [14.9000,14.6000], [14.9000,12.9984], PointType.SMOOTH);
    addPt(p, [12.0000,11.7000], [13.6016,11.7000], [10.3984,11.7000], PointType.SMOOTH);
    addPt(p, [9.1000,14.6000], [9.1000,12.9984], [9.1000,16.2016], PointType.SMOOTH);
    addPt(p, [12.0000,17.5000], [10.3984,17.5000], [13.6016,17.5000], PointType.SMOOTH);
    addPt(p, [14.9000,14.6000], [14.9000,16.2016], [14.9000,14.6000], PointType.SMOOTH);
    p.closed = true;
    style(p);
  })();
});

makeIcon("roomturn", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [12.0000,15.4000], [12.0000,15.4000], [12.0000,15.4000], PointType.CORNER);
    addPt(p, [19.4000,11.4000], [19.4000,11.4000], [19.4000,11.4000], PointType.CORNER);
    addPt(p, [12.0000,7.4000], [12.0000,7.4000], [12.0000,7.4000], PointType.CORNER);
    addPt(p, [4.6000,11.4000], [4.6000,11.4000], [4.6000,11.4000], PointType.CORNER);
    p.closed = true;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [4.6000,11.4000], [4.6000,11.4000], [4.6000,11.4000], PointType.CORNER);
    addPt(p, [4.6000,6.0000], [4.6000,6.0000], [4.6000,6.0000], PointType.CORNER);
    addPt(p, [12.0000,2.0000], [12.0000,2.0000], [12.0000,2.0000], PointType.CORNER);
    addPt(p, [19.4000,6.0000], [19.4000,6.0000], [19.4000,6.0000], PointType.CORNER);
    addPt(p, [19.4000,11.4000], [19.4000,11.4000], [19.4000,11.4000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [12.0000,7.4000], [12.0000,7.4000], [12.0000,7.4000], PointType.CORNER);
    addPt(p, [12.0000,2.0000], [12.0000,2.0000], [12.0000,2.0000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [5.6351,18.0927], [5.6351,18.0927], [5.9730,19.4994], PointType.SMOOTH);
    addPt(p, [11.8883,20.5996], [8.6558,20.5749], [15.1208,20.6243], PointType.SMOOTH);
    addPt(p, [18.3377,18.1897], [17.8878,19.5904], [18.3377,18.1897], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [16.6571,19.6094], [16.6571,19.6094], [16.6571,19.6094], PointType.CORNER);
    addPt(p, [18.3377,18.1897], [18.3377,18.1897], [18.3377,18.1897], PointType.CORNER);
    addPt(p, [18.8771,20.3225], [18.8771,20.3225], [18.8771,20.3225], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
});

makeIcon("panoframe", function (doc) {
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [6.6470,16.3698], [6.6470,16.3698], [9.6898,17.8767], PointType.SMOOTH);
    addPt(p, [17.3530,16.3698], [14.3102,17.8767], [17.3530,16.3698], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [17.3530,7.6302], [17.3530,7.6302], [14.3102,6.1233], PointType.SMOOTH);
    addPt(p, [6.6470,7.6302], [9.6898,6.1233], [6.6470,7.6302], PointType.SMOOTH);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [6.6470,16.3698], [6.6470,16.3698], [6.6470,16.3698], PointType.CORNER);
    addPt(p, [6.6470,7.6302], [6.6470,7.6302], [6.6470,7.6302], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [17.3530,16.3698], [17.3530,16.3698], [17.3530,16.3698], PointType.CORNER);
    addPt(p, [17.3530,7.6302], [17.3530,7.6302], [17.3530,7.6302], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
  (function () {
    var p = doc.pathItems.add();
    addPt(p, [7.4000,12.0000], [7.4000,12.0000], [7.4000,12.0000], PointType.CORNER);
    addPt(p, [16.6000,12.0000], [16.6000,12.0000], [16.6000,12.0000], PointType.CORNER);
    p.closed = false;
    style(p);
  })();
});
