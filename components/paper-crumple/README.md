# Paper Crumple

An image that crumples like real paper when you hold it; you can drag it, and on release it either unfolds or keeps its creases, depending on your choice.

- **Category:** Showcase
- **Interaction:** Hold / Drag / Keyboard
- **Dependencies:** `three`, `@types/three`
- **Live preview:** [https://farsifyui.ir/components/paper-crumple](https://farsifyui.ir/components/paper-crumple)
- **Install ID:** `paper-crumple`

## Install

```bash
npx shadcn@latest add @farsify/paper-crumple
```

Or copy `components/paper-crumple/paper-crumple.tsx` and `components/paper-crumple/paper-crumple.css` from this repository into your project.

## Usage

```tsx
"use client";

import { useState } from "react";
import PaperCrumple from "@/components/farsify/paper-crumple";

export function CrumplableNote() {
  // تغییرِ resetKey کاغذ را به حالتِ اول برمی‌گرداند
  const [resetKey, setResetKey] = useState(0);

  return (
    <PaperCrumple
      src="/note.jpg"
      alt="یادداشتِ دست‌نویس"
      width={320}
      height={320}
      sceneHeight={460}
      releaseBehavior="creased" // restore | creased | stay
      creaseStrength={0.25}
      resetKey={resetKey}
      onStateChange={(state) => console.log(state)} // flat | holding | crumpled | creased
    />
  );
}

// پس از رهاکردن با "restore" کاغذ کاملاً باز می‌شود؛
// با "stay" مچاله می‌ماند تا resetKey عوض شود یا Escape بزنند
<PaperCrumple src="/note.jpg" releaseBehavior="stay" />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `src` | `string` | — | — | URL of the image the paper is built from. Required; the remote image must allow CORS. |
| `alt` | `string` | `""` | — | Alternative text for the image — used both for the fallback `<img>` and in the button's screen-reader label. |
| `backSrc` | `string` | `""` | — | Image for the back of the paper. If omitted, the paper's back is `paperColor`. |
| `width` | `number` | `320` | — | Paper width, in pixels. Together with `height` it sets the paper's aspect ratio. |
| `height` | `number` | `400` | — | Paper height, in pixels. |
| `sceneHeight` | `number` | `560` | — | Total scene height, in pixels. |
| `imageFit` | `"cover" | "contain"` (`cover` · `contain`) | `"cover"` | — | How the image fits on the paper. |
| `releaseBehavior` | `"stay" | "restore" | "creased"` (`stay` · `restore` · `creased`) | `"restore"` | — | What happens after release: stay crumpled, fully unfold, or unfold while keeping some creases. |
| `crumpleAmount` | `number` | `0.85` | — | How much it crumples, 0 to 1. Holding longer does not increase it — it is the fixed target of the spring. |
| `crumpleDuration` | `number` | `0.55` | — | Crumple duration, in seconds. |
| `releaseDuration` | `number` | `0.4` | — | Unfold duration after release, in seconds. |
| `foldCount` | `number` | `6` | — | Number of fold guides; more means finer creases. 3 to 16. |
| `foldSharpness` | `number` | `0.6` | — | Crispness of the edges; 1 is like an ironed fold, 0 is soft and wavy. |
| `wrinkleDepth` | `number` | `0.65` | — | Depth of the wrinkles; above 1 is exaggerated. |
| `creaseStrength` | `number` | `0.18` | — | With `releaseBehavior="creased"`, how much of the crumpling stays in the paper. |
| `paperColor` | `string` | `"#f4f0e8"` | — | Color of the paper's back and edges; the front is the image, so it is mostly visible inside the folds. |
| `roughness` | `number` | `0.92` | — | Surface roughness for lighting; 1 is fully matte. |
| `paperTexture` | `number` | `0.08` | — | Intensity of the paper grain (fine bump). |
| `lightIntensity` | `number` | `1.8` | — | Directional light intensity; zero means ambient light only. |
| `lightAngle` | `number` | `-35` | — | Light angle, in degrees; light comes from this side so the folds cast shadows. |
| `shadow` | `boolean` | `true` | — | Enable a soft shadow under the paper. |
| `shadowOpacity` | `number` | `0.08` | — | Shadow opacity; 0 means almost none. |
| `draggable` | `boolean` | `true` | — | While holding, the paper moves with the pointer. |
| `dragRotation` | `number` | `10` | — | How much it tilts while dragging, in degrees; maximum 60. |
| `dragRadius` | `number` | `180` | — | Movement radius from the center, in pixels. |
| `returnToOrigin` | `boolean` | `true` | — | Return to the center after release (unless `stay`). |
| `rotation` | `number` | `0` | — | Permanent rotation of the paper, in degrees. |
| `seed` | `number` | `7` | — | Random seed for the folds; each number gives a fresh crumple pattern. |
| `detail` | `number` | `64` | — | Mesh density; more means softer folds and heavier computation. Changing it rebuilds the scene. |
| `disabled` | `boolean` | `false` | — | Disables input and reverts a half-finished crumple. |
| `resetKey` | `number | string` | — | — | Changing it returns the paper to its initial state — for external resets. |
| `onStateChange` | `(state) => void` | — | — | On every state transition: `flat` / `holding` / `crumpled` / `creased`. |
| `onError` | `(error: Error) => void` | — | — | Called if WebGL is unavailable or the image fails to load; the component falls back to a plain image itself. |
| `autoPreview` | `boolean` | `false` | — | Automatic crumple preview without any interaction. |
| `className` | `string` | `""` | — | Extra class on the root. |
| `style` | `CSSProperties` | `{}` | — | Inline styles on the root. |

## Tips

- This component **does not get RTL, and does not need to**: the 3D scene is symmetric; only the labels and screen-reader states are Persian.
- The front image comes from `src` and the back color from `paperColor` — inside the crumple folds the paper's back shows through the creases, so a back color that differs from the image makes the crumpling more legible.
- `releaseBehavior="creased"` is great for "notes that get worn": keep `creaseStrength` low so it only creases a little more each time.
- With `releaseBehavior="stay"` the paper stays crumpled until you change `resetKey` or the user presses `Escape` — for games and one-off effects.
- This component is **the archive's only dynamic-import demo**: `three` is loaded with `next/dynamic` only on this page and the rest of the site stays free of it. If the page feels slow, lower `detail` — fold computation scales with it exponentially.
- Motion-sensitive users are not left out either: with `prefers-reduced-motion` the crumple and unfold become instant but the hold and drag logic stays intact, and if WebGL is unavailable it shows a plain image and calls `onError`.

