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
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import "./branched-menu.css";

export interface BranchedMenuChild {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface BranchedMenuItem {
  label: string;
  value?: string;
  children?: BranchedMenuChild[];
}

export interface BranchedMenuProps {
  items?: BranchedMenuItem[];
  defaultOpen?: number | number[];
  defaultActive?: string;
  onSelect?: (value: string, item: BranchedMenuChild | BranchedMenuItem) => void;
  onToggle?: (index: number, open: boolean) => void;
  color?: string;
  accentColor?: string;
  activeLabelColor?: string;
  lineColor?: string;
  width?: number;
  rowHeight?: number;
  indent?: number;
  trunk?: number;
  radius?: number;
  lineWidth?: number;
  fontSize?: number;
  sectionFontSize?: number;
  sectionClassName?: string;
  dimInactiveSections?: boolean;
  drawDuration?: number;
  foldDuration?: number;
  autoPreview?: boolean;
  className?: string;
}

export const DEFAULT_ITEMS: BranchedMenuItem[] = [
  {
    label: "شروع کار",
    children: [
      { value: "install", label: "نصب" },
      { value: "quick", label: "شروع سریع" },
      { value: "config", label: "پیکربندی" },
      { value: "theming", label: "تم‌بندی" },
    ],
  },
  {
    label: "کامپوننت‌ها",
    children: [
      { value: "buttons", label: "دکمه‌ها" },
      { value: "typography", label: "تایپوگرافی" },
      { value: "overlays", label: "پوشانه‌ها" },
      { value: "toasts", label: "اعلان‌ها" },
    ],
  },
];

const PAD = 6;
const MARK = 16;

const renderIcon = (icon: ReactNode) =>
  isValidElement(icon) ? icon : null;

const toSet = (open: number | number[]) =>
  new Set(Array.isArray(open) ? open : open >= 0 ? [open] : []);

export function BranchedMenuBase({
  items = DEFAULT_ITEMS,
  defaultOpen = 0,
  defaultActive = "",
  onSelect,
  onToggle,
  color = "#fafafa",
  accentColor = "#fafafa",
  activeLabelColor,
  lineColor = "#3a3a3a",
  width = 240,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  sectionFontSize,
  sectionClassName = "",
  dimInactiveSections = false,
  drawDuration = 400,
  foldDuration = 300,
  autoPreview = false,
  className = "",
}: BranchedMenuProps) {
  const [open, setOpen] = useState<Set<number>>(() => toSet(defaultOpen));
  const [active, setActive] = useState(() => {
    if (defaultActive) return defaultActive;
    const first = items.find((it, i) => it.children && toSet(defaultOpen).has(i));
    return first?.children?.[0]?.value ?? "";
  });
  const navRef = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLButtonElement | null)[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);

  const latest = useRef<{
    onSelect?: BranchedMenuProps["onSelect"];
    onToggle?: BranchedMenuProps["onToggle"];
  }>({});
  latest.current = { onSelect, onToggle };

  const activeSection = items.findIndex((it) =>
    it.children?.some((kid) => kid.value === active),
  );
  const markerShown = activeSection >= 0 && open.has(activeSection);

  const placedOnce = useRef(false);
  useLayoutEffect(() => {
    const place = (glide: boolean) => {
      const m = markerRef.current;
      const el = heads.current[activeSection];
      if (!m) return;
      const on = markerShown && el;
      if (!glide) m.style.transition = "none";
      if (on) m.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
      m.toggleAttribute("data-on", Boolean(on));
      if (!glide) {
        void m.offsetHeight;
        m.style.transition = "";
      }
    };
    place(placedOnce.current);
    placedOnce.current = true;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      place(false);
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeSection, markerShown, items, fontSize, rowHeight]);

