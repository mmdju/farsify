# Branched Menu

A nested menu whose sections open and close like tree branches, and a path line is drawn all the way to the selected option.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/branched-menu](https://farsifyui.ir/components/branched-menu)
- **Install ID:** `branched-menu`

## Install

```bash
npx shadcn@latest add @farsify/branched-menu
```

Or copy `components/branched-menu/branched-menu.tsx` and `components/branched-menu/branched-menu.css` from this repository into your project.

## Usage

```tsx
"use client";

import BranchedMenu from "@/components/farsify/branched-menu";

export function DocsNav() {
  return (
    <BranchedMenu
      defaultOpen={[0, 1]}
      defaultActive="quick"
      accentColor="var(--color-brand)"
      items={[
        {
          label: "شروع کار",
          children: [
            { value: "install", label: "نصب" },
            { value: "quick", label: "شروع سریع" },
            { value: "config", label: "پیکربندی" },
          ],
        },
        {
          label: "کامپوننت‌ها",
          children: [
            { value: "buttons", label: "دکمه‌ها" },
            { value: "forms", label: "فرم‌ها" },
          ],
        },
      ]}
      onSelect={(value) => console.log(value)}
    />
  );
}

// بخشِ تک‌برگ — بدون فرزند، خودش یک گزینه است
<BranchedMenu
  items={[
    { label: "راهنما", value: "help" },
    { label: "درباره", value: "about" },
  ]}
  defaultActive="about"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `BranchedMenuItem[]` | `DEFAULT_ITEMS` | — | The sections. Each section has a `label` and a list of children (`value`, `label`, `icon`), or is itself a leaf with a `value`. |
| `defaultOpen` | `number | number[]` | `0` | — | Which sections are open at first. A negative number means none. |
| `defaultActive` | `string` | `""` | — | The initial selected value. Leave it empty so the first child of the open section is selected. |
| `onSelect` | `(value, item) => void` | — | — | Called when a child or a leaf is selected. |
| `onToggle` | `(index, open) => void` | — | — | Called when a section opens or closes. |
| `color` | `string` | `"#f5f5f5"` | — | Ink color. The lines and the unstyled text are blends of this same color. |
| `accentColor` | `string` | `"#f5f5f5"` | — | Color of the active line, the active label and the indicator. |
| `lineColor` | `string` | `"#3f3f46"` | — | Color of the trunk and branches. It is a flat color so the connection points don't get darker. |
| `width` | `number` | `240` | — | Maximum menu width; it shrinks to fit the content. |
| `rowHeight` | `number` | `36` | — | Height of each child row. |
| `indent` | `number` | `40` | — | Where the children start. The branches end a little before it. |
| `trunk` | `number` | `14` | — | Horizontal position of the trunk line. |
| `radius` | `number` | `10` | — | Arc radius of each branch; it is limited to the row height. |
| `lineWidth` | `number` | `1.5` | — | Line thickness. |
| `fontSize` | `number` | `14` | — | Font size of the children; section titles are one pixel larger. |
| `drawDuration` | `number` | `400` | — | Duration of drawing the active colored line, milliseconds. |
| `foldDuration` | `number` | `300` | — | Duration of each section opening and closing, milliseconds. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: keeps the sections open and selects children one by one; every few steps a section actually folds and unfolds so the path line is drawn anew. |
| `className` | `string` | — | — | Extra class on the menu root. |

## Tips

- You can also give the colors with a CSS variable: `accentColor="var(--color-brand)"` so the active line matches your site's brand.
- For a side menu, pass an array to `defaultOpen` so several sections are open at once.
- Each child's icon is a React element (`icon`), so pass your own project's icons directly — there is no external dependency.

