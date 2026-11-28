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
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
  type Variants,
} from "motion/react";

type Bezier = [number, number, number, number];

const HINGE_LTR = "3px 6px";
const HINGE_RTL = "21px 6px";
const LID_OPEN = -35;

const WALL_TOP = 6;
const WALL_TOP_OPEN = 13.5;
const WALL_BASE = 20;

const TILE = 48;
const PANEL = 84;
const HOLD = { deleted: 1400, kept: 600 } as const;

const AUTO_START_MS = 700;
const AUTO_OPEN_MS = 1500;

const EASE: Bezier = [0.32, 0.72, 0, 1];
const EASE_LID: Bezier = [0.34, 1.1, 0.64, 1];

const WIDTH: Transition = { duration: 0.62, ease: EASE };
const LID: Transition = { duration: 0.6, ease: EASE_LID };
const WALL: Transition = { duration: 0.56, ease: EASE };
const IN: Transition = { duration: 0.44, ease: EASE, delay: 0.14 };
const OUT: Transition = { duration: 0.3, ease: EASE };
const TAP: Transition = { duration: 0.2, ease: EASE };
const SWAP: Transition = { duration: 0.22, ease: EASE };
const SETTLE: Transition = { duration: 0.45, ease: EASE };
const PRESS: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 18,
  mass: 0.5,
};
const INSTANT: Transition = { duration: 0 };

const ACCENT = "#e5484d";

const SURFACE = "bg-foreground dark:bg-accent";
const RECESS = "bg-accent dark:bg-muted";
const GLYPH = "text-background dark:text-muted-foreground";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground";

const LIFT =
  "shadow-[0_0.5px_1px_rgb(0_0_0/0.05),0_1px_3px_rgb(0_0_0/0.08),inset_0_0.5px_0_rgb(255_255_255/0.9)] dark:shadow-[0_0.5px_1px_rgb(0_0_0/0.35),0_1.5px_4px_rgb(0_0_0/0.25),inset_0_0.5px_0_rgb(255_255_255/0.07)]";

const CIRCLE = cn(
  "grid h-7 w-7 place-items-center rounded-full",
  "transition duration-200 hover:brightness-105 dark:hover:brightness-125",
  FOCUS,
  SURFACE,
  LIFT,
);

const ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const CIRCLE_MOTION: Variants = {
  hidden: { opacity: 0, scale: 0.9, transition: OUT },
  shown: { opacity: 1, scale: 1, transition: IN },
};

function useIsRtl() {
  const ref = useRef<HTMLDivElement>(null);
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setRtl(getComputedStyle(el).direction === "rtl");
  }, []);

  return [ref, rtl] as const;
}

function Circle({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div className="flex" variants={reduced ? undefined : CIRCLE_MOTION}>
      <motion.button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        whileHover={reduced || disabled ? undefined : { scale: 1.03 }}
        whileTap={reduced || disabled ? undefined : { scale: 0.84 }}
        transition={PRESS}
        className={CIRCLE}
      >
        <svg
          {...ICON}
          width="14"
          height="14"
          stroke="currentColor"
          strokeWidth="3.5"
        >
          {children}
        </svg>
      </motion.button>
    </motion.div>
  );
}

type Status = "idle" | "deleted" | "kept";

export type DeleteButtonProps = Omit<
  ComponentProps<"div">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "children"
