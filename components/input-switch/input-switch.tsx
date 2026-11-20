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

import { useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ChevronsUpDown,
  Image as ImageIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Bezier = [number, number, number, number];

const EASE: Bezier = [0.32, 0.72, 0, 1];

export interface InputSwitchOption {
  text: string;
  icon?: LucideIcon;
}

export interface InputSwitchProps {
  options?: InputSwitchOption[];
  defaultOption?: number;
  onSubmit?: (value: string) => void;
  className?: string;
}

const DEFAULT_OPTIONS: InputSwitchOption[] = [
  { text: "دنبال چی می‌گردی؟", icon: Sparkles },
  { text: "تصویر بساز...", icon: ImageIcon },
];

const AnimatedPlaceholder = ({
  text,
  reduce,
}: {
  text: string;
  reduce: boolean;
}) => (
  <span className="inline-flex gap-x-[0.3em] overflow-hidden whitespace-nowrap">
    {text
      .split(" ")
      .filter(Boolean)
      .map((word, index) => (
        <motion.span
          key={`${index}-${word}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(2px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(2px)" }}
          transition={
            reduce
              ? { duration: 0 }
              : { delay: 0.03 * index, duration: 0.2, ease: EASE }
          }
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
  </span>
);

export default function InputSwitch({
  options = DEFAULT_OPTIONS,
  defaultOption = 0,
  onSubmit,
  className,
}: InputSwitchProps) {
  const reduce = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(0, defaultOption), options.length - 1),
  );
  const [value, setValue] = useState("");
  const current = options[activeIndex] ?? DEFAULT_OPTIONS[0];
  const CurrentIcon = current.icon ?? Sparkles;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onSubmit?.(value);
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-center justify-center overflow-hidden rounded-full bg-muted px-1 py-1",
        className,
      )}
    >
      <motion.button
        type="button"
        onClick={() => setActiveIndex((prev) => (prev + 1) % options.length)}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        aria-label={`تغییر پیشنهاد: ${current.text}`}
        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-full bg-background p-2.5 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <span className="relative size-5 shrink-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeIndex}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, filter: "blur(3px)" }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, filter: "blur(3px)" }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", duration: 0.25, bounce: 0 }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <CurrentIcon aria-hidden className="size-5 text-foreground" />
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronsUpDown aria-hidden className="size-3 shrink-0 text-muted-foreground" />
      </motion.button>
      <div className="relative min-w-0 flex-1">
        {!value && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-0 flex w-full items-center overflow-hidden ps-1.5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeIndex}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.15, ease: EASE }
                }
                className="block overflow-hidden whitespace-nowrap text-sm text-muted-foreground"
              >
                <AnimatedPlaceholder text={current.text} reduce={reduce} />
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={current.text}
          className="h-9 w-full bg-transparent ps-1.5 text-sm text-foreground outline-none"
        />
      </div>
      <button
        type="button"
        onClick={() => onSubmit?.(value)}
        aria-label="ارسال"
        className="flex shrink-0 cursor-pointer items-center justify-center self-stretch rounded-full bg-background px-3 py-2.5 shadow-sm transition-transform duration-150 ease-in-out active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <ArrowLeft aria-hidden className="h-4 w-4 text-foreground" />
      </button>
    </div>
  );
}
