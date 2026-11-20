"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import "./accordion-gallery.css";

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  activeIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const sampleShot = (h: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${h},14%,22%)'/%3E%3Cstop offset='1' stop-color='hsl(${h},16%,36%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3C/svg%3E`;

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: sampleShot(210), label: "درّه", link: "#" },
  { image: sampleShot(222), label: "یالِ کوه", link: "#" },
  { image: sampleShot(200), label: "آبشار", link: "#" },
  { image: sampleShot(232), label: "بندر", link: "#" },
  { image: sampleShot(218), label: "خطِ آسمان", link: "#" },
];

const EASE_MAP: Record<string, string> = {
  "power1.out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  "power2.out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
  "power3.out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
  "power4.out": "cubic-bezier(0.23, 1, 0.32, 1)",
  "power2.inOut": "cubic-bezier(0.645, 0.045, 0.355, 1)",
  "power3.inOut": "cubic-bezier(0.77, 0, 0.175, 1)",
  "power4.inOut": "cubic-bezier(0.86, 0, 0.07, 1)",
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  activeIndex,
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = true,
  className = "",
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const vertical = orientation === "vertical";
  const count = items.length;
  const [active, setActive] = useState(() => clamp(Math.round(defaultIndex), 0, count - 1));
  const [mediaSize, setMediaSize] = useState(320);

  const r = clamp(expandRatio, 0.2, 0.9);
  const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
  const dur = Math.max(duration, 0);
  const curve = EASE_MAP[ease] ?? EASE_MAP["power3.out"];

  const measure = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    const usable = Math.max(total - gap * (count - 1), 120);
    const size = Math.max(140, usable * r * 1.22);
    setMediaSize(size);
  }, [vertical, gap, count, r]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (activeIndex === undefined) return;
    const next = clamp(Math.round(activeIndex), 0, count - 1);
    setActive((prev) => (prev === next ? prev : next));
  }, [activeIndex, count]);

  const handleEnter = (i: number) => {
    if (trigger === "hover") setActive(i);
  };

  const handleClick = (i: number, e: ReactMouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  const rootStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    "--ag-media-size": `${mediaSize}px`,
    "--ag-dur": `${dur}s`,
    "--ag-ease": curve,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      role="list"
      aria-label="گالریِ آکاردئونیِ تصویر"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = (item.link ? "a" : "div") as "a";
        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const panelTransform = vertical
          ? `rotateX(${(-rot).toFixed(3)}deg)`
          : `rotateY(${rot.toFixed(3)}deg)`;
        const drift = clamp(active - i, -1.5, 1.5);
        const shift = drift * parallax * mediaSize * 0.06;
        const mediaTransform = `translate(-50%, -50%) translate(${
          vertical ? "0px" : isActive ? "0px" : `${shift.toFixed(2)}px`
        }, ${vertical ? (isActive ? "0px" : `${shift.toFixed(2)}px`) : "0px"})`;
        const panelVars = {
          "--ag-gray": grayscale ? (isActive ? 0 : 1) : 0,
          "--ag-dim": isActive ? 0 : 0.35,
        } as CSSProperties;
        const labelClosed = showLabels && !isActive;
        return (
          <Tag
            key={i}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            style={{
              ...panelVars,
              flexGrow: isActive ? grow : 1,
              borderRadius: `${radius}px`,
              transform: panelTransform,
            }}
            href={item.link || undefined}
            onClick={(e) => handleClick(i, e as unknown as ReactMouseEvent)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? "true" : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span className="ag-panel__media" style={{ transform: mediaTransform }}>
                <img src={item.image} alt={item.alt || item.label || ""} draggable={false} />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: labelClosed ? "translateX(-14px)" : "translateX(0px)",
                    transitionDuration: labelClosed ? `${(dur * 0.6).toFixed(2)}s` : `${dur}s`,
                  }}
                />
                <span
                  className="ag-panel__text"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: labelClosed ? "translateX(-14px)" : "translateX(0px)",
                    transitionDuration: labelClosed ? `${(dur * 0.6).toFixed(2)}s` : `${dur}s`,
                    transitionDelay: isActive ? `${Math.max(stagger, 0)}s` : "0s",
                  }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