> & {
  accent?: string;
  disabled?: boolean;
  autoPreview?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function DeleteButton({
  className,
  accent = ACCENT,
  disabled = false,
  autoPreview = false,
  onConfirm,
  onCancel,
  onKeyDown,
  ...props
}: DeleteButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [root, rtl] = useIsRtl();
  const trigger = useRef<HTMLButtonElement>(null);
  const timing = (transition: Transition) =>
    reduced ? INSTANT : transition;

  const top = useMotionValue(WALL_TOP);
  const wall = useTransform(top, (y) => WALL_BASE - y);
  const bin = useMotionTemplate`M19 ${top}v${wall}a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V${top}`;
  const settle = useMotionValue(1);

  const confirmRef = useRef(onConfirm);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    confirmRef.current = onConfirm;
    cancelRef.current = onCancel;
  });

  useEffect(() => {
    const walls = animate(
      top,
      open ? WALL_TOP_OPEN : WALL_TOP,
      reduced ? INSTANT : WALL,
    );
    return () => walls.stop();
  }, [open, reduced, top]);

  useEffect(() => {
    if (status === "idle") return;
    const nudge =
      status === "kept" && !reduced
        ? animate(settle, [1, 0.86, 1], SETTLE)
        : null;
    const done = setTimeout(() => setStatus("idle"), HOLD[status]);
    return () => {
      nudge?.stop();
      clearTimeout(done);
    };
  }, [status, reduced, settle]);

  useEffect(() => {
    if (!autoPreview || disabled) return;
    let alive = true;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let cycleTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      if (!alive) return;
      setOpen(true);
      setStatus("idle");
      openTimer = setTimeout(() => {
        if (!alive) return;
        setOpen(false);
        setStatus("deleted");
        confirmRef.current?.();
        cycleTimer = setTimeout(cycle, HOLD.deleted + 700);
      }, AUTO_OPEN_MS);
    };

    const start = setTimeout(cycle, AUTO_START_MS);
    return () => {
      alive = false;
      clearTimeout(start);
      clearTimeout(openTimer);
      clearTimeout(cycleTimer);
      setOpen(false);
      setStatus("idle");
    };
  }, [autoPreview, disabled]);

  const resolve = (next: Exclude<Status, "idle">) => {
    setOpen(false);
    setStatus(next);
    if (!autoPreview) trigger.current?.focus();
    (next === "deleted" ? confirmRef : cancelRef).current?.();
  };

  const slide = rtl ? -6 : 6;
  const panelMotion: Variants = {
    hidden: { opacity: 0, x: slide, transition: timing(OUT) },
    shown: {
      opacity: 1,
      x: 0,
      transition: { ...timing(IN), staggerChildren: 0.07 },
    },
  };

  return (
    <motion.div
      {...props}
      ref={root}
      data-slot="delete-button"
      data-state={open ? "open" : "closed"}
      data-status={status}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative flex h-12 justify-end rounded-2xl",
        SURFACE,
        GLYPH,
        disabled && "opacity-50",
        className,
      )}
      animate={{ width: open ? TILE + PANEL : TILE }}
      transition={timing(WIDTH)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape" && open) resolve("kept");
      }}
    >
      <motion.button
        ref={trigger}
        type="button"
        aria-label="حذف"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) return resolve("kept");
          setStatus("idle");
          setOpen(true);
        }}
        whileTap={reduced || disabled ? undefined : { scale: 0.94 }}
        transition={TAP}
        className={cn(
          "relative z-10 grid h-12 w-12 place-items-center rounded-2xl",
          FOCUS,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === "deleted" ? (
            <motion.svg
              key="done"
              {...ICON}
              width="20"
              height="20"
              stroke={accent}
              strokeWidth="2.5"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={timing(SWAP)}
            >
              <motion.path
                d="M4 12.5 9.5 18 20 7"
                initial={reduced ? undefined : { pathLength: 0 }}
                animate={reduced ? undefined : { pathLength: 1 }}
                transition={timing(SETTLE)}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="bin"
              {...ICON}
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              className="overflow-visible"
              style={{ scale: settle }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={timing(SWAP)}
            >
              <motion.path d={bin} />
              <motion.g
                style={{
                  transformBox: "view-box",
                  transformOrigin: rtl ? HINGE_RTL : HINGE_LTR,
                }}
                animate={{ rotate: open ? (rtl ? -LID_OPEN : LID_OPEN) : 0 }}
                transition={timing(LID)}
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </motion.g>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <span role="status" aria-live="polite" className="sr-only">
        {status === "deleted" ? "حذف شد" : status === "kept" ? "لغو شد" : ""}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            style={{ width: PANEL }}
            className={cn(
              "absolute inset-y-0 start-0 flex items-center justify-center gap-2 rounded-2xl",
              RECESS,
            )}
            variants={reduced ? undefined : panelMotion}
            initial={reduced ? false : "hidden"}
            animate={reduced ? undefined : "shown"}
            exit={reduced ? undefined : "hidden"}
          >
            <span
              aria-hidden
              style={{
                insetInlineEnd: "-5px",
                clipPath: rtl
                  ? "polygon(100% 0, 0 50%, 100% 100%)"
                  : "polygon(0 0, 100% 50%, 0 100%)",
              }}
              className={cn(
                "absolute top-1/2 z-20 h-2.5 w-1.5 -translate-y-1/2",
                RECESS,
              )}
            />
            <Circle
              label="تأییدِ حذف"
              disabled={disabled}
              onClick={() => resolve("deleted")}
            >
              <path d="M4 12.5 9.5 18 20 7" stroke={accent} />
            </Circle>
            <Circle
              label="انصراف"
              disabled={disabled}
              onClick={() => resolve("kept")}
            >
              <path d="M6 6 18 18M18 6 6 18" />
            </Circle>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DeleteButton;
