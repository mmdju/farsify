# Toast Stack

Three toasts that always stay stacked, the newest in front with a sliver of the two behind it, fanning open into a list on hover and gathering back when the pointer leaves.

- **Category:** Loaders & status
- **Interaction:** Hover / Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/toast-stack](https://farsifyui.ir/components/toast-stack)
- **Install ID:** `toast-stack`

## Install

```bash
npx shadcn@latest add @farsify/toast-stack
```

Or copy `components/toast-stack/toast-stack.tsx` and `components/toast-stack/toast-stack.css` from this repository into your project.

## Usage

```tsx
"use client";

import { ToastStack } from "@/components/farsify/toast-stack";

export function Notifications() {
  return <ToastStack />;
}

// ---------- نمونه‌های بیشتر ----------
export function TightStack() {
  return <ToastStack peek={8} gap={6} corner={28} surfaceColor="#101014" />;
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `peek` | `number` | `14` | — | How far each toast behind the front one sits above it while the stack is closed, px. |
| `gap` | `number` | `10` | — | Space between toasts once the list is open, px. |
| `corner` | `number` | `20` | — | Corner radius of every toast, px. |
| `surfaceColor` | `string` | `"#232323"` | — | Toast surface. |
| `textColor` | `string` | `"#fafafa"` | — | Title, action label and the mix the border and buttons are built from. |
| `bodyColor` | `string` | `"#a3a3a7"` | — | The line under the title, and the close icon. |
| `successColor` | `string` | `"#22c55e"` | — | Icon of the success toasts. |
| `infoColor` | `string` | `"#7aa7ff"` | — | Icon of the info toasts. |
| `warningColor` | `string` | `"#f5b544"` | — | Icon of the warning toasts. |
| `errorColor` | `string` | `"#e5484d"` | — | Icon of the error toasts. |
| `ariaLabel` | `string` | `"اعلان‌ها"` | — | Accessible name of the region the stack lives in. |
| `className` | `string` | `—` | — | Extra class for the frame. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it plays the interaction on its own. Leave it off in normal use. |

## Tips

- The stack always holds three toasts: dismissing one pulls the next item from the pool and a new one rises in at the front, so it never runs empty.
- Hover is the whole frame, not the toasts. The frame is the open list's height, so the list cannot slide out from under the pointer and close itself.
- `peek` and `gap` both feed the frame height. Raise `peek` past roughly 26 and the back toasts start hanging above the frame's top edge.
- Border, the icon well and the buttons are mixed from `textColor` and `surfaceColor`, so a light palette needs no extra props: light surface, dark text, and the edges follow.
- Behind the front toast the other two are hidden from assistive technology and their buttons are off the tab order until the stack opens; the front toast is always reachable.
- Under `prefers-reduced-motion` every move is instant instead of sprung.

