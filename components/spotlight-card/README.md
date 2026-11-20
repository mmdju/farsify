# Spotlight Card

The card surface lights up under the cursor; a soft circular light follows you, the card edge blocks the light, and pressing expands it.

- **Category:** Showcase
- **Interaction:** Hover / Press / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/spotlight-card](https://farsifyui.ir/components/spotlight-card)
- **Install ID:** `spotlight-card`

## Install

```bash
npx shadcn@latest add @farsify/spotlight-card
```

Or copy `components/spotlight-card/spotlight-card.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import SpotlightCard from "@/components/farsify/spotlight-card";

export function SpeakerCard() {
  return (
    <SpotlightCard className="w-[330px] p-6" spotlightColor="#007bff" proximity={80}>
      <div className="flex items-start justify-between">
        <img src="/jadi-avatar.jpg" alt="جادی میرمیرانی" className="h-[60px] w-[60px] rounded-full object-cover" />
      </div>
      <div className="mt-4 text-[1.45rem] font-medium leading-[1.3]">جادی میرمیرانی</div>
      <div className="mt-1 text-[15px] opacity-60">برنامه‌نویس و مدرس</div>
      <div className="mt-3.5 flex gap-2">
        <span className="rounded-lg bg-white/8 px-[10px] py-[5px] text-xs font-medium leading-none">لینوکس</span>
        <span className="rounded-lg bg-white/8 px-[10px] py-[5px] text-xs font-medium leading-none">پایتون</span>
      </div>
      <button className="mt-6 h-12 w-full rounded-full bg-white/8 text-[15px] font-medium">در ارتباط باش</button>
    </SpotlightCard>
  );
}

// نورِ مشترک: ردیفی از کارت‌ها با همان proximity یک نور می‌گیرند
<SpotlightCard proximity={80}>کارتِ اول</SpotlightCard>
<SpotlightCard proximity={80}>کارتِ دوم</SpotlightCard>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | — | The card's content. |
| `spotlightColor` | `string` | `undefined` | — | Light color; any valid CSS color is accepted and its alpha is read too. It defaults to white on a dark card and near-black ink on a light card. |
| `intensity` | `number` | `0.15` | — | Brightness of the light on the card surface; 0 to 1. |
| `spotlightSize` | `number` | `240` | — | Light radius, pixels. |
| `softness` | `number` | `0.7` | — | How soft the light's falloff is; 0 gives a sharp disc and 1 a halo that fades from the very center. |
| `shape` | `"circle" | "beam"` (`circle` · `beam`) | `"circle"` | — | A circle is a round light around the cursor; a beam pours from the card's top edge toward the cursor like stage light. |
| `borderGlow` | `number` | `0.6` | — | How much the card edge glows near the light; 0 to 1. |
| `proximity` | `number` | `80` | — | The distance outside the card from which the light reaches for it, pixels. Adjacent cards share this one light; zero means it only lights on hover. |
| `smoothing` | `number` | `0.3` | — | How much the light lags behind the cursor; zero means glued to the cursor. |
| `ambient` | `boolean` | `false` | — | When nobody points at the card, the light wanders slowly across the surface — to keep the card alive on touch screens. |
| `flare` | `boolean` | `true` | — | Pressing the card makes the light bigger and brighter. |
| `grain` | `number` | `0` | — | Film grain inside the light; 0 to 1. A little of it kills the banding of large soft gradients. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Surface, border and light behavior for a dark or light page. You can also override the colors from outside with the `--spotlight-card-surface` and `--spotlight-card-border` variables. |
| `className` | `string` | `""` | — | Extra class for the card. |
| `style` | `CSSProperties` | — | — | The card's inline style. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | — | The remaining div props — like `onClick`, `id` and `aria` — go straight to the card. |

## Tips

- This component **doesn't mirror in right-to-left and doesn't need to**: the light's position is the cursor's physical coordinates, which mean the same in RTL; Persian text inside the card lays itself out RTL automatically.
- The magic of `proximity` is in rows: several adjacent cards with the same defaults share one light — one cursor wakes all the neighbors, like a storefront that lights up as you approach.
- `ambient` is for cards that can't be touched (mobile and non-interactive previews): the light wanders slowly on its own so the card doesn't look dead.
- On large, soft gradients, a little `grain` (0.3 to 0.4) kills the color banding; `softness` zero also gives a sharp disc, which with `grain` looks cinematic.
- Keyboard accessibility is built in: anything inside the card that takes `:focus-visible` gets the light — keyboard users see the light's path too.
- The default light color is theme-aware: white on a dark card and dark ink on a light card; if you gave a custom color and it looks weak in a light theme, remember the light is multiplied by 0.28 on a white surface and appears softer.

