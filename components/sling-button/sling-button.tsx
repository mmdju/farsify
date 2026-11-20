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
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";

const GAP = 4;
const SLOP = { fine: 4, coarse: 8 };
const FINGER_MAX = 3000;
const HAND_MAX = 6000;
const CANCEL = 0.5;
const POWER_CAP = 1.5;
const DOT_MS = 300;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rubberband = (o: number, dim: number, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));

export type SlingAxis = "any" | "horizontal" | "vertical";

export interface SlingButtonProps {
  children?: ReactNode;
  onSend?: () => void;
  padColor?: string;
  iconColor?: string;
  accentColor?: string;
  wellColor?: string;
  bandColor?: string;
  size?: number;
  strokeWidth?: number;
  armAt?: number;
  maxPull?: number;
  launchSpeed?: number;
  recoil?: number;
  flight?: number;
  particles?: number;
  spread?: number;
  axis?: SlingAxis;
  tapSends?: boolean;
  disabled?: boolean;
  autoPreview?: boolean;
  ariaLabel?: string;
  className?: string;
}

interface Sample {
  x: number;
  y: number;
  t: number;
}

interface Grip {
  id: number;
  startX: number;
  startY: number;
  scale: number;
  moved: boolean;
  hist: Sample[];
  rawOrigin: { x: number; y: number };
  slop: number;
}

const ARROW_UP_02_PATHS = [
  "M12 5.5V19",
  "M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11",
];

