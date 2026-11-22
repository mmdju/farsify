# Bottom Menu

A bottom toolbar where every icon owns a small panel above it: notes and capture shortcuts, a search field with quick filters, notification categories, account links, and a theme switch. Moving between icons morphs the panel's width and height while the old content blurs out and the new one sharpens in.

- **Category:** Navigation
- **Interaction:** Click / Outside click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/bottom-menu](https://farsifyui.ir/components/bottom-menu)
- **Install ID:** `bottom-menu`

## Install

```bash
npx shadcn@latest add @farsify/bottom-menu
```

Or copy `components/bottom-menu/bottom-menu.tsx` from this repository into your project. It needs `motion` and `lucide-react`, which most projects already have.

## Usage

```tsx
"use client";

import BottomMenu from "@/components/farsify/bottom-menu";

export function AppShell() {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <BottomMenu />
    </div>
  );
}
```

The panels open upwards, so the bar wants empty space above it. Labels, icons and every menu entry live in the arrays at the top of the file:

```tsx
const MAIN_NAV = [
  { icon: Plus, view: "home", label: "افزودن" },
  { icon: Search, view: "search", label: "جستجو" },
  { icon: Bell, view: "notifications", label: "اعلان‌ها" },
  { icon: UserPen, view: "profile", label: "حساب من" },
  { icon: Sun, view: "theme", label: "پوسته" },
];
```

## Props

This component takes no props. The bar, its panels and the Persian copy are all in the file, so changing the wording or the number of icons is a data edit. Colors come from the shadcn tokens, which means the bar follows the project theme; if you want the theme row to switch it, connect that click to your theme provider in the `theme` case.

## Tips

- Place it at the bottom of a screen: the panel opens upwards from the bar, so the component needs free space above it.
- Every panel is described at the top of the file as a plain array, so changing labels, icons or adding a sixth icon is a data edit rather than a JSX edit.
- The panel measures itself with a hidden copy of the content, so the size animation needs no measuring library and no explicit widths from you.
- Colors are shadcn tokens (`background`, `border`, `muted`, `accent`, `foreground`, `destructive`), so it follows the project's light and dark themes with no extra wiring.
- The theme row only highlights the choice in its own state; connect it to your theme provider when you want the click to change the site.
- The panel closes on Escape as well as on an outside click, so the bar never traps the keyboard.
