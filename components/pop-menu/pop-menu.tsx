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
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

type GlyphPart = { d?: string; cx?: number; cy?: number; r?: number };
type Glyph = readonly GlyphPart[];

const ICON_USER: Glyph = [
  { d: "M20 21.0001C19.713 17.269 16.7289 14.3151 12.995 14.0662L12 13.9999C11.6446 14.0096 11.3134 14.0225 11.0008 14.0378C7.3 14.2192 4.28417 17.3057 4 21.0001" },
  { cx: 12, cy: 6.99988, r: 4 },
];

const ICON_CREDIT_CARD: Glyph = [
  { d: "M10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4Z" },
  { d: "M2.5 9H21.5" },
  { d: "M14 15L18 15" },
];

const ICON_FOLDER: Glyph = [
  { d: "M13.6656 6.49446H16C18.8284 6.49446 20.2426 6.49446 21.1213 7.37314C22 8.25182 22 9.66603 22 12.4945V14.5C22 17.3284 22 18.7426 21.1213 19.6213C20.2426 20.5 18.8284 20.5 16 20.5H8C5.17157 20.5 3.75736 20.5 2.87868 19.6213C2 18.7426 2 17.3284 2 14.5V8.99183C2 6.65409 2 5.48521 2.61604 4.67881C2.7778 4.46706 2.96706 4.2778 3.17881 4.11604C3.98521 3.5 5.15409 3.5 7.49183 3.5C8.16633 3.5 8.50358 3.5 8.81392 3.60442C8.8976 3.63257 8.97932 3.66623 9.05854 3.70518C9.35239 3.84965 9.59179 4.08719 10.0706 4.56227L10.8483 5.33389C11.4254 5.9066 11.714 6.19295 12.08 6.3437C12.446 6.49446 12.8525 6.49446 13.6656 6.49446Z" },
];

const ICON_FILE: Glyph = [
  { d: "M8 7L16 7" },
  { d: "M8 11L12 11" },
  { d: "M13 21.5V21C13 18.1716 13 16.7574 13.8787 15.8787C14.7574 15 16.1716 15 19 15H19.5M20 13.3431V10C20 6.22876 20 4.34315 18.8284 3.17157C17.6569 2 15.7712 2 12 2C8.22877 2 6.34315 2 5.17157 3.17157C4 4.34314 4 6.22876 4 10L4 14.5442C4 17.7892 4 19.4117 4.88607 20.5107C5.06508 20.7327 5.26731 20.9349 5.48933 21.1139C6.58831 22 8.21082 22 11.4558 22C12.1614 22 12.5141 22 12.8372 21.886C12.9044 21.8623 12.9702 21.835 13.0345 21.8043C13.3436 21.6564 13.593 21.407 14.0919 20.9081L18.8284 16.1716C19.4065 15.5935 19.6955 15.3045 19.8478 14.9369C20 14.5694 20 14.1606 20 13.3431Z" },
];

const ICON_SETTINGS: Glyph = [
  { d: "M3.95631 10.5829L3.03254 9.07084C2.74505 8.60024 2.7389 8.00978 3.01652 7.5333L3.63533 6.47124C3.90953 6.00064 4.41721 5.71571 4.96162 5.7269L6.69131 5.76245C6.92616 5.76728 7.15379 5.68727 7.34333 5.54846C7.79531 5.21745 8.28334 4.93276 8.80042 4.70139C9.01191 4.60675 9.19222 4.45165 9.30469 4.24903L10.1203 2.77965C10.3847 2.30328 10.8865 2.00781 11.4312 2.00781H12.6937C13.2384 2.00781 13.7403 2.30329 14.0047 2.77966L14.8202 4.24902C14.9327 4.45165 15.113 4.60675 15.3245 4.70139C15.8416 4.93274 16.3296 5.2174 16.7815 5.54838C16.9711 5.68718 17.1987 5.76718 17.4336 5.76235L19.1634 5.72676C19.7078 5.71557 20.2155 6.00049 20.4897 6.47111L21.1085 7.53314C21.3862 8.00963 21.38 8.60009 21.0925 9.07068L20.1687 10.5828C20.0481 10.7803 20.002 11.0134 20.0235 11.2439C20.0707 11.7486 20.0707 12.267 20.0235 12.7717C20.002 13.0022 20.0481 13.2353 20.1687 13.4329L21.0924 14.9448C21.3799 15.4154 21.3861 16.0058 21.1084 16.4823L20.4896 17.5444C20.2154 18.015 19.7077 18.2999 19.1633 18.2887L17.4338 18.2531C17.1989 18.2483 16.9713 18.3283 16.7817 18.4671C16.3297 18.7982 15.8416 19.0829 15.3245 19.3142C15.113 19.4089 14.9327 19.564 14.8202 19.7666L14.0047 21.236C13.7403 21.7123 13.2384 22.0078 12.6937 22.0078H11.4312C10.8866 22.0078 10.3847 21.7123 10.1203 21.236L9.30468 19.7665C9.19222 19.5639 9.01191 19.4088 8.80042 19.3142C8.28329 19.0828 7.79519 18.798 7.34316 18.467C7.15362 18.3282 6.92597 18.2482 6.69111 18.253L4.96175 18.2886C4.41733 18.2998 3.90963 18.0148 3.63543 17.5442L3.01663 16.4822C2.739 16.0057 2.74515 15.4152 3.03264 14.9446L3.95631 13.4327C4.07699 13.2351 4.12309 13.002 4.10154 12.7715C4.05437 12.267 4.05438 11.7486 4.10154 11.244C4.12308 11.0135 4.07699 10.7805 3.95631 10.5829Z" },
  { cx: 12.0625, cy: 12.0078, r: 3.5 },
];

