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
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import "./fuse-button.css";

const LINE: Keyframe[] = [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }];
const OUTLINE: Keyframe[] = [
  { strokeDashoffset: 0 },
  { strokeDashoffset: -1 },
];

const SIZES = {
  sm: { height: 36, font: 13, icon: 14, px: 16 },
  md: { height: 44, font: 14, icon: 15, px: 20 },
  lg: { height: 52, font: 15, icon: 17, px: 24 },
} satisfies Record<FuseSize, { height: number; font: number; icon: number; px: number }>;

export type FuseSize = "sm" | "md" | "lg";
export type FuseVariant = "outline" | "bottom" | "top";
export type FuseCommitOn = "press" | "fuseEnd";
export type FuseSettle = "reset" | "stay";
export type FusePhase = "idle" | "armed" | "settled";

export interface FuseButtonProps {
  label?: string;
  undoLabel?: string;
  doneLabel?: string;
  icon?: ReactNode;
  color?: string;
  background?: string;
  fuseColor?: string;
  size?: FuseSize;
  radius?: number;
  undoWindow?: number;
  fuse?: FuseVariant;
  fuseThickness?: number;
  crossfadeMs?: number;
  commitOn?: FuseCommitOn;
  pauseOnHover?: boolean;
  settle?: FuseSettle;
  disabled?: boolean;
  autoPreview?: boolean;
  onCommit?: (reason: "press" | "fuseEnd") => void;
  onUndo?: () => void;
  onFuseEnd?: () => void;
  onPhaseChange?: (phase: FusePhase) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const ARCHIVE_02_PATHS = [
  "M7 21H16.9999C19.3569 21 20.5354 21 21.2677 20.2678C21.9999 19.5355 21.9999 18.357 21.9999 16C21.9999 13.643 21.9999 12.4645 21.2677 11.7322C20.5354 11 19.3569 11 16.9999 11H7C4.64302 11 3.46453 11 2.7323 11.7322C2.00007 12.4644 2.00005 13.6429 2 15.9999C1.99995 18.357 1.99993 19.5355 2.73217 20.2677C3.4644 21 4.64294 21 7 21Z",
  "M4 11C4.00005 9.59977 4.00008 8.89966 4.27263 8.36485C4.5123 7.89455 4.89469 7.51218 5.365 7.27253C5.89981 7 6.59993 7 8.00015 7H16C17.4001 7 18.1002 7 18.635 7.27248C19.1054 7.51217 19.4878 7.89462 19.7275 8.36502C20 8.8998 20 9.59987 20 11",
  "M6 7C6.00004 5.5998 6.00006 4.89969 6.27259 4.3649C6.51227 3.89457 6.89467 3.51218 7.36501 3.27252C7.89981 3 8.59991 3 10.0001 3H14C15.4001 3 16.1002 3 16.635 3.27248C17.1054 3.51217 17.4878 3.89462 17.7275 4.36502C18 4.8998 18 5.59987 18 7",
  "M16 15L15.7 15.4C15.1111 16.1851 14.8167 16.5777 14.3944 16.7889C13.9721 17 13.4814 17 12.5 17H11.5C10.5186 17 10.0279 17 9.60557 16.7889C9.18328 16.5777 8.88885 16.1851 8.3 15.4L8 15",
];
const TICK_02_PATHS = ["M5 14L8.5 17.5L19 6.5"];
const UNDO_02_PATHS = [
  "M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C8.66873 3 5.76018 4.80989 4.20404 7.5",
  "M3 3V4.27816C3 6.47004 3 7.56599 3.70725 8.16512C4.4145 8.76425 5.49553 8.58408 7.6576 8.22373L9 8",
];

function Glyph({
  paths,
  size,
  strokeWidth,
}: {
  paths: readonly string[];
  size: number;
  strokeWidth: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function FuseButton({
  label = "بایگانی",
  undoLabel = "بازگرداندن",
  doneLabel = "بایگانی شد",
  icon,
  color = "#fafafa",
  background = "#232323",
  fuseColor = "#f5a524",
  size = "md",
  radius = 22,
  undoWindow = 4000,
  fuse = "outline",
  fuseThickness = 1.5,
  crossfadeMs = 200,
  commitOn = "press",
  pauseOnHover = true,
  settle = "reset",
  disabled = false,
  autoPreview = false,
  onCommit,
  onUndo,
  onFuseEnd,
  onPhaseChange,
  className = "",
  type = "button",
}: FuseButtonProps) {
  const [phase, setPhase] = useState<FusePhase>("idle");
  const [instant, setInstant] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLButtonElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLElement>(null);
  const rimRef = useRef<SVGRectElement>(null);
  const anim = useRef<Animation | null>(null);
  const pause = useRef({ hover: false, hidden: false, canHoverPause: false });
  const lastInput = useRef<"pointer" | "keyboard">("pointer");
  const windowRef = useRef(undoWindow);
  const autoArming = useRef(false);
  const phaseRef = useRef<FusePhase>("idle");
  phaseRef.current = phase;
  const latest = useRef({
    onCommit,
    onUndo,
    onFuseEnd,
    onPhaseChange,
    commitOn,
    settle,
    doneLabel,
  });
  latest.current = { onCommit, onUndo, onFuseEnd, onPhaseChange, commitOn, settle, doneLabel };
  const statusId = useId();
  const [announcement, setAnnouncement] = useState("");
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preset = SIZES[size] ?? SIZES.md;

  const go = (next: FusePhase) => {
    setInstant(lastInput.current === "keyboard");
    setPhase(next);
    latest.current.onPhaseChange?.(next);
  };

  const syncPlayState = () => {
    const a = anim.current;
    if (!a) return;
    const { hover, hidden } = pause.current;
    if (hover || hidden) {
      if (a.playState === "running") a.pause();
    } else if (a.playState === "paused") {
      a.play();
    }
  };

  const light = (from = 0) => {
    const el = fuse === "outline" ? rimRef.current : lineRef.current;
    if (!el) return;
    anim.current?.cancel();
    const a = el.animate(fuse === "outline" ? OUTLINE : LINE, {
      duration: windowRef.current,
      easing: "linear",
      fill: "forwards",
    });
    if (from) a.currentTime = from;
    a.onfinish = () => {
      const l = latest.current;
      l.onFuseEnd?.();
      if (l.commitOn === "fuseEnd") l.onCommit?.("fuseEnd");
      lastInput.current = "pointer";
      setAnnouncement(l.doneLabel || "");
      if (announceTimer.current) clearTimeout(announceTimer.current);
      announceTimer.current = setTimeout(() => setAnnouncement(""), 2500);
      go(l.settle === "stay" ? "settled" : "idle");
    };
    anim.current = a;
    syncPlayState();
  };

  const arm = () => {
    if (disabled || phaseRef.current !== "idle") return;
    windowRef.current = undoWindow;
    light();
    setAnnouncement("");
    if (announceTimer.current) clearTimeout(announceTimer.current);
    pause.current.canHoverPause = false;
    pause.current.hover = false;
    if (commitOn === "press") onCommit?.("press");
    go("armed");
  };

  const undo = () => {
    if (phaseRef.current !== "armed") return;
    const a = anim.current;
    if (a) {
      a.onfinish = null;
      a.pause();
    }
    onUndo?.();
    go("idle");
  };

  useEffect(() => {
    if (autoArming.current) {
      autoArming.current = false;
      return;
    }
    const inside = rootRef.current?.contains(document.activeElement);
    if (phase === "armed") undoRef.current?.focus({ preventScroll: true });
    else if (inside)
      (phase === "idle" ? idleRef.current : rootRef.current)?.focus({
        preventScroll: true,
      });
  }, [phase]);

  useEffect(() => {
    const onVisibility = () => {
      pause.current.hidden = document.hidden;
      syncPlayState();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      anim.current?.cancel();
      if (announceTimer.current) clearTimeout(announceTimer.current);
    };
  }, []);

  useEffect(() => {
    const a = anim.current;
    if (!a || phase !== "armed") return;
    light(Number(a.currentTime) || 0);
  }, [fuse]);

  useEffect(() => {
    if (pauseOnHover) return;
    pause.current.hover = false;
    syncPlayState();
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoPreview || disabled) return undefined;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cycles = 0;
    const GAP_MS = 900;
    const UNDO_AT = 0.45;

    const cycle = () => {
      if (!alive) return;
      if (phaseRef.current !== "idle") {
        timer = setTimeout(cycle, 400);
        return;
      }
      cycles += 1;
      const cancelled = cycles % 2 === 0;
      autoArming.current = true;
      windowRef.current = undoWindow;
      arm();

      if (cancelled) {
        timer = setTimeout(
          () => {
            if (!alive) return;
            undo();
            timer = setTimeout(cycle, GAP_MS);
          },
          Math.max(700, undoWindow * UNDO_AT),
        );
        return;
      }

      if (settle !== "stay") {
        timer = setTimeout(cycle, undoWindow + GAP_MS);
      }
    };

    timer = setTimeout(cycle, GAP_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
      if (phaseRef.current === "armed") {
        autoArming.current = true;
        undo();
      }
    };
  }, [autoPreview, disabled, settle, undoWindow]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    lastInput.current = "pointer";
    const pressable = phase === "armed" || (phase === "idle" && !disabled);
    if (e.button === 0 && pressable && rootRef.current)
      rootRef.current.dataset.pressed = "";
  };
  const release = () => {
    if (rootRef.current) delete rootRef.current.dataset.pressed;
  };
  const handlePointerEnter = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (
      pauseOnHover &&
      e.pointerType === "mouse" &&
      pause.current.canHoverPause
    ) {
      pause.current.hover = true;
      syncPlayState();
    }
  };
  const handlePointerLeave = (e: ReactPointerEvent<HTMLSpanElement>) => {
    release();
    if (e.pointerType !== "mouse") return;
    pause.current.canHoverPause = true;
    pause.current.hover = false;
    syncPlayState();
  };
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") lastInput.current = "keyboard";
    if (e.key === "Escape" && phase === "armed") {
      e.preventDefault();
      lastInput.current = "keyboard";
      undo();
    }
  };

