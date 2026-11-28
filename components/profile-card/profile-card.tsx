"use client";

import { memo, useEffect, useRef, type CSSProperties } from "react";
import "./profile-card.css";

type Palette = "dark" | "light";

interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  statusColor?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  contactHref?: string;
  theme?: Palette;
  backdropColor?: string;
  radius?: number;
  holo?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  parallax?: number;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  intro?: boolean;
  autoPreview?: boolean;
  className?: string;
}

interface Engine {
  aim: (nx: number, ny: number, on?: boolean) => void;
  release: () => void;
  write: () => void;
}

type OrientationPermission = {
  requestPermission?: () => Promise<PermissionState>;
};

const THEMES: Record<Palette, Record<string, string>> = {
  dark: {
    "--pfc-frame": "rgba(16, 16, 16, 0.96)",
    "--pfc-frame-edge": "rgba(255, 255, 255, 0.12)",
    "--pfc-frame-highlight": "rgba(255, 255, 255, 0.16)",
    "--pfc-frame-shadow": "0 22px 44px -20px rgba(0, 0, 0, 0.85), 0 6px 16px -8px rgba(0, 0, 0, 0.55)",
    "--pfc-tile": "linear-gradient(180deg, #232323 0%, #141414 100%)",
    "--pfc-tile-edge": "rgba(255, 255, 255, 0.12)",
    "--pfc-tile-highlight": "rgba(255, 255, 255, 0.16)",
    "--pfc-tile-shadow": "0 4px 10px -4px rgba(0, 0, 0, 0.7)",
    "--pfc-ink": "#fafafa",
    "--pfc-muted": "#a3a3a3",
    "--pfc-hover": "brightness(1.14)",
    "--pfc-press": "brightness(0.82)",
    "--pfc-shade": "rgba(0, 0, 0, 0.45)"
  },
  light: {
    "--pfc-frame": "rgba(24, 24, 24, 0.96)",
    "--pfc-frame-edge": "rgba(255, 255, 255, 0.12)",
    "--pfc-frame-highlight": "rgba(255, 255, 255, 0.16)",
    "--pfc-frame-shadow": "0 22px 44px -22px rgba(0, 0, 0, 0.4), 0 6px 16px -10px rgba(0, 0, 0, 0.24)",
    "--pfc-tile": "linear-gradient(180deg, #232323 0%, #141414 100%)",
    "--pfc-tile-edge": "rgba(255, 255, 255, 0.12)",
    "--pfc-tile-highlight": "rgba(255, 255, 255, 0.16)",
    "--pfc-tile-shadow": "0 4px 10px -5px rgba(0, 0, 0, 0.35)",
    "--pfc-ink": "#fafafa",
    "--pfc-muted": "#a3a3a3",
    "--pfc-hover": "brightness(1.08)",
    "--pfc-press": "brightness(0.92)",
    "--pfc-shade": "rgba(0, 0, 0, 0.3)"
  }
};

const FOILS: Record<Palette, Record<string, string>> = {
  dark: {
    "--pfc-blend": "color-dodge",
    "--pfc-holo-filter": "grayscale(1)",
    "--pfc-sheen": "rgba(255, 255, 255, 0.16)"
  },
  light: {
    "--pfc-blend": "color-dodge",
    "--pfc-holo-filter": "grayscale(1)",
    "--pfc-sheen": "rgba(255, 255, 255, 0.16)"
  }
};

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
)}")`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isDark = (color: string): boolean | null => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color).trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
  const [r, g, b] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
};

