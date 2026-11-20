# Folder

A three-dimensional folder whose flap opens on click; the papers come out, peek when hovered, and can be dropped anywhere by dragging.

- **Category:** Showcase
- **Interaction:** Click / Drag / Hover / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/folder](https://farsifyui.ir/components/folder)
- **Install ID:** `folder`

## Install

```bash
npx shadcn@latest add @farsify/folder
```

Or copy `components/folder/folder.tsx` and `components/folder/folder.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Folder } from "@/components/farsify/folder";

const documents = [
  { title: "راهنمای برند", description: "رنگ‌ها، نشان و لحن" },
  { title: "برنامهٔ عرضه", description: "زمان‌بندی و مسئول‌ها" },
  { title: "تختهٔ الهام", description: "منابع بصری منتخب" },
];

export function ProjectFolder() {
  return (
    <Folder
      items={documents}
      label="پروژه‌ها"
      theme="dark"
    />
  );
}

// آبی را فقط وقتی بخواهی پوشه از سطحِ خنثی جدا شود بده
<Folder
  items={documents}
  label="پروژه‌ها"
  color="#3b82f6"
  theme="dark"
/>

// حالتِ کتابی و شیشه‌ای؛ کاغذها با کشیدن بیرون می‌آیند
<Folder
  items={documents}
  label="آرشیو"
  mode="book"
  variant="glass"
  layout="row"
  frost={0.6}
/>

// کنترل از بیرون: باز/بسته را خودت مدیریت کن
<Folder
  items={documents}
  label="پرونده‌ها"
  open={open}
  onOpenChange={setOpen}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `FolderEntry[]` | `سه سندِ نمونه` | — | What the folder holds, at most 6 entries. Each entry can be a string, `{ title, description }`, `{ image, title, alt }`, `{ content }`, or a React element. |
| `children` | `ReactNode` | `undefined` | — | Custom documents as children; each child becomes a paper (it takes precedence over `items`). |
| `mode` | `'flap' | 'book'` (`flap` · `book`) | `'flap'` | — | `flap` keeps the folder upright and opens its flap; `book` lays it flat and turns the cover like a book. |
| `variant` | `'solid' | 'glass' | 'matte'` (`solid` · `glass` · `matte`) | `'solid'` | — | The folder's material; `glass` makes the flap refractive glass and shows the papers inside through it. |
| `layout` | `'spread' | 'stack' | 'row'` (`spread` · `stack` · `row`) | `'spread'` | — | Arrangement of the papers when the folder is open: free spread, vertical stack, or tidy row. |
| `color` | `string` | `تم‌آگاه (#8c8c8c / #27272a)` | — | Color of the folder; shadows and the light/dark layers are derived from it. Omit it to stay in tune with the mono surface theme; the blue `#3b82f6` is only the accent of the dock's blue slot. |
| `paperColor` | `string` | `'#ffffff'` | — | Color of the papers. |
| `label` | `string` | `undefined` | — | Text of the tab label; the tab grows to fit the text. |
| `tabPosition` | `'left' | 'center' | 'right'` (`left` · `center` · `right`) | `'right'` | — | Where the tab sits on the top edge (in right-to-left layout, `right` is the start side). |
| `openOn` | `'click' | 'hover'` (`click` · `hover`) | `'click'` | — | Open on click, or while the pointer is over the folder. |
| `open` | `boolean` | `undefined` | — | Controlled state; pass `onOpenChange` alongside it. |
| `defaultOpen` | `boolean` | `false` | — | The folder starts open. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | — | Called on every open or close. |
| `onItemClick` | `(item, index: number) => void` | `undefined` | — | On clicking a paper, when the folder is open or the paper has been taken out. |
| `onItemDrop` | `(item, index: number, inside: boolean) => void` | `undefined` | — | On releasing a dragged paper; `inside` says whether it landed inside the folder or outside. |
| `draggable` | `boolean` | `true` | — | Allow dragging papers out of the folder and dropping them anywhere. |
| `zoomOnClick` | `boolean` | `true` | — | Clicking a paper brings it close; another click, Escape, or an outside click returns it. |
| `peek` | `boolean` | `true` | — | On hover the papers peek out a little; in flap mode, the paper under the pointer lifts more. |
| `intro` | `boolean` | `true` | — | When it comes into view, the papers drop in and the folder closes over them. |
| `size` | `number` | `1` | — | Overall scale of the folder. |
| `frost` | `number` | `0.25` | — | Amount of glass frosting, 0 to 1; only with `variant='glass'`. |
| `tilt` | `number` | `0.5` | — | How much the folder tilts toward the pointer, 0 to 1.5. |
| `speed` | `number` | `1` | — | Speed of all animations. |
| `bounce` | `number` | `0.4` | — | How much the flap/cover/papers bounce when settling, 0 to 1. |
| `closeOnOutsideClick` | `boolean` | `true` | — | Close on an outside click or Escape. |
| `theme` | `'dark' | 'light'` (`dark` · `light`) | `'dark'` | — | Matches the shadows and focus to a dark or light theme. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style; it sits after the color variables. |

## Tips

- Keep the label short and Persian; the tab grows with the text width and does not overflow the edge.
- The paper drawing reads direction from CSS; keep `dir="rtl"` on the page or parent so Persian lines are laid out from the right.
- `variant='glass'` gives the best result on WebGL2; without it you still get the same CSS glass with `backdrop-filter`.
- Papers can be dragged out and dropped back in; `onItemDrop` tells you which case happened.
- Under `prefers-reduced-motion` the intro and the springs calm down; content and accessibility stay untouched.
- For narrow cards lower `size`; the spread-open papers need more width than the folder itself.

