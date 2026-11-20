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
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import "./peek-rating.css";

const HEART_PATH =
  "M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z";

const STAR_PATH =
  "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z";

const FLASH_PATH =
  "M5.22576 11.3294L12.224 2.34651C12.7713 1.64397 13.7972 2.08124 13.7972 3.01707V9.96994C13.7972 10.5305 14.1995 10.985 14.6958 10.985H18.0996C18.8729 10.985 19.2851 12.0149 18.7742 12.6706L11.776 21.6535C11.2287 22.356 10.2028 21.9188 10.2028 20.9829V14.0301C10.2028 13.4695 9.80048 13.015 9.3042 13.015H5.90035C5.12711 13.015 4.71494 11.9851 5.22576 11.3294Z";

export type PeekRatingShape = "star" | "heart" | "bolt";

const SHAPE_PATHS: Record<PeekRatingShape, string> = {
  star: STAR_PATH,
  heart: HEART_PATH,
  bolt: FLASH_PATH,
};

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

type PeekState = {
  hover: number | null;
  pressing: boolean;
  pointerId: number | null;
  settled: boolean;
  rect: DOMRect | null;
  rtl: boolean;
};

export interface PeekRatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onPreview?: (value: number | null) => void;
  count?: number;
  shape?: PeekRatingShape;
  icon?: ReactNode;
  labels?: string[];
  activeColor?: string;
  idleColor?: string;
  tipColor?: string;
  tipTextColor?: string;
  size?: number;
  lift?: number;
  magnify?: number;
  riseDuration?: number;
  popScale?: number;
  showTip?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function PeekRating({
  value: valueProp,
  defaultValue = 0,
  onChange,
  onPreview,
  count = 5,
  shape = "star",
  icon,
  labels = [],
  activeColor = "#f5b400",
  idleColor = "#525252",
  tipColor = "#232323",
  tipTextColor = "#fafafa",
  size = 28,
  lift = 6,
  magnify = 1.15,
  riseDuration = 320,
  popScale = 1.3,
  showTip = true,
  allowClear = true,
  readOnly = false,
  disabled = false,
  ariaLabel = "امتیاز",
  className = "",
}: PeekRatingProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = clamp(valueProp ?? inner, 0, count);
  useEffect(() => {
    if (valueProp !== undefined) setInner(clamp(valueProp, 0, count));
  }, [valueProp, count]);
  const interactive = !readOnly && !disabled;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const tipEl = useRef<HTMLSpanElement | null>(null);
  const starEls = useRef<Array<HTMLElement | null>>([]);
  const liftEls = useRef<Array<HTMLElement | null>>([]);
  const glyphEls = useRef<Array<HTMLElement | null>>([]);
  const st = useRef<PeekState>({
    hover: null,
    pressing: false,
    pointerId: null,
    settled: false,
    rect: null,
    rtl: false,
  });

  const paint = () => {
    const { hover, settled, rtl } = st.current;
    const previewing = hover !== null && !settled;
    const shown = previewing ? hover + 1 : value;
    const still = reducedMotion();

    for (let i = 0; i < count; i++) {
      const liftEl = liftEls.current[i];
      const glyphEl = glyphEls.current[i];
      if (!liftEl || !glyphEl) continue;
      const lifted = previewing && !still && i <= hover;
      liftEl.style.transform = lifted
        ? `translateY(${-lift}px) scale(${i === hover ? magnify : 1})`
        : "translateY(0px) scale(1)";
      glyphEl.dataset.lit = String(i < shown);
    }

    const tip = tipEl.current;
    if (!tip) return;
    if (previewing && showTip) {
      const row = rowRef.current;
      const slot = row ? row.clientWidth / count : size;
      const visual = rtl ? count - 1 - hover : hover;
      const wasHidden = tip.dataset.show !== "true";
      if (wasHidden) tip.style.transition = "none";
      tip.textContent = labels[hover] ?? toFaDigits(hover + 1);
      tip.style.transform = `translate(calc(${slot * (visual + 0.5)}px - 50%), 0)`;
      if (wasHidden) {
        void tip.offsetWidth;
        tip.style.transition = "";
      }
      tip.dataset.show = "true";
    } else {
      tip.dataset.show = "false";
    }
  };
  useLayoutEffect(paint);

  const setHover = (index: number | null) => {
    if (index === st.current.hover) return;
    st.current.hover = index;
    if (index !== null) st.current.settled = false;
    paint();
    onPreview?.(index === null ? null : index + 1);
  };
  const setHoverRef = useRef(setHover);
  setHoverRef.current = setHover;

  const measure = () => {
    const row = rowRef.current;
    if (!row) return;
    st.current.rect = row.getBoundingClientRect();
    st.current.rtl = getComputedStyle(row).direction === "rtl";
  };

  const indexAt = (x: number, y: number): number | null => {
    const { rect, pressing, rtl } = st.current;
    if (!rect || !rect.width) return null;
    if (pressing && (y < rect.top - size || y > rect.bottom + size)) return null;
    const index = clamp(
      Math.floor(((x - rect.left) / rect.width) * count),
      0,
      count - 1,
    );
    return rtl ? count - 1 - index : index;
  };

  const popGlyph = (next: number) => {
    const glyph = glyphEls.current[next - 1];
    if (
      next <= 0 ||
      popScale <= 1 ||
      !glyph ||
      typeof glyph.animate !== "function" ||
      reducedMotion()
    )
      return;
    glyph.getAnimations().forEach((animation) => animation.cancel());
    glyph.animate(
      [
        { transform: "scale(1)", easing: EASE_OUT },
        { transform: `scale(${popScale})`, offset: 0.35, easing: EASE_OUT },
        { transform: "scale(1)" },
      ],
      { duration: 300 },
    );
  };

  const commit = (next: number, pop = true) => {
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
    st.current.settled = true;
    paint();
    if (pop) popGlyph(next);
  };

  const lastProp = useRef(valueProp);
  useEffect(() => {
    if (valueProp === undefined) return;
    if (lastProp.current === valueProp) return;
    lastProp.current = valueProp;
    st.current.settled = true;
    popGlyph(clamp(valueProp, 0, count));
  }, [valueProp]);

  const handlePointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.pointerType !== "mouse") return;
    rootRef.current?.removeAttribute("data-instant");
    measure();
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.button !== 0 || st.current.pointerId !== null) return;
    rootRef.current?.removeAttribute("data-instant");
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    st.current.pointerId = e.pointerId;
    st.current.pressing = true;
    measure();
    setHover(indexAt(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const { pressing, pointerId } = st.current;
    if (e.pointerType !== "mouse" && !pressing) return;
    if (pressing && e.pointerId !== pointerId) return;
    if (!pressing && !st.current.rect) measure();
    setHover(indexAt(e.clientX, e.clientY));
  };

  const endPress = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { pressing, pointerId, hover } = st.current;
    if (!pressing || e.pointerId !== pointerId) return;
    st.current.pressing = false;
    st.current.pointerId = null;
    if (e.type === "pointerup" && hover !== null) {
      const next = hover + 1;
      commit(allowClear && next === value ? 0 : next);
    }
    if (e.pointerType !== "mouse") setHover(null);
  };

  const handlePointerLeave = () => {
    if (!st.current.pressing) setHover(null);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const min = allowClear ? 0 : 1;
    let next: number;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        next = clamp(value + 1, min, count);
        break;
      case "ArrowRight":
      case "ArrowDown":
        next = clamp(value - 1, min, count);
        break;
      case "Home":
        next = 1;
        break;
      case "End":
        next = count;
        break;
      case "Backspace":
      case "Delete":
        if (!allowClear) return;
        next = 0;
        break;
      case " ":
      case "Enter": {
        const index = starEls.current.indexOf(e.target as HTMLElement);
        if (index === -1) return;
        next = allowClear && index + 1 === value ? 0 : index + 1;
        break;
      }
      default:
        return;
    }
    e.preventDefault();
    rootRef.current?.setAttribute("data-instant", "true");
    st.current.hover = null;
    commit(next, false);
    starEls.current[Math.max(next, 1) - 1]?.focus();
  };

  useEffect(() => {
    const reset = () => {
      st.current.pressing = false;
      st.current.pointerId = null;
      setHoverRef.current(null);
    };
    const onVisibility = () => {
      if (document.hidden) reset();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", reset);
    };
  }, []);

  const Star = (readOnly ? "span" : "button") as ElementType;
  const shapeIcon = SHAPE_PATHS[shape] ?? SHAPE_PATHS.star;
  const tipRoom = interactive && showTip ? Math.round(size * 0.9) : 0;

  const rootStyle: StyleVars = {
    "--pr-active": activeColor,
    "--pr-idle": idleColor,
    "--pr-tip": tipColor,
    "--pr-tip-text": tipTextColor,
    "--pr-size": `${size}px`,
    "--pr-gap": `${Math.round(size * 0.22)}px`,
    "--pr-room": `${lift + tipRoom}px`,
    "--pr-rise": `${riseDuration}ms`,
  };

  return (
    <div
      ref={rootRef}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={
        readOnly ? `${toFaDigits(value)} از ${toFaDigits(count)}` : ariaLabel
      }
      aria-disabled={disabled || undefined}
      className={cn("peek-rating", className)}
      style={rootStyle}
      onKeyDown={readOnly ? undefined : handleKeyDown}
    >
      <div
        ref={rowRef}
        className="peek-rating__row"
        onPointerEnter={handlePointerEnter}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onLostPointerCapture={endPress}
        onPointerLeave={handlePointerLeave}
      >
        {interactive && showTip ? (
          <span ref={tipEl} className="peek-rating__tip" aria-hidden="true" />
        ) : null}
        {Array.from({ length: count }, (_, i) => {
          const checked = value === i + 1;
          const label = labels[i]
            ? `${toFaDigits(i + 1)} از ${toFaDigits(count)}، ${labels[i]}`
            : `${toFaDigits(i + 1)} از ${toFaDigits(count)}`;
          return (
            <Star
              key={i}
              ref={(el: HTMLElement | null) => {
                starEls.current[i] = el;
              }}
              type={readOnly ? undefined : "button"}
              className="peek-rating__star"
              role={readOnly ? undefined : "radio"}
              aria-checked={readOnly ? undefined : checked}
              aria-label={readOnly ? undefined : label}
              aria-hidden={readOnly || undefined}
              tabIndex={!interactive ? -1 : (value === 0 ? i === 0 : checked) ? 0 : -1}
            >
              <span
                ref={(el: HTMLElement | null) => {
                  liftEls.current[i] = el;
                }}
                className="peek-rating__lift"
              >
                <span
                  ref={(el: HTMLElement | null) => {
                    glyphEls.current[i] = el;
                  }}
                  className="peek-rating__glyph"
                >
                  {icon ?? (
                    <svg
                      viewBox="0 0 24 24"
                      width={size}
                      height={size}
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d={shapeIcon} />
                    </svg>
                  )}
                </span>
              </span>
            </Star>
          );
        })}
      </div>
    </div>
  );
}

export default PeekRating;
