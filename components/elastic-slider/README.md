# Elastic Slider

A slider that thickens under the pointer and, if you pull past either end, stretches like a rubber band and springs back.

- **Category:** Inputs
- **Interaction:** Drag / Click / Keyboard / Mouse wheel
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/elastic-slider](https://farsifyui.ir/components/elastic-slider)
- **Install ID:** `elastic-slider`

## Install

```bash
npx shadcn@latest add @farsify/elastic-slider
```

Or copy `components/elastic-slider/elastic-slider.tsx` and `components/elastic-slider/elastic-slider.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import ElasticSlider from "@/components/farsify/elastic-slider";

export function VolumeControl() {
  const [level, setLevel] = useState(64);

  return (
    <ElasticSlider
      value={level}
      onChange={setLevel}
      ariaLabel="میزان صدا"
    />
  );
}

// پر شدنِ دوطرفه: از وسط بازه رشد می‌کند و دستگیره دارد
<ElasticSlider
  defaultValue={0}
  startingValue={-100}
  maxValue={100}
  fillFrom={0}
  thumb
  valuePosition="bubble"
  rangeColor="var(--color-brand)"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | — | Controlled value. Omit it for the value to be internal. |
| `defaultValue` | `number` | `50` | — | Starting value when it is not controlled. |
| `startingValue` | `number` | `0` | — | Lowest value of the range. |
| `maxValue` | `number` | `100` | — | Highest value of the range. |
| `isStepped` | `boolean` | `false` | — | The value snaps to the `stepSize` grid. |
| `stepSize` | `number` | `1` | — | Size of each step when `isStepped` is on. |
| `onChange` | `(value: number) => void` | — | — | Called on every value change. |
| `onChangeEnd` | `(value: number) => void` | — | — | End of a drag, key, or wheel — once. |
| `orientation` | `'horizontal' | 'vertical'` (`horizontal` · `vertical`) | `'horizontal'` | — | Track direction; vertical fills from the bottom. |
| `startIcon` | `ReactNode` | — | — | Icon of the low end. It is logical: it sits on the left in LTR and on the right in RTL. `null` hides it. |
| `endIcon` | `ReactNode` | — | — | Icon of the high end. On the right in LTR and on the left in RTL. `null` hides it. |
| `iconPlacement` | `'outside' | 'inside'` (`outside` · `inside`) | `'outside'` | — | Outside the track or inside it. For inside, the thickness should be around 40px or the icons get clipped. |
| `valuePosition` | `'top' | 'bubble' | 'inside' | 'none'` (`top` · `bubble` · `inside` · `none`) | `'top'` | — | Where the number goes: above the track, in a moving bubble, inside the track, or nowhere. |
| `formatValue` | `(value: number) => string` | — | — | Formats the number and `aria-valuetext`; by default Persian digits via `Intl.NumberFormat('fa-IR')`. |
| `ticks` | `boolean | number[]` | `false` | — | Dots on the track: every step, every tenth, or explicit values. |
| `thumb` | `boolean` | `false` | — | Round handle at the head of the fill. |
| `fillFrom` | `number` | — | — | The value the fill grows from; the middle of the range means a two-sided fill. |
| `thickness` | `number` | `6` | — | Track thickness at rest, in pixels. |
| `activeThickness` | `number` | `12` | — | Track thickness on hover, focus, or drag. |
| `radius` | `number` | — | — | Track corner radius; omit it for the track to be fully round. |
| `restOpacity` | `number` | `0.7` | — | Brightness at rest; it reaches 1 when active. |
| `growOnHover` | `boolean` | `true` | — | Hover also activates the track; off means press/focus only. |
| `maxStretch` | `number` | `50` | — | Maximum stretch past either end, in pixels; zero turns it off. |
| `bounce` | `number` | `0.5` | — | How much the return spring wobbles, 0 to 0.95. |
| `jumpToClick` | `boolean` | `true` | — | A click on the track puts the value right there; off means it drags from the current value. |
| `wheel` | `boolean` | `false` | — | Let the mouse wheel change the value (it captures scrolling over the track). |
| `trackColor` | `string` | `'color-mix(in srgb, currentColor 18%, transparent)'` | — | Color of the empty groove. |
| `rangeColor` | `string` | `'currentColor'` | — | Color of the fill; in the demo the default is the theme's mono and the variants add an accent. |
| `iconColor` | `string` | `'currentColor'` | — | Color of the icons outside the track. |
| `contentColor` | `string` | `'currentColor'` | — | Color of the number/icon/tick over the empty groove. |
| `fillContentColor` | `string` | `'auto'` | — | Color of the content over the fill; `auto` picks opaque ink from the brightness of the fill color. |
| `thumbColor` | `string` | `'#ffffff'` | — | Handle color. |
| `disabled` | `boolean` | `false` | — | Turns interaction off and dims the whole slider. |
| `ariaLabel` | `string` | `'لغزنده'` | — | Accessible name of the slider. |
| `dir` | `'ltr' | 'rtl'` | — | — | Provide the direction manually; by default it is read from the computed `direction`. |
| `ref` | `Ref<ElasticSliderHandle>` | — | — | Imperative handle with `bump(side)` — stretches the track past one end and springs it back without changing the value; for preview drivers and storytelling. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style; it is applied after the color variables. |

## Tips

- In right-to-left the track fills from the right; the left key means 'more'. The same convention holds in `wake-slider`.
- For a two-sided fill (like camera exposure), set `fillFrom` to the middle of the range and turn `thumb` on.
- For an inside icon, take `thickness` to around 40px; otherwise the icons get clipped in a thin track.
- With `ticks={[0]}` you show only the zero dot; a numeric `ticks` brings in every step.
- If the mouse wheel should scroll the page, leave `wheel` off (the default).

