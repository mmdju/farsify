# OTP

Four or six cells and a caret that take a one-time code: a right code draws the cells together until they fuse into one capsule that says verified, a wrong one shivers and drains.

- **Category:** Inputs
- **Interaction:** Type / Paste / Keyboard
- **Dependencies:** `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/otp](https://farsifyui.ir/components/otp)
- **Install ID:** `otp`

## Install

```bash
npx shadcn@latest add @farsify/otp
```

Or copy `components/otp/otp.tsx` and `components/otp/otp.css` from this repository into your project.

## Usage

```tsx
"use client";

import { Otp } from "@/components/farsify/otp";

export function VerifyCode() {
  return <Otp length={4} />;
}

// ---------- نمونه‌های بیشتر ----------
export function SixDigits() {
  return <Otp length={6} corner={20} successColor="#059669" />;
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `length` | `number` (`4` · `6`) | `4` | — | How many cells: 4 or 6. Anything else is read as 6. |
| `answer` | `string ("Accept" | "Reject")` (`Accept` · `Reject`) | `"Accept"` | — | What a full row gets back. Anything other than `Reject` verifies it. |
| `corner` | `number` | `12` | — | Corner radius of a cell, px, up to half the cell height; the verified capsule always wears a full pill. |
| `surfaceColor` | `string` | `"#232323"` | — | Cell and capsule surface. |
| `textColor` | `string` | `"#fafafa"` | — | Digits, the caret and the focus ring. |
| `successColor` | `string` | `"#22c55e"` | — | The tick and the word beside it once the code verifies. |
| `className` | `string` | `—` | — | Extra class for the wrapper. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it plays the interaction on its own. Leave it off in normal use. |

## Tips

- `answer` is a demonstration knob, not validation: no code is ever checked. Send the code yourself and render the same verified state for a real sign-in.
- One input holds the value; keep it invisible rather than splitting the code across six fields, which breaks paste, autofill, backspace and screen readers.
- The cells sit under a blur-and-threshold filter, so anything drawn under it must be a solid shape. Never put the digits there: glyph antialiasing is below the threshold and the text disappears.
- The filter's id comes from `useId`, so two instances on one page do not steal each other's filter. Keep it that way when copying the file.
- Under `prefers-reduced-motion` the filter is dropped and the merge jumps to the capsule; the row still reads verified, just without the fuse.
- A six-digit row is 338px wide, so give it a container at least that wide or a fit wrapper on narrow screens.

