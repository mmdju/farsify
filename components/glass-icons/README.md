# Glass Icons

A grid of glass icons that refract the color behind them; for docks, app grids, and social links.

- **Category:** Showcase
- **Interaction:** Hover / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/glass-icons](https://farsifyui.ir/components/glass-icons)
- **Install ID:** `glass-icons`

## Install

```bash
npx shadcn@latest add @farsify/glass-icons
```

Or copy `components/glass-icons/glass-icons.tsx` and `components/glass-icons/glass-icons.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Cloud, Folder, Github, Heart } from "lucide-react";
import GlassIcons from "@/components/farsify/glass-icons";

/** داکِ اپ‌ها — رنگ می‌تونه اسمِ گرادیانتِ آماده یا هر گرادیانتِ CSS باشه */
export function AppDock() {
  return (
    <GlassIcons
      items={[
        { icon: <Folder size={24} strokeWidth={1.8} />, color: "blue", label: "فایل‌ها" },
        { icon: <Heart size={24} strokeWidth={1.8} />, color: "red", label: "سلامت" },
        { icon: <Cloud size={24} strokeWidth={1.8} />, color: "indigo", label: "آب‌وهوا" },
      ]}
      size={82}
      gap={66}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* داکِ شبکه‌های اجتماعی — آیکن‌ها می‌تونن لینک واقعی هم باشن */}
      <GlassIcons
        items={[
          {
            icon: <Github size={24} strokeWidth={1.8} />,
            color: "linear-gradient(135deg, #4a4752, #1d1b22)",
            label: "GitHub",
            href: "https://github.com",
            target: "_blank",
          },
        ]}
        size={56}
        gap={22}
        columns={6}
        roundness={1}
        plate="circle"
        spread={0.12}
      />

      {/* شیشه‌ی کاملِ شفاف — چیزی که پشتِ کامپوننت باشه خم می‌شه */}
      <GlassIcons
        plate="none"
        refraction={0.9}
        dispersion={0.6}
        frost={0.15}
        tintOpacity={0.06}
        items={items}
      />

      {/* داکِ فشرده با برچسبِ همیشگی */}
      <GlassIcons
        size={60}
        gap={16}
        columns={6}
        roundness={0.42}
        plate="offset"
        spread={0.35}
        hover="float"
        labels="always"
        items={dockItems}
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `GlassIconsItem[]` | `[]` | — | The icons. Each item takes `icon`, `label`, and `color`, and optionally `href`, `target`, `onClick`, `id`, and `className`. `color` is either the name of a ready gradient (blue, purple, red, indigo, orange, green, teal, pink, graphite, silver) or any CSS color/gradient. |
| `size` | `number` | `82` | — | Width and height of each icon in px. |
| `gap` | `number` | `66` | — | Spacing between icons in px. |
| `columns` | `number` | `3` | — | How many icons per row. If they do not fit, the row wraps and moves to fewer columns. |
| `roundness` | `number` | `0.6` | — | Corner roundness; from 0 square to 1 circle. |
| `refraction` | `number` | `0.8` | — | Light refraction at the glass edge — it bends what is behind it around the rim. Works only in Chromium browsers; the rest fall back to a regular blur. |
| `bevel` | `number` | `0.6` | — | Width of the glass's curved edge, from 0 to 1. |
| `dispersion` | `number` | `0` | — | The rim's iridescence that splits the light; from 0 to 1. |
| `frost` | `number` | `0.2` | — | Glass fog — how blurred what is behind it looks; from 0 to 1. |
| `shine` | `number` | `0.85` | — | Intensity of the light catch on the glass edge; from 0 to 1. |
| `tint` | `string` | `'#dfdfdf'` | — | The glass's own color. |
| `tintOpacity` | `number` | `0.2` | — | How much `tint` colors the glass; from 0 to 1. |
| `iconColor` | `string` | `-` | — | Icon color on the glass. The default is white; on clear glass in a light theme it becomes near-black. |
| `plate` | `'tilt' | 'offset' | 'circle' | 'none'` | `'tilt'` | — | Shape of the colored layer behind the glass: tilted card, offset card, circle, or none — which makes the glass fully clear. |
| `tilt` | `number` | `30` | — | Angle of the tilted card in degrees. |
| `spread` | `number` | `0.5` | — | How far the offset card or circle pokes out from behind the glass; from 0 to 1. |
| `hover` | `'lift' | 'float' | 'press' | 'none'` | `'press'` | — | Hover animation: `lift` raises the glass and tilts the card, `float` only raises it, `press` presses it in. |
| `parallax` | `number` | `1` | — | How far the card behind the glass moves with the cursor; from 0 to 1. |
| `labels` | `'hover' | 'always' | 'none'` | `'hover'` | — | When the label under the icon appears. |
| `intro` | `boolean` | `true` | — | The first time the icons come into view, the glass settles and the cards pop out one by one. |
| `theme` | `'dark' | 'light'` | `'dark'` | — | Color of the labels and the glass edge. |
| `className` | `string` | `''` | — | Extra class for the main container. |
| `style` | `CSSProperties` | — | — | Inline style for the main container. |
| `ref` | `Ref<GlassIconsHandle>` | — | — | Imperative handle with `hover(index, on, aim?)` — a virtual hover on one cell without a real pointer; for preview drivers and storytelling. |

## Tips

- It has no dependencies — the springs are written with raw rAF and the shader with raw WebGL2; where WebGL2 is unavailable it falls back to the DOM version on its own.
- True light refraction (liquid glass) is only visible in Chrome and Edge; Safari and Firefox show the same scene with blur and a shine map.
- For fully clear glass, set `plate` to `none` — then whatever is behind the component (image, gradient, card) gets bent and becomes meaningful; on a flat background nothing is visible.
- For a dock, raise `columns` and lower `gap` — the `dock` preset in the demo does exactly this.
- The geometry (card tilt, bulge direction) is deliberately not mirrored; in right-to-left only the texts become Persian and the motion physics stays the same.

