"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PIN_COLORS = ["#E2483D", "#3F7BE0", "#F2C230"];
const NOTE_COLORS = [
  "#FFE98A",
  "#FFB9D2",
  "#BEE3FF",
  "#BFF0D9",
  "#FFC2B0",
  "#D9CCFF",
];
const INK = "#1D1B16";
const INK_SOFT = "#4A453C";
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.15 -0.55'/></filter><rect width='100%' height='100%' filter='url(#t)'/></svg>",
)}")`;

const PAPER_FILL: CSSProperties = {
  backgroundImage: `linear-gradient(172deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 32%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.06) 100%), radial-gradient(130% 90% at 100% 100%, rgba(0,0,0,0.09) 0%, rgba(0,0,0,0) 40%), ${GRAIN}`,
  backgroundSize: "100% 100%, 100% 100%, 150px 150px",
};

const TAPE_EDGE =
  "polygon(3% 0, 97% 0, 100% 20%, 97% 40%, 100% 60%, 97% 80%, 100% 100%, 3% 100%, 0 80%, 3% 60%, 0 40%, 3% 20%)";

export type PinfoldNote = {
  quote: string;
  name: string;
  role?: string;
  imageUrl?: string;
  href?: string;
  color?: string;
  shape?: "square" | "tall" | "wide";
};

export type PinfoldProps = {
  notes: PinfoldNote[];
  title?: string;
  subtitle?: string;
  showHeading?: boolean;
  boardColor?: string;
  texture?: boolean;
  columns?: number;
  noteSize?: number;
  scatter?: number;
  tilt?: number;
  seed?: number;
  pin?: "pin" | "tack" | "tape" | "none";
  showTools?: boolean;
  breeze?: boolean;
  height?: number;
  ariaLabel?: string;
  className?: string;
};

function clamp(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

function grain(seed: number, index: number, key: number) {
  let value = (seed * 374761393 + index * 668265263 + key * 1442695041) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  value ^= value >>> 16;
  value = Math.imul(value ^ (value >>> 7), 2246822519);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967295;
}

function scatterSpots(
  count: number,
  columns: number,
  scatter: number,
  tilt: number,
  seed: number,
) {
  const cols = Math.max(1, Math.min(columns, count || 1));
  const rows = Math.max(1, Math.ceil(count / cols));
  const loose = clamp(scatter, 0, 100) / 100;
  const spots: { left: number; top: number; turn: number }[] = [];
  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / cols);
    const inRow = Math.min(cols, count - row * cols);
    const slot = (index % cols) + (cols - inRow) / 2;
    const jitterX = (grain(seed, index, 1) * 2 - 1) * 0.18 * loose;
    const jitterY = (grain(seed, index, 2) * 2 - 1) * 0.16 * loose;
    const turn = (grain(seed, index, 3) * 2 - 1) * tilt;
    spots.push({
      left: ((slot + 0.5 + jitterX) / cols) * 100,
      top: ((row + 0.5 + jitterY) / rows) * 100,
      turn,
    });
  }
  return spots;
}

function noteFrame(shape: string | undefined, size: number) {
  if (shape === "tall") return { width: size * 0.84, height: size * 1.16 };
  if (shape === "wide") return { width: size * 1.24, height: size * 0.9 };
  return { width: size, height: size };
}

function pinAnchor(kind: string, size: number) {
  return kind === "tack" ? size * 0.62 : size * 0.78;
}

