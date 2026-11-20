# Magic Bento

A bento grid with follow-the-pointer border glow, surface spotlight, springy tilt and magnetism, click ripple and star particles — with six built-in visuals from a chart to an integrations hub.

- **Category:** Showcase
- **Interaction:** Hover / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/magic-bento](https://farsifyui.ir/components/magic-bento)
- **Install ID:** `magic-bento`

## Install

```bash
npx shadcn@latest add @farsify/magic-bento
```

Or copy `components/magic-bento/magic-bento.tsx` and `components/magic-bento/magic-bento.css` from this repository into your project.

## Usage

```tsx
"use client";

import MagicBento from "@/components/farsify/magic-bento";

export function ProductBento() {
  return (
    <MagicBento
      glowColor="#38bdf8"
      enableTilt
      enableMagnetism
      enableStars
      items={[
        { title: "تحلیل", description: "رفتارِ کاربر را دنبال کن", visual: "analytics" },
        { title: "امنیت", description: "حفاظتِ سازمانی", visual: "security" },
        {
          title: "همکاری",
          description: "با هم، بی‌درز",
          visual: "collaboration",
          colSpan: 2,
          rowSpan: 2,
          href: "/docs",
        },
      ]}
    />
  );
}

// محتوای کاملاً خودی با content
<MagicBento items={[{ title: "هر چیزی", content: <MyChart /> }]} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `MagicBentoItem[]` | — | — | The cards; each has `title`, `description`, `label`, `icon`, `visual` (the name of one of the six visuals or any ReactNode), `image`, `content`, `href` and `colSpan`/`rowSpan`. Without them, six sample cards are shown. |
| `columns` | `number` | `4` | — | Grid columns; at narrow widths it becomes two or one column on its own (minimum cell 150px). |
| `rowHeight` | `number` | `200` | — | Height of each grid row, in pixels. |
| `gap` | `number` | `12` | — | Spacing between cards. |
| `radius` | `number` | `20` | — | Corner radius of the cards; the inner padding is derived from this number too. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Overall palette; it can also be changed with the `--mb-*` variables. |
| `glowColor` | `string` | — | — | Hue of the border glow and the accent of the visuals; omitting it means the theme ink. |
| `textAutoHide` | `boolean` | `true` | — | Text fades out on pointer interaction so the visual can breathe. |
| `enableBorderGlow` | `boolean` | `true` | — | Border glow as the light gets close. |
| `enableSpotlight` | `boolean` | `true` | — | Spotlight on the card surface. |
| `spotlightRadius` | `number` | `300` | — | Radius of the spotlight and reach of the border glow. |
| `enableStars` | `boolean` | `false` | — | Star particles on a canvas that only come alive inside the light. |
| `particleCount` | `number` | `24` | — | Number of particles per card (0 to 120). |
| `enableTilt` | `boolean` | `false` | — | Springy tilt of the card under the pointer. |
| `enableMagnetism` | `boolean` | `false` | — | Pulling the card toward the pointer. |
| `clickEffect` | `boolean` | `true` | — | Click ripple + replay of that card's inner animations. |
| `intro` | `boolean` | `true` | — | Staggered entrance of the cards + an opening ripple when they come into view. |
| `disableAnimations` | `boolean` | `false` | — | Turns motion off entirely (it also respects `prefers-reduced-motion`). |
| `onItemClick` | `(item, index) => void` | — | — | Click on any card. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style for the root. |

## Tips

- The engine only runs rAF when something is moving — zero CPU work at rest; and with `prefers-reduced-motion` everything settles instantly.
- The `glowColor` hue does two jobs: the cards' border and the accent of the inner visuals (chart line, peak bar, flow rail) — one color makes the whole bento a family.
- The star particles (`enableStars`) are deliberately visible only inside the spotlight radius — they are dead with the spotlight off; pass the two together.
- The six inner visuals come through `visual`, and with `content` you can put in entirely your own content; `colSpan`/`rowSpan` builds the irregular bento layout.
- In the light theme the presets' bright hues get darker (orange → #ea580c, and so on) — if you pass a custom color, check it in both themes.
- Text on the cards fades out during interaction (`textAutoHide`) so the visuals can breathe — turn it off for text-only cards.

