# Voice Pill

A voice-recording button that opens like a messaging app: you hold it, it shows a waveform, and you slide aside to cancel.

- **Category:** Buttons
- **Interaction:** Hold / Drag / Keyboard
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/voice-pill](https://farsifyui.ir/components/voice-pill)
- **Install ID:** `voice-pill`

## Install

```bash
npx shadcn@latest add @farsify/voice-pill
```

Or copy `components/voice-pill/voice-pill.tsx` and `components/voice-pill/voice-pill.css` from this repository into your project.

## Usage

```tsx
"use client";

import VoicePill from "@/components/farsify/voice-pill";

export function VoiceNote() {
  return (
    <VoicePill
      mode="hold"
      ariaLabel="ضبط پیام صوتی"
      onStop={({ reason, duration }) =>
        console.log(reason, duration)
      }
    />
  );
}

// خاموش‌کردنِ لغو با کشیدن و ظاهرِ گوشه‌گرد
<VoicePill
  shape="rounded"
  size={52}
  slideToCancel={false}
  accentColor="var(--color-brand)"
  reactive="mic"
/>
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `accentColor` | `string` | `"#fafafa"` | — | Accent color of the recording state. |
| `iconColor` | `string` | `"#a3a3a3"` | — | Color of the microphone icon at rest. |
| `background` | `string` | `"#232323"` | — | Background color of the pill. |
| `size` | `number` | `40` | — | Diameter of the button in the closed state, in pixels. |
| `shape` | `VoicePillShape` (`pill` · `rounded`) | `"pill"` | — | Shape when open: pill or rounded. |
| `reach` | `number` | `12` | — | How far the pill opens ahead of the button. |
| `showTime` | `boolean` | `true` | — | Show the recording time. |
| `waveform` | `boolean` | `true` | — | Show the waveform. |
| `slideToCancel` | `boolean` | `true` | — | Cancel by sliding aside. |
| `cancelDistance` | `number` | `64` | — | How far you have to drag to cancel. |
| `attack` | `number` | `40` | — | How fast the wave reacts to louder sound, in milliseconds. |
| `release` | `number` | `240` | — | How fast the wave returns, in milliseconds. |
| `sensitivity` | `number` | `1` | — | Waveform sensitivity. |
| `floor` | `number` | `0.1` | — | The minimum height the wave bars have. |
| `openDuration` | `number` | `200` | — | Opening duration, in milliseconds. |
| `pressScale` | `number` | `0.95` | — | Button scale while pressed. |
| `mode` | `VoicePillMode` (`auto` · `hold` · `toggle`) | `"auto"` | — | Whether it works by holding or by a single tap. |
| `holdAfter` | `number` | `300` | — | In auto mode, how long a hold means recording. |
| `reactive` | `VoicePillSource` (`simulated` · `mic`) | `"simulated"` | — | Where the wave comes from: simulated or a real microphone. |
| `disabled` | `boolean` | `false` | — | Disable the button. |
| `ariaLabel` | `string` | `"ضبطِ صدا"` | — | Screen reader label. |
| `onStart` | `(info) => void` | — | — | When recording starts. |
| `onStop` | `(info) => void` | — | — | When recording ends; the reason comes with it. |
| `autoPreview` | `boolean` | `false` | — | Automatic waveform preview without interaction; for a showcase card. |
| `className` | `string` | `""` | — | Extra class on the root. |

## Tips

- mic mode needs a real microphone and the browser will ask for permission; for a demo, simulated mode is hassle-free.
- For a button that starts with one tap and ends with another, use toggle mode.
- If you turn off slide-to-cancel, the user can finish recording only by releasing.

