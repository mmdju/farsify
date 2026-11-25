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
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

function padIndex(value: number) {
  return toFaDigits((value + 1).toString().padStart(2, "0"));
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

const SEEK_STIFFNESS = 96;
const SEEK_DAMPING = 2 * Math.sqrt(SEEK_STIFFNESS) * 0.94;
const MORPH = 0.6;
const WHEEL_PER_CARD = 120;

const TONES = [
  ["#2a2a2c", "#202022", "#3d3d40"],
  ["#2e2c28", "#232120", "#403c36"],
  ["#282c2a", "#1e2221", "#38403d"],
  ["#2c2a2e", "#211f23", "#3e3944"],
  ["#2a2b2f", "#1e1f23", "#3a3c44"],
  ["#2f2b28", "#242120", "#443d36"],
];

export type TimelineItem = {
  year: string;
  title: string;
  caption?: string;
  imageUrl?: string;
  href?: string;
};

export type TimelineTrackProps = {
  items: TimelineItem[];
  height?: number;
  openWidth?: number;
  shutWidth?: number;
  spacing?: number;
  radius?: number;
  dim?: number;
  rulerStep?: number;
  showRuler?: boolean;
  background?: string;
  textColor?: string;
  captionColor?: string;
  tickColor?: string;
  labelColor?: string;
  markerColor?: string;
  autoplay?: boolean;
  interval?: number;
  ariaLabel?: string;
  className?: string;
};

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduce;
}

function measureRow(
  count: number,
  focus: number,
  open: number,
  shut: number,
  gap: number,
) {
  const widths: number[] = [];
  const starts: number[] = [];
  let run = 0;
  for (let i = 0; i < count; i += 1) {
    const nearness = 1 - Math.min(1, Math.abs(i - focus));
    widths[i] = shut + (open - shut) * smooth(nearness);
    starts[i] = run;
    run += widths[i] + gap;
  }
  const low = Math.max(0, Math.min(count - 1, Math.floor(focus)));
  const high = Math.min(count - 1, low + 1);
  const frac = focus - low;
  const midLow = starts[low] + widths[low] / 2;
  const midHigh = starts[high] + widths[high] / 2;
  return { widths, starts, middle: midLow + (midHigh - midLow) * frac };
}

