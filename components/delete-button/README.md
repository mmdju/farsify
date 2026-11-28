# Delete Button

A trash-can button that opens on click with the two options "Confirm" and "Cancel" unfolding beside it; the bin's lid flips up and, after deletion, a check settles in.

- **Category:** Buttons
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/delete-button](https://farsifyui.ir/components/delete-button)
- **Install ID:** `delete-button`

## Install

```bash
npx shadcn@latest add @farsify/delete-button
```

Or copy `components/delete-button/delete-button.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { DeleteButton } from "@/components/farsify/delete-button";

export function ReportRow({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 truncate text-sm">گزارشِ ماهانه</span>
      <DeleteButton
        onConfirm={() => remove(id)}
        onCancel={() => console.log("لغو شد")}
      />
    </div>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* رنگِ تأیید را عوض کن (هر مقدارِ CSS قبول است) */}
      <DeleteButton accent="#e11d48" onConfirm={remove} />

      {/* وقتی حذف مجاز نیست */}
      <DeleteButton disabled />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `accent` | `string` | `"#e5484d"` | — | Color of the confirm check and the large check after deletion — the button's only touch of color. |
| `disabled` | `boolean` | `false` | — | Dims the button and makes it inert; it neither opens nor has auto-preview. |
| `autoPreview` | `boolean` | `false` | — | For the site preview only: it opens itself, confirms, and starts over. Leave it off in normal use. |
| `onConfirm` | `() => void` | — | — | When confirm is pressed; at the moment the check settles. Hand the actual deletion work to this. |
| `onCancel` | `() => void` | — | — | Called by the cross, a second click on the bin, or Escape. |
| `className` | `string` | — | — | Extra class for the root box (whose width changes as it opens). |

## Tips

- This button is safer than a single-step button for an irreversible action: the first click only opens the panel and the decision is made with the second click.
- Make `onConfirm` only persist data; the closing animation and the button's return are handled by the component and it will not wait on you.
- Outside clicks deliberately do not close the panel — so an accidental click cannot change the user's decision. If you want that behavior, manage it yourself with an `onClick` on the parent.
- The panel always opens on the `start` side — in Persian, **to the right of the button** — and the button stays at `end`; the panel's tab and the bin lid's hinge align with the same direction. Do not reposition either of them by hand.
- Under `prefers-reduced-motion` all motion is zeroed, but the open/closed logic and the timing of the final state stay intact.

