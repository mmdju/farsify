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
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from "react";

function pad2(value: number) {
  return toFaDigits((value + 1).toString().padStart(2, "0"));
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join(" ");
}

function clamp(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

const EASE = {
  smooth: "cubic-bezier(0.62, 0.02, 0.28, 1)",
  snappy: "cubic-bezier(0.8, 0, 0.15, 1)",
  gentle: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const SETTLE = "cubic-bezier(0.25, 0.8, 0.3, 1)";
const BOUNCE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const MARK_PATH =
  "M0 20.5V12C0 5.4 3.6 1.3 10.2 0l1.3 2.6C7.9 3.8 6 6.3 5.8 9.6H11v10.9H0zm15 0V12c0-6.6 3.6-10.7 10.2-12l1.3 2.6c-3.6 1.2-5.5 3.7-5.7 7H26v10.9H15z";

const STAR = (() => {
  const points: string[] = [];
  for (let step = 0; step < 10; step += 1) {
    const radius = step % 2 === 0 ? 6 : 2.76;
    const angle = -Math.PI / 2 + (step * Math.PI) / 5;
    points.push(
      `${(6 + Math.cos(angle) * radius).toFixed(2)},${(6.4 + Math.sin(angle) * radius).toFixed(2)}`,
    );
  }
  return points.join(" ");
})();

const PAPER_TONES: Array<[string, string]> = [
  ["#E9B23B", "#191C18"],
  ["#C8553D", "#FBF7EF"],
  ["#8DA46A", "#191C18"],
  ["#E7A9A1", "#191C18"],
  ["#F1E2C4", "#191C18"],
  ["#6E8C7A", "#FBF7EF"],
];

type Curve = keyof typeof EASE;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function useOnScreen(ref: RefObject<Element | null>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (rows) => {
        for (const row of rows) setSeen(row.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = () => {
      const next = element.getBoundingClientRect().width;
      setWidth((current) => (Math.abs(current - next) < 0.5 ? current : next));
    };
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function Face({
  src,
  name,
  size,
  round,
  fontSize,
}: {
  src: string;
  name: string;
  size: number;
  round: number | string;
  fontSize: number;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        flex: "none",
        width: size,
        height: size,
        borderRadius: round,
        overflow: "hidden",
        background: "rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 600,
      }}
    >
      <span>{initials(name)}</span>
      {src && !broken ? (
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => setBroken(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
          }}
        />
      ) : null}
    </div>
  );
}

export type PennantItem = {
  quote: string;
  name: string;
  role?: string;
  rating?: number;
  photoUrl?: string;
  color?: string;
  textColor?: string;
  link?: string;
};

export type PennantProps = {
  items: PennantItem[];
  startAt?: number;
  openOn?: "click" | "hover";
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  sizing?: "ratio" | "fill";
  ratio?: number;
  tabWidth?: number;
  gap?: number;
  inset?: number;
  hoverGrow?: number;
  radius?: number;
  padding?: number;
  showMark?: boolean;
  showCount?: boolean;
  showStars?: boolean;
  showRule?: boolean;
  tabAvatar?: boolean;
  photoSize?: number;
  photoRadius?: number;
  duration?: number;
  curve?: Curve;
  drift?: number;
  height?: number;
  background?: string;
  ariaLabel?: string;
  className?: string;
};

export function Pennant({
  items,
  startAt = 1,
  openOn = "click",
  autoplay = false,
  interval = 5,
  pauseOnHover = true,
  sizing = "ratio",
  ratio = 0.62,
  tabWidth = 48,
  gap = 4,
  inset = 40,
  hoverGrow = 6,
  radius = 14,
  padding = 22,
  showMark = true,
  showCount = true,
  showStars = true,
  showRule = true,
  tabAvatar = true,
  photoSize = 52,
  photoRadius = 12,
  duration = 0.46,
  curve = "smooth",
  drift = 22,
  height = 440,
  background = "transparent",
  ariaLabel = "نظر مشتریان",
  className,
}: PennantProps) {
  const list = items ?? [];
  const count = list.length;
  const last = Math.max(0, count - 1);
  const uid = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const width = useWidth(shellRef);
  const seen = useOnScreen(shellRef);
  const reduced = useReducedMotion();
  const [state, setState] = useState(() => ({
    on: clamp(Math.round(startAt) - 1, 0, last),
    was: clamp(Math.round(startAt) - 1, 0, last),
    end: false,
  }));
  const [hot, setHot] = useState(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const on = Math.min(state.on, last);
  const was = Math.min(state.was, last);
  const end = state.end;
  const dur = reduced ? 0 : Math.max(0.05, duration);
  const driftPx = reduced ? 0 : Math.max(0, drift);
  const easing = EASE[curve] ?? EASE.smooth;

  const open = useCallback((index: number) => {
    setState((current) =>
      current.on === index ? current : { on: index, was: current.on, end: index > current.on },
    );
  }, []);

  useEffect(() => {
    if (!count) return;
    open(clamp(Math.round(startAt) - 1, 0, last));
  }, [startAt, count, last, open]);

  const paused = pauseOnHover && hot !== -1;
  const permit = autoplay && seen && !reduced && !paused && count > 1;

  useEffect(() => {
    if (!permit) return;
    const wait = Math.max(1, interval) * 1000;
    const timer = window.setTimeout(() => open((on + 1) % count), wait);
    return () => window.clearTimeout(timer);
  }, [permit, on, count, interval, open]);

  const narrow = width > 0 && width < 520;
  const rowH =
    sizing === "fill" || narrow
      ? height
      : Math.min(height, Math.max(0, width * ratio));
  const fitTab =
    width > 0 && count > 1
      ? (width - Math.min(320, width * 0.62) - (count - 1) * gap) / count
      : tabWidth;
  const tab = Math.max(24, Math.min(tabWidth, fitTab));
  const openW = Math.max(tab, width - (count - 1) * (tab + gap));
  const edge = Math.min(inset, Math.max(0, rowH * 0.3));
  const restH = Math.max(0, rowH - edge * 2);
  const hotH = Math.max(restH, rowH - Math.max(0, edge - hoverGrow) * 2);
  const dot = Math.max(14, Math.min(tab - 8, 34));
  const showTabFace = tabAvatar && tab >= 28;

  const sweep = `${dur}s ${easing}`;
  const settle = `${reduced ? 0 : 0.32}s ${SETTLE}`;
  const enter = (delay: number, move: number) =>
    `opacity ${dur * move}s ease-out ${dur * delay}s, transform ${dur * move}s ease-out ${dur * delay}s`;
  const leave = (delay: number, move: number) =>
    `opacity ${dur * move}s ease ${dur * delay}s, transform ${dur * move}s ease ${dur * delay}s`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!count) return;
    let next = on;
    if (event.key === "ArrowLeft") next = (on + 1) % count;
    else if (event.key === "ArrowRight") next = (on - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    open(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      ref={shellRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`.pennant-tab:focus-visible{outline:2px solid var(--ring);outline-offset:3px}`}</style>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHot(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap,
          width: width || "100%",
          height: rowH,
        }}
      >
        {list.map((item, index) => {
          const active = index === on;
          const paper = PAPER_TONES[index % PAPER_TONES.length];
          const ink = item.textColor || paper[1];
          const fill = item.color || paper[0];
          const faces = Math.round(clamp(item.rating ?? 5, 0, 5));
          const src = item.photoUrl || "";
          const moving = index === on || index === was;
          const pinned: CSSProperties = end
            ? { insetInlineEnd: active ? 0 : driftPx }
            : { insetInlineStart: active ? 0 : driftPx };
          return (
            <div
              key={index}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${uid}-tab-${index}`}
              role="tab"
              className="pennant-tab"
              aria-selected={active}
              aria-controls={`${uid}-panel-${index}`}
              aria-label={item.name}
              tabIndex={active ? 0 : -1}
              onMouseEnter={() => {
                setHot(index);
                if (openOn === "hover") open(index);
              }}
              onClick={() => {
                if (!active) {
                  open(index);
                  return;
                }
                if (item.link && typeof window !== "undefined") {
                  window.location.assign(item.link);
                }
              }}
              style={{
                position: "relative",
                flex: "none",
                overflow: "hidden",
                background: fill,
                color: ink,
                width: active ? openW : tab,
                height: active ? rowH : hot === index ? hotH : restH,
                borderRadius: active ? radius : tab / 2,
                cursor: active ? (item.link ? "pointer" : "default") : "pointer",
                transition: ready
                  ? `width ${sweep}, border-radius ${sweep}, height ${moving ? sweep : settle}`
                  : "none",
                WebkitTapHighlightColor: "transparent",
                isolation: "isolate",
              }}
            >
              <div
                id={`${uid}-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${index}`}
                aria-hidden={!active}
                style={{
                  position: "absolute",
                  top: 0,
                  width: openW,
                  height: rowH,
                  ...pinned,
                  padding,
                  display: "flex",
                  flexDirection: "column",
                  pointerEvents: active ? "auto" : "none",
                  transition: `inset-inline-start ${active ? 0 : dur}s ${easing}, inset-inline-end ${active ? 0 : dur}s ${easing}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 auto",
                    minHeight: 0,
                    opacity: active ? 1 : 0,
                    transform: active ? "none" : "translateY(8px)",
                    transition: active ? enter(0.18, 0.5) : leave(0.5, 0.3),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    {showMark ? (
                      <svg
                        aria-hidden
                        width={30}
                        height={24}
                        viewBox="0 0 26 21"
                        style={{ display: "block", flex: "none" }}
                      >
                        <path d={MARK_PATH} fill={ink} />
                      </svg>
                    ) : (
                      <span />
                    )}
                    {showCount ? (
                      <span
                        style={{
                          opacity: 0.6,
                          fontSize: narrow ? 12 : 12.5,
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {pad2(index)} / {pad2(count)}
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      flex: "1 1 auto",
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      marginTop: showMark ? 18 : 6,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        width: "100%",
                        minHeight: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 6,
                        fontSize: narrow ? 20 : 25,
                        fontWeight: 500,
                        lineHeight: 1.55,
                      }}
                    >
                      {item.quote}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    flex: "none",
                    marginTop: 14,
                    paddingTop: showRule ? 16 : 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: active ? 1 : 0,
                    transition: active
                      ? `opacity ${dur * 0.5}s ease ${dur * 0.4}s`
                      : `opacity ${dur * 0.28}s ease`,
                  }}
                >
                  {showRule ? (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 0,
                        insetInlineStart: 0,
                        width: active ? "100%" : "0%",
                        height: 1,
                        background: ink,
                        opacity: 0.25,
                        transition: active
                          ? `width ${dur * 1.1}s cubic-bezier(0.22,1,0.36,1) ${dur * 0.45}s`
                          : "none",
                      }}
                    />
                  ) : null}
                  <Face
                    src={src}
                    name={item.name}
                    size={photoSize}
                    round={photoRadius}
                    fontSize={Math.round(photoSize * 0.32)}
                  />
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>
                      {item.name}
                    </div>
                    {item.role ? (
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          lineHeight: 1.5,
                          opacity: 0.65,
                          marginTop: 2,
                        }}
                      >
                        {item.role}
                      </div>
                    ) : null}
                  </div>
                  {showStars && faces > 0 ? (
                    <div
                      aria-hidden
                      style={{ display: "flex", gap: 2, flex: "none" }}
                    >
                      {Array.from({ length: 5 }).map((_, star) => (
                        <svg
                          key={star}
                          width={13}
                          height={13}
                          viewBox="0 0 12 12"
                          style={{
                            display: "block",
                            transform: active ? "scale(1)" : "scale(0.4)",
                            opacity: active ? 1 : 0,
                            transition: active
                              ? `transform ${dur * 0.5}s ${BOUNCE} ${dur * 0.55 + star * 0.05}s, opacity ${dur * 0.4}s ease ${dur * 0.55 + star * 0.05}s`
                              : "transform 0.15s ease, opacity 0.15s ease",
                          }}
                        >
                          <polygon
                            points={STAR}
                            fill={ink}
                            opacity={star < faces ? 1 : 0.22}
                          />
                        </svg>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingBottom: showTabFace ? dot + 8 : 0,
                  pointerEvents: "none",
                  opacity: active ? 0 : 1,
                  transition: active
                    ? `opacity ${dur * 0.55}s ease`
                    : `opacity ${dur * 0.5}s ease ${dur * 0.2}s`,
                }}
              >
                <span
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1,
                    color: ink,
                  }}
                >
                  {item.name}
                </span>
                {showTabFace ? (
                  <div
                    style={{
                      position: "absolute",
                      insetInlineStart: (tab - dot) / 2,
                      bottom: (tab - dot) / 2,
                      transform: `scale(${hot === index && !active ? 1.08 : 1})`,
                      transition: `transform ${settle}`,
                    }}
                  >
                    <Face
                      src={src}
                      name={item.name}
                      size={dot}
                      round="50%"
                      fontSize={Math.round(dot * 0.36)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Pennant;
