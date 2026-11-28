# Slide Commit

A button whose handle you must drag all the way to confirm; the result is shown with a spinner and then a success or rejection chip.

- **Category:** Buttons
- **Interaction:** Drag / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/slide-commit](https://farsifyui.ir/components/slide-commit)
- **Install ID:** `slide-commit`

## Install

```bash
npx shadcn@latest add @farsify/slide-commit
```

Or copy `components/slide-commit/slide-commit.tsx` and `components/slide-commit/slide-commit.css` from this repository into your project.

## Usage

```tsx
"use client";

import SlideCommit from "@/components/farsify/slide-commit";

export function PayButton() {
  return (
    <SlideCommit
      label="برای پرداخت بکشید"
      doneLabel="پرداخت شد"
      errorLabel="پرداخت انجام نشد"
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* با Promise: چرخنده نشان داده می‌شود، بعد از resolve */}
      {/* قرصِ سبز باز می‌شود و با reject تکان می‌خورد */}
      <SlideCommit
        label="برای حذف بکشید"
        doneLabel="حذف شد"
        errorLabel="حذف انجام نشد"
        successColor="#22c55e"
        dangerColor="#e5484d"
        onConfirm={async () => {
          const res = await fetch("/api/delete", { method: "POST" });
          if (!res.ok) throw new Error("حذف نشد");
        }}
        onDone={() => router.refresh()}
        onError={(reason) => console.error(reason)}
      />

      {/* موفقیتِ بی‌درنگ: بدون Promise، بی‌چرخنده و بی‌مکث */}
      <SlideCommit
        label="برای تأیید بکشید"
        width={220}
        height={48}
        radius={12}
        holdMs={0}
        onConfirm={() => setDone(true)}
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | `"برای پرداخت بکش"` | — | The text in the middle of the chip; it clears as you drag. |
| `doneLabel` | `ReactNode` | `"پرداخت شد"` | — | The text next to the check mark after confirmation. |
| `errorLabel` | `ReactNode` | `"پرداخت انجام نشد"` | — | Replaces the hint text, in the danger color, after a rejection. |
| `onConfirm` | `() => void | Promise<unknown>` | — | — | Called when the handle reaches the end. If it returns a Promise, a spinner is shown. |
| `onDone` | `() => void` | — | — | Called when the completed chip opens. |
| `onError` | `(reason: unknown) => void` | — | — | Called with the rejection reason; otherwise the component swallows it. |
| `trackColor` | `string` | `"#232323"` | — | The track behind the handle. |
| `handleColor` | `string` | `"#fafafa"` | — | The handle and the fill it drags; its arrow color is chosen for legibility over it. |
| `successColor` | `string` | `"#22c55e"` | — | The fill of the completed chip. |
| `dangerColor` | `string` | `"#e5484d"` | — | The handle and error text color after a rejection. |
| `width` | `number` | `280` | — | Track width; the travel distance scales with it. |
| `height` | `number` | `56` | — | Track height; the handle is 8 pixels smaller. |
| `radius` | `number` | `28` | — | Track corner radius; the handle corner is 4 pixels smaller so they stay concentric. |
| `speed` | `number` | `50` | — | Speed of opening and returning after release. |
| `returnBounce` | `number` | `0.38` | — | The energy left when returning to the home wall; zero means it stops immediately. |
| `landingDip` | `number` | `0.026` | — | How much the track dips when the completed chip lands; zero turns it off. |
| `holdMs` | `number` | `1500` | — | How long the completed chip stays before it collapses; zero means it stays until remount. |
| `disabled` | `boolean` | `false` | — | Dims it and ignores input. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it drags the handle to the end with animation and releases it; the rubber stretch and the spring return follow the real path. |
| `icon` | `ReactNode` | — | — | Replaces the arrow inside the handle. |
| `className` | `string` | `""` | — | Extra class for the root element. |

## Tips

- If `onConfirm` returns a Promise, a spinner is shown — that's the right way to wire it to the network. If it fails, the handle shakes and returns, so the user knows it didn't work without your page showing a separate message.
- The spinner deliberately stays for at least 300 milliseconds. Without that, a fast response would make it skip a frame and vanish, and the user would never see "in progress".
- Labels are UI, not data — they are shown on the chip itself, exposed as `aria-label` and announced in the live region. So keep them Persian; only change them if you supply your own label.
- Unlike most right-to-left components, **nothing here mirrors and nothing should**: all the geometry is physical and the arrow points the same way the handle moves. So the right key means "forward", exactly like the drag direction.
- `holdMs={0}` keeps the completed chip until the component remounts — for when you show the result somewhere else.

