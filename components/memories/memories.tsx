"use client";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import "./memories.css";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.9 };
const SPRING_FAST = { type: "spring" as const, stiffness: 480, damping: 30, mass: 0.75 };
const SPRING_SETTLE = { type: "spring" as const, stiffness: 240, damping: 20, mass: 1 };
const BROWSE_MS = 480;

const L_STOPS = [0.74, 0.6, 0.46];
const cardBg = (hue: number, chroma: number) =>
  `linear-gradient(155deg, ${L_STOPS.map(
    (l, i) => `oklch(${l} ${chroma} ${hue}) ${i * 50}%`,
  ).join(", ")})`;

const sampleShot = (h: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${h},14%,22%)'/%3E%3Cstop offset='1' stop-color='hsl(${h},16%,36%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3C/svg%3E`;

const DEFAULT_CARDS = [
  {
    label: "چمنزار",
    date: "۱۸ تیر ۱۴۰۱",
    hue: 163,
    chroma: 0.07,
    alt: "چمنزاری سبز در دامنهٔ تپه‌ها",
  },
  {
    label: "صبحِ کافه",
    date: "۱۹ تیر ۱۴۰۱",
    hue: 75,
    chroma: 0.068,
    alt: "فنجان قهوه روی میز چوبی کنار پنجره",
  },
  {
    label: "چراغ‌های شهر",
    date: "۲۰ تیر ۱۴۰۱",
    hue: 254,
    chroma: 0.096,
    alt: "آسمان‌خراش‌های روشنِ شهر در شب، کنار آب",
  },
  {
    label: "بامِ غروب",
    date: "۲۱ تیر ۱۴۰۱",
    hue: 45,
    chroma: 0.092,
    alt: "پشت‌بام‌ها زیر نورِ طلاییِ غروب",
  },
  {
    label: "شب‌بازار",
    date: "۲۲ تیر ۱۴۰۱",
    hue: 340,
    chroma: 0.14,
    alt: "دکه‌های غذای شب‌بازار زیر فانوس‌های کاغذی",
  },
].map((card) => ({ ...card, src: sampleShot(card.hue), bg: cardBg(card.hue, card.chroma) }));

export interface MemoriesCard {
  label: string;
  date: string;
  src: string;
  alt?: string;
}

export interface MemoriesProps {
  cards?: MemoriesCard[];
  heading?: string;
  startLabel?: string;
  spread?: number;
  fanAngle?: number;
  cardWidth?: number;
  open?: boolean;
  index?: number;
  onIndexChange?: (index: number) => void;
  ariaLabel?: string;
  className?: string;
}

type DeckCard = MemoriesCard & { bg?: string };

function Shot({ card, eager }: { card: DeckCard; eager?: boolean }) {
  return (
    <img
      src={card.src}
      alt={card.alt ?? ""}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const ChevronBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ChevronNext = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const RAISED =
  "inset 0 1px 0 oklch(1 0 0 / 0.9), inset 0 -1px 0 oklch(0 0 0 / 0.04), 0 1px 2px oklch(0 0 0 / 0.1), 0 6px 14px -4px oklch(0 0 0 / 0.16)";
const RAISED_DARK =
  "inset 0 1px 0 oklch(1 0 0 / 0.16), 0 2px 4px oklch(0 0 0 / 0.26), 0 10px 20px -6px oklch(0 0 0 / 0.36)";

export function Memories({
  cards = DEFAULT_CARDS,
  heading = "مرورِ خاطره‌ها",
  startLabel = "شروع",
  spread = 75,
  fanAngle = 10,
  cardWidth: w = 200,
  open,
  index,
  onIndexChange,
  ariaLabel = "کارتِ خاطره؛ با کشیدن یا کلیدهای جهتدار مرور کن",
  className,
}: MemoriesProps) {
  const [phase, setPhase] = useState<"stacked" | "expanded">("stacked");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [availW, setAvailW] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const reduce = useReducedMotion();
  const INSTANT = { duration: 0 } as const;

  const total = cards.length;
  const current = total > 0 ? (cards[Math.min(currentIndex, total - 1)] as DeckCard) : undefined;
  const isExpanded = phase === "expanded";
  const behind = [cards[1], cards[2]].filter(Boolean) as DeckCard[];
  const atEnd = currentIndex === total - 1;

  const regionRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<HTMLButtonElement | null>(null);
  const wantFocus = useRef<"region" | "start" | null>(null);

  const handleStart = () => {
    if (open !== undefined) return;
    wantFocus.current = "region";
    setPhase("expanded");
  };
  const handleClose = () => {
    if (open !== undefined) return;
    wantFocus.current = "start";
    setPhase("stacked");
  };

  const lock = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(lock.current), []);

  useEffect(() => {
    if (wantFocus.current === "region" && regionRef.current) {
      wantFocus.current = null;
      regionRef.current.focus();
      return;
    }
    if (wantFocus.current === "start" && startRef.current) {
      wantFocus.current = null;
      startRef.current.focus();
    }
  });

  const browse = (step: 1 | -1) => {
    const next = currentIndex + step;
    if (isAnimating || next < 0 || next > total - 1) return;
    setIsAnimating(true);
    if (index === undefined) {
      setDirection(step);
      setCurrentIndex(next);
    }
    onIndexChange?.(next);
    clearTimeout(lock.current);
    lock.current = setTimeout(() => setIsAnimating(false), BROWSE_MS);
  };

  const goNext = () => browse(1);
  const goPrev = () => browse(-1);

  const lastIndexRef = useRef(currentIndex);
  useEffect(() => {
    lastIndexRef.current = currentIndex;
  });
  useEffect(() => {
    if (open === undefined) return;
    setPhase(open ? "expanded" : "stacked");
  }, [open]);
  useEffect(() => {
    if (index === undefined || total === 0) return;
    const next = Math.min(Math.max(index, 0), total - 1);
    if (next === lastIndexRef.current) return;
    setDirection(next > lastIndexRef.current ? 1 : -1);
    setCurrentIndex(next);
  }, [index, total]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => setAvailW(el.clientWidth);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  if (!current) return null;

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (!isExpanded) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  const DECK_H = Math.round(w * 1.2);
  const EXP_W = Math.round(w * 1.48);
  const EXP_H = Math.round(w * 1.76);
  const fanRad = (Math.abs(fanAngle) * Math.PI) / 180;
  const fanHalf = (gapValue: number) =>
    gapValue + (w / 2) * (Math.cos(fanRad) + Math.sin(fanRad));
  const room = availW > 0 ? availW : EXP_W + 64;
  const fanSpread = Math.max(0, Math.min(spread, room / 2 - fanHalf(0)));
  const regionW = Math.min(EXP_W + 64, Math.max(EXP_W, room));
  const frame = isExpanded
    ? { width: EXP_W, height: EXP_H, borderRadius: 18, paddingBottom: 46,
        boxShadow: "0 20px 60px oklch(0 0 0 / 0.2), 0 4px 12px oklch(0 0 0 / 0.1)" }
    : { width: w, height: DECK_H, borderRadius: 12, paddingBottom: 36,
        boxShadow: "0 10px 32px oklch(0 0 0 / 0.15), 0 2px 6px oklch(0 0 0 / 0.08)" };
  const SIDE_ENTER = Math.round(EXP_W * 0.4);
  const EXIT_OUT = -Math.round(EXP_W * 0.22);
  const EXIT_TUCK = -Math.round(EXP_W * 0.055);

  const cardVariants = {
    enter: (dir: number) =>
      dir === 0
        ? { x: 0, scale: 1, opacity: 0, zIndex: 10, ...frame }
        : { x: dir > 0 ? SIDE_ENTER : -SIDE_ENTER, scale: 0.86, opacity: 1, zIndex: 4, ...frame },
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 10,
      ...frame,
    },
    exit: (dir: number) =>
      dir === 0
        ? { opacity: 0, zIndex: 2, ...frame, transition: { duration: reduce ? 0 : 0.16 } }
        : {
            x: dir > 0 ? [null, EXIT_OUT, EXIT_TUCK] : [null, -EXIT_OUT, -EXIT_TUCK],
            scale: [null, 0.92, 0.82],
            opacity: 1,
            zIndex: [10, 10, 2],
            ...frame,
            transition: reduce
              ? { duration: 0 }
              : { duration: BROWSE_MS / 1000, times: [0, 0.55, 1], ease: [0.4, 0, 0.2, 1] as const },
          },
  };

  const HEAD = {
    out: { transition: { staggerChildren: reduce ? 0 : 0.04, staggerDirection: -1 as const } },
    in: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.02 } },
  };
  const HEAD_LINE = {
    out: { opacity: 0, y: 10, filter: "blur(5px)", transition: { duration: reduce ? 0 : 0.16, ease: [0.4, 0, 1, 1] as const } },
    in: { opacity: 1, y: 0, filter: "blur(0px)", transition: reduce ? INSTANT : SPRING_FAST },
  };

  const hoverTap = reduce ? undefined : { scale: 1.04 };
  const tap = reduce ? undefined : { scale: 0.96 };

  return (
    <div
      ref={rootRef}
      className={"memories flex min-h-[620px] select-none flex-col items-center justify-center" + (className ? ` ${className}` : "")}
      onKeyDown={onKeyDown}
    >
      <div style={{ textAlign: "center", marginBottom: 36, minHeight: 28 }}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div key="h-stacked" variants={HEAD} initial="out" animate="in" exit="out">
              <motion.div variants={HEAD_LINE} style={{ fontSize: 20, fontWeight: 700 }} className="memories__title">
                {heading}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="h-expanded" variants={HEAD} initial="out" animate="in" exit="out">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.date}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={reduce ? INSTANT : { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
                  style={{ fontSize: 20, fontWeight: 700 }} className="memories__title"
                >
                  {current.date}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        style={{
          position: "relative",
          width: regionW, height: EXP_H + 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 40,
        }}
        ref={regionRef}
        role="group"
        tabIndex={isExpanded ? 0 : undefined}
        aria-label={ariaLabel}
        className="memories__focusable"
      >
        {behind.map((card, slot) => {
          const i = slot + 1;

          return (
          <motion.div
            key={`slot-${slot}`}
            animate={isExpanded
              ? { x: 0, y: -(i * 9), scale: 1 - i * 0.055, rotate: 0, zIndex: 3 - i, opacity: 1 }
              : { x: i === 1 ? -fanSpread : fanSpread, y: i === 1 ? 12 : 10, scale: 0.88, rotate: i === 1 ? -fanAngle : fanAngle, zIndex: 1, opacity: 1 }
            }
            transition={reduce ? INSTANT : { ...SPRING_SETTLE, delay: isExpanded ? i * 0.03 : (2 - i) * 0.04 }}
            aria-hidden="true"
            style={{ position: "absolute", willChange: "transform" }}
          >
            <div style={{
              width: w, height: DECK_H,
              borderRadius: 12,
              padding: "10px 10px 36px",
              overflow: "hidden",
            }} className="memories__frame">
              <div style={{
                width: "100%", height: "100%",
                background: card.bg, borderRadius: 6,
                position: "relative", overflow: "hidden",
              }}>
                <Shot card={card} />
              </div>
            </div>
          </motion.div>
          );
        })}

        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current.label + currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={isExpanded ? (reduce ? INSTANT : SPRING) : (reduce ? INSTANT : SPRING_SETTLE)}
            drag={isExpanded && !isAnimating ? "x" : false}
            dragSnapToOrigin
            dragElastic={0.22}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 420, bounceDamping: 32 }}
            onDragEnd={(_, info) => {
              const thrown = Math.abs(info.offset.x) > frame.width / 3 || Math.abs(info.velocity.x) > 500;
              if (!thrown) return;
              if (info.offset.x < 0) goNext();
              else goPrev();
            }}
            onAnimationComplete={() => {
              if (!isExpanded && currentIndex !== 0) {
                setDirection(0);
                if (index === undefined) setCurrentIndex(0);
                onIndexChange?.(0);
              }
            }}
            style={{
              position: "absolute",
              padding: "10px 10px 0",
              overflow: "hidden",
              cursor: isExpanded ? "grab" : "default",
              willChange: "transform",
            }}
            whileDrag={{ cursor: "grabbing" }}
            className="memories__frame"
          >
            <div style={{
              width: "100%", height: "100%",
              background: current.bg,
              borderRadius: isExpanded ? 8 : 6,
              position: "relative", overflow: "hidden",
            }}>
              <Shot card={current} eager />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
                background: "linear-gradient(to top, oklch(0 0 0 / 0.5), transparent)",
                pointerEvents: "none",
              }} />
              <span style={{
                position: "absolute", bottom: 12, left: 14, right: 14,
                fontSize: 13, fontWeight: 600, color: "oklch(1 0 0)",
                textShadow: "0 1px 3px oklch(0 0 0 / 0.4)",
              }}>
                {current.label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={reduce ? INSTANT : SPRING_FAST}
            style={{ display: "flex", gap: 6, marginBottom: 24 }}
            aria-hidden="true"
          >
            {cards.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === currentIndex ? 20 : 6 }}
                transition={reduce ? INSTANT : SPRING_FAST}
                style={{ height: 6, borderRadius: 3 }}
                className={i === currentIndex ? "memories__dot memories__dot--on" : "memories__dot"}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="start"
            onClick={handleStart}
            ref={startRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            whileHover={hoverTap}
            whileTap={tap}
            transition={reduce ? INSTANT : SPRING_FAST}
            type="button"
            style={{
              padding: "12px 44px", borderRadius: 999,
              border: "none",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: RAISED_DARK,
            }}
            className={"memories__solid memories__focusable"}
          >
            {startLabel}
          </motion.button>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={reduce ? INSTANT : SPRING_FAST}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <motion.button
              onClick={goPrev}
              whileHover={currentIndex > 0 ? hoverTap : {}}
              whileTap={currentIndex > 0 ? tap : {}}
              animate={{ opacity: currentIndex === 0 ? 0.45 : 1 }}
              disabled={currentIndex === 0}
              transition={reduce ? INSTANT : SPRING_FAST}
              type="button"
              aria-label="خاطرهٔ قبلی"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                boxShadow: RAISED,
              }}
              className="memories__ghost memories__focusable"
            >
              <ChevronBack />
            </motion.button>

            <motion.button
              onClick={handleClose}
              whileHover={hoverTap}
              whileTap={tap}
              transition={reduce ? INSTANT : SPRING_FAST}
              type="button"
              aria-label="بستن و برگشتن به دِک"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: RAISED,
              }}
              className="memories__ghost memories__focusable"
            >
              <CloseIcon />
            </motion.button>

            <motion.button
              onClick={atEnd ? handleClose : goNext}
              whileHover={hoverTap}
              whileTap={tap}
              transition={reduce ? INSTANT : SPRING_FAST}
              type="button"
              aria-label={atEnd ? "پایان و جمعکردنِ دِک" : "خاطرهٔ بعدی"}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              animate={{ boxShadow: atEnd ? RAISED_DARK : RAISED }}
              className={atEnd ? "memories__solid memories__focusable" : "memories__ghost memories__focusable"}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={atEnd ? "done" : "next"}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={reduce ? INSTANT : SPRING_FAST}
                  style={{ display: "flex" }}
                >
                  {atEnd ? <CheckIcon /> : <ChevronNext />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Memories;