  const actionIcon = icon ?? (
    <Glyph paths={ARCHIVE_02_PATHS} size={preset.icon} strokeWidth={1.8} />
  );
  const line = (
    <i ref={lineRef} className="fuse-button__fuse" aria-hidden="true" />
  );

  const rootStyle: StyleVars = {
    "--fb-ink": color,
    "--fb-bg": background,
    "--fb-fuse": fuseColor,
    "--fb-fuse-h": `${fuseThickness}px`,
    "--fb-radius": `${radius}px`,
    "--fb-fade": `${crossfadeMs}ms`,
    "--fb-h": `${preset.height}px`,
    "--fb-fs": `${preset.font}px`,
    "--fb-icon": `${preset.icon}px`,
    "--fb-px": `${preset.px}px`,
  };

  return (
    <span
      ref={rootRef}
      tabIndex={-1}
      className={cn("fuse-button", className)}
      data-phase={phase}
      data-fuse={fuse}
      data-instant={instant ? "" : undefined}
      aria-disabled={phase === "settled" || undefined}
      style={rootStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={idleRef}
        type={type}
        className="fuse-button__face fuse-button__idle"
        disabled={disabled}
        inert={phase !== "idle" || undefined}
        onClick={arm}
      >
        <span className="fuse-button__icon" aria-hidden="true">
          {actionIcon}
        </span>
        {label}
      </button>
      <button
        ref={undoRef}
        type="button"
        className="fuse-button__face fuse-button__undo"
        aria-describedby={statusId}
        aria-keyshortcuts="Escape"
        inert={phase !== "armed" || undefined}
        onClick={undo}
      >
        <span
          className="fuse-button__icon fuse-button__icon--undo"
          aria-hidden="true"
        >
          <Glyph paths={UNDO_02_PATHS} size={preset.icon} strokeWidth={2} />
        </span>
        {undoLabel}
        {fuse !== "outline" ? line : null}
      </button>
      <span
        className="fuse-button__face fuse-button__settled"
        inert={phase !== "settled" || undefined}
      >
        <span className="fuse-button__icon" aria-hidden="true">
          <Glyph paths={TICK_02_PATHS} size={preset.icon} strokeWidth={2.2} />
        </span>
        {doneLabel}
      </span>
      {fuse === "outline" ? (
        <svg className="fuse-button__rim" aria-hidden="true">
          <rect ref={rimRef} pathLength="1" />
        </svg>
      ) : null}
      <span
        className="fuse-button__status"
        id={statusId}
        role="status"
        aria-live="polite"
      >
        {announcement || (phase === "armed" ? undoLabel : phase === "settled" ? doneLabel : "")}
      </span>
    </span>
  );
}
