# Bounce Sidebar

A navigation column whose selection indicator is a small dot; when the row changes, the dot jumps outward from the text along a shallow arc instead of a plain slide.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/bounce-sidebar](https://farsifyui.ir/components/bounce-sidebar)
- **Install ID:** `bounce-sidebar`

## Install

```bash
npx shadcn@latest add @farsify/bounce-sidebar
```

Or copy `components/bounce-sidebar/bounce-sidebar.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { BounceSidebar } from "@/components/farsify/bounce-sidebar";

const items = [
  { label: "عمومی", heading: true },
  { label: "داشبورد", href: "/dashboard" },
  { label: "گزارش‌ها", href: "/reports" },
  { label: "حساب", heading: true },
  { label: "پروفایل", href: "/profile" },
  { label: "امنیت", href: "/security" },
];

export function SettingsMenu() {
  const [active, setActive] = useState(1);

  return (
    <BounceSidebar
      aria-label="حساب کاربری"
      className="w-52"
      items={items}
      value={active}
      onChange={setActive}
    />
  );
}

// فهرستِ تخت، بدونِ سرفصل و با رنگِ دلخواه
<BounceSidebar
  className="w-44"
  items={["خانه", "محصولات", "درباره"]}
  dotColor="#007bff"
/>

// هم‌گام با مسیر — خودِ کامپوننت به Next وابسته نیست، پس مسیر را خودت می‌دهی
const pathname = usePathname();
const index = items.findIndex(
  (item) => typeof item !== "string" && "href" in item && item.href === pathname,
);

<BounceSidebar items={items} value={index} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `BounceSidebarItem[]` | `[{ label: "عمومی", heading: true }, { label: "داشبورد", href: "/" }, "امنیت"]` | yes | The rows. Each item is either a string, or `{ label, href }`, or `{ label, heading: true }` for a group heading. Headings count in the index but aren't selectable. |
| `value` | `number` | — | — | Selected index in controlled mode. This is what you use to keep it in sync with the route. |
| `defaultValue` | `number` | `0` | — | Initial index in uncontrolled mode. |
| `onChange` | `(index: number) => void` | — | — | Returns the new index on every selection. |
| `dotColor` | `string` | `var(--brand, currentColor)` | — | Dot color. Any CSS value is accepted; if your project has no `--brand`, it falls back to the text color. |
| `className` | `string` | — | — | Outer class on the `ul`; set the column width from here. |

## Tips

- The brand color sits on the dot only; headings are white and the same size as the rows so the hierarchy is built from weight, not from the accent color.
- `next/link` is deliberately not imported — the shipped version has to compile in a project without Next too. If you want smooth navigation, supply `value` from the route.
- The arc direction is read from the element's own `dir`: in right-to-left the dot jumps outward to the right and in left-to-right outward to the left — don't mirror anything by hand.
- Position is computed with DOM measurement and rounded to device pixel boundaries, so on a 1.25x display the dot isn't blurry or jittery.
- For long lists a fixed height with `overflow-y-auto` is better than an endless column; the dot is measured inside that same frame.

