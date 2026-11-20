# Carousel

A motorized carousel with five transition effects (tilt, slide, scale, fade and cube), momentum dragging, autoplay with a progress bar and seamless loop — for text, images or any other content.

- **Category:** Navigation
- **Interaction:** Drag / Click / Keyboard / Mouse wheel
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/carousel](https://farsifyui.ir/components/carousel)
- **Install ID:** `carousel`

## Install

```bash
npx shadcn@latest add @farsify/carousel
```

Or copy `components/carousel/carousel.tsx` and `components/carousel/carousel.css` from this repository into your project.

## Usage

```tsx
"use client";

import Carousel from "@/components/farsify/carousel";

const photos = [
  { id: 1, image: "/photos/one.jpg", title: "دشتِ باز", description: "آسمانِ روشن." },
  { id: 2, image: "/photos/two.jpg", title: "برآمدنِ ماه", description: "زیرِ ماهِ کامل." },
];

export function PhotoStrip() {
  return <Carousel items={photos} baseWidth={640} peek={64} frame={false} effect="scale" loop autoplay indicator="bars" />;
}

// هر محتوایی: کامپوننتِ خودت به‌جای کارت
<Carousel items={[<MyCard key="a" />, <MyCard key="b" />]} />

// استوریِ عمودیِ مکعبی
<Carousel baseWidth={270} aspectRatio={0.62} effect="cube" loop autoplay />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `CarouselEntry[]` | — | — | The cards; a string (image URL), a CarouselItem object, or any custom ReactElement. |
| `baseWidth` | `number | string` | `300` | — | Maximum width of the carousel, pixels. |
| `aspectRatio` | `number` | `1.25` | — | Width-to-height ratio of the card; 0.5 to 4. Use 0.62 for a vertical story. |
| `peek` | `number` | `0` | — | How much of the neighboring card is visible from the edge, pixels. |
| `gap` | `number` | `16` | — | Spacing between the cards, pixels. |
| `radius` | `number` | `12` | — | Corner radius of the cards. |
| `frame` | `boolean` | `true` | — | Glass frame around the carousel. |
| `effect` | `"tilt" | "slide" | "scale" | "fade" | "cube"` (`tilt` · `slide` · `scale` · `fade` · `cube`) | `"tilt"` | — | Transition effect between the cards; cube needs 3D perspective and shadow and provides them itself. |
| `indicator` | `"dots" | "bars" | "counter" | "none"` (`dots` · `bars` · `counter` · `none`) | `"dots"` | — | Indicator shape; with autoplay, bars fill so you know when the next one is. |
| `arrows` | `boolean` | `false` | — | Previous/next arrow buttons — they mirror themselves in RTL. |
| `autoplay` | `boolean` | `false` | — | Autoplay; it stops on hover (if pauseOnHover), focus, dragging, or when the tab is hidden. |
| `autoplayDelay` | `number` | `3000` | — | Autoplay interval, milliseconds (minimum 600). |
| `pauseOnHover` | `boolean` | `false` | — | Holding the pointer over the carousel pauses the playing. |
| `loop` | `boolean` | `false` | — | Seamless loop: go from the last card to the first. |
| `draggable` | `boolean` | `true` | — | Dragging with pointer/touch and the horizontal mouse wheel. |
| `round` | `boolean` | `false` | — | Full-height round card — for avatars and badges. |
| `initialIndex` | `number` | `0` | — | The first slide. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Palette of the frame and the controls; it can also be changed from outside with `--carousel-*` variables. |
| `onChange` | `(index: number) => void` | — | — | Called on every arrival at a new slide. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style of the root. |

## Tips

- The engine mirrors in RTL, not just the look: translations and the cube angle flip with the sign of the X axis, dragging follows your finger and throw velocity advances correctly — the sign is gathered in one place in `settings.sign`.
- The mouse wheel deliberately doesn't take the mirror sign: a positive deltaX means "going forward" in both directions — the same natural feel as scrolling.
- For a gallery row with a half-visible neighbor: `frame={false}` + `peek={64}` + `effect="scale"` — the blurred edge mask builds itself.
- Pair autoplay with the bar indicator (`indicator="bars"`) so the user understands how many seconds are left to the next slide — the stories pattern.
- The round card (`round`) squares the width to the image ratio; for short text inside it, `compact` applies automatically and the description is hidden.

