# Refine Frame

A media frame that takes an image from raw to complete with a mip pyramid — with no layout shift at all.

- **Category:** Loaders & status
- **Interaction:** Non-interactive (display only)
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/refine-frame](https://farsifyui.ir/components/refine-frame)
- **Install ID:** `refine-frame`

## Install

```bash
npx shadcn@latest add @farsify/refine-frame
```

Or copy `components/refine-frame/refine-frame.tsx` and `components/refine-frame/refine-frame.css` from this repository into your project.

## Usage

```tsx
"use client";

import RefineFrame from "@/components/farsify/refine-frame";

export function ImageResult() {
  const status = "generating"; // queued | generating | refining | complete | error

  return (
    <RefineFrame status={status} width={360} aspectRatio="4 / 3">
      <img src="/my-image.jpg" alt="نتیجه‌ی تولید" />
    </RefineFrame>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* قابِ بزرگ‌تر، بدونِ قرصِ وضعیت، با متنِ دلخواه */}
      <RefineFrame
        status="refining"
        width={480}
        showStatus={false}
        labels={{ refining: "در حال جزئیات" }}
      >
        <img src="/hero.jpg" alt="" />
      </RefineFrame>

      {/* حالتِ خطا با دکمه‌ی تلاشِ مجدد */}
      <RefineFrame status="error" onRetry={() => refetch()} retryLabel="دوباره بساز">
        <img src="/failed.jpg" alt="" />
      </RefineFrame>
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `status` | `"queued" | "generating" | "refining" | "complete" | "error"` (`queued` · `generating` · `refining` · `complete` · `error`) | `"generating"` | — | Current stage; advances the mip to the corresponding point. |
| `children` | `ReactNode` | — | — | The content image. It must be an `<img>` with a `src` for the pyramid to be built. |
| `aspectRatio` | `string` | `"4 / 3"` | — | Frame aspect ratio, in CSS form. |
| `width` | `number` | `320` | — | Frame width, in pixels. |
| `radius` | `number` | `16` | — | Corner rounding, in pixels. |
| `background` | `string` | `"#27272a"` | — | Background of the frame and of the status pill (the pill lays the same color, dimmed, over the image). |
| `color` | `string` | `"#f5f5f5"` | — | Ink color: the text and icon of the status pill, and the glowing sweep. |
| `stageDuration` | `number` | `400` | — | Transition duration of each stage, in milliseconds. |
| `sweep` | `boolean` | `true` | — | The diagonal glowing sweep and the shine on the advancing mip edge. |
| `showStatus` | `boolean` | `true` | — | Whether the status pill is shown. |
| `hideAfter` | `number` | `1200` | — | How long the pill stays in the "ready" state; zero means sample only. |
| `labels` | `Partial<Record<RefineFrameStatus, string>>` | — | — | Custom text for each status. |
| `retryLabel` | `string` | `"تلاش مجدد"` | — | Text of the retry button. |
| `onRetry` | `() => void` | — | — | If passed, the retry button appears in the error state. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- This component never changes the status itself — you pass `status`. If you get its value from a real request (e.g. polling an image-generation status), that is exactly what it was built for.
- The child must be a real `<img>`: the mip pyramid is built from the image's `naturalWidth`/`naturalHeight`. A div or video will not work.
- The stage order is `queued → generating → refining → complete`, and each step has a fixed share of the stack in `TARGET`; jumping from `queued` to `complete` passes the whole pyramid at once, which is also useful on error and recovery.
- In `status="error"` the image sits at `opacity: 0.28` with a blur so the content is visible but the "failed" scene comes across.
- With `prefers-reduced-motion` the jump happens directly (`rate = 1e9`) and the bands and shine turn off.

