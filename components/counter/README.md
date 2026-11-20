# Counter

A number whose digits roll like an odometer to reach the new value; digits and separators come from `Intl` itself, changes land with a spring and a stepped cascade, and fast-spinning digits pick up motion blur along the way.

- **Category:** Showcase
- **Interaction:** Value change / Auto
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/counter](https://farsifyui.ir/components/counter)
- **Install ID:** `counter`

## Install

```bash
npx shadcn@latest add @farsify/counter
```

Or copy `components/counter/counter.tsx` and `components/counter/counter.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useEffect, useState } from "react";
import Counter from "@/components/farsify/counter";

/** ثانیه‌شمارِ بازگشتی — هر تغییرِ مقدار، رقم‌ها را می‌غلتاند. */
export function BetaCountdown() {
  const [left, setLeft] = useState(2 * 86400 + 14 * 3600 + 37 * 60);

  useEffect(() => {
    const timer = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Counter
      value={left % 60}
      minDigits={2}
      fontSize={56}
      fontWeight={600}
      gap={6}
      fade={0}
      direction="down"
      digitStyle={{
        padding: "0.18em 0.14em",
        borderRadius: "0.18em",
        background: "var(--surface-hover)",
      }}
    />
  );
}

// قالب‌بندی با Intl — ارز، درصد و نگارشِ فشرده، همه با ارقامِ همان locale
<Counter value={48203.17} format={{ style: "currency", currency: "IRR" }} decimals={2} />
<Counter value={0.0342} format={{ style: "percent" }} decimals={2} />
<Counter value={48203} format={{ notation: "compact" }} />

// فنرِ شخصی‌سازی‌شده: جهشِ بلند و موجِ پله‌ای از راستِ عدد
<Counter value={99999} bounce={0.5} stagger={0.12} duration={1.1} />

// خاموشِ بی‌سروصدا — مناسبِ گوشیِ ضعیف و قاب‌های ریز
<Counter value={42} motionBlur={false} intro={false} tabular={false} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | `0` | — | The number shown; every change rolls the digits. |
| `locale` | `string` | `'fa-IR'` | — | Locale for separators, symbols, and digits; it defaults to Persian and takes its digits from it — pass another locale and the same component rolls with that script's digits. |
| `format` | `Intl.NumberFormatOptions` | `—` | — | Formatting options: currency, percent, unit, or compact notation. |
| `decimals` | `number` | `—` | — | Fixed number of decimal places; omit it to keep the format's default. |
| `minDigits` | `number` | `1` | — | Minimum digits in the integer part — leading zeros of the number. |
| `prefix` | `ReactNode` | `—` | — | Content before the number. |
| `suffix` | `ReactNode` | `—` | — | Content after the number. |
| `direction` | `'auto' | 'up' | 'down' | 'shortest'` (`auto` · `up` · `down` · `shortest`) | `'auto'` | — | Roll direction; 'auto' goes up as the value grows and down as it shrinks. |
| `duration` | `number` | `0.7` | — | Approximately the length of one roll, in seconds. |
| `bounce` | `number` | `0.2` | — | How far the digits overshoot before settling, from 0 to 0.9. |
| `stagger` | `number` | `0.04` | — | Delay between neighboring digits, in seconds — the wave of change comes from this, and it falls from the right of the number. |
| `motionBlur` | `boolean` | `true` | — | Blur of fast-spinning digits along their path; it only activates during a fast roll. |
| `intro` | `boolean` | `true` | — | A full welcome roll as soon as half of the frame is visible — once per sample. |
| `fade` | `number` | `0.3` | — | How far (in em) a digit rolls outside the text before fading; zero means clipping at the edge. |
| `fontSize` | `number | string` | `100` | — | Font size in px, or any CSS value such as "inherit". |
| `fontWeight` | `number | string` | `'inherit'` | — | Font weight of the number. |
| `textColor` | `string` | `'inherit'` | — | Color of the number; it defaults to the surrounding ink. |
| `gap` | `number` | `0` | — | Spacing between digits and symbols, px. |
| `padding` | `number` | `0` | — | Extra height per digit, px — it also opens up the roll space. |
| `tabular` | `boolean` | `true` | — | Equal widths for the digits; off means the width shifts smoothly between digits. |
| `digitStyle` | `CSSProperties` | `—` | — | Style of each digit — for example tiling it with a background and rounding. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | `—` | — | Inline style of the root. |

## Tips

- Persian digits need no manual conversion: they come from `Intl.NumberFormat` with the locale. Pass another locale (Arabic, English…) and the same component rolls with that script's digits.
- For a countdown, raise `padding` a little so the digits can breathe inside their tile and set `fade: 0` so the edge is clipped — the site demo uses exactly this combination.
- `stagger` sets the character of the display: zero means all digits roll at once; above 0.1 a stepped wave falls from the right of the number.
- On a weak phone, turn off `motionBlur` — the SVG filter only activates during a fast roll, but turning it off costs nothing.
- Under `prefers-reduced-motion` the rolls settle instantly and the new value is shown directly; the entrance animation does not play at all.
- This component does not mirror for right-to-left, and that is intentional: a number is a left-to-right run. Put the unit and label outside it so they land in the right place in a Persian layout.
- Keep `tabular` on for tabular numeric columns; for a large single-number display turn it off so the width follows the digits smoothly.

