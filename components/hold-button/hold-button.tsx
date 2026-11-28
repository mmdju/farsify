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
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

import "./hold-button.css";

const TAP_MS = 250;
const HIT_PAD = 10;
const LINEAR = (t: number) => t;
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);

export type HoldPhase = "idle" | "holding" | "done";
export type HoldInput = "pointer" | "key" | null;
export type HoldSize = "sm" | "md" | "lg";
export type HoldDirection = "right" | "up";

export interface HoldButtonProps {
  children?: ReactNode;
  doneLabel?: ReactNode;
  icon?: ReactNode;
  doneIcon?: ReactNode;
  backgroundColor?: string;
  fillColor?: string;
  textColor?: string;
  fillTextColor?: string;
  size?: HoldSize;
  radius?: number;
  fillDirection?: HoldDirection;
  holdTime?: number;
  releaseTime?: number;
  pressScale?: number;
  wave?: boolean;
  waveAmplitude?: number;
  glow?: boolean;
  resetAfter?: number;
  disabled?: boolean;
  autoPreview?: boolean;
  onHold?: () => void;
  onTap?: () => void;
  className?: string;
}

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

export default function HoldButton({
  children = "برای حذف نگه دار",
  doneLabel = "حذف شد",
  icon = null,
  doneIcon = null,
  backgroundColor = "#232323",
  fillColor = "#fafafa",
  textColor = "#fafafa",
  fillTextColor = "#0a0a0a",
  size = "md",
  radius = 14,
  fillDirection = "right",
  holdTime = 2000,
  releaseTime = 200,
  pressScale = 0.97,
  wave = true,
  waveAmplitude = 6,
  glow = true,
  resetAfter = 1200,
  disabled = false,
  autoPreview = false,
  onHold,
  onTap,
  className = "",
}: HoldButtonProps) {
  const [phase, setPhase] = useState<HoldPhase>("idle");
  const [input, setInput] = useState<HoldInput>(null);
  const phaseRef = useRef<HoldPhase>("idle");
  const inputRef = useRef<HoldInput>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{
    pointerId: number | null;
    start: number;
    rect: DOMRect | null;
  }>({ pointerId: null, start: 0, rect: null });
  const timers = useRef<{
    complete: ReturnType<typeof setTimeout> | undefined;
    reset: ReturnType<typeof setTimeout> | undefined;
  }>({ complete: undefined, reset: undefined });
  const hintId = useId();
  const reduce = useReducedMotion();

  const go = (next: HoldPhase, kind: HoldInput = null) => {
    phaseRef.current = next;
    inputRef.current = kind;
    setPhase(next);
    setInput(kind);
  };

  const clearTimers = () => {
    clearTimeout(timers.current.complete);
    clearTimeout(timers.current.reset);
  };

  const motion = useRef({ raf: 0, p: 0, from: 0, to: 0, start: 0 });
  const drive = (to: number, duration: number, ease: (t: number) => number) => {
    const m = motion.current;
    const span = reduce ? 0 : duration;
    cancelAnimationFrame(m.raf);
    m.from = m.p;
    m.to = to;
    m.start = performance.now();
    const step = (now: number) => {
      const t = span > 0 ? Math.min(1, (now - m.start) / span) : 1;
      m.p = m.from + (m.to - m.from) * ease(t);
      buttonRef.current?.style.setProperty("--hb-p", m.p.toFixed(4));
      if (t < 1) {
        m.raf = requestAnimationFrame(step);
        return;
      }
      m.raf = 0;
      if (m.to === 1) complete();
    };
    m.raf = requestAnimationFrame(step);
  };

  const complete = () => {
    if (phaseRef.current !== "holding") return;
    if (performance.now() - gesture.current.start < holdTime - 50) return;
    clearTimers();
    go("done", inputRef.current);
    onHold?.();
    if (resetAfter > 0) {
      timers.current.reset = setTimeout(() => {
        go("idle");
        drive(0, releaseTime, EASE_OUT);
      }, resetAfter);
    }
  };

  const begin = (kind: HoldInput) => {
    if (disabled || phaseRef.current !== "idle") return false;
    const button = buttonRef.current;
    if (!button) return false;
    gesture.current.start = performance.now();
    gesture.current.rect = button.getBoundingClientRect();
    go("holding", kind);
    drive(1, holdTime, LINEAR);
    timers.current.complete = setTimeout(complete, holdTime + 100);
    return true;
  };

  const release = ({ drifted = false }: { drifted?: boolean } = {}) => {
    if (phaseRef.current !== "holding") return;
    clearTimers();
    const held = performance.now() - gesture.current.start;
    go("idle");
    drive(0, releaseTime, EASE_OUT);
    if (!drifted && held < TAP_MS) onTap?.();
  };
  const releaseRef = useRef(release);
  releaseRef.current = release;

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !e.isPrimary || gesture.current.pointerId !== null) {
      return;
    }
    if (!begin("pointer")) return;
    gesture.current.pointerId = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
  };

  const endPointer = (
    e: ReactPointerEvent<HTMLButtonElement>,
    options?: { drifted?: boolean },
  ) => {
    if (e.pointerId !== gesture.current.pointerId) return;
    gesture.current.pointerId = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
    }
    release(options);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerId !== gesture.current.pointerId) return;
    const r = gesture.current.rect;
    if (!r) return;
    const out =
      e.clientX < r.left - HIT_PAD ||
      e.clientX > r.right + HIT_PAD ||
      e.clientY < r.top - HIT_PAD ||
      e.clientY > r.bottom + HIT_PAD;
    if (out) endPointer(e, { drifted: true });
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "touch") endPointer(e, { drifted: true });
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") {
      if (inputRef.current === "key") release({ drifted: true });
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) begin("key");
    }
  };

  const handleKeyUp = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (inputRef.current === "key") release();
    }
  };

  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return undefined;
    const measure = () => {
      button.style.setProperty("--hb-w", `${button.offsetWidth}px`);
      button.style.setProperty("--hb-h", `${button.offsetHeight}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(button);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "holding") return undefined;
    const cancel = () => releaseRef.current({ drifted: true });
    const onVisibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  useEffect(() => {
    if (!autoPreview || disabled) return undefined;
    if (reduce) return undefined;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const GAP_MS = 700;

    const cycle = () => {
      if (!alive) return;
      if (phaseRef.current === "done" && resetAfter <= 0) {
        go("idle");
        drive(0, releaseTime, EASE_OUT);
      }
      if (phaseRef.current !== "idle") {
        timer = setTimeout(cycle, 250);
        return;
      }
      if (!begin("pointer")) {
        timer = setTimeout(cycle, 250);
        return;
      }
      timer = setTimeout(
        cycle,
        holdTime + Math.max(resetAfter, 0) + releaseTime + GAP_MS,
      );
    };

    timer = setTimeout(cycle, GAP_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
      if (phaseRef.current === "holding") releaseRef.current({ drifted: true });
    };
  }, [autoPreview, disabled, holdTime, resetAfter, releaseTime, reduce]);

  useEffect(() => {
    const t = timers.current;
    const m = motion.current;
    return () => {
      clearTimeout(t.complete);
      clearTimeout(t.reset);
      cancelAnimationFrame(m.raf);
    };
  }, []);

  const direction: HoldDirection = fillDirection === "up" ? "up" : "right";
  const labels = (
    <>
      <span className="hold-button__idle" aria-hidden={phase === "done"}>
        {icon ? <span className="hold-button__icon">{icon}</span> : null}
        {children}
      </span>
      <span className="hold-button__done" aria-hidden={phase !== "done"}>
        {doneIcon ? <span className="hold-button__icon">{doneIcon}</span> : null}
        {doneLabel}
      </span>
    </>
  );

  const vars: StyleVars = {
    "--hb-radius": `${radius}px`,
    "--hb-bg": backgroundColor,
    "--hb-fill": fillColor,
    "--hb-text": textColor,
    "--hb-fill-text": fillTextColor,
    "--hb-hold": `${holdTime}ms`,
    "--hb-cycles": holdTime / 1100,
    "--hb-release": `${releaseTime}ms`,
    "--hb-press": pressScale,
    "--hb-wave": `${wave ? waveAmplitude : 0}px`,
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      className={cn("hold-button", `hold-button--${size}`, className)}
      data-phase={phase}
      data-input={input ?? undefined}
      data-direction={direction}
      data-glow={glow ? "true" : undefined}
      aria-describedby={hintId}
      style={vars}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => endPointer(e)}
      onPointerCancel={(e) => endPointer(e, { drifted: true })}
      onLostPointerCapture={(e) => endPointer(e, { drifted: true })}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="hold-button__pulse" aria-hidden="true" />
      <span className="hold-button__label">{labels}</span>
      <span className="hold-button__clip" aria-hidden="true">
        <span className="hold-button__fill">
          <span className="hold-button__label hold-button__label--fill">
            {labels}
          </span>
        </span>
        <span className="hold-button__crest" aria-hidden="true">
          <span className="hold-button__label hold-button__label--fill">
            {labels}
          </span>
        </span>
      </span>
      <span id={hintId} className="hold-button__sr">
        برای تأیید،{" "}
        {toFaDigits(String(Math.round(holdTime / 100) / 10)).replace(".", "٫")}{" "}
        ثانیه نگه دار
      </span>
    </button>
  );
}
