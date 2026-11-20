# Pulse Heart

A like pill that beats on every press: the heart contracts, springs out of place, and the counter digit rolls up one step like an odometer.

- **Category:** Buttons
- **Interaction:** Click / Touch / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/pulse-heart](https://farsifyui.ir/components/pulse-heart)
- **Install ID:** `pulse-heart`

## Install

```bash
npx shadcn@latest add @farsify/pulse-heart
```

Or copy `components/pulse-heart/pulse-heart.tsx` and `components/pulse-heart/pulse-heart.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { PulseHeart } from "@/components/farsify/pulse-heart";

export function PostLike() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(1204);

  return (
    <PulseHeart
      liked={liked}
      count={count}
      onChange={(next, total) => {
        setLiked(next);
        setCount(total);
      }}
    />
  );
}

// بدون کنترل — خودش وضعیت و شمار را نگه می‌دارد
<PulseHeart count={1204} />

// ستاره به‌جای قلب، بدونِ شمار
<PulseHeart icon="star" showCount={false} likedColor="#f5b942" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `liked` | `boolean` | — | — | Controlled state; pass it to own the state. An external change settles without playing the beat. |
| `defaultLiked` | `boolean` | `false` | — | Initial state in uncontrolled mode. |
| `count` | `number` | `0` | — | The number shown; each press adds or subtracts one. Rendering uses Persian digits and a thousands separator. |
| `onChange` | `(liked: boolean, count: number) => void` | — | — | Gives the new state and count on every press. |
| `showCount` | `boolean` | `true` | — | Whether the count is shown; turning it off collapses the pill into a circle. |
| `icon` | `"heart" | "star" | "thumb" | ReactNode` (`heart` · `star` · `thumb`) | `"heart"` | — | Built-in glyph or any custom element. |
| `idleOutline` | `boolean` | `true` | — | Whether the idle icon is outlined; turning it off gives a dimmed solid version. |
| `size` | `number` | `40` | — | Icon size, px; padding, gap and counter size derive from it. |
| `corner` | `number` | `32` | — | Pill corner radius, px. |
| `likedColor` | `string` | `"#ff4d6d"` | — | Color after liking, the hover tint and the focus ring. |
| `idleColor` | `string` | `"#8b8b93"` | — | Color before liking. |
| `pillColor` | `string` | `"#232326"` | — | Background of the pill that beats beneath the icon. |
| `textColor` | `string` | `"#f5f5f5"` | — | Counter color. |
| `duration` | `number` | `560` | — | Total beat duration, ms; the return always happens within 40% of it. |
| `dotSize` | `number` | `0.3` | — | Ratio the icon shrinks to at the return moment. |
| `overshoot` | `number` | `1.7` | — | How far it overshoots the target on the return; zero means no spring. |
| `beat` | `number` | `3` | — | Percentage the pill shrinks by at the return moment. |
| `rollDuration` | `number` | `350` | — | Duration of the changed digit's roll, ms. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `label` | `string` | `"پسندیدن"` | — | Accessible name; the counter is appended to it. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- To connect to a server, take `onChange` and pass `liked` and `count` **after** the successful response — controlled mode settles an external change without playing the beat, so it does not beat twice.
- The demo starts with `count={1204}` but the component itself defaults to `0`; pass the real count (e.g. the server's total likes) from the parent and do not rely on the demo value.
- The odometer roll turns only that one cell when a single digit changes; if the string length changes (999 → 1,000) the whole number shifts at once — the default behavior.
- The built-in icon sits inside a scalable SVG group and its stroke width comes from `--ph-stroke` (`1.5 × size / 24`). If you pass `icon` as a `ReactNode`, that element replaces the whole `<svg>` and the beat applies to the outer `<span>` — so match its stroke width to `size` yourself.
- With `prefers-reduced-motion`, both the beat and the roll turn off and the color changes with a soft transition; the count still updates immediately, so nothing is lost.
- This component **does not get RTL**, and that is deliberate: the layout is LTR-safe (`inline-flex` and `padding-inline-end` mirror themselves) and the beat axis is a symmetric scale around the center. Only the text and digits were made Persian — the same rule as `jelly-radio`.

