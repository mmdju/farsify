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
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import "./lattice-loader.css";

type LatticeGrid = 3 | 4;

const PATTERNS: Record<
  string,
  Partial<Record<LatticeGrid, LatticePattern>>
> = {
  arrow: { 3: { cells: [1, 2, 3, 0, 1, 2, 1, 2, 3], loop: 7.2, scale: 1 } },
  dots: { 3: { cells: [0, 1, 2, 0, 1, 2, 0, 1, 2], loop: 3, scale: 2.4 } },
  ripple: { 3: { cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5 } },
  spiral: { 3: { cells: [0, 1, 2, 7, 8, 3, 6, 5, 4], loop: 9, scale: 1.2, lit: 0.35 } },
  orbit: {
    3: { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2 },
    4: {
      cells: [0, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6],
      loop: 6,
      scale: 1.2,
      lit: 0.45,
    },
  },
  snake: {
    3: { cells: [0, 1, 2, 5, 4, 3, 6, 7, 8], loop: 9, scale: 1, lit: 0.35 },
    4: {
      cells: [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12],
      loop: 16,
      scale: 1,
      lit: 0.25,
    },
  },
  sweep: { 4: { cells: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], loop: 5, scale: 1, lit: 0.45 } },
  spin: { 4: { cells: [0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 3, 3, 2, 2], loop: 4, scale: 1.6, lit: 0.35 } },
  rain: { 4: { cells: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5, 3, 5, 4, 6], loop: 4, scale: 1.2, lit: 0.35 } },
  pulse: { 4: { cells: [2, 1, 1, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2, 1, 1, 2], loop: 2.4, scale: 2.5, lit: 0.45 } },
};

const DEFAULT_PATTERN: Record<LatticeGrid, string> = { 3: "orbit", 4: "sweep" };

const MARKS: Record<LatticeGrid, { done: number[]; error: number[] }> = {
  3: { done: [2, 3, 5, 7], error: [0, 2, 4, 6, 8] },
  4: { done: [7, 8, 10, 13], error: [0, 3, 5, 6, 9, 10, 12, 15] },
};

const clampGrid = (grid: number): LatticeGrid => (grid === 4 ? 4 : 3);

const resolvePattern = (
  pattern: LatticePatternName | LatticePattern,
  grid: LatticeGrid,
): Required<LatticePattern> => {
  if (typeof pattern === "string") {
    const named = PATTERNS[pattern];
    const found = named?.[grid] ?? PATTERNS[DEFAULT_PATTERN[grid]][grid]!;
    return {
      cells: found.cells,
      loop: found.loop ?? 4.2,
      scale: found.scale ?? 1,
      lit: found.lit ?? 0.62,
    };
  }
  const cells = Array.from({ length: grid * grid }, (_, i) => pattern.cells[i] ?? null);
  const max = Math.max(0, ...cells.filter((v): v is number => v != null));
  return {
    cells,
    loop: pattern.loop ?? max + 4.2,
    scale: pattern.scale ?? 1,
    lit: pattern.lit ?? 0.62,
  };
};

const fmt = (ds: number) =>
  ds < 600
    ? `${formatFa(ds / 10, 1)} ثانیه`
    : `${formatFa(Math.floor(ds / 600))} دقیقه ${formatFa((ds % 600) / 10, 1)} ثانیه`;

const spoken = (ds: number) =>
  ds < 600
    ? `${formatFa(ds / 10, 1)} ثانیه`
    : `${formatFa(Math.floor(ds / 600))} دقیقه و ${formatFa((ds % 600) / 10, 1)} ثانیه`;

const TIMER_ZERO = fmt(0);

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

export type LatticeLoaderStatus = "working" | "done" | "error";

export type LatticeLoaderShape = "square" | "round";

export type LatticePatternName =
  | "arrow"
  | "dots"
  | "ripple"
  | "spiral"
  | "orbit"
  | "snake"
  | "sweep"
  | "spin"
  | "rain"
  | "pulse";

export interface LatticePattern {
  cells: Array<number | null>;
  loop?: number;
  scale?: number;
  lit?: number;
}

export interface LatticeLoaderProps {
  label?: string;
  doneLabel?: string;
  errorLabel?: string;
  status?: LatticeLoaderStatus;
  pattern?: LatticePatternName | LatticePattern;
  grid?: number;
  shape?: LatticeLoaderShape;
  color?: string;
  doneColor?: string;
  errorColor?: string;
  cellSize?: number;
  gap?: number;
  fontSize?: number;
  step?: number;
  idleOpacity?: number;
  glow?: boolean;
  glowColor?: string;
  showTimer?: boolean;
  elapsed?: number;
  className?: string;
  style?: CSSProperties;
}

