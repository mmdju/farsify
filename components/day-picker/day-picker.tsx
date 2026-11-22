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

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronsUpDown } from "lucide-react";

const AUTO_START_MS = 700;
const AUTO_MENU_MS = 900;
const AUTO_ROW_MS = 1000;
const AUTO_DAY_MS = 800;
const AUTO_REST_MS = 1700;

const week = [
  { short: "ش", name: "شنبه" },
  { short: "ی", name: "یک‌شنبه" },
  { short: "د", name: "دوشنبه" },
  { short: "س", name: "سه‌شنبه" },
  { short: "چ", name: "چهارشنبه" },
  { short: "پ", name: "پنجشنبه" },
  { short: "ج", name: "جمعه" },
];

const frequencies = [
  { id: "daily", label: "روزانه" },
  { id: "weekly", label: "هفتگی" },
  { id: "monthly", label: "ماهانه" },
  { id: "yearly", label: "سالانه" },
] as const;

export type DayFrequency = (typeof frequencies)[number]["id"];

export type DayPickerProps = {
  defaultDay?: number;
  defaultFrequency?: DayFrequency;
  accentColor?: string;
  onChange?: (value: { day: number; frequency: DayFrequency }) => void;
  autoPreview?: boolean;
  className?: string;
};

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

const spring = { type: "spring", damping: 30, stiffness: 400, mass: 1 } as const;

const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring";

export function DayPicker({
  defaultDay = 0,
  defaultFrequency = "daily",
  accentColor = "",
  onChange,
  autoPreview = false,
  className,
}: DayPickerProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : spring;

  const [day, setDay] = useState(defaultDay);
  const [frequency, setFrequency] = useState<DayFrequency>(defaultFrequency);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDayRowOpen, setIsDayRowOpen] = useState(true);

  const autoDay = useRef(1);

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
    const cycle = () => {
      setIsMenuOpen(true);
      at(AUTO_MENU_MS, () => {
        setFrequency("weekly");
        setIsDayRowOpen(true);
        at(AUTO_ROW_MS, () => {
          setDay(autoDay.current % week.length);
          autoDay.current = (autoDay.current + 2) % week.length;
          at(AUTO_DAY_MS, () => {
            setIsMenuOpen(false);
            setIsDayRowOpen(false);
            at(AUTO_REST_MS, cycle);
          });
        });
      });
    };
    at(AUTO_START_MS, cycle);
    return () => {
      alive = false;
      pending.forEach((timer) => window.clearTimeout(timer));
      setIsMenuOpen(false);
      setIsDayRowOpen(true);
      setDay(defaultDay);
      setFrequency(defaultFrequency);
    };
  }, [autoPreview, defaultDay, defaultFrequency]);

  const frequencyLabel =
    frequencies.find((item) => item.id === frequency)?.label ?? "روزانه";
  const dayLabel = week[day]?.name ?? "شنبه";

  const pickFrequency = (id: DayFrequency) => {
    setFrequency(id);
    setIsDayRowOpen(true);
    onChange?.({ day, frequency: id });
  };

  const pickDay = (index: number) => {
    setDay(index);
    onChange?.({ day: index, frequency });
  };

  return (
    <div className={cn("w-full max-w-xs", className)}>
      <motion.div
        layout
        transition={transition}
        className="flex flex-col gap-1.5 overflow-hidden rounded-3xl bg-accent p-1.5 text-sm font-medium border border-border"
      >
        <div className="relative flex items-center justify-between">
          <motion.div
            layout
            animate={{ filter: isMenuOpen ? "blur(8px)" : "blur(0px)" }}
            transition={transition}
            className="flex h-full items-center justify-center px-3 py-2 text-muted-foreground"
          >
            تکرار
          </motion.div>

          {isMenuOpen ? (
            <div className="absolute flex h-full w-full justify-between gap-2 p-0">
              <div className="relative flex w-full items-center justify-between rounded-3xl">
                <motion.div
                  layout
                  transition={transition}
                  layoutId="day-picker-options"
                  className="absolute h-full w-full rounded-3xl bg-background"
                />

                <div className="flex w-full justify-between px-1">
                  {frequencies.map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={{ filter: "blur(8px)", opacity: 0 }}
                      animate={{ filter: "blur(0px)", opacity: 1 }}
                      transition={transition}
                      onClick={() => pickFrequency(item.id)}
                      aria-pressed={frequency === item.id}
                      className={cn(
                        "relative cursor-pointer rounded-3xl px-2 py-1 text-muted-foreground transition-colors duration-300",
                        focusRing,
                        frequency === item.id && "text-foreground",
                      )}
                    >
                      {frequency === item.id && (
                        <motion.span
                          layoutId="day-picker-selected"
                          transition={transition}
                          style={
                            accentColor
                              ? {
                                  backgroundColor: `color-mix(in srgb, ${accentColor} 22%, transparent)`,
                                }
                              : undefined
                          }
                          className="absolute inset-0 h-full w-full rounded-3xl bg-accent"
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                <motion.button
                  key="confirm"
                  type="button"
                  layoutId="day-picker-button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsDayRowOpen(false);
                  }}
                  initial={{ filter: "blur(1px)", opacity: 0.6 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  exit={{ filter: "blur(1px)", opacity: 0.6 }}
                  transition={transition}
                  aria-label="تأیید تکرار"
                  style={
                    accentColor
                      ? { backgroundColor: accentColor, color: inkOn(accentColor) }
                      : undefined
                  }
                  className={cn(
                    "flex h-full cursor-pointer items-center justify-center rounded-3xl bg-primary px-2.5 text-primary-foreground",
                    focusRing,
                  )}
                >
                  <Check size={16} />
                </motion.button>
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-expanded={isMenuOpen}
              aria-label="انتخاب تکرار"
              className="relative flex w-fit cursor-pointer items-center rounded-full p-0"
            >
              <motion.span
                layout
                transition={transition}
                layoutId="day-picker-options"
                className="absolute h-full w-full rounded-3xl bg-background"
              />
              <motion.span className="relative py-0 ps-3 text-foreground">
                {frequency === "weekly" ? `${frequencyLabel}، ${dayLabel}` : frequencyLabel}
              </motion.span>
              <AnimatePresence initial={false}>
                <motion.span
                  key="chevron"
                  layoutId="day-picker-button"
                  className="relative flex h-fit w-fit items-center justify-center px-3 pe-2 py-2.5 text-muted-foreground"
                >
                  <ChevronsUpDown size={14} />
                </motion.span>
              </AnimatePresence>
            </button>
          )}
        </div>

        {isDayRowOpen && frequency === "weekly" && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={transition}
            className="flex justify-between overflow-hidden rounded-full bg-background px-2 py-1 text-muted-foreground"
          >
            {week.map((item, index) => (
              <motion.button
                key={item.name}
                type="button"
                initial={{ filter: "blur(8px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.03 }}
                onClick={() => pickDay(index)}
                aria-label={item.name}
                aria-pressed={index === day}
                className={cn(
                  "relative cursor-pointer rounded-3xl px-2 py-1 transition-colors duration-300",
                  focusRing,
                  index === day ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="relative z-10">{item.short}</span>
                {index === day && (
                  <motion.span
                    layoutId="day-picker-day"
                    transition={transition}
                    className="absolute inset-0 h-full w-full rounded-3xl bg-accent"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default DayPicker;
