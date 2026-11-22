"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SaveStatus = "idle" | "loading" | "success";

export interface SaveButtonProps {
  onSave?: () => void | Promise<void>;
  idleLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  loadingMs?: number;
  successMs?: number;
  backgroundColor?: string;
  textColor?: string;
  successColor?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function SaveButton({
  onSave,
  idleLabel = "ذخیره",
  loadingLabel = "در حال ذخیره",
  successLabel = "ذخیره شد",
  loadingMs = 1200,
  successMs = 2000,
  backgroundColor = "#232323",
  textColor = "#fafafa",
  successColor = "#22c55e",
  disabled = false,
  ariaLabel,
  className,
}: SaveButtonProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timers = useRef<number[]>([]);
  const reduce = useReducedMotion();

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const later = useCallback((callback: () => void, ms: number) => {
    timers.current.push(window.setTimeout(callback, ms));
  }, []);

  const run = async () => {
    if (status !== "idle" || disabled) return;
    setStatus("loading");
    try {
      const pending = onSave?.();
      await (pending && typeof pending.then === "function"
        ? pending
        : new Promise<void>((resolve) => later(resolve, loadingMs)));
    } catch {
      setStatus("idle");
      return;
    }
    setStatus("success");
    later(() => setStatus("idle"), successMs);
  };

  const label =
    status === "loading"
      ? loadingLabel
      : status === "success"
        ? successLabel
        : idleLabel;
  const words = label.split(" ").filter(Boolean);

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };

  const muted = status === "loading";
  const surface: CSSProperties = muted
    ? {
        backgroundColor: `color-mix(in srgb, ${textColor} 5%, ${backgroundColor})`,
        color: `color-mix(in srgb, ${textColor} 58%, ${backgroundColor})`,
      }
    : { backgroundColor, color: textColor };

  return (
    <span className={cn("group relative inline-flex font-sans", className)}>
      <button
        type="button"
        onClick={run}
        disabled={disabled || status !== "idle"}
        aria-busy={status === "loading"}
        aria-label={ariaLabel}
        style={surface}
        className={cn(
          "inline-flex h-12 min-w-36 items-center justify-center rounded-full px-8 text-base font-medium leading-6 transition-[background-color,color,filter] duration-300",
          status === "idle" &&
            "hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          status !== "idle" && "cursor-not-allowed",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex -translate-y-px items-center justify-center gap-[0.27em]">
          <AnimatePresence mode="popLayout" initial={false}>
            {words.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  filter: "blur(4px)",
                  transition: { duration: reduce ? 0 : 0.14 },
                }}
                transition={
                  reduce ? { duration: 0 } : { ...spring, delay: index * 0.045 }
                }
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </button>

      <span className="pointer-events-none absolute -end-1 -top-1 z-10">
        <AnimatePresence mode="wait">
          {status !== "idle" ? (
            <motion.span
              initial={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0, x: -8, filter: "blur(4px)" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
              style={
                status === "success"
                  ? { backgroundColor: successColor, color: "#ffffff" }
                  : { backgroundColor, color: textColor }
              }
              className="flex size-6 items-center justify-center rounded-full ring-3 ring-background"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {status === "loading" ? (
                  <motion.span
                    key="loader"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: reduce ? 0 : 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-3.5 animate-spin motion-reduce:animate-none"
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                    className="flex items-center justify-center"
                  >
                    <Check
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={2.6}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </span>
  );
}

export default SaveButton;
