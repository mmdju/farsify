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

import "@ncdai/react-wheel-picker/style.css";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";

type WheelPickerOption<T extends WheelPickerPrimitive.WheelPickerValue = string> =
  WheelPickerPrimitive.WheelPickerOption<T>;

type TimerMode = "compact" | "picker" | "running" | "paused";

const DEFAULT_SURFACE = "#2c2c2c";
const DEFAULT_PROGRESS = "#ff9f0a";
const GO_COLOR = "#34c759";

function inkOn(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return "#ffffff";
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#111111" : "#ffffff";
}

const AUTO_START_MS = 700;
const AUTO_OPEN_MS = 650;
const AUTO_STEP_MS = 520;
const AUTO_STEPS = 3;
const AUTO_HOLD_MS = 700;
const AUTO_RUN_MS = 4000;
const AUTO_REST_MS = 1500;

const SURFACE_DIMENSIONS: Record<
  TimerMode,
  { width: number; height: number; borderRadius: number }
> = {
  compact: { width: 300, height: 84, borderRadius: 42 },
  picker: { width: 342, height: 286, borderRadius: 48 },
  running: { width: 390, height: 180, borderRadius: 48 },
  paused: { width: 390, height: 180, borderRadius: 48 },
};

const SURFACE_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1.5,
} as const;

const MIN_MINUTES = 1;
const MAX_MINUTES = 60;
const DEFAULT_MINUTES = 5;
const OPTION_ITEM_HEIGHT = 44;

const MINUTE_OPTIONS: WheelPickerOption<number>[] = Array.from(
  { length: MAX_MINUTES - MIN_MINUTES + 1 },
  (_, index) => {
    const value = MIN_MINUTES + index;
    return {
      label: toFaDigits(value),
      value,
      textValue: `${toFaDigits(value)} دقیقه`,
    };
  },
);

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return toFaDigits(`${minutes}:${String(rest).padStart(2, "0")}`);
}

function TimerIcon({ ink }: { ink: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="20" cy="20" r="20" fill="currentColor" fillOpacity={0.16} />
      <rect x="16.5" y="8" width="7" height="2.75" rx="1.375" fill="currentColor" />
      <circle cx="20" cy="22" r="9" fill="currentColor" />
      <path
        d="M20 22v-4.75"
        stroke={ink}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContentLayer({
  children,
  isVisible,
}: {
  children: ReactNode;
  isVisible: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden={!isVisible}
      inert={!isVisible}
      initial={false}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible || reduceMotion ? 1 : 0.95,
      }}
      transition={
        reduceMotion
          ? { duration: 0.1 }
          : isVisible
            ? { duration: 0.22, delay: 0.08, ease: "easeOut" }
            : { duration: 0.15, ease: "easeIn" }
      }
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        isVisible ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {children}
    </motion.div>
  );
}

const BLUR_BANDS = [
  { blur: 2, from: 0, to: 35 },
  { blur: 4, from: 30, to: 65 },
  { blur: 7, from: 60, to: 95 },
];