const ICON_HELP: Glyph = [
  { cx: 12, cy: 12, r: 10 },
  { d: "M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5" },
  { d: "M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z" },
];

const ICON_LOGOUT: Glyph = [
  { d: "M19.996 12H9.99603" },
  { d: "M13.9724 6C13.9259 4.90656 13.7875 4.20981 13.3761 3.67372C13.2165 3.46572 13.0303 3.27954 12.8223 3.11994C12.0144 2.5 10.8416 2.5 8.49603 2.5C6.15046 2.5 4.97767 2.5 4.16975 3.11994C3.96175 3.27954 3.77557 3.46572 3.61597 3.67372C2.99603 4.48164 2.99603 5.65442 2.99603 8L2.99603 16C2.99603 18.3456 2.99603 19.5184 3.61597 20.3263C3.77557 20.5343 3.96175 20.7205 4.16975 20.8801C4.97767 21.5 6.15046 21.5 8.49603 21.5C10.8416 21.5 12.0144 21.5 12.8223 20.8801C13.0303 20.7205 13.2165 20.5343 13.3761 20.3263C13.7875 19.7902 13.9259 19.0934 13.9724 18" },
  { d: "M17.4961 15.5C17.4961 15.5 20.996 12.9223 20.996 12C20.996 11.0777 17.496 8.5 17.496 8.5" },
];

const ICON_DOTS: Glyph = [
  { d: "M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" },
  { d: "M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" },
  { d: "M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" },
];

function GlyphIcon({ shape, className }: { shape: Glyph; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {shape.map((part, index) =>
        part.d ? (
          <path key={index} d={part.d} />
        ) : (
          <circle key={index} cx={part.cx} cy={part.cy} r={part.r} />
        ),
      )}
    </svg>
  );
}

export interface PopMenuItem {
  id: string;
  label?: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
}

const DEFAULT_ITEMS: PopMenuItem[] = [
  { id: "profile", label: "پروفایل", icon: <GlyphIcon shape={ICON_USER} className="h-[18px] w-[18px]" /> },
  { id: "upgrade", label: "ارتقا", icon: <GlyphIcon shape={ICON_CREDIT_CARD} className="h-[18px] w-[18px]" /> },
  { id: "projects", label: "پروژه‌ها", icon: <GlyphIcon shape={ICON_FOLDER} className="h-[18px] w-[18px]" /> },
  { id: "documentation", label: "مستندات", icon: <GlyphIcon shape={ICON_FILE} className="h-[18px] w-[18px]" /> },
  { id: "divider-1", divider: true },
  { id: "settings", label: "تنظیمات", icon: <GlyphIcon shape={ICON_SETTINGS} className="h-[18px] w-[18px]" /> },
  { id: "help", label: "راهنما", icon: <GlyphIcon shape={ICON_HELP} className="h-[18px] w-[18px]" /> },
  { id: "logout", label: "خروج", icon: <GlyphIcon shape={ICON_LOGOUT} className="h-[18px] w-[18px] rtl:-scale-x-100" />, danger: true },
];

const EASE_OUT_QUINT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const DANGER_TEXT = "text-[rgb(229_72_77)]";
const DANGER_PILL = "bg-[rgb(229_72_77/0.12)]";

const MUTED = "text-muted-foreground";
const STRONG = "text-foreground";
const HAIRLINE = "border-black/10 dark:border-white/10";
const PILL = "bg-accent dark:bg-muted";
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground";

export interface PopMenuProps {
  items?: PopMenuItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  width?: number;
  stiffness?: number;
  damping?: number;
  indicatorStiffness?: number;
  accent?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

function useContentHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}

