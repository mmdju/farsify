# Pop Menu

A tiny round button that opens on click and turns into a full menu; the background indicator springs between options and "Exit" closes the menu.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/pop-menu](https://farsifyui.ir/components/pop-menu)
- **Install ID:** `pop-menu`

## Install

```bash
npx shadcn@latest add @farsify/pop-menu
```

Or copy `components/pop-menu/pop-menu.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { PopMenu } from "@/components/farsify/pop-menu";

export function AccountMenu() {
  return <PopMenu />;
}

// کنترل‌شده — باز/بسته و گزینهٔ فعال را خودت نگه می‌داری
export function ControlledMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("profile");

  return (
    <PopMenu
      open={open}
      onOpenChange={setOpen}
      activeId={active}
      onSelect={setActive}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* عریض‌تر با فنرِ نرم‌تر */}
      <PopMenu width={244} stiffness={300} damping={40} />

      {/* آیتمِ خطر — قرمز می‌شود و با انتخاب، منو را می‌بندد */}
      <PopMenu
        items={[
          { id: "rename", label: "تغییر نام" },
          { id: "remove", label: "حذف", danger: true },
        ]}
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `PopMenuItem[]` | — | — | Menu options; each item has `{ id, label, icon, danger }`, and a divider is just `{ id, divider: true }`. Omit it? The component's own Persian menu is used. |
| `open` | `boolean` | — | — | Controlled open state. If you do not pass it, the component keeps the state itself. |
| `defaultOpen` | `boolean` | `false` | — | Initial state in uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | — | — | Called on every open or close. |
| `activeId` | `string` | — | — | Controlled active option — determines where the spring indicator sits. |
| `defaultActiveId` | `string` | `اولین گزینهٔ غیرِجداکننده` | — | The first active option in uncontrolled mode. |
| `onSelect` | `(id: string) => void` | — | — | Returns the id of any selected option. |
| `width` | `number` | `220` | — | Width of the open menu; the closed button is always a 40-pixel square. |
| `stiffness` | `number` | `380` | — | Stiffness of the frame's opening spring — the same default shape. |
| `damping` | `number` | `34` | — | Damping of the opening spring; lower means more oscillation. |
| `indicatorStiffness` | `number` | `520` | — | Stiffness of the indicator's spring — the speed of the jump between options. |
| `accent` | `string` | — | — | Color of the indicator bar beside the active option; if omitted, the theme ink remains. For a brand color, pass e.g. `var(--color-brand)`. |
| `disabled` | `boolean` | `false` | — | Dims it and makes it unresponsive to pointer and keyboard. |
| `ariaLabel` | `string` | `"منو"` | — | Accessible name of the toggle button — it carries this label in both states. |
| `className` | `string` | — | — | Class of the 40-pixel container — e.g. `absolute` to anchor it to a corner of a frame. |

## Tips

- Icons can be any node; a simple svg with a 24 viewBox is enough — the component itself has no icon dependency.
- `danger` does not just turn red; selecting it also closes the menu — suitable for any one-way action such as exit and delete.
- Anchor the button with `className="absolute ..."` and the menu opens from that same point like a popover; the site preview does exactly this.

