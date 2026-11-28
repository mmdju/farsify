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

import { useState, type ComponentType, type SVGProps } from "react";

import { motion, useReducedMotion } from "motion/react";

const SPRING = {
  type: "spring" as const,
  damping: 20,
  stiffness: 230,
  mass: 1.2,
};

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const CalendarIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10Zm.75 1.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12Zm.75 1.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10Zm.75 1.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
    />
  </svg>
);

const AlertIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M17.1 12.6v-1.8A5.4 5.4 0 0 0 13 5.6V3a1 1 0 0 0-2 0v2.4a5.4 5.4 0 0 0-4 5.5v1.8c0 2.4-1.9 3-1.9 4.2c0 .6 0 1.2.5 1.2h13c.5 0 .5-.6.5-1.2c0-1.2-1.9-1.8-1.9-4.2ZM8.8 19a3.5 3.5 0 0 0 6.4 0z" />
  </svg>
);

const InboxIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm0 2l-6.5 4.47a1 1 0 0 1-1 0L5 6Z" />
  </svg>
);

export interface DiscreteTabsItem {
  id: string;
  title: string;
  icon?: ComponentType<IconProps>;
}

export interface DiscreteTabsProps {
  tabs?: DiscreteTabsItem[];
  active?: string;
  defaultActive?: string;
  onChange?: (id: string) => void;
  accent?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DEFAULT_TABS: DiscreteTabsItem[] = [
  { id: "inbox", title: "صندوق", icon: InboxIcon },
  { id: "planner", title: "برنامه", icon: CalendarIcon },
  { id: "alerts", title: "هشدارها", icon: AlertIcon },
];

const SIZES = {
  sm: { icon: 18, pad: "p-2.5", activePad: "px-3.5", text: "text-[13px]" },
  md: { icon: 22, pad: "p-3", activePad: "px-4", text: "text-[14px]" },
  lg: { icon: 26, pad: "p-3.5", activePad: "px-5", text: "text-[15px]" },
} as const;

export default function DiscreteTabs({
  tabs = DEFAULT_TABS,
  active,
  defaultActive,
  onChange,
  accent = "#fafafa",
  size = "md",
  className,
}: DiscreteTabsProps) {
  const reduce = useReducedMotion() ?? false;
  const [inner, setInner] = useState(() => defaultActive ?? tabs[0]?.id ?? "");
  const [interacted, setInteracted] = useState(false);
  const current = active ?? inner;
  const scale = SIZES[size];

  const select = (id: string) => {
    if (id === current) return;
    if (active === undefined) setInner(id);
    setInteracted(true);
    onChange?.(id);
  };

  return (
    <div
      role="group"
      aria-label="بخش‌ها"
      className={cn("flex items-center gap-4", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === current;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            type="button"
            aria-label={tab.title}
            aria-pressed={isActive}
            onClick={() => select(tab.id)}
            layout={!reduce}
            transition={reduce ? { duration: 0 } : SPRING}
            style={{
              color: isActive ? accent : undefined,
              willChange: "transform",
            }}
            className={cn(
              "group flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-[25px] border border-white/10 bg-foreground text-background shadow-md transition-colors duration-75 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-border dark:bg-accent dark:text-foreground",
              !isActive && "text-neutral-400 dark:text-foreground",
              scale.pad,
              isActive && scale.activePad,
            )}
          >
            {Icon && (
              <motion.span
                layout={!reduce ? "position" : false}
                className={cn(
                  "shrink-0 transition-opacity duration-150",
                  isActive ? "opacity-100" : "opacity-55 group-hover:opacity-90",
                )}
                style={{ willChange: "transform" }}
              >
                <Icon size={scale.icon} />
              </motion.span>
            )}
            {isActive && (
              <motion.span
                initial={interacted ? { opacity: 0, filter: "blur(4px)" } : false}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: interacted ? 0.2 : 0, ease: [0.86, 0, 0.07, 1] }
                }
                className="flex items-center"
              >
                <motion.span
                  layout={!reduce ? "position" : false}
                  className={cn(
                    "relative inline-block whitespace-nowrap font-medium leading-[1.4]",
                    scale.text,
                  )}
                  style={{ willChange: "transform", translate: "0 -1px" }}
                >
                  {tab.title}
                </motion.span>
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
