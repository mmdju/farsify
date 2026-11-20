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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import {
  Bell,
  Flame,
  Folder,
  Hexagon,
  Image as ImageIcon,
  Layers,
  Magnet,
  Mic,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import "./flower-menu.css";

export interface FlowerMenuItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface FlowerMenuProps {
  items?: FlowerMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: FlowerMenuItem) => void;
  radius?: number;
  discSize?: number;
  centerSize?: number;
  accent?: string;
  stagger?: number;
  stiffness?: number;
  damping?: number;
  blurIn?: number;
  autoPreview?: boolean;
  ariaLabel?: string;
  className?: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPRING_MASS = 0.6;
const OPEN_ROTATE = 135;
const TAP_SCALE = 0.95;

const AUTO_OPEN_MS = 700;
const AUTO_HOLD_MS = 1600;
const AUTO_GAP_MS = 900;

const DEFAULT_ITEMS: FlowerMenuItem[] = [
  { id: "bell", label: "اعلان‌ها", icon: Bell },
  { id: "sparkles", label: "پیشنهادها", icon: Sparkles },
  { id: "mic", label: "ضبط صدا", icon: Mic },
  { id: "magnet", label: "آهن‌ربا", icon: Magnet },
  { id: "folder", label: "پرونده‌ها", icon: Folder },
  { id: "image", label: "تصاویر", icon: ImageIcon },
  { id: "search", label: "جست‌وجو", icon: Search },
  { id: "flame", label: "پرطرفدارها", icon: Flame },
  { id: "hexagon", label: "ابزارها", icon: Hexagon },
  { id: "layers", label: "لایه‌ها", icon: Layers },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-fg-40";

const parseRgb = (value: string): [number, number, number] | null => {
  const input = String(value).trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input);
  if (hex) {
    const full =
      hex[1].length === 3 ? hex[1].replace(/./g, (d) => d + d) : hex[1];
    const [r, g, b] = [0, 2, 4].map(
      (i) => parseInt(full.slice(i, i + 2), 16) / 255,
    );
    return [r, g, b];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(input);
  if (!rgb) return null;
  const parts = rgb[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) => Number.parseFloat(part));
  if (parts.length < 3) return null;
  const [r, g, b] = parts;
  if (![r, g, b].every((part) => Number.isFinite(part))) return null;
  return [r / 255, g / 255, b / 255];
};

const contrastInk = (value: string) => {
  const rgb = parseRgb(value);
  if (!rgb) return "#ffffff";
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.55
    ? "#18161d"
    : "#ffffff";
};

const FlowerMenu: React.FC<FlowerMenuProps> = ({
  items = DEFAULT_ITEMS,
  open,
  onOpenChange,
  onSelect,
  radius = 88,
  discSize = 46,
  centerSize = 58,
  accent,
  stagger = 35,
  stiffness = 300,
  damping = 15,
  blurIn = 4,
  autoPreview = false,
  ariaLabel = "باز و بسته‌کردن منو",
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const controlled = open !== undefined;
  const [inner, setInner] = useState(false);
  const isOpen = controlled ? open : inner;

  const rootRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLButtonElement>(null);
  const petalRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (open !== undefined) setInner(open);
  }, [open]);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const close = useCallback(() => {
    const root = rootRef.current;
    if (root !== null && root.contains(document.activeElement)) {
      centerRef.current?.focus();
    }
    setOpenState(false);
  }, [setOpenState]);

  useEffect(() => {
    if (!autoPreview || controlled || reduced) return;
    let alive = true;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      if (!alive) return;
      setInner(true);
      holdTimer = setTimeout(() => {
        if (!alive) return;
        setInner(false);
        startTimer = setTimeout(cycle, AUTO_GAP_MS);
      }, AUTO_HOLD_MS);
    };

    startTimer = setTimeout(cycle, AUTO_OPEN_MS);
    return () => {
      alive = false;
      clearTimeout(startTimer);
      clearTimeout(holdTimer);
      setInner(false);
    };
  }, [autoPreview, controlled, reduced]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const wasOpen = useRef(isOpen);
  useEffect(() => {
    const root = rootRef.current;
    const focusInside = root !== null && root.contains(document.activeElement);
    if (!focusInside) {
      wasOpen.current = isOpen;
      return;
    }
    if (isOpen && !wasOpen.current) {
      petalRefs.current[0]?.focus();
    } else if (!isOpen && wasOpen.current) {
      centerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  const toggle = () => {
    if (isOpen) close();
    else setOpenState(true);
  };

  const select = (item: FlowerMenuItem) => {
    onSelect?.(item);
    close();
  };

  const points = useMemo(
    () =>
      items.map((item, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / items.length;
        return {
          ...item,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        };
      }),
    [items, radius],
  );

  const box =
    Math.max(radius + discSize / 2 + 8, centerSize / 2 + 8) * 2;

  const openTransition = (index: number): Transition => ({
    type: "spring",
    stiffness,
    damping,
    mass: SPRING_MASS,
    delay: reduced ? 0 : (index * stagger) / 1000,
  });
  const closeTransition = (index: number): Transition => ({
    duration: 0.5,
    ease: EASE,
    delay: reduced ? 0 : ((points.length - 1 - index) * stagger) / 1000,
  });

  const centerStyle = {
    width: centerSize,
    height: centerSize,
    marginLeft: -centerSize / 2,
    marginTop: -centerSize / 2,
    boxShadow: "var(--fm-disc)",
    ...(accent ? { background: accent, color: contrastInk(accent) } : {}),
  } as const;

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      style={{ width: box, height: box }}
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        <motion.button
          ref={centerRef}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          onClick={toggle}
          className={cn(
            "flower-menu__disc absolute left-0 top-0 z-20 flex items-center justify-center rounded-full",
            accent
              ? ""
              : "border border-border bg-card text-muted-foreground dark:text-foreground",
            FOCUS,
          )}
          style={centerStyle}
          whileTap={reduced ? undefined : { scale: TAP_SCALE }}
        >
          <motion.div
            animate={{ rotate: isOpen ? OPEN_ROTATE : 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }
            }
          >
            <Plus className="h-[22px] w-[22px]" />
          </motion.div>
        </motion.button>

        <div inert={!isOpen}>
          {points.map((point, index) => {
            const Icon = point.icon;

            return (
              <motion.button
                key={point.id}
                ref={(element) => {
                  petalRefs.current[index] = element;
                }}
                type="button"
                aria-label={point.label}
                title={point.label}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => select(point)}
                className={cn(
                  "flower-menu__disc absolute left-0 top-0 flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground dark:text-foreground",
                  FOCUS,
                  isOpen ? "pointer-events-auto" : "pointer-events-none",
                )}
                style={{
                  width: discSize,
                  height: discSize,
                  marginLeft: -discSize / 2,
                  marginTop: -discSize / 2,
                  boxShadow: "var(--fm-disc)",
                }}
                animate={{
                  x: isOpen ? point.x : 0,
                  y: isOpen ? point.y : 0,
                  opacity: isOpen ? 1 : 0,
                  scale: isOpen ? 1 : 0.5,
                  filter: isOpen ? "blur(0px)" : `blur(${blurIn}px)`,
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : isOpen
                      ? openTransition(index)
                      : closeTransition(index)
                }
                whileTap={reduced ? undefined : { scale: TAP_SCALE }}
              >
                <Icon className="h-5 w-5" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowerMenu;
export { FlowerMenu };
