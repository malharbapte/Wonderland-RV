"""Builds exports/step2-size-layout.svg: the Step 2 (size) screen at 375 x 812, with every position measured from the live page.
Text is live text in the brand fonts (embedded for browsers; Illustrator uses the installed Aviano Sans and Gordita). Run from the project root."""
import base64, io
from PIL import Image

def b64f(p): return base64.b64encode(open(p, "rb").read()).decode()
def png_white(p):
    im = Image.open(p).convert("RGBA"); px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            px[x, y] = (255, 255, 255, px[x, y][3])
    b = io.BytesIO(); im.save(b, "PNG"); return base64.b64encode(b.getvalue()).decode()

ORANGE = "#D57114"
SIZES = [  # key, name, range, disc x,y, icon x,y,w,h, name y, range y
    ("compact", "Compact", "17′09″ – 20′", 24, 499, (46.62, 526.16, 50, 38.16), 595, 613),
    ("mid", "Mid-size", "20′06″ – 22′", 143.5, 385, (163.65, 410.28, 56, 38.86), 481, 499),
    ("spacious", "Spacious", "22′06″ – 24′", 263, 271, (279.94, 298.46, 60, 37.02), 367, 385),
]
MARKERS = [  # x, y, state
    (34, 86, "passed"), (91.39, 86, "current"), (148.8, 86, "ahead"), (206.19, 86, "ahead"), (263.59, 86, "ahead"), (321, 86, "ahead")]
PINE = '<path d="M10 1.5L16 11H4Z" fill="{a}" stroke="{a}"/><path d="M10 7L18 19H2Z" fill="{a}" stroke="{a}"/><rect x="8.7" y="19" width="2.6" height="6.5" rx="1.2" fill="{b}" stroke="{b}"/>'
FLAG = '<rect x="3" y="2" width="1.8" height="23.5" rx=".9" fill="{b}" stroke="{b}"/><path d="M5 3H16.5L13.2 7.5L16.5 12H5Z" fill="{a}" stroke="{a}"/>'
COL = {"passed": (ORANGE, "#B04C07"), "ahead": ("#dcdcdc", "#cdcdcd"), "current": (ORANGE, "#B04C07")}

o = []
o.append('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="375" height="812" viewBox="0 0 375 812">')
o.append('<title>Wonderland RV, Build your Caravan, Step 2: Size (375 x 812)</title>')
o.append('<desc>Phone layout, 24px page margins. Gradient stops: #FFC47F, #E37921 (52%), #B04C07. Fonts: Aviano Sans Black / Bold, Gordita Regular. Layers: header, progress road, heading, size options, scale, back. A hidden layer shows Mid-size in its hover/selected state.</desc>')
o.append('<defs><style>')
for fam, w, f in [("Aviano Sans", 900, "AvianoSans-Black.otf"), ("Aviano Sans", 700, "AvianoSans-Bold.otf"), ("Gordita", 400, "Gordita-Regular.otf")]:
    o.append('@font-face{font-family:"%s";font-weight:%d;src:url(data:font/otf;base64,%s) format("opentype");}' % (fam, w, b64f("assets/fonts/" + f)))
o.append('.av9{font-family:"Aviano Sans","Trebuchet MS",sans-serif;font-weight:900}.av7{font-family:"Aviano Sans","Trebuchet MS",sans-serif;font-weight:700}.gd{font-family:"Gordita","Helvetica Neue",Arial,sans-serif;font-weight:400}')
o.append('</style>')
o.append('<linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC47F"/><stop offset=".52" stop-color="#E37921"/><stop offset="1" stop-color="#B04C07"/></linearGradient>')
o.append('<linearGradient id="gRoad" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="351" y2="0"><stop offset="0" stop-color="#FFC47F"/><stop offset=".52" stop-color="#E37921"/><stop offset="1" stop-color="#B04C07"/></linearGradient>')
o.append('<linearGradient id="gScale" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="351" y2="0"><stop offset="0" stop-color="#FFC47F"/><stop offset=".52" stop-color="#E37921"/><stop offset="1" stop-color="#B04C07"/></linearGradient>')
o.append('</defs>')
o.append('<rect id="background" width="375" height="812" fill="#FFFFFF"/>')

o.append('<g id="header"><rect x="0" y="63" width="375" height="1" fill="#EEEEEE"/><image x="24" y="10.5" width="225.36" height="42" xlink:href="data:image/png;base64,%s" href="data:image/png;base64,%s"/></g>' % (b64f("assets/img/wonderland-rv-logo.png"), b64f("assets/img/wonderland-rv-logo.png")))

