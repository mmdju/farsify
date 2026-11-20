# Jelly Radio

A row of chips for picking an option; the chip you click swells and the others give way with a springy shove.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/jelly-radio](https://farsifyui.ir/components/jelly-radio)
- **Install ID:** `jelly-radio`

## Install

```bash
npx shadcn@latest add @farsify/jelly-radio
```

Or copy `components/jelly-radio/jelly-radio.tsx` and `components/jelly-radio/jelly-radio.css` from this repository into your project.

## Usage

```tsx
"use client";

import { JellyRadio } from "@/components/farsify/jelly-radio";

export function VolumeLevel() {
  return (
    <JellyRadio
      ariaLabel="سطح صدا"
      items={["خاموش", "کم", "متوسط", "زیاد", "بیشینه"]}
      defaultValue="متوسط"
      onChange={(value) => console.log(value)}
    />
  );
}

// با رنگ‌های برند و اندازه‌ی بزرگ
<JellyRadio
  size="lg"
  chipColor="var(--color-brand)"
  activeColor="#ffffff"
  textColor="#ffffff"
  activeTextColor="var(--brand)"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `JellyRadioItem[]` | `["خاموش", "کم", "متوسط", "زیاد", "بیشینه"]` | — | The options; you can pass strings, or objects with value, label, icon and disabled. |
| `value` | `string` | — | — | Controlled value. If you want uncontrolled, do not pass this and pass defaultValue instead. |
| `defaultValue` | `string` | — | — | The selected option in uncontrolled mode; defaults to the first option. |
| `onChange` | `(value: string, index: number) => void` | — | — | Returns the new option's value and index on every selection. |
| `size` | `sm | md | lg` (`sm` · `md` · `lg`) | `md` | — | Chip size: sm 28, md 36 and lg 44 pixels. |
| `chipColor` | `string` | `#27272a` | — | Background color of the inactive chips. |
| `activeColor` | `string` | `#f5f5f5` | — | Background color of the selected chip. |
| `textColor` | `string` | `#f5f5f5` | — | Text color of the inactive chips; the same color is used when the pointer moves over them. |
| `activeTextColor` | `string` | `#18181b` | — | Text color of the selected chip. |
| `gap` | `number` | `8` | — | Spacing between chips, in pixels. |
| `radius` | `number` | `18` | — | Corner radius of the chips; for a fully pill-shaped chip, pass half the height. |
| `swell` | `number` | `0.2` | — | How much larger the active chip grows, relative to its own size. |
| `barge` | `number` | `6` | — | How many extra pixels the neighbours are pushed aside. |
| `shrink` | `number` | `0.05` | — | How much the neighbours shrink. |
| `jelly` | `number` | `1` | — | Intensity of the jelly feel. At 0 the motion becomes a simple zoom; above 1 the stretch gets exaggerated. |
| `bounce` | `number` | `0.25` | — | Spring bounciness. Above 0.4 it looks too resonant. |
| `stagger` | `number` | `22` | — | Time offset at which each neighbour starts moving, in milliseconds. |
| `stiffness` | `number` | `580` | — | Spring stiffness; lower means softer and slower. |
| `disabled` | `boolean` | `false` | — | Disables and dims the whole group. |
| `ariaLabel` | `string` | `گزینه‌ها` | — | Group label for screen readers; keep it close to the question's topic. |
| `className` | `string` | `""` | — | Extra class on the group root; for custom spacing or width. |

## Tips

- For choices picked over and over, set `bounce` around 0.15; less bounce, calmer.
- If the chip labels are long, increase `size` rather than `gap`; a large gap scatters the group.
- You can also pass colors with a CSS variable, like `var(--color-brand)`.

