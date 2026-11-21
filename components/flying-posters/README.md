# Flying Posters

An endless ring of posters that spins with scroll or drag, and every poster loops around as it passes the edges and comes back from the other side — with alternating columns, scroll lean and edge fade.

- **Category:** Showcase
- **Interaction:** Scroll / Drag / Mouse wheel
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/flying-posters](https://farsifyui.ir/components/flying-posters)
- **Install ID:** `flying-posters`

## Install

```bash
npx shadcn@latest add @farsify/flying-posters
```

Or copy `components/flying-posters/flying-posters.tsx` and `components/flying-posters/flying-posters.css` from this repository into your project.

## Usage

```tsx
"use client";

import FlyingPosters from "@/components/farsify/flying-posters";

const posters = [
  "/images/peak.jpg",
  "/images/forest.jpg",
  "/images/beach.jpg",
  "/images/night.jpg",
  "/images/mist.jpg",
  "/images/city.jpg",
];

export function PosterWall() {
  return (
    <div style={{ height: 560, position: "relative" }}>
      <FlyingPosters items={posters} />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* چرخ ماوس و کشیدن از قبل فعال‌اند؛ صحنه باید ارتفاعِ قطعی داشته باشد */}

      {/* دیوارِ گالریِ سه‌ستونه با پوسترهای عمودی و گوشه‌ی گرد */}
      <FlyingPosters
        items={posters}
        planeWidth={220}
        planeHeight={300}
        columns={3}
        radius={14}
        axis="diagonal"
      />

      {/* رانشِ آرام وقتی کسی اسکرول نمی‌کند + خمِ هنگامِ اسکرولِ تند */}
      <FlyingPosters items={posters} speed={-24} lean={0.6} shading={0.3} />

      {/* پوسترهای کروی‌گوشه با محوِ لبه‌ها */}
      <FlyingPosters items={posters} radius={28} fade={0.55} />

      {/* کلیکِ کوتاه روی هر پوستر */}
      <FlyingPosters
        items={posters}
        onItemClick={(item, index) => console.log(item.image, index)}
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<string | { image: string; link?: string; alt?: string }>` | `[]` | — | The poster images; each is center-cropped to fill its frame and repeated to fill the view. The desktop demo supplies six local photos. |
| `planeWidth` | `number` | `320` | — | Width of each poster in pixels, at the default camera. |
| `planeHeight` | `number` | `320` | — | Height of each poster in pixels, at the default camera. |
| `distortion` | `number` | `3` | — | How much sooner one corner of a poster turns than the other corner; the same twist while passing, 0 to 10. |
| `scrollEase` | `number` | `0.01` | — | How quickly the posters catch up with the wheel and drag; a lower number means a longer glide (0.002 to 0.1). |
| `cameraFov` | `number` | `45` | — | Camera field of view in degrees; a wider angle means more distant. |
| `cameraZ` | `number` | `20` | — | Distance of the camera from the posters; a higher number makes the posters smaller and flatter, a lower number brings them closer with stronger perspective. |
| `gap` | `number` | — | — | Spacing between posters in pixels; the default comes from the base default spacing, which shifts with the camera. |
| `columns` | `number` | `1` | — | Number of poster columns, 1 to 8. |
| `columnGap` | `number` | `40` | — | Spacing between columns in pixels. |
| `alternate` | `boolean` | `true` | — | Alternating columns move in the opposite direction. |
| `radius` | `number` | `0` | — | Corner radius of the posters in pixels. |
| `rotation` | `number` | `180` | — | How far each poster rotates while passing through view, in degrees. |
| `axis` | `'vertical' | 'horizontal' | 'diagonal'` (`vertical` · `horizontal` · `diagonal`) | `'vertical'` | — | The axis the posters rotate around. |
| `speed` | `number` | `0` | — | Continuous drift in pixels per second when nobody is scrolling; a negative value drifts downward. |
| `lean` | `number` | `0` | — | How far the posters bend back on fast scroll, 0 to 2. |
| `fade` | `number` | `0` | — | The posters fade toward the top and bottom edges, 0 to 1. |
| `shading` | `number` | `0` | — | Rotated posters appear darker, 0 to 1. |
| `wheel` | `boolean` | `true` | — | The mouse wheel over the stage spins the posters. |
| `drag` | `boolean` | `true` | — | Dragging with the pointer or finger spins the posters. |
| `pageScroll` | `number` | `0` | — | The posters move along with the page's own scroll; the displacement multiplier. Zero means off. |
| `onItemClick` | `(item, index) => void` | — | — | Called on a click or a short tap on a poster. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style for the root. |

## Tips

- No dependencies at all: a WebGL2 program, a texture atlas of all the images, and every poster drawn with `drawElementsInstanced` in a single call.
- The mouse wheel over the canvas does not scroll the page and spins the posters instead; for normal page scrolling, move the pointer off the canvas.
- Several columns with `columns` plus alternating columns (`alternate`) give a gallery-wall feel; for real portrait posters make `planeHeight` larger than `planeWidth`.
- Under `prefers-reduced-motion` the drift and lean are off and the fade-in is instant; manual dragging stays available.
- If WebGL2 is unavailable, the stage stays silent — the default behaves the same way.

