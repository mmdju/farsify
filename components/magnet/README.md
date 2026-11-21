# Magnet

Pulls any element toward the pointer: translation, 3D tilt and scale on a spring, plus a soft return when the pointer moves away.

- **Category:** Buttons
- **Interaction:** Hover / Pointer
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/magnet](https://farsifyui.ir/components/magnet)
- **Install ID:** `magnet`

## Install

```bash
npx shadcn@latest add @farsify/magnet
```

Or copy `components/magnet/magnet.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import Magnet from "@/components/farsify/magnet";

export function MagneticButton() {
  return (
    <Magnet padding={140} magnetStrength={2.4} tilt={6} scale={1.05}>
      <button className="rounded-full bg-black px-6 py-3 text-white">
        شروع کن
      </button>
    </Magnet>
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* چند آهنربای کنارِ هم: همه با هم میدان می‌سازند */}
      <Magnet exclusive={false} padding={90} maxOffset={18}>
        <span className="chip">خانه</span>
      </Magnet>

      {/* پیش‌نمایشِ بی‌تعامل (کارت/گالری): نشانگرِ خیالی مدار می‌زند */}
      <Magnet autoPreview padding={120}>
        <div className="card">…</div>
      </Magnet>
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | yes | The element that moves. The component has no appearance of its own; whatever you pass gets the motion. |
| `padding` | `number` | `100` | — | Pull reach from the element's edge, in pixels. Larger means it attracts from farther away. |
| `magnetStrength` | `number` | `2` | — | Pull strength; the offset is divided by this. 1 means it follows the pointer exactly, 3 means a third of the way. |
| `maxOffset` | `number` | — | — | Cap on the offset from the original position, in pixels. Omitting it means no cap. |
| `exclusive` | `boolean` | `true` | — | Only the closest magnet is pulled. Turn it off for adjacent groups so they build a field together. |
| `axis` | `"both" | "x" | "y"` (`both` · `x` · `y`) | `"both"` | — | Pull axis. |
| `tilt` | `number` | `0` | — | Maximum 3D tilt toward the pointer, in degrees. |
| `scale` | `number` | `1` | — | Scale during the pull. |
| `spring` | `MagnetSpring` | `{ stiffness: 170, damping: 16, mass: 1 }` | — | Spring parameters; more stiffness means a faster response, more damping means a calmer return. |
| `disabled` | `boolean` | `false` | — | Turns the pull off entirely. |
| `autoPreview` | `boolean` | `false` | — | When there is no pointer, a phantom pointer circles the element so the pull is visible in non-interactive previews too. A real pointer always takes precedence. |
| `onActiveChange` | `(active: boolean) => void` | — | — | Reports entering and leaving the field. |
| `wrapperClassName` | `string` | `''` | — | Class of the outer frame — the one that sits in the layout. |
| `innerClassName` | `string` | `''` | — | Class of the inner layer — the one that moves. |
| `style` | `CSSProperties` | — | — | Style of the outer frame (with normal HTML classes). |

## Tips

- No dependencies at all: the spring is solved on `requestAnimationFrame` and the loop puts itself to sleep once settled — zero CPU at rest.
- All magnets on the page share one `pointermove` listener; dozens of magnets do not multiply the cost.
- For an icon bar pass `exclusive={false}` so the whole bar bends toward the pointer, not just one icon.
- It does not move on touch (there is no pointer); if you want a mobile preview, turn on `autoPreview`.
- `maxOffset` is a layout safety net: without it an element near the center of the area can shift by up to half the distance.