function BlurBand({
  blur,
  from,
  to,
  side,
}: {
  blur: number;
  from: number;
  to: number;
  side: "top" | "bottom";
}) {
  const ramp = (to - from) / 3;
  const mask = `linear-gradient(to ${side}, transparent ${from}%, black ${from + ramp}%, black ${to - ramp}%, transparent ${to}%)`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

function MinutePicker({
  selectedMinutes,
  onChange,
  surface,
}: {
  selectedMinutes: number;
  onChange: (minutes: number) => void;
  surface: string;
}) {
  const bandHeight = `calc(50% - ${OPTION_ITEM_HEIGHT / 2}px)`;

  return (
    <div className="relative w-[176px] cursor-grab active:cursor-grabbing [&_[data-rwp]]:cursor-grab! [&_[data-rwp]]:active:cursor-grabbing!">
      <WheelPickerPrimitive.WheelPickerWrapper className="w-full">
        <WheelPickerPrimitive.WheelPicker<number>
          options={MINUTE_OPTIONS}
          value={selectedMinutes}
          onValueChange={onChange}
          infinite
          visibleCount={20}
          optionItemHeight={OPTION_ITEM_HEIGHT}
          dragSensitivity={4}
          scrollSensitivity={10}
          classNames={{
            optionItem:
              "pe-16! text-[40px]! font-normal leading-none text-zinc-500 tabular-nums dark:text-zinc-500",
            highlightWrapper:
              "rounded-2xl bg-(--st-ink)/8 text-(--st-ink) data-rwp-focused:inset-ring-2 data-rwp-focused:inset-ring-(--st-ink)/30",
            highlightItem:
              "pe-16! text-[40px] font-normal leading-none text-(--st-ink) tabular-nums",
          }}
        />
      </WheelPickerPrimitive.WheelPickerWrapper>

      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: bandHeight }}
      >
        {BLUR_BANDS.map((band) => (
          <BlurBand key={`top-${band.blur}`} side="top" {...band} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: bandHeight }}
      >
        {BLUR_BANDS.map((band) => (
          <BlurBand key={`bottom-${band.blur}`} side="bottom" {...band} />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${surface} 0%, transparent 22%, transparent 78%, ${surface} 100%)`,
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-[90px] top-1/2 mt-1.5 -translate-y-1/2 text-[20px] font-medium text-(--st-ink)"
      >
        دقیقه
      </span>
    </div>
  );
}

const BORDER_STROKE = 6;

function TimerBorder({
  remainingSeconds,
  totalSeconds,
  width,
  height,
  borderRadius,
  color,
}: {
  remainingSeconds: number;
  totalSeconds: number;
  width: number;
  height: number;
  borderRadius: number;
  color: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
  const clamped = Math.min(1, Math.max(0, progress));

  const inset = BORDER_STROKE / 2;
  const radius = Math.max(
    0,
    Math.min(borderRadius - inset, height / 2 - inset, width / 2 - inset),
  );
  const path = [
    `M ${width / 2} ${inset}`,
    `H ${width - inset - radius}`,
    `A ${radius} ${radius} 0 0 1 ${width - inset} ${inset + radius}`,
    `V ${height - inset - radius}`,
    `A ${radius} ${radius} 0 0 1 ${width - inset - radius} ${height - inset}`,
    `H ${inset + radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset} ${height - inset - radius}`,
    `V ${inset + radius}`,
    `A ${radius} ${radius} 0 0 1 ${inset + radius} ${inset}`,
    "Z",
  ].join(" ");

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="pointer-events-none absolute inset-0"
    >
      <path
        d={path}
        stroke="black"
        strokeOpacity={0.3}
        strokeWidth={BORDER_STROKE}
      />
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={BORDER_STROKE}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        initial={false}
        animate={{
          strokeDashoffset: 1 - clamped,
          opacity: clamped > 0 ? 1 : 0,
        }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.25, ease: "linear" }
        }
      />
    </svg>
  );
}

const buttonBase =
  "flex cursor-pointer items-center justify-center rounded-full pb-[2px] text-[18px] font-semibold outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--st-ink)/70";

export const SetTimer = ({
  autoPreview = false,
  progressColor = DEFAULT_PROGRESS,
  surfaceColor = DEFAULT_SURFACE,
}: {
  autoPreview?: boolean;
  progressColor?: string;
  surfaceColor?: string;
}) => {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<TimerMode>("compact");
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_MINUTES * 60);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MINUTES * 60);
  const deadlineRef = useRef<number | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const selectedRef = useRef(selectedMinutes);
  selectedRef.current = selectedMinutes;

  const isTimerActive = mode === "running" || mode === "paused";
  const dimensions = SURFACE_DIMENSIONS[mode];
  const goInk = inkOn(surfaceColor) === "#111111" ? "#15803d" : GO_COLOR;

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
    const roll = () => {
      const wheel = surfaceRef.current?.querySelector<HTMLElement>("[data-rwp]");
      wheel?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          cancelable: true,
        }),
      );
    };
    const cycle = () => {
      const reset = DEFAULT_MINUTES;
      setSelectedMinutes(reset);
      setTotalSeconds(reset * 60);
      setRemainingSeconds(reset * 60);
      setMode("picker");
      for (let step = 0; step < AUTO_STEPS; step++) {
        at(AUTO_OPEN_MS + step * AUTO_STEP_MS, roll);
      }
      const startAt = AUTO_OPEN_MS + (AUTO_STEPS - 1) * AUTO_STEP_MS + AUTO_HOLD_MS;
      at(startAt, () => {
        deadlineRef.current = Date.now() + selectedRef.current * 60 * 1000;
        setMode("running");
      });
      at(startAt + AUTO_RUN_MS, () => {
        deadlineRef.current = null;
        setMode("compact");
      });
      at(startAt + AUTO_RUN_MS + AUTO_REST_MS, cycle);
    };
    at(AUTO_START_MS, cycle);
    return () => {
      alive = false;
      pending.forEach((timer) => window.clearTimeout(timer));
      deadlineRef.current = null;
      setMode("compact");
    };
  }, [autoPreview]);

  useEffect(() => {
    if (mode !== "running") return;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const next = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setRemainingSeconds(next);

      if (next === 0) {
        deadlineRef.current = null;
        restoreFocusRef.current =
          surfaceRef.current?.contains(document.activeElement) ?? false;
        setMode("picker");
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const layer = isTimerActive ? "running" : mode;
    surfaceRef.current
      ?.querySelector<HTMLElement>(
        `[data-timer-layer="${layer}"] :is(button, [tabindex="0"])`,
      )
      ?.focus({ preventScroll: true });
  }, [mode, isTimerActive]);

  const trackFocus = (event: MouseEvent) => {
    restoreFocusRef.current = event.detail === 0;
  };

  const openPicker = (event: MouseEvent) => {
    trackFocus(event);
    const seconds = selectedMinutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setMode("picker");
  };

  const start = (event: MouseEvent) => {
    trackFocus(event);
    const seconds = selectedMinutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    deadlineRef.current = Date.now() + seconds * 1000;
    setMode("running");
  };

  const pauseOrResume = () => {
    if (mode === "running") {
      deadlineRef.current = null;
      setMode("paused");
      return;
    }

    if (mode === "paused") {
      deadlineRef.current = Date.now() + remainingSeconds * 1000;
      setMode("running");
    }
  };

  const cancel = (event: MouseEvent) => {
    trackFocus(event);
    deadlineRef.current = null;
    setMode("compact");
  };

  const handleMinutesChange = (minutes: number) => {
    const seconds = minutes * 60;
    setTotalSeconds(seconds);
    setSelectedMinutes(minutes);
    setRemainingSeconds(seconds);
  };

  return (
    <motion.div
      ref={surfaceRef}
      role="group"
      aria-label="تایمر"
      initial={{ opacity: 0, ...SURFACE_DIMENSIONS.compact }}
      animate={{ opacity: 1, ...dimensions }}
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { ...SURFACE_SPRING, opacity: { duration: 0.2 } }
      }
      className="relative min-w-[250px] overflow-hidden text-(--st-ink) shadow-sm"
      style={
        {
          backgroundColor: surfaceColor,
          "--st-ink": inkOn(surfaceColor),
        } as CSSProperties
      }
    >
      <ContentLayer isVisible={mode === "compact"}>
        <div data-timer-layer="compact" style={SURFACE_DIMENSIONS.compact}>
          <button
            type="button"
            onClick={openPicker}
            className="relative flex size-full cursor-pointer items-center justify-center rounded-[42px] pb-[2px] text-[28px] font-medium outline-none transition-colors hover:bg-(--st-ink)/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--st-ink)/70"
          >
            <span className="absolute start-[22px] top-1/2 -translate-y-1/2">
              <TimerIcon ink={surfaceColor} />
            </span>
            <span className="-translate-y-px">تایمر بذار</span>
          </button>
        </div>
      </ContentLayer>

      <ContentLayer isVisible={mode === "picker"}>
        <div
          data-timer-layer="picker"
          className="flex items-center justify-between ps-6 pe-4"
          style={SURFACE_DIMENSIONS.picker}
        >
          <MinutePicker
            selectedMinutes={selectedMinutes}
            onChange={handleMinutesChange}
            surface={surfaceColor}
          />
          <motion.button
            type="button"
            onClick={start}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className={cn(buttonBase, "h-14 w-24 hover:brightness-125")}
            style={{
              backgroundColor: "color-mix(in oklab, #34c759 20%, transparent)",
              color: goInk,
            }}
          >
            شروع
          </motion.button>
        </div>
      </ContentLayer>

      <ContentLayer isVisible={isTimerActive}>
        <div
          data-timer-layer="running"
          className="relative flex flex-row-reverse items-center justify-between gap-2 px-5"
          style={SURFACE_DIMENSIONS.running}
        >
          <TimerBorder
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            color={progressColor}
            {...SURFACE_DIMENSIONS.running}
          />

          <motion.button
            type="button"
            onClick={pauseOrResume}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className={cn(buttonBase, "relative h-14 w-24 overflow-hidden")}
            style={{
              backgroundColor:
                mode === "paused"
                  ? "color-mix(in oklab, #34c759 20%, transparent)"
                  : `color-mix(in oklab, ${progressColor} 20%, transparent)`,
              color: mode === "paused" ? goInk : progressColor,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={mode === "paused" ? "resume" : "pause"}
                initial={{ y: reduceMotion ? "0%" : "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: reduceMotion ? "0%" : "-100%", opacity: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 500, damping: 35 }
                }
                className="block"
              >
                {mode === "paused" ? "ادامه" : "توقف"}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <span
            role="timer"
            aria-label={`زمان باقی‌مانده ${formatTime(remainingSeconds)}${
              mode === "paused" ? "، متوقف" : ""
            }`}
            className="relative -translate-y-px text-[48px] font-light leading-none tabular-nums"
          >
            {formatTime(remainingSeconds)}
          </span>

          <motion.button
            type="button"
            onClick={cancel}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className={cn(buttonBase, "relative h-14 w-24 bg-(--st-ink)/10 hover:bg-(--st-ink)/15")}
          >
            لغو
          </motion.button>
        </div>
      </ContentLayer>
    </motion.div>
  );
};

export default SetTimer;