  const select = (value: string, item: BranchedMenuChild | BranchedMenuItem) => {
    setActive(value);
    latest.current.onSelect?.(value, item);
  };

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      const isOpen = !next.has(i);
      if (isOpen) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, isOpen);
      return next;
    });
  };

  const setSection = (i: number, want: boolean) => {
    setOpen((prev) => {
      if (prev.has(i) === want) return prev;
      const next = new Set(prev);
      if (want) next.add(i);
      else next.delete(i);
      latest.current.onToggle?.(i, want);
      return next;
    });
  };

  useEffect(() => {
    if (!autoPreview) return undefined;
    const steps: Array<{
      value: string;
      item: BranchedMenuChild;
      section: number;
    }> = [];
    items.forEach((it, i) => {
      it.children?.forEach((kid) =>
        steps.push({ value: kid.value, item: kid, section: i }),
      );
    });
    if (steps.length === 0) return undefined;

    const STEP_MS = 1500;
    const FOLD_MS = 650;
    let alive = true;
    let n = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let foldTimer: ReturnType<typeof setTimeout> | undefined;

    setOpen((prev) => {
      const next = new Set(prev);
      items.forEach((it, i) => {
        if (it.children) next.add(i);
      });
      return next.size === prev.size ? prev : next;
    });

    const step = () => {
      if (!alive) return;
      const at = steps[n % steps.length];
      n += 1;
      select(at.value, at.item);

      if (n % 3 === 0) {
        const target = items.findIndex(
          (it, i) => it.children && i !== at.section,
        );
        if (target >= 0) {
          setSection(target, false);
          foldTimer = setTimeout(() => {
            if (alive) setSection(target, true);
          }, FOLD_MS);
        }
      }

      timer = setTimeout(step, STEP_MS);
    };

    timer = setTimeout(step, 400);

    return () => {
      alive = false;
      clearTimeout(timer);
      clearTimeout(foldTimer);
    };
  }, [autoPreview, items]);

  const r = Math.min(radius, rowHeight / 2 - 2);
  const endX = indent - 8;
  const rowY = (k: number) => PAD + k * rowHeight + rowHeight / 2;
  const branch = (k: number) =>
    `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = (k: number) =>
    `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = (k: number) =>
    rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);

  return (
    <nav
      ref={navRef}
      className={cn(
        "branched-menu relative flex w-fit max-w-[min(var(--bm-w),100%)] flex-col ps-3.5 leading-[1.6] [color:var(--bm-ink)] [font-family:inherit] [font-size:var(--bm-font)]",
        "before:absolute before:top-2 before:bottom-0 before:start-0 before:w-0.5 before:rounded-[1px] before:content-['']",
        "before:[background:linear-gradient(to_bottom,var(--bm-line)_0%,var(--bm-line)_55%,transparent_100%)]",
        className,
      )}
      style={
        {
          "--bm-w": `${width}px`,
          "--bm-ink": color,
          "--bm-accent": accentColor,
          "--bm-active-label": activeLabelColor ?? accentColor,
          "--bm-line": lineColor,
          "--bm-font": `${fontSize}px`,
          "--bm-section-font": `${sectionFontSize ?? fontSize + 1}px`,
          "--bm-row": `${rowHeight}px`,
          "--bm-indent": `${indent}px`,
          "--bm-line-w": lineWidth,
          "--bm-draw": `${drawDuration}ms`,
          "--bm-fold": `${foldDuration}ms`,
        } as CSSProperties
      }
    >
      <span
        ref={markerRef}
        aria-hidden="true"
        className="absolute -top-px start-0 z-[1] h-4 w-0.5 rounded-[1px] opacity-0 [background:var(--bm-accent)] [transition:top_220ms_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] data-[on]:opacity-100 motion-reduce:[transition:opacity_150ms_ease]"
      />

      {items.map((item, i) => {
        const kids = item.children;
        const isOpen = kids ? open.has(i) : false;
        const leafValue = item.value ?? item.label;
        const leafActive = !kids && leafValue === active;
        const sectionBright = !dimInactiveSections || activeSection === i;
        const bodyH = kids ? PAD * 2 + kids.length * rowHeight : 0;
        return (
          <div
            key={item.value ?? item.label}
            className="group/section flex flex-col"
            data-open={isOpen ? "" : undefined}
          >
            <button
              ref={(el) => {
                heads.current[i] = el;
              }}
              type="button"
              className={cn(
                "m-0 block cursor-pointer border-0 bg-transparent py-[9px] text-start font-medium opacity-60 outline-none [color:var(--bm-ink)] [font-family:inherit] [font-size:var(--bm-section-font)] [-webkit-tap-highlight-color:transparent] [transition:color_200ms_ease,opacity_200ms_ease] data-[active]:opacity-100 hover:opacity-100",
                sectionBright && "group-data-[open]/section:opacity-100",
                sectionClassName,
              )}
              aria-expanded={kids ? isOpen : undefined}
              aria-current={leafActive ? "true" : undefined}
              data-active={leafActive ? "" : undefined}
              onClick={() => (kids ? toggle(i) : select(leafValue, item))}
            >
              {item.label}
            </button>

            {kids ? (
              <div className="grid [grid-template-rows:0fr] [transition:grid-template-rows_var(--bm-fold)_cubic-bezier(0.23,1,0.32,1)] group-data-[open]/section:[grid-template-rows:1fr] motion-reduce:transition-none">
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="invisible relative box-border py-1.5 group-data-[open]/section:visible"
                    style={{ height: bodyH }}
                  >
                    <svg
                      className="pointer-events-none absolute top-0 start-0 -scale-x-100 overflow-visible opacity-0 [transition:opacity_200ms_ease] group-data-[open]/section:opacity-100 group-data-[open]/section:[transition:opacity_250ms_ease_100ms]"
                      width={indent}
                      height={bodyH}
                      aria-hidden="true"
                    >
                      <path
                        className="fill-none [stroke:var(--bm-line)] [stroke-width:var(--bm-line-w)] [stroke-linecap:round] [stroke-linejoin:round]"
                        d={`M ${trunk} 0 V ${rowY(kids.length - 1) - r}`}
                      />
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value}
                          className="fill-none [stroke:var(--bm-line)] [stroke-width:var(--bm-line-w)] [stroke-linecap:round] [stroke-linejoin:round]"
                          d={branch(k)}
                        />
                      ))}
                      {kids.map((kid, k) => (
                        <path
                          key={kid.value}
                          className="fill-none [stroke:var(--bm-accent)] [stroke-width:var(--bm-line-w)] [stroke-linecap:round] [stroke-linejoin:round] [transition:stroke-dashoffset_var(--bm-draw)_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                          d={reach(k)}
                          style={{
                            strokeDasharray: length(k),
                            strokeDashoffset: kid.value === active ? 0 : length(k),
                          }}
                        />
                      ))}
                    </svg>

                    {kids.map((kid) => (
                      <button
                        key={kid.value}
                        type="button"
                          className="m-0 box-border flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent py-0 ps-[var(--bm-indent)] pe-0 text-start opacity-60 outline-none [height:var(--bm-row)] [color:var(--bm-ink)] [font-family:inherit] [-webkit-tap-highlight-color:transparent] [transition:color_200ms_ease,opacity_200ms_ease] hover:opacity-100 data-[active]:font-medium data-[active]:opacity-100 data-[active]:[color:var(--bm-active-label)]"
                        aria-current={kid.value === active ? "true" : undefined}
                        data-active={kid.value === active ? "" : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => select(kid.value, kid)}
                      >
                        {kid.icon ? (
                          <span className="inline-flex flex-none" aria-hidden="true">
                            {renderIcon(kid.icon)}
                          </span>
                        ) : null}
                        <span className="truncate">{kid.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export default BranchedMenuBase;