o.append('<g id="progress-road">')
o.append('<rect id="road-track" x="24" y="112" width="327" height="18" rx="9" fill="#F1E8DE"/>')
o.append('<rect id="road-covered" x="24" y="112" width="81.39" height="18" rx="9" fill="url(#gRoad)"/>')
for i, (x, y, st) in enumerate(MARKERS):
    a, b = COL[st]; glyph = (FLAG if i == 5 else PINE).format(a=a, b=b)
    hide = ' display="none"' if st == "current" else ""
    o.append('<g id="marker-%d-%s" transform="translate(%s %s)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"%s>%s</g>' % (i + 1, st, x, y, hide, glyph))
o.append('<g id="van" transform="translate(81.39 95)" color="%s"><path d="M4 3H28A6 6 0 0 1 34 9V15A2 2 0 0 1 32 17H4A2 2 0 0 1 2 15V5A2 2 0 0 1 4 3Z" fill="%s"/><rect x="8" y="6.5" width="9" height="5" rx="1.5" fill="#FFFFFF"/><circle cx="19" cy="18" r="3.6" fill="#FFFFFF" stroke="%s" stroke-width="2"/><path d="M34 14h5" stroke="%s" stroke-width="2" stroke-linecap="round" fill="none"/></g>' % (ORANGE, ORANGE, ORANGE, ORANGE))
o.append('<text id="step-label" x="24" y="151" class="av7" font-size="12" letter-spacing="0.96" fill="%s">SIZE</text>' % ORANGE)
o.append('</g>')

o.append('<g id="heading"><text x="24" y="201" class="av9" font-size="30">HOW MUCH ROOM</text><text x="24" y="234" class="av9" font-size="30">DO YOU NEED?</text></g>')

o.append('<g id="size-options">')
for key, name, rng, dx, dy, (ix, iy, iw, ih), ny, ry in SIZES:
    cx, cy = dx + 44, dy + 44
    o.append('<g id="option-%s"><circle cx="%s" cy="%s" r="44" fill="url(#gV)"/>' % (key, cx, cy))
    o.append('<image x="%s" y="%s" width="%s" height="%s" xlink:href="data:image/png;base64,%s" href="data:image/png;base64,%s"/>' % (ix, iy, iw, ih, png_white("assets/img/build/size-%s.png" % key), png_white("assets/img/build/size-%s.png" % key)))
    o.append('<text x="%s" y="%s" text-anchor="middle" class="av9" font-size="14" fill="#000000">%s</text>' % (cx, ny + 14, name.upper()))
    o.append('<text x="%s" y="%s" text-anchor="middle" class="gd" font-size="12" fill="#444444">%s</text></g>' % (cx, ry + 13, rng))
o.append('</g>')
# hidden: Mid-size in its hover / selected state (white disc, orange outline, orange icon)
ix, iy, iw, ih = SIZES[1][5]
o.append('<g id="state-mid-size-hover" display="none"><circle cx="187.5" cy="429" r="43.25" fill="#FFFFFF" stroke="%s" stroke-width="1.5"/><image x="%s" y="%s" width="%s" height="%s" xlink:href="data:image/png;base64,%s" href="data:image/png;base64,%s"/><text x="187.5" y="495" text-anchor="middle" class="av9" font-size="14" fill="%s">MID-SIZE</text></g>' % (ORANGE, ix, iy, iw, ih, b64f("assets/img/build/size-mid.png"), b64f("assets/img/build/size-mid.png"), ORANGE))

o.append('<g id="scale">')
for (x, w, lab) in [(24, 117.72, "17′09″ – 20′"), (167.88, 78.48, "20′06″ – 22′"), (272.52, 78.48, "22′06″ – 24′")]:
    o.append('<rect x="%s" y="665" width="%s" height="12" rx="6" fill="url(#gScale)"/><text x="%s" y="697.5" text-anchor="middle" class="gd" font-size="11" fill="#666666">%s</text>' % (x, w, round(x + w / 2, 2), lab))
o.append('</g>')
o.append('<g id="back" transform="translate(24 745)"><path d="M15 5l-7 7 7 7" fill="none" stroke="#000000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>')
o.append('</svg>')
open("exports/step2-size-layout.svg", "w").write("\n".join(o))
print("ok")
