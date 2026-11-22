# Save Button

A save button that owns its own state: a muted saving face with a spinning badge, then a green tick when the save lands, then back to idle.

- **Category:** Buttons
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/save-button](https://farsifyui.ir/components/save-button)
- **Install ID:** `save-button`

## Install

```bash
npx shadcn@latest add @farsify/save-button
```

Or copy `components/save-button/save-button.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import SaveButton from "@/components/farsify/save-button";

export function SaveDraft() {
  async function save() {
    await fetch("/api/draft", { method: "PUT" });
  }

  return <SaveButton onSave={save} />;
}

// Custom copy and colors
<SaveButton
  onSave={save}
  idleLabel="ثبت تغییرات"
  loadingLabel="در حال ثبت"
  successLabel="ثبت شد"
  backgroundColor="#18181b"
  textColor="#fafafa"
/>

// A form that is not ready yet
<SaveButton onSave={save} disabled />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `onSave` | `() => void \| Promise<void>` | — | — | Called when the button is pressed. Return a promise and the loading state lasts exactly until it settles; a rejection returns the button to idle. |
| `idleLabel` | `string` | `"ذخیره"` | — | Label in the idle state. |
| `loadingLabel` | `string` | `"در حال ذخیره"` | — | Label while the save is running. |
| `successLabel` | `string` | `"ذخیره شد"` | — | Label after a successful save. |
| `loadingMs` | `number` | `1200` | — | How long the loading state lasts when `onSave` returns nothing. |
| `successMs` | `number` | `2000` | — | How long the success state stays before the button returns to idle, milliseconds. |
| `backgroundColor` | `string` | `"#232323"` | — | Button surface. |
| `textColor` | `string` | `"#fafafa"` | — | Label and icon color. |
| `successColor` | `string` | `"#22c55e"` | — | Badge color in the success state. |
| `disabled` | `boolean` | `false` | — | Dims the button and blocks input. |
| `ariaLabel` | `string` | — | — | Accessible name, for when you do not want the visible label alone to name the button. |
| `className` | `string` | — | — | Extra class for the root wrapper. |

## Tips

- Return a promise from `onSave` and the loading state lasts exactly as long as the request; the built-in timer is only a stand-in for prototypes.
- A rejected promise drops the button back to idle without a success flash. Show the error yourself from inside `onSave`.
- The labels animate word by word, never letter by letter: splitting Persian letters across elements breaks their joining.
- Colors default to the neutral dark pill; `backgroundColor` and `textColor` accept any CSS color, a theme variable included.
- The badge sits on the inline-end corner and its ring separates it from the page, so keep the badge inside the root wrapper when you restyle it.
