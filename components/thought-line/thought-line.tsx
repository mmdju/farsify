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
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  animate,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";

import "./thought-line.css";

export type ThoughtLineGlyph = "sparkle" | "dot" | "none" | ReactNode;

export interface ThoughtLineProps {
  label?: string;
  doneLabel?: string;
  renderLabel?: (text: string, working: boolean) => ReactNode;
  glyph?: ThoughtLineGlyph;
  steps?: string[];
  collapsible?: boolean;
  collapseOnSettle?: boolean;
  color?: string;
  glyphColor?: string;
  fontSize?: number;
  breathPeriod?: number;
  breathDepth?: number;
  shimmer?: boolean;
  shimmerDuration?: number;
  settleDuration?: number;
  settleBlur?: number;
  working?: boolean;
  settleAfter?: number;
  elapsed?: number;
  showTimer?: boolean;
  onSettle?: (seconds: number) => void;
  className?: string;
  style?: CSSProperties & Record<`--${string}`, string | number>;
}

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];

const DONE_OPACITY = 0.75;
const TIMER_OPACITY = 0.55;
const GLYPH_DONE = 0.55;

const INLINE_SIGN = -1;

const EMPTY_STEPS: string[] = [];

const fmt = (ds: number) =>
  ds < 600
    ? `${formatFa(ds / 10, 1)} ثانیه`
    : `${formatFa(Math.floor(ds / 600))} دقیقه ${formatFa((ds % 600) / 10, 1)} ثانیه`;

const spoken = (ds: number) =>
  ds < 600
    ? `${formatFa(ds / 10, 1)} ثانیه`
    : `${formatFa(Math.floor(ds / 600))} دقیقه و ${formatFa((ds % 600) / 10, 1)} ثانیه`;

const TIMER_ZERO = fmt(0);

type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

const SPARKLE_PATHS: readonly string[] = [
  "M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z",
  "M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z",
];
const CHEVRON_PATH = "M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9";
const TICK_PATH = "M5 14L8.5 17.5L19 6.5";

