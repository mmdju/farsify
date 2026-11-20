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
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import "./pulse-heart.css";

const HEART_PATH =
  "M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z";

const STAR_PATH =
  "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z";

const THUMB_PATHS = [
  "M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z",
  "M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z",
] as const;

export type PulseHeartIconName = "heart" | "star" | "thumb";
export type PulseHeartIcon = PulseHeartIconName | ReactNode;

const ICON_PATHS: Record<PulseHeartIconName, readonly string[]> = {
  heart: [HEART_PATH],
  star: [STAR_PATH],
  thumb: THUMB_PATHS,
};

const OUT = 0.4;

const back = (k: number, c: number) => {
  const u = k - 1;
  return 1 + (c + 1) * u ** 3 + c * u ** 2;
};

const swellOf = (t: number, c: number) =>
  t <= 0 ? 0 : t < OUT ? 1 - (1 - t / OUT) ** 3 : 1 - back((t - OUT) / (1 - OUT), c);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Shown = { liked: boolean; count: number };
type Roll = { a: string; b: string; at: number; up: boolean };
type Cell = { ch: string } | { top: string; bottom: string };
type StyleVars = CSSProperties & Record<`--${string}`, string>;

export interface PulseHeartProps {
  liked?: boolean;
  defaultLiked?: boolean;
  count?: number;
  onChange?: (liked: boolean, count: number) => void;
  showCount?: boolean;
  icon?: PulseHeartIcon;
  idleOutline?: boolean;
  size?: number;
  corner?: number;
  likedColor?: string;
  idleColor?: string;
  pillColor?: string;
  textColor?: string;
  duration?: number;
  dotSize?: number;
  overshoot?: number;
  beat?: number;
  rollDuration?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function PulseHeart({
  liked: likedProp,
  defaultLiked = false,
  count = 0,
  onChange,
  showCount = true,
  icon = "heart",
  idleOutline = true,
  size = 40,
  corner = 32,
  likedColor = "#ff4d6d",
  idleColor = "#8a8a8a",
  pillColor = "#232323",
  textColor = "#fafafa",
  duration = 560,
  dotSize = 0.3,
  overshoot = 1.7,
  beat = 3,
  rollDuration = 350,
  disabled = false,
  label = "پسندیدن",
  className = "",
}: PulseHeartProps) {
  const controlled = likedProp !== undefined;
  const [inner, setInner] = useState(defaultLiked);
  const [total, setTotal] = useState(count);
  const liked = controlled ? likedProp : inner;
  useEffect(() => {
    if (likedProp !== undefined) setInner(likedProp);
  }, [likedProp]);
  const [shown, setShown] = useState<Shown>({ liked, count });
  const [roll, setRoll] = useState<Roll | null>(null);

  const rootRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const glyphRef = useRef<SVGGElement>(null);
  const rollRef = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const viaPointer = useRef(false);
  const shownRef = useRef<Shown>(shown);
  const logical = useRef<Shown>({ liked, count: total });
  logical.current = { liked, count: total };
  const cfg = useRef({ duration, dotSize, overshoot, beat, rollDuration });
  cfg.current = { duration, dotSize, overshoot, beat, rollDuration };

  useEffect(() => {
    setTotal(count);
  }, [count]);

  const firstProp = useRef(true);
  useEffect(() => {
    if (firstProp.current) {
      firstProp.current = false;
      return;
    }
    if (raf.current) return;
    if (shownRef.current.liked === liked && shownRef.current.count === total) return;
    if (
      !reducedMotion() &&
      rootRef.current &&
      heartRef.current &&
      pillRef.current
    ) {
      run(liked, total);
      return;
    }
    shownRef.current = { liked, count: total };
    setShown(shownRef.current);
  }, [liked, total]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.instant === undefined) return;
    root.getBoundingClientRect();
    delete root.dataset.instant;
  }, [shown]);

  useLayoutEffect(() => {
    const el = rollRef.current;
    if (!el || !roll) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${roll.up ? "0" : "-1em"})`;
    el.getBoundingClientRect();
    el.style.transition = "";
    el.style.transform = `translateY(${roll.up ? "-1em" : "0"})`;
  }, [roll]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      clearTimeout(rollTimer.current);
    },
    [],
  );

  const startRoll = (from: number, to: number) => {
    if (from === to) return;
    const a = formatFa(from);
    const b = formatFa(to);
    const changed =
      a.length === b.length ? [...b].flatMap((ch, i) => (ch !== a[i] ? [i] : [])) : [];
    setRoll({ a, b, at: changed.length === 1 ? changed[0] : -1, up: to > from });
    clearTimeout(rollTimer.current);
    rollTimer.current = setTimeout(() => setRoll(null), cfg.current.rollDuration);
  };

  const run = (nextLiked: boolean, nextCount: number) => {
    const root = rootRef.current;
    const heart = heartRef.current;
    const pill = pillRef.current;
    if (!root || !heart || !pill) return;
    const glyph = glyphRef.current;
    root.dataset.running = "";
    let swapped = false;
    let prev = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const { duration: D, dotSize: dot, overshoot: c, beat: B } = cfg.current;
      const t = Math.min(1, (now - t0) / D);
      const step = prev ? now - prev : 1000 / 60;
      prev = now;
      const s = swellOf(t, c);
      const k = 1 - (1 - dot) * s;
      if (glyph) {
        glyph.setAttribute("transform", `translate(12 12) scale(${k}) translate(-12 -12)`);
      } else {
        heart.style.transform = `scale(${k})`;
      }
      pill.style.transform = `scale(${1 - (B / 100) * s})`;
      if (!swapped && t + step / 2 / D >= OUT) {
        swapped = true;
        root.dataset.liked = String(nextLiked);
        startRoll(shownRef.current.count, nextCount);
        shownRef.current = { liked: nextLiked, count: nextCount };
        setShown(shownRef.current);
      }
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      raf.current = 0;
      if (glyph) glyph.removeAttribute("transform");
      heart.style.transform = "";
      pill.style.transform = "";
      delete root.dataset.running;
      const l = logical.current;
      if (l.liked !== shownRef.current.liked || l.count !== shownRef.current.count) {
        shownRef.current = { liked: l.liked, count: l.count };
        setShown(shownRef.current);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || disabled) return;
    viaPointer.current = true;
    if (!reducedMotion() && rootRef.current) rootRef.current.dataset.pressed = "";
  };
  const handlePointerUp = () => {
    if (rootRef.current) delete rootRef.current.dataset.pressed;
  };
  const handlePointerCancel = () => {
    viaPointer.current = false;
    handlePointerUp();
  };
  const handleKeyDown = () => {
    viaPointer.current = false;
  };
  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (disabled || raf.current) return;
    const pointer = viaPointer.current && e.detail !== 0;
    viaPointer.current = false;
    const nextLiked = !liked;
    const nextCount = total + (nextLiked ? 1 : -1);
    if (!controlled) setInner(nextLiked);
    setTotal(nextCount);
    onChange?.(nextLiked, nextCount);
    if (pointer && !reducedMotion()) run(nextLiked, nextCount);
    else if (rootRef.current) rootRef.current.dataset.instant = "";
  };

  const paths =
    typeof icon === "string"
      ? (ICON_PATHS[icon as PulseHeartIconName] ?? ICON_PATHS.heart)
      : null;
  const text = formatFa(shown.count);
  const cells: Cell[] = roll
    ? roll.at === -1
      ? [{ top: roll.up ? roll.a : roll.b, bottom: roll.up ? roll.b : roll.a }]
      : [...roll.b].map((ch, i) =>
          i === roll.at
            ? { top: roll.up ? roll.a[i] : ch, bottom: roll.up ? ch : roll.a[i] }
            : { ch },
        )
    : [...text].map((ch) => ({ ch }));

  const rootStyle: StyleVars = {
    "--ph-size": `${size}px`,
    "--ph-corner": `${corner}px`,
    "--ph-pill": pillColor,
    "--ph-idle": idleColor,
    "--ph-liked": likedColor,
    "--ph-text": textColor,
    "--ph-roll": `${rollDuration}ms`,
    "--ph-stroke": `${(1.5 * size) / 24}px`,
  };

  return (
    <button
      ref={rootRef}
      type="button"
      aria-pressed={liked}
      disabled={disabled}
      data-liked={String(shown.liked)}
      data-solid={idleOutline ? undefined : ""}
      data-no-count={showCount ? undefined : ""}
      className={cn("pulse-heart", className)}
      style={rootStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <span ref={pillRef} className="pulse-heart__pill">
        <span ref={heartRef} className="pulse-heart__heart" aria-hidden="true">
          {paths ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g ref={glyphRef}>
                {paths.map((d) => (
                  <path key={d} d={d} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            </svg>
          ) : (
            icon
          )}
        </span>
        {showCount ? (
          <span className="pulse-heart__count" aria-hidden="true">
            {cells.map((cell, i) =>
              "ch" in cell ? (
                <span key={`c${i}`}>{cell.ch}</span>
              ) : (
                <span key={`r${i}`} className="pulse-heart__slot">
                  <span ref={rollRef} className="pulse-heart__roll">
                    <span>{cell.top}</span>
                    <span>{cell.bottom}</span>
                  </span>
                </span>
              ),
            )}
          </span>
        ) : null}
        <span className="pulse-heart__sr">
          {showCount ? `${label}، ${formatFa(total)}` : label}
        </span>
      </span>
    </button>
  );
}

export default PulseHeart;
