# Lattice Loader

A grid of tiny cells that runs through preset patterns and finally settles into a check or a cross, with a label and an elapsed-time counter.

- **Category:** Loaders & status
- **Interaction:** State-driven / Autonomous
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/lattice-loader](https://farsifyui.ir/components/lattice-loader)
- **Install ID:** `lattice-loader`

## Install

```bash
npx shadcn@latest add @farsify/lattice-loader
```

Or copy `components/lattice-loader/lattice-loader.tsx` and `components/lattice-loader/lattice-loader.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  LatticeLoader,
  type LatticeLoaderStatus,
} from "@/components/farsify/lattice-loader";

/** چند میلی‌ثانیه تا رسیدنِ پاسخ. */
const ANSWER_MS = 1600;

export function ThinkingRow() {
  const [status, setStatus] = useState<LatticeLoaderStatus>("working");

  useEffect(() => {
    const timer = setTimeout(() => setStatus("done"), ANSWER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LatticeLoader
      status={status}
      pattern="orbit"
      label="در حال فکر"
      doneLabel="انجام شد در"
      errorLabel="شکست پس از"
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* شبکه‌ی ۴×۴ با هاله — برای پس‌زمینه‌ی روشن */}
      <LatticeLoader status="working" grid={4} pattern="pulse" glow glowColor="var(--color-brand)" />

      {/* الگوی اختصاصی: هر عدد یعنی خانه‌ای که با آن تأخیر روشن می‌شود، */}
      {/* null یعنی خانه‌ای که هرگز روشن نمی‌شود */}
      <LatticeLoader
        pattern={{ cells: [0, 2, null, 4, 1, 3, null, 5, 0], loop: 6, scale: 1.2 }}
        cellSize={8}
        gap={3}
      />

      {/* زمان از بیرون می‌آید و کرنومترِ داخلی خاموش می‌شود */}
      <LatticeLoader status={status} elapsed={1.4} showTimer />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | `"در حال فکر"` | — | Label for the working state. |
| `doneLabel` | `string` | `"انجام شد در"` | — | The label that comes before the finish time. |
| `errorLabel` | `string` | `"شکست پس از"` | — | The label that comes before the failure time. |
| `status` | `"working" | "done" | "error"` (`working` · `done` · `error`) | `"working"` | — | The current status. |
| `pattern` | `string | LatticePattern` | `"orbit"` | — | Name of a preset pattern, or a custom pattern with a `cells` array. |
| `grid` | `number` (`3` · `4`) | `3` | — | Grid size; any value other than 4 is rounded to 3. |
| `shape` | `"square" | "round"` (`square` · `round`) | `"round"` | — | Shape of the cells. |
| `color` | `string` | `"currentColor"` | — | Color of the cells in the working state. |
| `doneColor` | `string` | `"#22c55e"` | — | Color of the finish mark. |
| `errorColor` | `string` | `"#ef4444"` | — | Color of the failure mark. |
| `cellSize` | `number` | `6` | — | Side of each cell, in pixels. |
| `gap` | `number` | `2` | — | Spacing between cells, in pixels. |
| `fontSize` | `number` | `14` | — | Text size in pixels; the gap between grid and label is derived from it too. |
| `step` | `number` | `90` | — | Duration of one unit, in milliseconds; the whole cycle = `loop × step × scale`. |
| `idleOpacity` | `number` | `0.15` | — | Brightness of the cells that are off. |
| `glow` | `boolean` | `true` | — | Glow halo behind the lit cells. |
| `glowColor` | `string` | `""` | — | Halo color; empty means the same color as the cell. |
| `showTimer` | `boolean` | `true` | — | Whether the elapsed-time counter is shown. |
| `elapsed` | `number` | — | — | Elapsed time in seconds; if provided, the internal counter is turned off. |
| `className` | `string` | `""` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style; it rides on the component's variables. |

## Tips

- `doneLabel` and `errorLabel` come **before** the time and the counter sits behind them, so it reads "done in 1.4 seconds"; if you know the number of steps, pass `elapsed` so the time comes from your own source instead of the component's stopwatch.
- You get ten preset patterns and each only makes sense on some grids: `arrow`/`dots`/`ripple`/`spiral` only on 3×3 and `sweep`/`spin`/`rain`/`pulse` only on 4×4. `orbit` and `snake` have both. If a pattern is not available for the requested grid, it falls back to that grid's default automatically.
- For a custom pattern, pass an object instead of a name: `pattern={{ cells: [...], loop: 5, scale: 1.2 }}`. An array shorter than the grid is padded with holes automatically and a longer one is trimmed; `null` means a cell that never lights up.
- For a light, low-contrast grid turn on `glow` and give `glowColor` your brand color — since the cells are tiny, the halo is the only thing you notice at first glance.
- The whole motion is in CSS, not in JavaScript; only the counter advances on a 100 ms timer. So dozens of loaders on one page carry no noticeable cost.
- The end time is announced from `performance.now()` rather than from ticking a count; if the browser sleeps the tab, the counter does not lag behind.

