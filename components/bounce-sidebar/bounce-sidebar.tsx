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
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { arc, useAnimate, useReducedMotion } from "motion/react";

const DOT = 6;

const MIN_STEP = 0.5;

const snapPx = (value: number, dpr: number) => Math.round(value * dpr) / dpr;

export type BounceSidebarItem =
  | string
  | { label: string; href?: string }
  | { label: string; heading: true };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  dotColor?: string;
};

const isHeading = (
  item: BounceSidebarItem,
): item is { label: string; heading: true } =>
  typeof item !== "string" && "heading" in item;

const labelOf = (item: BounceSidebarItem) =>
  typeof item === "string" ? item : item.label;

const hrefOf = (item: BounceSidebarItem) =>
  typeof item === "string" || isHeading(item) ? undefined : item.href;

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor = "var(--primary, currentColor)",
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);

  const [dotSize, setDotSize] = useState(DOT);
  const [ready, setReady] = useState(false);
  const [measureTick, setMeasureTick] = useState(0);

  const reduce = useReducedMotion();

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setDotSize(snapPx(DOT, dpr));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bump = () => {
      if (!cancelled) setMeasureTick((n) => n + 1);
    };

    const raf = requestAnimationFrame(bump);
    void document.fonts?.ready.then(bump);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  useIsoLayoutEffect(() => {
    const el = itemRefs.current[activeIndex];
    const node = dot.current;
    if (!el || !node) return;

    const dpr = window.devicePixelRatio || 1;
    const toY = snapPx(el.offsetTop + el.offsetHeight / 2 - dotSize / 2, dpr);

    if (prevY.current === null) {
      animate(node, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
      return;
    }

    const delta = toY - prevY.current;
    if (Math.abs(delta) < MIN_STEP) {
      animate(node, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
      return;
    }

    prevY.current = toY;

    if (reduce) {
      animate(node, { x: 0, y: toY }, { duration: 0 });
      setReady(true);
      return;
    }

    const rtl = getComputedStyle(el).direction === "rtl";
    const down = delta > 0;
    const direction = rtl ? (down ? "cw" : "ccw") : (down ? "ccw" : "cw");

    animate(
      node,
      { x: 0, y: toY },
      {
        duration: 0.25,
        ease: "easeOut",
        path: arc({
          strength: Math.min(0.8, 14 / Math.abs(delta)),
          direction,
        }),
      },
    );
    setReady(true);
  }, [activeIndex, dotSize, measureTick, reduce, animate, dot]);

  const select = (index: number) => {
    setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex min-w-0 flex-col gap-1 ps-6", className)}
      {...props}
    >
      <span
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none absolute start-2 top-0 rounded-full transition-opacity duration-150 motion-reduce:transition-none"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: dotColor,
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = labelOf(item);

        if (isHeading(item)) {
          return (
            <li
              key={`${index}-${label}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="presentation"
              data-slot="bounce-sidebar-heading"
              className={cn(
                "px-1 pb-1 text-sm font-semibold text-foreground",
                index > 0 && "pt-7",
              )}
            >
              {label}
            </li>
          );
        }

        const href = hrefOf(item);
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full items-center rounded-lg p-1 text-start text-sm transition-colors duration-200",
          "cursor-pointer motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-brand",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        );
        const shared = {
          "data-slot": "bounce-sidebar-item",
          "data-active": isActive,
          onClick: (event: ReactMouseEvent<HTMLElement>) => {
            if (href === "#") event.preventDefault();
            select(index);
          },
          className: itemClassName,
        };

        return (
          <li
            key={`${index}-${label}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <a
                href={href}
                {...shared}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </a>
            ) : (
              <button
                type="button"
                {...shared}
                aria-current={isActive ? "true" : undefined}
              >
                {label}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { BounceSidebar };
