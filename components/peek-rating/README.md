# Peek Rating

A row of stars where the star under the pointer lifts and grows while a bubble shows that step's label; clicking commits and clicking again clears.

- **Category:** Inputs
- **Interaction:** Hover / Horizontal drag / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/peek-rating](https://farsifyui.ir/components/peek-rating)
- **Install ID:** `peek-rating`

## Install

```bash
npx shadcn@latest add @farsify/peek-rating
```

Or copy `components/peek-rating/peek-rating.tsx` and `components/peek-rating/peek-rating.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { PeekRating } from "@/components/farsify/peek-rating";

const LABELS = ["ضعیف", "نسبتاً خوب", "خوب", "خیلی خوب", "عالی"];

export function ProductScore() {
  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      <PeekRating
        value={score}
        onChange={setScore}
        labels={LABELS}
        size={36}
      />
      {/* برچسبِ کنارِ فرم از onPreview می‌آید و با خروجِ نشانگر
          به مقدارِ ثبت‌شده برمی‌گردد */}
      <span className="text-sm">{LABELS[score - 1] ?? "امتیازی نداده‌اید"}</span>
    </div>
  );
}

// بدون کنترل — مقدارِ اولیه‌ی ۳ از ۵
<PeekRating defaultValue={3} labels={LABELS} />

// فقط نمایش: ستاره‌ها دکمه نیستند و ریشه نقشِ img می‌گیرد
<PeekRating value={4} readOnly ariaLabel="امتیازِ این محصول" />

// قلبِ صورتی، ده پله، بدونِ حبابِ راهنما
<PeekRating
  shape="heart"
  count={10}
  activeColor="#e5484d"
  showTip={false}
  lift={9}
  magnify={1.25}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | — | Controlled mode; pass it to own the value control. |
| `defaultValue` | `number` | `0` | — | Initial value in uncontrolled mode. |
| `onChange` | `(value: number) => void` | — | — | Called on every commit; zero means cleared. |
| `onPreview` | `(value: number | null) => void` | — | — | Gives the step under the pointer on every pointer move; `null` on leave. |
| `count` | `number` | `5` | — | Number of stars. |
| `shape` | `"star" | "heart" | "bolt"` (`star` · `heart` · `bolt`) | `"star"` | — | Built-in glyph. |
| `icon` | `ReactNode` | — | — | Custom glyph instead of the built-in one. |
| `labels` | `string[]` | `[]` | — | Label for each step, used for the bubble and the star's accessible name. |
| `activeColor` | `string` | `"#f5b400"` | — | Color of lit stars and the focus ring. |
| `idleColor` | `string` | `"#52525b"` | — | Color of unlit stars. |
| `tipColor` | `string` | `"#27272a"` | — | Background of the tooltip bubble. |
| `tipTextColor` | `string` | `"#f5f5f5"` | — | Text color of the bubble. |
| `size` | `number` | `28` | — | Glyph size, in pixels; spacing, bubble height and star height derive from it. |
| `lift` | `number` | `6` | — | How many pixels the star under the pointer lifts. |
| `magnify` | `number` | `1.15` | — | Magnification of the star under the pointer. |
| `riseDuration` | `number` | `320` | — | Rise and settle duration, in milliseconds. |
| `popScale` | `number` | `1.3` | — | Strength of the selected star's spring on commit. |
| `showTip` | `boolean` | `true` | — | Whether the tooltip bubble is shown. |
| `allowClear` | `boolean` | `true` | — | Whether clicking the same star again clears the rating. |
| `readOnly` | `boolean` | `false` | — | Display only; stars become `<span>`s and the root takes the `img` role. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `ariaLabel` | `string` | `"امتیاز"` | — | Accessible name of the radio group. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- For a rating form, wire `onChange` to state and pass `defaultValue`; to display a stored rating just use `readOnly` with `value` — in that mode the stars are not buttons and the root becomes a readable image ("3 of 5").
- `onPreview` is for what a screen reader or a label next to the form needs; it receives `null` on pointer leave, so you can restore the helper text to the committed value right away.
- Pass labels **in Persian** and make their count at least equal to `count`: the bubble text comes from `labels` and each star's accessible name becomes "2 of 5, fairly good". If you do not pass them, only the step's Persian numeral is shown.
- This component does not get RTL because it does not need to: the component handles mirroring itself in JS (both the star index and the bubble position), so in Persian the first star starts from the right side and everything stays in place.
- The glyphs are inline and copied from `@hugeicons/core-free-icons` so no external UI dependency is added; they have `fill="currentColor"`, so the glyph comes out solid and takes its color from `activeColor`/`idleColor`.
- With `prefers-reduced-motion` the lift and magnification are removed entirely but the preview color stays — feedback is not lost, only its motion is reduced.

