# Pennant

A strip of vertical testimonial flags: the open one unfolds into a full quote card with the photo, stars and a counter, and the rest wait as tall pennants that open on click or hover.

- **Category:** Showcase
- **Interaction:** Click / Hover / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/pennant](https://farsifyui.ir/components/pennant)
- **Install ID:** `pennant`

## Install

```bash
npx shadcn@latest add @farsify/pennant
```

Or copy `components/pennant/pennant.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { Pennant } from "@/components/farsify/pennant";

export function KindWords() {
  return (
    <Pennant
      height={420}
      items={[
        {
          quote: "کل مسیر ثبت‌نام را در یک هفته از نو ساختیم و همان ماه ثبت‌نام‌ها جهش کرد.",
          name: "الهام رستگار",
          role: "مدیر محصول",
          rating: 5,
          color: "#E9E2D4",
          textColor: "#16130F",
        },
        {
          quote: "همه‌چیز سنجیده است؛ تیم ما دیگر سر پیکسل‌ها بحث نمی‌کند.",
          name: "بهرام کیانی",
          role: "بنیان‌گذار",
          rating: 5,
          color: "#D9714A",
          textColor: "#1C0E07",
        },
        {
          quote: "بی‌دردسر داخل سایتمان نشست و مشتری‌ها می‌پرسند چه کسی ساخته‌اش.",
          name: "نورا حداد",
          role: "سرپرست طراحی",
          rating: 4,
          color: "#2F4A3F",
          textColor: "#EEE8DB",
        },
      ]}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `PennantItem[]` | — | Yes | Testimonials in the strip, in reading order; each one carries a quote and a name, with an optional role, rating, photo URL, link and its own paper colour. |
| `startAt` | `number` | `1` | — | Which testimonial is open first, counted from 1; it is clamped to the list. |
| `openOn` | `"click" \| "hover"` | `"click"` | — | Whether a pennant opens on click or as soon as the pointer enters it. |
| `autoplay` | `boolean` | `false` | — | Moves to the next pennant on its own while the strip is on screen. |
| `interval` | `number` | `5` | — | Seconds between two autoplay steps. |
| `pauseOnHover` | `boolean` | `true` | — | Stops autoplay while the pointer is over the strip. |
| `sizing` | `"ratio" \| "fill"` | `"ratio"` | — | How the row height is decided: from `ratio` and the width, or filled to `height`. |
| `ratio` | `number` | `0.62` | — | Height of the row as a share of its width, in ratio mode. |
| `tabWidth` | `number` | `48` | — | Width of a closed pennant, px; a narrow strip shrinks it to leave the open card room. |
| `gap` | `number` | `4` | — | Space between pennants, px. |
| `inset` | `number` | `40` | — | Vertical breathing room around the pennants, px; the open card still fills the row. |
| `hoverGrow` | `number` | `6` | — | How much taller a closed pennant grows under the pointer, px. |
| `radius` | `number` | `14` | — | Corner radius of the open card, px; a closed pennant is a full pill. |
| `padding` | `number` | `22` | — | Padding inside the open card, px. |
| `showMark` | `boolean` | `true` | — | Draws the quote mark in the top corner of the card. |
| `showCount` | `boolean` | `true` | — | Shows the position counter in the corner of the card, such as 02 / 06. |
| `showStars` | `boolean` | `true` | — | Draws the five stars from each item's rating. |
| `showRule` | `boolean` | `true` | — | Draws the thin rule above the author row. |
| `tabAvatar` | `boolean` | `true` | — | Shows the round face at the foot of each closed pennant. |
| `photoSize` | `number` | `52` | — | Side of the square photo in the author row, px. |
| `photoRadius` | `number` | `12` | — | Corner radius of that photo, px. |
| `duration` | `number` | `0.46` | — | Length of the unfold, in seconds. |
| `curve` | `"smooth" \| "snappy" \| "gentle"` | `"smooth"` | — | Easing of the unfold. |
| `drift` | `number` | `22` | — | How far the card content slides while it is hidden, px. |
| `height` | `number` | `440` | — | Height of the frame, px; on a narrow screen the row uses it instead of `ratio`. |
| `background` | `string` | `"transparent"` | — | Surface behind the strip; `transparent` leaves the page showing through. |
| `ariaLabel` | `string` | `"نظر مشتریان"` | — | Accessible name of the tab strip. |
| `className` | `string` | `''` | — | Extra class for the frame. |

## Tips

- Keep the strip to three to six testimonials: every closed pennant takes `tabWidth + gap`, and the open card only gets what is left of the width.
- `startAt` is one-based. In a right-to-left page the first item sits at the right edge and the strip opens with it.
- `inset` is the vertical breathing room around the pennants, not the card padding; set it to 0 for a flush strip where every card fills the frame.
- On a narrow screen the row ignores `ratio` and uses `height`, the pennants shrink to fit, and a pennant narrower than 28px drops its round face.
- Each item carries its own `color` and `textColor`, so the card and its closed pennant always match; without them the pair falls back to cream paper and dark ink.
- Quotes are clamped to six lines and the card height is fixed, so keep them near 120 characters or raise `height`.
- Under `prefers-reduced-motion` the unfold is instant, autoplay never starts and the content does not drift; the arrow keys still work.
