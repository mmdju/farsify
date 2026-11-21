# Holographic Referral Card

A 3D referral card that tilts toward the pointer with a holographic sheen following it; a black-and-white photo in the middle, a badge up top and a ticket number at the bottom — like a cinema ticket.

- **Category:** Showcase
- **Interaction:** Hover / Touch hold / Focus
- **Dependencies:** `motion`, `lucide-react`
- **Live preview:** [https://farsifyui.ir/components/invite-card](https://farsifyui.ir/components/invite-card)
- **Install ID:** `invite-card`

## Install

```bash
npx shadcn@latest add @farsify/invite-card
```

Or copy `components/invite-card/invite-card.tsx` from this repository into your project.

## Usage

```tsx
"use client";

import { InviteCard } from "@/components/farsify/invite-card";

export function EventInvite() {
  return (
    <InviteCard
      title="فارسیفای"
      description="دعوت‌نامه"
      image="/images/invite.jpg"
      imageAlt="عکسِ رویداد"
    />
  );
}

// ---------- نمونه‌های استفاده ----------
export function Examples() {
  return (
    <>
      {/* با نشان و شمارهٔ بلیتِ خودت — لوگو آدرسِ عکس، شئِ {src, alt} یا هر ReactNode */}
      <InviteCard
        logo={<MyLogo className="size-7 rounded-full" />}
        secondLogo={{ src: "/partner.png", alt: "همکار" }}
        secondLogoHref="https://example.com"
        secondLogoAriaLabel="وب‌سایتِ همکار"
      />

      {/* کج‌شدنِ تیزتر و فنرِ پرتحرک — شخصیتِ جسور */}
      <InviteCard tilt={30} stiffness={420} damping={20} />

      {/* گوشهٔ گردتر، برقِ ملایم و فنرِ کشیده — شخصیتِ آرام */}
      <InviteCard radius={24} tilt={10} glow={0.6} stiffness={120} />
    </>
  );
}

```

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `image` | `string` | `"/carousel-4.jpg"` | — | The card's center photo; it is stretched with object-cover into a 3:4 frame and stays black-and-white with low contrast (so the sheen reads as holographic on top). |
| `imageAlt` | `string` | `"عکسِ پس‌زمینهٔ کارت"` | — | Alt text for the photo. |
| `title` | `string` | `"فارسیفای"` | — | Label of the bottom row (right side in RTL). If it grows wider than the card, it is clipped silently. |
| `description` | `string` | `"دعوت‌نامه"` | — | Caption beside the title in the bottom row — muted in color and set heavier. |
| `logo` | `CardLogo` | — | — | Badge in the top corner of the card: any `ReactNode`, or `{src, alt, className}`. A string is treated as an image only when it looks like a path (`/`, `./`, `http`, or an image extension); otherwise it is printed as text. Defaults to the Sparkles icon. |
| `logoAlt` | `string` | `"نشان"` | — | Alt text for the badge, when `logo` is an image URL. |
| `secondLogo` | `CardLogo` | `«۶۷»` | — | The other corner of the top row — usually the ticket number (`67`) or a second badge; it follows the same `logo` rule, so a plain string is text, not an image. |
| `secondLogoHref` | `string` | — | — | If provided, the second logo becomes an external link (new tab); it also gets its own focus ring. |
| `secondLogoAlt` | `string` | — | — | Alt text for the second logo image; if omitted and the logo is an image, the component's English name is used. |
| `secondLogoAriaLabel` | `string` | — | — | Accessible label for the second logo link. |
| `icon` | `ReactNode` | — | — | Icon in the center of the photo; defaults to a large white BadgeCheck (swap it for your own brand icon). |
| `tilt` | `number` | `20` | — | Maximum card tilt in degrees; zero means the card only glints and never tilts. |
| `glow` | `number` | `1` | — | Holographic sheen intensity between 0 and 1; it is the opacity multiplier of the sheen layer — zero turns it fully off. |
| `stiffness` | `number` | `260` | — | Stiffness of the tilt spring; higher means the card reacts faster and more nervously. |
| `damping` | `number` | `28` | — | Damping of the spring; lower means the card wobbles more on the way back. |
| `radius` | `number` | `16` | — | Corner roundness of the card and the photo frame in px (component default: rounded-2xl). |
| `autoPreview` | `boolean` | `false` | — | Automatic cycle of tilt and sheen for previews; it turns off on the first mouse hover or finger hold and hands control to the user. Not needed in normal use. |
| `replay` | `number` | `0` | — | A "replay" signal; whenever it changes, the stopped demo (if autoPreview is on) starts again. |
| `ariaLabel` | `string` | `"کارتِ دعوت"` | — | Accessible label for the card itself. |
| `className` | `string` | — | — | Extra class for the outer container (it sits on a 375px width). |

## Tips

- The card is always dark (`#1f2121`) and looks the same in both site themes — like a real ticket that does not change under light; the white sheen sits on that darkness with mix-blend-overlay.
- Tilt and sheen follow the mouse/pen, and holding a finger does the same on phones; vertical scrolling stays intact thanks to touch-action: pan-y — if the browser hands the gesture to scrolling, the card quietly returns to rest — but with Tab you get a fainter sheen and the focus ring.
- For your own branded ticket, usually `title`, `description`, `logo` and `image` are enough; `tilt`/`glow`/`stiffness`/`damping` give the default motion personality.
- Variant identities are distinguishable even at rest by corner roundness (classic 16, bold 6, energetic 10, calm 24).
- Under `prefers-reduced-motion` the card does not tilt, but the sheen remains on hover and focus — a holographic touch experience without motion.