const PopMenu = ({
  items = DEFAULT_ITEMS,
  open,
  defaultOpen = false,
  onOpenChange,
  activeId,
  defaultActiveId,
  onSelect,
  width = 220,
  stiffness = 380,
  damping = 34,
  indicatorStiffness = 520,
  accent,
  disabled = false,
  ariaLabel = "منو",
  className = "",
}: PopMenuProps) => {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerActive, setInnerActive] = useState(
    () => defaultActiveId ?? items.find((item) => !item.divider)?.id ?? "",
  );
  const openControlled = open !== undefined;
  const activeControlled = activeId !== undefined;
  const isOpen = !disabled && (openControlled ? open : innerOpen);
  const active = activeControlled ? activeId : innerActive;

  useEffect(() => {
    if (open !== undefined) setInnerOpen(open);
  }, [open]);
  useEffect(() => {
    if (activeId !== undefined) setInnerActive(activeId);
  }, [activeId]);

  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const panelId = `pop-menu-${instanceId}-panel`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!openControlled) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [openControlled, onOpenChange],
  );
  const setActiveState = useCallback(
    (id: string) => {
      if (!activeControlled) setInnerActive(id);
      onSelect?.(id);
    },
    [activeControlled, onSelect],
  );

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [contentRef, contentHeight] = useContentHeight();

  useEffect(() => {
    if (!isOpen) setHoveredItem(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointer = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenState(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenState(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setOpenState]);

  const reduce = useReducedMotion() ?? false;
  const frameTransition: Transition = reduce
    ? { duration: 0 }
    : { type: "spring", damping, stiffness, mass: 0.8 };
  const indicatorTransition: Transition = reduce
    ? { duration: 0 }
    : { type: "spring", damping: 30, stiffness: indicatorStiffness, mass: 0.8 };

  const openHeight = Math.max(40, Math.ceil(contentHeight));

  const activate = (item: PopMenuItem) => {
    if (item.divider || disabled) return;
    setActiveState(item.id);
    if (item.danger) {
      setOpenState(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative h-10 w-10", className)}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: isOpen ? width : 40,
          height: isOpen ? openHeight : 40,
          borderRadius: isOpen ? 14 : 12,
        }}
        transition={frameTransition}
        className={cn(
          "absolute top-0 right-0 overflow-hidden border bg-muted shadow-lg",
          "origin-top-right dark:bg-accent",
          HAIRLINE,
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 0.8 : 1,
          }}
          transition={{ duration: reduce ? 0 : 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            pointerEvents: isOpen ? "none" : "auto",
            willChange: "transform",
          }}
        >
          <GlyphIcon
            shape={ICON_DOTS}
            className="h-6 w-6 text-muted-foreground"
          />
        </motion.div>

        <div id={panelId} ref={contentRef} aria-hidden={!isOpen}>
          <motion.div
            layout
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{
              duration: reduce ? 0 : 0.2,
              delay: isOpen && !reduce ? 0.08 : 0,
            }}
            className="p-2"
            style={{
              pointerEvents: isOpen ? "auto" : "none",
              willChange: "transform",
            }}
          >
            <ul
              aria-label={ariaLabel}
              className="flex list-none flex-col gap-0.5"
            >
              {items.map((item, index) => {
                if (item.divider) {
                  return (
                    <motion.div
                      key={item.id}
                      role="separator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isOpen ? 1 : 0 }}
                      transition={{
                        delay: reduce ? 0 : isOpen ? 0.12 + index * 0.015 : 0,
                      }}
                      className="my-1.5 h-px bg-black/10 dark:bg-white/10"
                    />
                  );
                }

                const isDanger = Boolean(item.danger);
                const isActive = active === item.id;
                const showIndicator = hoveredItem
                  ? hoveredItem === item.id
                  : isActive;
                const itemDuration = isDanger ? 0.12 : 0.15;

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{
                      opacity: isOpen ? 1 : 0,
                      x: isOpen ? 0 : 8,
                    }}
                    transition={{
                      delay: reduce ? 0 : isOpen ? 0.06 + index * 0.02 : 0,
                      duration: reduce ? 0 : itemDuration,
                      ease: EASE_OUT_QUINT,
                    }}
                  >
                    <button
                      type="button"
                      tabIndex={isOpen ? 0 : -1}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => activate(item)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "relative flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 ps-3 text-sm",
                        "font-medium transition-colors duration-200 ease-out",
                        isDanger
                          ? showIndicator
                            ? DANGER_TEXT
                            : cn(MUTED, "hover:text-[rgb(229_72_77)]")
                          : isActive
                            ? STRONG
                            : cn(MUTED, "hover:text-foreground"),
                        FOCUS,
                      )}
                    >
                      {showIndicator && (
                        <motion.div
                          layoutId={`pop-menu-${instanceId}-pill`}
                          className={cn(
                            "absolute inset-0 rounded-lg",
                            isDanger ? DANGER_PILL : PILL,
                          )}
                          transition={indicatorTransition}
                        />
                      )}
                      {showIndicator && (
                        <motion.div
                          layoutId={`pop-menu-${instanceId}-bar`}
                          className={cn(
                            "absolute start-0 top-0 bottom-0 my-auto h-5 w-[3px] rounded-full",
                            isDanger
                              ? "bg-[rgb(229_72_77)]"
                              : !accent && "bg-foreground",
                          )}
                          style={
                            !isDanger && accent
                              ? { background: accent }
                              : undefined
                          }
                          transition={indicatorTransition}
                        />
                      )}
                      {item.icon ? (
                        <span className="relative z-10 flex [&>svg]:h-[18px] [&>svg]:w-[18px]">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenState(!isOpen)}
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
        className={cn(
          "absolute top-0 right-0 z-20 h-10 w-10 rounded-[12px] bg-transparent",
          !disabled && "cursor-pointer",
          FOCUS,
        )}
      />
    </div>
  );
};

export { PopMenu };
export default PopMenu;
