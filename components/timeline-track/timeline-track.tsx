"use client";
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
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toFaDigits(input: string | number) {
  return String(input).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
}

function padIndex(value: number) {
  return toFaDigits((value + 1).toString().padStart(2, "0"));
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

const STIFFNESS = 198;
const DAMPING = 2 * Math.sqrt(STIFFNESS);
const MORPH = 0.6;

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
  ariaLabel = "خط زمانی رویدادها",
  className,
}: TimelineTrackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [direction, setDirection] = useState(1);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
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

  useEffect(() => {
    setActive((value) =>
      Math.min(Math.max(0, value), Math.max(0, items.length - 1)),
    );
  }, [items.length]);

  useEffect(() => {
    const state = engine.current;
    if (reduce) {
      state.shown = active;
      state.speed = 0;
      setShown(active);
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
          ((active - state.shown) * STIFFNESS - state.speed * DAMPING) * slice;
        state.shown += state.speed * slice;
        left -= slice;
      }
      if (
        Math.abs(active - state.shown) < 0.0008 &&
        Math.abs(state.speed) < 0.004
      ) {
        state.shown = active;
        state.speed = 0;
        setShown(active);
        return;
      }
      setShown(state.shown);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduce]);

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

  const go = useCallback((step: number) => {
    setActive((value) =>
      Math.min(latest.current.count - 1, Math.max(0, value + step)),
    );
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let accum = 0;
    let lock = 0;
    let last = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (event.deltaY === 0) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const { active: current, count } = latest.current;
      const target = current + (event.deltaY > 0 ? 1 : -1);
      if (target < 0 || target > count - 1) return;
      event.preventDefault();
      const now = performance.now();
      if (now - last > 220) accum = 0;
      last = now;
      accum += event.deltaY;
      if (now < lock || Math.abs(accum) < 22) return;
      accum = 0;
      lock = now + 240;
      go(event.deltaY > 0 ? 1 : -1);
    };

    let startX = 0;
    let startY = 0;
    let down = false;
    let sliding = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      down = true;
      sliding = false;
      dragged.current = false;
      startX = event.clientX;
      startY = event.clientY;
    };

    const onMove = (event: PointerEvent) => {
      if (!down) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!sliding && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        sliding = true;
        dragged.current = true;
      }
    };

    const onUp = (event: PointerEvent) => {
      if (!down) return;
      down = false;
      const dx = event.clientX - startX;
      if (sliding && Math.abs(dx) > 42)
        go(dx * latest.current.direction < 0 ? 1 : -1);
      sliding = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [go]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(direction < 0 ? 1 : -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(direction < 0 ? -1 : 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(items.length - 1);
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
                    top: 0,
                    left: "50%",
                    width: size.open * 1.14,
                    height: "100%",
                    marginLeft: -size.open * 0.57,
                    objectFit: "cover",
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
                  setActive(index);
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
