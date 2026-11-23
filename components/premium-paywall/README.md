# Premium Paywall

A support card that lets the reader pick what to pay: a segmented plan switch, a price that rolls one digit at a time, and a detent slider that steps through five amounts with a caption that crossfades at every stop.

- **Category:** Showcase
- **Interaction:** Drag / Click / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/premium-paywall](https://farsifyui.ir/components/premium-paywall)
- **Install ID:** `premium-paywall`

## Install

```bash
npx shadcn@latest add @farsify/premium-paywall
```

Or copy `components/premium-paywall/premium-paywall.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { PremiumPaywall } from "@/components/farsify/premium-paywall";

export function SupportCard() {
  return <PremiumPaywall onContinue={() => openCheckout()} />;
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* مبلغ‌های خودت، به تومان و بدونِ جداکننده */}
      <PremiumPaywall
        annualPrices={[90000, 150000, 220000]}
        lifetimePrices={[240000, 400000, 600000]}
        captions={["یه قهوه.", "یه کتاب.", "یه اشتراکِ سال."]}
      />

      {/* شروع از پلهٔ چهارم، با گوشه‌های تیز و رنگِ برند */}
      <PremiumPaywall defaultStep={3} radius={10} accent="var(--color-brand)" />

      {/* دورهٔ یک‌باره، بدونِ جملهٔ زیرِ قیمت */}
      <PremiumPaywall defaultPlan="lifetime" showCaptions={false} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `plan` | `"annual" | "lifetime"` | — | — | Controlled plan; pass it together with `onPlanChange`, otherwise the switch never moves. |
| `defaultPlan` | `"annual" | "lifetime"` | `"annual"` | — | Plan on the first render in uncontrolled mode. |
| `step` | `number` | — | — | Controlled slider position, clamped into the caption range; pass it together with `onStepChange`. |
| `defaultStep` | `number` | `2` | — | Slider position on the first render in uncontrolled mode. |
| `annualPrices` | `number[]` | `[100000, 180000, 240000, 300000, 400000]` | — | Yearly amounts in Toman, one per slider step. |
| `lifetimePrices` | `number[]` | `[260000, 440000, 600000, 760000, 1000000]` | — | One-time amounts in Toman, one per slider step. |
| `captions` | `string[]` | `["با همین حمایت، خرج‌های اصلی سر جاش می‌مونه.", "کمک می‌کنی آروم و پیوسته بهتر بشیم.", "به‌روزرسانی‌های سنجیده رو ممکن می‌کنی.", "با حوصله و وسواس می‌سازیم؛ به لطف تو.", "چه حالی! داری کل مسیر رو حمایت می‌کنی."]` | — | One line shown under the price per slider step; its length is the number of steps. |
| `heading` | `ReactNode` | — | — | Card title; defaults to a two-line Persian heading. |
| `ctaLabel` | `string` | `"با نسخهٔ ویژه ادامه بده"` | — | Text of the action button. |
| `accent` | `string` | `"var(--primary)"` | — | Colour of the slider fill, the lit dots, the thumb core and the caption; defaults to the primary token. |
| `radius` | `number` | `28` | — | Corner rounding of the card, pixels. |
| `showCaptions` | `boolean` | `true` | — | Whether the line under the price is rendered. |
| `onContinue` | `() => void` | — | — | Called when the action button is pressed. |
| `onPlanChange` | `(plan: "annual" | "lifetime") => void` | — | — | Called with the new plan whenever the switch changes. |
| `onStepChange` | `(step: number) => void` | — | — | Called with the new slider position whenever it changes. |
| `className` | `string` | `""` | — | Extra class for the root card. |

## Tips

- The slider is mirrored for RTL: the cheapest amount sits at the reading start and the value grows toward the left; the direction is read from the DOM, so the same card keeps working inside an LTR page.
- Prices are plain numbers formatted with Persian digits and thousands separators at render time — pass real amounts such as 100000, not preformatted strings.
- `step` indexes `captions`, so the caption list sets the number of stops; prices past that point are never reachable.
- `plan` and `step` are controlled only when you pass them; pass the matching callback too, or clicking the switch and dragging the slider do nothing.
- Under `prefers-reduced-motion` every digit roll, blur and spring becomes an instant swap; the price, caption and fill still update immediately.

