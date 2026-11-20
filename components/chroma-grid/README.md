# Chroma Grid

A grayscale gallery that gains color under a follow spot: only within the light's radius do the photos show their true hue and their edges show their own accent color.

- **Category:** Showcase
- **Interaction:** Hover
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/chroma-grid](https://farsifyui.ir/components/chroma-grid)
- **Install ID:** `chroma-grid`

## Install

```bash
npx shadcn@latest add @farsify/chroma-grid
```

Or copy `components/chroma-grid/chroma-grid.tsx` and `components/chroma-grid/chroma-grid.css` from this repository into your project.

## Usage

```tsx
"use client";

import ChromaGrid from "@/components/farsify/chroma-grid";

const works = [
  { image: "/works/one.jpg", title: "جادهٔ مه", subtitle: "کوهستان", accent: "#7cc4ff" },
  { image: "/works/two.jpg", title: "آبشار", subtitle: "جنگل", accent: "#4cff9d" },
  { image: "/works/three.jpg", title: "فیوردِ آبی", subtitle: "دریا", accent: "#4ca8ff" },
];

export function GrayGallery() {
  return <ChromaGrid items={works} columns={3} />;
}

// ردیفِ لمسی: هر کارت با هاورِ خودش رنگ می‌گیرد
<ChromaGrid items={works} reveal="card" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ChromaItem[]` | — | — | The cards; each has `image` (required), `title`, `subtitle`, `accent` (the edge glow hue) and an optional `url`. Without them, six sample cards appear. |
| `columns` | `number` | `3` | — | The grid columns; combined with `minCardWidth`, and at a low width it reduces by itself. |
| `minCardWidth` | `number` | `180` | — | Minimum width of each card, pixels. |
| `gap` | `number` | `12` | — | Spacing between the cards. |
| `radius` | `number` | `260` | — | Radius of the global spotlight. |
| `softness` | `number` | `0.6` | — | Softness of the light's edge; zero is a sharp disc, one is a complete blur from the center. |
| `damping` | `number` | `0.45` | — | The lag of the light's pursuit; zero sticks to the pointer. |
| `fadeOut` | `number` | `0.6` | — | The time in seconds to turn off after the pointer leaves. |
| `grayscale` | `number` | `1` | — | How grayscale the normal state is; 0 means always colored. |
| `dim` | `number` | `0.12` | — | Darkness behind the light. |
| `glow` | `number` | `0.5` | — | The hue of the light that settles on the card under the spotlight. |
| `borderGlow` | `number` | `1` | — | Glow of the card edges in their own hue. |
| `reveal` | `"spotlight" | "card"` (`spotlight` · `card`) | `"spotlight"` | — | A global light under the pointer, or each card coloring independently on hover. |
| `aspectRatio` | `string` | `"3 / 2"` | — | Image ratio of the cards; such as "1 / 1" or "16 / 10". |
| `cardRadius` | `number` | `22` | — | Corner radius of the cards. |
| `showInfo` | `boolean` | `true` | — | The title and subtitle on the cards. |
| `frame` | `boolean` | `false` | — | Glass frame around the grid. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Palette of the frame and the tiles. |
| `className` | `string` | `''` | — | Extra class for the root. |

## Tips

- Each card's `accent` hue is visible only under the light: the card's edge and the colored wash beneath the image light up in that same hue — great for the gallery's visual categorization (each topic a hue).
- `reveal="card"` is better for touch rows: a global spotlight makes no sense on a touch screen and each card colors independently on hover.
- Halve `grayscale` so the gallery stays "colored by cool light" — it gives an appealing middle state that is neither black and white nor fully colored.
- With a long `fadeOut`, the light's shutdown becomes drawn out and cinematic; with zero it is instant — for busy galleries instant is better.
- It has no dependency and no permanent rAF loop: the light's falloff is a pre-built 13-stop gradient that only moves with two coordinate variables.

