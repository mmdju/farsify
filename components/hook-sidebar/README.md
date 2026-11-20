# Hook Sidebar

A navigation column where a dashed line runs down from the top and snaps into the active row with a cornered hook; the row under the indicator gets its own faint hook.

- **Category:** Navigation
- **Interaction:** Click / Hover / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/hook-sidebar](https://farsifyui.ir/components/hook-sidebar)
- **Install ID:** `hook-sidebar`

## Install

```bash
npx shadcn@latest add @farsify/hook-sidebar
```

Or copy `components/hook-sidebar/hook-sidebar.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { HookSidebar } from "@/components/farsify/hook-sidebar";

const items = [
  { label: "حساب کاربری", href: "/settings/account" },
  { label: "اعلان‌ها", href: "/settings/notifications" },
  { label: "امنیت", href: "/settings/security" },
  { label: "صورت‌حساب", href: "/settings/billing" },
];

export function SettingsMenu() {
  const [active, setActive] = useState(0);

  return (
    <HookSidebar
      label="تنظیمات"
      className="w-52"
      items={items}
      value={active}
      onChange={setActive}
    />
  );
}

// خطِ یک‌دست با رنگِ دلخواه، بدونِ عنوان
<HookSidebar
  className="w-44"
  items={["خانه", "محصولات", "درباره"]}
  dashed={false}
  color="#007bff"
/>

// هم‌گام با مسیر — خودِ کامپوننت به Next وابسته نیست، پس مسیر را خودت می‌دهی
const pathname = usePathname();
const index = items.findIndex((item) => item.href === pathname);

<HookSidebar items={items} value={index} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `HookSidebarItem[]` | `["حساب کاربری", "اعلان‌ها", "امنیت"]` | yes | The rows. Each item is either a string or `{ label, href }`; items with `href` render as links, the rest as buttons. |
| `label` | `string` | — | — | Heading above the column. It also becomes the navigation `aria-label` unless you provide your own `aria-label`. |
| `value` | `number` | — | — | Selected index in controlled mode. This is the one to use for syncing with the route (e.g. with `usePathname`). |
| `defaultValue` | `number` | `0` | — | Initial index in uncontrolled mode. |
| `onChange` | `(index: number) => void` | — | — | Returns the new index on every selection. |
| `color` | `string` | `var(--brand, currentColor)` | — | Color of the active line. Any CSS value works; if your project has no `--brand`, it falls back to the text color. |
| `dashed` | `boolean` | `true` | — | Dashed line (default) or a solid line. |
| `className` | `string` | — | — | Outer class on the `nav`; set the column width here. |

## Tips

- The component does not set the column width itself; pass `className="w-52"` or any other width so the rows share the same width.
- `next/link` is deliberately not imported — the shipped version must compile in non-Next projects too. If you want soft navigation, feed `value` from the route.
- The line position is measured from the DOM, so long text or a different font size won't break it; a `ResizeObserver` watches both the rows and the whole list.
- In RTL the column comes in from the right and the hook turns to the left; don't mirror anything by hand.
- For long lists a fixed height with `overflow-y-auto` is better than an endless column; the line is measured inside that frame.

