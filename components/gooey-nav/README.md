# Gooey Nav

A pill navigation bar whose active pill breaks into gooey droplets when you pick any item, flies over to the new item, and merges back into one piece.

- **Category:** Navigation
- **Interaction:** Click / Keyboard / Hover
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/gooey-nav](https://farsifyui.ir/components/gooey-nav)
- **Install ID:** `gooey-nav`

## Install

```bash
npx shadcn@latest add @farsify/gooey-nav
```

Or copy `components/gooey-nav/gooey-nav.tsx` and `components/gooey-nav/gooey-nav.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { GooeyNav } from "@/components/farsify/gooey-nav";

const items = [
  { label: "خانه", href: "/" },
  { label: "محصولات", href: "/products" },
  { label: "درباره", href: "/about" },
  { label: "تماس", href: "/contact" },
];

export function MainMenu() {
  const [active, setActive] = useState(0);

  return (
    <GooeyNav
      items={items}
      activeIndex={active}
      onChange={(index) => setActive(index)}
      ariaLabel="منوی اصلی"
    />
  );
}

// تمِ روشن، رنگِ برند و قرصِ بزرگ‌تر
<GooeyNav
  items={items}
  theme="light"
  color="#007bff"
  size="lg"
/>

// بدونِ ناوبری: آیتم‌ها دکمه می‌شوند و فقط onChange می‌آید
<GooeyNav
  items={[{ label: "روزانه" }, { label: "هفتگی" }, { label: "ماهانه" }]}
  onChange={(index) => console.log(index)}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `GooeyNavItem[]` | `["خانه", "محصولات", "درباره", "تماس"]` | — | The items. Each item has a `label` and optionally `href` and `icon`; without `href` it renders as a button. |
| `initialActiveIndex` | `number` | `0` | — | Which item is selected initially. |
| `activeIndex` | `number` | — | — | Controlled state; pass it with `onChange` to keep control of the selection yourself. |
| `onChange` | `(index: number, item: GooeyNavItem) => void` | — | — | On every selection, returns the index and the item itself. |
| `theme` | `"dark" | "light"` (`dark` · `light`) | `"dark"` | — | Theme of the frame and text; the pill color is derived from its own luminance. |
| `color` | `string` | `تم‌آگاه (#f4f4f5 / #27272a)` | — | Color of the active pill. Pass a hex or `rgb()`; the text color inside is chosen automatically. |
| `activeTextColor` | `string` | — | — | Text color inside the pill. Omit it to have it derived from the luminance of `color`. |
| `colors` | `string[]` | `[]` | — | Color of the droplets; they blend when they meet. Empty means the pill color itself. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Size of the pill and the type. |
| `frame` | `boolean` | `true` | — | The frosted glass frame around the bar. |
| `animationTime` | `number` | `600` | — | Roughly how long the droplets take to reach the new item, milliseconds. |
| `particleCount` | `number` | `15` | — | How many droplets the active pill breaks into on each selection. |
| `spread` | `number` | `56` | — | How far the droplets spread along the path, pixels. |
| `timeVariance` | `number` | `300` | — | Random difference in each droplet's timing, milliseconds. |
| `gooeyness` | `number` | `0.5` | — | How readily droplets and pills merge, 0 to 1. |
| `wobble` | `number` | `0.5` | — | How much the new pill wobbles while forming, 0 to 1. |
| `hoverEffect` | `boolean` | `true` | — | Soft halo behind the item under the pointer. |
| `ariaLabel` | `string` | `"منو"` | — | Accessible label of the bar for screen readers. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it advances the active item itself. Keep it off in normal use. |
| `className` | `string` | `''` | — | Extra class for the bar's root. |
| `style` | `CSSProperties` | — | — | Inline style; it sits after the color variables. |

## Tips

- Give the labels Persian text and keep them short; the bar wraps with `flex-wrap`, but a single line is always more readable.
- If the items have real destinations, pass `href`; without it they become buttons and you handle navigation yourself in `onChange`.
- Pass `colors` for the droplets so you see several close hues when it breaks; leave it empty to keep the pill color.
- The active pill uses the luminance of `color` to choose white or dark text; if you pass a very light or very dark color and dislike the result, set `activeTextColor` explicitly.
- On touch devices `hoverEffect` has no effect; the halo only appears with a real pointer.
- The droplet motion is turned off under `prefers-reduced-motion` and the selection lands directly — value and accessibility stay untouched.

