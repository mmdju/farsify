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

Or copy `components/day-picker/day-picker.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { DayPicker } from "@/components/farsify/day-picker";

export function ReminderSetting() {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-sm">یادآوریِ گزارش</span>
      <DayPicker
        defaultFrequency="weekly"
        defaultDay={2}
        onChange={(value) => saveSchedule(value)}
      />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* از سه‌شنبه، هر ماه */}
      <DayPicker defaultFrequency="monthly" onChange={saveSchedule} />

      {/* در چیدمانِ باریک‌تر پهن‌ترش کن */}
      <DayPicker className="max-w-sm" onChange={saveSchedule} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultDay` | `number` | `0` | — | Starting weekday, counted from Saturday (0) to Friday (6). |
| `defaultFrequency` | `"daily" | "weekly" | "monthly" | "yearly"` | `"daily"` | — | Starting repeat interval. |
| `onChange` | `(value: { day: number; frequency: DayFrequency }) => void` | — | — | Runs on every interval or weekday pick with the whole current value. |
| `autoPreview` | `boolean` | `false` | — | Site preview only — the picker opens, picks weekly and confirms by itself. Leave it off in normal use; a real `onChange` never fires while it runs. |
| `className` | `string` | `""` | — | Extra class for the outer block. |
| `accentColor` | `string` | `""` | — | Accent of the confirm button and the selected chip; leave it empty to keep the theme's primary color. |

## Tips

- `defaultDay` counts from Saturday (0) to Friday (6), so it matches the Persian week without any mapping.
- The check closes the menu; without it the menu stays open, which is what lets the weekday row appear while you pick an interval.
- Only the weekly interval shows the weekday row, which keeps the card small for daily, monthly and yearly.
- Use `onChange` to mirror the choice into your own state, a query string or a form field.
- The card is `max-w-xs` and fills the width it is given up to that; widen it with `className` when the surrounding layout is narrow.
- With `prefers-reduced-motion` the springs land instantly and the weekday row does not stagger.

