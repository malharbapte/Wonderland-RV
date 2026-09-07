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
