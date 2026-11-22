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
import { Undo2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";

const AUTO_START_MS = 700;
const AUTO_REST_MS = 1200;

const LAYOUT_DURATION = 0.4;
const LAYOUT_EASE: [number, number, number, number] = [0.77, 0, 0.175, 1];
const WORD_DURATION = 0.3;
const WORD_EASE: [number, number, number, number] = [0.785, 0.135, 0.15, 0.86];
const WORD_STAGGER = 0.03;
const GUARD_MS = LAYOUT_DURATION * 1000;
const END_HOLD_MS = 700;

export interface CountdownDeleteProps {
  deleteLabel?: string;
  cancelLabel?: string;
  countdown?: number;
  deleteColor?: string;
  softColor?: string;
  onCountdownEnd?: () => void;
  autoPreview?: boolean;
  className?: string;
}

export default function CountdownDelete({
  deleteLabel = "حذف حساب کاربری",
  cancelLabel = "لغو حذف",
  countdown = 10,
  deleteColor = "#e5484d",
  softColor = "#fdecec",
  onCountdownEnd,
  autoPreview = false,
  className,
}: CountdownDeleteProps) {
  const reduce = useReducedMotion();
  const total = Math.max(1, Math.round(countdown));
  const [isDeleting, setIsDeleting] = useState(false);
  const [count, setCount] = useState(total);
  const [isAnimating, setIsAnimating] = useState(false);
  const firedRef = useRef(false);

  const swapTo = (next: boolean) => {
    setIsAnimating(true);
    setIsDeleting(next);
    if (next) {
      firedRef.current = false;
      setCount(total);
    }
    setTimeout(() => setIsAnimating(false), GUARD_MS);
  };

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
      if (!alive) return;
      setIsAnimating(true);
      setIsDeleting(true);
      firedRef.current = false;
      setCount(total);
      at(
        GUARD_MS + total * 1000 + END_HOLD_MS + AUTO_REST_MS,
        cycle,
      );
    };
    at(AUTO_START_MS, cycle);
    return () => {
      alive = false;
      pending.forEach((timer) => window.clearTimeout(timer));
      setIsAnimating(false);
      setIsDeleting(false);
    };
  }, [autoPreview, total]);

  const handleClick = (next: boolean) => {
    if (isAnimating) return;
    swapTo(next);
  };

  useEffect(() => {
    if (!isDeleting || count === 0) return;
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isDeleting, count]);

  useEffect(() => {
    if (!isDeleting || count !== 0) return;
    if (!firedRef.current) {
      firedRef.current = true;
      if (!autoPreview) onCountdownEnd?.();
    }
    const timer = setTimeout(() => swapTo(false), END_HOLD_MS);
    return () => clearTimeout(timer);
  }, [isDeleting, count, autoPreview, onCountdownEnd]);

  const blurClose = reduce ? "blur(0px)" : "blur(1px)";

  const swapIn: Transition = reduce
    ? { duration: 0 }
    : {
        layout: { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
        backgroundColor: { duration: 0.4, ease: "easeInOut" },
        filter: { duration: 0.1, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeOut" },
      };

  const swapOut: Transition = reduce
    ? { duration: 0 }
    : {
        layout: { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
        backgroundColor: { duration: 0.4, ease: "easeInOut" },
        filter: { duration: 0.2, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeIn" },
      };

  const tick: Transition = reduce ? { duration: 0 } : { duration: 0.18 };

  const pop = (delay: number): Transition =>
    reduce ? { duration: 0 } : { duration: 0.2, delay };

  const renderWords = (text: string, prefix: string) =>
    text
      .split(" ")
      .filter(Boolean)
      .map((word, i) => (
        <motion.span
          key={`${prefix}-${i}-${word}`}
          initial={reduce ? { opacity: 0 } : { y: 16, opacity: 0, scale: 0.7 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0, scale: 0.7 }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: WORD_DURATION,
                  ease: WORD_EASE,
                  delay: i * WORD_STAGGER,
                }
          }
          className="inline-block"
        >
          {word}
        </motion.span>
      ));

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {!isDeleting ? (
          <motion.button
            key="delete"
            layoutId="countdown-delete-pill"
            type="button"
            onClick={() => handleClick(true)}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            style={{ pointerEvents: isAnimating ? "none" : "auto" }}
            initial={{
              backgroundColor: softColor,
              filter: blurClose,
              opacity: 1,
            }}
            animate={{
              backgroundColor: deleteColor,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{
              backgroundColor: softColor,
              filter: blurClose,
              opacity: 0,
            }}
            className="flex items-center justify-center overflow-hidden rounded-full px-5 py-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            transition={swapIn}
          >
            <motion.span
              layoutId="countdown-delete-text"
              className="relative top-[-2px] flex gap-x-[0.3em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.1 }}
            >
              {renderWords(deleteLabel, "delete")}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            key="cancel"
            layoutId="countdown-delete-pill"
            type="button"
            onClick={() => handleClick(false)}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            style={{ pointerEvents: isAnimating ? "none" : "auto" }}
            initial={{
              backgroundColor: deleteColor,
              filter: blurClose,
              opacity: 0,
            }}
            animate={{
              backgroundColor: softColor,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{
              backgroundColor: deleteColor,
              filter: blurClose,
              opacity: 0,
            }}
            className="flex items-center gap-2 overflow-hidden rounded-full px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            transition={swapOut}
          >
            <motion.div
              className="relative flex h-7 min-w-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full px-3 text-sm font-semibold text-white"
              style={{ backgroundColor: deleteColor }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={pop(0.05)}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={tick}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="relative">{toFaDigits(count)}</span>
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.span
              layoutId="countdown-delete-text"
              className="relative flex gap-x-[0.3em] font-medium"
              style={{ color: deleteColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.1 }}
            >
              {renderWords(cancelLabel, "cancel")}
            </motion.span>

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={pop(0.1)}
              className="flex shrink-0 items-center justify-center rounded-full p-1.5"
              style={{ backgroundColor: deleteColor }}
            >
              <Undo2 className="h-4 w-4 -scale-x-100 text-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
