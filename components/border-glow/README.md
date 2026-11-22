# Border Glow

Move the pointer toward the card's border: from that same side a cone of colored light settles on the edge, a multi-hue mesh rotates around the frame, and a halo shines outside the card.

- **Category:** Showcase
- **Interaction:** Hover
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/border-glow](https://farsifyui.ir/components/border-glow)
- **Install ID:** `border-glow`

## Install

```bash
npx shadcn@latest add @farsify/border-glow
```

Or copy `components/border-glow/border-glow.tsx` and `components/border-glow/border-glow.css` from this repository into your project.

## Usage

```tsx
"use client";

import BorderGlow from "@/components/farsify/border-glow";

export function GlowNotice() {
  return (
    <BorderGlow className="w-[330px]" glowColor="40 80 80" colors={["#c084fc", "#f472b6", "#38bdf8"]}>
      <div className="flex min-h-[200px] flex-col items-start px-7 py-8">
        <strong className="text-lg font-semibold">نشانگر را به لبه‌ها نزدیک کن</strong>
        <p className="mt-2 text-sm opacity-60">
          درخشش از همان سمتِ لبه‌ای روشن می‌شود که نشانگر به آن نزدیک است.
        </p>
      </div>
    </BorderGlow>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* اگر رنگت هگز است، درون‌خطی به «H S L» ترجمه کن */}
      <BorderGlow glowColor={hexToHsl("#f5daa3")} />

      {/* کارتِ لمس‌نپذیر (پیش‌نمایشِ فهرست) با جاروی تکرارشونده زنده می‌ماند */}
      <BorderGlow animated sweepLoop />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | — | Card content. |
| `edgeSensitivity` | `number` | `30` | — | How close the pointer must be to the edge for the glow to wake; 0 to 100. A larger number means you have to come more precisely close to the border. |
| `glowColor` | `string` | `"40 80 80"` | — | Halo color in "H S L" form — such as "40 80 80". If you have a hex, convert it inline to this same form. |
| `backgroundColor` | `string` | `"#120F17"` | — | Card color. Its lightness sets the light-surface class and the border and shadow harmonize with it. |
| `borderRadius` | `number` | `28` | — | Corner radius, pixels. |
| `glowRadius` | `number` | `40` | — | Reach of the halo beyond the card edge, pixels. |
| `glowIntensity` | `number` | `1.0` | — | Brightness multiplier of the halo; 0.1 to 3. |
| `coneSpread` | `number` | `25` | — | Openness of the light cone on the edge; 5 to 45 percent. |
| `animated` | `boolean` | `false` | — | On entry, the cone spins a full turn around the card by itself (a one-off ~4-second sweep). |
| `colors` | `string[]` | `سه فام` | — | The three colors of the edge mesh; they are spread across seven fixed points of the frame so the card border becomes multi-hue. |
| `fillOpacity` | `number` | `0.5` | — | Strength of the colored mesh fill inside the card near the edges; 0 to 1. |
| `sweepLoop` | `boolean` | `false` | — | Re-run the entry sweep once it finishes — for non-interactive previews where the card has to stay alive. This option belongs to this component only. |
| `paused` | `boolean` | `false` | — | Freeze the glow animation without unmounting the card; the current sweep stays where it is. |
| `className` | `string` | `""` | — | Extra class for the card. |

## Tips

- All the magic is in CSS: JavaScript only writes two variables (`--edge-proximity` and `--cursor-angle`) on pointer move; so the card is cheap and you can place dozens of them side by side.
- The halo is visible only on hover or sweep — at complete rest the edge is quietly off, the same default look. If you have a non-interactive card (a list preview or bento), `animated` + `sweepLoop` takes the place of ambient light.
- The color mesh is spread across seven fixed points of the frame: your three colors repeat by the map [0,1,2,0,1,2,1] — so with three good hues you see seven different spots.
- The default colors are theme-aware: a dark card with a golden glow and a light card with a purple glow (higher intensity and lower fill) — a matching light/dark pair.
- Don't set `letter-spacing` on the text inside the card and give Persian text a line height of at least 1.6; the light frame is independent of text direction and needs no mirroring.