function Icon({
  paths,
  strokeWidth,
  className,
}: {
  paths: readonly string[];
  strokeWidth: number;
  className: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export const DEFAULT_STEPS: string[] = [
  "خواندن درخواست",
  "جست‌وجو در منابع",
  "نوشتن پاسخ",
];

export function ThoughtLineBase({
  label = "در حال فکر کردن…",
  doneLabel = "",
  renderLabel,
  glyph = "sparkle",
  steps = EMPTY_STEPS,
  collapsible = true,
  collapseOnSettle = true,
  color = "currentColor",
  glyphColor = "",
  fontSize = 16,
  breathPeriod = 1.6,
  breathDepth = 0.45,
  shimmer = true,
  shimmerDuration = 1.8,
  settleDuration = 350,
  settleBlur = 2,
  working = true,
  settleAfter = 0,
  elapsed,
  showTimer = true,
  onSettle,
  className = "",
  style,
}: ThoughtLineProps) {
  const reduce = useReducedMotion();
  const [autoSettled, setAutoSettled] = useState(false);
  const [open, setOpen] = useState(true);
  const isWorking = working && !autoSettled;
  const doneText = doneLabel || (showTimer ? "زمان فکر:" : "فکر تمام شد");
  const hasTrace = steps.length > 0;
  const depth = reduce ? Math.min(breathDepth, 0.2) : breathDepth;
  const period = reduce ? breathPeriod * 1.5 : breathPeriod;
  const trough = 1 - depth;
  const sheen = shimmer && !reduce;

  const glyphRef = useRef<HTMLSpanElement>(null);
  const breathRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const stackRef = useRef<HTMLSpanElement>(null);
  const workRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef<HTMLSpanElement>(null);
  const dsRef = useRef(0);
  const prevWorking = useRef(isWorking);
  const latest = useRef<{ onSettle?: (seconds: number) => void }>({});
  latest.current = { onSettle };
  const [announce, setAnnounce] = useState(label);

  useEffect(() => {
    if (working) setAutoSettled(false);
  }, [working]);
  useEffect(() => {
    if (isWorking) setOpen(true);
    else if (collapseOnSettle) setOpen(false);
  }, [isWorking, collapseOnSettle]);

  useEffect(() => {
    const glyphEl = glyphRef.current;
    const breathEl = breathRef.current;
    if (!breathEl) return undefined;
    const s = settleDuration / 1000;
    const loop = (el: HTMLElement, delay: number) =>
      animate(
        el,
        { opacity: [trough, 1, trough] },
        { duration: period, ease: EASE_IN_OUT, repeat: Infinity, delay },
      );
    let cancelled = false;
    const running: AnimationPlaybackControls[] = [];
    if (isWorking) {
      if (depth > 0) {
        if (sheen) {
          running.push(
            animate(breathEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }),
          );
        }
        if (glyphEl) {
          const lead = animate(
            glyphEl,
            { opacity: trough },
            { duration: 0.2, ease: EASE_OUT },
          );
          running.push(lead);
          lead.then(() => {
            if (cancelled) return;
            running.push(loop(glyphEl, 0));
            if (!sheen) running.push(loop(breathEl, 0.14));
          });
        } else if (!sheen) {
          running.push(loop(breathEl, 0.14));
        }
      } else {
        if (glyphEl) {
          running.push(
            animate(glyphEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }),
          );
        }
        running.push(
          animate(breathEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }),
        );
      }
    } else {
      if (glyphEl) {
        running.push(
          animate(glyphEl, { opacity: GLYPH_DONE }, { duration: s, ease: EASE_OUT }),
        );
      }
      running.push(
        animate(breathEl, { opacity: 1 }, { duration: s, ease: EASE_OUT }),
      );
    }
    return () => {
      cancelled = true;
      running.forEach((a) => a.stop());
    };
  }, [isWorking, period, depth, trough, settleDuration, glyph, sheen]);

  const painted = useRef(false);
  const paint = (ds: number) => {
    dsRef.current = ds;
    const el = timerRef.current;
    if (!el) return;
    if (!painted.current) {
      el.textContent = "";
      painted.current = true;
    }
    const runs = fmt(ds).match(/[۰-۹][۰-۹٫٬]*|[^۰-۹]+/g) ?? [];
    while (el.children.length > runs.length) el.lastElementChild?.remove();

    runs.forEach((run, ri) => {
      let node = el.children[ri] as HTMLElement | undefined;
      if (!node) {
        node = document.createElement("span");
        el.appendChild(node);
      }
      const numeric = /[۰-۹]/.test(run.charAt(0));
      const runClass = numeric ? "thought-line__num" : "";
      if (node.className !== runClass) node.className = runClass;

      if (!numeric) {
        if (node.textContent !== run) node.textContent = run;
        return;
      }
      while (node.children.length > run.length) node.lastElementChild?.remove();
      for (let i = 0; i < run.length; i += 1) {
        let slot = node.children[i] as HTMLElement | undefined;
        if (!slot) {
          slot = document.createElement("span");
          node.appendChild(slot);
        }
        const ch = run.charAt(i);
        const slotClass = /[۰-۹]/.test(ch) ? "thought-line__digit" : "";
        if (slot.className !== slotClass) slot.className = slotClass;
        if (slot.textContent !== ch) slot.textContent = ch;
      }
    });
  };
  useLayoutEffect(() => {
    if (elapsed != null) {
      paint(Math.round(elapsed * 10));
      return undefined;
    }
    if (!isWorking) return undefined;
    const startedAt = performance.now();
    paint(0);
    const id = setInterval(() => {
      const ds = Math.floor((performance.now() - startedAt) / 100);
      paint(ds);
      if (settleAfter > 0 && ds >= Math.round(settleAfter * 10)) setAutoSettled(true);
    }, 100);
    return () => clearInterval(id);
  }, [isWorking, elapsed, settleAfter]);

  useLayoutEffect(() => {
    const t = timerRef.current;
    const stack = stackRef.current;
    if (!t || !stack) return undefined;
    const place = (glide: boolean) => {
      const active = isWorking ? workRef.current : doneRef.current;
      if (!active) return;
      const shift = (active.offsetWidth - stack.offsetWidth) * INLINE_SIGN;
      if (!glide) t.style.transition = "none";
      t.style.transform = `translateX(${shift}px)`;
      if (!glide) {
        void t.offsetWidth;
        t.style.transition = "";
      }
    };
    place(prevWorking.current !== isWorking);
    prevWorking.current = isWorking;
    const ro = new ResizeObserver(() => place(false));
    if (workRef.current) ro.observe(workRef.current);
    if (doneRef.current) ro.observe(doneRef.current);
    return () => ro.disconnect();
  }, [isWorking, label, doneText, fontSize, showTimer]);

  useEffect(() => {
    if (isWorking) {
      setAnnounce(label);
      return;
    }
    setAnnounce(showTimer ? `${doneText} ${spoken(dsRef.current)}` : doneText);
    latest.current.onSettle?.(dsRef.current / 10);
  }, [isWorking]);

  const toggle = hasTrace && collapsible;

  const head = (
    <>
      {glyph !== "none" ? (
        <span
          ref={glyphRef}
          className="me-[0.2em] inline-flex h-[1.1em] w-[1.1em] flex-none [color:var(--tl-glyph)] [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          aria-hidden="true"
        >
          {glyph === "sparkle" ? (
            <Icon paths={SPARKLE_PATHS} strokeWidth={2} className="block h-full w-full" />
          ) : glyph === "dot" ? (
            <span className="m-auto h-[0.5em] w-[0.5em] rounded-full bg-current" />
          ) : (
            glyph
          )}
        </span>
      ) : null}
      <span ref={stackRef} className="inline-grid" aria-hidden="true">
        <span
          ref={workRef}
          className="w-max opacity-0 [grid-area:1/1] [filter:blur(var(--tl-blur))] [transition:opacity_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1),filter_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[active]:opacity-100 data-[active]:[filter:blur(0)] motion-reduce:[filter:none]! motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
          data-active={isWorking ? "" : undefined}
        >
          <span
            ref={breathRef}
            className="inline-block group-data-[working]:data-[shimmer]:bg-clip-text group-data-[working]:data-[shimmer]:text-transparent group-data-[working]:data-[shimmer]:[background-image:linear-gradient(260deg,color-mix(in_srgb,var(--tl-color)_50%,transparent)_30%,var(--tl-color)_50%,color-mix(in_srgb,var(--tl-color)_50%,transparent)_70%)] group-data-[working]:data-[shimmer]:[background-size:250%_100%] group-data-[working]:data-[shimmer]:[background-position:-125%_0] group-data-[working]:data-[shimmer]:[-webkit-text-fill-color:transparent] group-data-[working]:data-[shimmer]:[animation:thought-line-shimmer_var(--tl-shimmer)_linear_infinite]"
            data-shimmer={sheen ? "" : undefined}
          >
            {renderLabel ? renderLabel(label, true) : label}
          </span>
        </span>
        <span
          ref={doneRef}
          className="w-max opacity-0 [grid-area:1/1] [filter:blur(var(--tl-blur))] [transition:opacity_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1),filter_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[active]:[opacity:var(--tl-done)] data-[active]:[filter:blur(0)] motion-reduce:[filter:none]! motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
          data-active={isWorking ? undefined : ""}
        >
          {renderLabel ? renderLabel(doneText, false) : doneText}
        </span>
      </span>
      {showTimer ? (
        <span
          ref={timerRef}
          className="tabular-nums [opacity:var(--tl-timer)] [transition:opacity_var(--tl-settle)_ease,transform_var(--tl-settle)_cubic-bezier(0.77,0,0.175,1)] data-[done]:[opacity:var(--tl-done)] motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
          data-done={isWorking ? undefined : ""}
          aria-hidden="true"
        >
          {TIMER_ZERO}
        </span>
      ) : null}
      {collapsible ? (
        <span
          className="ms-[0.1em] inline-flex opacity-0 [transition:opacity_200ms_ease,transform_200ms_cubic-bezier(0.23,1,0.32,1)] data-[on]:opacity-55 group-data-[open]:rotate-180"
          data-on={hasTrace ? "" : undefined}
          aria-hidden="true"
        >
          <Icon paths={[CHEVRON_PATH]} strokeWidth={2.2} className="h-[1em] w-[1em]" />
        </span>
      ) : null}
      <span className="sr-only" role="status">
        {announce}
      </span>
    </>
  );

  return (
    <div
      className={`thought-line group inline-flex flex-col items-start leading-[1.6] font-medium [color:var(--tl-color)] [font-family:inherit] [font-size:var(--tl-font)]${className ? ` ${className}` : ""}`}
      data-working={isWorking ? "" : undefined}
      data-open={open && hasTrace ? "" : undefined}
      style={
        {
          "--tl-font": `${fontSize}px`,
          "--tl-color": color,
          "--tl-glyph": glyphColor || color,
          "--tl-settle": `${settleDuration}ms`,
          "--tl-blur": `${settleBlur}px`,
          "--tl-shimmer": `${shimmerDuration}s`,
          "--tl-timer": TIMER_OPACITY,
          "--tl-done": DONE_OPACITY,
          ...style,
        } as StyleVars
      }
    >
      {collapsible ? (
        <button
          type="button"
          className="relative m-0 inline-flex cursor-default items-center gap-[0.3em] border-0 bg-transparent p-0 text-start whitespace-nowrap text-inherit outline-none [font:inherit] data-[toggle]:cursor-pointer data-[toggle]:[-webkit-tap-highlight-color:transparent]"
          data-toggle={toggle ? "" : undefined}
          aria-expanded={toggle ? open : undefined}
          tabIndex={toggle ? 0 : -1}
          onClick={() => {
            if (toggle) setOpen((v) => !v);
          }}
        >
          {head}
        </button>
      ) : (
        <div className="relative m-0 inline-flex cursor-default items-center gap-[0.3em] border-0 bg-transparent p-0 text-start whitespace-nowrap text-inherit outline-none [font:inherit] data-[toggle]:cursor-pointer data-[toggle]:[-webkit-tap-highlight-color:transparent]">
          {head}
        </div>
      )}
      {hasTrace ? (
        <div
          className="grid w-0 min-w-full [grid-template-rows:0fr] [transition:grid-template-rows_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[open]:[grid-template-rows:1fr]"
          data-open={open ? "" : undefined}
          aria-hidden={!open}
        >
          <div className="min-h-0 overflow-x-visible overflow-y-clip">
            <div className="flex w-max flex-col gap-[0.45em] pt-[0.6em] pb-[0.2em] ps-[1.6em] text-[0.875em] font-normal whitespace-nowrap">
              {steps.map((text, i) => {
                const done = !isWorking || i < steps.length - 1;
                return (
                  <div
                    key={`${i}-${text}`}
                    className="group/step flex translate-y-0 items-center gap-[0.5em] opacity-100 [transition:opacity_200ms_cubic-bezier(0.23,1,0.32,1),transform_200ms_cubic-bezier(0.23,1,0.32,1)] starting:-translate-y-1 starting:opacity-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_200ms_ease]"
                    data-done={done ? "" : undefined}
                  >
                    <span
                      className="inline-grid h-[1em] w-[1em] flex-none place-items-center opacity-55"
                      aria-hidden="true"
                    >
                      {done ? (
                        <Icon
                          paths={[TICK_PATH]}
                          strokeWidth={2.5}
                          className="h-[1em] w-[1em]"
                        />
                      ) : (
                        <i className="block h-[0.4em] w-[0.4em] rounded-full bg-current [animation:thought-line-pulse_1.6s_cubic-bezier(0.77,0,0.175,1)_infinite] motion-reduce:[animation-duration:2.4s]" />
                      )}
                    </span>
                    <span className="[transition:opacity_var(--tl-settle)_ease] group-data-[done]/step:opacity-55">
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ThoughtLineBase;
