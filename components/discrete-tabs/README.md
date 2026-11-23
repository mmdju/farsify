# Discrete Tabs

A row of icon pills where the active one widens to reveal its label: the pills reflow with a spring while the label materialises out of a blur.

- **Category:** Navigation
- **Interaction:** Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/discrete-tabs](https://farsifyui.ir/components/discrete-tabs)
- **Install ID:** `discrete-tabs`

## Install

```bash
npx shadcn@latest add @farsify/discrete-tabs
```

Or copy `components/discrete-tabs/discrete-tabs.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { DiscreteTabs } from "@/components/farsify/discrete-tabs";

export function SectionSwitch() {
  return <DiscreteTabs onChange={(id) => setSection(id)} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* تب‌های خودت؛ هر تب آیکنِ خودش را دارد */}
      <DiscreteTabs
        defaultActive="files"
        tabs={[
          { id: "files", title: "فایل‌ها", icon: Folder },
          { id: "shared", title: "اشتراکی", icon: Users },
        ]}
      />

      {/* ردیفِ کوچک‌تر با رنگِ برند */}
      <DiscreteTabs size="sm" accent="var(--color-brand)" />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `tabs` | `DiscreteTabsItem[]` | `سه تبِ نمونه` | — | The pills, in reading order; each entry has an `id`, a Persian `title` and an optional `icon` component. |
| `active` | `string` | — | — | Controlled active id; pass it together with `onChange`, otherwise clicking does nothing. |
| `defaultActive` | `string` | — | — | Active id on the first render in uncontrolled mode; defaults to the first tab. |
| `onChange` | `(id: string) => void` | — | — | Called with the id of the pill that was picked. |
| `accent` | `string` | `"var(--foreground)"` | — | Colour of the active pill's icon and label; the foreground token keeps it readable in both themes. |
| `size` | `"sm" | "md" | "lg"` | `"md"` | — | Icon size, padding and label size of every pill. |
| `className` | `string` | `""` | — | Extra class for the row. |

## Tips

- Labels appear only on the active pill, so give every tab a `title` and an `icon`; the title is also the button's accessible name for the collapsed pills.
- The row is a plain flex container, so in RTL the first tab sits on the right with no extra work — pass the tabs in reading order.
- `accent` defaults to the foreground token rather than a fixed colour so the active label stays readable when the page switches themes.
- Widths animate through real layout values, not scale transforms, so the labels never stretch while the row reflows.
- Under `prefers-reduced-motion` the row resizes instantly and the label skips the blur; the active state and the colour change stay.

