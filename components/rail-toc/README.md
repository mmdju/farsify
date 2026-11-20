# Rail TOC

A page-contents list beside the page with a dotted rail and a paper plane that travels along it as you scroll: it glides forward, banks over subheadings, and turns around and comes back if you scroll up.

- **Category:** Navigation
- **Interaction:** Scroll / Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/rail-toc](https://farsifyui.ir/components/rail-toc)
- **Install ID:** `rail-toc`

## Install

```bash
npx shadcn@latest add @farsify/rail-toc
```

Or copy `components/rail-toc/rail-toc.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useRef } from "react";
import { RailToc } from "@/components/farsify/rail-toc";

const SECTIONS = [
  { id: "intro", label: "مقدمه" },
  { id: "install", label: "نصب" },
  { id: "config", label: "پیکربندی" },
  { id: "theme", label: "رنگ و تم", depth: 1 },
  { id: "faq", label: "پرسش‌های پرتکرار" },
];

export function ArticleToc() {
  return <RailToc items={SECTIONS} />;
}

// خطِ دید پایین‌تر، زیرسرفصل‌های عمیق‌تر و عنوانِ دلخواه
<RailToc items={SECTIONS} offset={140} indent={22} title="فهرستِ این راهنما" />

// رنگِ هواپیما — تنها رنگِ تزئینیِ کامپوننت
<RailToc items={SECTIONS} planeColor="#0a84ff" />

// داخلِ پنلی که خودش اسکرول می‌شود — ظرف را بده تا اندازه از همان خوانده شود
const scrollerRef = useRef<HTMLDivElement>(null);
<RailToc items={SECTIONS} containerRef={scrollerRef} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `RailTocItem[]` | `[{ id: "intro", label: "مقدمه" }, { id: "install", label: "نصب", depth: 1 }]` | yes | The page headings. Each item is `{ id, label, depth }`: `id` must be exactly the id of that heading in the DOM, and `depth` (0 and up) sets the subheading indentation. |
| `containerRef` | `React.RefObject<HTMLElement | null>` | — | — | The scroll container of the content. Omit it to read height and scroll from the window itself; in a scrollable frame (such as a docs panel) pass this one, and the headings must be inside that same container. |
| `offset` | `number` | `96` | — | Distance of the "sight line" from the top of the container, in pixels. A heading reaching this height becomes active; a lower value means earlier activation. |
| `indent` | `number` | `14` | — | Indentation per depth level, in pixels. Zero means a flat hierarchy and a straight rail. |
| `planeColor` | `string` | `currentColor` | — | Color of the plane — the thing that moves up and down the rail. Any CSS value is accepted; omit it to take its own text color (the default behavior). |
| `title` | `string` | `"در این صفحه"` | — | Title above the list. It also becomes the navigation's `aria-label`. |
| `aria-label` | `string` | — | — | Accessible name of the navigation; if passed, it replaces `title` and the visual title stays untouched. |
| `className` | `string` | — | — | Extra class for the root; set the column width from here. |

## Tips

- In right-to-left the rail sits by the right edge (the start side) and the indentation grows to the left; the mirroring happens on a decorative `-scale-x-100` layer, so do not flip any coordinates by hand — the list itself works in both directions with `dir`.
- Each item's `id` must be the id of the real heading on the page; an item whose element cannot be found is ignored in the progress calculation and the plane does not stop on it.
- For a page that scrolls itself (not the window), pass `containerRef` and make sure the container has `position: relative` or whatever other geometric anchor you need; the calculation uses the list rows' `offsetTop` and does not care about the container's scroll.
- The component does not set the column width itself; pin it with `className="w-56"` or whatever width fits your Persian text so long labels wrap safely.
- With `prefers-reduced-motion` the spring travel and the turn are removed; the list, the rail fill and `aria-current` stay in place.
- `planeColor` is the component's only color and it applies to the plane itself, not the rail; the rail is built from the theme text color so two colors in one column do not get busy. For a brand plane, pass your project's `var(--brand)`.

