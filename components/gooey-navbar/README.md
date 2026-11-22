# Gooey Navbar

A liquid navigation bar: the active item sits in a solid pill, and a gap opens around whichever item you hover or select while the two pills bend into a curved neck, so the bar reads as a single drop of liquid being stretched.

- **Category:** Navigation
- **Interaction:** Click / Hover / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/gooey-navbar](https://farsifyui.ir/components/gooey-navbar)
- **Install ID:** `gooey-navbar`

## Install

```bash
npx shadcn@latest add @farsify/gooey-navbar
```

Or copy `components/gooey-navbar/gooey-navbar.tsx` from this repository into your project. It has no dependencies beyond React.

## Usage

```tsx
"use client";

import { GooeyNavbar } from "@/components/farsify/gooey-navbar";

const items = [
  { label: "خانه", link: "#home" },
  { label: "کارها", link: "#work" },
  { label: "درباره", link: "#about" },
  { label: "تماس", link: "#contact" },
];

export function Header() {
  return <GooeyNavbar items={items} />;
}
```

The bar builds itself from the labels, so there is no width to set. Persian labels are measured as they render, which keeps every pill tight around its text:

```tsx
<GooeyNavbar
  items={items}
  pillColor="#232323"
  textColor="#fafafa"
  hoverTextColor="#ffffff"
  anchorEdge="start"
  neighborPush={40}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `NavItem[]` | `DEFAULT_NAV_ITEMS` | — | The links. Each item has a `label`, a `link` and an optional fixed `width`; without a width the pill measures the rendered label plus `paddingX`. |
| `defaultActiveIndex` | `number` | `0` | — | Which item starts selected when the bar keeps its own state. |
| `activeIndex` | `number` | — | — | Controlled selection; pass it with `onSelect` to own the state yourself. |
| `onSelect` | `(index: number, item: NavItem) => void` | — | — | Runs on every click with the index and the item. |
| `pillColor` | `string` | `"#fafafa"` | — | Fill of the pills and of the liquid neck between them. |
| `textColor` | `string` | `"rgb(35, 35, 35)"` | — | Label color, and the color of the active dot. |
| `hoverTextColor` | `string` | `"rgb(0, 0, 0)"` | — | Label color of the item under the pointer. |
| `fontSize` | `number` | `15` | — | Label size, pixels; the pill height follows it together with `paddingY`. |
| `paddingX` | `number` | `24` | — | Horizontal padding inside each pill; it is part of the measured width. |
| `paddingY` | `number` | `16` | — | Vertical padding; the pill height is `fontSize` plus twice this. |
| `cornerRadius` | `number` | `12` | — | Corner radius of the pills, clamped to half the pill height. |
| `gap` | `number` | `0` | — | Space between the pills at rest. |
| `neighborPush` | `number` | `32` | — | How far the gap opens around the hovered or active item, pixels. |
| `anchorEdge` | `"start" \| "center" \| "end"` (`start` → `center` → `end`) | `"center"` | — | Which edge stays put while the gaps push the bar wider. It is logical, so `start` means the right edge in a right-to-left page. |
| `neckRatio` | `number` | `0.35` | — | Thickness of the liquid neck as a fraction of the pill height. |
| `stiffness` | `number` | `260` | — | Spring stiffness of the gaps; higher snaps faster. |
| `damping` | `number` | `30` | — | Spring damping; lower lets the gaps overshoot more. |
| `mass` | `number` | `1` | — | Spring mass; heavier moves slower. |
| `className` | `string` | `""` | — | Extra class for the root box. |

## Tips

- Keep the labels short: each pill measures the rendered label plus `paddingX`, so a very long one makes a very wide pill.
- The labels are measured again once the web font finishes loading, which keeps the pills aligned when the project uses a custom Persian font.
- Use `start` and `end` for `anchorEdge`, not left and right: the geometry is mirrored for right-to-left, so `start` pins the bar to the right edge.
- Pass `activeIndex` with `onSelect` to control the selection; without them the bar remembers the last click itself.
- Clicks call `preventDefault()`, so handle the destination in `onSelect` or swap the anchor for your router's link.
- Hover needs a real pointer; on touch the pill and its dot still mark the active item, but the liquid neck stays away.
