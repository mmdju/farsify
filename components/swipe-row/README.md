# Swipe Row

A row whose hidden actions are revealed by swiping to the side; a full swipe performs the action itself.

- **Category:** Buttons
- **Interaction:** Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/swipe-row](https://farsifyui.ir/components/swipe-row)
- **Install ID:** `swipe-row`

## Install

```bash
npx shadcn@latest add @farsify/swipe-row
```

Or copy `components/swipe-row/swipe-row.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import SwipeRow, { type SwipeAction } from "@/components/farsify/swipe-row";

const actions: SwipeAction[] = [
  { id: "delete", label: "حذف" },
  { id: "archive", label: "بایگانی", dismiss: true },
];

/** چند میلی‌ثانیه بعد ردیف برگردد. */
const RETURN_MS = 3000;

export function TaskList() {
  const [items, setItems] = useState(["بازبینی طرح", "پاسخ به ایمیل‌ها"]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const remove = (title: string, index: number) => {
    setItems((current) => current.filter((row) => row !== title));
    timers.current.push(
      setTimeout(() => {
        setItems((current) => {
          const next = [...current];
          next.splice(Math.min(index, next.length), 0, title);
          return next;
        });
      }, RETURN_MS),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((title, index) => (
        <SwipeRow
          key={title}
          label={title}
          actions={actions}
          onCommit={() => remove(title, index)}
        >
          <span>{title}</span>
        </SwipeRow>
      ))}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | — | The content of the row itself. |
| `actions` | `SwipeAction[]` | `[{ id: "delete", label: "حذف" }]` | — | The actions that come out when you swipe. |
| `actionColor` | `string` | `"#e5484d"` | — | Background of the action area. |
| `drawerColor` | `string` | `"#3f3f46"` | — | Color of the drawer, beneath the row. |
| `rowColor` | `string` | `"#27272a"` | — | Color of the row itself. |
| `textColor` | `string` | `"#f5f5f5"` | — | Text color of the row. |
| `height` | `number` | `64` | — | Height of the row. |
| `radius` | `number` | `16` | — | Corner radius. |
| `actionWidth` | `number` | `80` | — | Width of each action. |
| `direction` | `"left" | "right"` (`left` · `right`) | `"left"` | — | The direction the row moves as it opens; the drawer comes out from the opposite edge. |
| `snapBounce` | `number` | `0.2` | — | Spring bounce when it snaps into place. |
| `resistance` | `number` | `0.55` | — | Resistance against over-dragging. |
| `collapseMs` | `number` | `200` | — | Duration of the collapse after an action runs. |
| `commitAt` | `number` | `0.6` | — | From what percentage of the width a drag counts as a full swipe. |
| `fullSwipe` | `boolean` | `true` | — | Whether a full swipe runs the action directly. |
| `disabled` | `boolean` | `false` | — | Disables dragging. |
| `open` | `boolean` | — | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | — | Called when the row opens or closes. |
| `onCommit` | `(action: SwipeAction) => void` | `—` | — | Called after the swipe completes; the moment the action is committed. |
| `onAction` | `(action: SwipeAction) => void` | `—` | — | A simpler version of `onCommit`; for when only the result matters. |
| `autoPreview` | `boolean` | `false` | — | Rows open and close one after another by themselves; for a showcase card. |
| `closeOnAction` | `boolean` | `true` | — | Whether the row closes itself after an action is chosen. |
| `haptic` | `boolean` | `true` | — | A short vibration on touch devices at the moment the swipe commits. |
| `label` | `string` | `"ردیف فهرست"` | — | The default row text, when you have not passed anything to `rows`. |
| `className` | `string` | `""` | — | Extra class on the root. |
| `style` | `CSSProperties` | `{}` | — | Inline style on the root. |

## Tips

- The first action in the list is the primary one — the one a full swipe runs. The rest are laid out after it.
- With `dismiss` on an action, that one also collapses the row; without it, the drawer only closes.
- The texts are Persian and the rest of the behavior is the default — including the `direction` default, which brings the drawer out from the right.
- `onCommit` is called after the collapse animation finishes — if you change the list right there, the user will not see a jump.

