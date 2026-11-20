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
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

export type PackageSlip = {
  title?: string;
  subtitle?: string;
  reference?: string;
  date?: string;
  recipient?: string;
  address?: string;
  items?: { name: string; qty?: number; price?: string }[];
  total?: string;
  stamp?: string;
  eyebrow?: string;
};

export type PackageBoxColors = {
  box?: string;
  tape?: string;
  paper?: string;
  ink?: string;
  accent?: string;
};

export type PackageBoxProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  slip?: PackageSlip;
  maxWidth?: number;
  maxHeight?: number;
  colors?: PackageBoxColors;
  label?: ReactNode | false;
  symbols?: ReactNode | false;
  tape?: boolean;
  hint?: boolean;
  openLabel?: string;
  closeLabel?: string;
  reserveSpace?: boolean;
  className?: string;
  paperClassName?: string;
};

const S = 200;
const H2 = S / 2;
const PAPER_W = 240;
const PAPER_H = 340;
const PAPER_S0 = 0.54;
const TAPE_W = 46;

const STAGE_W = 440;
const H_CLOSED = 392;
const H_OPEN = 650;
const BOX_CENTER_FROM_BOTTOM = 197;

const TILT = -30;
const TURN = -45;
const MAJOR_OPEN = -238;
const MINOR_OPEN = -212;
const FORWARD_DIST = 56;

const OPEN_SECONDS = 2.4;
const CLOSE_SECONDS = 1.5;

const rad = (d: number) => (d * Math.PI) / 180;

type V3 = [number, number, number];
const rotX = ([x, y, z]: V3, a: number): V3 => [
  x,
  y * Math.cos(a) - z * Math.sin(a),
  y * Math.sin(a) + z * Math.cos(a),
];
const rotY = ([x, y, z]: V3, a: number): V3 => [
  x * Math.cos(a) + z * Math.sin(a),
  y,
  -x * Math.sin(a) + z * Math.cos(a),
];
const FORWARD = rotY(rotX([0, 0, 1], rad(-TILT)), rad(-TURN));