function initialsOf(name: string) {
  return (
    String(name ?? "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("") || "•"
  );
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function dot(cx: number, cy: number, size: number): CSSProperties {
  return {
    position: "absolute",
    left: cx - size / 2,
    top: cy - size / 2,
    width: size,
    height: size,
    borderRadius: "50%",
  };
}

function Pin({ kind, color, size }: { kind: string; color: string; size: number }) {
  if (kind === "tack")
    return (
      <>
        <span
          style={{
            ...dot(size * 0.16, size * 0.2, size * 1.02),
            transform: "scaleY(0.82)",
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0) 100%)",
          }}
        />
        <span
          style={{
            ...dot(-size * 0.05, -size * 0.1, size * 0.88),
            background:
              "radial-gradient(circle at 36% 30%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0) 32%), conic-gradient(from 210deg, #F7E7AE, #B5852D, #F9EDC1, #8F6519, #E8CE7E, #F7E7AE)",
            boxShadow:
              "inset 0 0 0 1px rgba(110,78,20,0.45), inset 0 -1px 1px rgba(0,0,0,0.25), 0 1px 1px rgba(0,0,0,0.3)",
          }}
        />
        <span
          style={{
            ...dot(-size * 0.05, -size * 0.1, size * 0.22),
            background:
              "radial-gradient(circle at 40% 35%, #FFF6D6 0, #C79A3D 60%, #8F6519 100%)",
            boxShadow: "0 0 0 1px rgba(110,78,20,0.35)",
          }}
        />
      </>
    );
  return (
    <>
      <span
        style={{
          ...dot(size * 0.38, size * 0.36, size * 1.3),
          transform: "scaleY(0.7) rotate(24deg)",
          background:
            "radial-gradient(closest-side, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.18) 44%, rgba(0,0,0,0) 100%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: -size * 0.1,
          top: -size * 0.22 - 1,
          width: Math.hypot(size * 0.1, size * 0.22),
          height: 2,
          transformOrigin: "0 50%",
          transform: `rotate(${(Math.atan2(-size * 0.22, -size * 0.1) * 180) / Math.PI}deg)`,
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #B5B9C0 50%, #6A6E75 100%)",
          borderRadius: 1,
        }}
      />
      <span
        style={{
          ...dot(-size * 0.1, -size * 0.22, size),
          background: `radial-gradient(circle at 36% 30%, rgba(255,255,255,0.42) 0, rgba(255,255,255,0) 48%), radial-gradient(circle at 66% 74%, rgba(0,0,0,0.45) 0, rgba(0,0,0,0) 70%), ${color}`,
          boxShadow:
            "inset 0 -1px 1.5px rgba(0,0,0,0.3), 0 1px 1.5px rgba(0,0,0,0.35)",
        }}
      />
      <span
        style={{
          ...dot(-size * 0.16, -size * 0.36, size * 0.64),
          background: `linear-gradient(125deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0.38) 100%), ${color}`,
          boxShadow: "0 1.5px 1.5px rgba(0,0,0,0.32)",
        }}
      />
      <span
        style={{
          ...dot(-size * 0.2, -size * 0.46, size * 0.58),
          background: `radial-gradient(circle at 38% 34%, rgba(255,255,255,0.62) 0, rgba(255,255,255,0.14) 42%, rgba(0,0,0,0.12) 100%), ${color}`,
          boxShadow:
            "inset 0 -1px 1px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.55)",
        }}
      />
      <span
        style={{
          ...dot(-size * 0.24, -size * 0.5, size * 0.2),
          transform: "scaleX(1.4) rotate(-32deg)",
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.9) 0, rgba(255,255,255,0) 100%)",
        }}
      />
    </>
  );
}