const ProfileCard = ({
  avatarUrl = "",
  iconUrl,
  miniAvatarUrl,
  name = "نامِ تو",
  title = "عنوانِ شغلی",
  handle = "username",
  status = "آنلاین",
  statusColor = "#22c55e",
  contactText = "پیام",
  showUserInfo = true,
  onContactClick,
  contactHref,
  theme = "dark",
  backdropColor,
  radius = 16,
  holo = 0.8,
  glare = 0.5,
  enableTilt = true,
  tiltStrength = 12,
  parallax = 8,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  intro = true,
  autoPreview = false,
  className = ""
}: ProfileCardProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const settings = { enableTilt, tiltStrength, parallax, mobileTiltSensitivity, intro };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = { width: root.offsetWidth, height: root.offsetHeight };
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let slowUntil = 0;
    let touchId: number | null = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const tilt = Math.min(1, Math.hypot(x.p, y.p));
      const style = root.style;
      style.setProperty("--pfc-light-x", `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
      style.setProperty("--pfc-light-y", `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
      style.setProperty("--pfc-pointer-x", `${((x.p + 1) * 50).toFixed(2)}%`);
      style.setProperty("--pfc-pointer-y", `${((y.p + 1) * 50).toFixed(2)}%`);
      style.setProperty("--pfc-band-x", `${(50 + x.p * 15).toFixed(2)}%`);
      style.setProperty("--pfc-band-y", `${(50 + y.p * 15).toFixed(2)}%`);
      style.setProperty("--pfc-rotate-x", `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty("--pfc-rotate-y", `${(-x.p * angle).toFixed(3)}deg`);
      style.setProperty("--pfc-shift-x", `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty("--pfc-shift-y", `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      style.setProperty("--pfc-reach", tilt.toFixed(4));
      style.setProperty("--pfc-tilt", (tilt * light.p).toFixed(4));
      style.setProperty("--pfc-active", light.p.toFixed(4));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const slow = now < slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx: number, ny: number, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      slowUntil = 0;
      wake();
    };

    const aimAt = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const release = () => aim(0, 0, false);

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") aimAt(event);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || event.pointerId === touchId) aimAt(event);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") release();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      touchId = event.pointerId;
      aimAt(event);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    const observer = new ResizeObserver(() => {
      size.width = root.offsetWidth;
      size.height = root.offsetHeight;
      write();
    });
    observer.observe(root);

    engineRef.current = { aim, release, write };

    if (settingsRef.current.intro && !reduced) {
      x.p = 0.62;
      y.p = -0.55;
      light.p = 1;
      slowUntil = performance.now() + 1400;
      write();
      wake();
    } else {
      write();
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!autoPreview) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const tick = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      const t = (now - start) / 1000;
      engineRef.current?.aim(
        Math.sin(t * 0.45) * 0.6,
        Math.cos(t * 0.31) * 0.42,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      engineRef.current?.release();
    };
  }, [autoPreview]);

  useEffect(() => {
    engineRef.current?.write();
  }, [enableTilt, tiltStrength, parallax]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enableMobileTilt) return;

    let listening = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      const sensitivity = settingsRef.current.mobileTiltSensitivity;
      engineRef.current?.aim((event.gamma * sensitivity) / 150, ((event.beta - 20) * sensitivity) / 150);
    };
    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("deviceorientation", onOrientation);
    };
    const onClick = () => {
      const Motion = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined;
      if (Motion && typeof Motion.requestPermission === "function") {
        Motion.requestPermission()
          .then(state => {
            if (state === "granted") listen();
          })
          .catch(() => {});
      } else {
        listen();
      }
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [enableMobileTilt]);

  const palette: Palette = theme === "light" ? "light" : "dark";
  const foil: Palette = backdropColor ? ((isDark(backdropColor) ?? palette === "dark") ? "dark" : "light") : palette;
  const backdrop = backdropColor
    ? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${backdropColor}, #000000 18%) 100%)`
    : "var(--pfc-tile)";

  return (
    <div
      ref={rootRef}
      className={`profile-card ${className}`.trim()}
      style={
        {
          ...THEMES[palette],
          ...FOILS[foil],
          "--pfc-radius": `${Math.max(0, radius)}px`,
          "--pfc-backdrop": backdrop,
          "--pfc-holo": clamp(holo, 0, 1),
          "--pfc-glare": clamp(glare, 0, 1),
          "--pfc-parallax": `${Math.max(0, parallax)}px`,
          "--pfc-status": statusColor,
          "--pfc-grain": GRAIN,
          "--pfc-pattern": iconUrl ? `url("${iconUrl}")` : "linear-gradient(#000, #000)",
          "--pfc-pattern-size": iconUrl ? "180% auto" : "100% 100%",
          "--pfc-holo-gain": iconUrl ? 1.25 : 0.75,
          "--pfc-holo-detail": iconUrl && foil === "dark" ? 1 : 0
        } as CSSProperties
      }
    >
      <div className="profile-card__body">
        <div className="profile-card__tile">
          <span className="profile-card__sheen" />
          <span className="profile-card__holo">
            <span className="profile-card__holo-glow" />
            <span className="profile-card__holo-shift" />
          </span>
          {avatarUrl && (
            <img className="profile-card__photo" src={avatarUrl} alt={name || ""} loading="lazy" draggable={false} />
          )}
          {(name || title) && (
            <>
              <span className="profile-card__scrim" />
              <div className="profile-card__info">
                {name && <h3 className="profile-card__name">{name}</h3>}
                {title && <p className="profile-card__title">{title}</p>}
              </div>
            </>
          )}
          <span className="profile-card__tile-rim" />
        </div>

        {showUserInfo && (
          <div className="profile-card__footer">
            {miniAvatarUrl && (
              <span className="profile-card__avatar">
                <img src={miniAvatarUrl} alt="" loading="lazy" draggable={false} />
              </span>
            )}
            <div className="profile-card__meta">
              {handle && (
                <span className="profile-card__handle">
                  <bdi dir="ltr">@{handle}</bdi>
                </span>
              )}
              {status && <span className="profile-card__status">{status}</span>}
            </div>
            {contactText &&
              (contactHref ? (
                <a
                  className="profile-card__contact"
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onContactClick}
                  aria-label={name ? `${contactText} ${name}` : contactText}
                >
                  <ProfileCardMailGlyph />
                  {contactText}
                </a>
              ) : (
                <button
                  type="button"
                  className="profile-card__contact"
                  onClick={onContactClick}
                  aria-label={name ? `${contactText} ${name}` : contactText}
                >
                  <ProfileCardMailGlyph />
                  {contactText}
                </button>
              ))}
          </div>
        )}

        <span className="profile-card__glare" />
        <span className="profile-card__shade" />
        <span className="profile-card__rim" />
      </div>
    </div>
  );
};

export default memo(ProfileCard);

function ProfileCardMailGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24496 4.79066C2.11383 5.92609 2.08114 7.45886 2.01577 10.5244C2.00526 11.5101 2.00526 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
