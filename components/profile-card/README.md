# Profile Card

A holographic profile card with spring tilt under the pointer, a patternable holo layer, light glare and parallax depth — plus a status indicator and a contact button.

- **Category:** Showcase
- **Interaction:** Hover / Touch / Gyroscope
- **Dependencies:** none
- **Live preview:** [https://farsifyui.ir/components/profile-card](https://farsifyui.ir/components/profile-card)
- **Install ID:** `profile-card`

## Install

```bash
npx shadcn@latest add @farsify/profile-card
```

Or copy `components/profile-card/profile-card.tsx` and `components/profile-card/profile-card.css` from this repository into your project.

## Usage

```tsx
"use client";

import ProfileCard from "@/components/farsify/profile-card";

export function SpeakerTile() {
  return (
    <ProfileCard
      avatarUrl="/avatar.jpg"
      name="نامِ تو"
      title="عنوانِ شغلی"
      handle="username"
      status="آنلاین"
      contactText="پیام"
      iconUrl="/holo-pattern.png"
    />
  );
}

// فویل از تیره/روشناییِ رنگِ پشت درمی‌آید
<ProfileCard backdropColor="#7dd3fc" holo={1} glare={0.8} />
```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `avatarUrl` | `string` | — | — | Portrait on the tile. |
| `iconUrl` | `string` | — | — | Image for the hologram pattern; without it a soft gradient is used. |
| `miniAvatarUrl` | `string` | — | — | Small round avatar next to the handle in the footer. |
| `name` | `string` | `"نامِ تو"` | — | Name on the tile — the default is a placeholder, not an invented person. |
| `title` | `string` | `"عنوانِ شغلی"` | — | Below the name. |
| `handle` | `string` | `"username"` | — | The handle in the footer (without @; it is added for you). |
| `status` | `string` | `"آنلاین"` | — | Status text below the handle. |
| `statusColor` | `string` | `"#22c55e"` | — | Color of the status indicator. |
| `contactText` | `string` | `"پیام"` | — | Text of the contact button. |
| `showUserInfo` | `boolean` | `true` | — | Whether the handle/status/contact footer is shown. |
| `onContactClick` | `() => void` | — | — | Click of the contact button. |
| `contactHref` | `string` | — | — | If passed, the contact button becomes a real link (new tab, `rel=noreferrer`). |
| `theme` | `"dark" | "light"` | `"dark"` | — | Frame and tile palette. |
| `backdropColor` | `string` | — | — | Background color of the tile; the hologram foil derives from how dark or light this color is. Omitting it means the theme tile. |
| `radius` | `number` | `16` | — | Card corner radius. |
| `holo` | `number` | `0.8` | — | Hologram layer intensity; 0 to 1. |
| `glare` | `number` | `0.5` | — | Intensity of the following light glare; 0 to 1. |
| `enableTilt` | `boolean` | `true` | — | Tilt with pointer/touch. |
| `tiltStrength` | `number` | `12` | — | Maximum tilt angle, in degrees. |
| `parallax` | `number` | `8` | — | Layer movement with the pointer, in pixels. |
| `enableMobileTilt` | `boolean` | `false` | — | Gyroscope tilt on mobile. |
| `mobileTiltSensitivity` | `number` | `5` | — | Gyroscope sensitivity. |
| `intro` | `boolean` | `true` | — | The 1.4-second entry spring. |
| `autoPreview` | `boolean` | `false` | — | Auto demo: an imaginary pointer slowly circles the card so tilt, glare and hologram are visible in non-interactive previews (bento/list). It turns off with `prefers-reduced-motion`. |
| `className` | `string` | `''` | — | Extra class for the root. |

## Tips

- ⚠️ This component's CSS variable prefix is `--pfc-*`, not `--pc-*` — that prefix belongs to sponsor-card in this repo (precedent: paper-crumple with `--pcr-*`). The names were changed mechanically and no value differs.
- The hologram foil derives from how dark or light `backdropColor` is (dark surface = color-dodge, light = multiply) — so the backdrop color also changes the hologram's character, not just the background.
- The text defaults ("online"/"message") were made Persian; pass the Persian name and title from props and set the Persian line's `line-height` deliberately (1.25 for the name / 1.45 for the title — above the font ink).
- On mobile you get two separate sensations: touching the card itself and — with `enableMobileTilt` — tilting the phone itself; the iOS permission pattern is automatic.
- In the light theme the foil gets `invert(1) hue-rotate(180deg)` — pass the dark color pattern so it looks right in both themes.

