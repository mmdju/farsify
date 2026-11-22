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
  type MouseEvent,
} from "react";

type Rect = { x: number; y: number; width: number; height: number };

function round(value: number) {
  const fixed = Math.round(value * 100) / 100;
  return Number.isFinite(fixed) ? String(fixed) : "0";
}

function pillPath(rect: Rect, radius: number) {
  const r = Math.min(radius, rect.width / 2, rect.height / 2);
  const { x, y, width, height } = rect;
  return [
    `M${round(x)} ${round(y + r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + r)} ${round(y)}`,
    `L${round(x + width - r)} ${round(y)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width)} ${round(y + r)}`,
    `L${round(x + width)} ${round(y + height - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width - r)} ${round(y + height)}`,
    `L${round(x + r)} ${round(y + height)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x)} ${round(y + height - r)}`,
    "Z",
  ].join(" ");
}

function bridgePath(
  from: Rect,
  to: Rect,
  cornerRadius: number,
  neckHeight: number,
  pushFactor: number,
) {
  if (pushFactor <= 0.02) return null;

  const height = from.height;
  const middle = from.y + height / 2;
  const r = Math.min(cornerRadius, height / 2, from.width / 2, to.width / 2);
  if (r <= 0) return null;

  const fromEdge = from.x + from.width;
  const gapStart = to.x;
  const gap = gapStart - fromEdge;
  if (gap < 0) return null;

  const neck = Math.min((neckHeight / 2) * pushFactor, height / 2 - 0.5);
  const halfGap = gap / 2 + r;
  const inset = neck - height / 2 + r;
  const divisor = 2 * (inset - r);
  if (Math.abs(divisor) < 1e-4) return null;

  const arc = (r * r - halfGap * halfGap - inset * inset) / divisor;
  if (!(arc > 0) || r + arc < halfGap) return null;

  const leg = Math.sqrt(Math.max(0, (r + arc) * (r + arc) - halfGap * halfGap));
  const middleX = (fromEdge + gapStart) / 2;
  const anchorX = fromEdge - r;
  const topY = from.y + r;
  const dx = middleX - anchorX;
  const legOffset = from.y + r - leg - topY;
  const length = Math.hypot(dx, legOffset) || 1;
  const startX = anchorX + (r * dx) / length;
  const startY = topY + (r * legOffset) / length;
  const endX = 2 * middleX - startX;

  return [
    `M${round(startX)} ${round(startY)}`,
    `A${round(arc)} ${round(arc)} 0 0 0 ${round(endX)} ${round(startY)}`,
    `L${round(endX)} ${round(2 * middle - startY)}`,
    `A${round(arc)} ${round(arc)} 0 0 0 ${round(startX)} ${round(2 * middle - startY)}`,
    "Z",
  ].join(" ");
}

export type NavItem = {
  label: string;
  link: string;
  width?: number;
};

export type GooeyNavbarProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  activeIndex?: number;
  onSelect?: (index: number, item: NavItem) => void;
  pillColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  cornerRadius?: number;
  gap?: number;
  neighborPush?: number;
  anchorEdge?: "start" | "center" | "end";
  neckRatio?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  className?: string;
};

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "خانه", link: "#home" },
  { label: "کارها", link: "#work" },
  { label: "درباره", link: "#about" },
  { label: "آزمایشگاه", link: "#lab" },
  { label: "تماس", link: "#contact" },
];

