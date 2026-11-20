"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import "./chroma-grid.css";

export interface ChromaItem {
  image: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  url?: string;
  alt?: string;
  borderColor?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  radius?: number;
  softness?: number;
  damping?: number;
  fadeOut?: number;
  grayscale?: number;
  dim?: number;
  glow?: number;
  borderGlow?: number;
  reveal?: "spotlight" | "card";
  aspectRatio?: string;
  cardRadius?: number;
  showInfo?: boolean;
  frame?: boolean;
  theme?: "dark" | "light";
  className?: string;
}

const THEMES: Record<"dark" | "light", Record<string, string>> = {
  dark: {
    "--chroma-frame": "rgba(16, 16, 16, 0.96)",
    "--chroma-frame-edge": "rgba(255, 255, 255, 0.12)",
    "--chroma-frame-highlight": "rgba(255, 255, 255, 0.16)",
    "--chroma-frame-shadow": "0 22px 44px -20px rgba(0, 0, 0, 0.85), 0 6px 16px -8px rgba(0, 0, 0, 0.55)",
    "--chroma-tile": "linear-gradient(180deg, #232323 0%, #141414 100%)",
    "--chroma-tile-edge": "rgba(255, 255, 255, 0.12)",
    "--chroma-tile-highlight": "rgba(255, 255, 255, 0.16)",
    "--chroma-tile-shadow": "0 4px 10px -4px rgba(0, 0, 0, 0.7)",
    "--chroma-media-edge": "rgba(255, 255, 255, 0.1)",
    "--chroma-well": "rgba(255, 255, 255, 0.08)",
    "--chroma-ink": "#fafafa",
    "--chroma-muted": "#a3a3a3",
    "--chroma-hover": "brightness(1.14)",
    "--chroma-press": "brightness(0.82)"
  },
  light: {
    "--chroma-frame": "rgba(240, 240, 240, 0.96)",
    "--chroma-frame-edge": "rgba(0, 0, 0, 0.08)",
    "--chroma-frame-highlight": "rgba(255, 255, 255, 0.98)",
    "--chroma-frame-shadow": "0 22px 44px -22px rgba(0, 0, 0, 0.16), 0 6px 16px -10px rgba(0, 0, 0, 0.1)",
    "--chroma-tile": "linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)",
    "--chroma-tile-edge": "rgba(0, 0, 0, 0.08)",
    "--chroma-tile-highlight": "rgba(255, 255, 255, 1)",
    "--chroma-tile-shadow": "0 4px 10px -5px rgba(0, 0, 0, 0.12)",
    "--chroma-media-edge": "rgba(0, 0, 0, 0.06)",
    "--chroma-well": "rgba(0, 0, 0, 0.05)",
    "--chroma-ink": "#0a0a0a",
    "--chroma-muted": "#525252",
    "--chroma-hover": "brightness(0.97)",
    "--chroma-press": "brightness(0.92)"
  }
};

