# Accordion OS

A photo-backed accordion styled like an OS launcher: the open item widens into a pill that reveals its numbered badge and a short line of copy, the closed items stay as slim title pills, and the photo crossfades behind — with a prev/next deck and counter in the corner, auto-play and full keyboard control.

- **Category:** Showcase
- **Interaction:** Auto-play / Click / Keyboard
- **Dependencies:** motion
- **Live preview:** [https://farsifyui.ir/components/accordion-os](https://farsifyui.ir/components/accordion-os)
- **Install ID:** `accordion-os`

## Install

```bash
npx shadcn@latest add @farsify/accordion-os
```

Or copy `components/accordion-os/accordion-os.tsx` and `components/accordion-os/accordion-os.css` from this repository into your project.

## Usage

```tsx
"use client";

import AccordionOS, { type AccordionItem } from "@/components/farsify/accordion-os";

const steps: AccordionItem[] = [
  {
    id: 1,
    title: "مرکز‌یابی",
    badge: "01",
    claim: "گِل رو ببر دقیقاً وسطِ چرخ تا لرزشش راه نیفتاده.",
    image: "/images/pottery-centering.jpg",
    alt: "مرکزآوردن گِل خیس روی چرخ سفالگری",
  },
  {
    id: 2,
    title: "کشیدن دیواره",
    badge: "02",
    claim: "دو انگشت داخل، یکی بیرون. آروم و یکنواخت بکش.",
    image: "/images/pottery-pulling.jpg",
    alt: "کشیدن دیوارهٔ کاسه روی چرخ",
  },
  {
    id: 3,
    title: "آماده‌سازی لعاب",
    badge: "03",
    claim: "اکسیدها رو ترکیب کن و روی خرده‌کاشی تست بزن.",
    image: "/images/pottery-glaze.jpg",
    alt: "کاسه‌های لعاب رنگی روی میز استودیو",
  },
];

export function StudioSteps() {
  return (
    <AccordionOS
      items={steps}
      staticImage="/images/pottery-studio.jpg"
      autoPlay
      autoPlayInterval={4000}
    />
  );
}

// شروع با همهٔ آیتم‌ها بسته و بدونِ پخشِ خودکار
<AccordionOS items={steps} defaultActiveIndex={null} autoPlay={false} />

// کارتِ کوتاه‌تر با عرضِ کاملِ ظرف
<AccordionOS items={steps} containerWidth="100%" containerHeight={420} />

// گزارشِ تغییرِ آیتم برای درایوِ بیرونی
<AccordionOS items={steps} onItemChange={(index) => console.log(index)} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<{ id?: string \| number; title: string; badge?: string; claim: string; image: string; alt?: string }>` | `۵ آیتمِ نمونه` | — | The accordion entries; `title` is the pill label, `badge` is the small index shown on the open pill, `claim` is the line of copy revealed under the title, `image` is the full-bleed photo shown while the item is open and `alt` is its alternative text. |
| `staticImage` | `string` | `گرادیانِ نمونهٔ SVG` | — | The photo shown while every item is closed — the resting backdrop behind the title pills. |
| `defaultActiveIndex` | `number \| null` | `0` | — | The item open on the first render; pass `null` to start with everything closed. It only affects that render — later changes have no effect. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `containerHeight` | `number \| string` | `520` | — | Height of the card in pixels, or any CSS height. |
| `containerWidth` | `number \| string` | `840` | — | Width of the card in pixels, or any CSS width; the card never grows past its container. |
| `autoPlay` | `boolean` | `true` | — | Whether the open item advances on its own. |
| `autoPlayInterval` | `number` | `3500` | — | Milliseconds between auto-play steps, clamped to at least 500. |
| `pauseOnHover` | `boolean` | `true` | — | Pause auto-play while the pointer is over the card. |
| `onItemChange` | `(index: number \| null) => void` | `—` | — | Called with the open item's index whenever it changes, or `null` when everything is closed. |

## Tips

- Pills change size through real layout values, not scale transforms, so titles never stretch or squish and the card stays sharp on every frame.
- Keyboard flow is window-level: arrows or S/W step through items, 1–5 jumps straight to one, and Escape clears the selection — make sure nothing else on the page swallows those keys.
- Auto-play clamps `autoPlayInterval` to 500ms and pauses on hover; with `prefers-reduced-motion` every transition becomes an instant swap and auto-play turns off.
- Feed real photos through `items[].image`; the shipped defaults are inline SVG gradient data URIs, so the component renders before any asset loads.
- Under 640px the card stacks: pills go full-width and the nav deck keeps the bottom corner — check the counter's legibility over busy photos.
