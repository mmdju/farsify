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
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

function pad2(value: number) {
  return toFaDigits((value + 1).toString().padStart(2, "0"));
}

function clamp(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

type Palette = {
  ground: string;
  ink: string;
  inner: string;
  front: string;
  cards: string[];
};

const PALETTES: Record<string, Palette> = {
  orchard: {
    ground: "#F6F3EC",
    ink: "#1E231D",
    inner: "#D8D0BE",
    front: "#E7E0D0",
    cards: [
      "#C9D8B6",
      "#F2C9A9",
      "#D7CBEA",
      "#F1DE9C",
      "#B9DCD4",
      "#E8B9B5",
      "#E6C79C",
      "#C3CFE6",
      "#D9E3A8",
      "#EBC4D9",
    ],
  },
  atelier: {
    ground: "#EEE6D8",
    ink: "#221D18",
    inner: "#CDBFA6",
    front: "#DED1BA",
    cards: [
      "#C9785B",
      "#DDAF4E",
      "#9CAB7E",
      "#B49CC3",
      "#E3CFB3",
      "#86A3B5",
      "#B5885F",
      "#D49A8C",
      "#7E9488",
      "#CDB670",
    ],
  },
  tidewater: {
    ground: "#F2F5F4",
    ink: "#14232B",
    inner: "#CBD5D4",
    front: "#DFE6E5",
    cards: [
      "#BFD9E6",
      "#9CC5C8",
      "#DCE8D2",
      "#F0E6CF",
      "#A9B8D9",
      "#E6D2C3",
      "#8FB3C9",
      "#D4E6C1",
      "#D7CDE3",
      "#E8D7B9",
    ],
  },
  spice: {
    ground: "#F6EFE3",
    ink: "#231A12",
    inner: "#D9C8AE",
    front: "#E8DAC4",
    cards: [
      "#E9B23B",
      "#C8553D",
      "#8DA46A",
      "#E7A9A1",
      "#4F5D99",
      "#F1E2C4",
      "#D98A4E",
      "#6E8C7A",
      "#B9748C",
      "#E5CF8F",
    ],
  },
  riviera: {
    ground: "#F4F1EA",
    ink: "#16202E",
    inner: "#D6D0C3",
    front: "#E6E1D6",
    cards: [
      "#2D55C8",
      "#EE6A50",
      "#F4CB57",
      "#6CC3BE",
      "#F2B3BB",
      "#1F5A47",
      "#8E6CD9",
      "#F49B3F",
      "#BFE3F2",
      "#E7E0CF",
    ],
  },
  sorbet: {
    ground: "#FFF7EF",
    ink: "#2A1E1A",
    inner: "#EED9C7",
    front: "#F6E6D8",
    cards: [
      "#FFBFA6",
      "#FFDC7C",
      "#B5EACB",
      "#CDBEFF",
      "#FFADD0",
      "#A8DAFF",
      "#FFD3A3",
      "#E3F59E",
      "#C5F1F0",
      "#F7C8F2",
    ],
  },
  graphite: {
    ground: "#F0F0ED",
    ink: "#161616",
    inner: "#CFCFCA",
    front: "#E2E2DE",
    cards: [
      "#FFFFFF",
      "#1E1E1E",
      "#E2E2DE",
      "#44474A",
      "#C8C6BF",
      "#F3F1EB",
      "#8E8E88",
      "#FAFAF7",
      "#2A2A28",
      "#DAD8D1",
    ],
  },
  nocturne: {
    ground: "#121412",
    ink: "#EEEBE3",
    inner: "#0A0C0A",
    front: "#1E221E",
    cards: [
      "#24372E",
      "#33283F",
      "#43302A",
      "#22344A",
      "#463C28",
      "#3E2530",
      "#2E4140",
      "#3A2E28",
      "#30304A",
      "#41382E",
    ],
  },
};

const BRASS = ["#F4E2AE", "#C7A15A", "#86662C"];
const AGED_BRASS = ["#D8BF88", "#987A42", "#5A4522"];
const CHROME = ["#F5F7F8", "#BAC1C6", "#7A838A"];
const DARK_TEXT = "#191C18";
const LIGHT_TEXT = "#FAF8F2";
const TAB_HEIGHT = 30;
const PAD = 24;
const COLUMNS = 3;
const TAB_WIDTH = 32;

export type DocketItem = {
  name: string;
  role: string;
  company?: string;
  quote: string;
  rating?: number;
  imageUrl?: string;
  href?: string;
  tab?: string;
};

type Skin = {
  face: string;
  texture: string;
  well: string;
  wall: string;
  metal: string[];
  cutout: boolean;
};

function channels(color?: string) {
  if (!color || typeof color !== "string") return null;
  const hex = color.match(/#([0-9a-f]{3,8})/i);
  if (hex) {
    let value = hex[1];
    if (value.length === 3 || value.length === 4)
      value = value
        .slice(0, 3)
        .split("")
        .map((part) => part + part)
        .join("");
    const parsed = parseInt(value.slice(0, 6), 16);
    return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
  }
  const rgb = color.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function luma(color?: string) {
  const value = channels(color);
  if (!value) return 1;
  const [r, g, b] = value.map((part) => {
    const channel = part / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textFor(background: string) {
  const base = luma(background);
  const againstDark = (base + 0.05) / (luma(DARK_TEXT) + 0.05);
  const againstLight = (luma(LIGHT_TEXT) + 0.05) / (base + 0.05);
  return againstDark >= againstLight ? DARK_TEXT : LIGHT_TEXT;
}

function blend(color: string, towards: number[], amount: number) {
  const value = channels(color) ?? [200, 200, 200];
  const mixed = value.map((part, index) =>
    Math.round(part + (towards[index] - part) * amount),
  );
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function lighter(color: string, amount: number) {
  return blend(color, [255, 255, 255], amount);
}

function deeper(color: string, amount: number) {
  return blend(color, [0, 0, 0], amount);
}

function tone(background: string) {
  const ink = textFor(background);
  const darkCard = ink === LIGHT_TEXT;
  return {
    background,
    ink,
    mark: darkCard ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.58)",
    avatarBg: ink,
    avatarInk: background,
  };
}

function skinFor(material: string, palette: Palette): Skin {
  if (material === "walnut")
    return {
      face: "#6B4831",
      texture:
        "repeating-linear-gradient(92deg, rgba(0,0,0,0.09) 0 1px, transparent 1px 7px), repeating-linear-gradient(88deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 19px)",
      well: "#2E1F15",
      wall: "#5A3C29",
      metal: BRASS,
      cutout: false,
    };
  if (material === "kraft")
    return {
      face: "#C7A57A",
      texture:
        "repeating-linear-gradient(115deg, rgba(90,60,30,0.06) 0 1px, transparent 1px 5px), repeating-linear-gradient(25deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)",
      well: "#8E7050",
      wall: "#B3926A",
      metal: CHROME,
      cutout: true,
    };
  if (material === "steel")
    return {
      face: "#B8BDC1",
      texture:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)",
      well: "#6F757A",
      wall: "#A3A9AE",
      metal: CHROME,
      cutout: false,
    };
  if (material === "theme") {
    const dark = textFor(palette.ground) === LIGHT_TEXT;
    return {
      face: palette.front,
      texture: "linear-gradient(transparent, transparent)",
      well: palette.inner,
      wall: deeper(palette.front, 0.08),
      metal: dark ? AGED_BRASS : BRASS,
      cutout: false,
    };
  }
  return {
    face: "#C9A37A",
    texture:
      "repeating-linear-gradient(90deg, rgba(110,70,30,0.07) 0 2px, transparent 2px 11px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 23px)",
    well: "#7A5A3C",
    wall: "#B48D63",
    metal: BRASS,
    cutout: false,
  };
}

const metalFill = (metal: string[]) =>
  `linear-gradient(180deg, ${metal[0]} 0%, ${metal[1]} 55%, ${metal[2]} 100%)`;
const rivetFill = (metal: string[]) =>
  `radial-gradient(circle at 35% 30%, ${metal[0]} 0%, ${metal[1]} 55%, ${metal[2]} 100%)`;
const faceFill = (skin: Skin) =>
  `${skin.texture}, linear-gradient(180deg, ${lighter(skin.face, 0.14)} 0%, ${skin.face} 38%, ${deeper(skin.face, 0.14)} 100%)`;

function marks(text: string) {
  return String(text ?? "")
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => ({ text: part, on: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
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

function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setSeen(entries[0]?.isIntersecting ?? false),
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

function useStageSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () =>
      setSize((prev) =>
        prev.width === el.clientWidth && prev.height === el.clientHeight
          ? prev
          : { width: el.clientWidth, height: el.clientHeight },
      );
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

export type TestimonialDrawerProps = {
  items: DocketItem[];
  theme?: keyof typeof PALETTES;
  material?: "oak" | "walnut" | "kraft" | "steel" | "theme";
  cards?: string[];
  label?: string;
  sublabel?: string;
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  startIndex?: number;
  height?: number;
  background?: string;
  ariaLabel?: string;
  className?: string;
};

export function TestimonialDrawer({
  items,
  theme = "spice",
  material = "oak",
  cards,
  label = "پرونده",
  sublabel = "بازخورد مشتریان",
  autoplay = true,
  interval = 7,
  pauseOnHover = true,
  startIndex = 0,
  height = 560,
  background = "transparent",
  ariaLabel = "نظر مشتریان",
  className,
}: TestimonialDrawerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const size = useStageSize(stageRef);
  const onScreen = useOnScreen(rootRef);
  const reduce = useReducedMotion();
  const count = items.length;
  const [pick, setPick] = useState(() =>
    clamp(Math.round(startIndex), 0, Math.max(0, count - 1)),
  );
  const [peek, setPeek] = useState(-1);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [entered, setEntered] = useState(false);
  const [intro, setIntro] = useState(true);
  const palette = PALETTES[theme] ?? PALETTES.spice;
  const cardTones = cards && cards.length > 0 ? cards : palette.cards;
  const skin = skinFor(material, palette);
  const current = count ? ((pick % count) + count) % count : 0;

  const step = useCallback(
    (direction: number) => {
      if (!count) return;
      setPick((value) => ((value + direction) % count + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setPick((value) => clamp(value, 0, Math.max(0, count - 1)));
  }, [count]);

  useEffect(() => {
    if (size.height > 0 && !entered) {
      const timer = window.setTimeout(() => setEntered(true), 60);
      return () => window.clearTimeout(timer);
    }
  }, [size.height, entered]);

  useEffect(() => {
    if (!entered) return;
    if (reduce) {
      setIntro(false);
      return;
    }
    const timer = window.setTimeout(() => setIntro(false), count * 70 + 700);
    return () => window.clearTimeout(timer);
  }, [entered, count, reduce]);

  const permit =
    autoplay &&
    onScreen &&
    !reduce &&
    !dragging &&
    entered &&
    !(pauseOnHover && hovering) &&
    count > 1;

  useEffect(() => {
    if (!permit) return;
    const delay = Math.max(1.5, interval) * 1000;
    const timer = window.setTimeout(() => step(1), delay);
    return () => window.clearTimeout(timer);
  }, [permit, current, interval, step]);

  const plan = useMemo(() => {
    const width = size.width;
    const stageHeight = size.height;
    const narrow = width < 460;
    const front = clamp(stageHeight * 0.2, 80, 140);
    const top = stageHeight - front;
    const reserve = narrow ? 44 : 72;
    const room = top - TAB_HEIGHT - reserve - width * 0.42;
    const pitch = count > 1 ? Math.max(4, Math.min(14, room / (count - 1))) : 0;
    const cardHeight = Math.max(
      120,
      top - TAB_HEIGHT - (count - 1) * pitch - reserve,
    );
    const cardWidth = width * 0.86;
    return {
      width,
      height: stageHeight,
      narrow,
      front,
      top,
      pitch,
      cardHeight,
      cardWidth,
      left: (width - cardWidth) / 2,
      slot: (index: number) => top - TAB_HEIGHT - (count - 1 - index) * pitch,
    };
  }, [size.width, size.height, count]);

  const drag = useRef({
    down: false,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    speed: 0,
  });
  const canDrag = !reduce && count > 1 && onScreen;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canDrag || event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      void 0;
    }
    drag.current = {
      down: true,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: performance.now(),
      speed: 0,
    };
    setDragging(true);
    setDragY(0);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    const state = drag.current;
    const now = performance.now();
    const elapsed = now - state.lastTime;
    if (elapsed > 0) state.speed = ((event.clientY - state.lastY) / elapsed) * 1000;
    state.lastY = event.clientY;
    state.lastTime = now;
    setDragY(event.clientY - state.startY);
  };

  const endDrag = () => {
    if (!drag.current.down) return;
    const state = drag.current;
    drag.current.down = false;
    setDragging(false);
    const moved = dragY;
    setDragY(0);
    if (moved > 64 || state.speed > 650) step(1);
    else if (moved < -64 || state.speed < -650) step(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl =
      window.getComputedStyle(event.currentTarget).direction === "rtl";
    const next = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    const previous = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"];
    if (next.includes(event.key)) {
      event.preventDefault();
      step(1);
    } else if (previous.includes(event.key)) {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setPick(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPick(Math.max(0, count - 1));
    }
  };

  const active = items[current];
  const radius = 16;
  const hidden = !entered && !reduce;
  const tight = plan.front < 96;
  const transition = reduce
    ? "none"
    : "transform 0.55s cubic-bezier(0.22, 0.8, 0.3, 1), opacity 0.35s ease, box-shadow 0.45s ease";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="گالری"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setPeek(-1);
      }}
      className={cn(
        "relative w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={{
        height,
        boxSizing: "border-box",
        padding: PAD,
        background,
        color: "inherit",
      }}
    >
      <div
        ref={stageRef}
        className="relative h-full w-full overflow-hidden"
        style={{ opacity: size.height ? 1 : 0 }}
      >
        {count === 0 && (
          <div
            className="absolute inset-0 grid place-items-center text-sm"
            style={{ opacity: 0.6 }}
          >
            هنوز نظری برای نمایش نیست
          </div>
        )}

        {count > 0 && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: plan.left - plan.width * 0.03,
                width: plan.cardWidth + plan.width * 0.06,
                top: plan.slot(0) - 44,
                height: plan.top - (plan.slot(0) - 44) + 24,
                borderRadius: `${Math.round(radius * 0.5)}px ${Math.round(radius * 0.5)}px 0 0`,
                background: `linear-gradient(180deg, ${deeper(skin.well, 0.3)} 0%, ${skin.well} 45%)`,
                boxShadow:
                  "inset 0 16px 22px -8px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.1)",
                overflow: "hidden",
                opacity: hidden ? 0 : 1,
                transform: hidden ? "translate3d(0, 40px, 0)" : "none",
                transition,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 8,
                  background: `linear-gradient(180deg, ${lighter(skin.wall, 0.2)}, ${skin.wall})`,
                }}
              />
            </div>

            {items.map((item, index) => {
              const card = tone(cardTones[index % cardTones.length]);
              const isUp = index === current;
              const lift = !isUp && peek === index ? -8 : 0;
              const rest = isUp ? TAB_HEIGHT : plan.slot(index) + lift;
              const y = hidden ? plan.height + 60 : rest;
              const delay = intro ? (isUp ? count * 70 + 180 : index * 70) : 0;
              const column = index % COLUMNS;
              const cardTransition = dragging
                ? "none"
                : reduce
                  ? "none"
                  : `transform 0.55s cubic-bezier(0.22, 0.8, 0.3, 1) ${delay}ms, opacity 0.35s ease ${delay}ms, box-shadow 0.45s ease`;

              return (
                <div
                  key={`${item.name}-${index}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: plan.left,
                    width: plan.cardWidth,
                    height: plan.cardHeight,
                    zIndex: isUp ? 60 : index + 1,
                    transform: `translate3d(0, ${y + (isUp ? dragY : 0)}px, 0)`,
                    transition: cardTransition,
                    opacity: hidden ? 0 : 1,
                    cursor: isUp ? "default" : "pointer",
                  }}
                  onClick={isUp ? undefined : () => setPick(index)}
                >
                  <div
                    onPointerDown={isUp && canDrag ? onPointerDown : undefined}
                    onPointerMove={isUp && canDrag ? onPointerMove : undefined}
                    onPointerUp={isUp && canDrag ? endDrag : undefined}
                    onPointerCancel={isUp && canDrag ? endDrag : undefined}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      padding: "14px 22px 20px",
                      display: "flex",
                      flexDirection: "column",
                      background: card.background,
                      color: card.ink,
                      borderRadius: radius,
                      borderStartStartRadius: column === 0 ? 0 : radius,
                      borderStartEndRadius:
                        column === COLUMNS - 1 && COLUMNS > 1 ? 0 : radius,
                      boxShadow: isUp
                        ? "0 26px 50px rgba(0,0,0,0.18)"
                        : "0 -4px 14px rgba(0,0,0,0.10)",
                      transition: reduce ? "none" : "box-shadow 0.45s ease",
                      cursor: canDrag
                        ? dragging
                          ? "grabbing"
                          : "grab"
                        : undefined,
                      touchAction: canDrag ? "pan-x" : undefined,
                      userSelect: canDrag ? "none" : undefined,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`نمایش نظر ${item.name || `کارت ${pad2(index)}`}`}
                      aria-pressed={isUp}
                      onClick={(event) => {
                        event.stopPropagation();
                        setPick(index);
                      }}
                      onMouseEnter={() => setPeek(index)}
                      onMouseLeave={() => setPeek(-1)}
                      onFocus={() => setPeek(index)}
                      onBlur={() => setPeek(-1)}
                      style={{
                        position: "absolute",
                        top: -TAB_HEIGHT,
                        insetInlineStart: `${(index % COLUMNS) * ((100 - TAB_WIDTH) / (COLUMNS - 1))}%`,
                        width: `${TAB_WIDTH}%`,
                        height: TAB_HEIGHT,
                        boxSizing: "border-box",
                        paddingInline: 12,
                        margin: 0,
                        border: 0,
                        cursor: "pointer",
                        background: card.background,
                        color: card.ink,
                        borderStartStartRadius: Math.round(radius * 0.7),
                        borderStartEndRadius: Math.round(radius * 0.7),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textAlign: "start",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {item.tab || item.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontVariantNumeric: "tabular-nums",
                          opacity: 0.7,
                        }}
                      >
                        {pad2(index)}
                      </span>
                    </button>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          opacity: 0.72,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        شماره {pad2(index)}
                        {item.company ? ` · ${item.company}` : ""}
                      </span>
                      <span
                        aria-label={`${toFaDigits(item.rating ?? 0)} از ۵`}
                        role="img"
                        style={{ display: "flex", gap: 2, flexShrink: 0 }}
                      >
                        {[0, 1, 2, 3, 4].map((star) => (
                          <svg
                            key={star}
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            style={{
                              opacity: star < (item.rating ?? 0) ? 1 : 0.25,
                            }}
                          >
                            <path
                              fill="currentColor"
                              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3 6.1 20.5l1.3-6.5L2.5 9.4l6.6-.8z"
                            />
                          </svg>
                        ))}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "14px 0 0",
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                        fontSize: plan.narrow ? 15 : 18,
                        lineHeight: 1.75,
                        textAlign: "start",
                      }}
                    >
                      «
                      {marks(item.quote).map((part, key) =>
                        part.on ? (
                          <span
                            key={key}
                            style={{
                              background: card.mark,
                              borderRadius: "0.25em",
                              padding: "0 0.2em",
                              boxDecorationBreak: "clone",
                              WebkitBoxDecorationBreak: "clone",
                            }}
                          >
                            {part.text}
                          </span>
                        ) : (
                          <span key={key}>{part.text}</span>
                        ),
                      )}
                      »
                    </p>

                    <div
                      aria-hidden="true"
                      style={{
                        height: 1,
                        background: card.ink,
                        opacity: 0.45,
                        margin: "12px 0 14px",
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexShrink: 0,
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          draggable={false}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: card.avatarBg,
                            color: card.avatarInk,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {initialsOf(item.name)}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: 14, opacity: 0.72 }}>
                          {item.role}
                        </span>
                      </div>
                      {item.href && (
                        <a
                          href={item.href}
                          tabIndex={isUp ? 0 : -1}
                          onClick={(event) => event.stopPropagation()}
                          style={{
                            color: "inherit",
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                            whiteSpace: "nowrap",
                          }}
                        >
                          مشاهدهٔ پروژه
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {[0, 1].map((side) => (
              <div
                key={side}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left:
                    side === 0
                      ? plan.left - plan.width * 0.03
                      : plan.left +
                        plan.cardWidth +
                        plan.width * 0.03 -
                        plan.width * 0.026,
                  width: plan.width * 0.026,
                  top: plan.slot(0) - 44,
                  height: plan.top - (plan.slot(0) - 44) + 6,
                  zIndex: 70,
                  borderRadius: side === 0 ? "4px 0 0 0" : "0 4px 0 0",
                  background:
                    side === 0
                      ? `linear-gradient(90deg, ${lighter(skin.wall, 0.16)} 0%, ${skin.wall} 60%, ${deeper(skin.wall, 0.2)} 100%)`
                      : `linear-gradient(270deg, ${lighter(skin.wall, 0.08)} 0%, ${skin.wall} 50%, ${deeper(skin.wall, 0.24)} 100%)`,
                  boxShadow:
                    side === 0
                      ? "3px 0 6px rgba(0,0,0,0.18)"
                      : "-3px 0 6px rgba(0,0,0,0.18)",
                  opacity: hidden ? 0 : 1,
                  transform: hidden ? "translate3d(0, 40px, 0)" : "none",
                  transition,
                }}
              />
            ))}

            <div
              style={{
                position: "absolute",
                left: plan.left - plan.width * 0.04,
                width: plan.cardWidth + plan.width * 0.08,
                top: plan.top,
                height: plan.front,
                zIndex: 80,
                boxSizing: "border-box",
                background: faceFill(skin),
                borderRadius: `${Math.round(radius * 0.6)}px ${Math.round(radius * 0.6)}px ${radius}px ${radius}px`,
                boxShadow:
                  "0 22px 30px -16px rgba(0,0,0,0.5), 0 -2px 0 rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -4px 0 rgba(0,0,0,0.14)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 10,
                  borderRadius: Math.max(4, Math.round(radius * 0.45)),
                  boxShadow:
                    "inset 0 1px 2px rgba(0,0,0,0.24), 0 1px 0 rgba(255,255,255,0.28)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  overflow: "hidden",
                }}
              >
                {(label || sublabel) && (
                  <div
                    style={{
                      position: "relative",
                      padding: "3px 18px",
                      borderRadius: 4,
                      background: metalFill(skin.metal),
                      boxShadow:
                        "0 2px 3px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                  >
                    {[0, 1].map((side) => (
                      <span
                        key={side}
                        style={{
                          position: "absolute",
                          top: "50%",
                          marginTop: -3,
                          left: side === 0 ? 7 : undefined,
                          right: side === 1 ? 7 : undefined,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: rivetFill(skin.metal),
                          boxShadow: "0 1px 1px rgba(0,0,0,0.35)",
                        }}
                      />
                    ))}
                    <div
                      style={{
                        minWidth: 118,
                        padding: "3px 14px",
                        borderRadius: 2,
                        background: "#F8F3E7",
                        color: "#2A241E",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0,
                      }}
                    >
                      {label && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.5,
                            textAlign: "center",
                          }}
                        >
                          {label}
                        </span>
                      )}
                      {sublabel && !tight && (
                        <span
                          style={{
                            fontSize: 9,
                            lineHeight: 1.4,
                            textAlign: "center",
                            opacity: 0.7,
                          }}
                        >
                          {sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!tight && (
                  <button
                  type="button"
                  aria-label="نظر بعدی"
                  onClick={() => step(1)}
                  style={{
                    position: "relative",
                    width: "24%",
                    maxWidth: 140,
                    minWidth: 72,
                    height: 20,
                    flexShrink: 0,
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {[0, 1].map((side) => (
                    <span
                      key={side}
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: -3,
                        left: side === 0 ? -3 : undefined,
                        right: side === 1 ? -3 : undefined,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: rivetFill(skin.metal),
                        boxShadow: "0 2px 2px rgba(0,0,0,0.35)",
                      }}
                    />
                  ))}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: "0 4px",
                      borderRadius: "3px 3px 999px 999px / 3px 3px 18px 18px",
                      background: `linear-gradient(180deg, ${skin.metal[2]} 0%, ${skin.metal[1]} 30%, ${skin.metal[0]} 72%, ${skin.metal[1]} 100%)`,
                      boxShadow:
                        "0 6px 8px -3px rgba(0,0,0,0.45), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {active ? `${active.name}: ${active.quote.replace(/\*\*/g, "")}` : ""}
      </span>
    </div>
  );
}

export default TestimonialDrawer;