export function GooeyNavbar({
  items = DEFAULT_NAV_ITEMS,
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onSelect,
  pillColor = "#fafafa",
  textColor = "rgb(35, 35, 35)",
  hoverTextColor = "rgb(0, 0, 0)",
  fontSize = 15,
  paddingX = 24,
  paddingY = 16,
  cornerRadius = 12,
  gap = 0,
  neighborPush = 32,
  anchorEdge = "center",
  neckRatio = 0.35,
  stiffness = 260,
  damping = 30,
  mass = 1,
  className,
}: GooeyNavbarProps) {
  const [internalActive, setInternalActive] = useState(defaultActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = controlledActiveIndex ?? internalActive;
  const pillHeight = fontSize + paddingY * 2;

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const measured = items.map((item, index) => {
        if (item.width) return Math.ceil(item.width);
        const label = itemRefs.current[index]?.firstElementChild as
          | HTMLElement
          | null
          | undefined;
        return Math.ceil((label?.offsetWidth ?? 0) + paddingX * 2);
      });
      setWidths((previous) =>
        previous.length === measured.length &&
        previous.every((width, index) => width === measured[index])
          ? previous
          : measured,
      );
    };

    measure();
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
    };
  }, [items, fontSize, paddingX]);

  const baseRects = useMemo(() => {
    let x = 0;
    return items.map((item, index) => {
      const width =
        widths[index] ??
        item.width ??
        Math.ceil(item.label.length * fontSize * 0.8) + paddingX * 2;
      const rect = { x, y: 0, width, height: pillHeight };
      x += width + gap;
      return rect;
    });
  }, [items, widths, fontSize, paddingX, pillHeight, gap]);

  const lastRect = baseRects[baseRects.length - 1];
  const layoutWidth = lastRect ? lastRect.x + lastRect.width : 0;

  const targetPushFactors = useMemo(() => {
    const isTarget = (index: number) =>
      index === hoveredIndex || index === activeIndex;
    return baseRects
      .slice(0, -1)
      .map((_, index) => (isTarget(index) || isTarget(index + 1) ? 1 : 0));
  }, [baseRects, hoveredIndex, activeIndex]);

  const [animatedPushFactors, setAnimatedPushFactors] = useState<number[]>([]);
  const currentPush = useRef<number[]>([]);
  const currentVelocity = useRef<number[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentPush.current = [...targetPushFactors];
      currentVelocity.current = targetPushFactors.map(() => 0);
      setAnimatedPushFactors([...targetPushFactors]);
      return;
    }

    let frame = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      const positions = currentPush.current;
      const velocities = currentVelocity.current;
      let isMoving = false;

      for (let index = 0; index < targetPushFactors.length; index++) {
        const target = targetPushFactors[index];
        const position = positions[index] ?? target;
        const velocity = velocities[index] ?? 0;

        const force = -stiffness * (position - target) - damping * velocity;
        const nextVelocity = velocity + (force / mass) * delta;
        const nextPosition = position + nextVelocity * delta;

        if (Math.abs(nextPosition - target) > 0.001 || Math.abs(nextVelocity) > 0.01) {
          positions[index] = nextPosition;
          velocities[index] = nextVelocity;
          isMoving = true;
        } else {
          positions[index] = target;
          velocities[index] = 0;
        }
      }

      positions.length = targetPushFactors.length;
      velocities.length = targetPushFactors.length;
      setAnimatedPushFactors([...positions]);

      if (isMoving) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [targetPushFactors, stiffness, damping, mass]);

  const getTabPositions = useCallback(
    (factors: number[]) => {
      const positions: number[] = [];
      if (baseRects.length === 0) return positions;

      positions[0] = baseRects[0].x;
      for (let index = 1; index < baseRects.length; index++) {
        positions[index] =
          positions[index - 1] +
          baseRects[index - 1].width +
          gap +
          neighborPush * (factors[index - 1] ?? 0);
      }
      return positions;
    },
    [baseRects, gap, neighborPush],
  );

  const tabOffsets = useMemo(() => {
    const count = baseRects.length;
    if (count === 0) return [];

    const factors = baseRects
      .slice(0, -1)
      .map((_, index) => animatedPushFactors[index] ?? targetPushFactors[index] ?? 0);
    const positions = getTabPositions(factors);
    const lastIndex = count - 1;
    const expansion =
      positions[lastIndex] +
      baseRects[lastIndex].width -
      positions[0] -
      (baseRects[lastIndex].x + baseRects[lastIndex].width - baseRects[0].x);

    const anchor = anchorEdge === "start" ? "left" : anchorEdge === "end" ? "right" : "center";
    const shift =
      anchor === "right" ? -expansion : anchor === "center" ? -expansion / 2 : 0;

    return positions.map(
      (position, index) => position + shift - baseRects[index].x,
    );
  }, [baseRects, animatedPushFactors, targetPushFactors, getTabPositions, anchorEdge]);

  const currentRects = useMemo(
    () =>
      baseRects.map((rect, index) => ({
        ...rect,
        x: rect.x + (tabOffsets[index] ?? 0),
      })),
    [baseRects, tabOffsets],
  );

  const physicalRects = useMemo(
    () =>
      currentRects.map((rect) => ({
        ...rect,
        x: layoutWidth - rect.x - rect.width,
      })),
    [currentRects, layoutWidth],
  );

  const svgPath = useMemo(() => {
    const paths = currentRects.map((rect) => pillPath(rect, cornerRadius));

    for (let index = 0; index < currentRects.length - 1; index++) {
      const factor = animatedPushFactors[index] ?? targetPushFactors[index] ?? 0;
      const bridge = bridgePath(
        currentRects[index],
        currentRects[index + 1],
        cornerRadius,
        pillHeight * neckRatio,
        factor,
      );
      if (bridge) paths.push(bridge);
    }

    return paths.join(" ");
  }, [
    currentRects,
    cornerRadius,
    pillHeight,
    neckRatio,
    animatedPushFactors,
    targetPushFactors,
  ]);

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const pointerX = event.clientX - container.getBoundingClientRect().left;

    let closest: number | null = null;
    let distance = Infinity;
    physicalRects.forEach((rect, index) => {
      const gap =
        pointerX < rect.x
          ? rect.x - pointerX
          : pointerX > rect.x + rect.width
            ? pointerX - (rect.x + rect.width)
            : 0;
      if (gap < distance) {
        distance = gap;
        closest = index;
      }
    });
    setHoveredIndex(closest);
  };

  const handleSelect = (index: number, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setInternalActive(index);
    onSelect?.(index, items[index]);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ width: layoutWidth || undefined, height: pillHeight }}
      className={cn("relative mx-auto block select-none", className)}
    >
      <svg
        width="100%"
        height="100%"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <path
          d={svgPath}
          fill={pillColor}
          fillRule="nonzero"
          transform={`scale(-1 1) translate(${-layoutWidth} 0)`}
        />
      </svg>

      <nav aria-label="ناوبری اصلی" className="absolute inset-0 z-10">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const isHovered = hoveredIndex === index;

          return (
            <a
              key={item.link || `tab-${index}`}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              href={item.link}
              onClick={(event) => handleSelect(index, event)}
              onMouseEnter={() => setHoveredIndex(index)}
              aria-current={isActive ? "page" : undefined}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: widths[index] ? `${widths[index]}px` : undefined,
                height: `${pillHeight}px`,
                padding: `0 ${paddingX}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                fontSize: `${fontSize}px`,
                fontWeight: 600,
                lineHeight: 1.5,
                whiteSpace: "nowrap",
                color: isHovered ? hoverTextColor : textColor,
                borderRadius: `${cornerRadius}px`,
                textDecoration: "none",
                cursor: "pointer",
                outlineColor: pillColor,
                willChange: "transform",
                transform: `translateX(${physicalRects[index]?.x ?? 0}px)`,
              }}
              className="focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span>{item.label}</span>

              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "5px",
                    marginLeft: "-2px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "currentColor",
                  }}
                />
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export default GooeyNavbar;
