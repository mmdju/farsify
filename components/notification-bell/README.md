# Notification Bell

A round bell that carries the number of unread notifications; it rattles as the count goes up, the clapper lags behind and the badge digits roll like an odometer.

- **Category:** Buttons
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/notification-bell](https://farsifyui.ir/components/notification-bell)
- **Install ID:** `notification-bell`

## Install

```bash
npx shadcn@latest add @farsify/notification-bell
```

Or copy `components/notification-bell/notification-bell.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { NotificationBell } from "@/components/farsify/notification-bell";

export function Header({ unread }: { unread: number }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-sm">پنلِ مدیریت</span>
      <NotificationBell
        count={unread}
        max={99}
        onClick={openInbox}
        aria-label="اعلان‌ها"
      />
    </header>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* فقط نشان بده که اعلانِ تازه هست، بی‌عدد */}
      <NotificationBell count={1} variant="dot" color="blue" />

      {/* اندازه و سرریز را خودت تعیین کن */}
      <NotificationBell count={128} max={9} size={56} color="violet" />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `count` | `number` | `0` | — | Number of unread notifications. Every increase rattles the bell; a decrease or staying the same has no rattle. |
| `max` | `number` | `99` | — | From this number up the badge shows "99+" and the digits do not roll. |
| `variant` | `"count" | "dot"` (`count` · `dot`) | `"count"` | — | `count` shows the number, `dot` shows just a dot — for when the count does not matter. |
| `size` | `number` | `48` | — | Button diameter in pixels; the bell, badge and badge font are all scaled from it. |
| `color` | `"red" | "orange" | "green" | "blue" | "violet"` (`red` · `orange` · `green` · `blue` · `violet`) | `"red"` | — | Badge color; the same five default system colors. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to the pointer. |
| `className` | `string` | — | — | Extra class for the button itself. |

## Tips

- Pass `count` from your own data source; the bell rattles as soon as the number goes up, so no `ref` or manual method is needed.
- The rattle only comes from the count **increasing**. That is deliberate: reading notifications should not shake the bell.
- The digits are Persian and sit in fixed-width boxes because `tabular-nums` has no effect on Peyda's Persian numerals; do not swap them by hand.
- The badge sits on the `inline-end` side — in Persian that means the top-left corner. If the `dir` prop on the parent changes, it mirrors itself.
- The remaining `<button>` props (such as `onClick` and `aria-label`) go straight to the button; for a custom label, replace the default screen-reader text with `aria-label`.
- With `prefers-reduced-motion` the rattle and rolling are removed: the badge appears and the digits jump in place, but the counting logic is untouched.

