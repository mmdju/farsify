# Sling Button

A button that pulls like a slingshot; releasing flings the pad out of its seat and scatters particles.

- **Category:** Buttons
- **Interaction:** Drag and release / Keyboard
- **Dependencies:** `motion`
- **Live preview:** [https://farsifyui.ir/components/sling-button](https://farsifyui.ir/components/sling-button)
- **Install ID:** `sling-button`

## Install

```bash
npx shadcn@latest add @farsify/sling-button
```

Or copy `components/sling-button/sling-button.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import SlingButton from "@/components/farsify/sling-button";

/** چند میلی‌ثانیه «ارسال شد» بماند. */
const SENT_MS = 1400;

export function SendButton() {
  const [sending, setSending] = useState(false);

  return (
    <div className="relative inline-flex">
      <SlingButton
        ariaLabel="ارسال"
        disabled={sending}
        onSend={() => {
          setSending(true);
          setTimeout(() => setSending(false), SENT_MS);
          // دکمه هیچ بازخوردی نشان نمی‌دهد؛ این‌جا خودت پیام بگذار
        }}
      />
    </div>
  );
}

// کششِ محورِ عمودی، لنت بزرگ‌تر و پرتابی خشک‌تر
<SlingButton
  size={72}
  maxPull={260}
  armAt={64}
  axis="vertical"
  recoil={0.05}
  particles={0}
/>

// بدونِ ارسال با ضربه — فقط کشیدنِ مسلح می‌فرستد
<SlingButton tapSends={false} onSend={handleSend} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | — | The content of the pad. Defaults to an up arrow. |
| `onSend` | `() => void` | — | — | Called when releasing while armed, on a tap (if `tapSends` is on), and on Enter or Space. |
| `padColor` | `string` | `"#f5f5f5"` | — | The fill of the pad. |
| `iconColor` | `string` | `"#18181b"` | — | Color of the pad's content. |
| `accentColor` | `string` | `"#f5f5f5"` | — | The power arc, the arming band and the launch point. |
| `wellColor` | `string` | `"#27272a"` | — | The seat the pad rests on. |
| `bandColor` | `string` | `"#52525b"` | — | The band before arming. |
| `size` | `number` | `56` | — | Pad diameter, px. The seat, hit area and launch point scale with it too. |
| `strokeWidth` | `number` | `3` | — | Thickness of the arc and band, px. The band gets thinner as it stretches. |
| `armAt` | `number` | `48` | — | The distance at which the shot arms, px. |
| `maxPull` | `number` | `160` | — | How far the band stretches before it stops giving, px. |
| `launchSpeed` | `number` | `2600` | — | The speed the band adds on release, px/s. It determines how far past the seat the pad travels. |
| `recoil` | `number` | `0.2` | — | Bounce of the return spring; zero means no bounce. |
| `flight` | `number` | `120` | — | How far the leading point travels, px; the rest scatter around it. |
| `particles` | `number` | `14` | — | Number of launch particles. Each gets a random angle, range, size, drift, speed and delay. 1 means a single dot, zero means none. |
| `spread` | `number` | `60` | — | The cone the burst spreads within, in degrees, around the launch direction. |
| `axis` | `"any" | "horizontal" | "vertical"` (`any` · `horizontal` · `vertical`) | `"any"` | — | Free dragging, or one axis with a little play on the other axis. |
| `tapSends` | `boolean` | `true` | — | Whether a simple tap also sends; Enter always sends. |
| `disabled` | `boolean` | `false` | — | Dims the pad and ignores input. |
| `autoPreview` | `boolean` | `false` | — | Site preview only: it performs the pull, arm and release itself so the flight, the particles and the elastic return can be seen along the real path. |
| `ariaLabel` | `string` | `"ارسال"` | — | Accessible name of the button. |
| `className` | `string` | `""` | — | Extra class for the root. |

## Tips

- Dragging without releasing sends nothing — it doesn't arm until you pass `armAt`, and `onSend` isn't called.
- `armAt` and `maxPull` work together: the first says where it arms, the second caps the pull. If you bring `armAt` close to `maxPull`, the user has to pull all the way to fire.
- For a "send" button, set `armAt` at least larger than `size` so the arming motion extends beyond the pad and stays visible.
- Lower `recoil` (e.g. 0.05) for a dry, technical feel; raising it (near 0.3) makes the button more playful.
- This component shows no feedback of its own; handle `onSend` and add your own message or state (the site demo does this with a "Sent" label).
- Turn on `disabled` while sending so the user doesn't launch again.
- Set `particles` to zero if you want the pad to fly out without a burst; `spread` only matters when there are particles. `axis` only constrains the drag axis, not the launch — the launch is always along the drag direction.

