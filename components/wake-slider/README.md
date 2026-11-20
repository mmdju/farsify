# Wake Slider

A slider built from slim bars; dragging sends a wave of height through them that traces the path of movement.

- **Category:** Inputs
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/wake-slider](https://farsifyui.ir/components/wake-slider)
- **Install ID:** `wake-slider`

## Install

```bash
npx shadcn@latest add @farsify/wake-slider
```

Or copy `components/wake-slider/wake-slider.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { WakeSlider } from "@/components/farsify/wake-slider";

export function VolumeLevel() {
  const [level, setLevel] = useState(50);

  return (
    <WakeSlider
      value={level}
      onChange={setLevel}
      ariaLabel="سطح صدا"
      showValue
    />
  );
}

// موجِ بلندتر و حسی سنگین‌تر
<WakeSlider
  defaultValue={30}
  bars={48}
  height={72}
  reach={12}
  sensitivity={1.6}
  glide={0.18}
  fillColor="var(--color-brand)"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | — | Controlled value. Leave it out to keep it internal. |
| `defaultValue` | `number` | `50` | — | Initial value when not controlled. |
| `onChange` | `(value: number) => void` | — | — | Called on every value change. |
| `min` | `number` | `0` | — | Minimum value. |
| `max` | `number` | `100` | — | Maximum value. |
| `step` | `number` | `1` | — | Step of value changes. |
| `bars` | `number` | `32` | — | Number of bars; more means a smoother wave and heavier rendering. |
| `height` | `number` | `56` | — | Full height of the bars, in pixels. |
| `restHeight` | `number` | `12` | — | Bar height at rest. |
| `gap` | `number` | `4` | — | Spacing between the bars. |
| `fillColor` | `string` | `"#f5f5f5"` | — | Color of the filled bars. |
| `trackColor` | `string` | `"#27272a"` | — | Color of the empty bars. |
| `crestColor` | `string` | — | — | Color of the wave crest layer; empty means the same as the fill color. |
| `sensitivity` | `number` | `1` | — | Wave sensitivity to drag speed. |
| `reach` | `number` | `6` | — | The maximum distance the wave reaches from the handle. |
| `skew` | `number` | `0.6` | — | Asymmetry of the wave: behind is taller than ahead. |
| `glide` | `number` | `0.3` | — | Glide of the handle toward the target; low means lazier. |
| `smoothing` | `number` | `100` | — | Smoothing of the computed speed. |
| `showValue` | `boolean` | `false` | — | Show the value number next to the track. |
| `formatValue` | `(value: number) => string` | — | — | Formatting of the displayed number. |
| `disabled` | `boolean` | `false` | — | Disable the whole control. |
| `ariaLabel` | `string` | `"مقدار"` | — | Screen reader label. |

## Tips

- Want a tall wave? Raise `reach` and `sensitivity` together — either one alone has little effect.
- For a "heavier" feel, bring `glide` down; for "fast and nimble", raise it.
- On mobile, 32 bars render together; if something gets slow, reduce `bars`.

