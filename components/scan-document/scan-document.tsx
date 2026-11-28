"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { ScanText } from "lucide-react";

export type ScanStatus = "idle" | "scanning" | "done";

export interface ScanDocumentProps {
  labels?: Partial<Record<ScanStatus, string>>;
  duration?: number;
  onComplete?: () => void;
  autoPreview?: boolean;
  className?: string;
}

const DEFAULT_LABELS: Record<ScanStatus, string> = {
  idle: "اسکن سند",
  scanning: "در حال اسکن",
  done: "انجام شد",
};

const SCAN_DURATION_MS = 5000;
const REDUCED_SCAN_DURATION_MS = 900;
const SCAN_EXIT_DURATION_SECONDS = 0.4;
const REDUCED_SCAN_EXIT_DURATION_SECONDS = 0.2;
const DONE_RESET_DELAY_MS = 1100;
const SCAN_BAR_TRAVEL = 132;

const SCAN_MOVE_TIMES = [0, 0.1, 0.45, 0.55, 0.9, 1];
const SCAN_CONTAINER_TIMES = [0, 0.55, 1];
const DOCUMENT_ROTATE_Y = [0, 0, 180, 180, 360, 360];
const SCAN_BAR_Y = [0, 0, 1, 1, 0, 0].map(
  (progress) => progress * SCAN_BAR_TRAVEL,
);

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;

function ScanBar({ transition, z }: { transition: Transition; z: number }) {
  return (
    <motion.div
      animate={{ y: SCAN_BAR_Y }}
      transition={transition}
      style={{ z }}
      className="absolute top-0 left-1/2 h-[7px] w-[124px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 shadow-[0_0_16px_3px_var(--color-orange-200),0_5px_9px_-1px_var(--color-orange-100)]"
    >
      <div className="absolute inset-x-3 top-[1px] h-[1.5px] rounded-full bg-white/70 blur-[0.5px]" />
      <div className="absolute top-1/2 start-[-1px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-orange-200 blur-[1px]" />
      <div className="absolute top-1/2 end-[-1px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-orange-100 blur-[1px]" />
    </motion.div>
  );
}

function ScanningDocument({ reduceMotion }: { reduceMotion: boolean }) {
  const scanCycle: Transition = {
    duration: reduceMotion
      ? REDUCED_SCAN_DURATION_MS / 1000 - REDUCED_SCAN_EXIT_DURATION_SECONDS
      : SCAN_DURATION_MS / 1000 - SCAN_EXIT_DURATION_SECONDS,
    ease: EASE_IN_OUT,
    times: SCAN_MOVE_TIMES,
  };

  const scanExit: TargetAndTransition = {
    scaleX: 0.16,
    scaleY: reduceMotion ? 0.12 : 0,
    y: 30,
    opacity: 0,
    transition: {
      duration: reduceMotion
        ? REDUCED_SCAN_EXIT_DURATION_SECONDS
        : SCAN_EXIT_DURATION_SECONDS,
      ease: EASE_OUT,
    },
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={
        reduceMotion
          ? { scaleX: 1, scaleY: 1, y: 0, opacity: 0 }
          : { scaleX: 0.16, scaleY: 0.12, y: 30, opacity: 1 }
      }
      animate={{
        scaleX: reduceMotion ? [1, 1, 1] : [0.16, 0.16, 1],
        scaleY: reduceMotion ? [1, 1, 1] : [0.12, 1, 1],
        y: reduceMotion ? [0, 0, 0] : [30, 0, 0],
        opacity: 1,
      }}
      exit={scanExit}
      transition={{
        duration: reduceMotion ? 0.2 : 0.5,
        ease: EASE_OUT,
        times: SCAN_CONTAINER_TIMES,
      }}
      className="origin-bottom"
    >
      <div className="h-[150px] w-[110px] [perspective:900px]">
        <motion.div
          animate={{ rotateY: reduceMotion ? [0, 0, 0, 0, 0, 0] : DOCUMENT_ROTATE_Y }}
          transition={scanCycle}
          className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
        >
          <div className="absolute top-0 left-1/2 h-full w-[7px] -translate-x-1/2 rounded-sm bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-300 shadow-[0_8px_24px_rgba(0,0,0,0.18)]" />

          <div className="absolute inset-0 overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] [backface-visibility:hidden]">
            <div className="ms-4 mt-4 h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <div className="ms-4 mt-4 h-[3px] w-12 rounded bg-zinc-300" />
            <div className="ms-4 mt-2 h-[3px] w-16 rounded bg-zinc-200" />
            <div className="ms-4 mt-1.5 h-[3px] w-14 rounded bg-zinc-200" />
            <div className="ms-4 mt-1.5 h-[3px] w-16 rounded bg-zinc-200" />
            <div className="ms-4 mt-1.5 h-[3px] w-10 rounded bg-zinc-200" />
            <div className="ms-5 mt-8 h-4 w-12 -rotate-6 rounded-full border-b-2 border-zinc-300" />
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-zinc-200 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-zinc-100 to-transparent" />
          </div>

          <ScanBar transition={scanCycle} z={3} />
          <ScanBar transition={scanCycle} z={-3} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ScanDocument({
  labels,
  duration = SCAN_DURATION_MS,
  onComplete,
  autoPreview = false,
  className,
}: ScanDocumentProps) {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const reduceMotion = useReducedMotion() ?? false;
  const timerRef = useRef<number | null>(null);
  const text = { ...DEFAULT_LABELS, ...labels };

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handleScan = () => {
    if (status !== "idle") return;

    setStatus("scanning");
    clearTimer();

    timerRef.current = window.setTimeout(
      () => {
        setStatus("done");
        onComplete?.();
        timerRef.current = window.setTimeout(() => {
          setStatus("idle");
          timerRef.current = null;
        }, DONE_RESET_DELAY_MS);
      },
      reduceMotion ? REDUCED_SCAN_DURATION_MS : duration,
    );
  };

  useEffect(() => {
    if (!autoPreview || status !== "idle") return undefined;
    const timer = window.setTimeout(handleScan, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPreview, status]);

  return (
    <section
      aria-label="اسکنر سند"
      className={className ?? "flex h-[320px] flex-col items-center justify-center gap-8"}
    >
      <div className="flex h-[170px] items-end">
        <AnimatePresence>
          {status === "scanning" ? (
            <ScanningDocument key="scanning-document" reduceMotion={reduceMotion} />
          ) : null}
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-live="polite"
        aria-busy={status === "scanning"}
        disabled={status !== "idle"}
        onClick={handleScan}
        className="group flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/10 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-md transition-[background-color,transform] duration-150 ease-out hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-foreground disabled:active:scale-100 motion-reduce:active:scale-100 dark:border-border dark:bg-accent dark:text-foreground dark:disabled:hover:bg-accent"
      >
        <ScanText size={17} strokeWidth={1.8} className="shrink-0" />
        <span className="-translate-y-px leading-[1.4]">{text[status]}</span>
      </button>
    </section>
  );
}
