# CoffeeMilk

A ratio bar whose two shares grow and shrink as you drag it; coffee and milk, with it always clear which side has more.

- **Category:** Showcase
- **Interaction:** Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/coffee-milk](https://farsifyui.ir/components/coffee-milk)
- **Install ID:** `coffee-milk`

## Install

```bash
npx shadcn@latest add @farsify/coffee-milk
```

Or copy `components/coffee-milk/coffee-milk.tsx` and `components/coffee-milk/coffee-milk.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { CoffeeMilk } from "@/components/farsify/coffee-milk";

export function BrewSetup() {
  const [coffee, setCoffee] = useState(65);

  return <CoffeeMilk value={coffee} onChange={setCoffee} />;
}

// کنترل‌نشده — خودش حالتش را نگه می‌دارد
<CoffeeMilk defaultValue={65} />

// برچسب‌های دلخواه — هر نسبتی که بخوای
<CoffeeMilk leftLabel="کار" rightLabel="استراحت" defaultValue={70} />

// رنگ‌های دلخواه؛ جوهرِ برچسب‌ها با متغیرهای --cm-*-word/num جدا عوض می‌شه
<CoffeeMilk coffeeFill="#8a5a2b" milkFill="#dbe4ee" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultValue` | `number` | `65` | — | Initial coffee share as a percentage (1 to 99) in the uncontrolled state. |
| `value` | `number` | — | — | Controlled value; when you provide it, dragging and the keyboard only call `onChange` and the value does not change on its own. |
| `onChange` | `(leftValue: number) => void` | — | — | Returns the rounded coffee share on every change (drag or keyboard). |
| `leftLabel` | `string` | `"قهوه"` | — | Label of the left bar. |
| `rightLabel` | `string` | `"شیر"` | — | Label of the right bar. |
| `coffeeFill` | `string` | — | — | Fill color of the coffee bar; its label ink is the `--cm-coffee-word/num` CSS variables and is changed separately. |
| `milkFill` | `string` | — | — | Fill color of the milk bar; its ink uses `--cm-milk-word/num`. |
| `gap` | `number` | `12` | — | Spacing between the two bars at the divide line, in px. |
| `tallHeight` | `number` | `56` | — | Bar height in the normal state; the slim state is always 26px. |
| `ariaLabel` | `string` | — | — | Accessible label of the bar; by default it is composed from the two labels. |
| `className` | `string` | — | — | Extra class on the component's container. |

## Tips

- The divide edge is only a visual guide and nothing sits on it; the whole bar is grabbable, even when one of the shares has become very slim.
- Each side's label first sits inside its bar and jumps above when there is no room — each side decides independently; one tightening says nothing about the other.
- The geometry stays physical: coffee is on the left and dragging tracks the pointer 1:1; only the reading order of the labels is right-to-left (like "Coffee 65%").
- The fill colors are deliberately desaturated and semi-transparent, and 'presence' works through opacity rather than brightness — because the fills are transparent, brightness would have done the opposite.
- Under `prefers-reduced-motion` all the springs become instant; dragging is already instant so it never lags behind the pointer.
- The color variables (`--cm-*`) are defined in `coffee-milk.css`; the dark theme is swapped by its own selector, and a `.light` island inside a dark page still works.

