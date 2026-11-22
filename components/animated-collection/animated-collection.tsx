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

import { useEffect, useId, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { LayoutGrid, Layers, List, type LucideIcon } from "lucide-react";

const AUTO_START_MS = 700;
const AUTO_VIEW_MS = 2200;

export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  idNumber: string;
  image: string;
}

export type ViewMode = "list" | "card" | "pack";

export interface AnimatedCollectionProps {
  title?: string;
  items?: CollectionItem[];
  defaultView?: ViewMode;
  accentColor?: string;
  radius?: number;
  showMeta?: boolean;
  autoPreview?: boolean;
  className?: string;
}

function inkOn(color: string) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return "#ffffff";
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((chunk) => chunk + chunk)
          .join("")
      : match[1];
  const value = parseInt(hex, 16);
  const lum =
    0.2126 * ((value >> 16) & 255) +
    0.7152 * ((value >> 8) & 255) +
    0.0722 * (value & 255);
  return lum > 150 ? "#0a0a0a" : "#ffffff";
}

const artwork = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${hue},16%,24%)'/%3E%3Cstop offset='1' stop-color='hsl(${hue},18%,38%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23g)'/%3E%3C/svg%3E`;

const DEFAULT_ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "افق‌های سینمایی",
    subtitle: "عکاسی",
    idNumber: "209",
    image: artwork(205),
  },
  {
    id: "2",
    title: "رویاهای انتزاعی",
    subtitle: "هنر دیجیتال",
    idNumber: "808",
    image: artwork(265),
  },
];

const VIEWS: ViewMode[] = ["list", "card", "pack"];

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

const fadeMeta: Transition = {
  duration: 0.16,
  ease: [0.16, 1, 0.3, 1],
};

const PACK_POSE = [
  { rotate: 11, x: 22, y: 6 },
  { rotate: -9, x: -24, y: -8 },
] as const;

