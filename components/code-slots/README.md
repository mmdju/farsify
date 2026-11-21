# Code Slots

A one-time code input; each digit springs into its own slot, an error empties the slots from last to first, and success draws a curtain with a tick rising in the middle.

- **Category:** Inputs
- **Interaction:** Keyboard typing / Paste / Click
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/code-slots](https://farsifyui.ir/components/code-slots)
- **Install ID:** `code-slots`

## Install

```bash
npx shadcn@latest add @farsify/code-slots
```

Or copy `components/code-slots/code-slots.tsx` and `components/code-slots/code-slots.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { CodeSlots, type CodeSlotsStatus } from "@/components/farsify/code-slots";

/** چند میلی‌ثانیه تا رسیدنِ پاسخ، و چند میلی‌ثانیه پاسخ بماند. */
const ANSWER_MS = 350;
const RESET_MS = 1800;

export function OneTimeCode() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CodeSlotsStatus>("idle");

  return (
    <CodeSlots
      value={code}
      status={status}
      onChange={(next) => {
        setCode(next);
        // هر ویرایش، حالت را به idle برمی‌گرداند — وگرنه بعد از یک پذیرش
        // کامپوننت قفل می‌ماند و کاربر نمی‌تواند دوباره تایپ کند
        setStatus("idle");
      }}
      onComplete={async (done) => {
        // این‌جا تصمیم می‌گیرید کد درست است یا نه
        const ok = await verify(done);
        setTimeout(() => {
          setStatus(ok ? "success" : "error");
          if (ok) {
            setTimeout(() => {
              setCode("");
              setStatus("idle");
            }, RESET_MS);
          }
        }, ANSWER_MS);
      }}
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* کدِ هشت‌رقمی، پوشیده، با خانه‌های بزرگ‌تر */}
      <CodeSlots length={8} mask slotSize={56} gap={10} />

      {/* نشستنی خشک و هم‌زمان — بدونِ جهشِ فنر و بدونِ خطِ پله‌ای */}
      <CodeSlots bounce={0} cascade={0} rise={0} />

      {/* در حالتِ خطا، خودِ کامپوننت خانه‌ها را از آخر به اول خالی می‌کند و تهش */}
      {/* onChange("") می‌دهد؛ لازم نیست خودت پاکش کنی */}
      <CodeSlots value={code} status="error" onChange={setCode} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `length` | `number` | `6` | — | Number of slots. |
| `value` | `string` | `undefined` | — | The controlled code. A digit arriving from outside settles in with a cascade, and a digit that leaves empties its slot. |
| `defaultValue` | `string` | `""` | — | Initial uncontrolled code; it renders already settled from the start. |
| `onChange` | `(code: string) => void` | — | — | Called on every edit — including clearing at the end of a rejection. |
| `onComplete` | `(code: string) => void` | — | — | Once, when the last slot fills. |
| `status` | `"idle" | "error" | "success"` (`idle` · `error` · `success`) | `"idle"` | — | Error empties the slots from last to first under a danger tint and clears the code; success merges the fills into a curtain and locks the input. |
| `mask` | `boolean` | `false` | — | Shows a dot in place of each digit. |
| `caret` | `boolean` | `true` | — | Blinking caret in the active slot. |
| `disabled` | `boolean` | `false` | — | Dims the row and ignores input. |
| `autoFocus` | `boolean` | `false` | — | Focuses the input on mount. |
| `accentColor` | `string` | `"#f5f5f5"` | — | Fill of a settled digit, the ring of the active slot, and the success curtain. |
| `inkColor` | `string` | `"#f5f5f5"` | — | The caret, and the tint of the active slot. |
| `slotColor` | `string` | `"#27272a"` | — | Surface of an empty slot. |
| `digitColor` | `string` | `"#18181b"` | — | Color of the digit on the fill. |
| `dangerColor` | `string` | `"#ff3b30"` | — | Ring and fill color in the error state. |
| `slotSize` | `number` | `44` | — | Slot width, px. Height and digit size follow it too. |
| `gap` | `number` | `8` | — | Spacing between slots, px. |
| `radius` | `number` | `12` | — | Corner rounding, px; capped at half the slot size. |
| `bounce` | `number` | `0.2` | — | Spring bounce of settling; zero means damped with no bounce. |
| `settle` | `number` | `0.3` | — | Seconds a digit takes to settle or empty. |
| `rise` | `number` | `8` | — | Pixels a digit rises from below; zero means it only fades. |
| `cascade` | `number` | `20` | — | Milliseconds between slots when several settle together or empty in a rejection. |
| `ariaLabel` | `string` | `"کد یکبارمصرف"` | — | Accessible name of the input. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- This component does not decide whether the code is correct — you know where the right code lives. Take `onComplete` and set `status` after the server responds.
- Pasting works: copy the whole code and paste it onto the row, and the digits settle in a cascade. The SMS keyboard autofill (`autocomplete="one-time-code"`) is wired up too.
- Persian input is accepted too — both Persian and Arabic-Indic digit forms convert to the same Latin code. The `value` and `onChange` values are always Latin, because that is data, not display.
- Filled slots are distinguishable from empty ones but **cannot be skipped**: clicking any slot moves the caret to the first empty slot and no further.
- Set `cascade` to zero so all digits settle at once; raise it to make the stepped line more obvious. Above 40ms it feels slow on a six-digit code.
- This component **does not mirror for right-to-left**, and that is intentional: its geometry is physical (the caret moves via `translateX` and a tap is mapped to a slot via `clientX`). Only the text and digits are Persian — the same rule as `jelly-radio`.
- To let the user know you rejected a wrong code, set `status` to `error` and **then yourself** return it to `idle` once the emptying finishes — at the end the component fires `onChange('')`, which is the signal that it is done.

