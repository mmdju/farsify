# Glare Hover

A shell that sends a diagonal band of light across its content: it sweeps on hover, moves with the cursor, repeats in a loop, or arrives on click — with three light profiles and a rim that glints too.

- **Category:** Showcase
- **Interaction:** Hover / Cursor / Click / Auto
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/glare-hover](https://farsifyui.ir/components/glare-hover)
- **Install ID:** `glare-hover`

## Install

```bash
npx shadcn@latest add @farsify/glare-hover
```

Or copy `components/glare-hover/glare-hover.tsx` and `components/glare-hover/glare-hover.css` from this repository into your project.

## Usage

```tsx
"use client";

import GlareHover from "@/components/farsify/glare-hover";

export function GlareCard() {
  return (
    <GlareHover width="300px" height="390px" borderRadius="14px">
      <img src="/images/poster.jpg" alt="پوستر" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </GlareHover>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* نوارِ نور زیرِ نشانگر با فنر برود — حسِ شیشه‌ی صیقلی */}
      <GlareHover width="300px" height="390px" mode="follow" softness={0.9} />

      {/* در لوپِ آرام خودش بدرخشد — برای بج و کارتِ کوچک */}
      <GlareHover width="220px" height="80px" mode="loop" interval={4} glareSize={18} />

      {/* جفتِ خطِ نورِ پرکنتراست با لبه‌ی تیز */}
      <GlareHover width="300px" height="390px" variant="twin" glareOpacity={0.8} glareSize={55} borderRadius="6px" />

      {/* نورِ رنگیِ خودت با ترکیبِ نرم روی محتوای روشن */}
      <GlareHover glareColor="#f5b400" blendMode="soft-light" glareOpacity={0.7} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | `—` | — | The card's content — usually a full-bleed image; the light sits on it with a blend mode. |
| `width` | `string` | `'auto'` | — | Width of the shell; any CSS value (such as `'300px'`). |
| `height` | `string` | `'auto'` | — | Height of the shell; any CSS value. |
| `background` | `string` | `'transparent'` | — | Background of the shell beneath the content. |
| `borderRadius` | `string` | `'10px'` | — | Corner roundness of the shell, the light, and the glowing rim. |
| `borderColor` | `string` | `'transparent'` | — | Color of the shell's one-pixel border. |
| `glareColor` | `string` | `'#ffffff'` | — | Color of the light band and the glowing rim. |
| `glareOpacity` | `number` | `0.5` | — | Intensity of the light band; the glowing rim takes 1.8 times this value. |
| `glareAngle` | `number` | `-45` | — | Angle of the light band in degrees; the sweep direction comes from it. |
| `glareSize` | `number` | `30` | — | Width of the light band as a percentage of the frame's diagonal. |
| `softness` | `number` | `0.6` | — | Softness of the band's edges in the chosen profile (0 sharp to 1 open). |
| `variant` | `'streak' | 'twin' | 'sheen'` (`streak` · `twin` · `sheen`) | `'streak'` | — | Light profile: a single line, a close pair of lines, or a broad sheen. |
| `blendMode` | `CSSProperties['mixBlendMode']` | `'screen'` | — | How the light blends with the content; `screen` glows on a dark image. |
| `rimGlint` | `boolean` | `true` | — | Whether the frame's edge glints along with the band. |
| `mode` | `'hover' | 'follow' | 'loop' | 'click'` (`hover` · `follow` · `loop` · `click`) | `'hover'` | — | What sets the band in motion — hover, following the cursor, a timed loop, or click. |
| `transitionDuration` | `number` | `650` | — | Duration of one full sweep in milliseconds; shorter sweeps scale to the shorter distance. |
| `interval` | `number` | `3` | — | Gap between sweeps in `mode: loop`, in seconds (minimum 0.5). |
| `playOnce` | `boolean` | `false` | — | In `mode: hover`, sweep only on entry and not on exit. |
| `intro` | `boolean` | `false` | — | As soon as 40% of the frame is visible, do one welcome sweep (once per mount). |
| `sweepLoop` | `boolean` | `false` | — | Repeat the light sweep endlessly; for a bento card preview. |
| `className` | `string` | `""` | — | Extra class on the root. |
| `style` | `CSSProperties` | `{}` | — | Inline style on the root; it merges with the card's own style. |

## Tips

- No dependencies: the light profile is built from 33 `color-mix` stops and the rAF loop is awake only while moving.
- For product cards, `mode: follow` with high `softness` feels like polished glass; for badges and small cards, `loop` with a long `interval` is calmer.
- On a dark image `blendMode: screen` glows; on light content try `overlay` or `soft-light`.
- Under `prefers-reduced-motion` the sweeps are off entirely; keyboard focus still gives feedback.

