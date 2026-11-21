# Slosh Gauge

A vertical level gauge; its liquid chases the value, tilts while moving, and splashes against the wall when it fills or empties.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/slosh-gauge](https://farsifyui.ir/components/slosh-gauge)
- **Install ID:** `slosh-gauge`

## Install

```bash
npx shadcn@latest add @farsify/slosh-gauge
```

Or copy `components/slosh-gauge/slosh-gauge.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { SloshGauge } from "@/components/farsify/slosh-gauge";

export function TankLevel() {
  const [level, setLevel] = useState(60);

  return (
    <SloshGauge
      value={level}
      onChange={setLevel}
      interactive
      ariaLabel="سطح مخزن"
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* فقط نمایش — کاربر نمی‌تواند تغییرش دهد */}
      <SloshGauge defaultValue={72} unit="٪" />

      {/* ارقام لاتین و مایعِ رنگی، با تیکِ بیشتر */}
      <SloshGauge
        defaultValue={45}
        digits="en"
        unit="%"
        ticks={8}
        liquidColor="#007bff"
        glassColor="#1c1c1f"
        width={110}
        height={220}
      />

      {/* بی‌درنگ، بدونِ فنر و پاشش — برای نمایشگری که فقط عدد می‌خواهد */}
      <SloshGauge value={30} interactive viscosity={0} tilt={0} splash={0} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | — | Controlled value. Omit it to keep it internal. |
| `defaultValue` | `number` | `60` | — | Initial value when not controlled. |
| `onChange` | `(value: number) => void` | — | — | Called on every value change. |
| `interactive` | `boolean` | `false` | — | Whether the user can change the level or it's read-only. |
| `showValue` | `boolean` | `true` | — | Show the level number on the gauge itself. |
| `disabled` | `boolean` | `false` | — | Disables dragging and the keyboard. |
| `liquidColor` | `string` | `"#f5f5f5"` | — | Color of the liquid inside the tank. |
| `glassColor` | `string` | `"#27272a"` | — | Glass color — that is, the empty tank background. |
| `width` | `number` | `88` | — | Gauge width, pixels. |
| `height` | `number` | `180` | — | Gauge height, pixels. |
| `radius` | `number` | `20` | — | Corner radius; it is itself constrained by the width and height. |
| `ticks` | `number` | `4` | — | Number of guide lines beside the gauge; zero means none. |
| `viscosity` | `number` | `0.15` | — | Thickness of the liquid; the higher it is, the later it settles and the less it sloshes. Zero means immediately. |
| `tilt` | `number` | `0.45` | — | How strongly the level tilts with movement velocity. |
| `splash` | `number` | `0.42` | — | Velocity bounce coefficient when the level hits the top or bottom; higher means more splash. |
| `unit` | `string` | `"٪"` | — | Display unit next to the number. |
| `digits` | `"fa" | "en"` (`fa` · `en`) | `"fa"` | — | Display digits on the gauge: Persian or Latin. |
| `ariaLabel` | `string` | `"سطح مخزن"` | — | Screen reader label. |
| `className` | `string` | `""` | — | Extra classes on the element itself. |

## Tips

- `digits` only changes the **visible** text; `aria-valuenow` and `aria-valuemin/max` always stay raw Latin numbers — screen readers read Persian digits poorly.
- `viscosity` zero means the spring steps aside and the level settles at once; use this for a simple display that only needs to show the number.
- For a water-like feel, lower `viscosity` and raise `splash`; for a honey-like feel, the opposite.
- Dragging beside the handle is smooth and clicking elsewhere is springy; if you want only one of them, keep `interactive` on but don't wire `onChange`.
- The tilt sign comes from the **direction** of velocity, so as the spring returns the level tilts the opposite way — that's what gives it the liquid feel.
- With `prefers-reduced-motion` the spring is damped (no splash and no tilt) but the final value is the same; users sensitive to motion lose nothing.

