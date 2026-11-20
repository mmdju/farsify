"use client";

import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./refine-frame.css";

export type RefineFrameStatus = "queued" | "generating" | "refining" | "complete" | "error";

export interface RefineFrameProps {
  status?: RefineFrameStatus;
  children?: ReactNode;
  aspectRatio?: string;
  width?: number;
  radius?: number;
  background?: string;
  color?: string;
  stageDuration?: number;
  sweep?: boolean;
  showStatus?: boolean;
  hideAfter?: number;
  labels?: Partial<Record<RefineFrameStatus, string>>;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

type Stage = { blur: number; sat: number; scale: number; opacity: number };
interface Sim {
  p: number;
  raf: number;
  last: number;
  key: string;
  w: number;
  h: number;
  levels: HTMLCanvasElement[];
  glint: CanvasGradient | null;
  sent: boolean;
}
interface Live {
  status: RefineFrameStatus;
  stageDuration: number;
  sweep: boolean;
  reduce: boolean;
}

const STAGES: Record<RefineFrameStatus, Stage> = {
  queued: { blur: 4, sat: 0.6, scale: 1.04, opacity: 0.55 },
  generating: { blur: 1.5, sat: 0.8, scale: 1.02, opacity: 0.85 },
  refining: { blur: 0.5, sat: 0.95, scale: 1.005, opacity: 1 },
  complete: { blur: 0, sat: 1, scale: 1, opacity: 1 },
  error: { blur: 2, sat: 0.5, scale: 1, opacity: 0.28 },
};
const TARGET: Partial<Record<RefineFrameStatus, number>> = {
  queued: 0,
  generating: 0.5,
  refining: 0.875,
  complete: 1,
};
const LEVELS = [48, 32, 20, 12, 8, 5, 3, 2, 1];
const EDGE = 28;
const STRIPS = 14;
const DEFAULT_LABELS: Record<RefineFrameStatus, string> = {
  queued: "در نوبت",
  generating: "در حال تولید",
  refining: "در حال بهبود",
  complete: "آماده",
  error: "ناموفق",
};
const ACTIVE = new Set<string>(["queued", "generating", "refining"]);

const build = (
  s: Sim,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  dpr: number,
) => {
  const rect = canvas.getBoundingClientRect();
  const W = Math.max(1, Math.round(rect.width * dpr));
  const H = Math.max(1, Math.round(rect.height * dpr));
  const key = `${img.currentSrc}|${W}x${H}`;
  if (s.key === key) return;
  s.key = key;
  s.w = W;
  s.h = H;
  canvas.width = W;
  canvas.height = H;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const cover = Math.max(W / iw, H / ih);
  const sw = W / cover;
  const sh = H / cover;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  const glint = canvas.getContext("2d")?.createLinearGradient(0, 0, W, 0) ?? null;
  if (glint) {
    for (const [at, a] of [
      [0, 0],
      [0.08, 0.1],
      [0.2, 0.7],
      [0.32, 1],
      [0.68, 1],
      [0.8, 0.7],
      [0.92, 0.1],
      [1, 0],
    ]) {
      glint.addColorStop(at, `rgba(255, 255, 255, ${a})`);
    }
  }
  s.glint = glint;
  s.levels = LEVELS.map((block) => {
    const b = block === 1 ? 1 : Math.max(2, Math.round(block * dpr));
    const full = document.createElement("canvas");
    full.width = W;
    full.height = H;
    const fc = full.getContext("2d");
    if (!fc) return full;
    if (b === 1) {
      fc.imageSmoothingEnabled = true;
      fc.imageSmoothingQuality = "high";
      fc.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      return full;
    }
    const small = document.createElement("canvas");
    small.width = Math.max(1, Math.round(W / b));
    small.height = Math.max(1, Math.round(H / b));
    const sc = small.getContext("2d");
    if (sc) {
      sc.imageSmoothingEnabled = true;
      sc.imageSmoothingQuality = "high";
      sc.drawImage(img, sx, sy, sw, sh, 0, 0, small.width, small.height);
    }
    fc.imageSmoothingEnabled = false;
    fc.drawImage(small, 0, 0, W, H);
    return full;
  });
};

function TickIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 14L8.5 17.5L19 6.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIcon() {
  const rays = [
    "M12 3V6",
    "M12 18V21",
    "M21 12L18 12",
    "M6 12L3 12",
    "M18.3635 5.63672L16.2422 7.75804",
    "M7.75804 16.2422L5.63672 18.3635",
    "M18.3635 18.3635L16.2422 16.2422",
    "M7.75804 7.75804L5.63672 5.63672",
  ];
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {rays.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.0092 2V5.13219C20.0092 5.42605 19.6418 5.55908 19.4537 5.33333C17.6226 3.2875 14.9617 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const RefineFrame: React.FC<RefineFrameProps> = ({
  status = "generating",
  children,
  aspectRatio = "4 / 3",
  width = 320,
  radius = 16,
  background = "#232323",
  color = "#fafafa",
  stageDuration = 400,
  sweep = true,
  showStatus = true,
  hideAfter = 1200,
  labels = DEFAULT_LABELS,
  retryLabel = "تلاش مجدد",
  onRetry,
  className = "",
}) => {
  const stage = STAGES[status] ?? STAGES.generating;
  const active = ACTIVE.has(status);
  const text = { ...DEFAULT_LABELS, ...labels };
  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sim = useRef<Sim>({
    p: 0,
    raf: 0,
    last: 0,
    key: "",
    w: 0,
    h: 0,
    levels: [],
    glint: null,
    sent: false,
  });
  const live = useRef<Live>({ reduce: false } as Live);
  live.current.status = status;
  live.current.stageDuration = stageDuration;
  live.current.sweep = sweep;
  const [mosaic, setMosaic] = useState(false);
  const [resolved, setResolved] = useState(false);

  const [chip, setChip] = useState(showStatus);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    if (!showStatus) {
      setChip(false);
      return undefined;
    }
    setChip(true);
    if (status === "complete" && hideAfter > 0) {
      timer.current = setTimeout(() => setChip(false), hideAfter);
    }
    return () => clearTimeout(timer.current);
  }, [status, showStatus, hideAfter]);

  const tick = (now: number) => {
    const s = sim.current;
    const c = live.current;
    const canvas = canvasRef.current;
    const img = printRef.current?.querySelector("img") as HTMLImageElement | null;
    if (!canvas || !img || !img.naturalWidth) {
      s.raf = 0;
      return;
    }
    const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016);
    s.last = now;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    build(s, canvas, img, dpr);
    const n = s.levels.length - 1;
    const target = TARGET[c.status] ?? s.p;
    const rate = c.reduce ? 1e9 : 1 / (n * (c.stageDuration / 1000));
    const step = rate * dt;
    if (target < s.p) s.p = target;
    else if (target - s.p <= step) s.p = target;
    else s.p += step;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const L = s.p * n;
      const i = Math.min(n, Math.floor(L + 1e-6));
      const frac = L - i;
      ctx.globalAlpha = 1;
      ctx.drawImage(s.levels[i], 0, 0);
      if (i < n && frac > 0) {
        const edge = EDGE * dpr;
        const front = frac * (s.h + edge) - edge / 2;
        const top = Math.max(0, Math.floor(front - edge / 2));
        if (top > 0) ctx.drawImage(s.levels[i + 1], 0, 0, s.w, top, 0, 0, s.w, top);
        const sh = edge / STRIPS;
        for (let k = 0; k < STRIPS; k += 1) {
          const y = front - edge / 2 + k * sh;
          if (y + sh <= 0 || y >= s.h) continue;
          const t = 1 - (k + 0.5) / STRIPS;
          ctx.globalAlpha = t * t * (3 - 2 * t);
          const y0 = Math.max(0, y);
          const h0 = Math.min(s.h, y + sh) - y0;
          if (h0 > 0) ctx.drawImage(s.levels[i + 1], 0, y0, s.w, h0, 0, y0, s.w, h0);
        }
        ctx.globalAlpha = 1;
        if (c.sweep && !c.reduce && s.glint && front > 0 && front < s.h) {
          ctx.fillStyle = s.glint;
          ctx.globalAlpha = 0.12;
          ctx.fillRect(0, front - 2 * dpr, s.w, 4 * dpr);
          ctx.globalAlpha = 0.3;
          ctx.fillRect(0, front - dpr, s.w, 2 * dpr);
          ctx.globalAlpha = 1;
        }
      }
    }
    const done = s.p >= 1;
    if (done !== s.sent) {
      s.sent = done;
      setResolved(done);
    }
    const keep = (!c.reduce && ACTIVE.has(c.status)) || Math.abs(target - s.p) > 0.0005;
    s.raf = keep ? requestAnimationFrame(tick) : 0;
    if (!keep) s.last = 0;
  };
  const wake = () => {
    const s = sim.current;
    if (!s.raf) s.raf = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      live.current.reduce = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const img = printRef.current?.querySelector("img") as HTMLImageElement | null;
    if (!img) {
      setMosaic(false);
      return undefined;
    }
    let gone = false;
    const start = () => {
      if (gone) return;
      setMosaic(true);
      wake();
    };
    img.addEventListener("load", start, { once: true });
    img.addEventListener("error", start, { once: true });
    if (img.complete && img.naturalWidth) start();
    let retry = 0;
    const watch = setInterval(() => {
      if (gone || (img.complete && img.naturalWidth)) {
        clearInterval(watch);
        if (!gone && img.naturalWidth) start();
        return;
      }
      if (++retry > 40) clearInterval(watch);
    }, 500);
    return () => {
      gone = true;
      clearInterval(watch);
      img.removeEventListener("load", start);
      img.removeEventListener("error", start);
    };
  }, [children, status]);

  useEffect(() => {
    wake();
  }, [status, width, aspectRatio]);

  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  return (
    <div
      className={`refine-frame${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={text[status] ?? status}
      aria-busy={active || undefined}
      data-status={status}
      data-active={active ? "" : undefined}
      data-sweep={sweep && active ? "" : undefined}
      data-mosaic={mosaic ? "" : undefined}
      data-resolved={mosaic && resolved ? "" : undefined}
      style={
        {
          "--rf-w": `${width}px`,
          "--rf-aspect": aspectRatio,
          "--rf-radius": `${radius}px`,
          "--rf-bg": background,
          "--rf-ink": color,
          "--rf-stage": `${stageDuration}ms`,
          "--rf-blur": `${mosaic ? 0 : stage.blur}px`,
          "--rf-sat": stage.sat,
          "--rf-scale": mosaic ? 1 : stage.scale,
          "--rf-opacity": stage.opacity,
        } as CSSProperties
      }
    >
      <div className="refine-frame__media" aria-hidden="true">
        <div ref={printRef} className="refine-frame__print">
          {children}
        </div>
        <canvas ref={canvasRef} className="refine-frame__mosaic" />
      </div>
      <div className="refine-frame__sweep" aria-hidden="true" />
      {chip ? (
        <div className="refine-frame__chip" aria-hidden="true">
          <span className="refine-frame__mark" data-kind={active ? "spin" : status}>
            {status === "complete" ? (
              <TickIcon />
            ) : status === "error" ? (
              <AlertIcon />
            ) : (
              <LoadingIcon />
            )}
          </span>
          <span key={status} className="refine-frame__label">
            {text[status] ?? status}
          </span>
        </div>
      ) : null}
      {status === "error" && onRetry ? (
        <button type="button" className="refine-frame__retry" onClick={onRetry}>
          <RefreshIcon />
          <span>{retryLabel}</span>
        </button>
      ) : null}
      <span className="refine-frame__sr" role="status">
        {text[status] ?? status}
      </span>
    </div>
  );
};

export default RefineFrame;
