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
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import "./carousel.css";

export interface CarouselItem {
  id?: string | number;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  image?: string;
  alt?: string;
}

export type CarouselEntry = CarouselItem | string | ReactElement;

export interface CarouselProps {
  items?: CarouselEntry[];
  baseWidth?: number | string;
  aspectRatio?: number;
  peek?: number;
  gap?: number;
  radius?: number;
  frame?: boolean;
  effect?: "tilt" | "slide" | "scale" | "fade" | "cube";
  indicator?: "dots" | "bars" | "counter" | "none";
  arrows?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  draggable?: boolean;
  round?: boolean;
  initialIndex?: number;
  theme?: "dark" | "light";
  onChange?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
}

type Settings = {
  count: number;
  mode: string;
  width: number;
  bleed: number;
  inset: number;
  cardWidth: number;
  span: number;
  loop: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  pauseOnHover: boolean;
  draggable: boolean;
  bars: boolean;
  shade: number;
  sign: number;
};

type Drag = {
  id: number;
  x: number;
  y: number;
  p: number;
  from: number;
  moved: boolean;
  samples: [number, number][];
};

type Engine = {
  goTo: (index: number) => void;
  step: (direction: number, auto?: boolean) => void;
  sync: () => void;
};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: "کشیدن با شتاب",
    description: "کارت‌ها را پرتاب کنی، فنری سرِ جایشان می‌نشینند.",
    icon: <CarouselDragGlyph />,
  },
  {
    id: 2,
    title: "پخشِ خودکارِ زمان‌دار",
    description: "نوارِ نشانگر پر می‌شود تا معلوم شود بعد چه می‌آید.",
    icon: <CarouselTimerGlyph />,
  },
  {
    id: 3,
    title: "پنج گذار",
    description: "کج، لغزش، مقیاس، محو یا چرخشِ کارت‌ها مثلِ مکعب.",
    icon: <CarouselLayersGlyph />,
  },
  {
    id: 4,
    title: "صفحه‌کلیددوست",
    description: "فلش‌ها، Home و End بین کارت‌ها حرکت می‌کنند.",
    icon: <CarouselCommandGlyph />,
  },
  {
    id: 5,
    title: "هر محتوایی",
    description: "متن، عکس یا کامپوننتِ خودت را به‌عنوان کارت بده.",
    icon: <CarouselImageGlyph />,
  },
];

const THEMES: Record<string, Record<string, string>> = {
  dark: {
    "--carousel-frame": "rgba(16, 16, 16, 0.96)",
    "--carousel-frame-edge": "rgba(255, 255, 255, 0.12)",
    "--carousel-frame-highlight": "rgba(255, 255, 255, 0.16)",
    "--carousel-frame-shadow": "0 22px 44px -20px rgba(0, 0, 0, 0.85), 0 6px 16px -8px rgba(0, 0, 0, 0.55)",
    "--carousel-tile": "linear-gradient(180deg, #232323 0%, #141414 100%)",
    "--carousel-tile-edge": "rgba(255, 255, 255, 0.12)",
    "--carousel-tile-highlight": "rgba(255, 255, 255, 0.16)",
    "--carousel-tile-shadow": "0 4px 10px -4px rgba(0, 0, 0, 0.7)",
    "--carousel-ink": "#fafafa",
    "--carousel-muted": "#a3a3a3",
    "--carousel-faint": "rgba(255, 255, 255, 0.22)",
    "--carousel-soft": "rgba(255, 255, 255, 0.42)",
    "--carousel-badge": "rgba(255, 255, 255, 0.08)",
    "--carousel-hover": "brightness(1.14)",
    "--carousel-press": "brightness(0.82)",
  },
  light: {
    "--carousel-frame": "rgba(240, 240, 240, 0.96)",
    "--carousel-frame-edge": "rgba(0, 0, 0, 0.08)",
    "--carousel-frame-highlight": "rgba(255, 255, 255, 0.98)",
    "--carousel-frame-shadow": "0 22px 44px -22px rgba(0, 0, 0, 0.16), 0 6px 16px -10px rgba(0, 0, 0, 0.1)",
    "--carousel-tile": "linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)",
    "--carousel-tile-edge": "rgba(0, 0, 0, 0.08)",
    "--carousel-tile-highlight": "rgba(255, 255, 255, 1)",
    "--carousel-tile-shadow": "0 4px 10px -5px rgba(0, 0, 0, 0.12)",
    "--carousel-ink": "#0a0a0a",
    "--carousel-muted": "#525252",
    "--carousel-faint": "rgba(0, 0, 0, 0.16)",
    "--carousel-soft": "rgba(0, 0, 0, 0.34)",
    "--carousel-badge": "rgba(0, 0, 0, 0.05)",
    "--carousel-hover": "brightness(0.97)",
    "--carousel-press": "brightness(0.92)",
  },
};

