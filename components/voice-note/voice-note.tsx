"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";

import "./voice-note.css";

const H = 56;
const IDLE_W = 216;
const OPEN_W = 300;
const SAMPLE = 70;
const CANCEL = 90;
const MIN_MS = 500;
const MAX_MS = 30000;

type Phase = "idle" | "rec" | "cancel" | "clip";
type Clip = { raw: number[]; ms: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const toFaDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

function standIn(t: number) {
  const syll = Math.abs(Math.sin(t * 6.1) * Math.sin(t * 1.9 + 0.7));
  const phrase = Math.sin(t * 0.9 + 0.4) > -0.55 ? 1 : 0.1;
  return Math.min(1, 0.06 + syll * phrase * (0.5 + Math.random() * 0.5));
}

function resample(src: number[], n: number) {
  if (!src.length) return Array(n).fill(0);
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor((i * src.length) / n);
    const b = Math.max(a + 1, Math.floor(((i + 1) * src.length) / n));
    let m = 0;
    for (let k = a; k < b && k < src.length; k++) m = Math.max(m, src[k]);
    return m;
  });
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return toFaDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
};

const PLAY = [[7, 4, 13, 7.6, 13, 16.4, 7, 20], [13, 7.6, 19, 12, 19, 12, 13, 16.4]];
const PAUSE = [[7, 5, 10.5, 5, 10.5, 19, 7, 19], [13.5, 5, 17, 5, 17, 19, 13.5, 19]];

