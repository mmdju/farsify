# Tilted Card

A 3D card that tilts toward the pointer as it moves; a light glare slides across its surface, its shadow shifts beneath it, its layers float, and a click shows its back.

- **Category:** Showcase
- **Interaction:** Hover / Click / Keyboard / Gyroscope
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/tilted-card](https://farsifyui.ir/components/tilted-card)
- **Install ID:** `tilted-card`

## Install

```bash
npx shadcn@latest add @farsify/tilted-card
```

Or copy `components/tilted-card/tilted-card.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import TiltedCard, { TiltedCardLayer } from "@/components/farsify/tilted-card";

export function AlbumCard() {
  return (
    <TiltedCard
      imageSrc="/album.jpg"
      altText="جلدِ آلبوم"
      captionText="تغییر — جی. کول"
      containerWidth="100%"
      containerHeight="100%"
      imageWidth="100%"
      imageHeight="100%"
      rotateAmplitude={14}
    >
      {/* لایهٔ شناور — با کج‌شدنِ کارت جلو می‌آید */}
      <TiltedCardLayer depth={28}>
        <div className="absolute bottom-4 start-4 text-white">
          <strong className="text-[17px] font-semibold">تغییر</strong>
        </div>
      </TiltedCardLayer>
    </TiltedCard>
  );
}

// پشتِ کارت: با کلیک، لمس یا Enter برمی‌گردد
<TiltedCard
  imageSrc="/album.jpg"
  captionText="جزئیات"
  backContent={
    <div className="flex h-full flex-col justify-center gap-2 p-5">
      <strong>ترک‌لیست</strong>
      <span className="text-sm opacity-70">پشتِ کارت هر چیزی می‌تواند باشد</span>
    </div>
  }
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `imageSrc` | `string` | — | — | The image that fills the card's surface. |
| `altText` | `string` | `"تصویرِ کارت"` | — | Alt text for the image — when the card is interactive, it also goes into `aria-label`. |
| `children` | `ReactNode` | — | — | Content on the card — over the image or instead of it. |
| `captionText` | `string` | `""` | — | The text of the small caption that follows the pointer and skates off with the speed of movement. |
| `showTooltip` | `boolean` | `true` | — | Show the follower caption on hover. |
| `overlayContent` | `ReactNode` | `null` | — | Content that floats in front of the card's surface, in a layer above it. |
| `displayOverlayContent` | `boolean` | `false` | — | Show `overlayContent`. |
| `overlayDepth` | `number` | `30` | — | How far the overlay layer comes in front of the surface, in pixels. |
| `backContent` | `ReactNode` | `null` | — | Content on the back of the card. A click, tap, or Enter flips the card. |
| `flipOnClick` | `boolean` | `true` | — | Flip the card on click. It needs `backContent`. |
| `flipped` | `boolean` | — | — | Which side to show. Do not set it to let the click flip it itself. |
| `onFlip` | `(flipped: boolean) => void` | — | — | Reports the new side on every flip. |
| `onClick` | `(event) => void` | — | — | Called on click or keyboard activation. |
| `containerWidth` | `number | string` | `"100%"` | — | Width of the area that reacts to the pointer. |
| `containerHeight` | `number | string` | `"300px"` | — | Height of that same area. |
| `imageWidth` | `number | string` | `"300px"` | — | Width of the card itself. |
| `imageHeight` | `number | string` | `"300px"` | — | Height of the card itself. |
| `rotateAmplitude` | `number` | `12` | — | How far the card tilts toward the pointer, in degrees. The maximum is 60. |
| `scaleOnHover` | `number` | `1.05` | — | How much it grows on hover. |
| `perspective` | `number | string` | `800` | — | Viewing distance, in pixels. Lower means a harsher 3D effect. |
| `radius` | `number | string` | `15` | — | Corner radius of the card. |
| `smoothness` | `number` | `0.6` | — | 0 to 1. Low means glued to the pointer, high means slipping and catching up gently with a small wobble. |
| `glare` | `number` | `0.5` | — | Intensity of the light glare that slides over the surface and edges as it tilts, 0 to 1. |
| `glareColor` | `string` | `"#ffffff"` | — | Glare color. |
| `shadow` | `number` | `0.5` | — | Intensity of the soft shadow under the card, which shifts and widens as it lifts, 0 to 1. |
| `parallax` | `number` | `1` | — | How much the image and layers shift with the tilt. Zero flattens everything. |
| `axis` | `"both" | "horizontal" | "vertical"` (`both` · `horizontal` · `vertical`) | `"both"` | — | Restricts the tilt to horizontal or vertical. |
| `reverse` | `boolean` | `false` | — | Tilt away from the pointer instead of toward it. |
| `trackWindow` | `boolean` | `false` | — | The card follows the pointer across the whole page, not just on hover. |
| `floating` | `boolean` | `false` | — | At rest, the card stays afloat with a gentle shimmer. |
| `gyroscope` | `boolean` | `true` | — | Tilt the card by tilting the phone or tablet; on iOS it asks permission on the first touch. |
| `intro` | `boolean` | `true` | — | When the card first comes into view, it springs up and settles into place. |
| `introDelay` | `number` | `0` | — | How many milliseconds to wait before entering — for staggering a row of cards. |
| `className` | `string` | `""` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style for the root. |
| `TiltedCardLayer` | `component` | — | — | Wrap content in `<TiltedCardLayer depth={30}>` to float it above the card's surface; a larger `depth` is further forward, and a negative one is further back. |

## Tips

- Nothing about the geometry is mirrored: the tilt, the shadow direction, and the glare are pure physics and `dir` has no effect on them — the Persian text on the card and the follower caption render right-to-left automatically. Placing the meta and buttons on the cover is layout, not physics, and in the demo it is arranged with logical `start`/`end`.
- Build the floating layer with `TiltedCardLayer`: `<TiltedCardLayer depth={28}>` comes forward as the card tilts and gives real 3D depth — a negative depth goes behind the image.
- The back of the card can be anything: a tracklist, a form, a QR code. Until you pass `backContent` the card is not interactive, and clickability is off for that reason.
- Accidental flips do not collide with text selection behind the card: dragging the pointer more than 6 pixels (a 6-pixel threshold) cancels the flip click.
- For a row of cards, stagger `introDelay` (like the default `index * 110`) so the cards come up one by one.
- On mobile you have two ways to tilt: touch (highly responsive, as per the default) and the gyroscope, which also handles the iOS permission on the first touch.

