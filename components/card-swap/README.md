# Card Swap

A stack of 3D cards that changes with drag, click or autoplay: the front card jumps away, the rest shift with a five-axis spring, and a dimming halo builds depth.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/card-swap](https://farsifyui.ir/components/card-swap)
- **Install ID:** `card-swap`

## Install

```bash
npx shadcn@latest add @farsify/card-swap
```

Or copy `components/card-swap/card-swap.tsx` and `components/card-swap/card-swap.css` from this repository into your project.

## Usage

```tsx
"use client";

import CardSwap, { Card } from "@/components/farsify/card-swap";

const decks = [
  { title: "جادهٔ مه", image: "/photos/mist.jpg" },
  { title: "فیوردِ آبی", image: "/photos/fjord.jpg" },
  { title: "کمپِ برفی", image: "/photos/camp.jpg" },
];

export function TravelDeck() {
  return <CardSwap items={decks} width={460} height={340} />;
}

// کارتِ سفارشی با <Card>
<CardSwap>
  <Card>
    <div className="grid h-full place-items-center text-2xl">هر چیزی</div>
  </Card>
  <Card>...</Card>
</CardSwap>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `CardSwapItem[]` | — | — | The cards; each has `title`, `image`, `icon` and `alt`. Without them, four sample cards appear. |
| `children` | `ReactNode` | — | — | Fully custom cards with `<Card>` — if you provide them, `items` is ignored. |
| `width` | `number` | `460` | — | Width of each card, pixels. |
| `height` | `number` | `340` | — | Height of each card, pixels. |
| `cardDistance` | `number` | `60` | — | Horizontal spacing of the stack's steps. |
| `verticalDistance` | `number` | `70` | — | Vertical spacing of the steps — the cards step upward. |
| `depth` | `number` | `90` | — | Perspective depth of each step; back cards look smaller. |
| `skewAmount` | `number` | `6` | — | Skew of the stack in degrees; negative reverses its direction. |
| `visibleCards` | `number` | `4` | — | How many cards of the stack are visible. |
| `delay` | `number` | `4000` | — | Autoplay interval, milliseconds. |
| `autoplay` | `boolean` | `true` | — | Automatic advance of the front card. |
| `pauseOnHover` | `boolean` | `true` | — | Pause the playing on hover. |
| `draggable` | `boolean` | `true` | — | Dragging the front card to swap. |
| `speed` | `number` | `1` | — | Spring speed; 0.3 to 4. |
| `bounce` | `number` | `0.35` | — | Bounce of the front card when jumping; 0 to 1. |
| `parallax` | `number` | `0.5` | — | Layer separation with pointer movement; 0 to 1. |
| `hoverSpread` | `number` | `0.12` | — | How much the stack opens on hover; 0 to 0.4. |
| `dim` | `number` | `0.5` | — | Dimming of the back cards; 0 to 1. |
| `cardRadius` | `number` | `18` | — | Corner radius of the cards. |
| `intro` | `boolean` | `true` | — | Staggered entry of the cards on mount. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Palette of the tile, border and dimming; it can also be changed with `--swap-*` variables. |
| `onCardClick` | `(index: number) => void` | — | — | A click on any card (even the back ones). |
| `onChange` | `(index: number) => void` | — | — | On every swap of the front card. |
| `className` | `string` | `''` | — | Extra class for the root. |

## Tips

- The root fits itself into any box: `fit()` measures the container's width/height ratio and scales the whole stack — in a list card and bento it hosts with no configuration at all.
- The drag path builds the next card's entry direction: drag from below so the next card comes in from below — the same feel as a real stack of paper.
- Set `hoverSpread` to zero and raise `dim` for a quiet, deep stack; for a product showcase, a high `hoverSpread` and a negative `skewAmount` give a shelf feel.
- The stack opens up and to the right — the default look and not mirrored; the title on the card sits in Persian and RTL. If you ever want the stack to open to the left, make the sign of `cardDistance` negative rather than mirroring the whole engine.
- With `children` and `<Card>` you build any content; `onCardClick` is called even for the back cards.

