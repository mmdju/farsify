"use client";

import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";

import "./elastic-slider.css";

export interface ElasticSliderHandle {
  bump: (side: -1 | 1) => void;
}

export interface ElasticSliderProps {
  value?: number;
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  isStepped?: boolean;
  stepSize?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  iconPlacement?: "outside" | "inside";
  valuePosition?: "top" | "bubble" | "inside" | "none";
  formatValue?: (value: number) => string;
  ticks?: boolean | number[];
  thumb?: boolean;
  fillFrom?: number;
  thickness?: number;
  activeThickness?: number;
  radius?: number;
  restOpacity?: number;
  growOnHover?: boolean;
  maxStretch?: number;
  bounce?: number;
  jumpToClick?: boolean;
  wheel?: boolean;
  trackColor?: string;
  rangeColor?: string;
  iconColor?: string;
  contentColor?: string;
  fillContentColor?: string;
  thumbColor?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  dir?: "ltr" | "rtl";
  ref?: Ref<ElasticSliderHandle>;
}

interface Motion {
  p: number;
  vp: number;
  target: number;
  s: number;
  vs: number;
  side: number;
  held: boolean;
  a: number;
  va: number;
  goal: number;
  length: number;
  dragging: boolean;
  hovered: boolean;
  focused: boolean;
  raf: number;
  last: number;
  ready: boolean;
}

interface Drag {
  id: number;
  origin: number;
  from: number | null;
}

const ROOT = "elastic-slider";
const VALUE = "elastic-slider__value";
const BODY = "elastic-slider__body";
const ICON = "elastic-slider__icon";
const ICON_INNER = "elastic-slider__icon-inner";
const HIT = "elastic-slider__hit";
const TRACK = "elastic-slider__track";
const RANGE = "elastic-slider__range";
const CONTENT = "elastic-slider__content";
const FILL_CONTENT = "elastic-slider__content elastic-slider__content--fill";
const TICK = "elastic-slider__tick";
const FILL_TICK = "elastic-slider__tick elastic-slider__tick--fill";
const THUMB = "elastic-slider__thumb";
const BUBBLE = "elastic-slider__bubble";
const BUBBLE_TEXT = "elastic-slider__bubble-text";

const TAU = Math.PI * 2;
const VALUE_POSITIONS = ["top", "bubble", "inside", "none"];
const DARK_INK = "#18181b";
const LIGHT_INK = "#fafafa";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const decimalsOf = (step: number) => {
  const text = String(step);
  return text.includes(".") ? text.split(".")[1].length : 0;
};

const rubber = (distance: number, limit: number) =>
  limit > 0
    ? 2 * (1 / (1 + Math.exp(-distance / limit)) - 0.5) * limit
    : 0;

let reduceQuery: MediaQueryList | null = null;
const prefersReduced = () => {
  if (typeof window === "undefined") return false;
  reduceQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return reduceQuery.matches;
};

const FA_INT = new Intl.NumberFormat("fa-IR");

const faFixed = (value: number, decimals: number) =>
  new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

let probe: CanvasRenderingContext2D | null = null;

const readColor = (text: string): number[] | null => {
  const match = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(
    text,
  );
  if (match)
    return [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      match[4] === undefined ? 1 : Number(match[4]),
    ];
  if (typeof document === "undefined") return null;
  if (!probe) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!probe) return null;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000000";
  probe.fillStyle = text;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
};

type IconProps = { size?: number; strokeWidth?: number };

