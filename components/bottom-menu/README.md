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

Or copy `components/bottom-menu/bottom-menu.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { BottomMenu } from "@/components/farsify/bottom-menu";

export function AppDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 flex justify-center pb-4">
      <BottomMenu />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* نوار در یک کارت، نه کلِ صفحه */}
      <div className="relative h-64 overflow-hidden rounded-2xl border border-neutral-200">
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <BottomMenu />
        </div>
      </div>
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autoPreview` | `boolean` | `false` | — | Site preview only — the toolbar tours its own panels and closes again. Leave it off in normal use. |
| `accentColor` | `string` | `""` | — | Tint of the active icon and the picked theme row; mixed into the page, so any accent stays readable in both themes. |

## Tips

- Place it at the bottom of a screen: the panel opens upwards from the bar, so the component needs free space above it.
- Every panel is described at the top of the file as a plain array, so changing labels, icons or adding a sixth icon is a data edit rather than a JSX edit.
- The panel measures itself with a hidden copy of the content, so the size animation needs no measuring library and no explicit widths from you.
- Colors are shadcn tokens (`background`, `border`, `muted`, `accent`, `foreground`, `destructive`), so it follows the project's light and dark themes with no extra wiring.
- The theme row only highlights the choice in its own state; connect it to your theme provider when you want the click to change the site.
- The panel closes on Escape as well as on an outside click, so the bar never traps the keyboard.

