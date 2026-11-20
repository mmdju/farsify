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
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(215,14%,22%)'/%3E%3Cstop offset='1' stop-color='hsl(215,16%,36%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3C/svg%3E";

const DEFAULT_CARDS: ScrollPanelCard[] = [
  {
    title: "دماوند",
    kicker: "بامِ ایران",
    description:
      "از دوردست فقط یک هرمِ برفی است که بالای ابرها می‌ایستد؛ بلندترین قلهٔ خاورمیانه.",
    bgColor: "#ead9c4",
    textColor: "#2a1810",
  },
  {
    title: "هیرکانی",
    kicker: "دامنهٔ شمالی",
    description:
      "جنگلی که از عصرِ یخبندان مانده؛ مه از میانِ درختانِ کهنسال تا دهکده پایین می‌آید.",
    bgColor: "#c4452d",
    textColor: "#fff4ec",
  },
  {
    title: "راهِ قله",
    kicker: "از پَی تا بام",
    description:
      "سه روز راه از دهکده تا قله؛ شب که می‌شود، آتشِ چادرها از دور پیدا است.",
    bgColor: "#2c3033",
    textColor: "#e6e2da",
  },
];

export interface ScrollPanelCard {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  kicker?: string;
}

export interface ScrollPanelsProps {
  items?: ScrollPanelCard[];
  imageSrc?: string;
  className?: string;
  containerRef?: RefObject<HTMLElement | null>;
  paneHeight?: string;
  panelHeight?: string;
  peak?: number;
  flipStart?: number;
  innerRadius?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const remap = (progress: number, from: number, to: number) => {
  if (to === from) return progress >= to ? 1 : 0;
  return clamp01((progress - from) / (to - from));
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const PEAK_RATIO = 0.18;

function panelShiftX(
  progress: number,
  pos: number,
  count: number,
  peak: number,
) {
  const dir = count <= 1 ? 0 : pos === 0 ? -1 : pos === count - 1 ? 1 : 0;
  const out = remap(progress, 0, 0.4);
  const settle = remap(progress, 0.4, 0.8);
  return (dir * lerp(0, peak, out) * (1 - settle * 0.5)) || 0;
}

function panelFlip(progress: number, flipStart: number) {
  return remap(progress, flipStart, Math.min(1, flipStart + 0.4));
}

function panelRotateY(progress: number, flipStart: number) {
  return lerp(0, 180, panelFlip(progress, flipStart));
}

function panelScale(progress: number) {
  return lerp(1, 0.92, remap(progress, 0, 0.4));
}

function panelRadius(progress: number, pos: number, count: number, max: number) {
  const inner = lerp(0, max, remap(progress, 0, 0.2));
  const outer = "16px";
  if (count <= 1) return outer;
  if (pos === 0) return `${outer} ${inner}px ${inner}px ${outer}`;
  if (pos === count - 1) return `${inner}px ${outer} ${outer} ${inner}px`;
  return `${inner}px`;
}

function useIsRtl() {
  const ref = useRef<HTMLDivElement>(null);
  const [rtl, setRtl] = useState(true);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (el) setRtl(getComputedStyle(el).direction === "rtl");
  }, []);

  return [ref, rtl] as const;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function Panel({
  card,
  index,
  count,
  rtl,
  reduced,
  progress,
  imageSrc,
  peak,
  flipStart,
  innerRadius,
}: {
  card: ScrollPanelCard;
  index: number;
  count: number;
  rtl: boolean;
  reduced: boolean;
  progress: MotionValue<number>;
  imageSrc: string;
  peak: MotionValue<number>;
  flipStart: number;
  innerRadius: number;
}) {
  const pos = rtl ? count - 1 - index : index;
  const x = useTransform([progress, peak], ([p, peakPx]: number[]) =>
    reduced ? 0 : panelShiftX(p, pos, count, peakPx),
  );
  const rotateY = useTransform(progress, (p) =>
    reduced ? 0 : panelRotateY(p, flipStart),
  );
  const radius = useTransform(progress, (p) =>
    panelRadius(reduced ? 0 : p, pos, count, innerRadius),
  );
  const frontOpacity = useTransform(progress, (p) =>
    reduced ? 1 - panelFlip(p, flipStart) : 1,
  );
  const backOpacity = useTransform(progress, (p) =>
    reduced ? panelFlip(p, flipStart) : 1,
  );
  const slice = count > 1 ? (pos / (count - 1)) * 100 : 0;
  const posX = slice >= 99.9 ? 99.9 : slice;

  return (
    <motion.div
      data-sp-panel=""
      className={cn(
        "relative h-full min-w-0 flex-[1_1_0] [transform-style:preserve-3d]",
        "@container",
        index > 0 && "-ml-px",
      )}
      style={{
        x,
        rotateY,
        zIndex: index,
        ...(reduced
          ? { backgroundColor: card.bgColor, borderRadius: radius }
          : {}),
      }}
    >
      <motion.div
        className="absolute inset-0 [backface-visibility:hidden]"
        style={{
          borderRadius: radius,
          backgroundColor: card.bgColor,
          opacity: frontOpacity,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${count * 100}% 100%`,
            backgroundPosition: `${posX}% center`,
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-between p-4 antialiased [backface-visibility:hidden] @[230px]:p-5 @[300px]:p-6"
        style={{
          backgroundColor: card.bgColor,
          color: card.textColor,
          borderRadius: radius,
          rotateY: reduced ? 0 : 180,
          opacity: backOpacity,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium tabular-fa">
          <span>{toFaDigits(String(index + 1).padStart(2, "0"))}</span>
          {card.kicker ? <span className="truncate">{card.kicker}</span> : null}
        </div>
        <div>
          <div
            className="mb-3 h-px w-7 opacity-50 @[230px]:mb-4"
            style={{ backgroundColor: "currentColor" }}
          />
          <h3 className="text-[18px] font-semibold leading-[1.4] text-balance @[230px]:text-[22px] @[300px]:text-[26px]">
            {card.title}
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-pretty @[230px]:mt-2.5 @[230px]:text-[13px]">
            {card.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ScrollPanels = ({
  items = DEFAULT_CARDS,
  imageSrc = DEFAULT_IMAGE,
  className = "",
  containerRef,
  paneHeight = "100vh",
  panelHeight = "min(420px,56vh)",
  peak = 48,
  flipStart = 0.4,
  innerRadius = 16,
}: ScrollPanelsProps) => {
  const cards = items.slice(0, 3);
  const count = cards.length;
  const [trackRef, rtl] = useIsRtl();
  const reduced = useReducedMotionPreference();
  const progress = useMotionValue(0);
  useEffect(() => {
    const target = trackRef.current;
    if (!target) return undefined;

    let frame = 0;
    let visible = true;

    const measure = () => {
      frame = 0;
      if (containerRef) {
        const container = containerRef.current;
        if (!container) return;
        const max = container.scrollHeight - container.clientHeight;
        progress.set(max > 0 ? clamp01(container.scrollTop / max) : 0);
        return;
      }
      const rect = target.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      progress.set(clamp01(-rect.top / total));
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible) schedule();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "150px 0px" },
    );
    observer.observe(target);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [containerRef, progress]);

  const scale = useTransform(progress, (p) => (reduced ? 1 : panelScale(p)));
  const peakValue = useMotionValue(peak);
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const sync = () => {
      const panel = row.querySelector<HTMLElement>("[data-sp-panel]");
      const width = panel
        ? panel.getBoundingClientRect().width
        : row.clientWidth / Math.max(1, count);
      peakValue.set(Math.min(peak, width * PEAK_RATIO));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(row);
    return () => observer.disconnect();
  }, [count, peak, peakValue]);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-[400vh] w-full bg-neutral-100 dark:bg-neutral-950",
        className,
      )}
    >
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="hidden"
        decoding="async"
      />
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden [perspective:1400px]"
        style={{ height: paneHeight }}
      >
        <motion.div
          ref={rowRef}
          className="flex w-full max-w-4xl px-4 [transform-style:preserve-3d]"
          style={{ scale, height: panelHeight }}
        >
          {cards.map((card, index) => (
            <Panel
              key={`${card.title}-${index}`}
              card={card}
              index={index}
              count={count}
              rtl={rtl}
              reduced={reduced}
              progress={progress}
              imageSrc={imageSrc}
              peak={peakValue}
              flipStart={flipStart}
              innerRadius={innerRadius}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ScrollPanels;
export { ScrollPanels };