const sampleShot = (h: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${h},14%,22%)'/%3E%3Cstop offset='1' stop-color='hsl(${h},16%,36%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3C/svg%3E`;

export const CHROMA_DEFAULT_ITEMS: ChromaItem[] = [
  { image: sampleShot(210), title: "جادهٔ مه", subtitle: "کوهستان", accent: "#7cc4ff" },
  { image: sampleShot(222), title: "فیوردِ آبی", subtitle: "دریا", accent: "#4ca8ff" },
  { image: sampleShot(234), title: "کمپِ برفی", subtitle: "سفر", accent: "#a98bff" },
  { image: sampleShot(204), title: "آبشار", subtitle: "جنگل", accent: "#4cff9d" },
  { image: sampleShot(216), title: "آخرینِ نور", subtitle: "غروب", accent: "#ff8a4c" },
  { image: sampleShot(228), title: "قایقِ دریاچه", subtitle: "سکوت", accent: "#ff7eb6" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const falloffStops = (softness: number) => {
  const core = clamp(1 - softness, 0, 0.95);
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = clamp((t - core) / Math.max(0.0001, 1 - core), 0, 1);
    const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
    stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
  }
  return stops.join(", ");
};

export const ChromaGrid = ({
  items,
  columns = 3,
  minCardWidth = 180,
  gap = 12,
  radius = 260,
  softness = 0.6,
  damping = 0.45,
  fadeOut = 0.6,
  grayscale = 1,
  dim = 0.12,
  glow = 0.5,
  borderGlow = 1,
  reveal = "spotlight",
  aspectRatio = "3 / 2",
  cardRadius = 22,
  showInfo = true,
  frame = false,
  theme = "dark",
  className = ""
}: ChromaGridProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<{ damping: number; fadeOut: number; spotlight: boolean } | null>(null);
  const placeRef = useRef<(() => void) | null>(null);
  const data = items?.length ? items : CHROMA_DEFAULT_ITEMS;
  settingsRef.current = { damping, fadeOut, spotlight: reveal !== "card" };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;
    let last = 0;

    const place = () => {
      const box = root.getBoundingClientRect();
      root.querySelectorAll<HTMLElement>("[data-chroma-area]").forEach(node => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--chroma-ox", `${rect.left - box.left}px`);
        node.style.setProperty("--chroma-oy", `${rect.top - box.top}px`);
      });
    };
    placeRef.current = place;

    const frame = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const follow = reduce ? 1 : 1 - Math.exp(-dt / Math.max(0.01, s.damping * 0.32));
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;
      const span = state.target > state.power ? 0.1 : Math.max(0.02, s.fadeOut * 0.35);
      state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));
      root.style.setProperty("--chroma-x", `${state.x.toFixed(2)}px`);
      root.style.setProperty("--chroma-y", `${state.y.toFixed(2)}px`);
      root.style.setProperty("--chroma-power", state.power.toFixed(4));
      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;
      if (settled) {
        state.power = state.target;
        root.style.setProperty("--chroma-power", state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (!settingsRef.current?.spotlight) return;
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(root);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);
    place();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
      placeRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    placeRef.current?.();
  });

  const rootStyle = {
    ...(THEMES[theme] ?? THEMES.dark),
    "--chroma-cols": Math.max(1, Math.round(columns)),
    "--chroma-min": `${Math.max(80, minCardWidth)}px`,
    "--chroma-gap": `${Math.max(0, gap)}px`,
    "--chroma-r": `${Math.max(20, radius)}px`,
    "--chroma-stops": falloffStops(clamp(softness, 0, 1)),
    "--chroma-gray": clamp(grayscale, 0, 1),
    "--chroma-dim": clamp(dim, 0, 0.9),
    "--chroma-glow": clamp(glow, 0, 1),
    "--chroma-border": clamp(borderGlow, 0, 1),
    "--chroma-fade": `${Math.max(0, fadeOut)}s`,
    "--chroma-ratio": aspectRatio,
    "--chroma-radius": `${Math.max(0, cardRadius)}px`
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`chroma-grid${frame ? " has-frame" : ""}${className ? ` ${className}` : ""}`}
      data-reveal={reveal === "card" ? "card" : "spotlight"}
      style={rootStyle}
    >
      <div className="chroma-grid-inner">
        {data.map((item, index) => {
          const accent = item.accent ?? item.borderColor ?? "#ffffff";
          const key = `${item.title}-${index}`;
          const cardStyle = { "--chroma-accent": accent } as CSSProperties;
          const body = (
            <>
              <span className="chroma-wash" aria-hidden="true" />
              <div className="chroma-media" data-chroma-area="">
                <img className="chroma-mono" src={item.image} alt={item.alt ?? item.title ?? ""} loading="lazy" />
                <img className="chroma-color" src={item.image} alt="" aria-hidden="true" loading="lazy" />
                <span className="chroma-media-rim" aria-hidden="true" />
              </div>
              {showInfo && (item.title || item.subtitle) && (
                <div className="chroma-info">
                  {item.title && <span className="chroma-title">{item.title}</span>}
                  {item.subtitle && <span className="chroma-subtitle">{item.subtitle}</span>}
                </div>
              )}
              <span className="chroma-card-rim" aria-hidden="true" />
              <span className="chroma-card-glow" aria-hidden="true" />
            </>
          );
          return item.url ? (
            <a
              key={key}
              className="chroma-card"
              data-chroma-area=""
              style={cardStyle}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {body}
            </a>
          ) : (
            <article key={key} className="chroma-card" data-chroma-area="" style={cardStyle}>
              {body}
            </article>
          );
        })}
      </div>
      {frame && <span className="chroma-frame-rim" aria-hidden="true" />}
    </div>
  );
};

export default ChromaGrid;
