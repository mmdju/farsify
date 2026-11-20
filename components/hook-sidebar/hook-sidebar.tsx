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
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useReducedMotion } from "motion/react";

const CORNER = 6;

const DASH =
  "repeating-linear-gradient(to top, transparent 0 2px, currentColor 2px 4px)";

export type HookSidebarItem = string | { label: string; href?: string };

export type HookSidebarProps = Omit<ComponentProps<"nav">, "onChange"> & {
  items: HookSidebarItem[];
  label?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  color?: string;
  dashed?: boolean;
};

const labelOf = (item: HookSidebarItem) =>
  typeof item === "string" ? item : item.label;

const hrefOf = (item: HookSidebarItem) =>
  typeof item === "string" ? undefined : item.href;

function Rail({
  from = 0,
  y,
  visible,
  color,
  dashed,
  className,
}: {
  from?: number;
  y: number | null;
  visible: boolean;
  color?: string;
  dashed: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const travel = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      style={{ color }}
      animate={{ opacity: visible && y !== null ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.2 }}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <motion.span
        initial={false}
        animate={{ top: from, height: Math.max(0, (y ?? 0) - CORNER - from) }}
        transition={travel}
        style={
          dashed
            ? { backgroundImage: DASH }
            : { backgroundColor: "currentColor" }
        }
        className="absolute start-0.5 w-px"
      />
      <motion.svg
        initial={false}
        animate={{ top: (y ?? 0) - CORNER }}
        transition={travel}
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        className="absolute start-0.5 rtl:-scale-x-100"
      >
        <path
          d="M0.5 0a6 6 0 0 0 6 6H12"
          stroke="currentColor"
          strokeDasharray={dashed ? "2 2" : undefined}
        />
      </motion.svg>
    </motion.span>
  );
}

export default function HookSidebar({
  items,
  label,
  value,
  defaultValue = 0,
  onChange,
  color = "var(--primary, currentColor)",
  dashed = true,
  className,
  ...props
}: HookSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [centers, setCenters] = useState<number[]>([]);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);

  const activeIndex = value ?? internalValue;

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () =>
      setCenters(
        itemRefs.current.map((el) =>
          el ? el.offsetTop + el.offsetHeight / 2 : 0,
        ),
      );
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const el of itemRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [items.length]);

  const activeY = activeIndex < 0 ? null : (centers[activeIndex] ?? null);
  const hoverY = hoverIndex === null ? null : (centers[hoverIndex] ?? null);

  const hoverFrom =
    activeY !== null && hoverY !== null && hoverY <= activeY
      ? Math.max(0, hoverY - CORNER)
      : (activeY ?? 0);

  const select = (index: number) => {
    setInternalValue(index);
    onChange?.(index);
  };

  return (
    <nav
      data-slot="hook-sidebar"
      aria-label={label}
      className={cn("flex flex-col", className)}
      {...props}
    >
      {label ? (
        <span
          data-slot="hook-sidebar-label"
          className="pb-3 ps-0.5 pe-2 text-sm font-medium text-foreground"
        >
          {label}
        </span>
      ) : null}

      <div
        ref={listRef}
        onMouseLeave={() => setPointerInside(false)}
        className="relative flex flex-col gap-0.5"
      >
        <Rail
          from={hoverFrom}
          y={hoverY}
          visible={(pointerInside || focusInside) && hoverIndex !== activeIndex}
          dashed={dashed}
          className="text-muted-foreground"
        />
        <Rail y={activeY} visible={activeY !== null} color={color} dashed={dashed} />

        {items.map((item, index) => {
          const text = labelOf(item);
          const href = hrefOf(item);
          const isActive = index === activeIndex;

          const shared = {
            "data-slot": "hook-sidebar-item",
            "data-active": isActive,
            ref: (el: HTMLElement | null) => {
              itemRefs.current[index] = el;
            },
            onMouseEnter: () => {
              setHoverIndex(index);
              setPointerInside(true);
            },
            onFocus: () => {
              setHoverIndex(index);
              setFocusInside(true);
            },
            onBlur: () => setFocusInside(false),
            onClick: (event: ReactMouseEvent<HTMLElement>) => {
              if (href === "#") event.preventDefault();
              select(index);
            },
            className: cn(
              "w-full rounded-lg py-1.5 ps-5 pe-2 text-start text-sm transition-colors duration-200",
              "motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-brand",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            ),
          };

          return href ? (
            <a
              key={`${index}-${text}`}
              href={href}
              {...shared}
              aria-current={isActive ? "page" : undefined}
            >
              {text}
            </a>
          ) : (
            <button
              key={`${index}-${text}`}
              type="button"
              {...shared}
              aria-current={isActive ? "true" : undefined}
            >
              {text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { HookSidebar };
