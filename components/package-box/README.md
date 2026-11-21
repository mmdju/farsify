# Package Box

A three-dimensional cardboard box whose tape splits on click, its flaps fold open, and the order slip rises from inside and turns to face you.

- **Category:** Showcase
- **Interaction:** Click / Hover / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/package-box](https://farsifyui.ir/components/package-box)
- **Install ID:** `package-box`

## Install

```bash
npx shadcn@latest add @farsify/package-box
```

Or copy `components/package-box/package-box.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { PackageBox } from "@/components/farsify/package-box";

const SLIP = {
  eyebrow: "برگهٔ بسته‌بندی",
  title: "سفارشت بسته شد.",
  subtitle: "بسته آماده است و به‌زودی راه می‌افتد.",
  reference: "شمارهٔ ۴۸۲۱",
  date: "۱۵ آبان ۱۴۰۵",
  recipient: "سارا احمدی",
  address: "تهران، خیابانِ بهشتی، کوچهٔ ۱۲، پلاک ۴",
  items: [
    { name: "لامپِ رومیزیِ ساده", qty: 1, price: "۲٬۴۰۰٬۰۰۰" },
    { name: "دفترِ نقطه‌دار", qty: 1, price: "۱۸۵٬۰۰۰" },
  ],
  total: "۲٬۵۸۵٬۰۰۰ تومان",
  // مهر دو سه واژه بیشتر جا ندارد: دایرهٔ ۳۸px است و متنِ بلندتر از دایره می‌زند بیرون
  stamp: "بسته شد",
};

export function OrderReceived() {
  return <PackageBox slip={SLIP} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* باز/بستهٔ کنترل‌شده از بیرون */}
      <PackageBox slip={SLIP} open={open} onOpenChange={setOpen} />

      {/* رنگِ مقوا و مهر — تنها رنگ‌های کامپوننت */}
      <PackageBox slip={SLIP} colors={{ box: "#b07b4a", accent: "#c2552b" }} />

      {/* داخلِ قابِ کوتاه: سقفِ ارتفاع + رزروِ فضا تا صفحه نپرد */}
      <PackageBox slip={SLIP} maxWidth={320} maxHeight={420} reserveSpace />

      {/* بدونِ نوارچسب یا بدونِ نشانه‌های حمل */}
      <PackageBox slip={SLIP} tape={false} symbols={false} />
    </>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | — | Controlled open state; pass `onOpenChange` alongside it. Omit it to let the component manage itself. |
| `defaultOpen` | `boolean` | `false` | — | Start with the box open (uncontrolled mode). |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | — | Called on every open/close; with `open` you can make it controlled. |
| `slip` | `PackageSlip` | — | — | Content of the slip inside the box: title, subtitle, number, date, recipient, address, items and stamp. Any field you omit falls back to its Persian placeholder. |
| `children` | `ReactNode` | `undefined` | — | Replaces the default slip; renders in the 240×340 design space (takes precedence over `slip`). |
| `colors` | `PackageBoxColors` | `مقوای طبیعی + مهرِ نارنجی` | — | `{ box, tape, paper, ink, accent }`. Every face, shadow and cardboard texture derives from `box`; `accent` is the stamp color. |
| `maxWidth` | `number` | `460` | — | Maximum scene width, in pixels. The whole scene scales to fit its container (the minimum of the width ratio and `maxHeight`). |
| `maxHeight` | `number` | `undefined` | — | Maximum scene height, in pixels. Pass it for short frames so the open box does not overflow the frame; omit it so only width constrains the scene. |
| `tape` | `boolean` | `true` | — | The tape over the seam between the flaps; opening begins when it splits. |
| `label` | `ReactNode | false` | `برچسبِ پیش‌فرض` | — | Label on the front face; `false` removes it. |
| `symbols` | `ReactNode | false` | `نشانه‌های پیش‌فرض` | — | Shipping symbols ("fragile" and "this side up") on the side face; `false` removes them. |
| `hint` | `boolean` | `true` | — | Label of the button under the box. With `false` the button remains for screen readers only (it is never removed). |
| `openLabel` | `string` | `"برای بازکردن کلیک کن"` | — | Button text in the closed state. |
| `closeLabel` | `string` | `"ببند"` | — | Button text in the open state. |
| `reserveSpace` | `boolean` | `false` | — | Reserve the open-state height up front so the page does not jump when the box opens — useful in long lists. |
| `className` | `string` | — | — | Extra class for the root. |
| `paperClassName` | `string` | — | — | Extra class for the slip itself — for custom typography. |

## Tips

- This component is a physical object, not a layout: its rotation axes and face coordinates are not mirrored. The slip's text, however, is fully right-to-left and flips itself back with `text-start` and `justify-between`.
- The scene height runs from 392px (closed) to 650px (open) in the design space. If you place it inside a short frame (card, panel), also pass `maxHeight` or the open box bursts out of the frame; `reserveSpace` also prevents the page from jumping.
- For the slip text, write digits in Persian and make numeric columns `tabular-fa` so they do not jitter when values change. Isolate Latin codes (such as SKU) with `tabular-en`.
- Do not make `box` too light or too dark: the shadow and lighting of each face derive from this color, and at both ends of the range the box looks flat. Earthy and brown cardboards give the best result.
- On mobile, the box's hover float and `whileTap` both depend on `prefers-reduced-motion`; nothing needs to be switched off by hand.
- The slip text sits inside `role="document"` with an `aria-label` and stays `inert` until opened; if you put interactive content inside the slip, remove the hint button with `hint={false}` so you do not have two controls for one job.

