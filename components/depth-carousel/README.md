# Depth Carousel

A three-dimensional rail of image cards: the front card is centered and the ones behind recede into depth, tilting and becoming blurrier and darker. It turns with drag, the mouse wheel, arrows, or autoplay, and a flick with speed carries you to the next card.

- **Category:** Showcase
- **Interaction:** Drag / Mouse wheel / Keyboard / Auto
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/depth-carousel](https://farsifyui.ir/components/depth-carousel)
- **Install ID:** `depth-carousel`

## Install

```bash
npx shadcn@latest add @farsify/depth-carousel
```

Or copy `components/depth-carousel/depth-carousel.tsx` and `components/depth-carousel/depth-carousel.css` from this repository into your project.

## Usage

```tsx
"use client";

import DepthCarousel from "@/components/farsify/depth-carousel";

const shots = [
  { image: "/images/peak.jpg", alt: "قله" },
  { image: "/images/forest.jpg", alt: "جنگل" },
  { image: "/images/lake.jpg", alt: "دریاچه" },
  { image: "/images/desert.jpg", alt: "کویر" },
];

export function DepthRail() {
  return (
    <div style={{ height: 480 }}>
      <DepthCarousel items={shots} />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* ریلِ عمیقِ تند: عمقِ زیاد، دیدِ نزدیک و تاریِ سنگین */}
      <DepthCarousel items={shots} depth={300} perspective={1100} blur={10} />

      {/* ریلِ تخت و آرام: بدونِ خم، گردگوشه و گذارِ کشیده */}
      <DepthCarousel
        items={shots}
        tilt={0}
        radius={28}
        duration={1200}
        falloff={0.35}
      />

      {/* گردشِ خودکار هر ۴ ثانیه — با هاور موقتاً می‌ایستد */}
      <DepthCarousel items={shots} autoplay autoplayDelay={4000} />

      {/* بدونِ فلش و نقطه؛ فقط کشیدن و چرخِ ماوس */}
      <DepthCarousel items={shots} showControls={false} showIndicators={false} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<string | { image: string; alt?: string }>` | `۶ عکسِ نمونه` | — | The carousel images; a plain string works too. `alt` is the image's alternative text. |
| `cardWidth` | `number` | `300` | — | Width of each card in pixels; a narrow scene scales itself down to fit. |
| `cardHeight` | `number` | `380` | — | Height of each card in pixels. |
| `radius` | `number` | `18` | — | Corner rounding radius of the cards. |
| `tint` | `string` | `'#05060a'` | — | Color of the veil that sits on the rear cards with mix-blend-mode: multiply and is stronger the further back it goes; it is zero on the front card. |
| `depth` | `number` | `220` | — | Depth of each step along the Z axis; a larger number spreads the rear cards further apart and farther away. |
| `spread` | `number` | `90` | — | Horizontal distance of each step from the front card. |
| `tilt` | `number` | `22` | — | Rotation angle of the first rear card (rotateY) in degrees; cards further back keep the same angle. |
| `tiltDirection` | `'right' | 'left'` (`right` · `left`) | `'right'` | — | Which side the rail opens toward and which way the cards bend. |
| `perspective` | `number` | `1400` | — | Perspective viewing distance in pixels; a smaller value shows the depth more steeply. |
| `visibleCards` | `number` | `4` | — | Number of cards shown on each side of the front card; the rest are hidden. |
| `falloff` | `number` | `0.2` | — | How strongly the rear cards darken; zero keeps all cards equally bright. |
| `blur` | `number` | `6` | — | Maximum blur of the rear cards in pixels; zero removes the blur entirely. |
| `duration` | `number` | `700` | — | Transition duration to the target card in milliseconds. |
| `ease` | `string` | `'power3.out'` | — | Name of the gsap-style easing curve (such as `power3.out` or `power2.inOut`). An unknown name falls back to the default. |
| `autoplay` | `boolean` | `false` | — | Automatic rotation; it pauses temporarily on hover or focus on the scene and is fully off under `prefers-reduced-motion`. |
| `autoplayDelay` | `number` | `3200` | — | Interval between autoplay steps in milliseconds (minimum 600). |
| `loop` | `boolean` | `true` | — | Go from the last card back to the first; turn it off so the carousel stops at both ends. |
| `showControls` | `boolean` | `true` | — | The two arrows beside the scene. |
| `showIndicators` | `boolean` | `true` | — | The dots at the bottom of the scene; the active dot stretches. |
| `onChange` | `(index: number, item: { image: string; alt?: string }) => void` | `—` | — | Called when the active card changes. |

## Tips

- Zero dependencies: even without gsap, the same numeric tween is rebuilt with an rAF loop and equivalent curves, adding no bundle weight.
- Want the rear cards brighter? Lighten `tint` or lower `falloff`; the veil is applied with multiply, so a light color is nearly ineffective.
- For an aggressive 'depth showcase': lower `perspective` and raise `depth`; for a calm, legible rail these defaults are enough.
- Under `prefers-reduced-motion` transitions become instant and autoplay is off; manual dragging is untouched.