function PlayMark({ on }: { on: boolean }) {
  const [t, setT] = useState(on ? 1 : 0);
  const now = useRef(t);
  now.current = t;
  useEffect(() => {
    const from = now.current;
    const to = on ? 1 : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (ts: number) => {
      const u = Math.min(1, (ts - t0) / 220);
      setT(from + (to - from) * (1 - Math.pow(1 - u, 4)));
      if (u < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  const d = PLAY.map((q, k) => {
    const p = q.map((v, i) => (v + (PAUSE[k][i] - v) * t).toFixed(2));
    return `M${p[0]} ${p[1]}L${p[2]} ${p[3]}L${p[4]} ${p[5]}L${p[6]} ${p[7]}Z`;
  }).join("");
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={d}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicMark() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="8.5" y="2" width="7" height="12.5" rx="3.5" fill="currentColor" stroke="none" />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5V22" />
    </svg>
  );
}

export interface VoiceNoteProps {
  bars?: number;
  gain?: number;
  bounce?: number;
  corner?: number;
  surfaceColor?: string;
  textColor?: string;
  waveColor?: string;
  accentColor?: string;
  className?: string;
  autoPreview?: boolean;
}

export function VoiceNote({
  bars = 28,
  gain = 60,
  bounce = 40,
  corner = H / 2,
  surfaceColor = "#232323",
  textColor = "#fafafa",
  waveColor = "#8f8f94",
  accentColor = "#e5484d",
  className,
  autoPreview = false,
}: VoiceNoteProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [levels, setLevels] = useState<number[]>([]);
  const [ms, setMs] = useState(0);
  const [clip, setClip] = useState<Clip | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);

  const ph = useRef<Phase>("idle");
  const raw = useRef<number[]>([]);
  const t0 = useRef(0);
  const timer = useRef(0);
  const later = useRef(0);
  const x0 = useRef(0);
  const wave = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const prog = useRef(0);
  const praf = useRef(0);
  const scrub = useRef(false);
  const clipRef = useRef<Clip | null>(null);
  clipRef.current = clip;

  const go = (p: Phase) => {
    ph.current = p;
    setPhase(p);
  };

  const n = Math.round(clamp(bars, 12, 48));
  const g = 0.4 + (clamp(gain, 0, 100) / 100) * 1.2;
  const r = clamp(corner, 0, H / 2);
  const inner = Math.max(0, r - 6 * Math.min(1, r / 12));

  useEffect(
    () => () => {
      clearInterval(timer.current);
      clearTimeout(later.current);
      cancelAnimationFrame(praf.current);
    },
    [],
  );

  const paintProg = () => {
    wave.current?.style.setProperty("--prog", prog.current.toFixed(4));
    const c = clipRef.current;
    if (time.current && c) {
      const p = prog.current;
      time.current.textContent = fmt(p > 0 && p < 1 ? p * c.ms : c.ms);
    }
  };

  const stopPlay = () => {
    cancelAnimationFrame(praf.current);
    praf.current = 0;
    setPlaying(false);
  };

  const close = () => {
    go("cancel");
    clearTimeout(later.current);
    later.current = window.setTimeout(() => {
      setClip(null);
      pullRef.current = 0;
      setPull(0);
      go("idle");
    }, 360);
  };

  const end = (cancel: boolean) => {
    if (ph.current !== "rec") return;
    clearInterval(timer.current);
    const took = performance.now() - t0.current;
    const keep = !cancel && took >= MIN_MS;
    if (!keep) {
      close();
      return;
    }
    prog.current = 0;
    setClip({ raw: raw.current.slice(), ms: took });
    pullRef.current = 0;
    setPull(0);
    go("clip");
  };

  const begin = () => {
    if (ph.current !== "idle") return;
    raw.current = [];
    setLevels([]);
    setMs(0);
    pullRef.current = 0;
    setPull(0);
    t0.current = performance.now();
    go("rec");
    clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const took = performance.now() - t0.current;
      raw.current.push(standIn(took / 1000));
      setLevels(raw.current.slice(-64));
      setMs(took);
      if (took >= MAX_MS) end(false);
    }, SAMPLE);
  };

  const toggle = () => {
    const c = clipRef.current;
    if (!c) return;
    if (praf.current) {
      stopPlay();
      return;
    }
    if (prog.current >= 1) prog.current = 0;
    setPlaying(true);
    let prev = performance.now();
    const step = (ts: number) => {
      if (!scrub.current) prog.current = Math.min(1, prog.current + (ts - prev) / c.ms);
      prev = ts;
      paintProg();
      if (prog.current >= 1) {
        stopPlay();
        return;
      }
      praf.current = requestAnimationFrame(step);
    };
    praf.current = requestAnimationFrame(step);
  };

  const seek = (clientX: number) => {
    const el = wave.current;
    const c = clipRef.current;
    if (!el || !c) return;
    const b = el.getBoundingClientRect();
    prog.current = clamp((clientX - b.left) / b.width, 0, 1);
    paintProg();
  };

  const discard = () => {
    stopPlay();
    close();
  };

  const call = useRef({ begin, end, toggle, discard });
  call.current = { begin, end, toggle, discard };
  useEffect(() => {
    if (!autoPreview) return undefined;
    let alive = true;
    let timer = 0;
    const at = (ms: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (alive) fn();
      }, ms);
    };
    const cycle = () => {
      call.current.begin();
      at(2300, () => call.current.end(false));
      at(3100, () => call.current.toggle());
      at(5000, () => call.current.discard());
      at(5800, cycle);
    };
    at(800, cycle);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPreview]);

  const bar = (v: number, i: number, key: string | number) => (
    <i
      key={key}
      className="vn-bar"
      style={{ "--l": clamp(v * g, 0, 1).toFixed(3), "--i": i } as CSSProperties}
    />
  );

  const recBars = () => {
    const start = raw.current.length - levels.length;
    const out = [];
    for (let j = 0; j < n; j++) {
      const k = levels.length - n + j;
      out.push(k >= 0 ? bar(levels[k], j, start + k) : bar(0, j, `e${j}`));
    }
    return out;
  };

  const shift = pull * CANCEL * 0.5;
  const armed = pull >= 1;
  const open = phase !== "idle";
  const showClip = clip && (phase === "clip" || phase === "cancel");

  return (
    <div
      className={className ? `vn-frame ${className}` : "vn-frame"}
      style={
        {
          "--vn-surface": surfaceColor,
          "--vn-ink": textColor,
          "--vn-wave": waveColor,
          "--vn-accent": accentColor,
        } as CSSProperties
      }
    >
      <div
        className="vn"
        data-phase={phase}
        role={phase === "idle" || phase === "rec" ? "button" : undefined}
        tabIndex={phase === "idle" || phase === "rec" ? 0 : -1}
        aria-label={
          phase === "rec"
            ? "در حال ضبط؛ برای نگه داشتن رها کن و برای دور ریختن Escape بزن"
            : phase === "idle"
              ? "برای ضبط ویس نگه دار"
              : undefined
        }
        style={
          {
            "--w": `${open ? OPEN_W : IDLE_W}px`,
            "--r": `${r}px`,
            "--inner": `${inner}px`,
            "--ov": (clamp(bounce, 0, 100) / 100).toFixed(3),
            "--pull": pull.toFixed(3),
          } as CSSProperties
        }
        onPointerDown={(e) => {
          if (ph.current !== "idle") return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            void 0;
          }
          x0.current = e.clientX;
          begin();
        }}
        onPointerMove={(e) => {
          if (ph.current !== "rec") return;
          const p = clamp((e.clientX - x0.current) / CANCEL, 0, 1);
          pullRef.current = p;
          setPull(p);
        }}
        onPointerUp={(e) => {
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            void 0;
          }
          end(pullRef.current >= 1);
        }}
        onPointerCancel={() => end(false)}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat && ph.current === "idle") {
            e.preventDefault();
            begin();
          } else if (e.key === "Escape" && ph.current === "rec") {
            end(true);
          }
        }}
        onKeyUp={(e) => {
          if ((e.key === " " || e.key === "Enter") && ph.current === "rec") {
            e.preventDefault();
            end(false);
          }
        }}
        onBlur={() => {
          if (ph.current === "rec") end(false);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {phase === "idle" && (
          <span key="idle" className="vn-in vn-idle">
            <MicMark />
            نگه دار تا ویس بذاری
          </span>
        )}

        {(phase === "rec" || (phase === "cancel" && !clip)) && (
          <span key="rec" className="vn-in vn-rec" style={{ translate: `${shift}px 0` }}>
            <span className="vn-dot" />
            <span className="vn-time">{fmt(ms)}</span>
            <span className="vn-wave" style={{ "--n": n } as CSSProperties}>
              {recBars()}
            </span>
          </span>
        )}

        {(phase === "rec" || (phase === "cancel" && !clip)) && (
          <span className="vn-cancel" data-on={armed || undefined} aria-hidden="true">
            <X size={16} strokeWidth={2} />
          </span>
        )}

        {showClip && (
          <span key="clip" className="vn-in vn-clip">
            <button
              type="button"
              className="vn-play"
              aria-label={playing ? "مکث" : "پخش"}
              onClick={toggle}
            >
              <PlayMark on={playing} />
            </button>
            <span
              ref={wave}
              className="vn-wave vn-scrub"
              style={{ "--n": n, "--prog": prog.current } as CSSProperties}
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  void 0;
                }
                scrub.current = true;
                seek(e.clientX);
              }}
              onPointerMove={(e) => {
                if (scrub.current) seek(e.clientX);
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {
                  void 0;
                }
                scrub.current = false;
              }}
              onPointerCancel={() => {
                scrub.current = false;
              }}
            >
              {resample(clip.raw, n).map((v, i) => bar(v, i, i))}
            </span>
            <span ref={time} className="vn-time">
              {fmt(clip.ms)}
            </span>
            <button type="button" className="vn-x" aria-label="حذف ویس" onClick={discard}>
              <X size={18} strokeWidth={2} />
            </button>
          </span>
        )}
      </div>
      <span
        className="vn-hint"
        data-on={phase === "rec" || undefined}
        data-armed={armed || undefined}
        aria-hidden="true"
      >
        {armed ? "رها کن تا لغو شه" : "برای لغو بکش"}
      </span>
    </div>
  );
}

export default VoiceNote;
