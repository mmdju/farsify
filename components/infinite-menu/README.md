# Infinite Menu

A sphere of image tiles that spins on drag, brings the nearest tile to the front and shows its title and description — with autoplay and four shape presets.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/infinite-menu](https://farsifyui.ir/components/infinite-menu)
- **Install ID:** `infinite-menu`

## Install

```bash
npx shadcn@latest add @farsify/infinite-menu
```

Or copy `components/infinite-menu/infinite-menu.tsx` and `components/infinite-menu/infinite-menu.css` from this repository into your project.

## Usage

```tsx
"use client";

import InfiniteMenu from "@/components/farsify/infinite-menu";

const photos = [
  {
    image: "/images/coast.jpg",
    title: "ساحل",
    description: "خطِ روشنِ افق و موجِ آرام.",
  },
  {
    image: "/images/forest.jpg",
    title: "جنگل",
    description: "مه میانِ تنه‌های بلند.",
  },
  {
    image: "/images/city.jpg",
    title: "شهر",
    description: "چراغ‌ها و پنجره‌های روشن.",
  },
];

export function Gallery() {
  return (
    <div style={{ height: 480, position: "relative" }}>
      <InfiniteMenu items={photos} count={160} theme="dark" />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* بدونِ کنشِ بیرونی؛ فلش پنهان می‌ماند و فقط عنوان/توضیح می‌آید */}
      <InfiniteMenu items={photos} showInfo />

      {/* برای ساختنِ فلشِ کنش، onItemClick یا link بده؛ وگرنه کلیک فقط می‌چرخاند */}
      <InfiniteMenu items={photos} onItemClick={(item) => console.log(item)} />

      {/* کارتِ سبک‌تر برای موبایل: کاشی‌های درشت‌تر و تعدادِ کمتر */}
      <InfiniteMenu items={photos} count={90} tileSize={0.9} dim={0.25} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `InfiniteMenuItem[]` | `[]` | — | The tiles; each item has `image` (required) and optional `title`, `description` and `link`. The desktop demo supplies six local images with Persian titles. |
| `count` | `number` | `160` | — | Number of tiles on the sphere; 6 to 400 (clamped automatically). |
| `tileSize` | `number` | `0.63` | — | Size of each tile relative to the sphere radius, 0.2 to 1.2. |
| `roundness` | `number` | `0.2` | — | Corner roundness of the tiles, 0 to 1. |
| `zoom` | `number` | `1.65` | — | How close the camera sits to the sphere; 0.2 to 4. |
| `pullBack` | `number` | `1` | — | How far the sphere pulls back while dragging, 0 to 3. |
| `stretch` | `number` | `0.6` | — | Stretch of the tiles along the spin direction, 0 to 3. |
| `inertia` | `number` | `0.6` | — | Spin inertia after release, 0 to 1. |
| `autoplay` | `number` | `3` | — | Interval of the automatic spin, in seconds; zero turns it off. |
| `grayscale` | `boolean` | `true` | — | Background tiles stay grayscale; the front tile is always in color. |
| `dim` | `number` | `0.5` | — | Dimming of the background tiles, 0 to 1. |
| `intro` | `boolean` | `true` | — | Play a short intro spin when the component comes into view. |
| `showInfo` | `boolean` | `true` | — | Show the title/description and action of the front tile. |
| `renderInfo` | `(item, index, moving) => ReactNode` | — | — | Full replacement for the info layer; for a custom headline/action. |
| `theme` | `'dark' | 'light'` (`dark` · `light`) | `'dark'` | — | Palette for the ink, shadows and shader placeholder. |
| `inkColor` | `string` | — | — | Ink color for the title/description; defaults by theme (`#fafafa` / `#0a0a0a`). |
| `accentColor` | `string` | — | — | Color of the action arrow; defaults to the ink color. The blue comes only from the variant doc. |
| `backgroundColor` | `string` | — | — | Root background; transparent by default so the card surface shows through. |
| `ariaLabel` | `string` | `'گالری تصاویر'` | — | Group label when a tile has no title. |
| `openLabel` | `string` | `'باز کردن'` | — | Accessible-name prefix for the action arrow. |
| `onActiveChange` | `(item, index) => void` | — | — | Fired every time a tile settles at the front. |
| `onItemClick` | `(item, index) => void` | — | — | On the arrow or a click on the front tile; replaces opening `link`. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style for the root. |

## Tips

- All images sit in a single atlas and the tiles are drawn in one `drawElementsInstanced` call; no `three` dependency and no draw call per tile.
- In RTL the title sits on the right (start) and the description on the left (end); in the narrow layout the info moves to the bottom-right and the arrow to the bottom-left, and the arrow is mirrored horizontally too.
- Letter spacing is zero; any positive or negative `letter-spacing` breaks the joining of Persian letters.
- Without WebGL2, a grid of the same images is shown instead of an empty canvas; the content and title are preserved.
- Under `prefers-reduced-motion` the intro and autoplay are turned off; manual dragging and the keys still work.
- For a lighter gallery, lower `count` and raise `tileSize`; for a dense mosaic, the reverse.

