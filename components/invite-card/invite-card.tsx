"use client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toFaDigits(input: string | number) {
  return String(input).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
}

function groupNumber(value: number, decimals = 0) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatFa(value: number, decimals = 0) {
  return toFaDigits(
    groupNumber(value, decimals).replace(/,/g, "٬").replace(/\./g, "٫"),
  );
}

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { MotionStyle } from "motion/react";
import { BadgeCheck, Sparkles } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

export type CardLogo =
  | ReactNode
  | {
      src: string;
      alt: string;
      className?: string;
    };

export interface InviteCardProps {
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  logo?: CardLogo;
  logoAlt?: string;
  secondLogo?: CardLogo;
  secondLogoAlt?: string;
  secondLogoHref?: string;
  secondLogoAriaLabel?: string;
  icon?: ReactNode;
  tilt?: number;
  glow?: number;
  stiffness?: number;
  damping?: number;
  radius?: number;
  autoPreview?: boolean;
  replay?: number;
  ariaLabel?: string;
  className?: string;
}

const CARD_SURFACE = "#1f2121";

const isImageLogo = (
  logo: CardLogo,
): logo is { src: string; alt: string; className?: string } => {
  return typeof logo === "object" && logo !== null && "src" in logo;
};

const looksLikeImageSrc = (value: string) => {
  const trimmed = value.trim();
  if (/^(?:https?:\/\/|\/|\.\.?\/)/i.test(trimmed)) return true;
  return /\.(?:svg|png|jpe?g|webp|gif|avif)$/i.test(trimmed.split(/[?#]/)[0]);
};

const renderLogo = (logo: CardLogo, className: string, fallbackAlt: string) => {
  if (typeof logo === "string") {
    if (!looksLikeImageSrc(logo)) return logo;
    return <img alt={fallbackAlt} className={className} loading="lazy" src={logo} />;
  }

  if (isImageLogo(logo)) {
    return (
      <img
        alt={logo.alt}
        className={cn(className, logo.className)}
        loading="lazy"
        src={logo.src}
      />
    );
  }

  return logo;
};

const sampleShot = (h: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${h},14%,22%)'/%3E%3Cstop offset='1' stop-color='hsl(${h},16%,36%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3C/svg%3E`;

const InviteCard = ({
  image = sampleShot(225),
  imageAlt = "عکسِ پس‌زمینهٔ کارت",
  title = "فارسیفای",
  description = "دعوت‌نامه",
  logo = <Sparkles className="size-7 text-white" aria-hidden="true" />,
  logoAlt = "نشان",
  secondLogo = (
    <span className="text-base text-neutral-400">۶۷</span>
  ),
  secondLogoAlt = "شمارهٔ بلیت",
  secondLogoHref,
  secondLogoAriaLabel,
  icon = (
    <BadgeCheck className="size-16 text-white" strokeWidth={1.78} aria-hidden="true" />
  ),
  tilt = 20,
  glow = 1,
  stiffness = 260,
  damping = 28,
  radius = 16,
  autoPreview = false,
  replay = 0,
  ariaLabel = "کارتِ دعوت",
  className,
}: InviteCardProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const rotateX = useSpring(useMotionValue(0), { stiffness, damping, mass: 0.7 });
  const rotateY = useSpring(useMotionValue(0), { stiffness, damping, mass: 0.7 });
  const translateZ = useSpring(useMotionValue(0), { stiffness, damping, mass: 0.7 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useSpring(useMotionValue(0), {
    stiffness: 260,
    damping: 30,
  });
  const cardTransform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.9) 10%, rgba(255,255,255,0.75) 20%, rgba(255,255,255,0) 80%)`;

  const [autoDrive, setAutoDrive] = useState(autoPreview);
  const interactionKilledRef = useRef(false);
  const activeTouchRef = useRef<number | null>(null);
  const cycleRef = useRef(Math.random() * 8);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setAutoDrive(autoPreview);
  }, [autoPreview, replay]);

  useEffect(() => {
    if (!autoDrive || shouldReduceMotion) return;

    interactionKilledRef.current = false;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let observer: IntersectionObserver | null = null;
    const node = rootRef.current;
    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        last = performance.now();
      });
      observer.observe(node);
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000 || 0, 0.05);
      last = now;
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }
      cycleRef.current += dt;
      const t = cycleRef.current;
      const x = 0.5 + 0.42 * Math.sin(t * 0.8);
      const y = 0.5 + 0.4 * Math.sin(t * 1.27 + 1.1);
      glowX.set(x * 100);
      glowY.set(y * 100);
      glowOpacity.set(glow);
      rotateX.set((y - 0.5) * tilt);
      rotateY.set((x - 0.5) * -tilt);
      translateZ.set(20);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      if (interactionKilledRef.current) return;
      rotateX.set(0);
      rotateY.set(0);
      translateZ.set(0);
      glowOpacity.set(0);
      glowX.set(50);
      glowY.set(50);
    };
  }, [autoDrive, tilt, glow, shouldReduceMotion, rotateX, rotateY, translateZ, glowX, glowY, glowOpacity]);

  const secondLogoContent = renderLogo(
    secondLogo,
    "size-5 object-contain text-white",
    secondLogoAlt,
  );

  const secondLogoLinkLabel =
    secondLogoAriaLabel ?? (isImageLogo(secondLogo) ? secondLogo.alt : secondLogoAlt);

  const handlePointerLeave = () => {
    glowOpacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    translateZ.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  const applyPointer = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    const xProgress = pointerX / bounds.width;
    const yProgress = pointerY / bounds.height;

    glowX.set(xProgress * 100);
    glowY.set(yProgress * 100);
    glowOpacity.set(glow);

    if (shouldReduceMotion) {
      return;
    }

    rotateX.set((yProgress - 0.5) * tilt);
    rotateY.set((xProgress - 0.5) * -tilt);
    translateZ.set(20);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" && activeTouchRef.current !== event.pointerId) {
      return;
    }
    applyPointer(event);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      return;
    }
    interactionKilledRef.current = true;
    setAutoDrive(false);
    glowOpacity.set(glow);
    if (shouldReduceMotion) {
      return;
    }
    translateZ.set(20);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch") {
      return;
    }
    activeTouchRef.current = event.pointerId;
    interactionKilledRef.current = true;
    setAutoDrive(false);
    applyPointer(event);
  };

  const handlePointerRelease = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || activeTouchRef.current !== event.pointerId) {
      return;
    }
    activeTouchRef.current = null;
    handlePointerLeave();
  };

  const handleFocus = () => {
    glowOpacity.set(glow * 0.8);
  };

  const handleBlur = () => {
    handlePointerLeave();
  };

  const cardStyle: MotionStyle & Record<"--ic-card" | "--ic-radius", string> = {
    "--ic-card": CARD_SURFACE,
    "--ic-radius": `${radius}px`,
    transform: cardTransform,
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "w-full max-w-[375px] p-5 [perspective:1000px]",
        className,
      )}
    >
      <motion.article
        aria-label={ariaLabel}
        className={cn(
          "relative flex w-full flex-col rounded-[var(--ic-radius)] bg-(--ic-card) p-2 will-change-transform outline-none md:p-4 [touch-action:pan-y_pinch-zoom]",
          "shadow-[0_520px_146px_rgba(0,0,0,0.01),0_333px_133px_rgba(0,0,0,0.04),0_83px_83px_rgba(0,0,0,0.26),0_21px_46px_rgba(0,0,0,0.29)]",
          "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ic-card)]",
        )}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPointerCancel={handlePointerRelease}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerRelease}
        style={cardStyle}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between p-2">
          {renderLogo(logo, "size-7 rounded-full object-cover", logoAlt)}
          {secondLogoHref ? (
            <a
              aria-label={secondLogoLinkLabel}
              className="rounded-sm outline-none transition-opacity duration-200 ease focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ic-card)] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80"
              href={secondLogoHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {secondLogoContent}
            </a>
          ) : (
            secondLogoContent
          )}
        </div>

        <div className="mx-2 flex-1">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--ic-radius)]">
            <img
              alt={imageAlt}
              className="absolute inset-0 size-full bg-black object-cover shadow-[0_5px_6px_rgba(0,0,0,0.05)] contrast-75 saturate-0"
              loading="lazy"
              src={image}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center justify-between p-2 text-xs text-white">
          <span className="truncate">{title}</span>
          <span className="truncate ps-3 text-base text-neutral-400">
            {description}
          </span>
        </div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[var(--ic-radius)] mix-blend-overlay"
          style={{ background: glowBackground, opacity: glowOpacity }}
        />
      </motion.article>
    </div>
  );
};

export default InviteCard;
export { InviteCard };