export default function SlingButton({
  children,
  onSend,
  padColor = "#fafafa",
  iconColor = "#0a0a0a",
  accentColor = "#fafafa",
  wellColor = "#232323",
  bandColor = "#525252",
  size = 56,
  strokeWidth = 3,
  armAt = 48,
  maxPull = 160,
  launchSpeed = 2600,
  recoil = 0.2,
  flight = 120,
  particles = 14,
  spread = 60,
  axis = "any",
  tapSends = true,
  disabled = false,
  autoPreview = false,
  ariaLabel = "ارسال",
  className,
}: SlingButtonProps) {
  const reduce = useReducedMotion();
  const R = maxPull;
  const ARM = Math.min(armAt, 0.8 * R);
  const wellR = size / 2 + GAP + strokeWidth;
  const padR = size / 2 - strokeWidth / 2;
  const arcR = wellR;
  const H = wellR + strokeWidth + 2;
  const DOT = Math.max(6, Math.round(size / 7));
  const count = Math.max(0, Math.round(particles));

  const [held, setHeld] = useState(false);
  const [armed, setArmed] = useState(false);
  const [sent, setSent] = useState(false);

  const rootRef = useRef<HTMLSpanElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<SVGGElement>(null);
  const bandRef = useRef<SVGPathElement>(null);
  const hotRef = useRef<SVGPathElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const power = useRef(0);
  const iconRef = useRef<HTMLSpanElement>(null);
  const grip = useRef<Grip | null>(null);
  const dir = useRef({ ux: 0, uy: -1 });
  const animX = useRef<AnimationPlaybackControls | null>(null);
  const animY = useRef<AnimationPlaybackControls | null>(null);
  const armedRef = useRef(false);
  const dotPending = useRef(false);
  const dotTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const paintQueued = useRef(false);
  const skipClick = useRef(false);
  const hintId = useId();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const padT = useMotionTemplate`translate(${px}px, ${py}px)`;

  const launchDot = () => {
    dotPending.current = false;
    clearTimeout(dotTimer.current);
    const { ux, uy } = dir.current;
    relaxIcon();
    const base = Math.atan2(-uy, -ux);
    const cone = (spread * Math.PI) / 180;
    const push = 0.85 + 0.35 * power.current;
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const lead = i === 0;
      const angle = base + (lead ? 0 : (Math.random() + Math.random() - 1) * (cone / 2));
      const cx = Math.cos(angle);
      const cy = Math.sin(angle);
      const reach = (lead ? flight : flight * (0.3 + Math.random())) * push;
      const drift = lead ? 0 : (Math.random() - 0.5) * flight * 0.4;
      const scale = lead ? 1 : 0.3 + Math.random() * 0.6;
      const shrink = lead ? 0.6 : scale * (0.2 + Math.random() * 0.4);
      const duration = lead ? DOT_MS : DOT_MS * (0.7 + Math.random());
      const delay = lead ? 0 : Math.random() * 70;
      const to = wellR + reach;
      dot.animate(
        [
          { transform: `translate(${cx * wellR}px, ${cy * wellR}px) scale(${scale})` },
          {
            transform: `translate(${cx * to - cy * drift}px, ${cy * to + cx * drift}px) scale(${shrink})`,
          },
        ],
        { duration, delay, easing: EASE_OUT, fill: "none" },
      );
      dot.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.55 },
          { opacity: 0, offset: 1 },
        ],
        { duration, delay, easing: "linear", fill: "none" },
      );
    });
  };

  const aimIcon = (ux: number, uy: number, dist: number) => {
    const icon = iconRef.current;
    if (!icon) return;
    const angle = (Math.atan2(-uy, -ux) * 180) / Math.PI + 90;
    icon.style.transition = "none";
    icon.style.transform = `rotate(${angle * clamp(dist / 12, 0, 1)}deg)`;
  };
  const relaxIcon = () => {
    const icon = iconRef.current;
    if (!icon) return;
    icon.style.transition = reduce
      ? "none"
      : "transform 360ms cubic-bezier(0.23, 1, 0.32, 1)";
    icon.style.transform = "rotate(0deg)";
  };

  const paint = () => {
    paintQueued.current = false;
    const band = bandRef.current;
    const hot = hotRef.current;
    const arc = arcRef.current;
    const fx = fxRef.current;
    if (!band || !hot || !arc || !fx) return;
    const x = px.get();
    const y = py.get();
    const { ux, uy } = dir.current;
    const proj = x * ux + y * uy;
    const p = clamp(proj / ARM, 0, 1);
    const dist = Math.hypot(x, y);
    let d = "";
    if (dist > 0.5) {
      const a = Math.atan2(y, x);
      const b = Math.acos(clamp((wellR - padR) / dist, -1, 1));
      d = [a + b, a - b]
        .map((t) => {
          const cx = Math.cos(t);
          const cy = Math.sin(t);
          return `M${(wellR * cx).toFixed(2)},${(wellR * cy).toFixed(2)}L${(x + padR * cx).toFixed(2)},${(y + padR * cy).toFixed(2)}`;
        })
        .join("");
    }
    band.setAttribute("d", d);
    hot.setAttribute("d", d);
    hot.style.opacity = String(p);
    fx.style.opacity = String(clamp(proj / 6, 0, 1));
    arc.setAttribute("stroke-dasharray", `${p} ${1 - p}`);
    arc.setAttribute("stroke-dashoffset", String(p / 2));
    arc.style.opacity = p > 0.01 ? "1" : "0";
    if (grip.current) aimIcon(ux, uy, dist);
    arc.setAttribute(
      "transform",
      `rotate(${(Math.atan2(-uy, -ux) * 180) / Math.PI})`,
    );
    if (dotPending.current && proj <= size / 4) launchDot();
  };
  const schedulePaint = () => {
    if (paintQueued.current) return;
    paintQueued.current = true;
    requestAnimationFrame(paint);
  };
  useMotionValueEvent(px, "change", schedulePaint);
  useMotionValueEvent(py, "change", schedulePaint);
  useEffect(() => {
    animX.current?.stop();
    animY.current?.stop();
    px.jump(0);
    py.jump(0);
    paint();
  }, [size, strokeWidth, armAt, maxPull, axis]);

  const settle = (v0: { x: number; y: number }) => {
    if (reduce) {
      const fx = fxRef.current;
      if (fx) {
        fx.style.transition = "opacity 200ms ease";
        fx.style.opacity = "0";
      }
      setTimeout(() => {
        px.jump(0);
        py.jump(0);
        if (fx) fx.style.transition = "";
      }, 200);
      return;
    }
    animX.current = animate(px, 0, {
      type: "spring",
      duration: 0.4,
      bounce: recoil,
      velocity: v0.x,
    });
    animY.current = animate(py, 0, {
      type: "spring",
      duration: 0.4,
      bounce: recoil,
      velocity: v0.y,
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || grip.current || e.button !== 0) return;
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = rect.width / (el.offsetWidth || rect.width) || 1;
    animX.current?.stop();
    animY.current?.stop();
    const x = px.get();
    const y = py.get();
    const dNow = Math.hypot(x, y);
    const dClamped = Math.min(dNow, 0.95 * R);
    const rawNow = dNow > 0.5 ? (R * dClamped) / (R - dClamped) : 0;
    grip.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      scale,
      moved: false,
      hist: [],
      rawOrigin:
        dNow > 0.5 ? { x: (rawNow * x) / dNow, y: (rawNow * y) / dNow } : { x: 0, y: 0 },
      slop: e.pointerType === "touch" ? SLOP.coarse : SLOP.fine,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    setHeld(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = (e.clientX - g.startX) / g.scale;
    const dy = (e.clientY - g.startY) / g.scale;
    let rx = g.rawOrigin.x + dx;
    let ry = g.rawOrigin.y + dy;
    if (axis === "horizontal") ry = rubberband(ry, size / 4);
    else if (axis === "vertical") rx = rubberband(rx, size / 4);
    if (!g.moved && Math.hypot(dx, dy) > g.slop) g.moved = true;
    const raw = Math.hypot(rx, ry);
    if (raw < 0.01) return;
    const d = (R * raw) / (R + raw);
    const ux = rx / raw;
    const uy = ry / raw;
    dir.current = { ux, uy };
    px.set(d * ux);
    py.set(d * uy);
    const t = performance.now();
    g.hist.push({ x: d * ux, y: d * uy, t });
    while (g.hist.length > 4 || t - g.hist[0].t > 80) g.hist.shift();
    const isArmed = d >= ARM;
    if (isArmed !== armedRef.current) {
      armedRef.current = isArmed;
      setArmed(isArmed);
    }
  };
  const release = (pointerId: number, cancelled: boolean) => {
    const g = grip.current;
    if (!g || g.id !== pointerId) return;
    grip.current = null;
    skipClick.current = true;
    try {
      padRef.current?.releasePointerCapture(pointerId);
    } catch {
    }
    fire(g, cancelled);
  };
  const fire = (g: Grip, cancelled: boolean) => {
    const d = Math.hypot(px.get(), py.get());
    const p = d / ARM;
    const { ux, uy } = dir.current;
    let vx = 0;
    let vy = 0;
    if (!cancelled && g.hist.length > 1) {
      const a = g.hist[0];
      const b = g.hist[g.hist.length - 1];
      const dt = b.t - a.t;
      if (dt > 0 && performance.now() - b.t < 50) {
        vx = ((b.x - a.x) / dt) * 1000;
        vy = ((b.y - a.y) / dt) * 1000;
      }
    }
    const fm = Math.hypot(vx, vy);
    if (fm > FINGER_MAX) {
      vx *= FINGER_MAX / fm;
      vy *= FINGER_MAX / fm;
    }
    if (!g.moved) {
      relaxIcon();
      settle({ x: 0, y: 0 });
      if (tapSends && !cancelled) onSend?.();
    } else {
      const send = armedRef.current && !cancelled;
      const launch = send
        ? launchSpeed * Math.min(p, POWER_CAP)
        : CANCEL * launchSpeed * Math.min(p, 1);
      let v0x = vx - ux * launch;
      let v0y = vy - uy * launch;
      const m = Math.hypot(v0x, v0y);
      if (m > HAND_MAX) {
        v0x *= HAND_MAX / m;
        v0y *= HAND_MAX / m;
      }
      if (!send) relaxIcon();
      if (send) {
        onSend?.();
        if (reduce) {
          setSent(true);
          setTimeout(() => setSent(false), 200);
        } else {
          power.current = clamp((Math.min(p, POWER_CAP) - 1) / (POWER_CAP - 1), 0, 1);
          dotPending.current = true;
          dotTimer.current = setTimeout(launchDot, 150);
        }
      }
      settle({ x: v0x, y: v0y });
    }
    armedRef.current = false;
    setHeld(false);
    setArmed(false);
  };
  useEffect(
    () => () => {
      animX.current?.stop();
      animY.current?.stop();
      clearTimeout(dotTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!autoPreview || disabled) return undefined;

    const PULL = Math.min(R * 0.8, ARM * 1.6);
    const PULL_MS = reduce ? 200 : 620;
    const HOLD_MS = 280;
    const AFTER_MS = reduce ? 500 : 900;
    const GAP_MS = 700;

    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pseudoGrip: Grip | null = null;

    const fake = (): Grip => ({
      id: -1,
      startX: 0,
      startY: 0,
      scale: 1,
      moved: true,
      hist: [],
      rawOrigin: { x: 0, y: 0 },
      slop: 0,
    });

    const run = () => {
      if (!alive || grip.current) return;
      const g = fake();
      pseudoGrip = g;
      grip.current = g;
      dir.current = { ux: 0, uy: 1 };
      setHeld(true);

      animX.current = animate(px, 0, { duration: PULL_MS / 1000 });
      const pullIn = animate(py, PULL, {
        duration: PULL_MS / 1000,
        ease: [0.23, 1, 0.32, 1],
      });
      animY.current = pullIn;
      pullIn.then(() => {
        if (!alive || !pseudoGrip) return;
        armedRef.current = true;
        setArmed(true);
        timer = setTimeout(() => {
          if (!alive || !pseudoGrip) return;
          pseudoGrip = null;
          grip.current = null;
          fire(g, false);
          timer = setTimeout(run, AFTER_MS + GAP_MS);
        }, HOLD_MS);
      });
    };

    timer = setTimeout(run, GAP_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
      animX.current?.stop();
      animY.current?.stop();
      if (pseudoGrip) {
        pseudoGrip = null;
        grip.current = null;
        px.jump(0);
        py.jump(0);
        paint();
      }
      armedRef.current = false;
      setHeld(false);
      setArmed(false);
    };
  }, [autoPreview, disabled, reduce, ARM, R, size, strokeWidth, armAt, maxPull]);

  return (
    <span
      ref={rootRef}
      className={cn(
        "group/root relative inline-block [width:var(--sl-size)] [height:var(--sl-size)]",
        className,
      )}
      data-armed={armed ? "" : undefined}
      data-sent={sent ? "" : undefined}
      style={
        {
          "--sl-size": `${size}px`,
          "--sl-svg": `${2 * H}px`,
          "--sl-pad": padColor,
          "--sl-icon": iconColor,
          "--sl-accent": accentColor,
          "--sl-well": wellColor,
          "--sl-band": bandColor,
          "--sl-stroke": `${strokeWidth}px`,
          "--sl-dot": `${DOT}px`,
        } as CSSProperties
      }
    >
      <svg
        className="pointer-events-none absolute top-1/2 left-1/2 overflow-visible [width:var(--sl-svg)] [height:var(--sl-svg)] [margin:calc(var(--sl-svg)/-2)_0_0_calc(var(--sl-svg)/-2)] [shape-rendering:geometricPrecision]"
        viewBox={`${-H} ${-H} ${2 * H} ${2 * H}`}
        aria-hidden="true"
      >
        <g ref={fxRef} style={{ opacity: 0 }}>
          <path
            ref={bandRef}
            className="fill-none [stroke:var(--sl-band)] [stroke-linecap:round] [stroke-width:var(--sl-stroke)] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
          />
          <path
            ref={hotRef}
            className="fill-none [stroke:var(--sl-accent)] [stroke-linecap:round] [stroke-width:var(--sl-stroke)] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
          />
        </g>
        <circle
          className="[fill:var(--sl-well)] [transition:fill_200ms_ease] group-data-[sent]/root:[fill:var(--sl-accent)]"
          r={wellR}
        />
        <circle
          ref={arcRef}
          className="fill-none [stroke:var(--sl-accent)] [stroke-width:var(--sl-stroke)] [stroke-linecap:butt] [transition:stroke-width_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[armed]/root:[stroke-width:calc(var(--sl-stroke)*1.5)]"
          r={arcR}
          pathLength="1"
          strokeDasharray="0 1"
          style={{ opacity: 0 }}
        />
      </svg>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full opacity-0 [width:var(--sl-dot)] [height:var(--sl-dot)] [margin:calc(var(--sl-dot)/-2)_0_0_calc(var(--sl-dot)/-2)] [background:var(--sl-accent)]"
          aria-hidden="true"
        />
      ))}
      <motion.span className="absolute inset-0" style={{ transform: padT }}>
        <button
          ref={padRef}
          type="button"
          className="group/pad relative m-0 block h-full w-full cursor-grab touch-none rounded-full border-0 bg-transparent p-0 select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] after:absolute after:-inset-1.5 after:rounded-full after:content-[''] data-[held]:cursor-grabbing aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          aria-label={ariaLabel}
          aria-describedby={hintId}
          aria-disabled={disabled || undefined}
          data-held={held ? "" : undefined}
          data-armed={armed ? "" : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => release(e.pointerId, false)}
          onPointerCancel={(e) => release(e.pointerId, true)}
          onLostPointerCapture={(e) => release(e.pointerId, true)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && grip.current) release(grip.current.id, true);
          }}
          onClick={() => {
            if (skipClick.current) {
              skipClick.current = false;
              return;
            }
            if (!disabled) onSend?.();
          }}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full [background:var(--sl-pad)] [color:var(--sl-icon)] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[held]/pad:scale-[0.97] group-data-[armed]/pad:scale-[1.04] [@media(hover:hover)_and_(pointer:fine)]:group-hover/pad:group-not-data-[held]/pad:group-not-aria-disabled/pad:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none!">
            <span ref={iconRef} className="inline-flex will-change-transform">
              {children ?? (
                <svg
                  width={Math.round(size * 0.4)}
                  height={Math.round(size * 0.4)}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {ARROW_UP_02_PATHS.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              )}
            </span>
          </span>
        </button>
      </motion.span>
      <span id={hintId} className="sr-only">
        برای ارسال Enter بزن، یا دکمه را بکش و رها کن.
      </span>
    </span>
  );
}
