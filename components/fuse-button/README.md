# Fuse Button

A button that lights a fuse with one press and gives you until it burns out to take it back; when the fuse runs out, the action is committed.

- **Category:** Buttons
- **Interaction:** Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/fuse-button](https://farsifyui.ir/components/fuse-button)
- **Install ID:** `fuse-button`

## Install

```bash
npx shadcn@latest add @farsify/fuse-button
```

Or copy `components/fuse-button/fuse-button.tsx` and `components/fuse-button/fuse-button.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import FuseButton from "@/components/farsify/fuse-button";

export function ArchiveButton() {
  const [archived, setArchived] = useState(false);

  return (
    <FuseButton
      label={archived ? "بازگردانی" : "بایگانی"}
      undoLabel="بازگرداندن"
      doneLabel="بایگانی شد"
      onCommit={() => setArchived(true)}
      onUndo={() => setArchived(false)}
    />
  );
}

// پنجره‌ی کوتاه‌تر — فیوز در دو ثانیه می‌سوزد
<FuseButton undoWindow={2000} label="حذف" doneLabel="حذف شد" fuseColor="#e5484d" />

// خطی روی لبه‌ی پایین، به‌جای حلقه‌ی دورِ قرص
<FuseButton fuse="bottom" fuseThickness={2} />

// ثبت فقط پس از پایانِ فیوز — بدونِ راهِ بازگرداندنِ میانِ راه
<FuseButton commitOn="fuseEnd" settle="stay" label="ارسال" doneLabel="ارسال شد" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | `"بایگانی"` | — | Label of the idle state. |
| `undoLabel` | `string` | `"بازگرداندن"` | — | Label of the armed state; until the fuse burns out the whole pill is the undo button. |
| `doneLabel` | `string` | `"بایگانی شد"` | — | Shown on the final face with a check, and announced to screen readers when arming. |
| `icon` | `ReactNode` | `undefined` | — | Idle icon; if omitted, the inline archive icon. |
| `color` | `string` | `"#f5f5f5"` | — | Ink of the label and icon; the streaks and undertones are derived from it. |
| `background` | `string` | `"#27272a"` | — | Surface of the pill. |
| `fuseColor` | `string` | `"#f5a524"` | — | The glowing line or ring. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Height of 36, 44, or 52 pixels with matching type and icon. |
| `radius` | `number` | `22` | — | Corner roundness, px; 22 is a full pill at the medium size. |
| `undoWindow` | `number` | `4000` | — | How many milliseconds the fuse burns and undo is offered. |
| `fuse` | `"outline" | "bottom" | "top"` (`outline` · `bottom` · `top`) | `"outline"` | — | The ring around the pill that burns clockwise, or a line on the bottom or top edge. |
| `fuseThickness` | `number` | `1.5` | — | Thickness of the line or of the ring's stroke, px. |
| `crossfadeMs` | `number` | `200` | — | Crossfade of the faces after a pointer press; the keyboard switches without a transition. |
| `commitOn` | `"press" | "fuseEnd"` (`press` · `fuseEnd`) | `"press"` | — | When `onCommit` is called: on press with undo as the way back, or only after the fuse ends. |
| `pauseOnHover` | `boolean` | `true` | — | Moving the mouse in and out freezes the fuse until the next pointer exit. |
| `settle` | `"reset" | "stay"` (`reset` · `stay`) | `"reset"` | — | After the fuse, go back to the initial state or stay on the done face to be mounted again. |
| `disabled` | `boolean` | `false` | — | Dims the idle face and ignores presses; undoing mid-fuse still works. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it alternately burns the fuse to the end and hits "Undo" mid-burn. Keep it off in normal use. |
| `onCommit` | `(reason: "press" | "fuseEnd") => void` | — | — | The main action — at the moment `commitOn` specifies. |
| `onUndo` | `() => void` | — | — | When undo or `Escape` takes the action back. |
| `onFuseEnd` | `() => void` | — | — | When the window closes without an undo. |
| `onPhaseChange` | `(phase: "idle" | "armed" | "settled") => void` | — | — | On every phase change. |
| `type` | `"button" | "submit" | "reset"` | `"button"` | — | Type of the idle button. |
| `className` | `string` | `""` | — | Extra class for the pill. |

## Tips

- `commitOn` determines the meaning of `label`: with `press` the label should state the action ("Delete"), while with `fuseEnd` it can be an invitation ("Press to delete").
- With `settle="stay"` the final face stays; to run it again you must mount the component again with a fresh `key` — the component itself follows the same contract.
- `pauseOnHover` only works with the mouse pointer; on touch, lifting the finger means the fuse continues — because touch has no notion of "hover".
- For an irreversible action, do not use `commitOn="fuseEnd"`; instead wait inside `onCommit`: with `press`, the user has a way back until the last moment.
- `disabled` does not close undo mid-fuse — this is deliberate: whoever started the action must be able to cancel it.
- The fuse burns with WAAPI, not CSS; so `undoWindow` is the physics of the motion, not just display duration. Shortening it really shortens the undo window.
- This component does not go right-to-left: the layout is centered and the fuse empties from the left as in the default. Only the texts are Persian.

