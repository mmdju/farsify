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
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SNAPPY = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.6 };
const DRAG_SPRING = { type: "spring" as const, stiffness: 900, damping: 60, mass: 0.5 };
const PRICE_SPRING = { type: "spring" as const, stiffness: 420, damping: 25, mass: 0.7 };

type Plan = "annual" | "lifetime";

const ANNUAL_PRICES = [100000, 180000, 240000, 300000, 400000];
const LIFETIME_PRICES = [260000, 440000, 600000, 760000, 1000000];

const CAPTIONS = [
  "با همین حمایت، خرج‌های اصلی سر جاش می‌مونه.",
  "کمک می‌کنی آروم و پیوسته بهتر بشیم.",
  "به‌روزرسانی‌های سنجیده رو ممکن می‌کنی.",
  "با حوصله و وسواس می‌سازیم؛ به لطف تو.",
  "چه حالی! داری کل مسیر رو حمایت می‌کنی.",
];

const DEFAULT_HEADING = (
  <>
    قیمتش رو خودت انتخاب کن.
    <br />
    از چیزی که برات مهمه حمایت کن.
  </>
);

export interface PremiumPaywallProps {
  plan?: Plan;
  defaultPlan?: Plan;
  step?: number;
  defaultStep?: number;
  annualPrices?: number[];
  lifetimePrices?: number[];
  captions?: string[];
  heading?: ReactNode;
  ctaLabel?: string;
  accent?: string;
  radius?: number;
  showCaptions?: boolean;
  onContinue?: () => void;
  onPlanChange?: (plan: Plan) => void;
  onStepChange?: (step: number) => void;
  className?: string;
}

export default function PremiumPaywall({
  plan,
  defaultPlan = "annual",
  step,
  defaultStep = 2,
  annualPrices = ANNUAL_PRICES,
  lifetimePrices = LIFETIME_PRICES,
  captions = CAPTIONS,
  heading = DEFAULT_HEADING,
  ctaLabel = "با نسخهٔ ویژه ادامه بده",
  accent,
  radius = 28,
  showCaptions = true,
  onContinue,
  onPlanChange,
  onStepChange,
  className,
}: PremiumPaywallProps) {
  const reduce = useReducedMotion() ?? false;
  const [innerPlan, setInnerPlan] = useState<Plan>(defaultPlan);
  const [innerStep, setInnerStep] = useState(defaultStep);

  const activePlan = plan ?? innerPlan;
  const prices = activePlan === "annual" ? annualPrices : lifetimePrices;
  const stepCount = Math.max(captions.length, 1);
  const activeStep = Math.min(
    Math.max(step ?? innerStep, 0),
    stepCount - 1,
  );
  const price = prices[Math.min(activeStep, prices.length - 1)] ?? 0;
  const suffix = activePlan === "annual" ? "تومان در سال" : "تومان یک‌باره";
  const accentColor = accent ?? "var(--primary)";

  const changePlan = (next: Plan) => {
    if (plan === undefined) setInnerPlan(next);
    onPlanChange?.(next);
  };

  const changeStep = (next: number) => {
    if (next === activeStep) return;
    if (step === undefined) setInnerStep(next);
    onStepChange?.(next);
  };

  return (
    <div
      style={{ borderRadius: radius }}
      className={cn(
        "flex w-full max-w-[380px] flex-col items-center border border-border bg-accent px-7 py-8",
        className,
      )}
    >
      <h2 className="text-center text-[21px] font-bold leading-[1.55] text-foreground">
        {heading}
      </h2>

      <div className="mt-[22px]">
        <SegmentedControl plan={activePlan} onChange={changePlan} reduce={reduce} />
      </div>

      <div className="mt-[30px]">
        <PriceLabel price={price} suffix={suffix} reduce={reduce} />
      </div>

      <div className="mt-2 w-full">
        <DetentSlider
          step={activeStep}
          stepCount={stepCount}
          onChange={changeStep}
          label="انتخاب مبلغ حمایت"
          valueText={`${formatFa(price)} ${suffix}`}
          accent={accentColor}
          reduce={reduce}
        />
      </div>

      <div className="mt-3 flex min-h-[26px] items-center">
        {showCaptions && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={activeStep}
              initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", y: 4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", y: -4 }}
              transition={reduce ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ color: accentColor }}
              className="m-0 text-center text-[15px] font-bold leading-[1.6]"
            >
              {captions[activeStep]}
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      <motion.button
        type="button"
        onClick={onContinue}
        whileTap={reduce ? undefined : { scale: 0.96, opacity: 0.85 }}
        transition={SNAPPY}
        className="mt-[22px] h-14 w-full cursor-pointer rounded-full border-none bg-foreground font-[inherit] text-[18px] font-bold leading-[1.4] text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {ctaLabel}
      </motion.button>
    </div>
  );
}

