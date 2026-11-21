# Bell Toggle

A subscribe-to-updates button that rings the bell when switched on, sends out ripple rings and swaps its text with a crossfade; it also has a notification-count badge.

- **Category:** Buttons
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/bell-toggle](https://farsifyui.ir/components/bell-toggle)
- **Install ID:** `bell-toggle`

## Install

```bash
npx shadcn@latest add @farsify/bell-toggle
```

Or copy `components/bell-toggle/bell-toggle.tsx` and `components/bell-toggle/bell-toggle.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { BellToggle } from "@/components/farsify/bell-toggle";

export function SubscribeBell() {
  const [on, setOn] = useState(false);

  return (
    <BellToggle
      pressed={on}
      onChange={setOn}
      offLabel="باخبرم کن"
      onLabel="باخبرت می‌کنم"
      count={3}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* زنگوله‌ی خطی، بدونِ موج، با شمارشِ بیشتر */}
      <BellToggle clapper waves={false} count={12} onBackground="var(--color-brand)" />

      {/* بدونِ بادکنک و با لرزشِ آرام‌تر — مناسبِ فهرستِ شلوغ */}
      <BellToggle badge={false} ringAmplitude={8} ringPasses={2} size="sm" />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `offLabel` | `string` | `"باخبرم کن"` | — | Text of the off state. |
| `onLabel` | `string` | `"باخبرت می‌کنم"` | — | Text of the on state. |
| `icon` | `ReactNode` | — | — | Custom icon; if omitted, the default bell. |
| `label` | `string` | — | — | Extra accessible name. |
| `color` | `string` | `"#f5f5f5"` | — | Text and icon color in the off state. |
| `background` | `string` | `"#27272a"` | — | Button surface in the off state. |
| `onColor` | `string` | `"#18181b"` | — | Text and icon color in the on state. |
| `onBackground` | `string` | `"#f5f5f5"` | — | Button surface in the on state. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Size of the button, icon and text. |
| `radius` | `number` | `22` | — | Corner rounding, pixels. |
| `ringAmplitude` | `number` | `17` | — | Amplitude of the bell's shake, degrees. |
| `ringPasses` | `number` | `5` | — | Number of back-and-forth shakes. |
| `ringDecay` | `number` | `1` | — | Rate at which the shake fades out. |
| `ringDuration` | `number` | `820` | — | Total duration of the shake, milliseconds. |
| `ringPivot` | `number` | `16` | — | Hinge point, as a percentage of the icon height from the top. |
| `crossfadeMs` | `number` | `200` | — | Duration of the text crossfade, milliseconds. |
| `revealBounce` | `number` | `0` | — | Spring bounce on switching on, 0 to 1. |
| `count` | `number` | `0` | — | Number of unread notifications; visible only in the on state. |
| `badge` | `boolean` | `true` | — | Whether the count badge is shown. |
| `badgeColor` | `string` | `"#ef4444"` | — | Badge color. |
| `badgeTextColor` | `string` | `"#ffffff"` | — | Badge number color. |
| `waves` | `boolean` | `true` | — | Ripple waves on switching on. |
| `clapper` | `boolean` | `false` | — | An outline bell with a clapper instead of a solid icon. |
| `pressed` | `boolean` | — | — | Controlled state. |
| `defaultPressed` | `boolean` | `false` | — | Initial state in uncontrolled mode. |
| `onChange` | `(pressed: boolean) => void` | — | — | Called on every change. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- The icon is the button's first child, so under `dir="rtl"` it settles on the right on its own and the text on the left — exactly the intended layout, without `order`.
- In RTL the badge moves toward the text (left), because it is positioned with `inset-inline-end`; if you have placed it manually, in Persian it sticks to the icon's edge and overlaps it.
- Supply `count` from your own data source (for example the number of unread notifications); in the site demo, so that the badge is visible in the on state, it has a manual slider and also an automatic timer.
- Reduce `ringAmplitude` and `ringPasses` if the button repeats in a busy list; a full five-pass shake grabs attention at first glance but across ten buttons it creates clutter.
- With `prefers-reduced-motion` the shake and waves are removed and the text crossfade is shortened; the on/off state is read from color and text.

