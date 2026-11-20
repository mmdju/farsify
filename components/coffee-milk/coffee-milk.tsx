"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";

import "./coffee-milk.css";

export interface CoffeeMilkProps {
  defaultValue?: number;
  value?: number;
  leftLabel?: string;
  rightLabel?: string;
  onChange?: (leftValue: number) => void;
  coffeeFill?: string;
  milkFill?: string;
  gap?: number;
  tallHeight?: number;
  ariaLabel?: string;
  className?: string;
}

const SP = {
  type: "spring" as const,
  stiffness: 520,
  damping: 42,
  mass: 0.72,
};

const SIZE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 16,
  mass: 1,
};

const INSTANT = { duration: 0 };

const NARROW_THRESHOLD = 30;
const SHORT_HEIGHT = 26;
const LABEL_LINE = 18;
const ABOVE_GAP = 12;
const LABEL_INSET = 20;

const BASE_PRESENCE = 0.8;
const PRESENCE_SWING = 0.2;
const presenceFor = (pct: number) =>
  BASE_PRESENCE + PRESENCE_SWING * ((pct - 50) / 50);

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (v: number) =>
  String(Math.round(v)).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

const labelStyle: CSSProperties = {
  position: "absolute",
  height: LABEL_LINE,
  display: "flex",
  alignItems: "center",
  gap: "0.4em",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  maxWidth: "calc(100% - 40px)",
  overflow: "hidden",
  pointerEvents: "none",
};

const numberStyle: CSSProperties = {
  fontWeight: 700,
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
};

