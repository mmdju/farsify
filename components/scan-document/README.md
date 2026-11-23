# Scan Document Button

A scan button that folds open a small paper card while it works: the card rises from the bottom, flips twice on its vertical axis and an orange beam sweeps across it, then the button reports the result and falls back to its resting state.

- **Category:** Loaders & status
- **Interaction:** Click / Timed
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/scan-document](https://farsifyui.ir/components/scan-document)
- **Install ID:** `scan-document`

## Install

```bash
npx shadcn@latest add @farsify/scan-document
```

Or copy `components/scan-document/scan-document.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { ScanDocument } from "@/components/farsify/scan-document";

export function ReceiptScan() {
  return <ScanDocument onComplete={() => upload()} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* اسکنِ کوتاه‌تر با متنِ خودت */}
      <ScanDocument
        duration={2500}
        labels={{
          idle: "اسکن رسید",
          scanning: "در حال خواندن",
          done: "رسید ثبت شد",
        }}
      />

      {/* رویدادِ پایان، برای رفتن به قدمِ بعد */}
      <ScanDocument onComplete={() => goToStep(2)} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autoPreview` | `boolean` | `false` | — | Site preview only - starts a full scan, lets it finish and its reset land, then starts again. Leave it off in normal use. |
| `labels` | `Partial<Record<ScanStatus, string>>` | `{ idle: "اسکن سند", scanning: "در حال اسکن", done: "انجام شد" }` | — | Replacement text for any of the three states; the missing keys keep their Persian default. |
| `duration` | `number` | `5000` | — | Length of the scan in milliseconds; the beam and the card flip are timed from it. |
| `onComplete` | `() => void` | — | — | Called once the scan ends, before the button falls back to its resting state. |
| `className` | `string` | `""` | — | Extra class for the block that holds the card and the button. |

## Tips

- The card is decorative and hidden from assistive technology, so the status lives on the button label; give `labels` text that reads on its own.
- `duration` only changes the visible scan length, so a long run still ends the same way and still fires `onComplete` once.
- Under prefers-reduced-motion the scan is capped at under a second no matter what `duration` says.
- The card is a fixed 110×150 box, so it fits inside a layout that already reserves about 170px of height above the button.
- The button is disabled for the whole run to stop a second click from restarting the animation mid-flight.

