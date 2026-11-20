# Drift Wall

A wall of image-tile columns on a three-dimensional plane: each column drifts continuously up or down at its own speed, the plane tilts with the pointer, the edges fade into a radial mask, and the tile under the pointer comes forward at full color.

- **Category:** Showcase
- **Interaction:** Hover / Pointer / Auto
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/drift-wall](https://farsifyui.ir/components/drift-wall)
- **Install ID:** `drift-wall`

## Install

```bash
npx shadcn@latest add @farsify/drift-wall
```

Or copy `components/drift-wall/drift-wall.tsx` and `components/drift-wall/drift-wall.css` from this repository into your project.

## Usage

```tsx
"use client";

import DriftWall from "@/components/farsify/drift-wall";

const tiles = [
  { image: "/images/tile-1.jpg", title: "قله" },
  { image: "/images/tile-2.jpg", title: "جنگل" },
  { image: "/images/tile-3.jpg", title: "آبشار" },
];

export function DriftingWall() {
  return (
    <div style={{ height: 520 }}>
      <DriftWall items={tiles} />
    </div>
  );
}

// دیوارِ پس‌زمینه: با هاور بایستد و لبه‌ها بیشتر محو شوند
<DriftWall items={tiles} pauseOnHover fade={0.4} columns={6} />

// دیوارِ ایستای سه‌بعدی که فقط با نشانگر نفس می‌کشد
<DriftWall items={tiles} speed={0} parallax={0.9} depth={180} />

// رانشِ تندِ پرانرژی به سمتِ پایین
<DriftWall items={tiles} speed={95} direction="down" variance={0.3} />

// کاشی‌های سیاه‌وسفید که زیرِ نشانگر رنگ می‌گیرند
<DriftWall items={tiles} grayscale dim={0.7} lift={96} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<{ image: string; title?: string; href?: string }>` | `۱۵ عکسِ نمونه` | — | The wall's tiles; columns are assigned by cycling `i % columns`. `title` is the tile's accessible label and `href` is the click destination (without an `href`, the tile stays a focusable button). |
| `columns` | `number` | `5` | — | Number of wall columns. |
| `tileWidth` | `number` | `200` | — | Width of each tile in pixels. |
| `tileHeight` | `number` | `132` | — | Height of each tile in pixels (excluding the gap). |
| `gap` | `number` | `18` | — | Spacing between tiles in pixels. |
| `radius` | `number` | `14` | — | Corner rounding of the tiles. |
| `tilt` | `number` | `16` | — | Base pitch of the plane around the X axis in degrees. |
| `turn` | `number` | `-14` | — | Base yaw of the plane around the Y axis in degrees. |
| `roll` | `number` | `0` | — | Rotation of the plane around the view axis in degrees. |
| `perspective` | `number` | `1200` | — | Perspective viewing distance in pixels. |
| `depth` | `number` | `120` | — | How far the plane recedes in depth; a larger number makes the wall look farther away and smaller. |
| `speed` | `number` | `42` | — | Base drift speed in pixels per second; zero builds a static wall. |
| `direction` | `'up' | 'down'` (`up` · `down`) | `'up'` | — | Base drift direction; every other column always goes the opposite way. |
| `variance` | `number` | `0.45` | — | How much the column speeds differ (0 to 1); zero means all at the same speed. |
| `parallax` | `number` | `0.6` | — | How strongly the plane tilts with pointer movement; zero turns parallax off. |
| `pauseOnHover` | `boolean` | `false` | — | On hover over the wall, all columns stop gently. |
| `lift` | `number` | `64` | — | Prominence of the active tile toward the viewer in pixels (translateZ). |
| `fade` | `number` | `0.6` | — | Width of the region where the edges fade (1 means no fade). |
| `dim` | `number` | `0.55` | — | Dimming of the inactive tiles; the active tile is always at full brightness. |
| `grayscale` | `boolean` | `false` | — | Keep the inactive tiles black and white and color the active one. |
| `overlayColor` | `string` | `'#060010'` | — | Color of the veil over the inactive tiles; it goes to zero on the active tile. |

## Tips

- Zero dependencies: a self-contained rAF loop with exponential damping for the parallax and the columns' gentle stop.
- Good for section backgrounds: turn `pauseOnHover` on so text over the wall stays readable, and lower `fade` so the edges fade more.
- With `speed: 0` and `parallax` on, you get a static three-dimensional wall that only breathes with the pointer.
- Under `prefers-reduced-motion` the drift stops completely (tiles stay at their offset) and parallax is off; hover and focus still work.