const EASE_FLAP = cubicBezier(0.34, 1.1, 0.5, 1);
const EASE_RISE = cubicBezier(0.22, 0.8, 0.2, 1);
const EASE_SHOW = cubicBezier(0.3, 0.9, 0.3, 1);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function paperPose(r: number, s: number) {
  const scale = PAPER_S0 + (1 - PAPER_S0) * s;
  const bottom = 96 - 208 * r - 14 * s;
  const cy = bottom - (PAPER_H * scale) / 2;
  const d = FORWARD_DIST * s;
  return `translate3d(${(FORWARD[0] * d).toFixed(2)}px, ${(cy + FORWARD[1] * d).toFixed(2)}px, ${(FORWARD[2] * d).toFixed(2)}px) rotateY(${(-TURN * s).toFixed(2)}deg) rotateX(${(-TILT * s).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3 0 0 0 0 .17 0 0 0 0 .06 0 0 0 .5 -.1'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const mix = (a: string, b: string, pct: number) =>
  `color-mix(in srgb, ${a}, ${b} ${pct}%)`;
const BOX = "var(--pb-box)";
const INK = "var(--pb-ink)";
const PAPER = "var(--pb-paper)";

const FACE = {
  left: `${GRAIN}, linear-gradient(165deg, ${mix(BOX, "white", 6)}, ${mix(BOX, "black", 7)})`,
  right: `${GRAIN}, linear-gradient(165deg, ${mix(BOX, "black", 26)}, ${mix(BOX, "black", 36)})`,
  top: `${GRAIN}, linear-gradient(135deg, ${mix(BOX, "white", 14)}, ${mix(BOX, "white", 3)})`,
  inside: `linear-gradient(180deg, ${mix(BOX, "black", 42)} 0%, ${mix(BOX, "black", 72)} 100%)`,
  underside: `linear-gradient(180deg, ${mix(BOX, "black", 36)}, ${mix(BOX, "black", 50)})`,
  floor: mix(BOX, "black", 80),
};

const fill: CSSProperties = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  pointerEvents: "auto",
};

function Sticker() {
  const bar = mix(INK, PAPER, 18);
  const heavy = mix(INK, PAPER, 8);
  return (
    <div
      className="h-full w-full rounded-[2px] p-[5%]"
      style={{
        background: PAPER,
        boxShadow: "0 1px 2px rgba(40,20,5,0.35)",
      }}
      aria-hidden
    >
      <div className="h-[8%] w-[70%] rounded-[1px]" style={{ background: heavy }} />
      <div className="mt-[7%] flex h-[52%] gap-[8%]">
        <div
          className="w-[46%]"
          style={{
            background: `repeating-linear-gradient(90deg, ${heavy} 0 1px, transparent 1px 2px, ${heavy} 2px 4px, transparent 4px 5px)`,
          }}
        />
        <div className="flex flex-1 flex-col justify-between py-[3%]">
          <span className="block h-[10%] w-full rounded-[1px]" style={{ background: bar }} />
          <span className="block h-[10%] w-[80%] rounded-[1px]" style={{ background: bar }} />
          <span className="block h-[10%] w-full rounded-[1px]" style={{ background: bar }} />
          <span className="block h-[10%] w-[60%] rounded-[1px]" style={{ background: bar }} />
        </div>
      </div>
      <div className="mt-[6%] h-[14%] w-full rounded-[1px]" style={{ background: bar }} />
    </div>
  );
}

function Symbols() {
  const ink = mix(BOX, "#24130a", 72);
  return (
    <svg
      viewBox="0 0 100 64"
      className="h-full w-full"
      aria-hidden
      style={{ color: ink, opacity: 0.85 }}
    >
      <path d="M8 6h38c0 15-8 23-19 23S8 21 8 6Z" fill="currentColor" />
      <path
        d="M17 6l5 8-6 5 6 6"
        fill="none"
        stroke={mix(BOX, "black", 26)}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M27 29v22M15 53h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <g fill="currentColor">
        <rect x="66" y="22" width="5" height="28" rx="1" />
        <path d="M68.5 8l8 15h-16Z" />
        <rect x="84" y="22" width="5" height="28" rx="1" />
        <path d="M86.5 8l8 15h-16Z" />
      </g>
      <path d="M62 56h36" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

const DEFAULT_SLIP: Required<PackageSlip> = {
  eyebrow: "برگهٔ بسته‌بندی",
  title: "سفارشت بسته شد.",
  subtitle: "بسته آماده است و به‌زودی راه می‌افتد.",
  reference: "شمارهٔ ۱۰۲۴",
  date: "۱۵ آبان ۱۴۰۵",
  recipient: "نامِ گیرنده",
  address: "نشانیِ تحویل",
  items: [
    { name: "کالای نخست", qty: 1, price: "۱۹۰٬۰۰۰" },
    { name: "کالای دوم", qty: 2, price: "۱۲۰٬۰۰۰" },
  ],
  total: "۴۳۰٬۰۰۰ تومان",
  stamp: "بسته شد",
};

function Slip({ data }: { data: Required<PackageSlip> }) {
  const soft: CSSProperties = {
    color: `color-mix(in srgb, ${INK} 58%, ${PAPER})`,
  };
  const hairline = `color-mix(in srgb, ${INK} 16%, ${PAPER})`;
  const rule = <div className="my-2 border-t" style={{ borderColor: hairline }} />;

  return (
    <div className="flex h-full flex-col px-5 pb-4 pt-5">
      <div className="flex items-center justify-between gap-3 text-[8px] leading-[1.4] font-medium" style={soft}>
        <span className="min-w-0 truncate">{data.eyebrow}</span>
        <span className="shrink-0 tabular-fa">{data.reference}</span>
      </div>

      <h3 className="mt-3 text-[18px] leading-[1.35] font-semibold">{data.title}</h3>
      <p className="mt-1 text-[10px] leading-[1.6]" style={soft}>
        {data.subtitle}
      </p>

      {rule}

      <div className="grid grid-cols-[1fr_auto] gap-x-4 text-[10px] leading-[1.55]">
        <div className="min-w-0">
          <p style={soft}>تحویل به</p>
          <p className="mt-0.5 font-medium">{data.recipient}</p>
          <p className="truncate" style={soft}>
            {data.address}
          </p>
        </div>
        <div className="text-end">
          <p style={soft}>تاریخ</p>
          <p className="mt-0.5 font-medium tabular-fa">{data.date}</p>
        </div>
      </div>

      {rule}

      <ul className="min-h-0 space-y-1 overflow-hidden text-[10px] leading-[1.5]">
        {data.items.map((it, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">
              {it.qty && it.qty > 1 ? `${toFaDigits(it.qty)}× ` : ""}
              {it.name}
            </span>
            {it.price && <span className="shrink-0 tabular-fa">{it.price}</span>}
          </li>
        ))}
      </ul>

      <div
        className="mt-2 flex shrink-0 items-baseline justify-between gap-3 border-t pt-2"
        style={{ borderColor: hairline }}
      >
        <span className="text-[8px] leading-[1.4] font-medium" style={soft}>
          مجموع
        </span>
        <span className="text-[14px] leading-none font-semibold tabular-fa">{data.total}</span>
      </div>

      <div className="mt-auto flex shrink-0 items-end justify-between gap-3 pt-2">
        <svg
          viewBox="0 0 70 26"
          className="h-5 w-[60px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ opacity: 0.7 }}
        >
          <path d="M2 20c7-14 12-17 14-8s-5 13 0 11 9-17 14-13-3 11 2 9 9-9 14-7 6 6 11 2" />
        </svg>
        {data.stamp && (
          <span
            className="grid h-[38px] w-[38px] shrink-0 -rotate-[10deg] place-items-center rounded-full border-[1.5px] px-1 text-center text-[6.5px] leading-[1.2] font-semibold"
            style={{
              color: "var(--pb-accent)",
              borderColor: "var(--pb-accent)",
              opacity: 0.85,
              mixBlendMode: "multiply",
            }}
          >
            {data.stamp}
          </span>
        )}
      </div>
    </div>
  );
}

const preserve: CSSProperties = { transformStyle: "preserve-3d" };

function Wall({
  transform,
  outer,
  outerStyle,
  inner = FACE.inside,
  children,
  flap,
}: {
  transform: string;
  outer: string;
  outerStyle?: CSSProperties;
  inner?: string;
  children?: ReactNode;
  flap?: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, transform, ...preserve }}>
      <div style={{ ...fill, background: outer, borderRadius: 5, ...outerStyle }}>{children}</div>
      <div
        style={{ ...fill, background: inner, borderRadius: 5, transform: "rotateY(180deg)" }}
      />
      {flap}
    </div>
  );
}

function Flap({
  angle,
  minor,
  tapeHalf,
}: {
  angle: ReturnType<typeof useMotionValue<number>>;
  minor?: boolean;
  tapeHalf?: ReactNode;
}) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        top: minor ? 1.5 : 0,
        width: S,
        height: H2,
        transformOrigin: "50% 0%",
        rotateX: angle,
        ...preserve,
      }}
    >
      <div style={{ ...fill, background: FACE.underside, borderRadius: "0 0 4px 4px" }} />
      <div
        style={{
          ...fill,
          background: FACE.top,
          borderRadius: "0 0 4px 4px",
          transform: "rotateY(180deg)",
          boxShadow: "inset 0 -1px 0 rgba(60,30,5,0.28)",
        }}
      >
        {tapeHalf}
      </div>
    </motion.div>
  );
}

export function PackageBox({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  slip,
  maxWidth = 460,
  maxHeight,
  colors,
  label,
  symbols,
  tape = true,
  hint = true,
  openLabel = "برای بازکردن کلیک کن",
  closeLabel = "ببند",
  reserveSpace = false,
  className = "",
  paperClassName = "",
}: PackageBoxProps) {
  const reduce = useReducedMotion();
  const paperId = useId();

  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  }, [isOpen, open, onOpenChange]);

  const t = useMotionValue(defaultOpen ? 1 : 0);
  useEffect(() => {
    const controls = animate(
      t,
      isOpen ? 1 : 0,
      reduce
        ? { duration: 0.01 }
        : { duration: isOpen ? OPEN_SECONDS : CLOSE_SECONDS, ease: "linear" },
    );
    return () => controls.stop();
  }, [isOpen, reduce, t]);

  const cut = useTransform(t, [0, 0.08], [0, 1]);
  const majorF = useTransform(t, [0.08, 0.34], [-90, MAJOR_OPEN], {
    ease: EASE_FLAP,
    clamp: false,
  });
  const majorB = useTransform(t, [0.11, 0.37], [-90, MAJOR_OPEN], {
    ease: EASE_FLAP,
    clamp: false,
  });
  const minorR = useTransform(t, [0.26, 0.5], [-90, MINOR_OPEN], {
    ease: EASE_FLAP,
    clamp: false,
  });
  const minorL = useTransform(t, [0.29, 0.53], [-90, MINOR_OPEN], {
    ease: EASE_FLAP,
    clamp: false,
  });
  const rise = useTransform(t, [0.46, 0.78], [0, 1], { ease: EASE_RISE });
  const show = useTransform(t, [0.66, 1], [0, 1], { ease: EASE_SHOW });

  const paperTransform = useTransform([rise, show], ([r, s]) =>
    paperPose(r as number, s as number),
  );
  const tapeH = useTransform(cut, [0, 1], [TAPE_W / 2, TAPE_W / 2 - 0.9]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const scale = useMotionValue(1);
  const grow = useTransform([rise, show], ([r, s]) => 0.65 * (r as number) + 0.35 * (s as number));
  const height = useTransform([grow, scale], ([g, sc]) =>
    (reserveSpace ? H_OPEN : H_CLOSED + (H_OPEN - H_CLOSED) * (g as number)) * (sc as number),
  );

  useIsomorphicLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const byWidth = el.clientWidth / STAGE_W;
      const byHeight = maxHeight ? maxHeight / H_OPEN : Number.POSITIVE_INFINITY;
      scale.set(Math.min(byWidth, byHeight));
      setReady(true);
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [scale, maxHeight]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    return undefined;
  }, [isOpen, toggle]);

  const theme = {
    "--pb-box": colors?.box ?? "#b07b4a",
    "--pb-tape": colors?.tape ?? "#d3c3aa",
    "--pb-paper": colors?.paper ?? "#fbfaf6",
    "--pb-ink": colors?.ink ?? "#1c1a17",
    "--pb-accent": colors?.accent ?? "#c2552b",
  } as CSSProperties;

  const tapeStyle: CSSProperties = {
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--pb-tape), white 18%), var(--pb-tape) 55%, color-mix(in srgb, var(--pb-tape), black 8%))",
    boxShadow: "0 0 0 0.5px rgba(80,50,20,0.18)",
  };

  const slipData = { ...DEFAULT_SLIP, ...slip };

  return (
    <div className={`mx-auto w-full overflow-hidden ${className}`} style={{ maxWidth }}>
      <div ref={wrapRef} className="relative w-full" style={{ ...theme, opacity: ready ? 1 : 0 }}>
        <motion.div className="relative w-full" style={{ height }}>
          <motion.div
            className="absolute bottom-0 left-1/2"
            style={{
              width: STAGE_W,
              height: H_OPEN,
              x: "-50%",
              scale,
              transformOrigin: "50% 100%",
              pointerEvents: "none",
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
              animate={{ y: hovered && !isOpen && !reduce ? -4 : 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              onClick={toggle}
            >
              <div
                className="absolute inset-0"
                style={{
                  perspective: 2200,
                  perspectiveOrigin: "50% 38%",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: STAGE_W / 2 - H2,
                    top: H_OPEN - BOX_CENTER_FROM_BOTTOM - H2,
                    width: S,
                    height: S,
                    transform: `rotateX(${TILT}deg) rotateY(${TURN}deg)`,
                    cursor: "pointer",
                    pointerEvents: "none",
                    ...preserve,
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -70,
                      top: -70,
                      width: S + 140,
                      height: S + 140,
                      transform: `rotateX(90deg) translateZ(${-H2 - 3}px)`,
                      background:
                        "radial-gradient(closest-side, rgba(45,28,10,0.34), rgba(45,28,10,0.14) 58%, transparent 100%)",
                    }}
                  />

                  <div aria-hidden style={{ position: "absolute", inset: 0, ...preserve }}>
                    <Wall
                      transform={`rotateX(-90deg) translateZ(${H2}px)`}
                      outer={FACE.floor}
                      inner={FACE.floor}
                    />

                    <Wall
                      transform={`rotateY(180deg) translateZ(${H2}px)`}
                      outer={FACE.left}
                      flap={
                        <Flap
                          angle={majorB}
                          tapeHalf={
                            tape ? (
                              <motion.div
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  height: tapeH,
                                  ...tapeStyle,
                                }}
                              />
                            ) : undefined
                          }
                        />
                      }
                    />
                    <Wall
                      transform={`rotateY(-90deg) translateZ(${H2}px)`}
                      outer={FACE.right}
                      flap={<Flap angle={minorL} minor />}
                    >
                      {tape && <TapeTail cut={cut} style={tapeStyle} />}
                    </Wall>

                    <Wall
                      transform={`translateZ(${H2}px)`}
                      outer={FACE.left}
                      outerStyle={{
                        boxShadow:
                          "inset -12px 0 20px -12px rgba(60,30,5,0.3), inset 0 10px 14px -10px rgba(255,255,255,0.2)",
                      }}
                      flap={
                        <Flap
                          angle={majorF}
                          tapeHalf={
                            tape ? (
                              <motion.div
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  height: tapeH,
                                  ...tapeStyle,
                                }}
                              />
                            ) : undefined
                          }
                        />
                      }
                    >
                      {label !== false && (
                        <div
                          style={{
                            position: "absolute",
                            left: "58%",
                            top: "20%",
                            width: "33%",
                            height: "38%",
                          }}
                        >
                          {label ?? <Sticker />}
                        </div>
                      )}
                    </Wall>
                    <Wall
                      transform={`rotateY(90deg) translateZ(${H2}px)`}
                      outer={FACE.right}
                      outerStyle={{
                        boxShadow:
                          "inset 12px 0 20px -12px rgba(30,15,0,0.35), inset 0 10px 14px -10px rgba(255,255,255,0.1)",
                      }}
                      flap={<Flap angle={minorR} minor />}
                    >
                      {tape && <TapeTail cut={cut} style={tapeStyle} />}
                      {symbols !== false && (
                        <div
                          style={{
                            position: "absolute",
                            left: "36%",
                            top: "58%",
                            width: "58%",
                            height: "32%",
                          }}
                        >
                          {symbols ?? <Symbols />}
                        </div>
                      )}
                    </Wall>
                  </div>

                  <motion.div
                    id={paperId}
                    role="document"
                    aria-label="برگهٔ سفارش"
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                    onClick={(e) => e.stopPropagation()}
                    className={`overflow-hidden rounded-[3px] font-sans antialiased ${paperClassName}`}
                    style={{
                      position: "absolute",
                      left: H2 - PAPER_W / 2,
                      top: H2 - PAPER_H / 2,
                      width: PAPER_W,
                      height: PAPER_H,
                      transform: paperTransform,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      color: INK,
                      cursor: "default",
                      pointerEvents: isOpen ? "auto" : "none",
                      background:
                        "linear-gradient(180deg, transparent 33%, rgba(0,0,0,0.035) 33.3%, transparent 34%, transparent 66.3%, rgba(0,0,0,0.035) 66.6%, transparent 67.3%), radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.7), transparent 60%), var(--pb-paper)",
                      boxShadow:
                        "0 1px 0 rgba(0,0,0,0.05), 0 14px 28px -10px rgba(40,25,10,0.35), 0 2px 6px rgba(40,25,10,0.12)",
                    }}
                  >
                    {children ?? <Slip data={slipData} />}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-1 flex justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={paperId}
          className={
            hint
              ? "inline-flex h-9 items-center rounded-full px-4 text-[12.5px] font-medium text-muted-foreground outline-none transition-colors duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary/40 [@media(hover:hover)]:hover:bg-foreground/5 [@media(hover:hover)]:hover:text-foreground [-webkit-tap-highlight-color:transparent]"
              : "sr-only"
          }
        >
          {isOpen ? closeLabel : openLabel}
        </button>
      </div>
    </div>
  );
}

function TapeTail({
  cut,
  style,
}: {
  cut: ReturnType<typeof useMotionValue<number>>;
  style: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% - ${TAPE_W / 2}px)`,
        top: 0,
        width: TAPE_W,
        height: S * 0.3,
        borderRadius: "0 0 2px 2px",
        ...style,
      }}
    >
      <motion.span
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 1,
          background: "rgba(70,40,15,0.5)",
          opacity: cut,
        }}
      />
    </div>
  );
}

export default PackageBox;