const IconFrame = ({
  size = 20,
  strokeWidth = 1.75,
  children,
}: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const VolumeLowIcon = (props: IconProps) => (
  <IconFrame {...props}>
    <path d="M19 9C19.6254 9.81968 20 10.8634 20 12C20 13.1366 19.6254 14.1803 19 15" />
    <path d="M16 14.8135V9.18646C16 6.04126 16 4.46866 15.0747 4.0773C14.1494 3.68593 13.0604 4.79793 10.8823 7.02192C9.7544 8.17365 9.11086 8.42869 7.50605 8.42869C6.10259 8.42869 5.40086 8.42869 4.89677 8.77262C3.85036 9.48655 4.00854 10.882 4.00854 12C4.00854 13.118 3.85036 14.5134 4.89677 15.2274C5.40086 15.5713 6.10259 15.5713 7.50605 15.5713C9.11086 15.5713 9.7544 15.8264 10.8823 16.9781C13.0604 19.2021 14.1494 20.3141 15.0747 19.9227C16 19.5313 16 17.9587 16 14.8135Z" />
  </IconFrame>
);

const VolumeHighIcon = (props: IconProps) => (
  <IconFrame {...props}>
    <path d="M14 14.8135V9.18646C14 6.04126 14 4.46866 13.0747 4.0773C12.1494 3.68593 11.0603 4.79793 8.88232 7.02192C7.75439 8.17365 7.11085 8.42869 5.50604 8.42869C4.10257 8.42869 3.40084 8.42869 2.89675 8.77262C1.85035 9.48655 2.00852 10.882 2.00852 12C2.00852 13.118 1.85035 14.5134 2.89675 15.2274C3.40084 15.5713 4.10257 15.5713 5.50604 15.5713C7.11085 15.5713 7.75439 15.8264 8.88232 16.9781C11.0603 19.2021 12.1494 20.3141 13.0747 19.9227C14 19.5313 14 17.9587 14 14.8135Z" />
    <path d="M17 9C17.6254 9.81968 18 10.8634 18 12C18 13.1366 17.6254 14.1803 17 15" />
    <path d="M20 7C21.2508 8.36613 22 10.1057 22 12C22 13.8943 21.2508 15.6339 20 17" />
  </IconFrame>
);

function ElasticSlider({
  value,
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  isStepped = false,
  stepSize = 1,
  onChange,
  onChangeEnd,
  orientation = "horizontal",
  startIcon,
  endIcon,
  iconPlacement = "outside",
  valuePosition = "top",
  formatValue,
  ticks = false,
  thumb = false,
  fillFrom,
  thickness = 6,
  activeThickness = 12,
  radius,
  restOpacity = 0.7,
  growOnHover = true,
  maxStretch = 50,
  bounce = 0.5,
  jumpToClick = true,
  wheel = false,
  trackColor = "color-mix(in srgb, currentColor 18%, transparent)",
  rangeColor = "currentColor",
  iconColor = "currentColor",
  contentColor = "currentColor",
  fillContentColor = "auto",
  thumbColor = "#ffffff",
  disabled = false,
  ariaLabel = "لغزنده",
  className = "",
  style,
  dir,
  ref,
}: ElasticSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const startIconRef = useRef<HTMLSpanElement>(null);
  const endIconRef = useRef<HTMLSpanElement>(null);
  const rtlRef = useRef(false);
  const [rtl, setRtl] = useState(false);
  const motion = useRef<Motion>({
    p: 0,
    vp: 0,
    target: 0,
    s: 0,
    vs: 0,
    side: 1,
    held: false,
    a: 0,
    va: 0,
    goal: 0,
    length: 0,
    dragging: false,
    hovered: false,
    focused: false,
    raf: 0,
    last: 0,
    ready: false,
  });
  const drag = useRef<Drag | null>(null);

  const lo = Math.min(startingValue, maxValue);
  const hi = Math.max(startingValue, maxValue);
  const span = hi - lo || 1;
  const step = isStepped && stepSize > 0 ? stepSize : 0;
  const vertical = orientation === "vertical";
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const current = clamp(controlled ? value : inner, lo, hi);
  const currentRef = useRef(current);

  const settings = {
    lo,
    hi,
    span,
    step,
    vertical,
    origin: clamp(((fillFrom ?? lo) - lo) / span, 0, 1),
    thickness: Math.max(1, thickness),
    activeThickness: Math.max(1, activeThickness),
    radius,
    restOpacity: clamp(restOpacity, 0, 1),
    growOnHover,
    maxStretch: Math.max(0, maxStretch),
    bounce: clamp(bounce, 0, 0.95),
    jumpToClick,
    controlled,
    onChange,
    onChangeEnd,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const snap = (raw: number) => {
    const s = settingsRef.current;
    let next = clamp(raw, s.lo, s.hi);
    if (s.step)
      next = clamp(
        s.lo + Math.round((next - s.lo) / s.step) * s.step,
        s.lo,
        s.hi,
      );
    return Number(next.toFixed(10));
  };

  const paint = () => {
    const m = motion.current;
    const s = settingsRef.current;
    const track = trackRef.current;
    const range = rangeRef.current;
    if (!track || !range) return;

    const thick = s.thickness + (s.activeThickness - s.thickness) * m.a;
    track.style.width = s.vertical ? `${thick.toFixed(2)}px` : "";
    track.style.height = s.vertical ? "" : `${thick.toFixed(2)}px`;
    track.style.setProperty(
      "--elastic-slider-reveal",
      clamp((thick - 14) / 10, 0, 1).toFixed(3),
    );

    const length = Math.max(1, m.length);
    const along = 1 + m.s / length;
    const across =
      1 - 0.22 * clamp(m.s / Math.max(1, s.maxStretch), -1, 1);
    const rtl = rtlRef.current && !s.vertical;
    const p = rtl ? 1 - clamp(m.p, 0, 1) : clamp(m.p, 0, 1);
    const origin = rtl ? 1 - s.origin : s.origin;
    const side = rtl ? -m.side : m.side;
    const atEnd = side > 0;

    track.style.transformOrigin = s.vertical
      ? m.side > 0
        ? "50% 100%"
        : "50% 0%"
      : m.side > 0
        ? rtl
          ? "100% 50%"
          : "0% 50%"
        : rtl
          ? "0% 50%"
          : "100% 50%";
    const scaleX = s.vertical ? across : along;
    const scaleY = s.vertical ? along : across;
    track.style.transform = `scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
    track.style.setProperty(
      "--elastic-slider-unscale",
      `scale(${(1 / scaleX).toFixed(4)}, ${(1 / scaleY).toFixed(4)})`,
    );

    const from = (Math.min(origin, p) * 100).toFixed(3);
    const to = ((1 - Math.max(origin, p)) * 100).toFixed(3);
    const round = (s.radius ?? thick / 2).toFixed(2);
    range.style.clipPath = s.vertical
      ? `inset(${to}% 0 ${from}% 0 round ${round}px)`
      : `inset(0 ${to}% 0 ${from}% round ${round}px)`;

    const position = atEnd
      ? p * length * along
      : length - (1 - p) * length * along;
    const shift = s.vertical
      ? `translate3d(0, ${(-position).toFixed(2)}px, 0)`
      : `translate3d(${position.toFixed(2)}px, 0, 0)`;
    if (thumbRef.current)
      thumbRef.current.style.transform = `${shift} scale(${(1 + 0.12 * m.a).toFixed(3)})`;
    if (bubbleRef.current) {
      const center = s.vertical
        ? "translate(0, 50%)"
        : "translate(-50%, 0)";
      bubbleRef.current.style.transform = `${shift} ${center} scale(${(0.7 + 0.3 * m.a).toFixed(3)})`;
      bubbleRef.current.style.opacity = clamp(
        m.a * 1.4 - 0.2,
        0,
        1,
      ).toFixed(3);
    }

    const startShift = m.side < 0 ? m.s : 0;
    const endShift = m.side > 0 ? m.s : 0;
    const firstShift = s.vertical ? startShift : rtl ? startShift : -startShift;
    const secondShift = s.vertical ? -endShift : rtl ? -endShift : endShift;
    const iconScale = (1 + 0.08 * m.a).toFixed(3);
    const startIconEl = startIconRef.current;
    const endIconEl = endIconRef.current;
    if (startIconEl) {
      startIconEl.style.transform = s.vertical
        ? `translate3d(0, ${firstShift.toFixed(2)}px, 0) scale(${iconScale})`
        : `translate3d(${firstShift.toFixed(2)}px, 0, 0) scale(${iconScale})`;
    }
    if (endIconEl) {
      endIconEl.style.transform = s.vertical
        ? `translate3d(0, ${secondShift.toFixed(2)}px, 0) scale(${iconScale})`
        : `translate3d(${secondShift.toFixed(2)}px, 0, 0) scale(${iconScale})`;
    }
    if (bodyRef.current) {
      bodyRef.current.style.opacity =
        s.restOpacity < 1
          ? (s.restOpacity + (1 - s.restOpacity) * m.a).toFixed(3)
          : "";
    }
  };

  const frame = (now: number) => {
    const m = motion.current;
    m.raf = 0;
    const s = settingsRef.current;
    const elapsed = clamp((now - m.last) / 1000, 0, 1 / 20);
    m.last = now;
    if (prefersReduced()) {
      m.p = m.target;
      m.vp = 0;
      if (!m.held) {
        m.s = 0;
        m.vs = 0;
      }
      m.a = m.goal;
      m.va = 0;
    } else {
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)));
      const dt = elapsed / steps;
      const fillOmega = TAU / (m.dragging ? 0.09 : 0.3);
      const fillZeta = m.dragging ? 1 : 0.86;
      const stretchOmega = TAU / 0.42;
      const stretchZeta = 1 - 0.9 * s.bounce;
      const activeOmega = TAU / 0.32;
      for (let i = 0; i < steps; i++) {
        m.vp +=
          (-fillOmega * fillOmega * (m.p - m.target) -
            2 * fillZeta * fillOmega * m.vp) *
          dt;
        m.p += m.vp * dt;
        if (!m.held) {
          m.vs +=
            (-stretchOmega * stretchOmega * m.s -
              2 * stretchZeta * stretchOmega * m.vs) *
            dt;
          m.s += m.vs * dt;
        }
        m.va +=
          (-activeOmega * activeOmega * (m.a - m.goal) -
            2 * 0.9 * activeOmega * m.va) *
          dt;
        m.a += m.va * dt;
      }
    }
    const settled =
      Math.abs(m.p - m.target) < 0.0004 &&
      Math.abs(m.vp) < 0.002 &&
      (m.held || (Math.abs(m.s) < 0.05 && Math.abs(m.vs) < 0.5)) &&
      Math.abs(m.a - m.goal) < 0.002 &&
      Math.abs(m.va) < 0.005;
    if (settled) {
      m.p = m.target;
      m.vp = 0;
      m.a = m.goal;
      m.va = 0;
      if (!m.held) {
        m.s = 0;
        m.vs = 0;
      }
    }
    paint();
    if (!settled || m.dragging) m.raf = requestAnimationFrame(frame);
  };

  const kick = () => {
    const m = motion.current;
    if (m.raf || typeof window === "undefined") return;
    m.last = performance.now();
    m.raf = requestAnimationFrame(frame);
  };

  const autoInk = () => {
    const root = rootRef.current;
    const range = rangeRef.current;
    if (!root || !range || fillContentColor !== "auto") return;
    const color = readColor(getComputedStyle(range).backgroundColor);
    const ink =
      !color || color[3] < 0.5
        ? "var(--elastic-slider-content)"
        : (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255 >
            0.55
          ? DARK_INK
          : LIGHT_INK;
    root.style.setProperty("--elastic-slider-fill-content", ink);
  };

  const refreshGoal = () => {
    const m = motion.current;
    m.goal =
      (m.hovered && settingsRef.current.growOnHover) ||
      m.dragging ||
      m.focused
        ? 1
        : 0;
    kick();
  };

  const pulse = (side: number) => {
    const icon = (side > 0 ? endIconRef : startIconRef).current
      ?.firstElementChild;
    if (!icon || prefersReduced()) return;
    icon.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.35)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    );
  };

  const bump = (side: number) => {
    const m = motion.current;
    const s = settingsRef.current;
    if (
      !s.maxStretch ||
      m.held ||
      Math.abs(m.vs) > 40 ||
      Math.abs(m.s) > 2
    )
      return;
    m.side = side;
    m.vs = s.maxStretch * 5.5;
    pulse(side);
    kick();
  };

  const commit = (next: number) => {
    const s = settingsRef.current;
    motion.current.target = (next - s.lo) / s.span;
    kick();
    if (next === currentRef.current) return;
    currentRef.current = next;
    if (!s.controlled) setInner(next);
    s.onChange?.(next);
  };

  const snapRef = useRef(snap);
  snapRef.current = snap;
  const bumpRef = useRef(bump);
  bumpRef.current = bump;
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const goalRef = useRef(refreshGoal);
  goalRef.current = refreshGoal;

  useImperativeHandle(ref, () => ({ bump: (side: -1 | 1) => bumpRef.current(side) }), []);

  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const next = dir ? dir === "rtl" : getComputedStyle(el).direction === "rtl";
    rtlRef.current = next;
    if (next !== rtl) setRtl(next);
  });

  useIsoLayoutEffect(() => {
    const m = motion.current;
    currentRef.current = current;
    const fraction = (current - lo) / span;
    if (!m.dragging) m.target = fraction;
    if (!m.ready) {
      m.ready = true;
      m.p = fraction;
      paint();
      return;
    }
    kick();
  }, [current, lo, span]);

  useIsoLayoutEffect(() => {
    const hit = hitRef.current;
    if (!hit) return undefined;
    const measure = () => {
      motion.current.length = settingsRef.current.vertical
        ? hit.clientHeight
        : hit.clientWidth;
      paint();
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(hit);
    return () => observer.disconnect();
  }, [vertical]);

  useIsoLayoutEffect(() => {
    autoInk();
    paint();
  });

  useEffect(() => {
    goalRef.current();
  }, [growOnHover]);

  useEffect(() => {
    const hit = hitRef.current;
    if (!hit || !wheel || disabled) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const s = settingsRef.current;
      const useY = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      const horizontal = rtlRef.current && !s.vertical ? -event.deltaX : event.deltaX;
      const delta = useY ? -event.deltaY : horizontal;
      if (!delta) return;
      const amount = s.step
        ? Math.sign(delta) * s.step
        : (delta * s.span) / 800;
      const next = snapRef.current(currentRef.current + amount);
      if (next === currentRef.current) {
        bumpRef.current(Math.sign(delta));
        return;
      }
      commitRef.current(next);
      clearTimeout(timer);
      timer = setTimeout(
        () => settingsRef.current.onChangeEnd?.(currentRef.current),
        200,
      );
    };
    hit.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(timer);
      hit.removeEventListener("wheel", onWheel);
    };
  }, [wheel, disabled]);

  useEffect(() => {
    const m = motion.current;
    return () => {
      cancelAnimationFrame(m.raf);
      m.raf = 0;
    };
  }, []);

  const along = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = hitRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    if (settingsRef.current.vertical) return rect.bottom - event.clientY;
    return rtlRef.current
      ? rect.right - event.clientX
      : event.clientX - rect.left;
  };

  const follow = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const m = motion.current;
    const s = settingsRef.current;
    const length = Math.max(1, m.length);
    const position = along(event);
    const fraction =
      d.from === null ? position / length : d.from + (position - d.origin) / length;
    const over =
      fraction < 0
        ? -fraction * length
        : fraction > 1
          ? (fraction - 1) * length
          : 0;
    if (over > 0 && s.maxStretch > 0) {
      const side = fraction < 0 ? -1 : 1;
      if (!m.held || m.side !== side) pulse(side);
      m.held = true;
      m.side = side;
      m.s = rubber(over, s.maxStretch);
      m.vs = 0;
    } else if (m.held) {
      m.held = false;
    }
    commit(snap(s.lo + clamp(fraction, 0, 1) * s.span));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = hitRef.current;
    if (disabled || event.button !== 0 || !hit) return;
    hit.setPointerCapture(event.pointerId);
    const m = motion.current;
    const s = settingsRef.current;
    drag.current = {
      id: event.pointerId,
      origin: along(event),
      from: s.jumpToClick ? null : m.target,
    };
    m.dragging = true;
    hit.setAttribute("data-dragging", "");
    refreshGoal();
    if (s.jumpToClick)
      commit(
        snap(
          s.lo +
            clamp(along(event) / Math.max(1, m.length), 0, 1) * s.span,
        ),
      );
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    follow(event);
  };

  const release = () => {
    if (!drag.current) return;
    const m = motion.current;
    drag.current = null;
    m.dragging = false;
    m.held = false;
    hitRef.current?.removeAttribute("data-dragging");
    refreshGoal();
    settingsRef.current.onChangeEnd?.(currentRef.current);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const s = settingsRef.current;
    const unit = s.step || s.span / 100;
    const large = Math.max(unit, s.span / 10);
    const now = currentRef.current;
    const mirror = rtlRef.current && !s.vertical;
    const forward = mirror ? "ArrowLeft" : "ArrowRight";
    const back = mirror ? "ArrowRight" : "ArrowLeft";
    const keys: Record<string, number> = {
      [forward]: now + unit,
      ArrowUp: now + unit,
      [back]: now - unit,
      ArrowDown: now - unit,
      PageUp: now + large,
      PageDown: now - large,
      Home: s.lo,
      End: s.hi,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const wanted = keys[event.key];
    const next = snap(wanted);
    if (next === now) {
      if (wanted !== now) bump(wanted > now ? 1 : -1);
      return;
    }
    commit(next);
    s.onChangeEnd?.(next);
  };

  const label = formatValue
    ? formatValue(current)
    : step
      ? faFixed(current, decimalsOf(step))
      : FA_INT.format(Math.round(current));
  const place = VALUE_POSITIONS.includes(valuePosition)
    ? valuePosition
    : "top";
  const inside = iconPlacement === "inside";
  const startNode =
    startIcon === undefined ? (
      <VolumeLowIcon size={20} strokeWidth={1.75} />
    ) : (
      startIcon
    );
  const endNode =
    endIcon === undefined ? (
      <VolumeHighIcon size={20} strokeWidth={1.75} />
    ) : (
      endIcon
    );
  const insideStart = inside ? startNode : null;
  const insideEnd =
    place === "inside" ? <span>{label}</span> : inside ? endNode : null;
  const count = step ? Math.round((hi - lo) / step) : 0;
  const tickValues = Array.isArray(ticks)
    ? ticks
    : ticks
      ? count > 0 && count <= 40
        ? Array.from({ length: count + 1 }, (_, index) => lo + index * step)
        : Array.from({ length: 11 }, (_, index) => lo + (index / 10) * (hi - lo))
      : [];
  const marks = tickValues
    .map((tick) => (tick - lo) / span)
    .filter((fraction) => fraction > 0.001 && fraction < 0.999);
  const marksFor = (name: string) =>
    marks.map((fraction) => (
      <span
        key={fraction}
        className={name}
        style={
          vertical
            ? { bottom: `${fraction * 100}%` }
            : {
                left: `${(rtl ? 1 - fraction : fraction) * 100}%`,
              }
        }
      />
    ));
  const contentFor = (name: string) =>
    insideStart || insideEnd ? (
      <span className={name}>
        <span>{insideStart}</span>
        <span>{insideEnd}</span>
      </span>
    ) : null;
  const thumbSize = clamp(activeThickness + 6, 16, 28);

  return (
    <div
      ref={rootRef}
      className={[ROOT, className].filter(Boolean).join(" ")}
      style={
        {
          "--elastic-slider-track": trackColor,
          "--elastic-slider-range": rangeColor,
          "--elastic-slider-icon": iconColor,
          "--elastic-slider-content": contentColor,
          ...(fillContentColor !== "auto"
            ? { "--elastic-slider-fill-content": fillContentColor }
            : {}),
          "--elastic-slider-thumb": thumbColor,
          "--elastic-slider-thumb-size": `${thumbSize}px`,
          "--elastic-slider-hit": `${Math.max(34, thickness, activeThickness)}px`,
          "--elastic-slider-pad": `${Math.max(8, Math.round(thickness * 0.32))}px`,
          "--elastic-slider-bubble-offset": `${
            (thumb ? thumbSize * 1.12 : activeThickness) / 2 + 8
          }px`,
          ...(radius !== undefined
            ? { "--elastic-slider-radius": `${radius}px` }
            : {}),
          ...style,
        } as CSSProperties
      }
      data-orientation={vertical ? "vertical" : "horizontal"}
      data-direction={rtl ? "rtl" : "ltr"}
      data-disabled={disabled ? "" : undefined}
      onPointerEnter={() => {
        motion.current.hovered = true;
        autoInk();
        refreshGoal();
      }}
      onPointerLeave={() => {
        motion.current.hovered = false;
        refreshGoal();
      }}
    >
      {place === "top" && (
        <span className={VALUE} aria-hidden="true">
          {label}
        </span>
      )}
      <div className={BODY} ref={bodyRef}>
        {!inside && startNode && (
          <span className={ICON} ref={startIconRef} aria-hidden="true">
            <span className={ICON_INNER}>{startNode}</span>
          </span>
        )}
        <div
          ref={hitRef}
          className={HIT}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuemin={lo}
          aria-valuemax={hi}
          aria-valuenow={current}
          aria-valuetext={label}
          aria-orientation={vertical ? "vertical" : "horizontal"}
          aria-disabled={disabled || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onKeyDown={onKeyDown}
          onFocus={(event) => {
            motion.current.focused = event.currentTarget.matches(":focus-visible");
            refreshGoal();
          }}
          onBlur={() => {
            motion.current.focused = false;
            refreshGoal();
          }}
        >
          <div className={TRACK} ref={trackRef}>
            {marksFor(TICK)}
            {contentFor(CONTENT)}
            <div className={RANGE} ref={rangeRef}>
              {marksFor(FILL_TICK)}
              {contentFor(FILL_CONTENT)}
            </div>
          </div>
          {thumb && (
            <span className={THUMB} ref={thumbRef} aria-hidden="true" />
          )}
          {place === "bubble" && (
            <span className={BUBBLE} ref={bubbleRef} aria-hidden="true">
              <span className={BUBBLE_TEXT}>{label}</span>
            </span>
          )}
        </div>
        {!inside && endNode && (
          <span className={ICON} ref={endIconRef} aria-hidden="true">
            <span className={ICON_INNER}>{endNode}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default ElasticSlider;
export { VolumeLowIcon, VolumeHighIcon };
