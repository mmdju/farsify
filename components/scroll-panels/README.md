# Scroll Panels

Three panels that together complete a single image; on scroll they open slightly, flip, and the text behind each panel is revealed.

- **Category:** Showcase
- **Interaction:** Scroll
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/scroll-panels](https://farsifyui.ir/components/scroll-panels)
- **Install ID:** `scroll-panels`

## Install

```bash
npx shadcn@latest add @farsify/scroll-panels
```

Or copy `components/scroll-panels/scroll-panels.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useRef } from "react";
import { ScrollPanels } from "@/components/farsify/scroll-panels";

// تمام‌صفحه — با اسکرولِ خودِ صفحه پیش می‌ره
export function StorySection() {
  return <ScrollPanels />;
}

// کارت‌های خودت — هر کارت پشتِ یک پرده
<ScrollPanels
  imageSrc="/my-landscape.jpg"
  items={[
    { title: "طراحی", kicker: "پردهٔ ۱", description: "…", bgColor: "#ead9c4", textColor: "#2a1810" },
    { title: "کد", kicker: "پردهٔ ۲", description: "…", bgColor: "#c4452d", textColor: "#fff4ec" },
    { title: "انتشار", kicker: "پردهٔ ۳", description: "…", bgColor: "#2c3033", textColor: "#e6e2da" },
  ]}
/>

// داخلِ یه باکسِ اسکرول‌خور — ردیابیِ جعبه و بلندی‌های قطعی
const boxRef = useRef<HTMLDivElement>(null);
<div ref={boxRef} className="h-[480px] overflow-y-auto">
  <ScrollPanels
    containerRef={boxRef}
    paneHeight="466px"
    panelHeight="240px"
    className="h-[1600px]"
  />
</div>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `ScrollPanelCard[]` | — | — | Up to three cards; each card is `{ title, description, bgColor, textColor, kicker? }` and sits behind one panel. If omitted, the component's own three Persian panels are used. |
| `imageSrc` | `string` | `منظرهٔ کوهستان` | — | The shared image of the three panels — a wide image looks best. If omitted, the online default is kept. |
| `className` | `string` | — | — | Applies to the scroll track container; an `h-` class lets you change the 400vh height for tighter spaces. |
| `containerRef` | `RefObject<HTMLElement | null>` | — | — | The scroll area to track — for example a div with `overflow-y-auto`. If omitted, the page itself is tracked. |
| `paneHeight` | `string` | `"100vh"` | — | Height of the sticky stage. For embedding inside a box, give a fixed value, not a percentage. |
| `panelHeight` | `string` | `"min(420px,56vh)"` | — | Height of the panel row. |
| `peak` | `number` | `48` | — | How many pixels the side panels open outward at their peak before returning. |
| `flipStart` | `number` | `0.4` | — | Where in the scroll progress the flip starts (0 to 1); a lower value means it turns over sooner. |
| `innerRadius` | `number` | `16` | — | Maximum radius of the panels' inner corners while they collapse. |

## Tips

- Choose a wide, landscape image; the trio crops it, so it's better to keep the subject in the middle.
- To embed it in a scrollable box: pass that box as `containerRef`, set `paneHeight` to a fixed value, and shorten the track height with `className="h-…"`.
- Keep the kicker short (a two-word phrase); a long one gets cut off with `truncate`.
- Each panel's color is changed through the card's own props — the colors are content and don't mix with the site theme.

