# ThemeSelector

Two small cards, each showing a theme as a miniature preview of a browser window; click either one or move with the arrow keys and the selection ring settles on it while its label lights up.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/theme-selector](https://farsifyui.ir/components/theme-selector)
- **Install ID:** `theme-selector`

## Install

```bash
npx shadcn@latest add @farsify/theme-selector
```

Or copy `components/theme-selector/theme-selector.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import { ThemeSelector } from "@/components/farsify/theme-selector";

export function ThemePicker() {
  const [theme, setTheme] = useState<string | null>("dark");

  return <ThemeSelector value={theme} onChange={setTheme} />;
}

// نام‌کنترل‌شده — گزینه‌ی نخست انتخاب است؛ برچسب‌ها هم اختیاری‌اند
<ThemeSelector defaultValue="light" labels={false} />

// پالتِ خودت — هر گزینه شش رنگِ نقاشیِ پیش‌نمایش را می‌گیرد
<ThemeSelector
  themes={[
    {
      value: "midnight",
      label: "نیمه‌شب",
      colors: {
        sidebar: "#1C1C1E",
        panel: "#111112",
        border: "transparent",
        strong: "#4A4A50",
        muted: "#2C2C30",
        tile: "#232326",
      },
    },
    {
      value: "paper",
      label: "کاغذ",
      colors: {
        sidebar: "#FAFAFC",
        panel: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.06)",
        strong: "#D6D6DE",
        muted: "#EBEBF0",
        tile: "#F2F2F6",
      },
    },
  ]}
  itemClassName="w-56"
/>

// پیش از آن‌که تمِ کاربر معلوم شود — هیچ گزینه‌ای انتخاب نیست و همه با tab در دسترس‌اند
<ThemeSelector value={null} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `themes` | `ThemeOption[]` | `DEFAULT_THEMES` | — | The theme options; each has a `value`, a label, and a six-color palette for painting the preview (sidebar/panel/border/strong/muted/tile). You can supply your own palette. |
| `value` | `string | null` | — | — | Controlled value; `undefined` means the component holds its own state, and `null` means controlled with nothing selected (for example before the theme is known on the client). |
| `defaultValue` | `string` | `themes[0].value` | — | The initially selected option in uncontrolled mode; if you do not pass it, the first option is selected. |
| `onChange` | `(value: string) => void` | — | — | Called on every new selection; in controlled mode it is the only way to learn about the user's choice. |
| `labels` | `boolean` | `true` | — | Show the Persian label ("Dark"/"Light") under each card; the label lights up when selected. |
| `disabled` | `boolean` | `false` | — | Dims the whole group and makes it ignore the pointer and the keyboard (`aria-disabled` is set too). |
| `itemClassName` | `string` | — | — | Extra class for each option's button — for example, to change the width of the cards. |
| `className` | `string` | — | — | Extra class for the group container (it sits on `flex gap-5`). |

## Tips

- Besides clicking and the arrows, `Home` selects the first option and `End` the last — standard radiogroup behavior, which this component has too.
- If you pass `value={null}` nothing is selected and all options stay reachable with Tab; it is made for the "the user's theme is not known yet" case.
- The previews are drawn with the `cqw` unit against a container query; the bigger the card, the bigger the drawing, without stretching — for larger cards just pass `itemClassName="w-56"`.
- The arrows are physical (`ArrowRight` is the next option), as per the default; the cards, however, lay out right-to-left in RTL, and the inner drawing keeps its default shape with `dir="ltr"`.
- The colors inside each `ThemeOption` are drawing data and stay as hex (intentionally); the component's own frame (card surface, label ink, focus ring) reads from the site tokens.
- With `prefers-reduced-motion` the transitions of the rings and labels are turned off; the selection moves instantly without motion.