const EFFECTS = ["tilt", "slide", "scale", "fade", "cube"];
const STIFFNESS = 150;
const DAMPING = 24;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrap = (value: number, count: number) => ((value % count) + count) % count;
const nearest = (offset: number, count: number) => wrap(offset + count / 2, count) - count / 2;

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

const edgeMask = (size: number) => {
  const stops = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((t) => [smootherstep(t).toFixed(3), (t * size).toFixed(1)]);
  const left = stops.map(([alpha, x]) => `rgba(0, 0, 0, ${alpha}) ${x}px`);
  const right = [...stops].reverse().map(([alpha, x]) => `rgba(0, 0, 0, ${alpha}) calc(100% - ${x}px)`);
  return `linear-gradient(to right, ${[...left, ...right].join(", ")})`;
};

const band = (value: number, max: number) => {
  if (value < 0) return -0.3 * (1 - Math.exp(value / 0.55));
  if (value > max) return max + 0.3 * (1 - Math.exp((max - value) / 0.55));
  return value;
};

const pose = (index: number, position: number, s: Settings) => {
  const offset = s.loop ? nearest(index - position, s.count) : index - position;
  const distance = Math.abs(offset);
  const near = Math.min(distance, 1);
  const result = {
    transform: "none",
    opacity: 1,
    visible: true,
    layer: 10 - Math.min(9, Math.round(distance * 2)),
    shade: 0,
    focus: 1,
  };
  if (s.mode === "fade") {
    const half = Math.min(1, near * 2);
    result.visible = distance < 1;
    result.opacity = 1 - near * near * (3 - 2 * near);
    result.transform = `scale(${1 - 0.04 * near})`;
    result.focus = 1 - half * half * (3 - 2 * half);
    return result;
  }
  if (s.mode === "cube") {
    const half = s.cardWidth / 2;
    const turn = Math.sin(Math.PI * (position - Math.floor(position)));
    result.visible = distance < 1;
    result.transform = `scale(${1 - 0.12 * turn}) translateZ(${-half}px) rotateY(${clamp(offset, -1, 1) * 90 * s.sign}deg) translateZ(${half}px)`;
    result.shade = near * s.shade;
    return result;
  }
  let x = offset * s.span * s.sign;
  result.visible = x > -(s.inset + s.cardWidth + 2) && x < s.width + s.bleed * 2 - s.inset + 2;
  result.focus = 1 - near * near * (3 - 2 * near);
  if (s.mode === "tilt") {
    result.visible = result.visible && distance < 1;
    result.transform = `translate3d(${x}px, 0, 0) rotateY(${-clamp(offset, -1, 1) * 90 * s.sign}deg)`;
  } else if (s.mode === "scale") {
    x -= Math.sign(offset) * near * s.cardWidth * 0.06 * s.sign;
    result.transform = `translate3d(${x}px, 0, 0) scale(${1 - 0.12 * near})`;
    result.opacity = 1 - 0.5 * near;
  } else {
    result.transform = `translate3d(${x}px, 0, 0)`;
  }
  return result;
};

const keyOf = (item: CarouselEntry, index: number) => {
  if (isValidElement(item)) return item.key ?? index;
  if (typeof item === "object" && item !== null && item.id != null) return item.id;
  return index;
};

const DIGIT_BOX = "0.694em";

const PaddedDigits = ({ value }: { value: string }) => (
  <>
    {[...value].map((character, index) => (
      <span key={index} style={{ display: "inline-block", inlineSize: DIGIT_BOX, textAlign: "center" }}>
        {character}
      </span>
    ))}
  </>
);

const Chevron = ({ flip = false }: { flip?: boolean }) =>
  flip ? <CarouselArrowLeftGlyph /> : <CarouselArrowRightGlyph />;

