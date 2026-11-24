# Timeline Track

A horizontal milestone gallery where the focused card opens wide on a ruled track, its neighbours fold into narrow spines, and every move lands with a soft spring and a short squeeze.

- **Category:** Showcase
- **Interaction:** Wheel / Drag / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/timeline-track](https://farsifyui.ir/components/timeline-track)
- **Install ID:** `timeline-track`

## Install

```bash
npx shadcn@latest add @farsify/timeline-track
```

Or copy `components/timeline-track/timeline-track.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { TimelineTrack } from "@/components/farsify/timeline-track";

export function StudioStory() {
  return (
    <TimelineTrack
      height={430}
      items={[
        {
          year: "۱۳۹۴",
          title: "از یک اتاق خالی شروع شد",
          caption: "دو میز، یک ایده و قهوهٔ زیاد.",
        },
        {
          year: "۱۳۹۶",
          title: "اولین مشتری، اولین دفتر",
          caption: "یک فضای کوچک با پنجرهٔ بزرگ.",
        },
        {
          year: "۱۳۹۸",
          title: "بیست نفر شدیم",
          caption: "تیم‌های تازه برای طراحی، ساخت و پشتیبانی.",
        },
      ]}
    />
  );
}
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `TimelineItem[]` | — | Yes | Milestones in order; each one carries a year, a title and optionally a caption, an image URL and a link. |
| `height` | `number` | `430` | — | Height of a focused card, px. |
| `openWidth` | `number` | `380` | — | Width of the focused card, px. |
| `shutWidth` | `number` | `72` | — | Width of a card that is not focused, px. |
| `spacing` | `number` | `12` | — | Gap between cards, px. |
| `radius` | `number` | `14` | — | Corner radius at rest, px; it opens up while the track moves. |
| `dim` | `number` | `0.55` | — | How far the cards away from the focus sink into the plate, 0 to 1. |
| `rulerStep` | `number` | `96` | — | Distance between two milestones on the ruler, px. |
| `showRuler` | `boolean` | `true` | — | Draws the ruler with its ticks and years. |
| `background` | `string` | `"#181818"` | — | Colour of the plate; it also tints the cards that fall behind. |
| `textColor` | `string` | `"#fafafa"` | — | Colour of the year and the title. |
| `captionColor` | `string` | `"#d4d4d4"` | — | Colour of the caption. |
| `tickColor` | `string` | `"#525252"` | — | Colour of the ruler ticks. |
| `labelColor` | `string` | `"#a3a3a3"` | — | Colour of the years on the ruler. |
| `markerColor` | `string` | `"#fafafa"` | — | Colour of the centre marker and of the year you are standing on. |
| `ariaLabel` | `string` | `"خط زمانی رویدادها"` | — | Accessible name of the track. |
| `className` | `string` | `''` | — | Extra class for the plate. |

## Tips

- The cards work without images: every one falls back to a drawn placeholder in its own tone, so the component ships with no asset and never requests one.
- On a phone the focused card takes the width of the frame and the height is capped at 1.4 times that width; raise `height` and the cap follows.
- The wheel only takes over while there is still a card to move to; at either end the page keeps scrolling normally.
- Direction comes from the computed style, so the same file reads right-to-left in a Persian layout and left-to-right anywhere else. Nothing is mirrored by hand.
- `dim` sets the depth: 0 flattens the row, and above 0.7 the neighbours almost disappear into the plate.
- Under `prefers-reduced-motion` the track jumps straight to the chosen milestone and the spring never runs.
- Give every card a `year`: the ruler labels come from it, and a missing one leaves an empty tick.
