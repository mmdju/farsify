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
  type CSSProperties,
} from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

type Bezier = [number, number, number, number];

const EASE_OUT: Bezier = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1];

const POP_SCALE = [1, 1.08, 1];
const FLICK_LTR = [0, 8, -2, 0];
const FLICK_RTL = [0, -8, 2, 0];
const FLICK_TIMES = [0, 0.35, 0.7, 1];

const FILL: Transition = { duration: 0.24, ease: EASE_OUT };
const POP: Transition = { duration: 0.34, ease: EASE_OUT, times: [0, 0.4, 1] };
const TICK: Transition = { duration: 0.22, ease: EASE_OUT, delay: 0.06 };
const STRIKE: Transition = { duration: 0.38, ease: EASE_IN_OUT };
const NUDGE: Transition = { duration: 0.3, ease: EASE_OUT, times: FLICK_TIMES };
const REORDER: Transition = { type: "spring", stiffness: 320, damping: 30 };
const INSTANT: Transition = { duration: 0 };

const RING_R = 11;
const RING_DASH = `1 ${(2 * Math.PI * RING_R) / 13 - 1}`;

const STRIKE_STYLE: CSSProperties = {
  backgroundImage: "linear-gradient(currentColor, currentColor)",
  backgroundRepeat: "no-repeat",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

const SIZES = {
  sm: {
    row: "gap-2.5 rounded-xl px-3 py-2",
    check: "h-5 w-5",
    text: "text-xs",
    line: "1.5px",
    list: "gap-1.5",
  },
  md: {
    row: "gap-3 rounded-[14px] px-3.5 py-2.5",
    check: "h-6 w-6",
    text: "text-sm",
    line: "2px",
    list: "gap-2",
  },
  lg: {
    row: "gap-3.5 rounded-2xl px-4 py-3",
    check: "h-7 w-7",
    text: "text-base",
    line: "2.5px",
    list: "gap-2.5",
  },
} as const;

export type TaskSize = keyof typeof SIZES;

const STAGE = {
  idle: "idle",
  tick: "tick",
  strike: "strike",
  nudge: "nudge",
  settled: "settled",
  unstrike: "unstrike",
  untick: "untick",
} as const;
type Stage = (typeof STAGE)[keyof typeof STAGE];

const FILLED: Stage[] = ["tick", "strike", "nudge", "settled", "unstrike"];
const STRUCK: Stage[] = ["strike", "nudge", "settled"];

const CARD = cn(
  "bg-foreground text-background",
  "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_3px_10px_rgb(0_0_0/0.06)]",
  "hover:shadow-[0_1px_2px_rgb(0_0_0/0.05),0_6px_18px_rgb(0_0_0/0.09)]",
  "active:brightness-95",
  "dark:bg-accent dark:text-foreground",
  "dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_3px_10px_rgb(0_0_0/0.3)]",
  "dark:hover:shadow-[0_1px_2px_rgb(0_0_0/0.45),0_6px_18px_rgb(0_0_0/0.4)]",
  "dark:active:brightness-110",
);

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-primary";

function useTiming() {
  const reduced = useReducedMotion() ?? false;
  return (transition: Transition) => (reduced ? INSTANT : transition);
}

function useIsRtl() {
  const ref = useRef<HTMLButtonElement>(null);
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setRtl(getComputedStyle(el).direction === "rtl");
  }, []);

  return [ref, rtl] as const;
}

function TaskCheck({
  filled,
  size,
  accent,
  checkColor,
  onDrawn,
}: {
  filled: boolean;
  size: TaskSize;
  accent: string;
  checkColor: string;
  onDrawn: () => void;
}) {
  const timing = useTiming();

  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("shrink-0", SIZES[size].check)}
      initial={false}
      animate={{ scale: filled ? POP_SCALE : 1 }}
      transition={filled ? timing(POP) : INSTANT}
    >
      <motion.circle
        cx="12"
        cy="12"
        r={RING_R}
        fill="none"
        className="text-neutral-500"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING_DASH}
        initial={false}
        animate={{ opacity: filled ? 0 : 1 }}
        transition={timing(FILL)}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="12"
        fill={accent}
        style={{ transformBox: "view-box", transformOrigin: "12px 12px" }}
        initial={false}
        animate={{ scale: filled ? 1 : 0 }}
        transition={timing(FILL)}
      />
      <motion.path
        d="M7.4 12.4 10.6 15.5 16.6 8.9"
        fill="none"
        stroke={checkColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
        transition={timing(TICK)}
        onAnimationComplete={onDrawn}
      />
    </motion.svg>
  );
}

function TaskLabel({
  label,
  struck,
  size,
  rtl,
  onStruck,
}: {
  label: string;
  struck: boolean;
  size: TaskSize;
  rtl: boolean;
  onStruck: () => void;
}) {
  const timing = useTiming();
  const { text, line } = SIZES[size];

  return (
    <span className="min-w-0 flex-1">
      <motion.span
        style={{
          ...STRIKE_STYLE,
          backgroundPosition: rtl ? "100% 52%" : "0 52%",
        }}
        className={cn(
          "font-medium transition-colors duration-300",
          "motion-reduce:transition-none",
          text,
          struck ? "text-neutral-400" : "text-background dark:text-foreground",
        )}
        initial={false}
        animate={{ backgroundSize: `${struck ? 100 : 0}% ${line}` }}
        transition={timing(STRIKE)}
        onAnimationComplete={onStruck}
      >
        {label}
      </motion.span>
    </span>
  );
}

