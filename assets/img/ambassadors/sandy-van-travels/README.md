# Sandy Van Travels — travel tip stills

Drop six images here named `tip-1.jpg` … `tip-6.jpg`. The page picks them up
with no code change; any slot without a file keeps its labelled placeholder.

Every slot is cropped to fill (`object-fit: cover`), so exact dimensions don't
matter — but these are the shapes each one is cut to, so matching them roughly
avoids a harsh crop. Sizes are design px; supply at 2x for retina.

| file      | column | shape          | design px | 2x        |
|-----------|--------|----------------|-----------|-----------|
| tip-1.jpg | left   | portrait       | 515 x 681 | 1030x1362 |
| tip-2.jpg | left   | portrait       | 515 x 681 | 1030x1362 |
| tip-3.jpg | middle | landscape      | 515 x 453 | 1030x906  |
| tip-4.jpg | middle | tall portrait  | 515 x 906 | 1030x1812 |
| tip-5.jpg | right  | tall portrait  | 515 x 906 | 1030x1812 |
| tip-6.jpg | right  | landscape      | 515 x 453 | 1030x906  |

`.jpg` is what the markup expects. `.webp`, `.png` or `.heic` are fine to hand
over — they just need converting first (`sips -s format jpeg`), same as the
ambassador portraits were.

---

## What is in here now

Six stills are placed. They came in as 8192px originals totalling 68MB, which
is far more than the page needs — each is centre-cropped to its slot at 2x and
saved at quality 84, taking the set to about 2MB. The untouched originals are
NOT in the repo; they are parked outside it at
`/private/tmp/claude-501/-Users-malharbapte-Claude/<session>/scratchpad/tip-originals/`
so re-cropping is possible without another hand-off. Copy them somewhere
permanent if they are the only versions.

`tip-spare.jpg` is a seventh image that arrived as `Tip.jpg` with no number.
It is not referenced by the page — it is parked here pending a decision.
