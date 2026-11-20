# Status Mark

A status glyph with five states — pending, running, done, failed, and cancelled — whose ring spins and finally lands on a check or a cross.

- **Category:** Loaders & status
- **Interaction:** Status-driven / autonomous
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/status-mark](https://farsifyui.ir/components/status-mark)
- **Install ID:** `status-mark`

## Install

```bash
npx shadcn@latest add @farsify/status-mark
```

Or copy `components/status-mark/status-mark.tsx` and `components/status-mark/status-mark.css` from this repository into your project.

## Usage

```tsx
"use client";

import { StatusMark, type StatusMarkStatus } from "@/components/farsify/status-mark";

export function BuildRow({ status, progress }: {
  status: StatusMarkStatus;
  progress: number;
}) {
  return (
    <StatusMark
      status={status}
      progress={progress}
      label="خروجیِ بیلد"
      size={20}
      fontSize={14}
    />
  );
}

// پیشرفت با درصدِ ۰ تا ۱۰۰ هم کار می‌کند، نه فقط نسبتِ ۰ تا ۱
<StatusMark status="running" progress={62} label="در حال آپلود" />

// بدونِ برچسب، فقط گلیف — با نامِ دسترس‌پذیرِ خودکار
<StatusMark status="done" doneColor="var(--color-brand)" />

// لغو‌شده با خط‌خوردگیِ دیرهنگام
<StatusMark status="cancelled" strike strikeDelay={120} label="درخواستِ منقضی" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `status` | `"pending" | "running" | "done" | "failed" | "cancelled"` (`pending` · `running` · `done` · `failed` · `cancelled`) | `"pending"` | — | The current state; each of the five states has its own Persian text. |
| `progress` | `number` | — | — | Only meaningful in `running`; 0 to 1 or 0 to 100 (values above 1 are read as a percentage). |
| `label` | `string` | — | — | The label next to the glyph; if omitted, only the glyph is shown. |
| `color` | `string` | `"currentColor"` | — | The primary color of the ring and the marks. |
| `doneColor` | `string` | `"#22c55e"` | — | The color of the completion check. |
| `errorColor` | `string` | `"#ef4444"` | — | The color of the cross for failure and cancellation. |
| `size` | `number` | `20` | — | The glyph's edge length, in pixels; the gap between the glyph and the text is half of this. |
| `strokeWidth` | `number` | `2` | — | Stroke thickness of the ring and the marks. |
| `dashes` | `number` | `8` | — | The number of dashes in the idle state. |
| `fontSize` | `number` | `14` | — | Label text size, in pixels. |
| `spinDuration` | `number` | `1100` | — | Duration of one indeterminate rotation, in milliseconds. |
| `arcLength` | `number` | `0.68` | — | Arc length in indeterminate mode, as a fraction of the circumference (0 to 1). |
| `drawDuration` | `number` | `240` | — | Duration of the check or cross being drawn, in milliseconds. |
| `fillOpacity` | `number` | `0.06` | — | Intensity of the circle fill on completion. |
| `strike` | `boolean` | `true` | — | Strike-through of the label in `done` and `cancelled`. |
| `strikeDelay` | `number` | `60` | — | Delay of the strike-through, in milliseconds. |
| `className` | `string` | `""` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style; it layers onto the component's variables. |

## Tips

- `progress` accepts two scales: a 0-to-1 ratio (as in the default) and a 0-to-100 percentage. If your own form holds a rounded percentage, pass the 0-to-100 value — it normalizes it for you.
- For a task list, give a stable label (such as "build output") rather than the status name: the status text is included automatically in the accessible name, and repeating it makes the screen reader say "done, done".
- The glyph is the first child of the root flex, so under `dir="rtl"` it sits on the right by itself and the text on the left — no new `order` or `flex-direction` is needed.
- With `prefers-reduced-motion`, the spin and draw are removed and the marks go straight to their final position; the state is still readable from the color and label.

