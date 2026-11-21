# Comet Dial

A rotary dial with a comet tail: the arc fills by dragging, the indicator head leaves fading particles behind, and the number sits in the middle in fixed-width Persian digits.

- **Category:** Inputs
- **Interaction:** Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/comet-dial](https://farsifyui.ir/components/comet-dial)
- **Install ID:** `comet-dial`

## Install

```bash
npx shadcn@latest add @farsify/comet-dial
```

Or copy `components/comet-dial/comet-dial.tsx` and `components/comet-dial/comet-dial.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { CometDial } from "@/components/farsify/comet-dial";

export function VolumeDial() {
  const [level, setLevel] = useState(62);

  return (
    <CometDial
      value={level}
      onChange={setLevel}
      onChangeEnd={(v) => save(v)}
      label="میزانِ صدا"
      unit="%"
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* درجه، با دنباله‌ی بلندتر و ضخامتِ بیشتر */}
      <CometDial unit="°" cometReach={240} thickness={7} accent="var(--color-brand)" />

      {/* بدونِ یکا — فقط عددِ وسط، با فنرِ نرم‌تر */}
      <CometDial unit="" speed={10} tapBounce={0.05} />

      {/* صفحه‌ی غیرفعال، برای نمایشِ مقدارِ ثبت‌شده */}
      <CometDial value={40} disabled label="تنظیمِ فعلی" />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | — | Controlled state. |
| `defaultValue` | `number` | `62` | — | Initial value in the uncontrolled state. |
| `min` | `number` | `0` | — | Minimum value. |
| `max` | `number` | `100` | — | Maximum value. |
| `step` | `number` | `1` | — | Value step. |
| `unit` | `"%" | "٪" | "°" | "dB" | ""` (`%` · `٪` · `°` · `dB` · ``) | `"%"` | — | The unit next to the number; an empty string means no unit. |
| `label` | `string` | `"مقدار"` | — | Accessible name of the dial. |
| `accent` | `string` | `"#f5f5f5"` | — | Color of the filled arc. |
| `ink` | `string` | `"#fdfdfd"` | — | Color of the centered number. |
| `size` | `number` | `250` | — | Dial side length, pixels. |
| `sweep` | `number` | `320` | — | Arc extent, degrees. |
| `thickness` | `number` | `5` | — | Rail thickness, pixels. |
| `speed` | `number` | `25` | — | Speed of the number spring, 0 to 100. |
| `tapBounce` | `number` | `0.2` | — | Spring bounce on a tap (0 to 0.9). |
| `flickBounce` | `number` | `0.1` | — | Spring bounce on a flick (0 to 0.9). |
| `momentum` | `number` | `1` | — | Multiplier for release momentum. |
| `cometReach` | `number` | `180` | — | Tail length, degrees. |
| `cometWidth` | `number` | `12` | — | Tail width, pixels. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `onChange` | `(value: number) => void` | — | — | Called on every change. |
| `onChangeEnd` | `(value: number, detail: { velocity: number; bounce: number }) => void` | — | — | When the motion ends; it also reports velocity and bounce. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- Zero is on the right in RTL and the value increases toward the left — the Persian convention. This mirroring happens in JS, so it is enough for the page to be `dir="rtl"`; no `rtl` prop is needed.
- Digits render as Persian and each one sits in a fixed-width 0.694em box; `tabular-nums` has no effect with the Peyda font, and these boxes are the only thing keeping the number from shaking while it turns.
- For a unit other than percent, change `unit` — `°`, `dB`, or an empty string. An empty string means just the number, and the number stays centered on its own.
- `onChangeEnd` is the right place to save to the server: it is not called on every drag frame, only once the spring has settled.