export function Pinfold({
  notes,
  title = "دیوار چیزهای قشنگ",
  subtitle = "هر یادداشت را بکش؛ هرجا رها کردی همان‌جا می‌ماند.",
  showHeading = true,
  boardColor = "#1c1c1e",
  texture = true,
  columns = 3,
  noteSize = 210,
  scatter = 32,
  tilt = 6,
  seed = 4,
  pin = "pin",
  showTools = true,
  breeze = true,
  height = 640,
  ariaLabel = "دیوار یادداشت‌ها",
  className,
}: PinfoldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const width = useWidth(rootRef);
  const reduce = useReducedMotion();
  const [shake, setShake] = useState(0);
  const [neat, setNeat] = useState(false);
  const [order, setOrder] = useState<Record<number, number>>({});
  const [offsets, setOffsets] = useState<Record<number, { x: number; y: number }>>(
    {},
  );
  const [drag, setDrag] = useState<{
    index: number;
    x: number;
    y: number;
    angle: number;
  } | null>(null);
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const peak = useRef(notes.length + 1);
  const frame = useRef(0);
  const motion = useRef({
    down: false,
    index: 0,
    startX: 0,
    startY: 0,
    pointerX: 0,
    pointerY: 0,
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    lastX: 0,
    lastTime: 0,
    stamp: 0,
    swing: 0,
    rate: 0,
  });

  const count = notes.length;
  const inset = 24;
  const narrow = width > 0 && width < 520;
  const headroom = showHeading ? (narrow ? 84 : 112) : 0;
  const pinSize = narrow ? 22 : 26;
  const padTop =
    pin === "pin" || pin === "tack"
      ? Math.max(16, pinAnchor(pin, pinSize) + pinSize * 0.45)
      : pin === "tape"
        ? 22
        : 16;
  const columnCount = narrow ? Math.min(columns, 2) : columns;
  const rows = Math.max(1, Math.ceil(count / columnCount));
  const usableWidth = Math.max(0, width - inset * 2);
  const columnWidth = usableWidth / Math.max(1, columnCount);
  const size =
    width > 0
      ? narrow
        ? Math.min(noteSize, columnWidth - 10)
        : Math.min(
            noteSize,
            columnWidth / 1.24,
            (height - inset * 2 - headroom) / Math.max(1, rows) / 1.16,
          ) * 0.94
      : noteSize;
  const boardHeight = narrow
    ? Math.max(height, inset * 2 + headroom + rows * (size * 1.16 + 10))
    : height;

  const spots = useMemo(
    () =>
      scatterSpots(
        count,
        columnCount,
        neat ? 0 : scatter,
        neat ? 0 : tilt,
        seed + shake * 97,
      ),
    [count, columnCount, neat, scatter, tilt, seed, shake],
  );

  const raise = useCallback((index: number) => {
    peak.current += 1;
    setOrder((prev) => ({ ...prev, [index]: peak.current }));
  }, []);

  const limits = (
    element: HTMLElement,
    offset: { x: number; y: number },
  ) => {
    const area = areaRef.current?.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    if (!area) return { minX: -4000, maxX: 4000, minY: -4000, maxY: 4000 };
    const baseLeft = box.left - offset.x;
    const baseTop = box.top - offset.y;
    return {
      minX: area.left - baseLeft,
      maxX: area.right - box.width - baseLeft,
      minY: area.top - baseTop,
      maxY: area.bottom - box.height - baseTop,
    };
  };

  const commit = useCallback(() => {
    const state = motion.current;
    const x = Math.round(state.x * 100) / 100;
    const y = Math.round(state.y * 100) / 100;
    state.swing = 0;
    state.rate = 0;
    state.stamp = 0;
    setOffsets((prev) => ({ ...prev, [state.index]: { x, y } }));
    setDrag(null);
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);

  const tick = useCallback(
    (now: number) => {
      const state = motion.current;
      const dt = state.stamp
        ? Math.min(0.04, (now - state.stamp) / 1000)
        : 1 / 60;
      state.stamp = now;
      if (state.down) {
        state.x = clamp(
          state.baseX + state.pointerX - state.startX,
          state.minX,
          state.maxX,
        );
        state.y = clamp(
          state.baseY + state.pointerY - state.startY,
          state.minY,
          state.maxY,
        );
      } else {
        state.x = clamp(state.x + state.vx * dt, state.minX, state.maxX);
        state.y = clamp(state.y + state.vy * dt, state.minY, state.maxY);
        state.vx *= Math.exp(-dt * 5);
        state.vy *= Math.exp(-dt * 5);
      }
      const target = state.down
        ? clamp(-state.vx * 0.012, -14, 14)
        : 0;
      state.rate += ((target - state.swing) * 260 - state.rate * 16) * dt;
      state.swing += state.rate * dt;
      setDrag({
        index: state.index,
        x: state.x,
        y: state.y,
        angle: state.swing,
      });
      const settled =
        !state.down &&
        Math.abs(state.vx) < 14 &&
        Math.abs(state.vy) < 14 &&
        Math.abs(state.swing) < 0.05 &&
        Math.abs(state.rate) < 0.5;
      if (settled) {
        commit();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    },
    [commit],
  );

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, []);

  const onPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.button !== 0) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      const running = motion.current;
      setOffsets((prev) => ({
        ...prev,
        [running.index]: { x: running.x, y: running.y },
      }));
    }
    const offset = offsets[index] ?? { x: 0, y: 0 };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      void 0;
    }
    motion.current = {
      ...motion.current,
      down: true,
      index,
      startX: event.clientX,
      startY: event.clientY,
      pointerX: event.clientX,
      pointerY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
      x: offset.x,
      y: offset.y,
      vx: 0,
      vy: 0,
      lastX: event.clientX,
      lastTime: performance.now(),
      stamp: 0,
      swing: 0,
      rate: 0,
      ...limits(event.currentTarget, offset),
    };
    raise(index);
    setHeld(true);
    setDrag({ index, x: offset.x, y: offset.y, angle: 0 });
    frame.current = requestAnimationFrame(tick);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = motion.current;
    if (!state.down) return;
    const now = performance.now();
    const elapsed = now - state.lastTime;
    if (elapsed > 0) {
      state.vx = clamp(
        ((event.clientX - state.lastX) / elapsed) * 1000,
        -2400,
        2400,
      );
      state.lastX = event.clientX;
      state.lastTime = now;
    }
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
  };

  const endDrag = () => {
    const state = motion.current;
    if (!state.down) return;
    state.down = false;
    setHeld(false);
    if (reduce) {
      state.vx = 0;
      state.vy = 0;
      commit();
    }
  };

  const nudge = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const amount = event.shiftKey ? 48 : 16;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
      ArrowDown: [0, amount],
    };
    const delta = map[event.key];
    if (!delta) return;
    event.preventDefault();
    const offset = offsets[index] ?? { x: 0, y: 0 };
    const box = limits(event.currentTarget, offset);
    setOffsets((prev) => ({
      ...prev,
      [index]: {
        x: clamp(offset.x + delta[0], box.minX, box.maxX),
        y: clamp(offset.y + delta[1], box.minY, box.maxY),
      },
    }));
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={ariaLabel}
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height: boardHeight,
        borderRadius: 20,
        boxSizing: "border-box",
        background: boardColor,
        backgroundImage: texture
          ? "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.2px)"
          : "none",
        backgroundSize: "6px 6px",
      }}
    >
      <style>{`@keyframes pinfold-drop{from{opacity:0;transform:translateY(-14px) scale(1.14)}to{opacity:1;transform:none}}@keyframes pinfold-sway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}`}</style>

      <div
        ref={areaRef}
        style={{
          position: "absolute",
          insetInline: inset,
          top: 0,
          bottom: 0,
        }}
      >
        {showHeading && (
          <div
            style={{
              position: "absolute",
              insetInlineStart: 0,
              top: inset,
              maxWidth: "80%",
              zIndex: 900,
              transform: "rotate(-1.2deg)",
            }}
          >
            <div
              style={{
                ...PAPER_FILL,
                position: "relative",
                padding: `${pin === "none" ? 14 : 22}px 20px 14px`,
                borderRadius: 14,
                backgroundColor: "#FBFAF5",
                boxShadow:
                  "inset 0 0 0 0.5px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.18), 0 12px 22px -12px rgba(0,0,0,0.45)",
                color: "#1F2A1E",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: narrow ? 21 : 26,
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: narrow ? 12 : 13,
                    lineHeight: 1.7,
                    color: INK_SOFT,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            insetInline: 0,
            top: inset + headroom,
            bottom: inset,
          }}
        >
          {notes.map((note, index) => {
            const spot = spots[index] ?? { left: 50, top: 50, turn: 0 };
            const shape = narrow && note.shape === "wide" ? "square" : note.shape;
            const box = noteFrame(shape, size);
            const active = drag?.index === index;
            const offset = active
              ? { x: drag.x, y: drag.y }
              : (offsets[index] ?? { x: 0, y: 0 });
            const turn = spot.turn + (active ? drag.angle : 0);
            const color = note.color ?? NOTE_COLORS[index % NOTE_COLORS.length];
            const layer = order[index] ?? index + 1;
            const lifted = active && held;
            const scale = lifted ? 1.06 : hovered === index && !active ? 1.035 : 1;
            const sway =
              breeze && !reduce && !active
                ? `pinfold-sway ${4.2 + grain(7, index, 5) * 2.4}s ease-in-out ${-grain(11, index, 6) * 4}s infinite`
                : "none";

            return (
              <div
                key={`${note.name}-${index}`}
                style={{
                  position: "absolute",
                  left: `clamp(${box.width / 2 + 6}px, ${spot.left}%, calc(100% - ${box.width / 2 + 6}px))`,
                  top: `clamp(${box.height / 2 + 6}px, ${spot.top}%, calc(100% - ${box.height / 2 + 6}px))`,
                  width: 0,
                  height: 0,
                  zIndex: layer,
                  animation: reduce
                    ? "none"
                    : `pinfold-drop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 60}ms both`,
                  transition: reduce
                    ? "none"
                    : "left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <div
                  role="group"
                  aria-label={`${note.name}${note.role ? `، ${note.role}` : ""}`}
                  tabIndex={0}
                  onPointerDown={(event) => onPointerDown(event, index)}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(event) => nudge(event, index)}
                  onFocus={() => raise(index)}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered((value) => (value === index ? null : value))}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    position: "absolute",
                    left: -box.width / 2,
                    top: -box.height / 2,
                    width: box.width,
                    height: box.height,
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${turn}deg) scale(${scale})`,
                    transformOrigin: `50% ${pin === "none" ? 0 : pinAnchor(pin, pinSize)}px`,
                    transition: active
                      ? "none"
                      : reduce
                        ? "none"
                        : "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    cursor: active ? "grabbing" : "grab",
                    touchAction: "none",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      ...PAPER_FILL,
                      position: "absolute",
                      inset: 0,
                      boxSizing: "border-box",
                      padding: `${padTop}px 18px 16px`,
                      borderRadius: 14,
                      backgroundColor: color,
                      transformOrigin: `50% ${pin === "none" ? 0 : pinAnchor(pin, pinSize)}px`,
                      animation: sway,
                      boxShadow: lifted
                        ? "inset 0 0 0 0.5px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6), 0 18px 30px -12px rgba(0,0,0,0.55), 0 30px 50px -24px rgba(0,0,0,0.5)"
                        : "inset 0 0 0 0.5px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2), 0 10px 18px -12px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 8,
                      overflow: "hidden",
                      color: INK,
                      transition: reduce ? "none" : "box-shadow 0.25s ease",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: narrow ? 14 : 15,
                        lineHeight: 1.6,
                        flex: "1 1 auto",
                        minHeight: 0,
                        overflow: "hidden",
                      }}
                    >
                      {note.quote ? `«${note.quote}»` : ""}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flex: "0 0 auto",
                      }}
                    >
                      {note.imageUrl ? (
                        <img
                          src={note.imageUrl}
                          alt={note.name}
                          draggable={false}
                          style={{
                            width: narrow ? 24 : 28,
                            height: narrow ? 24 : 28,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flex: "0 0 auto",
                            boxShadow: "0 0 0 2px rgba(255,255,255,0.7)",
                          }}
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          style={{
                            width: narrow ? 24 : 28,
                            height: narrow ? 24 : 28,
                            borderRadius: "50%",
                            flex: "0 0 auto",
                            background: "rgba(0,0,0,0.13)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: narrow ? 10 : 11,
                            fontWeight: 700,
                          }}
                        >
                          {initialsOf(note.name)}
                        </span>
                      )}
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            lineHeight: 1.6,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {note.href ? (
                            <a
                              href={note.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onPointerDown={(event) => event.stopPropagation()}
                              style={{
                                color: "inherit",
                                textDecoration: "underline",
                              }}
                            >
                              {note.name}
                            </a>
                          ) : (
                            note.name
                          )}
                        </span>
                        {note.role && (
                          <span
                            style={{
                              fontSize: 11,
                              lineHeight: 1.6,
                              color: INK_SOFT,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {note.role}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {pin === "tape" && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: -11,
                        width: box.width * 0.44,
                        height: 24,
                        marginLeft: -box.width * 0.22,
                        background: "rgba(255,255,255,0.5)",
                        clipPath: TAPE_EDGE,
                        transform: `rotate(${index % 2 ? 4 : -4}deg)`,
                      }}
                    />
                  )}

                  {pin !== "tape" && pin !== "none" && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: pinAnchor(pin, pinSize),
                        width: 0,
                        height: 0,
                        pointerEvents: "none",
                      }}
                    >
                      <Pin
                        kind={pin}
                        color={PIN_COLORS[index % PIN_COLORS.length]}
                        size={pinSize}
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showTools && (
          <div
            style={{
              position: "absolute",
              insetInlineEnd: -8,
              bottom: -8,
              display: "flex",
              gap: 4,
              padding: 4,
              borderRadius: 999,
              background: "#FBFAF5",
              boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
              zIndex: 950,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setNeat(false);
                setShake((value) => value + 1);
              }}
              style={{
                height: 34,
                paddingInline: 14,
                border: 0,
                borderRadius: 999,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                color: "#1F2A1E",
                cursor: "pointer",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 3h5v5" />
                <path d="M4 20 21 3" />
                <path d="M21 16v5h-5" />
                <path d="m15 15 6 6" />
                <path d="M4 4l5 5" />
              </svg>
              بُر بزن
            </button>
            <button
              type="button"
              onClick={() => {
                setNeat(true);
                setShake((value) => value + 1);
                setOffsets({});
              }}
              aria-pressed={neat}
              style={{
                height: 34,
                paddingInline: 14,
                border: 0,
                borderRadius: 999,
                background: neat ? "rgba(0,0,0,0.08)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                color: "#1F2A1E",
                cursor: "pointer",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              مرتب کن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pinfold;
