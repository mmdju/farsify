# Countdown Delete

A destructive-action button that morphs from a red "delete account" pill into a soft "cancel deletion" pill with a live Persian-digit countdown, and reverts on its own when the countdown ends.

- **Category:** Buttons
- **Interaction:** Click
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/countdown-delete](https://farsifyui.ir/components/countdown-delete)
- **Install ID:** `countdown-delete`

## Install

```bash
npx shadcn@latest add @farsify/countdown-delete
```

Or copy `components/countdown-delete/countdown-delete.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { CountdownDelete } from "@/components/farsify/countdown-delete";

export function DangerZone() {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="text-sm text-neutral-500">این کنش برگشت‌ناپذیر است</span>
      <CountdownDelete
        countdown={5}
        onCountdownEnd={() => deleteAccount()}
      />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* رنگِ حذف را عوض کن (سطحِ لغو هم‌خانواده می‌ماند) */}
      <CountdownDelete deleteColor="#e11d48" onCountdownEnd={remove} />

      {/* شمارشِ کوتاه‌تر برای کارهای سبک‌تر */}
      <CountdownDelete
        deleteLabel="پاک‌کردن تاریخچه"
        cancelLabel="لغو پاک‌سازی"
        countdown={3}
        onCountdownEnd={clearHistory}
      />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `deleteLabel` | `string` | `"حذف حساب کاربری"` | — | Label on the red pill before the countdown starts. |
| `cancelLabel` | `string` | `"لغو حذف"` | — | Label shown between the countdown chip and the undo icon while the countdown runs. |
| `countdown` | `number` | `10` | — | Seconds the cancel state lasts before it counts as done; clamped to at least 1. |
| `deleteColor` | `string` | `"#e5484d"` | — | Color of the delete pill, the undo circle, the countdown chip and the cancel label. |
| `softColor` | `string` | `"#fdecec"` | — | Background of the cancel pill while the countdown runs. |
| `onCountdownEnd` | `() => void` | — | — | Fires once when the countdown reaches zero, right before the button reverts to its delete state. Hand the actual deletion work to this. |
| `autoPreview` | `boolean` | `false` | — | Site preview only — the button counts down to zero and returns by itself. Leave it off in normal use; `onCountdownEnd` never fires while it runs. |
| `className` | `string` | — | — | Extra class for the root box. |

## Tips

- This is a two-step delete: the first click only arms the countdown and every second of it stays cancelable — gentler than a confirm dialog for irreversible actions.
- Do the real deletion in `onCountdownEnd`; the component reverts to its delete state on its own and does not wait on you.
- Keep the countdown short (3 to 10 seconds): long waits read as the app being stuck.
- Match `deleteColor` to your danger token and pick a `softColor` that is a light tint of it, so the cancel state still whispers the same danger.
- Under `prefers-reduced-motion` the morph, the word cascade and the fades all become instant swaps; only the countdown itself keeps ticking.