export default function AnimatedCollection({
  title = "کالکشن من",
  items = DEFAULT_ITEMS,
  defaultView = "list",
  accentColor = "",
  radius = 24,
  showMeta = true,
  autoPreview = false,
  className,
}: AnimatedCollectionProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const reduce = useReducedMotion();
  const groupId = useId();
  const spring: Transition = reduce ? { duration: 0 } : snappySpring;
  const fade: Transition = reduce ? { duration: 0 } : fadeMeta;
  const tabsId = `${groupId}-tabs`;
  const itemsId = `${groupId}-items`;
  const pillId = `${groupId}-active-tab`;

  useEffect(() => {
    if (!autoPreview) return;
    let alive = true;
    let step = VIEWS.indexOf(defaultView);
    const pending: number[] = [];
    const at = (ms: number, fn: () => void) => {
      pending.push(
        window.setTimeout(() => {
          if (alive) fn();
        }, ms),
      );
    };
    const advance = () => {
      step = (step + 1) % VIEWS.length;
      setView(VIEWS[step]);
      at(AUTO_VIEW_MS, advance);
    };
    at(AUTO_START_MS, advance);
    return () => {
      alive = false;
      pending.forEach((timer) => window.clearTimeout(timer));
      setView(defaultView);
    };
  }, [autoPreview, defaultView]);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-xl p-4 font-sans antialiased selection:bg-foreground/10 md:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-medium text-balance text-foreground">{title}</h2>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {toFaDigits(items.length)} اثر
            </span>
          </div>

          <LayoutGroup id={tabsId}>
            <div
              role="tablist"
              aria-label="حالت نمایش کالکشن"
              className="flex w-fit rounded-full bg-muted/70 p-1 shadow-[0_0_0_1px_rgb(0_0_0/.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/.08)]"
            >
              <Tab
                active={view === "list"}
                onClick={() => setView("list")}
                icon={List}
                label="لیست"
                layoutId={pillId}
                transition={spring}
                accent={accentColor}
              />
              <Tab
                active={view === "card"}
                onClick={() => setView("card")}
                icon={LayoutGrid}
                label="کارت"
                layoutId={pillId}
                transition={spring}
                accent={accentColor}
              />
              <Tab
                active={view === "pack"}
                onClick={() => setView("pack")}
                icon={Layers}
                label="بسته"
                layoutId={pillId}
                transition={spring}
                accent={accentColor}
              />
            </div>
          </LayoutGroup>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="relative min-h-[360px]">
          <LayoutGroup id={itemsId}>
            <motion.div
              layout
              initial={false}
              transition={spring}
              className={cn(
                "relative w-full",
                view === "list" && "flex flex-col gap-3",
                view === "card" && "grid grid-cols-2 gap-4",
                view === "pack" &&
                  "absolute inset-x-0 top-0 bottom-16 flex items-center justify-center",
              )}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={false}
                  transition={spring}
                  className={cn(
                    "relative z-10 flex items-center",
                    view === "list" && "w-full gap-4",
                    view === "card" && "w-full flex-col items-start gap-3",
                    view === "pack" && "absolute size-52 items-center justify-center",
                  )}
                  style={{ zIndex: view === "pack" ? items.length - index : 1 }}
                  animate={
                    view === "pack" && items.length > 1
                      ? PACK_POSE[index] ?? { rotate: 0, x: 0, y: 0 }
                      : { rotate: 0, x: 0, y: 0 }
                  }
                >
                  <motion.div
                    layout
                    initial={false}
                    transition={spring}
                    style={
                      view === "list" ? undefined : { borderRadius: radius }
                    }
                    className={cn(
                      "relative shrink-0 overflow-hidden bg-muted outline outline-1 outline-black/10 dark:outline-white/10",
                      view === "list" && "size-16 rounded-2xl",
                      view === "card" &&
                        "aspect-square w-full rounded-[1.5rem] shadow-[0_1px_1px_rgb(0_0_0/.04),0_8px_24px_rgb(0_0_0/.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/.08)]",
                      view === "pack" &&
                        "size-full rounded-[1.75rem] shadow-[0_1px_2px_rgb(0_0_0/.08),0_18px_40px_rgb(0_0_0/.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/.1),0_18px_40px_rgb(0_0_0/.45)]",
                    )}
                  >
                    <motion.img
                      layout
                      initial={false}
                      transition={spring}
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      draggable={false}
                      style={
                        view === "list" ? undefined : { borderRadius: radius }
                      }
                      className={cn(
                        "pointer-events-none m-0! block size-full object-cover p-0! select-none",
                        view === "list" && "rounded-2xl",
                        view === "card" && "rounded-[1.5rem]",
                        view === "pack" && "rounded-[1.75rem]",
                      )}
                    />
                  </motion.div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {view !== "pack" && showMeta && (
                      <motion.div
                        key={`${item.id}-info`}
                        layout
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={fade}
                        className={cn(
                          "min-w-0 flex-1",
                          view === "card" && "w-full px-0.5",
                        )}
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <h3 className="truncate text-[15px] font-medium leading-[1.4] text-foreground">
                            {item.title}
                          </h3>
                          <p className="m-0 truncate text-xs leading-[1.45] text-muted-foreground">
                            {item.subtitle}
                            <span className="tabular-nums"> · {toFaDigits(item.idNumber)}</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </LayoutGroup>

          <AnimatePresence initial={false}>
            {view === "pack" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-center"
              >
                <p className="m-0 max-w-[28ch] text-sm font-medium leading-[1.5] text-balance text-foreground">
                  {items.map((item) => item.title).join(" · ")}
                </p>
                <p className="m-0 text-xs leading-[1.45] tabular-nums text-muted-foreground">
                  {toFaDigits(items.length)} اثر
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon: Icon,
  label,
  layoutId,
  transition,
  accent = "",
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  layoutId: string;
  transition: Transition;
  accent?: string;
}) {
  const ink = accent ? inkOn(accent) : undefined;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={active && accent ? { color: ink } : undefined}
      className={cn(
        "relative flex h-10 min-w-[5.75rem] cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
        "active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-foreground/25",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.div
          layoutId={layoutId}
          style={accent ? { backgroundColor: accent } : undefined}
          className="pointer-events-none absolute inset-0 rounded-full bg-primary shadow-[0_1px_2px_rgb(0_0_0/.12)]"
          transition={transition}
        />
      )}
      <span className="relative z-10 -translate-y-px flex items-center gap-2">
        <Icon size={15} strokeWidth={2} aria-hidden="true" />
        {label}
      </span>
    </button>
  );
}
