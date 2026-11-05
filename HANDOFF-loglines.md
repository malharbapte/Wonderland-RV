# Handoff — video log-lines

Scope: the one-sentence description under each video in the **Queen of Hearts**
deck on the homepage. Nothing else in this file.

---

## What a log-line is here

One sentence, under the video, saying **what the video is about** — not an
account of what happens in it.

The test: a viewer who has not pressed play should finish the sentence knowing
why they would.

**Narration is the failure mode.** The first drafts read:

> Kevin takes you past the chassis and into the bones of the van.
> Ana walks the couples layout end to end.

Those describe the footage. They tell a viewer what they would be *watching*
rather than what they would *get*, and the name of the presenter is doing work
the viewer has no reason to care about yet.

---

## Rules

1. **One sentence.** Two only where the second earns it. Roughly 20–35 words.
2. **Assertive, not interrogative.** No opening *What*, *Which*, *How* or
   *When*, and nothing that resolves into a question.
3. **No presenter names.** No "Kevin shows you", "Ana walks you through".
4. **Vary the opener.** *Discover*, *Step inside*, *See*, *Find out*, *Meet* —
   six videos in one deck all opening the same way reads as a template, which
   is a worse fault than the questions were. No opener should appear twice.
5. **A concrete hook over a feature list.** Specs belong in the sentence only
   when they *are* the hook (48 volts, 170 litres), never as a list.
6. **House spelling.** Australian. En dashes as `&mdash;`, curly apostrophes.
7. **No claim that is not in the video.** Awards, measurements and figures must
   be checkable against the video or its description.

---

## The six, in deck order

| # | Slide title | Video |
|---|---|---|
| 1 | Queen of hearts | https://youtu.be/x0NoTZonq8Q |
| 2 | How is a Wonderland built. | https://youtu.be/thFwJAod6Ng |
| 3 | A caravan built for two. | https://youtu.be/Yk4vxl-iUcU |
| 4 | Where the kids sleep. | https://youtu.be/aGa1ek8HPsE |
| 5 | Stay out longer. | https://youtu.be/OZzB4zf4FGM |
| 6 | It won all three. | https://youtu.be/UBc2BtAu8eI |

### 1 — Queen of hearts

**On the page now:** What makes the judges at Caravan of the Year pick one van,
out of a whole field, as the one they would take home themselves.

**Assertive alternative:** Caravan World's judges invented an award so they
could name the one van they would take home themselves. It went to a
twenty-foot-six couples van.

Note: *judging panel* was rejected as wording. Use *the judges*, *Caravan
World's judges*, or *the judges at Caravan of the Year*.

### 2 — How is a Wonderland built.

**Now:** Two caravans can sit side by side on a showroom floor, look the same
and cost thousands apart. This is where that money goes.

**Assertive:** Discover where the money goes in a caravan that costs thousands
more than the one beside it — in the parts you stop being able to see once the
walls go on.

### 3 — A caravan built for two.

**Now:** What a caravan looks like when it is built for two people to live in it
rather than just sleep in it.

**Assertive:** Step inside a layout built for two people to live in rather than
just sleep in, where the rear lounge is the room that decides it.

### 4 — Where the kids sleep.

**Now:** Why three bunks beat four the moment a child turns twelve, and what
changes when you stop counting beds and start measuring them.

**Assertive:** See why three bunks beat four the moment a child turns twelve,
and what changes when you stop counting beds and start measuring them.

### 5 — Stay out longer.

**Now:** How much power and water it takes to stay out for weeks instead of
nights — and what carrying it costs you in space.

**Assertive:** Find out what it takes to stay out for weeks instead of nights —
forty-eight volts, a hundred and seventy litres, and the space they cost.

### 6 — It won all three.

**Now:** Three Caravan of the Year titles in one night — best overall, best
family, best innovation. The van and the spec that took them.

**Assertive:** Meet the family van that took three Caravan of the Year titles in
one night: best overall, best family and best innovation.

---

## What is expected back

- **Six final log-lines**, numbered to the table above.
- One register for all six — either the interrogative set or the assertive set,
  not a mix.
- Each checked against rule 7: every award, figure and measurement traceable to
  its video.
- Flag any video whose content has changed since this list was written, since
  the lines were drawn from the video descriptions as published.

## Where they go

`home.html`, one `<p class="coty-note">` per `.coty-slide`, in deck order.
Slides 2–6 have had their subheading hidden, so the log-line is the only
summary on those slides and carries the whole job. Slide 1 keeps its
subheading because that one is the READ THE COTY 2026 REVIEW link, not a label.

Length is the constraint to respect: the note sits under the video at
`--t-caption` across the video's own width, and is laid out expecting about two
lines. Much longer and it pushes the deck taller; much shorter and the slides
stop matching each other in height.
