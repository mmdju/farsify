# Slingshot

A slingshot toy: pull the ball back in its elastic socket, let go, and it flies on an arc, bounces off the plate's own edges and settles back into the socket.

- **Category:** Buttons
- **Interaction:** Drag and release / Keyboard
- **Dependencies:** `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/slingshot](https://farsifyui.ir/components/slingshot)
- **Install ID:** `slingshot`

## Install

```bash
npx shadcn@latest add @farsify/slingshot
```

Or copy `components/slingshot/slingshot.tsx` and `components/slingshot/slingshot.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Slingshot } from "@/components/farsify/slingshot";

export function TargetPractice() {
  return <Slingshot />;
}

// ---------- نمونه‌های بیشتر ----------
export function HotShot() {
  return (
    <Slingshot
      power={170}
      bounce={65}
      ballColor="#3b82f6"
      markColor="#f8fafc"
    />
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `power` | `number` | `100` | — | Scales the throw, in percent. 100 is the tuned speed; below it the ball is lobbed, above it the ball is fired. |
| `bounce` | `number` | `30` | — | How much speed a contact keeps, 0 to 100. 0 drops the ball dead, 100 keeps almost all of it. |
| `socketColor` | `string` | `"#2b2b2e"` | — | Color of the socket and of the band once it is stretched. Follows the theme unless set. |
| `ballColor` | `string` | `"#fafafa"` | — | Ball, and the dust the throw leaves behind. Follows the theme unless set. |
| `markColor` | `string` | `"#0a0a0a"` | — | Color of the arrow inside the ball. Follows the theme unless set. |
| `ariaLabel` | `string` | `"توپ رو بکش و رها کن؛ با کلیدهای جهت‌دار نشونه بگیر و با کلید فاصله پرتش کن"` | — | Accessible name of the ball, for when the default Persian label does not fit the page. |
| `className` | `string` | `—` | — | Extra class for the plate. |

## Tips

- `power` is read at the moment of release, so changing it while the ball sits in the socket changes the next throw; `bounce` is read every frame and can be changed mid-flight.
- The toy is a fixed 360 by 260 stage and the physics is measured in those pixels, so give it a box at least that wide instead of shrinking it.
- The ball is a real focus target: arrow keys aim, Space or Enter throws, Escape puts the ball back. Keep `ariaLabel` short and in the page's language.
- Dust is drawn in `ballColor` and the band in `socketColor`, so both stay in tune when you flip the palette.
- Nothing is drawn outside the stage: the ball bounces off the stage edges, so a smaller one needs a softer throw to be playable.

