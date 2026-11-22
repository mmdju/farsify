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
  activeOption?: number;
  onOptionChange?: (index: number) => void;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  pillColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  textColor?: string;
  placeholderColor?: string;
  className?: string;
}

const DEFAULT_OPTIONS: InputSwitchOption[] = [
  { text: "دنبال چی می‌گردی؟", icon: Sparkles },
  { text: "تصویر بساز...", icon: ImageIcon },
];

const AnimatedPlaceholder = ({
  text,
  reduce,
  color,
}: {
  text: string;
  reduce: boolean;
  color: string;
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
  activeOption,
  onOptionChange,
  value,
  onChange,
  onSubmit,
  pillColor = "#232323",
  buttonColor = "#3a3a3a",
  buttonTextColor = "#fafafa",
  textColor = "#fafafa",
  placeholderColor = "",
  className,
}: InputSwitchProps) {
  const reduce = useReducedMotion() ?? false;
  const [innerIndex, setInnerIndex] = useState(() =>
    Math.min(Math.max(0, defaultOption), options.length - 1),
  );
  const [innerValue, setInnerValue] = useState("");
  const activeIndex = Math.min(
    Math.max(0, activeOption ?? innerIndex),
    options.length - 1,
  );
  const text = value ?? innerValue;
  const current = options[activeIndex] ?? DEFAULT_OPTIONS[0];
  const CurrentIcon = current.icon ?? Sparkles;
  const placeholder = placeholderColor || `color-mix(in srgb, ${textColor} 55%, ${pillColor})`;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onSubmit?.(text);
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-center justify-center overflow-hidden rounded-full px-1 py-1",
        className,
      )}
      style={{ backgroundColor: pillColor }}
    >
      <motion.button
        type="button"
        onClick={() => {
          const next = (activeIndex + 1) % options.length;
          if (activeOption === undefined) setInnerIndex(next);
          onOptionChange?.(next);
        }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        aria-label={`تغییر پیشنهاد: ${current.text}`}
        style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden rounded-full p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
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
              <CurrentIcon aria-hidden className="size-5" />
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronsUpDown
          aria-hidden
          className="size-3 shrink-0 opacity-60"
        />
      </motion.button>
      <div className="relative min-w-0 flex-1">
        {!text && (
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
                style={{ color: placeholder }}
                className="block overflow-hidden whitespace-nowrap text-sm"
              >
                <AnimatedPlaceholder text={current.text} reduce={reduce} color={placeholder} />
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        <input
          type="text"
          value={text}
          onChange={(event) => {
            if (value === undefined) setInnerValue(event.target.value);
            onChange?.(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          aria-label={current.text}
          style={{ color: textColor }}
          className="h-9 w-full bg-transparent ps-1.5 text-sm outline-none"
        />
      </div>
      <button
        type="button"
        onClick={() => onSubmit?.(text)}
        aria-label="ارسال"
        style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        className="flex shrink-0 cursor-pointer items-center justify-center self-stretch rounded-full px-3 py-2.5 transition-transform duration-150 ease-in-out active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

export { InputSwitch };
