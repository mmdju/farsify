# Squish Switch

A switch whose handle stretches as you drag it and, when you let go, a spring throws it to one end.

- **Category:** Inputs
- **Interaction:** Click / Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/squish-switch](https://farsifyui.ir/components/squish-switch)
- **Install ID:** `squish-switch`

## Install

```bash
npx shadcn@latest add @farsify/squish-switch
```

Or copy `components/squish-switch/squish-switch.tsx` and `components/squish-switch/squish-switch.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { SquishSwitch } from "@/components/farsify/squish-switch";

export function AutoSave() {
  const [on, setOn] = useState(false);

  return (
    <SquishSwitch
      checked={on}
      onChange={setOn}
      ariaLabel="ذخیره‌ی خودکار"
    />
  );
}

// بدون کنترل — روشن از اول
<SquishSwitch label="اعلان‌ها" defaultChecked />

// رنگ برند و کشش بیشتر
<SquishSwitch
  label="همگام‌سازی خودکار"
  trackOnColor="var(--color-brand)"
  thumbOnColor="#ffffff"
  stretch={60}
  speed={70}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | — | — | Controlled value. If you want it uncontrolled, don't pass this. |
| `defaultChecked` | `boolean` | `false` | — | Initial state in uncontrolled mode. |
| `onChange` | `(checked: boolean) => void` | — | — | Returns the new state on every change. |
| `label` | `string` | — | — | The text next to the switch. If given, clicking it also toggles the switch (via `htmlFor`). |
| `disabled` | `boolean` | `false` | — | Dims it and makes it non-interactive. |
| `trackColor` | `string` | `#27272a (تیره) · #d4d4d8 (روشن)` | — | Track color in the off state. |
| `trackOnColor` | `string` | `#f5f5f5 (تیره) · #18181b (روشن)` | — | Track color in the on state. |
| `thumbColor` | `string` | `ترکیبِ دو رنگ نوار` | — | Handle color in the off state. Leave it empty to build it from a mix of `trackOnColor` and `trackColor`. |
| `thumbOnColor` | `string` | `همان trackColor` | — | Handle color in the on state. Leave it empty to use `trackColor` itself. |
| `width` | `number` | `76` | — | Track width, pixels. |
| `height` | `number` | `38` | — | Track height; the handle's inset from the edge and the handle's own size are calculated from it. |
| `radius` | `number` | `19` | — | Track corner radius. Above half the height it is clipped to half (a pill switch). |
| `speed` | `number` | `50` | — | Speed at which the handle reaches the other end, between 0 and 100. A higher number means softer and more stretched out. |
| `stretch` | `number` | `36` | — | How strongly the handle stretches, between 0 and 100. Zero means the handle doesn't deform at all. |
| `hoverScale` | `number` | `1.035` | — | How much the handle grows when the cursor is over it. 1 means no reaction (mouse only). |
| `colorDuration` | `number` | `320` | — | Duration of the track and handle color transition, milliseconds. |
| `ariaLabel` | `string` | — | — | Screen reader label. It isn't needed if `label` has text. |
| `id` | `string` | — | — | The switch id; if you don't give one, a unique id is generated. |
| `className` | `string` | — | — | Extra class on the component root. |

## Tips

- For frequently used switches, set `speed` around 70 so the motion is calmer; high speed is for switches the user "plays" with.
- If you set `stretch` to zero and `hoverScale` to 1, what's left is a clean ordinary switch — no stretching and no cursor reaction.
- You can also pass colors with a CSS variable: `trackOnColor="var(--color-brand)"`.