export type TaskItemProps = Omit<
  ComponentProps<"button">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  size?: TaskSize;
  accent?: string;
  checkColor?: string;
  onCheckedChange?: (checked: boolean) => void;
  onSettled?: () => void;
  onReverted?: () => void;
};

export function TaskItem({
  label,
  checked,
  defaultChecked = false,
  size = "md",
  accent = "currentColor",
  checkColor = "#0a0a0a",
  onCheckedChange,
  onSettled,
  onReverted,
  className,
  onClick,
  ...props
}: TaskItemProps) {
  const timing = useTiming();
  const [rowRef, rtl] = useIsRtl();
  const [own, setOwn] = useState(defaultChecked);
  const done = checked ?? own;

  const [stage, setStage] = useState<Stage>(done ? STAGE.settled : STAGE.idle);
  const [was, setWas] = useState(done);

  if (was !== done) {
    setWas(done);
    setStage(done ? STAGE.tick : STAGE.unstrike);
  }

  const onDrawn = () => {
    if (stage === STAGE.tick) setStage(STAGE.strike);
    if (stage === STAGE.untick) {
      setStage(STAGE.idle);
      onReverted?.();
    }
  };

  const onStruck = () => {
    if (stage === STAGE.strike) setStage(STAGE.nudge);
    if (stage === STAGE.unstrike) setStage(STAGE.untick);
  };

  const onFlicked = () => {
    if (stage !== STAGE.nudge) return;
    setStage(STAGE.settled);
    onSettled?.();
  };

  return (
    <motion.button
      ref={rowRef}
      type="button"
      role="checkbox"
      aria-checked={done}
      data-slot="task-item"
      data-state={done ? "checked" : "unchecked"}
      onClick={(event) => {
        onClick?.(event);
        if (checked === undefined) setOwn(!done);
        onCheckedChange?.(!done);
      }}
      animate={{ x: stage === STAGE.nudge ? (rtl ? FLICK_RTL : FLICK_LTR) : 0 }}
      transition={stage === STAGE.nudge ? timing(NUDGE) : INSTANT}
      onAnimationComplete={onFlicked}
      className={cn(
        "flex w-fit max-w-full cursor-pointer items-start text-start",
        "transition-[filter,box-shadow] duration-300 motion-reduce:transition-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        SIZES[size].row,
        CARD,
        FOCUS,
        className,
      )}
      {...props}
    >
      <TaskCheck
        filled={FILLED.includes(stage)}
        size={size}
        accent={accent}
        checkColor={checkColor}
        onDrawn={onDrawn}
      />
      <TaskLabel
        label={label}
        struck={STRUCK.includes(stage)}
        size={size}
        rtl={rtl}
        onStruck={onStruck}
      />
    </motion.button>
  );
}

export type Task = {
  id: string;
  label: string;
  done?: boolean;
};

export type TaskListProps = ComponentProps<"ul"> & {
  tasks?: Task[];
  defaultTasks?: Task[];
  size?: TaskSize;
  accent?: string;
  checkColor?: string;
  onTasksChange?: (tasks: Task[]) => void;
};

export function TaskList({
  tasks,
  defaultTasks = [],
  size = "md",
  accent,
  checkColor,
  onTasksChange,
  className,
  ...props
}: TaskListProps) {
  const timing = useTiming();
  const [own, setOwn] = useState(defaultTasks);
  const current = tasks ?? own;

  const [parked, setParked] = useState<string[]>(() =>
    (tasks ?? defaultTasks).filter((task) => task.done).map((task) => task.id),
  );
  const [announcement, setAnnouncement] = useState("");

  const toggle = (task: Task, done: boolean) => {
    const next = current.map((item) =>
      item.id === task.id ? { ...item, done } : item,
    );
    if (tasks === undefined) setOwn(next);
    onTasksChange?.(next);
    setAnnouncement(`${task.label} ${done ? "انجام شد" : "باز شد"}`);
  };

  const finished = parked
    .map((id) => current.find((task) => task.id === id))
    .filter((task): task is Task => task?.done === true);
  const open = current.filter((task) => !finished.includes(task));

  return (
    <ul
      data-slot="task-list"
      className={cn(
        "flex w-fit max-w-full flex-col items-start",
        SIZES[size].list,
        className,
      )}
      {...props}
    >
      {[...open, ...finished].map((task) => (
        <motion.li
          key={task.id}
          layout
          transition={timing(REORDER)}
          className="max-w-full"
        >
          <TaskItem
            label={task.label}
            checked={!!task.done}
            size={size}
            accent={accent}
            checkColor={checkColor}
            onCheckedChange={(done) => toggle(task, done)}
            onSettled={() =>
              setParked((ids) =>
                ids.includes(task.id) ? ids : [...ids, task.id],
              )
            }
            onReverted={() =>
              setParked((ids) => ids.filter((id) => id !== task.id))
            }
          />
        </motion.li>
      ))}
      <li role="status" aria-live="polite" className="sr-only">
        {announcement}
      </li>
    </ul>
  );
}

export default TaskList;
