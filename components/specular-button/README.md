# Specular Button

A glass button with a band of light circling its edge: it is drawn toward the cursor, dims with distance, and flashes once on click.

- **Category:** Buttons
- **Interaction:** Hover / Click / Touch
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/specular-button](https://farsifyui.ir/components/specular-button)
- **Install ID:** `specular-button`

## Install

```bash
npx shadcn@latest add @farsify/specular-button
```

Or copy `components/specular-button/specular-button.tsx` and `components/specular-button/specular-button.css` from this repository into your project.

## Usage

```tsx
"use client";

import { SpecularButton } from "@/components/farsify/specular-button";

export function HeroActions() {
  return (
    <SpecularButton href="/start" size="lg" radius={18}>
      شروع کن
    </SpecularButton>
  );
}

// روی گرادیانت: بدنه‌ی شیشه خاموش تا رنگِ پشت دیده شود
<SpecularButton
  href="/components"
  tint="var(--brand)"
  tintOpacity={0}
  className="bg-gradient-to-b from-blue-500 to-blue-600"
  textColor="#ffffff"
  lineColor="#ffffff"
  radius={12}
>
  دیدن کامپوننت‌ها
</SpecularButton>

// نورِ خودگردان روی سطحِ تیره
<SpecularButton autoAnimate speed={0.5} idleIntensity={0.6}>
  ادامه
</SpecularButton>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | `"Get Started"` | — | The button's label or content. |
| `href` | `string` | — | — | If given, the button becomes a link (`<a>`); without it, a `<button>`. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Size; padding and font change together. |
| `radius` | `number` | `12` | — | Corner radius, pixels. Above half the height means a pill. |
| `tint` | `string` | `var(--brand)` | — | The glass body color; any CSS color format. |
| `tintOpacity` | `number` | `1` | — | Body color density, 0 to 1. Zero to put a gradient behind the button. |
| `blur` | `number` | `0` | — | Blur behind the button, pixels. |
| `textColor` | `string` | `#ffffff` | — | Label color; it also accepts `currentColor`. |
| `lineColor` | `string` | `#ffffff` | — | Color of the light on the edge. |
| `baseColor` | `string` | `rgba(255,255,255,0.35)` | — | Color of the thin hairline that is always visible beneath the light. |
| `intensity` | `number` | `1` | — | Brightness of the edge light. |
| `idleIntensity` | `number` | `0.35` | — | How much light remains when the cursor is away, 0 to 1. |
| `shineSize` | `number` | `10` | — | How much of the perimeter the light covers at its peak, in degrees. |
| `shineFade` | `number` | `34` | — | How far the light fades out, in degrees. |
| `thickness` | `number` | `1.2` | — | Width of the lit edge, pixels. |
| `glow` | `number` | `1` | — | Soft halo around the edge and inside the glass; zero means just the sharp line. |
| `followMouse` | `boolean` | `true` | — | Whether the light sticks to the point on the edge nearest the cursor. |
| `proximity` | `number` | `250` | — | The distance closer than which the light starts following, pixels. |
| `autoAnimate` | `boolean` | `false` | — | Whether the light circles the edge by itself when the cursor is away. |
| `speed` | `number` | `0.35` | — | Speed of the automatic circling. |
| `disabled` | `boolean` | `false` | — | Turns off the button and the light. |
| `onClick` | `MouseEventHandler` | — | — | Click; on `<button>`. |
| `className` | `string` | `''` | — | Extra class for the button itself. |
| `style` | `CSSProperties` | — | — | Inline style (applied after the color variables). |

## Tips

- It looks best on a dark surface; for a light theme, make the glass and text dark (the demo's default does this).
- `href` renders a plain `<a>` so the code works in any project; if you want Next's soft navigation, navigate to the destination in `onClick` with `router.push`.
- Take the body color from `tint`, not `background`. If you pass `bg-brand-grad`, set `tintOpacity={0}` so the flat color doesn't sit on top of the gradient.
- For small buttons, lower `thickness` and `glow` — a wide light on a short height reads as a mistake.
- The ring only spins while something is changing; at rest and in a hidden tab it does zero work.

