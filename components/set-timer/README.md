# Set Timer

A timer that morphs in place: a small pill opens a minutes wheel, the wheel rolls into a running countdown whose border drains with the remaining time, and it can be paused or cancelled without leaving the same surface.

- **Category:** Inputs
- **Interaction:** Click / Drag / Scroll / Keyboard
- **Dependencies:** `motion`, `@ncdai/react-wheel-picker`
- **Live preview:** [https://farsifyui.ir/components/set-timer](https://farsifyui.ir/components/set-timer)
- **Install ID:** `set-timer`

## Install

```bash
npx shadcn@latest add @farsify/set-timer
npm install @ncdai/react-wheel-picker
```

Or copy `components/set-timer/set-timer.tsx` from this repository into your project. The wheel package is required: the component imports `@ncdai/react-wheel-picker/style.css` at the top of the file.

## Usage

```tsx
"use client";

import SetTimer from "@/components/farsify/set-timer";

export function FocusBlock() {
  return <SetTimer />;
}
```

Place it anywhere: it centres itself, owns its charcoal surface and does not read theme tokens.

## Props

This component takes no props. The minutes bounds (1–60), the starting minutes (5) and the Persian copy live in the file, so edit them there when you need different wording or a longer range.

## Tips

- The minutes wheel is `@ncdai/react-wheel-picker`; the component imports its stylesheet itself, so the package has to be installed in the project.
- All four faces are one surface that animates its width, height and radius, so nothing jumps when the timer opens, runs or resets.
- The wheel loops infinitely and the minutes stay between 1 and 60; those bounds live in the file, not in props.
- Numbers are Persian digits through `toFaDigits`, including the countdown and the accessible label.
- Colors are fixed to the dark charcoal surface with an orange progress ring and a green start button, so the timer reads the same in light and dark themes.
