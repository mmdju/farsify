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

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Camera,
  MessagesSquare,
  Mic,
  Monitor,
  Moon,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sun,
  UserPen,
  type LucideIcon,
} from "lucide-react";

const AUTO_STEPS = ["home", "search", "notifications", "profile", "theme"] as const;
const AUTO_START_MS = 700;
const AUTO_VIEW_MS = 1900;
const AUTO_THEME_MS = 1100;
const AUTO_REST_MS = 1500;

type View =
  | "default"
  | "home"
  | "search"
  | "notifications"
  | "profile"
  | "theme";

type ThemeChoice = "light" | "dark" | "system";

const MAIN_NAV: { icon: LucideIcon; view: View; label: string }[] = [
  { icon: Plus, view: "home", label: "افزودن" },
  { icon: Search, view: "search", label: "جستجو" },
  { icon: Bell, view: "notifications", label: "اعلان‌ها" },
  { icon: UserPen, view: "profile", label: "حساب من" },
  { icon: Sun, view: "theme", label: "پوسته" },
];

const HOME_ITEMS = [
  { icon: Pencil, text: "یادداشت" },
  { icon: Mic, text: "صدا" },
  { icon: Camera, text: "تصویر" },
];

const SEARCH_OPTIONS = [
  { icon: SlidersHorizontal, text: "فیلتر" },
  { icon: MessagesSquare, text: "داغ‌ترین‌ها" },
];

const NOTIFICATION_TYPES = ["پیام‌ها", "هشدارهای سیستم"];

const PROFILE_LINKS = ["حساب من", "تنظیمات", "اشتراک و پرداخت"];

const THEME_OPTIONS: { key: ThemeChoice; icon: LucideIcon; text: string }[] = [
  { key: "light", icon: Sun, text: "روشن" },
  { key: "dark", icon: Moon, text: "تیره" },
  { key: "system", icon: Monitor, text: "سیستم" },
];

