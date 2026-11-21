# Spring Check

A checkbox that fills when checked, draws a check and strikes through its text.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/spring-check](https://farsifyui.ir/components/spring-check)
- **Install ID:** `spring-check`

## Install

```bash
npx shadcn@latest add @farsify/spring-check
```

Or copy `components/spring-check/spring-check.tsx` and `components/spring-check/spring-check.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { SpringCheck } from "@/components/farsify/spring-check";

export function TodoItem() {
  const [done, setDone] = useState(false);

  return (
    <SpringCheck
      label="ساخت بیلد"
      checked={done}
      onChange={setDone}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* بدون کنترل — مقدار اولیه‌ی تیک‌خورده */}
      <SpringCheck label="هماهنگی جلسه" defaultChecked />

      {/* رنگ برند، خانه‌ی بزرگ‌تر و خط از وسط */}
      <SpringCheck
        label="به‌روزرسانی تغییرات"
        color="var(--color-brand)"
        fillColor="var(--color-brand)"
        checkColor="#ffffff"
        boxSize={34}
        strike="center"
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | `"انجام شد"` | — | The text next to the box; it can be any node, not just a string. |
| `checked` | `boolean` | — | — | Controlled value. If you want it uncontrolled, don't pass this. |
| `defaultChecked` | `boolean` | `false` | — | Initial state in uncontrolled mode. |
| `onChange` | `(checked: boolean) => void` | — | — | Returns the new state on every change. |
| `disabled` | `boolean` | `false` | — | Dims it and makes it unclickable. |
| `color` | `string` | `#ffffff` | — | Ink color: the box outline, the text and the line through the text all use it. Its default changes with the theme. |
| `fillColor` | `string` | `#ffffff` | — | Fill color of the box in the checked state. |
| `checkColor` | `string` | `#0a0a0a` | — | Color of the check itself; it must contrast with fillColor. |
| `boxSize` | `number` | `28` | — | Side of the box, pixels. Below 24 the outline thickness goes from 2 to 1.5. |
| `boxRadius` | `number` | `9` | — | Corner radius of the box; at half of boxSize it becomes fully round. |
| `fontSize` | `number` | `18` | — | Font size of the text; the strikethrough thickness is calculated from it too. |
| `bounce` | `number` | `0.2` | — | Spring bounciness, between 0 and 1. Zero means fully damped; above 0.4 it looks too jittery. |
| `strikeLag` | `number` | `0.12` | — | How much of the motion progress passes before the line starts. Zero means at the same time as the fill. |
| `doneOpacity` | `number` | `0.42` | — | Final text opacity in the done state; one means the text doesn't dim at all. |
| `strike` | `left | center | right | none` (`left` · `center` · `right` · `none`) | `right` | — | Which side the line is drawn from. The default is right for Persian text (the reading start); for English text it is left. |
| `ariaLabel` | `string` | — | — | Screen reader label. It isn't needed if `label` has readable text, but always give it when you put an icon next to it. |
| `className` | `string` | — | — | Extra class on the button itself. |

## Tips

- For todo lists, set `bounce` around 0.1 and `strikeLag` to zero; less motion is better.
- If you use a brand color, watch the contrast of `fillColor` and `checkColor`; otherwise the check won't be visible.
- With `strike="none"` the text only dims; that is better for long labels.