function SegmentedControl({
  plan,
  onChange,
  reduce,
}: {
  plan: Plan;
  onChange: (plan: Plan) => void;
  reduce: boolean;
}) {
  const options: { key: Plan; label: string }[] = [
    { key: "annual", label: "سالانه" },
    { key: "lifetime", label: "یک‌باره" },
  ];

  return (
    <div
      role="group"
      aria-label="دورهٔ پرداخت"
      className="flex gap-0.5 rounded-full bg-background p-[3px]"
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={plan === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "relative cursor-pointer rounded-full border-none bg-transparent px-6 py-2.5 font-[inherit] text-[15px] font-semibold leading-[1.4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            plan === option.key ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {plan === option.key && (
            <motion.span
              layoutId="premium-paywall-pill"
              transition={reduce ? { duration: 0 } : SNAPPY}
              className="absolute inset-0 rounded-full bg-accent"
              style={{ boxShadow: "0 3px 10px rgb(0 0 0 / 0.2)" }}
            />
          )}
          <span className="relative">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

function Digit({
  char,
  direction,
  reduce,
}: {
  char: string;
  direction: number;
  reduce: boolean;
}) {
  const away = direction >= 0 ? "-55%" : "55%";
  const toward = direction >= 0 ? "55%" : "-55%";

  return (
    <span className="relative block h-[52px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={reduce ? { opacity: 0 } : { y: toward, opacity: 0, filter: "blur(10px)" }}
          animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0 } }
              : {
                  y: away,
                  opacity: 0,
                  filter: "blur(10px)",
                  transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
                }
          }
          transition={reduce ? { duration: 0 } : PRICE_SPRING}
          className="block leading-[52px]"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function PriceLabel({
  price,
  suffix,
  reduce,
}: {
  price: number;
  suffix: string;
  reduce: boolean;
}) {
  const [prevPrice, setPrevPrice] = useState(price);
  const [direction, setDirection] = useState(0);

  if (price !== prevPrice) {
    setDirection(price > prevPrice ? 1 : -1);
    setPrevPrice(price);
  }

  const chars = formatFa(price).split("");

  return (
    <div className="flex items-baseline gap-2">
      <div
        dir="ltr"
        className="tabular-nums flex h-[52px] text-[42px] font-extrabold leading-[52px] text-foreground"
      >
        {chars.map((char, index) => (
          <Digit
            key={`${chars.length - index}-${char === "٬" ? "sep" : "num"}`}
            char={char}
            direction={direction}
            reduce={reduce}
          />
        ))}
      </div>
      <span className="pb-1 text-[13px] font-semibold leading-[1.6] text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

function DetentSlider({
  step,
  stepCount,
  onChange,
  label,
  valueText,
  accent,
  reduce,
}: {
  step: number;
  stepCount: number;
  onChange: (step: number) => void;
  label: string;
  valueText: string;
  accent: string;
  reduce: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [rtl, setRtl] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [fingerProgress, setFingerProgress] = useState(0);
  const [width, setWidth] = useState(0);

  const HEIGHT = 56;
  const TRACK_HEIGHT = 30;
  const THUMB_SIZE = 46;
  const DOT_SIZE = 11;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setRtl(getComputedStyle(el).direction === "rtl");
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const inset = TRACK_HEIGHT / 2;
  const usable = Math.max(width - TRACK_HEIGHT, 1);
  const restingProgress = step / Math.max(stepCount - 1, 1);
  const rawProgress = isDragging ? fingerProgress : restingProgress;
  const progress = rubberBanded(rawProgress);
  const thumbCenter = inset + usable * progress;
  const sign = rtl ? -1 : 1;

  function rubberBanded(value: number) {
    if (value < 0) return -overshootResistance(-value);
    if (value > 1) return 1 + overshootResistance(value - 1);
    return value;
  }

  function overshootResistance(overshoot: number) {
    return 0.06 * (1 - 1 / (8 * overshoot + 1));
  }

  function updateFromPointer(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = rtl ? rect.right - clientX : clientX - rect.left;
    const value = (offset - inset) / usable;
    setFingerProgress(value);
    const clamped = Math.min(Math.max(value, 0), 1);
    const nearest = Math.round(clamped * (stepCount - 1));
    if (nearest !== step) onChange(nearest);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    updateFromPointer(event.clientX);
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = stepCount - 1;
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let next = step;

    if (event.key === forward || event.key === "ArrowUp") next = step + 1;
    else if (event.key === backward || event.key === "ArrowDown") next = step - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    onChange(Math.min(Math.max(next, 0), last));
  }

  const springNow = reduce ? { duration: 0 } : isDragging ? DRAG_SPRING : SNAPPY;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={stepCount - 1}
      aria-valuenow={step}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="relative w-full cursor-pointer touch-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      style={{ height: HEIGHT }}
    >
      <div
        className="absolute inset-x-0 rounded-full bg-background"
        style={{ top: (HEIGHT - TRACK_HEIGHT) / 2, height: TRACK_HEIGHT }}
      />

      <motion.div
        initial={false}
        animate={{ width: Math.max(TRACK_HEIGHT, thumbCenter + inset) }}
        transition={springNow}
        className="absolute rounded-full"
        style={{
          top: (HEIGHT - TRACK_HEIGHT) / 2,
          insetInlineStart: 0,
          height: TRACK_HEIGHT,
          backgroundColor: accent,
        }}
      />

      {Array.from({ length: stepCount }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            x: sign * (inset + usable * (index / Math.max(stepCount - 1, 1)) - DOT_SIZE / 2),
          }}
          transition={reduce ? { duration: 0 } : { duration: 0.2 }}
          className={cn(
            "absolute rounded-full transition-colors duration-200",
            index > step && "bg-border",
          )}
          style={{
            top: (HEIGHT - DOT_SIZE) / 2,
            insetInlineStart: 0,
            width: DOT_SIZE,
            height: DOT_SIZE,
            backgroundColor: index <= step ? accent : undefined,
          }}
        />
      ))}

      <motion.div
        initial={false}
        animate={{ x: sign * (thumbCenter - THUMB_SIZE / 2), scale: isDragging && !reduce ? 1.12 : 1 }}
        transition={springNow}
        className="absolute flex items-center justify-center rounded-full bg-foreground"
        style={{
          top: (HEIGHT - THUMB_SIZE) / 2,
          insetInlineStart: 0,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          boxShadow: isDragging
            ? "0 9px 20px rgb(0 0 0 / 0.32)"
            : "0 5px 12px rgb(0 0 0 / 0.2)",
        }}
      >
        <div
          className="rounded-full"
          style={{ width: THUMB_SIZE - 18, height: THUMB_SIZE - 18, backgroundColor: accent }}
        />
      </motion.div>
    </div>
  );
}
