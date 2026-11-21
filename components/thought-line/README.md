# Thought Line

A "thinking" bar that announces its steps one by one and finally settles and calms down.

- **Category:** Loaders & status
- **Interaction:** Auto / Click to dismiss
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/thought-line](https://farsifyui.ir/components/thought-line)
- **Install ID:** `thought-line`

## Install

```bash
npx shadcn@latest add @farsify/thought-line
```

Or copy `components/thought-line/thought-line.tsx` and `components/thought-line/thought-line.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useEffect, useState } from "react";
import ThoughtLine from "@/components/farsify/thought-line";

const STEPS = ["خواندنِ پرونده‌ها", "جست‌وجو در مخزن", "نوشتنِ پاسخ"];
const STEP_MS = 900;

export function AssistantStatus() {
  const [visible, setVisible] = useState<string[]>([]);
  const [working, setWorking] = useState(true);

  /*
   * مرحله‌ها باید یکی‌یکی اضافه شوند.
   *
   * خودِ کامپوننت هر گام را تیک‌خورده می‌کشد جز آخری؛ پس اگر هر سه را
   * یک‌جا بده، کاربر فقط دو تیکِ آماده و یک خطِ ساکن می‌بیند. وقتی گامِ
   * آخر رسید، working را خاموش کن تا تیک بخورد و خط بنشیند.
   */
  useEffect(() => {
    const timers = STEPS.map((step, i) =>
      setTimeout(() => {
        setVisible((current) => [...current, step]);
        if (i === STEPS.length - 1) setWorking(false);
      }, i * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return <ThoughtLine steps={visible} working={working} showTimer />;
}

// پایانِ دستی — خودش تمام نمی‌شود تا working را false کنی
<ThoughtLine
  label="در حال آماده‌سازی…"
  doneLabel="آماده شد"
  glyph="dot"
  settleAfter={4}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | `"در حال فکر کردن…"` | — | The text shown while it is working. |
| `doneLabel` | `string` | — | — | The text shown after it finishes; empty means the last step stays. |
| `renderLabel` | `(text, working) => ReactNode` | — | — | A full replacement for rendering the label. |
| `glyph` | `ThoughtLineGlyph` (`sparkle` · `dot` · `none`) | `"sparkle"` | — | The marker next to the text. |
| `steps` | `string[]` | — | — | The steps shown in order. |
| `collapsible` | `boolean` | `true` | — | Collapse and expand on click. |
| `collapseOnSettle` | `boolean` | `true` | — | Collapse by itself after finishing. |
| `color` | `string` | `currentColor` | — | Text color. |
| `glyphColor` | `string` | — | — | Color of the marker; empty means the same as the text color. |
| `fontSize` | `number` | `16` | — | Font size. |
| `breathPeriod` | `number` | `1.6` | — | Breathing period of the marker, in seconds. |
| `breathDepth` | `number` | `0.45` | — | Intensity of the breathing. |
| `shimmer` | `boolean` | `true` | — | A sliding shimmer over the current text. |
| `shimmerDuration` | `number` | `1.8` | — | Duration of one shimmer cycle, in seconds. |
| `settleDuration` | `number` | `350` | — | Duration of the final settle, in milliseconds. |
| `settleBlur` | `number` | `2` | — | Transient blur while settling. |
| `working` | `boolean` | `true` | — | Is it still working? |
| `settleAfter` | `number` | `0` | — | Finish by itself after how many seconds; zero means manual. |
| `elapsed` | `number` | — | — | Elapsed time; omit it to have it count on its own. |
| `showTimer` | `boolean` | `false` | — | Show the elapsed time. |
| `onSettle` | `(seconds: number) => void` | — | — | When it settles, with the total duration. |
| `className` | `string` | `""` | — | کلاسِ اضافه برای خودِ نوار. |
| `style` | `CSSProperties` | — | — | استایلِ درون‌خطی؛ متغیرهای CSS هم قبول می‌شن (`--tl-timer` و مانندش). |

## Tips

- Add steps to the list **one at a time**, not all at once. The component checks off each step except the last, so the "one-by-one checking" is only visible when the list also fills up one by one.
- When the last step arrives, turn `working` off — that is the moment the last step gets its check, the header settles on "Thought for:", and (if `collapseOnSettle` is on) the list collapses.
- Great for a chat assistant: fill the steps from real work so the user knows where they are.
- If you give a timeout, it ends by itself after that — good for short, simulated tasks.
- Turn the marker off if you already have a marker elsewhere and do not want two.
- Do not take `breathDepth` above 0.6: the text's opacity goes from 1 to `1 - depth`, and above that the line effectively disappears.
- If you build your own counter and rely on `tabular-nums`: it does not work on **Persian** digits. Peyda has matching glyphs for them. Put each digit in a fixed-width step.

