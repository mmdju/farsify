# Rubber Segment

A segmented bar with a rubbery glass thumb: it stretches as it jumps, sets an anchor and glides into the new cell with momentum.

- **Category:** Navigation
- **Interaction:** Click / Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/rubber-segment](https://farsifyui.ir/components/rubber-segment)
- **Install ID:** `rubber-segment`

## Install

```bash
npx shadcn@latest add @farsify/rubber-segment
```

Or copy `components/rubber-segment/rubber-segment.tsx` and `components/rubber-segment/rubber-segment.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { RubberSegment } from "@/components/farsify/rubber-segment";

export function ViewSwitch() {
  const [view, setView] = useState("فهرست");

  return (
    <RubberSegment
      aria-label="نمای فایل‌ها"
      items={["فهرست", "تخته", "تقویم"]}
      value={view}
      onChange={setView}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* گزینه‌ها می‌توانند شیء باشند — برای آیکن یا مقدارِ جدا از برچسب */}
      <RubberSegment
        items={[
          { value: "mobile", label: "موبایل" },
          { value: "tablet", label: "تبلت" },
          { value: "desktop", label: "دسکتاپ" },
        ]}
        defaultValue="tablet"
        size="lg"
      />

      {/* بدونِ کشیدگی و بدونِ کشیدن؛ انتخاب فقط با کلیک */}
      <RubberSegment items={["روز", "هفته", "ماه"]} stretch={0} draggable={false} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<string | RubberSegmentItem>` | — | yes | The options; a string or a `{ value, label, icon }` object. |
| `value` | `string` | — | — | Controlled mode; pass it to own the value control. |
| `defaultValue` | `string` | — | — | Initial value in uncontrolled mode; if omitted, the first option. |
| `onChange` | `(value: string, index: number) => void` | — | — | Called on every settled change. |
| `trackColor` | `string` | `"#27272a"` | — | Background of the bar. |
| `thumbColor` | `string` | `"#fafafa"` | — | Color of the glass thumb. |
| `textColor` | `string` | `"#fafafa"` | — | Text color of inactive options. |
| `activeTextColor` | `string` | `"#18181b"` | — | Text color of the one the thumb sits on. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Bar and text size. |
| `radius` | `number` | `10` | — | Corner rounding, in pixels. |
| `inset` | `number` | `3` | — | Inner margin of the thumb from the bar's edge, in pixels. |
| `equalSlots` | `boolean` | `true` | — | Equal width for all options. |
| `stretch` | `number` | `100` | — | Stretch percentage during the jump; zero means no stretch. |
| `squash` | `number` | `3` | — | Squash amount of the trailing edge, in pixels. |
| `speed` | `number` | `1` | — | Animation speed multiplier; 1 is the default. |
| `glide` | `number` | `75` | — | Momentum glide on release, 0 to 100. |
| `draggable` | `boolean` | `true` | — | Whether dragging the thumb across the bar is enabled. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `aria-label` | `string` | `"انتخابِ بخش"` | — | Accessible name of the radio group. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- For Persian, a three-to-four option bar is the sweet spot; keep `equalSlots` on so the cells are the same size and the thumb does not wobble in the middle.
- This component needs no manual mirroring: the reading direction of the layout comes from the page's own flex, and the arrow keys swap based on `direction` — in RTL `ArrowLeft` moves forward.
- If the indicators are too low-contrast (a light background with a light bar), make `trackColor` one step darker than the surface, not one step lighter; this is the only place where the bar's contrast shows.
- With `prefers-reduced-motion` the spring jump becomes a simple change; momentum and stretch also turn off but selection still works correctly.

