# Accordion Gallery

A row of image frames that opens like an accordion: the active frame grows with a soft bend and gains color, the rest stay dark gray and slightly tilted, and its label reveals with a staggered delay — horizontal or vertical, on hover or click.

- **Category:** Showcase
- **Interaction:** Hover / Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/accordion-gallery](https://farsifyui.ir/components/accordion-gallery)
- **Install ID:** `accordion-gallery`

## Install

```bash
npx shadcn@latest add @farsify/accordion-gallery
```

Or copy `components/accordion-gallery/accordion-gallery.tsx` and `components/accordion-gallery/accordion-gallery.css` from this repository into your project.

## Usage

```tsx
"use client";

import AccordionGallery from "@/components/farsify/accordion-gallery";

const shots = [
  { image: "/images/canyon.jpg", label: "دره" },
  { image: "/images/ridge.jpg", label: "خط‌الرأس" },
  { image: "/images/falls.jpg", label: "آبشار" },
  { image: "/images/dusk.jpg", label: "غروبِ دریا" },
  { image: "/images/skyline.jpg", label: "خطِ آسمان" },
];

export function GalleryStrip() {
  return (
    <div style={{ height: 460 }}>
      <AccordionGallery items={shots} />
    </div>
  );
}

// قابِ سوم موقعِ ورود باز باشد و برچسب‌ها تمام‌رنگ بمانند
<AccordionGallery items={shots} defaultIndex={2} grayscale={false} />

// ستونِ عمودیِ کنارِ صفحه با خمِ تند و پارالاکسِ قوی
<AccordionGallery
  items={shots}
  orientation="vertical"
  height={300}
  expandRatio={0.62}
  tilt={14}
  parallax={0.9}
/>

// باز شدن فقط با کلیک + رنگِ لهجه‌ی خودت
<AccordionGallery
  items={shots}
  trigger="click"
  accentColor="#f5b400"
  duration={0.4}
/>

// بدونِ برچسب، فقط تصویر
<AccordionGallery items={shots} showLabels={false} radius={28} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `Array<{ image: string; label?: string; link?: string; alt?: string }>` | `۵ عکسِ نمونه` | — | The gallery images; each is center-cropped inside its frame. `label` is the open frame's caption, `link` is the click destination and `alt` is the alternative text. |
| `defaultIndex` | `number` | `2` | — | The frame that is open on the first render. It only affects that render; later changes have no effect — see `activeIndex` for live control. |
| `activeIndex` | `number` | `—` | — | Controlled channel for external drivers (such as a desktop auto-tour). When you provide a value the active frame stays in sync, and when you don't the component stays uncontrolled and the user has direct control. |
| `accentColor` | `string` | `'#ffffff'` | — | Color of the bar beside the label and the focus ring of the frames. |
| `overlayColor` | `string` | `'#060010'` | — | Color of the dark veil over the images and the gradient beneath the label. |
| `textColor` | `string` | `'#ffffff'` | — | Text color of the labels. |
| `height` | `number` | `460` | — | Height of the row in pixels; in vertical orientation it becomes 1.6 times as much. |
| `gap` | `number` | `10` | — | Spacing between frames in pixels. |
| `radius` | `number` | `16` | — | Corner radius of the frames in pixels. |
| `expandRatio` | `number` | `0.52` | — | Share of the row width taken by the open frame, 0.2 to 0.9; a higher number means a wider open frame and narrower remaining frames. |
| `orientation` | `'horizontal' | 'vertical'` (`horizontal` · `vertical`) | `'horizontal'` | — | Direction of the row; vertical for sidebars and tall columns. |
| `duration` | `number` | `0.6` | — | Duration of opening and closing in seconds. |
| `ease` | `string` | `'power3.out'` | — | Motion curve by gsap ease name (such as `power2.out` or `power3.inOut`); an unknown name falls back to the default. |
| `parallax` | `number` | `0.5` | — | Images in closed frames slide by how far they are from the open frame; 0 means no parallax. |
| `tilt` | `number` | `8` | — | Three-dimensional backward tilt of the closed frames, in degrees. |
| `stagger` | `number` | `0.06` | — | Staggered delay for the open frame's label to reveal, in seconds. |
| `trigger` | `'hover' | 'click'` (`hover` · `click`) | `'hover'` | — | Whether a frame opens on pointer hover or on click. |
| `showLabels` | `boolean` | `true` | — | Whether the open frame's label is shown. |
| `grayscale` | `boolean` | `true` | — | Keep closed frames black and white so the open frame gains color. |
| `className` | `string` | `''` | — | Extra class for the root. |

## Tips

- No dependencies at all: without gsap the same geometry is rebuilt with CSS transitions and an equivalent `power3.out` curve, adding zero weight.
- With `grayscale` on, color is granted only to the open frame — the opening and closing of the frames itself builds a "narrative of color"; turn it off if you want a full-color gallery.
- Vertical orientation plus a high `expandRatio` works well for a column beside the page; the final height becomes 1.6 times `height`, so take the frame's placement into account.
- The active frame at start with `defaultIndex`, and live driving with `activeIndex`; both are clamped when out of the list's range.
- On narrow mobile (under 520px) the row turns into a vertical tiled layout by itself and the 3D tilt is off — as the default.

