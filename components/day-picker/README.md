# Day Picker

A repeat-interval picker: a compact card shows the current frequency, springs open into a row of daily, weekly, monthly and yearly options, and reveals a weekday row when the interval is weekly, so a schedule is two taps away.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/day-picker](https://farsifyui.ir/components/day-picker)
- **Install ID:** `day-picker`

## Install

```bash
npx shadcn@latest add @farsify/day-picker
```

## Usage

```tsx
"use client";

import { useState } from "react";
import { DayPicker } from "@/components/farsify/day-picker";

export function Schedule() {
  const [value, setValue] = useState({ day: 0, frequency: "weekly" as const });

  return (
    <DayPicker
      defaultFrequency="weekly"
      defaultDay={0}
      onChange={setValue}
    />
  );
}
```

The card keeps its own state, so `defaultDay` and `defaultFrequency` are only the starting point. Pass `onChange` when the rest of the page needs the choice:

```tsx
<DayPicker
  onChange={({ day, frequency }) => {
    console.log(frequency, day);
  }}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultDay` | `number` | `0` | — | Starting weekday, counted from Saturday (0) to Friday (6). |
| `defaultFrequency` | `"daily" \| "weekly" \| "monthly" \| "yearly"` (`daily` → `weekly` → `monthly` → `yearly`) | `"daily"` | — | Starting repeat interval. |
| `onChange` | `(value: { day: number; frequency: DayFrequency }) => void` | — | — | Runs on every interval or weekday pick with the whole current value. |
| `className` | `string` | `""` | — | Extra class for the outer block. |

## Tips

- `defaultDay` counts from Saturday (0) to Friday (6), so it matches the Persian week without any mapping.
- The check closes the menu; without it the menu stays open, which is what lets the weekday row appear while you pick an interval.
- Only the weekly interval shows the weekday row, which keeps the card small for daily, monthly and yearly.
- Use `onChange` to mirror the choice into your own state, a query string or a form field.
- The card is `max-w-xs` and fills the width it is given up to that; widen it with `className` when the surrounding layout is narrow.
- With `prefers-reduced-motion` the springs land instantly and the weekday row does not stagger.
