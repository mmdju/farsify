# Scrub Field

A numeric chip that increases and decreases by dragging horizontally and accepts typed input; values are displayed with Persian digits.

- **Category:** Inputs
- **Interaction:** Drag / Type / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/scrub-field](https://farsifyui.ir/components/scrub-field)
- **Install ID:** `scrub-field`

## Install

```bash
npx shadcn@latest add @farsify/scrub-field
```

Or copy `components/scrub-field/scrub-field.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import ScrubField from "@/components/farsify/scrub-field";

export function RadiusField() {
  const [radius, setRadius] = useState(24);

  return (
    <ScrubField
      label="شعاع"
      suffix="px"
      value={radius}
      onChange={setRadius}
      onCommit={(v) => console.log("ثبت شد:", v)}
    />
  );
}

// بدون کنترل — خودش مقدار را نگه می‌دارد
<ScrubField label="حاشیه" defaultValue={16} min={0} max={64} />

// گامِ ریزِ نیم‌واحدی، با قرصِ اختلاف خاموش
<ScrubField
  label="شفافیت"
  suffix="٪"
  defaultValue={1.5}
  min={0}
  max={10}
  step={0.5}
  showDelta={false}
/>

// رنگ برند — لهجه هم تهیِ مقدار است هم قرصِ اختلاف
<ScrubField
  label="ضخامت"
  suffix="px"
  accent="var(--color-brand)"
  chipColor="#18181b"
  size="lg"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | `"شعاع"` | — | Label next to the number. |
| `suffix` | `string` | `"px"` | — | Unit next to the number; leave it empty to have none. |
| `value` | `number` | — | — | Controlled value; pass it to control the value yourself. |
| `defaultValue` | `number` | `24` | — | Initial value in uncontrolled mode. |
| `min` | `number` | `0` | — | Minimum of the range. |
| `max` | `number` | `100` | — | Maximum of the range. |
| `step` | `number` | `1` | — | Size of each step; the number of decimal places comes from it too. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Height, font size, radius and the chip's width. |
| `sensitivity` | `number` | `2` | — | How many pixels of dragging count as one `step`; a lower number means faster. |
| `rubberReach` | `number` | `8` | — | How many percent of the range the spring can reach outside `min`/`max`. |
| `returnDuration` | `number` | `300` | — | Duration of the return into the range after release. |
| `coarseMultiplier` | `number` | `10` | — | `Shift` multiplier — the coarse jump. |
| `fineMultiplier` | `number` | `0.1` | — | `Alt` multiplier — the fine adjustment. |
| `showDelta` | `boolean` | `true` | — | The floating delta chip above the indicator. |
| `showDirty` | `boolean` | `false` | — | A ring around the chip when the value differs from `defaultValue`. |
| `showFill` | `boolean` | `true` | — | The colored fill that shows the size of the value. |
| `accent` | `string` | `"#f5f5f5"` | — | Accent color — the value fill, the delta chip and the changed ring. |
| `chipColor` | `string` | `"#27272a"` | — | Chip background. |
| `disabled` | `boolean` | `false` | — | Dims it and ignores input. |
| `onChange` | `(value: number) => void` | — | — | On every value change — even mid-drag. |
| `onCommit` | `(value: number) => void` | — | — | Only when the drag has ended and the value actually changed. |
| `autoPreview` | `boolean` | `false` | — | Automatic drag preview without interaction. |
| `className` | `string` | `""` | — | Extra class for the root element. |

## Tips

- Use `onCommit` for heavy work and `onChange` for live display — keep that separation. `onChange` is called on every drag frame.
- The input reads both Persian and Latin digits. Persian keyboards send Persian digits and a raw `parseFloat` reads them as `NaN`; here both work the same.
- If you set `min` and `max` to the same number, the range becomes zero and the rubber-band stretch turns off — the component doesn't break, it just loses its spring.
- Label and unit are UI, not data — they are shown on the chip itself and announced in `aria-valuetext`. So keep them Persian.
- The value is **displayed** with Persian digits, but `aria-valuenow` stays a Latin number — the same thing assistive technology reads.