export function LatticeLoader({
  label = "در حال فکر",
  doneLabel = "انجام شد در",
  errorLabel = "شکست پس از",
  status = "working",
  pattern = "orbit",
  grid = 3,
  shape = "round",
  color = "currentColor",
  doneColor = "#22c55e",
  errorColor = "#ef4444",
  cellSize = 6,
  gap = 2,
  fontSize = 14,
  step = 90,
  idleOpacity = 0.15,
  glow = true,
  glowColor = "",
  showTimer = true,
  elapsed,
  className = "",
  style,
}: LatticeLoaderProps) {
  const n = clampGrid(grid);
  const pat = resolvePattern(pattern, n);
  const marks = MARKS[n];
  const d = step * pat.scale;
  const cycle = Math.round(pat.loop * d);

  const timerRef = useRef<HTMLSpanElement | null>(null);
  const dsRef = useRef(0);
  const markRef = useRef<"done" | "error">("done");
  const mark = status === "working" ? markRef.current : status;
  markRef.current = mark;

  const [announce, setAnnounce] = useState(`${label}، در جریان است`);

  const painted = useRef(false);
  useEffect(() => {
    painted.current = false;
  }, [showTimer]);
  const paint = (ds: number) => {
    dsRef.current = ds;
    const el = timerRef.current;
    if (!el) return;
    if (!painted.current) {
      el.textContent = "";
      painted.current = true;
    }
    const runs = fmt(ds).match(/[۰-۹][۰-۹٫٬]*|[^۰-۹]+/g) ?? [];
    while (el.children.length > runs.length) el.lastElementChild?.remove();

    runs.forEach((run, ri) => {
      let node = el.children[ri] as HTMLElement | undefined;
      if (!node) {
        node = document.createElement("span");
        el.appendChild(node);
      }
      const numeric = /[۰-۹]/.test(run.charAt(0));
      const runClass = numeric ? "lattice-loader__num" : "";
      if (node.className !== runClass) node.className = runClass;

      if (!numeric) {
        if (node.textContent !== run) node.textContent = run;
        return;
      }
      while (node.children.length > run.length) node.lastElementChild?.remove();
      for (let i = 0; i < run.length; i += 1) {
        let slot = node.children[i] as HTMLElement | undefined;
        if (!slot) {
          slot = document.createElement("span");
          node.appendChild(slot);
        }
        const ch = run.charAt(i);
        const slotClass = /[۰-۹]/.test(ch) ? "lattice-loader__digit" : "";
        if (slot.className !== slotClass) slot.className = slotClass;
        if (slot.textContent !== ch) slot.textContent = ch;
      }
    });
  };

  useLayoutEffect(() => {
    if (elapsed != null) {
      paint(Math.round(elapsed * 10));
      return undefined;
    }
    if (status !== "working") return undefined;
    const startedAt = performance.now();
    paint(0);
    const id = setInterval(() => paint(Math.floor((performance.now() - startedAt) / 100)), 100);
    return () => clearInterval(id);
  }, [status, elapsed]);

  useEffect(() => {
    if (status === "working") setAnnounce(`${label}، در جریان است`);
    else
      setAnnounce(
        `${status === "done" ? doneLabel : errorLabel}${showTimer ? ` ${spoken(dsRef.current)}` : ""}`,
      );
  }, [status]);

  const rootStyle: StyleVars = {
    "--ll-n": n,
    "--ll-cell": `${cellSize}px`,
    "--ll-gap": `${gap}px`,
    "--ll-font": `${fontSize}px`,
    "--ll-color": color,
    "--ll-mark": status === "error" ? errorColor : doneColor,
    "--ll-idle": idleOpacity,
    "--ll-glow": glowColor || color,
    "--ll-mark-glow": glowColor || (status === "error" ? errorColor : doneColor),
    "--ll-cycle": `${cycle}ms`,
  };

  return (
    <span
      role="status"
      className={cn("lattice-loader", className)}
      data-status={status}
      data-shape={shape}
      data-glow={glow ? "" : undefined}
      style={{ ...rootStyle, ...style }}
    >
      <span className="lattice-loader__grid" aria-hidden="true">
        <span className="lattice-loader__layer lattice-loader__run">
          {pat.cells.map((unit, i) => (
            <span
              key={i}
              className="lattice-loader__cell"
              data-hole={unit == null ? "" : undefined}
              data-lit={
                pat.lit && pat.lit !== 0.62 ? Math.round(pat.lit * 100) : undefined
              }
              style={unit == null ? undefined : { animationDelay: `${Math.round(unit * d)}ms` }}
            />
          ))}
        </span>
        <span className="lattice-loader__layer lattice-loader__mark">
          {pat.cells.map((_, i) => (
            <span
              key={i}
              className="lattice-loader__cell"
              data-on={marks[mark].includes(i) ? "" : undefined}
            />
          ))}
        </span>
      </span>
      <span className="lattice-loader__label" aria-hidden="true">
        <span className="lattice-loader__text" data-active={status === "working" ? "" : undefined}>
          {label}
        </span>
        <span className="lattice-loader__text" data-active={status === "done" ? "" : undefined}>
          {doneLabel}
        </span>
        <span className="lattice-loader__text" data-active={status === "error" ? "" : undefined}>
          {errorLabel}
        </span>
      </span>
      {showTimer ? (
        <span ref={timerRef} className="lattice-loader__timer" aria-hidden="true">
          {TIMER_ZERO}
        </span>
      ) : null}
      <span className="lattice-loader__sr">{announce}</span>
    </span>
  );
}

export default LatticeLoader;
