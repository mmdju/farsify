# Flower Menu

A button with a + icon whose icons bloom around it like petals; a second tap gathers them back with the same calm.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/flower-menu](https://farsifyui.ir/components/flower-menu)
- **Install ID:** `flower-menu`

## Install

```bash
npx shadcn@latest add @farsify/flower-menu
```

Or copy `components/flower-menu/flower-menu.tsx` and `components/flower-menu/flower-menu.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { FlowerMenu } from "@/components/farsify/flower-menu";
import { Home, Search } from "lucide-react";

// کنترل‌شده — باز و بسته دستِ تو
export function QuickActions() {
  const [open, setOpen] = useState(false);
  return <FlowerMenu open={open} onOpenChange={setOpen} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* ساده‌ترین حالت — خودش باز و بسته می‌شود */}
      <FlowerMenu />

      {/* مرکزِ آبیِ برند و شکوفای پهن‌تر */}
      <FlowerMenu accent="var(--color-brand)" radius={110} />

      {/* فنرِ تندتر و پله‌ی کوتاه — حسِ یک‌باره شکوفا شدن */}
      <FlowerMenu stiffness={700} damping={12} stagger={12} />

      {/* آیتم‌های خودت — برچسب به aria-label می‌رود چون منو متنِ دیدنی ندارد */}
      <FlowerMenu
        items={[
          { id: "home", label: "خانه", icon: Home },
          { id: "search", label: "جست‌وجو", icon: Search },
        ]}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `FlowerMenuItem[]` | `۱۰ آیکنِ پیش‌فرض با برچسبِ فارسی` | — | The menu items; each item has an `id`, a `label`, and an icon. The label goes to `aria-label` because the menu has no visible text. |
| `open` | `boolean` | — | — | Controlled state; omit it to let the component keep its own state. |
| `onOpenChange` | `(open: boolean) => void` | — | — | Called on every open or close. |
| `radius` | `number` | `88` | — | Radius of the bloom circle in pixels — the distance from each petal's center to the center of the menu. |
| `discSize` | `number` | `46` | — | Size of each petal. |
| `centerSize` | `number` | `58` | — | Size of the center button. |
| `accent` | `string` | `رنگِ سطحِ فام (#232323)` | — | Color of the center button; the petals stay neutral. Pass a hex or `rgb()` — the `+` icon's ink automatically turns dark or light to stay readable on any color. |
| `stagger` | `number` | `35` | — | Staggered delay of each petal in milliseconds; closing uses the same step but reversed. |
| `stiffness` | `number` | `300` | — | Stiffness of the opening spring — higher means snappier. |
| `damping` | `number` | `15` | — | Spring damping; a lower value gives more bounce. |
| `blurIn` | `number` | `4` | — | Blur of the petals before opening, in pixels; set it to zero for a sharp entrance. |
| `autoPreview` | `boolean` | `false` | — | Site preview only — it runs an endless open/close cycle by itself. Keep it off in normal use. |
| `ariaLabel` | `string` | `"باز و بسته‌کردن منو"` | — | Label of the center button for screen readers. |
| `onSelect` | `(item: FlowerMenuItem) => void` | — | — | On selecting any petal (click or Enter) it returns the item and the menu closes itself; it is optional, and without it the menu just closes. |
| `className` | `string` | — | — | Extra class for the menu frame. |

## Tips

- The circle is symmetric and has no directional arrow, so nothing is mirrored for RTL — the geometry stays physical and the frame center is the same point in both directions.
- The menu frame grows with the bloom radius (it is not fixed), so even a large radius does not overflow the frame; just watch the height of the host card.
- The disc shadows are controlled by the `--fm-disc` variable in the CSS file and switch themselves in the dark theme with a `.dark` selector; if your project uses a different theme class, change that one selector.
- Closed petals have `tabIndex={-1}` and `aria-hidden` — common implementations made them invisible but still tabbable; this one fixes that.
- With `prefers-reduced-motion` all transitions become instant: the petals move without a spring and the staggered delay drops to zero.

