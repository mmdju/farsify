# Glide Select

A glide selector whose list opens smoothly and whose raised pill slides onto the next option with a springy glide; dragging a finger across the list works too.

- **Category:** Navigation
- **Interaction:** Click / Drag / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/glide-select](https://farsifyui.ir/components/glide-select)
- **Install ID:** `glide-select`

## Install

```bash
npx shadcn@latest add @farsify/glide-select
```

Or copy `components/glide-select/glide-select.tsx` and `components/glide-select/glide-select.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { GlideSelect, type GlideSelectOption } from "@/components/farsify/glide-select";

const FORMATS: GlideSelectOption[] = [
  { value: "png", label: "PNG", tag: "بدون افتِ کیفیت" },
  { value: "jpg", label: "JPG", tag: "کم‌حجم‌ترین" },
  { value: "webp", label: "WebP", tag: "مدرن" },
  { value: "svg", label: "SVG", tag: "برداری" },
];

export function ExportPicker() {
  const [format, setFormat] = useState("png");

  return (
    <GlideSelect
      options={FORMATS}
      value={format}
      onChange={setFormat}
      ariaLabel="قالبِ خروجی"
    />
  );
}

// بدونِ برچسبِ کنارِ گزینه‌ها و با منوی عریض‌تر
<GlideSelect options={["XS", "S", "M", "L", "XL"]} showTags={false} menuWidth={220} />

// منو بالای دکمه باز شود و به لبه‌ی پایان بچسبد
<GlideSelect options={FORMATS} placement="top" align="right" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `Array<string | GlideSelectOption>` | `["One", "Two", "Three"]` | — | The options; a string or an object `{ value, label, tag }`. |
| `value` | `string` | — | — | Controlled state. |
| `defaultValue` | `string` | — | — | Initial value in uncontrolled mode. |
| `onChange` | `(value: string, option: GlideSelectOption) => void` | — | — | Called on selection and returns the option itself too. |
| `placeholder` | `string` | `"انتخاب کن…"` | — | Text shown when nothing is selected. |
| `showTags` | `boolean` | `true` | — | Whether the small tag beside the options is shown. |
| `accentColor` | `string` | `"#f5f5f5"` | — | Color of the check on the selected option. |
| `surfaceColor` | `string` | `"#27272a"` | — | Background of the menu. |
| `highlightColor` | `string` | `"#3f3f46"` | — | Color of the raised pill. |
| `textColor` | `string` | `"#f5f5f5"` | — | Text color of the button and the options. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Size of the button and the rows. |
| `radius` | `number` | `10` | — | Roundness of the button and the menu, pixels. |
| `menuWidth` | `number` | `176` | — | Minimum width of the menu, pixels. |
| `placement` | `"top" | "bottom"` (`top` · `bottom`) | `"bottom"` | — | Whether the menu opens above or below the button. |
| `align` | `"left" | "right"` (`left` · `right`) | `"left"` | — | Which edge to stick to; it mirrors automatically in RTL. |
| `popDuration` | `number` | `180` | — | Duration of the menu opening, milliseconds. |
| `glideDuration` | `number` | `220` | — | Duration of the pill gliding between options, milliseconds. |
| `rememberPosition` | `boolean` | `true` | — | When the pointer leaves the list, the active position is kept. |
| `disabled` | `boolean` | `false` | — | Dimmed and unresponsive to input. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it opens the menu, glides the pill to the next option, and selects it — all through the real open/glide/select path. |
| `ariaLabel` | `string` | `"انتخاب"` | — | Accessible name of the button. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- `tag` holds a short note, not the name: in the file-template demo, `label` stays the Latin "PNG" and `tag` is "without quality loss". The two sit in separate elements and `tag` lives in an isolated left-to-right domain, so it does not mix with Persian text.
- Do not think of `align` physically: under `dir="rtl"` the value `left` means "stick to the start edge", which is the right side. The component mirrors it itself, so you do not need to change anything by hand.
- For a list with more than eight options, make `menuWidth` larger and do not pass `tag`; tight rows get crowded with a tag next to the name.
- The motion is not only `motion` — most of the opening and closing is CSS keyframes, so it has no noticeable cost even across dozens of selectors on one page.

