# Stepper

Walk the user through steps one at a time; you can use numbers, dots, or bars as indicators, lay the flow out horizontally or vertically, and swap each step's content with a smooth transition.

- **Category:** Inputs
- **Interaction:** Click / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/stepper](https://farsifyui.ir/components/stepper)
- **Install ID:** `stepper`

## Install

```bash
npx shadcn@latest add @farsify/stepper
```

Or copy `components/stepper/stepper.tsx` and `components/stepper/stepper.css` from this repository into your project.

## Usage

```tsx
"use client";

import Stepper, { Step } from "@/components/farsify/stepper";

export function SignupFlow() {
  return (
    <Stepper width={440} linear>
      <Step title="حساب">
        <h3>ساخت حساب</h3>
        <p>ایمیل و گذرواژه‌ات را وارد کن.</p>
      </Step>
      <Step title="نمایه">
        <h3>نمایه‌ات را کامل کن</h3>
        <p>نام و عکسِ نمایه همین‌جا می‌نشیند.</p>
      </Step>
      <Step title="پایان">
        <h3>آماده‌ای!</h3>
        <p>حسابت ساخته شد.</p>
      </Step>
    </Stepper>
  );
}

// کنترل‌شده: گامِ جاری از بیرون می‌آید
<Stepper step={step} onStepChange={setStep} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | — | The steps; each inside a `<Step>` with a `title`, a `description`, and an optional `icon`. |
| `step` | `number` | — | — | If you want to own the current step yourself, pass this together with `onStepChange`; without it, the component starts from `initialStep`. |
| `initialStep` | `number` | `1` | — | The step shown first. |
| `onStepChange` | `(step: number) => void` | `() => {}` | — | Called every time the step changes. |
| `onFinalStepCompleted` | `() => void` | `() => {}` | — | When the last step is passed. |
| `indicator` | `"numbers" | "dots" | "bars"` (`numbers` · `dots` · `bars`) | `"numbers"` | — | The shape of the indicators in horizontal layout; vertical always uses numbers. |
| `orientation` | `"horizontal" | "vertical"` (`horizontal` · `vertical`) | `"horizontal"` | — | Indicators above the content or in a rail beside it; below 520 pixels the rail collapses on its own. |
| `transition` | `"slide" | "fade" | "none"` (`slide` · `fade` · `none`) | `"slide"` | — | How content moves between steps; the height eases in every mode too. |
| `linear` | `boolean` | `false` | — | Linear navigation: you can only go back to steps you have already reached. |
| `disableStepIndicators` | `boolean` | `false` | — | Turns off clicking on the indicators. |
| `renderStepIndicator` | `(props: StepIndicatorProps) => ReactNode` | — | — | Render your own custom indicator. |
| `showFooter` | `boolean` | `true` | — | Whether the back/next buttons are shown. |
| `backButtonText` | `string` | `"قبلی"` | — | Text of the back button; the default is Persian. |
| `nextButtonText` | `string` | `"ادامه"` | — | Text of the next button. |
| `completeButtonText` | `string` | `"پایان"` | — | Text of the next button on the final step. |
| `backButtonProps` | `ButtonHTMLAttributes` | `{}` | — | Extra props for the back button, such as `disabled`. |
| `nextButtonProps` | `ButtonHTMLAttributes` | `{}` | — | Extra props for the next button. |
| `completedContent` | `ReactNode` | — | — | Content that takes the place of the steps; if omitted, the buttons collapse and only the checks remain. |
| `theme` | `"dark" | "light"` | `"dark"` | — | Palette for the frame and controls; you can also override the colors from outside with the `--stepper-*` variables. |
| `accentColor` | `string` | — | — | Color of completed steps, the progress bar, and the next button; the text color on top is derived automatically from the color's lightness. |
| `frame` | `boolean` | `true` | — | The glass frame around the stepper. |
| `radius` | `number` | `24` | — | Corner roundness of the frame, in pixels. |
| `width` | `number | string` | `440` | — | Maximum width of the stepper. |
| `className` | `string` | `''` | — | Extra class for the root. |
| `style` | `CSSProperties` | — | — | Inline style for the root. |

## Tips

- If it is a real form, turn on `linear`; that way the user cannot jump from step 2 to 4, and only the steps they have reached are open.
- On mobile the layout becomes vertical and compact on its own; you do not need to write a media query.
- Provide `completedContent` so a finish screen takes the place of the steps; otherwise only the checks and indicators remain.
- Got several steppers one after another? Just change each one's `initialStep`; to sync with outside state, pass `step` and `onStepChange` as well.

