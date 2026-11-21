# Circular Gallery

An arced strip of image cards wrapped around an invisible cylinder: it turns with drag or mouse wheel, fades at both edges, and picks up a subtle wave during a fast spin. Clicking a card opens it — it scales up, its description appears, and the rest dim and lose their color.

- **Category:** Showcase
- **Interaction:** Drag / Mouse wheel / Keyboard / Click
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/circular-gallery](https://farsifyui.ir/components/circular-gallery)
- **Install ID:** `circular-gallery`

## Install

```bash
npx shadcn@latest add @farsify/circular-gallery
```

Or copy `components/circular-gallery/circular-gallery.tsx` and `components/circular-gallery/circular-gallery.css` from this repository into your project.

## Usage

```tsx
"use client";

import CircularGallery from "@/components/farsify/circular-gallery";

const shots = [
  { image: "/images/mountain.jpg", text: "قله", description: "شبِ کوهستان زیرِ ستاره‌ها" },
  { image: "/images/forest.jpg", text: "جنگل", description: "نورِ صبح میانِ تنه‌ها" },
  { image: "/images/falls.jpg", text: "آبشار", description: "رودخانه‌ای از دلِ دره" },
];

export function CurvedWall() {
  return (
    <div style={{ height: 480 }}>
      <CircularGallery items={shots} />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* قوسِ تندِ درشت‌گوشه با موجِ قوی و سایه‌ی عمیق */}
      <CircularGallery items={shots} bend={4.5} itemSize={1.25} wave={2} shadow={0.45} />

      {/* ردیفِ تقریباً تخت و پرفاصله با چرخشِ کشسان */}
      <CircularGallery items={shots} bend={1.5} gap={0.5} scrollEase={0.02} wave={0} />

      {/* کارت‌های غیرفعال سیاه‌وسفید؛ رنگ فقط با هاور و فعال‌شدن */}
      <CircularGallery items={shots} grayscale />

      {/* راندشِ آرامِ خودکار پس از سکون — با هاور می‌ایستد */}
      <CircularGallery items={shots} autoScroll={0.7} />

      {/* قلمِ فارسیِ خودت برای برچسب‌ها (به‌جای واکشیِ گوگل‌فونت) */}
      <CircularGallery items={shots} font='700 30px "Peyda"' />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<{ image: string; text?: string; description?: string; alt?: string }>` | `۱۲ عکسِ نمونه` | — | The gallery images; `text` is the label under the card, `description` is the copy in the open state, and `alt` is the alternative text. Images are center-cropped, so an aspect ratio close to the card's gives the cleanest result. |
| `bend` | `number` | `3` | — | Depth of the rail's arc; zero means a flat row. Negative bends the arc the other way. |
| `textColor` | `string` | `'#ffffff'` | — | Color of the labels, the keyboard focus ring, and the placeholder for an image that is loading. |
| `borderRadius` | `number` | `0.05` | — | Corner rounding of the cards relative to their shorter side (0 to 0.5). |
| `font` | `string` | `'bold 30px Figtree'` | — | Label font as a full CSS shorthand. If it stays at the default, the typeface loads from Google Fonts; for Persian, pass your own font. |
| `fontUrl` | `string` | `—` | — | URL of a custom font file or stylesheet; if you pass one, the default fetch is skipped and the family comes from here instead. |
| `scrollSpeed` | `number` | `2` | — | Response multiplier for dragging and the mouse wheel. |
| `scrollEase` | `number` | `0.05` | — | Springiness of the target chase (0.001 to 1); lower is softer and slower. |
| `itemSize` | `number` | `1` | — | Card size multiplier relative to the scene height (0.2 to 2). |
| `itemAspect` | `number` | `0.78` | — | Width-to-height ratio of the cards; below 1 they become more vertical. |
| `gap` | `number` | `0.26` | — | Spacing between cards relative to card width. |
| `wave` | `number` | `1` | — | Surface wave that travels across the cards during a fast spin; zero means no wave. |
| `fadeEdges` | `number` | `0.12` | — | Width of the fade at both scene edges relative to the width (0 to 0.5); zero means a hard cut. |
| `shadow` | `number` | `0.25` | — | Strength of the soft shadow under the cards; zero means no shadow. |
| `grayscale` | `boolean` | `false` | — | Keep inactive cards black and white and color them on hover or activation. |
| `showTitles` | `boolean` | `true` | — | Show the label under the cards. |
| `snap` | `boolean` | `true` | — | After release, snap to the nearest card and activate it. |
| `autoScroll` | `number` | `0` | — | Gentle automatic drift after 1.8 seconds of stillness; it stops on hover, drag, an open card, or keyboard focus. |
| `openOnClick` | `boolean` | `true` | — | A click on a card opens it; turn it off so a click only activates the card. |
| `intro` | `boolean` | `true` | — | Staggered entrance animation of the cards on first render. |
| `onItemClick` | `(item: GalleryItem, index: number) => void` | `—` | — | Called when any card is clicked (before it opens). |
| `onActiveChange` | `(index: number) => void` | `—` | — | Called when the active card changes (rotation, snap, or keyboard). |
| `dpr` | `number` | `دستگاه` | — | Render pixel ratio; it defaults to the device's and is capped at 2. |

## Tips

- Zero dependencies: the engine is raw WebGL2 — a texture atlas of all the images is built once and each card is drawn with a single draw call.
- If WebGL2 is unavailable the scene stays silent — that is the default behavior too; the accessibility labels for the keyboard are always there.
- For a 'display row' gallery set `itemAspect` below 1 and `gap` high; for a wide grid, `itemAspect` above 1 with a low `bend`.
- Under `prefers-reduced-motion` the intro becomes instant, the wave and drift are off, and snapping happens immediately; manual dragging is untouched.
- The component's default font (Figtree) comes from Google Fonts; for Persian, pass your own font to `font` so no external request is made.

