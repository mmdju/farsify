# Animated Collection

A collection block whose items spring between a stacked list, a two-column card grid and a tilted pack, driven by a pill tab switcher.

- **Category:** Showcase
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/animated-collection](https://farsifyui.ir/components/animated-collection)
- **Install ID:** `animated-collection`

## Install

```bash
npx shadcn@latest add @farsify/animated-collection
```

Or copy `components/animated-collection/animated-collection.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { AnimatedCollection } from "@/components/farsify/animated-collection";

export function LibraryBlock() {
  return (
    <AnimatedCollection
      title="آثارِ برگزیده"
      defaultView="card"
      items={[
        { id: "1", title: "افق‌های سینمایی", subtitle: "عکاسی", idNumber: "209", image: artwork(205) },
        { id: "2", title: "رویاهای انتزاعی", subtitle: "هنر دیجیتال", idNumber: "808", image: artwork(265) },
        { id: "3", title: "سکوتِ شهر", subtitle: "نقاشی", idNumber: "141", image: artwork(105) },
      ]}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* شروع از نمای بسته */}
      <AnimatedCollection defaultView="pack" items={artworks} />

      {/* تیترِ دلخواه */}
      <AnimatedCollection title="پوسترهای فصل" items={artworks} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `title` | `string` | `"کالکشن من"` | — | The heading above the tab switcher. |
| `items` | `CollectionItem[]` | — | — | The collection items; each has `id`, `title`, `subtitle`, `idNumber` and `image` (any `<img>` source, such as a URL or an inline SVG data URI). Without them, two sample items appear. |
| `defaultView` | `"list" | "card" | "pack"` | `"list"` | — | The view the collection starts in. |
| `autoPreview` | `boolean` | `false` | — | Site preview only — the collection walks list, card and pack by itself. Leave it off in normal use; a real interaction never fires while it runs. |
| `className` | `string` | `""` | — | Extra class for the outer block. |
| `accentColor` | `string` | `""` | — | Accent of the active view tab; leave it empty to keep the theme's primary color. |
| `radius` | `number` | `24` | — | Corner radius of the card and pack images in pixels; the list thumbnails keep their own small radius. |
| `showMeta` | `boolean` | `true` | — | Show the subtitle and year under each title, or keep only the title. |

## Tips

- `image` accepts any `<img>` source — a remote URL, a local path or an inline SVG data URI; the built-in samples are inline gradients, so the component makes no external requests.
- With a single item the pack view keeps it centered; from two items on, the cards fan out to their mirrored poses.
- From the third item on, extra cards stack centered in pack view with no pose, so a deep pile stays tidy.
- `defaultView` is only the starting point; the component keeps its own view state afterwards.
- The block is `max-w-xl` and fills the width it is given up to that; widen it with `className` when the surrounding layout is narrow.
- With `prefers-reduced-motion` the springs, blurs and fades land instantly.

