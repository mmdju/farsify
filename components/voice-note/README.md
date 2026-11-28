# Voice Note

A hold-to-record voice note: the pill opens into a live wave, sliding right throws the take away, and what you keep becomes a clip with a scrubbable wave.

- **Category:** Inputs
- **Interaction:** Hold / Drag / Keyboard
- **Dependencies:** `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/voice-note](https://farsifyui.ir/components/voice-note)
- **Install ID:** `voice-note`

## Install

```bash
npx shadcn@latest add @farsify/voice-note
```

Or copy `components/voice-note/voice-note.tsx` and `components/voice-note/voice-note.css` from this repository into your project.

## Usage

```tsx
"use client";

import { VoiceNote } from "@/components/farsify/voice-note";

export function Recorder() {
  return <VoiceNote />;
}

// ---------- نمونه‌های بیشتر ----------
export function DenseRecorder() {
  return (
    <VoiceNote
      bars={40}
      gain={85}
      bounce={20}
      corner={16}
      accentColor="#3b82f6"
    />
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `bars` | `number` | `28` | — | How many bars the wave is drawn with, clamped to 12 to 48. |
| `gain` | `number` | `60` | — | How tall a level draws, 0 to 100; at 0 the wave flattens to dots. |
| `bounce` | `number` | `40` | — | How far the pill overshoots the width it opens and closes to, 0 to 100; 0 widens without a bounce. |
| `corner` | `number` | `28` | — | Corner radius, px. The default is half the height, a full pill; the play disc follows the same curve. |
| `surfaceColor` | `string` | `"#232323"` | — | Pill surface. |
| `textColor` | `string` | `"#fafafa"` | — | Label, icons and the play disc, and the colour the pill's edge is mixed from. |
| `waveColor` | `string` | `"#8f8f94"` | — | The bars while recording and the recorded ones in the clip. |
| `accentColor` | `string` | `"#e5484d"` | — | The recording dot, and the mark once the take is armed for the throw. |
| `className` | `string` | `—` | — | Extra class for the wrapper. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it plays the interaction on its own. Leave it off in normal use. |

## Tips

- The level is a stand-in shaped like speech, so the component never asks for a microphone; swap it for a real recorder when the audio has to exist.
- A take shorter than 500ms is treated as a tap and dropped, and a recording stops itself at 30 seconds.
- Sliding back before letting go disarms the throw, so the same take is kept instead of discarded.
- The wave is `direction: ltr` on purpose: the time axis reads left to right as it does in every player, while the row around it stays right to left.
- `corner` above 28 is clamped to half the height; at 0 the pill squares off and the play disc squares with it.
- Under `prefers-reduced-motion` the width change and the play mark are instant.

