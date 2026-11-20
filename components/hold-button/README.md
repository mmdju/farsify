# Hold Button

A button that only fills while held; releasing early empties it, and the fill edge advances with a water ripple.

- **Category:** Buttons
- **Interaction:** Hold / Keyboard / Touch
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/hold-button](https://farsifyui.ir/components/hold-button)
- **Install ID:** `hold-button`

## Install

```bash
npx shadcn@latest add @farsify/hold-button
```

Or copy `components/hold-button/hold-button.tsx` and `components/hold-button/hold-button.css` from this repository into your project.

## Usage

```tsx
"use client";

import HoldButton from "@/components/farsify/hold-button";

export function DeleteAccount() {
  return (
    <HoldButton
      holdTime={2000}
      onHold={() => deleteAccount()}
      onTap={() => toast("برای حذف، نگه دارید")}
    >
      برای حذف نگه دارید
    </HoldButton>
  );
}

// کنشِ دیگر و متنِ تمام‌شده‌ی خودش — رهاشده پس از تأیید، روی «ارسال شد» می‌ماند
<HoldButton doneLabel="ارسال شد" resetAfter={0}>
  برای ارسال نگه دارید
</HoldButton>

// دکمه‌ی بلند و باریک: پر شدن از پایین، موجِ افقی، بی‌هاله
<HoldButton
  size="lg"
  radius={999}
  fillDirection="up"
  waveAmplitude={10}
  glow={false}
  pressScale={0.94}
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | `"برای حذف نگه دار"` | — | The button text in the normal state. |
| `doneLabel` | `ReactNode` | `"حذف شد"` | — | The button text after the hold completes. |
| `icon` | `ReactNode` | — | — | Optional icon beside the normal text. |
| `doneIcon` | `ReactNode` | — | — | Optional icon beside the done text. |
| `backgroundColor` | `string` | `"#27272a"` | — | Background of the button. |
| `fillColor` | `string` | `"#5227FF"` | — | Color of the fill and the glow. |
| `textColor` | `string` | `"#f5f5f5"` | — | Text color in the normal state. |
| `fillTextColor` | `string` | `"#ffffff"` | — | Text color over the filled part. |
| `size` | `"sm" | "md" | "lg"` (`sm` · `md` · `lg`) | `"md"` | — | Height and font size: 36 / 44 / 52 pixels. |
| `radius` | `number` | `14` | — | Corner radius, pixels. |
| `fillDirection` | `"right" | "up"` (`right` · `up`) | `"right"` | — | Fill direction. In RTL, "right" is still the start edge and it does not flip. |
| `holdTime` | `number` | `2000` | — | How many milliseconds to hold for confirmation. |
| `releaseTime` | `number` | `200` | — | Duration of emptying after release or when returning to idle. |
| `pressScale` | `number` | `0.97` | — | Button scale while holding with the pointer. |
| `wave` | `boolean` | `true` | — | Toggles the ripple on the fill edge. |
| `waveAmplitude` | `number` | `6` | — | Wave amplitude, pixels. |
| `glow` | `boolean` | `true` | — | Glow around the button while holding and when done. |
| `resetAfter` | `number` | `1200` | — | How many milliseconds after confirming to return to idle; zero means never. |
| `disabled` | `boolean` | `false` | — | Dims and ignores input. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it runs the full hold-and-release cycle itself so the fill and the springy pop can be seen. |
| `onHold` | `() => void` | — | — | Called when the hold completes. |
| `onTap` | `() => void` | — | — | Called when the release came before 250 milliseconds (a tap). |
| `className` | `string` | `""` | — | Extra class for the root element. |

## Tips

- Use `onHold` for the final action and `onTap` for a guidance message ("Hold to delete") — keep the two apart, and a tap never counts as confirmation.
- Do not set `holdTime` shorter than 600ms; below that a tap and a hold cannot be told apart and the user deletes without meaning to. The component itself defaults to 2000ms.
- If you want the button to stay on "Deleted" after confirming, pass `resetAfter={0}` — otherwise it returns to idle after 1200ms. For list rows, zero is usually the right choice.
- In Persian the fill direction does not flip: `fillDirection="right"` fills from the start edge of the sentence, which is what a Persian reader's eye expects; use "up" for tall and narrow buttons.
- The screen-reader text is generated automatically from `holdTime` ("Hold for 2 seconds to confirm") and announced with Persian digits; for actions other than delete, change `children` and `doneLabel` — you do not need to supply the assistive text by hand.
- With `prefers-reduced-motion` the ripple and pulse turn off and the fill is shown only by a change in opacity; the hold logic and timing stay untouched.

