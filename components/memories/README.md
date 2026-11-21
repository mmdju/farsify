# Memories

A deck of photo cards fanned on top of each other; "Start" opens the top card, you page through with arrows or by dragging card to card, and closing gathers the deck back in place.

- **Category:** Showcase
- **Interaction:** Click / Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/memories](https://farsifyui.ir/components/memories)
- **Install ID:** `memories`

## Install

```bash
npx shadcn@latest add @farsify/memories
```

Or copy `components/memories/memories.tsx` and `components/memories/memories.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Memories } from "@/components/farsify/memories";

export function MemoryCorner() {
  return <Memories />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* کارت‌های خودت — هر عکس و هر برچسب و تاریخی */}
      <Memories
        cards={[
          { label: "سفرِ شمال", date: "۳ مرداد ۱۴۰۳", src: "/photos/north.jpg" },
          { label: "عروسیِ سارا", date: "۱۲ شهریور ۱۴۰۳", src: "/photos/wedding.jpg" },
        ]}
      />

      {/* هندسهٔ دِک — فنِ بازتر با کارتهای بزرگتر */}
      <Memories spread={110} fanAngle={16} cardWidth={220} />

      {/* بی‌فن — دِکِ تخت و مرتب */}
      <Memories spread={90} fanAngle={0} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `cards` | `MemoriesCard[]` | — | — | The deck's cards (`label`, `date`, `src` and `alt` for screen readers); defaults to the component's own five memories with local photos. With a single card there are no back cards. |
| `heading` | `string` | `"مرورِ خاطره‌ها"` | — | Header of the deck state; in the open state it gives way to the current card's date. |
| `startLabel` | `string` | `"شروع"` | — | Text of the solid Start button. |
| `spread` | `number` | `75` | — | Horizontal spread of the back cards' fan in the deck state, in px. |
| `fanAngle` | `number` | `10` | — | Rotation angle of the back cards, in degrees; zero means a flat fan. |
| `cardWidth` | `number` | `200` | — | Card width on the deck; its height is 1.2× and the open state is 1.48× the width — everything derives from this number. |
| `open` | `boolean` | — | — | Controlled open/closed state of the deck; when provided, buttons and dragging no longer change the state (for toggling the deck from outside). |
| `index` | `number` | — | — | Controlled current card (0 to count minus one); do not pass it while the deck is closed so the calm gather is not disturbed. |
| `onIndexChange` | `(index: number) => void` | — | — | Returns the card number on every change — dragging, buttons, the automatic return at the end. |
| `ariaLabel` | `string` | — | — | Accessibility label for the card area — in both the deck and open states. |
| `className` | `string` | — | — | Extra class on the component container. |

## Tips

- Directions are physical and RTL-friendly: "next" is always to the left — both when dragging the card and with the arrow key; the button arrows show the same direction.
- Closing files the read card right there on the deck and, once it settles, quietly returns to the first card — so every time you open it the deck starts from the beginning.
- The "next" button is normal until a page remains, and only on the last card does it turn solid with a check: black means the end of the review, not the forward direction.
- The card throw has a threshold: more than a third of the frame or a velocity of 500px/s flips it; a half-hearted drag springs back.
- Frame and button colors are `--mm-*` variables in `memories.css` tied to the site tokens — light/dark theme switches automatically; the photo gradients are deliberately fixed.
- Only `motion` is needed; the photos use local paths and a plain `img` so nothing is tied to next/image and domain configuration.

