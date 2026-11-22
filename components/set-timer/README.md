# Set Timer

A timer that morphs in place: a small pill opens a minutes wheel, the wheel rolls into a running countdown whose border drains with the remaining time, and it can be paused or cancelled without leaving the same surface.

- **Category:** Inputs
- **Interaction:** Click / Drag / Scroll / Keyboard
- **Dependencies:** `motion`, `@ncdai/react-wheel-picker`
- **Live preview:** [https://farsifyui.ir/components/set-timer](https://farsifyui.ir/components/set-timer)
- **Install ID:** `set-timer`

## Install

```bash
npx shadcn@latest add @farsify/set-timer
```

Or copy `components/set-timer/set-timer.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { SetTimer } from "@/components/farsify/set-timer";

export function FocusToolbar() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl bg-neutral-950">
      <SetTimer />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* روی زمینهٔ روشن هم سطحِ زغالی خودش را نگه می‌دارد */}
      <div className="rounded-2xl bg-neutral-100 p-10">
        <SetTimer />
      </div>
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autoPreview` | `boolean` | `false` | — | Site preview only — the timer opens the wheel, rolls it and runs, then cancels. Leave it off in normal use. |
| `progressColor` | `string` | `"#ff9f0a"` | — | Color of the countdown ring, the pause face and the minute highlight. |
| `surfaceColor` | `string` | `"#2c2c2c"` | — | The charcoal surface behind the whole timer; any CSS color works and the white text stays on top. |

## Tips

- The minutes wheel is `@ncdai/react-wheel-picker`; the component imports its stylesheet itself, so the package has to be installed in the project.
- All four faces are one surface that animates its width, height and radius, so nothing jumps when the timer opens, runs or resets.
- The wheel loops infinitely and the minutes stay between 1 and 60; those bounds live in the file, not in props.
- Numbers are Persian digits through `toFaDigits`, including the countdown and the accessible label.
- Colors are fixed to the dark charcoal surface with an orange progress ring and a green start button, so the timer reads the same in light and dark themes.