const CoffeeMilk: React.FC<CoffeeMilkProps> = ({
  defaultValue = 65,
  value,
  leftLabel = "قهوه",
  rightLabel = "شیر",
  onChange,
  coffeeFill,
  milkFill,
  gap = 12,
  tallHeight = 56,
  ariaLabel,
  className = "",
}) => {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const on = controlled ? value : inner;
  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);
  const reduce = useReducedMotion();

  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftLabelRef = useRef<HTMLDivElement>(null);
  const rightLabelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ track: 0, leftLabel: 0, rightLabel: 0 });

  useEffect(() => {
    const read = () =>
      setBox({
        track: trackRef.current?.clientWidth ?? 0,
        leftLabel: leftLabelRef.current?.scrollWidth ?? 0,
        rightLabel: rightLabelRef.current?.scrollWidth ?? 0,
      });
    read();
    const observer = new ResizeObserver(read);
    if (trackRef.current) observer.observe(trackRef.current);
    if (leftLabelRef.current) observer.observe(leftLabelRef.current);
    if (rightLabelRef.current) observer.observe(rightLabelRef.current);
    return () => observer.disconnect();
  }, []);

  const left = Math.round(Math.max(1, Math.min(99, on)));
  const right = 100 - left;
  const narrow = Math.min(left, right) < NARROW_THRESHOLD;
  const barHeight = narrow ? SHORT_HEIGHT : tallHeight;
  const radius = narrow ? barHeight / 2 : 16;
  const frameHeight = tallHeight + LABEL_LINE + ABOVE_GAP + 14;

  const fits = (pct: number, label: number) =>
    box.track === 0 ||
    (box.track * pct) / 100 - gap / 2 >= label + LABEL_INSET * 2;
  const labelBottom = (pct: number, label: number) =>
    fits(pct, label) ? (barHeight - LABEL_LINE) / 2 : barHeight + ABOVE_GAP;

  const leftPresence = presenceFor(left);
  const rightPresence = presenceFor(right);

  const instant = reduce ? INSTANT : undefined;
  const segmentTransition = {
    width: reduce ? INSTANT : dragging ? INSTANT : SP,
    opacity: reduce ? INSTANT : dragging ? INSTANT : SP,
    borderRadius: instant ?? SIZE_SPRING,
  };
  const dividerTransition = reduce ? INSTANT : dragging ? INSTANT : SP;

  const commit = (next: number) => {
    if (!controlled) setInner(next);
    onChange?.(Math.round(next));
  };

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    commit(Math.max(1, Math.min(99, pct)));
  };

  const detachDrag = useRef<() => void>(() => {});
  useEffect(() => () => detachDrag.current(), []);

  const handlePointerDown = (e: React.PointerEvent) => {
    detachDrag.current();
    setDragging(true);
    setFromClientX(e.clientX);

    const pointerId = e.pointerId;
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      setFromClientX(ev.clientX);
    };
    const teardown = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      detachDrag.current = () => {};
    };
    function onEnd() {
      setDragging(false);
      teardown();
    }

    detachDrag.current = teardown;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = (delta: number) => {
      commit(Math.max(1, Math.min(99, on + delta)));
    };
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        step(1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        step(-1);
        break;
      case "PageUp":
        step(10);
        break;
      case "PageDown":
        step(-10);
        break;
      case "Home":
        step(1 - on);
        break;
      case "End":
        step(99 - on);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const cssVars = {
    ...(coffeeFill ? { "--cm-coffee-fill": coffeeFill } : {}),
    ...(milkFill ? { "--cm-milk-fill": milkFill } : {}),
  } as CSSProperties;

  return (
    <div
      className={`coffee-milk${className ? ` ${className}` : ""}`}
      style={{
        width: "100%",
        maxWidth: 460,
        position: "relative",
        height: frameHeight,
        ...cssVars,
      }}
    >
      <motion.div
        animate={{ height: barHeight }}
        transition={instant ?? SIZE_SPRING}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <motion.div
          animate={{
            width: `calc(${left}% - ${gap / 2}px)`,
            opacity: leftPresence,
            borderRadius: radius,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background:
              "color-mix(in oklab, var(--cm-coffee-fill) calc(var(--cm-coffee-alpha) * 100%), transparent)",
          }}
        />

        <motion.div
          animate={{
            width: `calc(${right}% - ${gap / 2}px)`,
            opacity: rightPresence,
            borderRadius: radius,
          }}
          transition={segmentTransition}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            background:
              "color-mix(in oklab, var(--cm-milk-fill) calc(var(--cm-milk-alpha) * 100%), transparent)",
          }}
        />

        <motion.div
          animate={{ left: `${left}%` }}
          transition={dividerTransition}
          style={{
            position: "absolute",
            top: "20%",
            height: "60%",
            width: 4,
            marginLeft: -2,
            borderRadius: 2,
            background: "var(--cm-rule)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      <div
        ref={trackRef}
        className="coffee-milk__hit"
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel ?? `${leftLabel} و ${rightLabel}`}
        aria-valuemin={1}
        aria-valuemax={99}
        aria-valuenow={left}
        aria-valuetext={`${toFa(left)}٪ ${leftLabel}`}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: tallHeight,
          cursor: "ew-resize",
          userSelect: "none",
        }}
      />

      <motion.div
        ref={leftLabelRef}
        animate={{ bottom: labelBottom(left, box.leftLabel) }}
        transition={instant ?? SIZE_SPRING}
        style={{ ...labelStyle, left: LABEL_INSET, color: "var(--cm-coffee-word)" }}
      >
        <span>{leftLabel}</span>
        <span style={{ ...numberStyle, color: "var(--cm-coffee-num)" }}>
          {toFa(left)}٪
        </span>
      </motion.div>

      <motion.div
        ref={rightLabelRef}
        animate={{ bottom: labelBottom(right, box.rightLabel) }}
        transition={instant ?? SIZE_SPRING}
        style={{ ...labelStyle, right: LABEL_INSET, color: "var(--cm-milk-word)" }}
      >
        <span>{rightLabel}</span>
        <span style={{ ...numberStyle, color: "var(--cm-milk-num)" }}>
          {toFa(right)}٪
        </span>
      </motion.div>
    </div>
  );
};

export default CoffeeMilk;
export { CoffeeMilk };
