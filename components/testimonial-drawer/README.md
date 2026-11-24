# Testimonial Drawer

A wooden file drawer of client testimonials: the card in front rises out of the drawer, the rest wait as coloured tabs, and every change slides on a short spring under a brass label plate and a working handle.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard / Auto
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/testimonial-drawer](https://farsifyui.ir/components/testimonial-drawer)
- **Install ID:** `testimonial-drawer`

## Install

```bash
npx shadcn@latest add @farsify/testimonial-drawer
```

Or copy `components/testimonial-drawer/testimonial-drawer.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { TestimonialDrawer } from "@/components/farsify/testimonial-drawer";

export function Clients() {
  return (
    <TestimonialDrawer
      label="پرونده"
      sublabel="بازخورد مشتریان"
      items={[
        {
          name: "سارا محمدی",
          role: "مدیر عملیات",
          company: "شرکت باربری",
          rating: 5,
          quote:
            "جلسه‌های هفتگی ما قبلاً یک ساعت طول می‌کشید. حالا **ده دقیقهٔ آرام** است و هرکس می‌داند قدم بعدی‌اش چیست.",
        },
        {
          name: "آرش نیک‌زاد",
          role: "مدیر خلاق",
          company: "آژانس برندینگ",
          rating: 4,
          quote:
            "با یک ایدهٔ شلوغ آمدیم و **بالاخره توانستیم برای مشتری‌های خودمان توضیحش بدهیم**.",
        },
      ]}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `DocketItem[]` | — | Yes | Testimonials in order; each one carries a name, a role and a quote, with an optional company, rating, image URL, link and tab label. |
| `theme` | `"orchard" \| "atelier" \| "tidewater" \| "spice" \| "riviera" \| "sorbet" \| "graphite" \| "nocturne"` | `"orchard"` | — | Palette of the drawer, its plate and the cards; the ink of each card is picked from its own colour for contrast. |
| `material` | `"oak" \| "walnut" \| "kraft" \| "steel" \| "theme"` | `"oak"` | — | Face of the drawer: oak, walnut, kraft board, steel, or the theme's own front colour. |
| `label` | `string` | `"پرونده"` | — | Main line on the label plate. |
| `sublabel` | `string` | `"بازخورد مشتریان"` | — | Second line on the plate; it is dropped when the drawer face gets too short. |
| `autoplay` | `boolean` | `true` | — | Walks to the next testimonial on its own while the block is on screen. |
| `interval` | `number` | `7` | — | Seconds between two automatic steps. |
| `pauseOnHover` | `boolean` | `true` | — | Stops autoplay while the pointer is over the drawer. |
| `startIndex` | `number` | `0` | — | Index of the card that starts in front, counted from zero. |
| `height` | `number` | `560` | — | Height of the scene, px; the drawer face keeps a fifth of it. |
| `background` | `string` | `"transparent"` | — | Surface behind the drawer; transparent lets the page show through, and a colour turns it into a plate. |
| `ariaLabel` | `string` | `"نظر مشتریان"` | — | Accessible name of the region. |
| `className` | `string` | `''` | — | Extra class for the root. |

## Tips

- Cards need no image: without `imageUrl` the footer falls back to the initials of the name on a solid disc, so nothing is requested at runtime.
- The drawer, its plate and the handle come from `theme` and `material`; pass `background` when the page behind is close to the drawer, otherwise the front disappears into it.
- The card height is fixed and a long quote is clipped, not scrolled: keep quotes to roughly 260 characters, or raise `height`.
- On a narrow stage the component keeps 44px below the cards instead of 72px and drops the quote to 15px, so the same copy still lands above the drawer face.
- Autoplay only runs while the block is on screen; hovering pauses it, and `prefers-reduced-motion` turns it off together with the drag and the entrance stagger.
- `**word**` inside a quote is the highlight marker; the pill behind it is mixed from the card's own ink, so it stays readable on every palette.
- The tabs truncate their label: keep `tab` short, and give each card a name that reads well on its own because the tab falls back to it.