export function TimelineTrack({
  items,
  height = 430,
  openWidth = 380,
  shutWidth = 72,
  spacing = 12,
  radius = 14,
  dim = 0.55,
  rulerStep = 96,
  showRuler = true,
  background = "#181818",
  textColor = "#fafafa",
  captionColor = "#d4d4d4",
  tickColor = "#525252",
  labelColor = "#a3a3a3",
  markerColor = "#fafafa",
  autoplay = false,
  interval = 5,
  ariaLabel = "خط زمانی رویدادها",
  className,
}: TimelineTrackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [direction, setDirection] = useState(1);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [wake, setWake] = useState(0);
  const target = useRef(0);
  const wheelTimer = useRef<number | null>(null);
  const hovered = useRef(false);
  const reduce = useReducedMotion();
  const engine = useRef({ shown: 0, speed: 0 });
  const dragged = useRef(false);
  const latest = useRef({ active: 0, count: items.length, direction: 1 });
  latest.current = { active, count: items.length, direction };

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => {
      setWidth(el.clientWidth);
      setDirection(window.getComputedStyle(el).direction === "rtl" ? -1 : 1);
    };
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const last = Math.max(0, items.length - 1);

  const seek = useCallback((value: number) => {
    const capped = Math.min(
      Math.max(0, value),
      Math.max(0, latest.current.count - 1),
    );
    target.current = capped;
    setActive(Math.round(capped));
    setWake((tick) => tick + 1);
  }, []);

  useEffect(() => {
    seek(Math.min(target.current, Math.max(0, items.length - 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const state = engine.current;
    if (reduce) {
      state.shown = target.current;
      state.speed = 0;
      setShown(state.shown);
      return;
    }
    let frame = 0;
    let stamp = 0;
    const tick = (now: number) => {
      const dt = stamp ? Math.min(0.05, (now - stamp) / 1000) : 1 / 60;
      stamp = now;
      let left = dt;
      while (left > 0) {
        const slice = Math.min(left, 1 / 240);
        state.speed +=
          ((target.current - state.shown) * SEEK_STIFFNESS -
            state.speed * SEEK_DAMPING) *
          slice;
        state.shown += state.speed * slice;
        left -= slice;
      }
      if (
        Math.abs(target.current - state.shown) < 0.0006 &&
        Math.abs(state.speed) < 0.003
      ) {
        state.shown = target.current;
        state.speed = 0;
        setShown(state.shown);
        return;
      }
      setShown(state.shown);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [wake, reduce]);

  useEffect(() => {
    if (!autoplay || reduce || items.length < 2) return undefined;
    const id = window.setInterval(() => {
      if (hovered.current) return;
      seek((Math.round(target.current) + 1) % items.length);
    }, Math.max(1.5, interval) * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, interval, reduce, items.length, seek]);

  const size = useMemo(() => {
    const space = width || 900;
    const phone = space < 640;
    const tablet = space < 1024;
    const edge = phone ? 16 : tablet ? 24 : 32;
    const shut = phone
      ? Math.min(shutWidth, Math.max(26, space * 0.085))
      : tablet
        ? Math.min(shutWidth, 60)
        : shutWidth;
    const gap = phone
      ? Math.min(spacing, 6)
      : tablet
        ? Math.min(spacing, 10)
        : spacing;
    const sides = phone ? shut * 1.1 + gap * 2 : shut * 2.2 + gap * 3;
    const open = Math.max(150, Math.min(openWidth, space - edge * 2 - sides));
    const tall = phone ? Math.min(open * 1.4, height) : height;
    return {
      open,
      shut,
      gap,
      edge,
      height: Math.max(200, tall),
      step: Math.max(48, rulerStep * (phone ? 0.72 : tablet ? 0.86 : 1)),
      scale: Math.min(1, Math.max(0.74, open / Math.max(1, openWidth))),
    };
  }, [width, openWidth, shutWidth, spacing, height, rulerStep]);

  const row = useMemo(
    () => measureRow(items.length, shown, size.open, size.shut, size.gap),
    [items.length, shown, size],
  );

  const morph = Math.sin(Math.PI * (shown - Math.floor(shown))) * MORPH;

  const go = useCallback(
    (step: number) => seek(Math.round(target.current) + step),
    [seek],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (event.deltaY === 0) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = Math.max(0, latest.current.count - 1);
      const at = target.current;
      const edge = at <= 0.001 || at >= max - 0.001;
      if (edge && Math.sign(event.deltaY) * (at <= 0.001 ? -1 : 1) > 0) return;
      event.preventDefault();
      const delta = Math.max(-WHEEL_PER_CARD, Math.min(WHEEL_PER_CARD, event.deltaY));
      seek(at + delta / WHEEL_PER_CARD);
      if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        seek(Math.round(target.current));
      }, 150);
    };

    let startX = 0;
    let startY = 0;
    let startTarget = 0;
    let lastX = 0;
    let lastStamp = 0;
    let velocity = 0;
    let down = false;
    let sliding = false;
    let dragScale = 1;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      down = true;
      sliding = false;
      dragged.current = false;
      startX = event.clientX;
      startY = event.clientY;
      startTarget = target.current;
      lastX = event.clientX;
      lastStamp = event.timeStamp;
      velocity = 0;
      const rect = el.getBoundingClientRect();
      dragScale = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1;
    };

    const onMove = (event: PointerEvent) => {
      if (!down) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!sliding && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        sliding = true;
        dragged.current = true;
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          void 0;
        }
      }
      if (!sliding) return;
      const perPx = 1 / Math.max(120, size.open * 0.7);
      const localDx = dragScale > 0 ? dx / dragScale : dx;
      const next = startTarget - latest.current.direction * localDx * perPx;
      const dt = Math.max(8, event.timeStamp - lastStamp);
      const localStep =
        dragScale > 0 ? (event.clientX - lastX) / dragScale : event.clientX - lastX;
      velocity = localStep * perPx * latest.current.direction * (1000 / dt);
      lastX = event.clientX;
      lastStamp = event.timeStamp;
      seek(next);
    };

    const onUp = () => {
      if (!down) return;
      down = false;
      if (sliding) {
        const projected = target.current - velocity * 0.16;
        seek(Math.round(projected));
        window.setTimeout(() => {
          if (!down) dragged.current = false;
        }, 60);
      }
      sliding = false;
      velocity = 0;
    };

    const onEnter = () => {
      hovered.current = true;
    };
    const onLeave = () => {
      hovered.current = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
    };
  }, [seek, size.open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(direction < 0 ? 1 : -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(direction < 0 ? -1 : 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      seek(0);
    } else if (event.key === "End") {
      event.preventDefault();
      seek(items.length - 1);
    }
  };

  const band = size.edge;
  const frameHeight = size.height + band * 2 + (showRuler ? 46 : 0);
  const ticks: ReactNode[] = [];

  if (showRuler) {
    const from = Math.floor(shown) - 6;
    const to = Math.ceil(shown) + 6;
    for (let i = from; i <= to; i += 1) {
      const label = i >= 0 && i < items.length;
      const near = label && Math.abs(i - shown) < 0.5;
      for (let j = 0; j < 4; j += 1) {
        const at = i + j / 4;
        const major = j === 0;
        ticks.push(
          <div
            key={`tick-${i}-${j}`}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 1,
              height: major ? 12 : 5,
              marginLeft: direction * (at - shown) * size.step,
              background: major && near ? markerColor : tickColor,
            }}
          />,
        );
      }
      if (label) {
        ticks.push(
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: "50%",
              top: 22,
              width: 80,
              marginLeft: direction * (i - shown) * size.step - 40,
              textAlign: "center",
              whiteSpace: "nowrap",
              fontSize: 11,
              lineHeight: 1.5,
              fontVariantNumeric: "tabular-nums",
              color: near ? markerColor : labelColor,
            }}
          >
            {items[i].year}
          </div>,
        );
      }
    }
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="گالری"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full select-none flex-col justify-center overflow-hidden rounded-2xl border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={{ height: frameHeight, background, paddingBlock: band }}
    >
      <span className="sr-only" aria-live="polite">
        {items[active]?.title ?? ""}
      </span>

      <div
        className="relative w-full shrink-0"
        style={{ height: size.height }}
      >
        {items.map((item, index) => {
          const far = Math.min(1, Math.abs(index - shown));
          const cardWidth = row.widths[index] ?? size.open;
          const start = row.starts[index] ?? 0;
          const centre = start + cardWidth / 2 - row.middle;
          const cut = Math.max(0, (size.open - cardWidth) / 2);
          const lift =
            morph * size.height * 0.08 * (0.6 + 0.4 * (1 - far));
          const round = radius + morph * Math.min(size.open, 200) * 0.22;
          const reveal = clamp01(1 - far * 1.8);
          const tone = TONES[index % TONES.length];
          const noteWidth = Math.max(80, size.open - 40);

          const body = (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: round,
                overflow: "hidden",
                background: tone[0],
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0 }}
                >
                  <div
                    style={{
                      position: "absolute",
                      insetInlineStart: "22%",
                      top: "16%",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: tone[2],
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      insetInline: "-35%",
                      bottom: "-30%",
                      height: "62%",
                      borderRadius: "50%",
                      background: tone[1],
                    }}
                  />
                </div>
              )}

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                  opacity: 1 - far,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background,
                  opacity: far * dim,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  insetInlineStart: 20,
                  bottom: 18,
                  width: noteWidth,
                  transform: `translate3d(0, ${(1 - reveal) * 16}px, 0)`,
                }}
              >
                <div
                  style={{
                    color: textColor,
                    fontSize: 34 * size.scale,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    fontVariantNumeric: "tabular-nums",
                    opacity: clamp01(reveal * 1.6),
                  }}
                >
                  {item.year}
                </div>
                <div
                  style={{
                    color: textColor,
                    fontSize: 16 * size.scale,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    marginTop: 6,
                    opacity: clamp01(reveal * 1.6 - 0.3),
                    transform: `translate3d(0, ${(1 - reveal) * 8}px, 0)`,
                  }}
                >
                  {item.title}
                </div>
                {item.caption && (
                  <div
                    style={{
                      color: captionColor,
                      fontSize: 13 * size.scale,
                      lineHeight: 1.75,
                      marginTop: 4,
                      opacity: clamp01(reveal * 1.6 - 0.6),
                      transform: `translate3d(0, ${(1 - reveal) * 6}px, 0)`,
                    }}
                  >
                    {item.caption}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <div
              key={`${item.year}-${index}`}
              role="group"
              aria-label={`${padIndex(index)} از ${padIndex(items.length - 1)}: ${item.title}`}
              aria-current={index === active ? "true" : undefined}
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: size.open,
                height: size.height,
                marginLeft: -size.open / 2,
                cursor: "pointer",
                transform: `translate3d(${direction * centre}px, 0, 0)`,
                clipPath: `inset(${lift}px ${cut}px round ${round}px)`,
                willChange: "transform, clip-path",
              }}
              onClick={(event) => {
                if (dragged.current) return;
                if (index !== active) {
                  event.preventDefault();
                  seek(index);
                }
              }}
            >
              {item.href && index === active ? (
                <a
                  href={item.href}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "block",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  {body}
                </a>
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>

      {showRuler && (
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{ height: 46 }}
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              insetInline: 0,
              top: 0,
              height: 1,
              background: tickColor,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 1,
              height: 18,
              background: markerColor,
              zIndex: 2,
            }}
          />
          {ticks}
        </div>
      )}
    </div>
  );
}

export default TimelineTrack;
