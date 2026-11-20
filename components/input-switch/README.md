# Input Switch

A pill-shaped prompt input whose small side button cycles through prompt presets, each bringing its own icon and a word-by-word animated Persian placeholder; the arrow button and Enter hand the typed value over.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/input-switch](https://farsifyui.ir/components/input-switch)
- **Install ID:** `input-switch`

## Install

```bash
npx shadcn@latest add @farsify/input-switch
```

Or copy `components/input-switch/input-switch.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import InputSwitch from "@/components/farsify/input-switch";

export function AskBar({ ask }: { ask: (value: string) => void }) {
  return <InputSwitch onSubmit={ask} />;
}

// پیشنهادهای خودت را بگذار (آیکن‌ها از lucide-react)
import { Wand, Camera } from "lucide-react";

<InputSwitch
  options={[
    { text: "چیزی بپرس...", icon: Wand },
    { text: "عکس بگیر...", icon: Camera },
  ]}
  onSubmit={(value) => console.log(value)}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `InputSwitchOption[]` | `۲ پیشنهادِ نمونه` | — | Prompt presets to cycle through; each entry has a `text` and an optional lucide `icon`. Defaults to a search and an image-generation preset. |
| `defaultOption` | `number` | `0` | — | Which preset starts active; clamped into range. |
| `onSubmit` | `(value: string) => void` | — | — | Called with the typed value when Enter is pressed inside the input or the end-side arrow is clicked. |
| `className` | `string` | — | — | Extra class for the root pill. |

## Tips

- This is an AI-style prompt bar: the small button on the start side cycles through presets, each with its own icon and animated placeholder.
- Keep every preset short; the placeholder animates word by word and a long text is clipped rather than wrapped.
- Hand the submitted value to `onSubmit`; both the arrow button and the Enter key deliver it, and the value stays internal so you do not manage state.
- Icons come from lucide-react through the `options` prop — pass your own per preset or leave one out to fall back to the sparkles.
- Under `prefers-reduced-motion` the cascades, blurs and taps become instant swaps; the cycling and submitting logic stays intact.
