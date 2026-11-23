# Filter Menu

A round filter button that expands into a list of filter categories, while a second circle beside it slides away carrying the icon of whatever is selected.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/filter-menu](https://farsifyui.ir/components/filter-menu)
- **Install ID:** `filter-menu`

## Install

```bash
npx shadcn@latest add @farsify/filter-menu
```

Or copy `components/filter-menu/filter-menu.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { FilterMenu } from "@/components/farsify/filter-menu";

export function TaskFilters() {
  return <FilterMenu onChange={(id) => setFilter(id)} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* فیلترهای خودت؛ برچسب‌ها را یک‌خطی نگه دار */}
      <FilterMenu
        items={[
          { id: "open", label: "باز", icon: Circle },
          { id: "done", label: "انجام‌شده", icon: CheckCheck },
        ]}
      />

      {/* بزرگ‌تر و با تیکِ رنگی */}
      <FilterMenu size="lg" accent="var(--color-brand)" />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autoPreview` | `boolean` | `false` | — | Site preview only - the panel opens, holds long enough to read the rows, picks the next one and folds back on repeat. Leave it off in normal use. |
| `items` | `FilterMenuItem[]` | `شش فیلترِ نمونه` | — | The filter rows; each entry has an `id`, a Persian `label` and an optional `icon` component. |
| `active` | `string` | — | — | Controlled active id; pass it together with `onChange`, otherwise picking a row does nothing. |
| `defaultActive` | `string` | — | — | Active id on the first render in uncontrolled mode; defaults to the first filter. |
| `onChange` | `(id: string) => void` | — | — | Called with the id of the filter that was picked. |
| `accent` | `string` | `"var(--foreground)"` | — | Fill of the check on the active row; the tick itself is drawn in the background colour. |
| `size` | `"sm" | "md" | "lg"` | `"md"` | — | Diameter of the circles, width of the panel, icon size and row height. |
| `className` | `string` | `""` | — | Extra class for the row that holds the two circles. |

## Tips

- Labels are printed on one line inside a fixed-height row, so keep each filter label short; a long label is clipped rather than wrapped.
- The two circles overlap by a few pixels and the panel sits above the icon circle, so the panel grows over it instead of pushing the layout sideways.
- `accent` fills the check and the tick is drawn in the background colour, so any accent stays readable in both themes.
- Panel height is computed from the number of items rather than measured, which keeps the size animation from relying on layout projection.
- Under `prefers-reduced-motion` the panel jumps to its new size and the rows skip the stagger; the active state and the check stay.

