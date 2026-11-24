# Pinfold

A pinboard of paper testimonials: pinned notes sway on the wall, can be dragged anywhere and stay there, with a shuffle and a tidy button and a board that takes any colour.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/pinfold](https://farsifyui.ir/components/pinfold)
- **Install ID:** `pinfold`

## Install

```bash
npx shadcn@latest add @farsify/pinfold
```

Or copy `components/pinfold/pinfold.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { Pinfold } from "@/components/farsify/pinfold";

export function KindWords() {
  return (
    <Pinfold
      title="دیوار چیزهای قشنگ"
      subtitle="هر یادداشت را بکش؛ هرجا رها کردی همان‌جا می‌ماند."
      pin="pin"
      notes={[
        {
          quote: "برنامهٔ روشن، قیمت روشن و آخرش هم هیچ غافلگیری‌ای نبود.",
          name: "آنا محمدی",
          role: "صاحب کافه",
          color: "#FFE98A",
          shape: "square",
        },
        {
          quote: "سریع، آرام و خوش‌برخورد. هر تماس با یک قدم بعدی تمام می‌شد.",
          name: "رضا پناهی",
          role: "مدیر بازاریابی",
          color: "#FFB9D2",
          shape: "tall",
        },
        {
          quote: "ویدیوی معرفی ما بالاخره همان حسی را دارد که خودِ محصول.",
          name: "دانیال کریمی",
          role: "بنیان‌گذار",
          color: "#BEE3FF",
          shape: "wide",
        },
      ]}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `notes` | `PinfoldNote[]` | — | Yes | Testimonials to pin; each one carries a quote and a name, with an optional role, image URL, link, paper colour and shape. |
| `title` | `string` | `"دیوار چیزهای قشنگ"` | — | Headline on the pinned card at the top of the board. |
| `subtitle` | `string` | `"هر یادداشت را بکش؛ هرجا رها کردی همان‌جا می‌ماند."` | — | Second line under the headline; an empty string leaves it out. |
| `showHeading` | `boolean` | `true` | — | Draws the pinned headline card and gives the notes the room it took. |
| `boardColor` | `string` | `"#1c1c1e"` | — | Surface of the board behind the notes. |
| `texture` | `boolean` | `true` | — | Fine dotted grain on the board surface. |
| `columns` | `number` | `3` | — | Notes per row on a wide board; a narrow board caps it at two. |
| `noteSize` | `number` | `210` | — | Side of a square note, px; tall and wide notes grow from it. |
| `scatter` | `number` | `32` | — | How far a note drifts from the middle of its cell, 0 to 100. |
| `tilt` | `number` | `6` | — | Largest resting tilt of a note, degrees; 0 lines the whole wall up. |
| `seed` | `number` | `4` | — | Arrangement number: the same seed always rebuilds the same scatter. |
| `pin` | `"pin" \| "tack" \| "tape" \| "none"` | `"pin"` | — | How the notes hang: a coloured push pin, a brass tack, a strip of tape, or nothing. |
| `showTools` | `boolean` | `true` | — | Shows the two pill buttons that re-scatter the wall or snap it to a grid. |
| `breeze` | `boolean` | `true` | — | A slow sway per note, each on its own period, so the wall never moves as one. |
| `height` | `number` | `640` | — | Height of the board, px; on a narrow board it is a minimum, not a cap. |
| `ariaLabel` | `string` | `"دیوار یادداشت‌ها"` | — | Accessible name of the region. |
| `className` | `string` | `''` | — | Extra class for the board. |

## Tips

- Every note keeps the place it was dropped in: a drag stores a pixel offset per card, and only the tidy button clears those offsets.
- `seed` is the arrangement number. The same seed rebuilds the same scatter, so a look you like can be dialled back in; the shuffle button walks the seeds for you.
- Turn `scatter` and `tilt` down to 0 for a wall that reads as a neat grid, and up for a pile of papers that looks handled.
- On a narrow board the component switches to two columns, squares off a wide note and can grow taller than `height` so the quotes still fit above the pins.
- The note height is fixed and a long quote is clipped, not scrolled: keep quotes to roughly 120 characters, or raise `height`.
- Dragging keeps its momentum after release and the paper swings on a damped spring; under `prefers-reduced-motion` both stop and a note lands exactly where it is dropped.
- Keyboard: Tab reaches each note, the arrow keys move it by 16px (48 with Shift), and the note is clamped to the board. The pins and the paper grain are drawn in CSS, so nothing is loaded at runtime.