const Card = ({ item, round, compact }: { item: CarouselEntry; round: boolean; compact: boolean }) => {
  if (isValidElement(item)) {
    return (
      <div className={`carousel-card is-custom${round ? " is-round" : ""}`}>
        {item}
        <span className="carousel-card-rim" />
      </div>
    );
  }
  const {
    image,
    alt = "",
    icon: mark,
    title,
    description,
  }: CarouselItem = typeof item === "string" ? { image: item } : (item ?? {});
  const text = Boolean(title || description);
  return (
    <div className={`carousel-card${image ? " has-image" : ""}${round ? " is-round" : ""}`}>
      {image && <img className="carousel-image" src={image} alt={alt} draggable={false} decoding="async" />}
      {image && text && <span className="carousel-scrim" />}
      {mark && <span className="carousel-icon">{mark}</span>}
      {text && (
        <div className="carousel-text">
          {title && <div className="carousel-title">{title}</div>}
          {description && !compact && <p className="carousel-description">{description}</p>}
        </div>
      )}
      <span className="carousel-card-rim" />
    </div>
  );
};

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  aspectRatio = 1.25,
  peek = 0,
  gap = 16,
  radius = 12,
  frame = true,
  effect = "tilt",
  indicator = "dots",
  arrows = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  draggable = true,
  round = false,
  initialIndex = 0,
  theme = "dark",
  onChange,
  className = "",
  style,
}: CarouselProps) {
  const count = items.length;
  const mode = EFFECTS.includes(effect) ? effect : "tilt";
  const stacked = mode === "fade" || mode === "cube";
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const ratio = clamp(aspectRatio, 0.3, 4);
  const maxWidth =
    typeof baseWidth === "number" && round && frame ? 20 + (baseWidth - 20) * Math.min(1, 1 / ratio) : baseWidth;
  const [width, setWidth] = useState(typeof maxWidth === "number" ? maxWidth - (frame ? 20 : 0) : 300);
  const [active, setActive] = useState(() => clamp(Math.round(initialIndex), 0, Math.max(0, count - 1)));
  const startRef = useRef(active);
  const reportedRef = useRef(active);
  const previousRef = useRef(active);

  const side = stacked || (round && frame) ? 0 : clamp(peek, 0, width * 0.2);
  const slot = Math.max(40, width - side * 2);
  const diameter = frame ? slot : Math.min(slot, slot / ratio);
  const cardWidth = round ? diameter : slot;
  const cardHeight = round ? diameter : slot / ratio;
  const clipped = !frame && !stacked;
  const bleed = clipped ? Math.round(Math.min(48, cardWidth * 0.12)) : 0;
  const inset = bleed + (width - cardWidth) / 2;
  const settings: Settings = {
    count,
    mode,
    width,
    bleed,
    inset,
    cardWidth,
    span: cardWidth + Math.max(0, gap),
    loop: loop && count > 1,
    autoplay: autoplay && count > 1,
    autoplayDelay: Math.max(600, autoplayDelay),
    pauseOnHover,
    draggable: draggable && count > 1,
    bars: indicator === "bars",
    shade: theme === "light" ? 0.3 : 0.6,
    sign: 1,
  };
  const settingsRef = useRef(settings);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    if (!root || !stage || !viewport) return undefined;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const state = {
      p: startRef.current,
      v: 0,
      target: startRef.current,
      shown: startRef.current,
      elapsed: 0,
      hovered: false,
      focused: false,
      visible: true,
      drag: null as Drag | null,
      wheeling: false,
      wheelTimer: 0 as number,
      wheelFrom: 0,
      suppress: false,
      last: 0,
    };
    let raf = 0;
    let alive = true;

    const unit = (s: Settings) => (s.mode === "fade" || s.mode === "cube" ? s.cardWidth : s.span);
    const limit = (s: Settings, value: number) => (s.loop ? value : clamp(value, 0, s.count - 1));

    const apply = () => {
      const s = settingsRef.current;
      for (let i = 0; i < s.count; i++) {
        const slide = slideRefs.current[i];
        if (!slide) continue;
        const next = pose(i, state.p, s);
        slide.style.transform = next.transform;
        slide.style.opacity = String(next.opacity);
        slide.style.visibility = next.visible ? "visible" : "hidden";
        slide.style.zIndex = String(next.layer);
        slide.style.setProperty("--carousel-focus", String(next.focus));
        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = String(next.shade);
      }
      if (!s.bars) return;
      const progress = s.autoplay ? clamp(state.elapsed / s.autoplayDelay, 0, 1) : 1;
      for (let i = 0; i < s.count; i++) {
        const fill = fillRefs.current[i];
        if (fill) fill.style.transform = `scaleX(${i < state.shown ? 1 : i === state.shown ? progress : 0})`;
      }
    };

    const announce = () => {
      const s = settingsRef.current;
      if (!s.count) return;
      const index = s.loop ? wrap(Math.round(state.target), s.count) : clamp(Math.round(state.target), 0, s.count - 1);
      if (index === state.shown) return;
      state.shown = index;
      setActive(index);
    };

    const paused = (s: Settings) =>
      (s.pauseOnHover && state.hovered) ||
      state.focused ||
      Boolean(state.drag) ||
      state.wheeling ||
      !state.visible ||
      document.hidden;

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
      state.last = now;
      let busy = false;
      if (!state.drag?.moved && !state.wheeling) {
        if (reduce) {
          state.p = state.target;
          state.v = 0;
        } else {
          const steps = Math.ceil(dt * 240);
          const h = dt / steps;
          for (let k = 0; k < steps; k++) {
            state.v += (STIFFNESS * (state.target - state.p) - DAMPING * state.v) * h;
            state.p += state.v * h;
          }
          if (Math.abs(state.target - state.p) < 0.0004 && Math.abs(state.v) < 0.004) {
            state.p = state.target;
            state.v = 0;
          } else {
            busy = true;
          }
        }
        if (!busy && s.loop && s.count) {
          state.target = wrap(Math.round(state.target), s.count);
          state.p = state.target;
        }
      }
      if (s.autoplay && !paused(s)) {
        state.elapsed += dt * 1000;
        if (state.elapsed >= s.autoplayDelay) step(1, true);
        busy = true;
      }
      apply();
      if (busy) raf = requestAnimationFrame(tick);
      else state.last = 0;
    };

    const wake = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };

    const moveTo = (target: number) => {
      state.target = target;
      state.elapsed = 0;
      announce();
      apply();
      wake();
    };

    const step = (direction: number, auto = false) => {
      const s = settingsRef.current;
      if (s.count < 2) return;
      let next = Math.round(state.target) + direction;
      if (!s.loop) {
        if (auto && next > s.count - 1) next = 0;
        next = clamp(next, 0, s.count - 1);
      }
      moveTo(next);
    };

    const goTo = (index: number) => {
      const s = settingsRef.current;
      if (!s.count) return;
      const goal = clamp(Math.round(index), 0, s.count - 1);
      const current = Math.round(state.target);
      moveTo(s.loop ? current + nearest(goal - wrap(current, s.count), s.count) : goal);
    };

    const onPointerDown = (event: PointerEvent) => {
      const s = settingsRef.current;
      if (!s.draggable || (event.pointerType === "mouse" && event.button !== 0)) return;
      state.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        p: state.p,
        from: 0,
        moved: false,
        samples: [],
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = state.drag;
      if (!drag || event.pointerId !== drag.id) return;
      const s = settingsRef.current;
      if (!drag.moved) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          state.drag = null;
          return;
        }
        drag.moved = true;
        drag.x = event.clientX;
        drag.p = state.p;
        drag.from = Math.round(state.target);
        viewport.setPointerCapture?.(event.pointerId);
        viewport.dataset.dragging = "true";
      }
      const raw = drag.p - ((event.clientX - drag.x) / unit(s)) * s.sign;
      state.p = s.loop ? raw : band(raw, s.count - 1);
      state.v = 0;
      state.target = Math.round(limit(s, state.p));
      drag.samples.push([event.timeStamp, event.clientX]);
      if (drag.samples.length > 8) drag.samples.shift();
      announce();
      apply();
    };

    const onPointerUp = (event: PointerEvent) => {
      const drag = state.drag;
      if (!drag || event.pointerId !== drag.id) return;
      state.drag = null;
      delete viewport.dataset.dragging;
      if (!drag.moved) {
        wake();
        return;
      }
      state.suppress = true;
      window.setTimeout(() => {
        state.suppress = false;
      }, 0);
      const s = settingsRef.current;
      const sample: [number, number] = drag.samples.find(([time]) => event.timeStamp - time < 90) ?? [
        event.timeStamp,
        event.clientX,
      ];
      const elapsed = Math.max(16, event.timeStamp - sample[0]);
      const velocity =
        clamp(((sample[1] - event.clientX) / elapsed) * (1000 / unit(s)), -12, 12) * s.sign;
      const travelled = state.p - drag.from;
      let target = Math.round(state.p + velocity * 0.2);
      if (target === drag.from) {
        if (Math.abs(velocity) > 0.8) target += Math.sign(velocity);
        else if (Math.abs(travelled) > 0.18) target += Math.sign(travelled);
      }
      if (!s.loop) target = clamp(target, 0, s.count - 1);
      const inside = s.loop || (state.p >= 0 && state.p <= s.count - 1);
      state.v = inside ? velocity : 0;
      moveTo(target);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!state.suppress) return;
      event.preventDefault();
      event.stopPropagation();
      state.suppress = false;
    };

    const onWheel = (event: WheelEvent) => {
      const s = settingsRef.current;
      if (!s.draggable || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (!state.wheeling) state.wheelFrom = state.p;
      const raw = state.p + (event.deltaX / unit(s)) * s.sign;
      state.p = s.loop ? raw : clamp(raw, -0.15, s.count - 0.85);
      state.v = 0;
      state.wheeling = true;
      state.target = Math.round(limit(s, state.p));
      announce();
      apply();
      window.clearTimeout(state.wheelTimer);
      state.wheelTimer = window.setTimeout(() => {
        state.wheeling = false;
        if (state.drag) return;
        const from = Math.round(state.wheelFrom);
        const travelled = state.p - state.wheelFrom;
        let target = Math.round(state.p);
        if (target === from && Math.abs(travelled) > 0.12) target = from + Math.sign(travelled);
        if (!s.loop) target = clamp(target, 0, s.count - 1);
        moveTo(target);
      }, 120);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      const s = settingsRef.current;
      const keys: Record<string, () => void> = {
        ArrowRight: () => step(1),
        ArrowLeft: () => step(-1),
        Home: () => goTo(0),
        End: () => goTo(s.count - 1),
      };
      if (!keys[event.key]) return;
      event.preventDefault();
      keys[event.key]();
    };

    const onEnter = () => {
      state.hovered = true;
    };

    const onLeave = () => {
      state.hovered = false;
      wake();
    };

    const onFocusIn = () => {
      try {
        state.focused = root.matches(":focus-visible") || Boolean(root.querySelector(":focus-visible"));
      } catch {
        state.focused = false;
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      if (root.contains(event.relatedTarget as Node | null)) return;
      state.focused = false;
      wake();
    };

    const onVisibility = () => {
      if (document.hidden) return;
      state.last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box) setWidth(Math.max(1, Math.round(box.width)));
    });
    resizeObserver.observe(stage);
    const visibility = new IntersectionObserver((entries) => {
      state.visible = entries.some((entry) => entry.isIntersecting);
      if (state.visible) wake();
    });
    visibility.observe(root);

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibility);

    engineRef.current = {
      goTo,
      step,
      sync: () => {
        const s = settingsRef.current;
        s.sign = document.documentElement.dir === "rtl" ? -1 : 1;
        if (!s.loop && s.count) {
          state.target = clamp(Math.round(state.target), 0, s.count - 1);
          state.p = clamp(state.p, -0.3, s.count - 0.7);
        }
        announce();
        apply();
        wake();
      },
    };
    engineRef.current.sync();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(state.wheelTimer);
      engineRef.current = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    settingsRef.current = settings;
    engineRef.current?.sync();
  });

  useEffect(() => {
    if (reportedRef.current === active) return;
    reportedRef.current = active;
    onChangeRef.current?.(active);
  }, [active]);

  useIsomorphicLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = active;
    const counter = counterRef.current;
    if (!counter?.animate || previous === active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const delta = loop && count > 1 ? nearest(active - previous, count) : active - previous;
    counter.animate(
      [
        { transform: `translateY(${delta > 0 ? 70 : -70}%)`, opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }, [active, count, loop]);

  const controls = count > 1 && (indicator !== "none" || arrows);
  const atStart = !settings.loop && active === 0;
  const atEnd = !settings.loop && active === count - 1;
  const perspective = mode === "cube" ? `${Math.round(cardWidth * 2.6)}px` : mode === "tilt" ? "1000px" : undefined;
  const mask = clipped ? edgeMask(inset) : undefined;

  const controlsNode = controls ? (
    <div className="carousel-controls" style={{ width: cardWidth }}>
      {arrows && (
        <button
          type="button"
          className="carousel-arrow"
          aria-label="اسلایدِ قبلی"
          disabled={atStart}
          onClick={() => engineRef.current?.step(-1)}
        >
          <Chevron flip />
        </button>
      )}

      {indicator === "dots" && (
        <div className="carousel-dots">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`carousel-dot${index === active ? " is-active" : ""}`}
              aria-label={`رفتن به اسلایدِ ${toFaDigits(index + 1)}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => engineRef.current?.goTo(index)}
            >
              <span className="carousel-dot-mark" />
            </button>
          ))}
        </div>
      )}

      {indicator === "bars" && (
        <div className="carousel-bars">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className="carousel-bar"
              aria-label={`رفتن به اسلایدِ ${toFaDigits(index + 1)}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => engineRef.current?.goTo(index)}
            >
              <span className="carousel-bar-track">
                <span
                  ref={(element) => {
                    fillRefs.current[index] = element;
                  }}
                  className="carousel-bar-fill"
                  style={{
                    transform: `scaleX(${index < active ? 1 : index === active && !settings.autoplay ? 1 : 0})`,
                  }}
                />
              </span>
            </button>
          ))}
        </div>
      )}

      {indicator === "counter" && (
        <div className="carousel-counter">
          <span ref={counterRef} className="carousel-counter-current">
            <PaddedDigits value={toFaDigits(String(active + 1).padStart(2, "0"))} />
          </span>
          <span>/</span>
          <span>
            <PaddedDigits value={toFaDigits(String(count).padStart(2, "0"))} />
          </span>
        </div>
      )}

      {arrows && (
        <button
          type="button"
          className="carousel-arrow"
          aria-label="اسلایدِ بعدی"
          disabled={atEnd}
          onClick={() => engineRef.current?.step(1)}
        >
          <Chevron />
        </button>
      )}
    </div>
  ) : null;
  const inside = frame && !round;

  return (
    <div
      ref={rootRef}
      className={`carousel-container${frame ? " has-frame" : ""}${round ? " is-round" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          ...(THEMES[theme] ?? THEMES.dark),
          "--carousel-radius": `${round ? 9999 : Math.max(0, radius)}px`,
          "--carousel-scale": clamp(cardWidth / 300, 0.86, 1),
          width: typeof maxWidth === "number" ? "100%" : maxWidth,
          maxWidth: typeof maxWidth === "number" ? maxWidth : undefined,
          ...style,
        } as CSSProperties
      }
      role="region"
      aria-roledescription="کاروسل"
      aria-label="کاروسل"
      tabIndex={0}
    >
      <div ref={stageRef} className="carousel-stage">
        <div
          ref={viewportRef}
          className="carousel-viewport"
          data-draggable={settings.draggable ? "true" : undefined}
          aria-live={settings.autoplay ? "off" : "polite"}
          style={{
            height: cardHeight,
            marginInline: bleed ? -bleed : undefined,
            perspective,
            overflowX: clipped ? "clip" : "visible",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        >
          {items.map((item, index) => {
            const initial = pose(index, active, settings);
            return (
              <div
                key={keyOf(item, index)}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                className="carousel-slide"
                style={
                  {
                    left: inset,
                    width: cardWidth,
                    height: cardHeight,
                    transform: initial.transform,
                    opacity: initial.opacity,
                    visibility: initial.visible ? "visible" : "hidden",
                    zIndex: initial.layer,
                    "--carousel-focus": initial.focus,
                  } as CSSProperties
                }
                data-current={index === active ? "true" : undefined}
                role="group"
                aria-roledescription="اسلاید"
                aria-label={`${toFaDigits(index + 1)} از ${toFaDigits(count)}`}
                onClick={() => {
                  if (index !== active) engineRef.current?.goTo(index);
                }}
              >
                <Card item={item} round={round} compact={round && cardWidth < 240} />
                {mode === "cube" && (
                  <span
                    ref={(element) => {
                      shadeRefs.current[index] = element;
                    }}
                    className="carousel-shade"
                    style={{ opacity: initial.shade }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {inside && controlsNode}
        {frame && <span className="carousel-frame-rim" />}
      </div>

      {!inside && controlsNode}
    </div>
  );
}

function CarouselDragGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12.102 8.41938L12.3133 11.1053L19.0713 4.49715C19.7413 3.84209 20.8275 3.84209 21.4973 4.49715C22.1673 5.1522 22.1673 6.21426 21.4973 6.8693L17.8584 10.4276L19.5984 12.7763C20.7346 14.2795 21.3028 15.0311 21.4915 15.7673C21.8034 16.9832 21.667 18.2183 20.6457 19.2171C19.9342 19.9126 19.281 20.2075 17.5712 21.0434C16.4863 21.5738 15.9438 21.8391 15.4006 21.9377C14.5063 22.1002 13.5819 21.9535 12.786 21.5228C12.3026 21.2613 11.8738 20.842 11.016 20.0032L10.289 19.2923C9.14863 18.1773 8.57847 17.6198 8.28011 16.9189C8.22661 16.7932 8.17999 16.6648 8.14045 16.5342C7.91998 15.8063 8.00296 15.022 8.16889 13.4535L8.7061 8.3757C8.78866 7.59541 9.41637 6.97695 10.2137 6.89032C11.1721 6.7862 12.028 7.47929 12.102 8.41938Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9.06903 3.52615C9.06903 4.3701 9.7281 5.05425 10.5411 5.05425C11.3541 5.05425 12.0132 4.3701 12.0132 3.52615C12.0132 2.6822 11.3541 1.99805 10.5411 1.99805C9.7281 1.99805 9.06903 2.6822 9.06903 3.52615ZM9.06903 3.52615H8.41758L7.63791 3.59909M3.5102 9.0061C4.35702 8.99222 5.00174 9.65386 5.01515 10.473C5.02856 11.2922 4.39838 11.9972 3.55156 12.0111C2.70474 12.025 2.01458 11.3337 2.00117 10.5145C1.98776 9.6953 2.66338 9.01997 3.5102 9.0061ZM3.5102 9.0061L3.6009 7.66037M5.31608 4.67383L4.98443 4.98365L4.69136 5.29936" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CarouselTimerGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 2H10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M4 13.5C4 8.80558 7.80558 5 12.5 5C14.8472 5 16.9722 5.95139 18.5104 7.48959M18.5104 7.48959C20.0486 9.02779 21 11.1528 21 13.5C21 18.1944 17.1944 22 12.5 22H3M18.5104 7.48959L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8 19H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6 16H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M12.5 13.5L16 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CarouselLayersGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.64298 3.14559L6.93816 3.93362C4.31272 5.14719 3 5.75397 3 6.75C3 7.74603 4.31272 8.35281 6.93817 9.56638L8.64298 10.3544C10.2952 11.1181 11.1214 11.5 12 11.5C12.8786 11.5 13.7048 11.1181 15.357 10.3544L17.0618 9.56638C19.6873 8.35281 21 7.74603 21 6.75C21 5.75397 19.6873 5.14719 17.0618 3.93362L15.357 3.14559C13.7048 2.38186 12.8786 2 12 2C11.1214 2 10.2952 2.38186 8.64298 3.14559Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M20.788 11.0972C20.9293 11.2959 21 11.5031 21 11.7309C21 12.7127 19.6873 13.3109 17.0618 14.5072L15.357 15.284C13.7048 16.0368 12.8786 16.4133 12 16.4133C11.1214 16.4133 10.2952 16.0368 8.64298 15.284L6.93817 14.5072C4.31272 13.3109 3 12.7127 3 11.7309C3 11.5031 3.07067 11.2959 3.212 11.0972" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M20.3767 16.2661C20.7922 16.5971 21 16.927 21 17.3176C21 18.2995 19.6873 18.8976 17.0618 20.0939L15.357 20.8707C13.7048 21.6236 12.8786 22 12 22C11.1214 22 10.2952 21.6236 8.64298 20.8707L6.93817 20.0939C4.31272 18.8976 3 18.2995 3 17.3176C3 16.927 3.20778 16.5971 3.62334 16.2661" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CarouselCommandGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 9V15H9V9H15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18V15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 15.002H6C4.34315 15.002 3 16.3451 3 18.002C3 19.6588 4.34315 21.002 6 21.002C7.65685 21.002 9 19.6588 9 18.002V15.002Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15 9L15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 9V6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H9Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CarouselImageGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CarouselArrowLeftGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CarouselArrowRightGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
