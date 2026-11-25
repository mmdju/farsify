# Timeline Track

A horizontal milestone gallery where the focused card opens wide on a ruled track, its neighbours fold into narrow spines, and every move glides in on a soft spring with a short squeeze.

- **Category:** Showcase
- **Interaction:** Wheel / Drag / Keyboard / Auto
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

const milestones = [
  { year: "۱۳۹۸", title: "شروع", caption: "اولین نسخه" },
  { year: "۱۳۹۹", title: "رشد", caption: "پنج کامپوننت" },
  { year: "۱۴۰۰", title: "فارسی", caption: "راست‌به‌چپ کامل" },
  { year: "۱۴۰۱", title: "مشارکت", caption: "اولین پول‌ریکوئست" },
];

export function ProductStory() {
  return <TimelineTrack items={milestones} height={430} openWidth={380} />;
}

// ---------- نمونه‌های بیشتر ----------
export function PlainTrack() {
  return <TimelineTrack items={milestones} showRuler={false} dim={0.3} radius={24} />;
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `TimelineItem[]` | `—` | — | Milestones in order; each one carries a year, a title and optionally a caption, an image URL and a link. |
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
| `autoplay` | `boolean` | `false` | — | Walks the track by itself, one milestone per `interval`, while the block is on screen. |
| `interval` | `number` | `5` | — | Seconds between two automatic steps. |
| `ariaLabel` | `string` | `"خط زمانی رویدادها"` | — | Accessible name of the track. |
| `className` | `string` | `''` | — | Extra class for the plate. |

## Tips

- The cards work without images: every one falls back to a drawn placeholder in its own tone, so the component needs no asset; pass `imageUrl` for a photo card.
- On a phone the focused card takes the width of the frame and the height is capped at 1.4 times that width; raise `height` and the cap follows.
- The wheel only takes over while there is still a card to move to; at either end the page keeps scrolling normally.
- Direction comes from the computed style, so the same file reads right-to-left in a Persian layout and left-to-right anywhere else. Nothing is mirrored by hand.
- `dim` sets the depth: 0 flattens the row, and above 0.7 the neighbours almost disappear into the plate.
- Set `autoplay` for a showcase strip that moves on its own; it pauses under the pointer and never starts under prefers-reduced-motion.
- Give every card a `year`: the ruler labels come from it, and a missing one leaves an empty tick.