const SHARED_ITEM =
  "group w-full rounded-[12px] px-3 py-2 text-start text-[15px] text-muted-foreground transition-all duration-75 hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const BottomMenu = ({
  autoPreview = false,
  accentColor = "",
}: {
  autoPreview?: boolean;
  accentColor?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<View>("default");
  const [theme, setTheme] = useState<ThemeChoice>("light");
  const accentStyle = accentColor
    ? { backgroundColor: `color-mix(in srgb, ${accentColor} 22%, transparent)` }
    : undefined;

  useEffect(() => {
    if (!autoPreview) return;
    let alive = true;
    const pending: number[] = [];
    const at = (ms: number, fn: () => void) => {
      pending.push(
        window.setTimeout(() => {
          if (alive) fn();
        }, ms),
      );
    };
    const tour = () => {
      let step = 0;
      const next = () => {
        if (step >= AUTO_STEPS.length) {
          setView("default");
          at(AUTO_REST_MS, tour);
          return;
        }
        const view = AUTO_STEPS[step++];
        setView(view);
        if (view === "theme") at(AUTO_THEME_MS, () => setTheme("dark"));
        at(AUTO_VIEW_MS, next);
      };
      at(AUTO_START_MS, next);
    };
    tour();
    return () => {
      alive = false;
      pending.forEach((timer) => window.clearTimeout(timer));
      setView("default");
    };
  }, [autoPreview]);

  useLayoutEffect(() => {
    const node = hiddenRef.current;
    if (!node) return;
    setSize({ width: node.offsetWidth, height: node.offsetHeight });
  }, [view, theme]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setView("default");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setView("default");
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const content = useMemo(() => {
    switch (view) {
      case "home":
        return (
          <div className="min-w-[210px] space-y-0.5 p-[6px] py-0.5">
            {HOME_ITEMS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                type="button"
                className={cn(SHARED_ITEM, "flex items-center gap-3")}
              >
                <Icon
                  size={20}
                  className="shrink-0 text-muted-foreground transition-all duration-75 group-hover:text-foreground"
                />
                <span className="transition-all duration-75">{text}</span>
              </button>
            ))}
          </div>
        );

      case "search":
        return (
          <div className="w-[240px] space-y-2 p-2 py-1 md:min-w-[270px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                aria-label="جستجو"
                placeholder="جستجو…"
                className="w-full rounded-[12px] border border-border bg-muted/80 py-[6px] pe-3 ps-9 text-[14.5px] text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5">
              {SEARCH_OPTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  className={cn(
                    SHARED_ITEM,
                    "flex flex-1 items-center justify-center gap-1.5 bg-muted hover:bg-accent",
                  )}
                >
                  <Icon
                    size={14}
                    className="shrink-0 text-muted-foreground transition-all duration-75 group-hover:text-foreground"
                  />
                  <span className="transition-all duration-75">{text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="min-w-[210px] space-y-0.5 p-[6px] py-0.5">
            {NOTIFICATION_TYPES.map((type) => (
              <button key={type} type="button" className={SHARED_ITEM}>
                <span className="transition-all duration-75">{type}</span>
              </button>
            ))}
          </div>
        );

      case "profile":
        return (
          <div className="w-[200px] space-y-0.5 p-[6px] py-0.5 md:min-w-[230px]">
            {PROFILE_LINKS.map((link) => (
              <button key={link} type="button" className={SHARED_ITEM}>
                <span className="transition-all duration-75">{link}</span>
              </button>
            ))}
            <div className="mx-3 my-[2px] border-t border-border" />
            <button
              type="button"
              className="w-full rounded-[12px] px-3 py-2 text-start text-[15px] text-destructive transition-all duration-75 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              خروج
            </button>
          </div>
        );

      case "theme":
        return (
          <div className="flex w-[240px] flex-col items-center justify-between gap-1.5 py-0.5 md:min-w-[295px] md:flex-row md:p-[6px]">
            {THEME_OPTIONS.map(({ key, icon: Icon, text }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                aria-pressed={theme === key}
                style={theme === key ? accentStyle : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-[12px] px-3 py-2 text-[15px] transition-all duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  theme === key
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0",
                    theme === key
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span>{text}</span>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  }, [view, theme]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center"
      role="group"
      aria-label="منوی پایین"
    >
      <div
        ref={hiddenRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute -start-[9999px] -top-[9999px]"
      >
        <div className="rounded-[18px] border border-border bg-background/95 py-1">
          {content}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view !== "default" && (
          <motion.div
            key="submenu"
            initial={{
              opacity: 0,
              scaleY: 0.9,
              scaleX: 0.95,
              height: 0,
              width: 0,
            }}
            animate={{
              opacity: 1,
              scaleY: 1,
              scaleX: 1,
              height: size.height,
              width: size.width,
            }}
            exit={{
              opacity: 0,
              scaleY: 0.9,
              scaleX: 0.95,
              height: 0,
              width: 0,
            }}
            transition={{ duration: 0.3, ease: [0.45, 0, 0.25, 1] }}
            style={{ transformOrigin: "bottom center" }}
            className="absolute bottom-[70px] overflow-hidden rounded-[18px] border border-border bg-background/95 backdrop-blur-xl"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                transition={{ duration: 0.25, ease: [0.42, 0, 0.58, 1] }}
                className="py-1"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        role="toolbar"
        aria-label="منوی پایین"
        aria-orientation="horizontal"
        className="z-10 mt-3 flex items-center gap-1 rounded-[18px] border border-border bg-background/95 p-1 backdrop-blur-xl"
      >
        {MAIN_NAV.map(({ icon: Icon, view: itemView, label }) => {
          const isOpen = view === itemView;
          return (
            <button
              key={itemView}
              type="button"
              aria-label={label}
              aria-expanded={isOpen}
              onClick={() => setView(isOpen ? "default" : itemView)}
              style={isOpen ? accentStyle : undefined}
              className={cn(
                "rounded-[16px] p-3 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isOpen ? "bg-accent" : "hover:bg-muted",
              )}
            >
              <Icon
                className={cn(
                  "transition-all",
                  isOpen ? "text-foreground" : "text-muted-foreground",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomMenu;
