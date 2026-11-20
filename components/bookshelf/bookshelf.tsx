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

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";

import "./bookshelf.css";

export type Pt = { x: number; y: number };

function tether(p: Pt, c: Pt, r: number): Pt {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const d = Math.hypot(dx, dy);
  return d > r ? { x: c.x + (dx / d) * r, y: c.y + (dy / d) * r } : p;
}

function cut(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

function fold(W: number, H: number, cy: number, pull: Pt) {
  const C = { x: W, y: cy };
  const M = tether(tether(pull, { x: 0, y: cy }, W), { x: 0, y: H - cy }, Math.hypot(W, H));

  const len = Math.hypot(M.x - C.x, M.y - C.y);
  const n = len < 1e-6 ? { x: -1, y: 0 } : { x: (M.x - C.x) / len, y: (M.y - C.y) / len };
  const m = { x: (M.x + C.x) / 2, y: (M.y + C.y) / 2 };
  const side = (p: Pt) => (p.x - m.x) * n.x + (p.y - m.y) * n.y;

  const page = [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: H },
    { x: 0, y: H },
  ];

  return {
    M,
    n,
    m,
    flat: cut(page, side),
    flap: cut(page, (p) => -side(p)),
    reflect: (p: Pt): Pt => {
      const s = 2 * side(p);
      return { x: p.x - s * n.x, y: p.y - s * n.y };
    },
    progress: Math.min(1, Math.max(0, (W - M.x) / (2 * W))),
  };
}

const polygon = (pts: Pt[]) =>
  pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts.map((p) => `${p.x}px ${p.y}px`).join(", ")})`;

function ramp(g: Pt, p0: Pt, W: number, H: number, stops: [string, number][]) {
  const angle = (Math.atan2(g.x, -g.y) * 180) / Math.PI;
  const length = Math.abs(W * g.x) + Math.abs(H * g.y);
  const t0 = (p0.x - W / 2) * g.x + (p0.y - H / 2) * g.y + length / 2;
  return `linear-gradient(${angle}deg, ${stops.map(([c, s]) => `${c} ${t0 + s}px`).join(", ")})`;
}

const GAP = 96;
const WIDE = "(min-width: 768px)";

const LEAF_K = 170;
const GRAVITY = (3 * 9.81) / (2 * 0.15);
const HINGE_FRICTION = 1.5;
const RESTITUTION = 0.2;
const HAND_K = 190;
const SHIFT_K = 60;
const damp = (k: number) => 2 * Math.sqrt(k);
const EYE = 3600;
const THICKNESS = 8;

const spineLight = (dir: "90deg" | "270deg", cloth: string) =>
  `linear-gradient(${dir}, rgb(0 0 0/.35), rgb(255 255 255/.1) 3%, rgb(0 0 0/0) 7%), ${cloth}`;

const BLANK = -3;

const paper = "bg-[var(--bs-paper)] text-[var(--bs-ink)]";
const faint = "text-[var(--bs-ink-faint)]";

const subscribe = (onChange: () => void) => {
  const query = matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

type Side = "left" | "right";
type Board = "front" | "back";
type Turn = {
  geo: Side;
  to: number;
  front: number;
  back: number;
  under: [number, number];
  cy: number;
  W: number;
  H: number;
  reverse: boolean;
};
type Grab =
  | { kind: "cover"; board: Board; spine: number; reach: number; x: number; t: number; moved: boolean }
  | { kind: "page"; x: number; y: number; t: number; dir: "next" | "prev"; cy: number; dragging: boolean };

function Frame({
  side,
  head,
  folio,
  contentRef,
  children,
}: {
  side: Side;
  head?: string;
  folio?: number;
  contentRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${paper} flex h-full flex-col px-5 pt-6 pb-4 md:px-10 md:pt-7 ${
        side === "left"
          ? "rounded-l-[3px] shadow-[inset_-28px_0_28px_-24px_rgb(0_0_0/.28)]"
          : "rounded-r-[3px] shadow-[inset_28px_0_28px_-24px_rgb(0_0_0/.28)]"
      }`}
    >
      <p className={`h-4 truncate text-[10px] ${faint} ${side === "left" ? "text-left" : "text-right"}`}>
        {head}
      </p>
      <div ref={contentRef} className="relative mt-5 min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
      <p className={`mt-3 h-4 text-center text-[10px] tabular-fa ${faint}`}>{folio !== undefined ? formatFa(folio) : ""}</p>
    </div>
  );
}

export function Book({
  cloth,
  foil,
  title,
  author,
  series,
  blurb,
  runningHead,
  front,
  back,
  onClose,
  focusOnOpen = false,
  children,
}: {
  cloth: string;
  foil: string;
  title: string;
  author: string;
  series: string;
  blurb: string;
  runningHead: string;
  front: ReactNode;
  back: ReactNode;
  onClose?: (from: DOMRect, backUp: boolean) => void;
  focusOnOpen?: boolean;
  children: ReactNode;
}) {
  const wide = useSyncExternalStore(subscribe, () => matchMedia(WIDE).matches, () => true);
  const measure = useRef<HTMLDivElement>(null);
  const boardEl = useRef<HTMLDivElement>(null);
  const leftHalf = useRef<HTMLDivElement>(null);
  const rightHalf = useRef<HTMLDivElement>(null);
  const rightPage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, pages: 1 });
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const frontBoard = useRef<HTMLDivElement>(null);
  const frontOuterShade = useRef<HTMLSpanElement>(null);
  const frontInnerShade = useRef<HTMLSpanElement>(null);
  const frontEdgeShade = useRef<HTMLSpanElement>(null);
  const frontCast = useRef<HTMLSpanElement>(null);
  const backBoard = useRef<HTMLDivElement>(null);
  const backOuterShade = useRef<HTMLSpanElement>(null);
  const backInnerShade = useRef<HTMLSpanElement>(null);
  const backEdgeShade = useRef<HTMLSpanElement>(null);
  const backCast = useRef<HTMLSpanElement>(null);

  const frontEl = useRef<HTMLDivElement>(null);
  const frontShade = useRef<HTMLSpanElement>(null);
  const castEl = useRef<HTMLSpanElement>(null);
  const backEl = useRef<HTMLDivElement>(null);
  const backShade = useRef<HTMLSpanElement>(null);

  const leaf = useRef({ M: { x: 0, y: 0 }, v: { x: 0, y: 0 } });
  const boards = useRef({ front: { θ: 0, ω: 0 }, back: { θ: 0, ω: 0 } });
  const desk = useRef({ shift: 25, v: 0 });
  const leafFrame = useRef(0);
  const boardFrame = useRef(0);
  const moveFrame = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const afterLayout = useRef<(() => void) | null>(null);
  const grab = useRef<Grab | null>(null);
  const afterRest = useRef<(() => void) | null>(null);
  const cursor = useRef("");

  useEffect(() => {
    const el = measure.current!;
    const observer = new ResizeObserver(() => {
      const flow = el.firstElementChild as HTMLElement;
      const width = el.clientWidth;
      const pages = Math.max(1, Math.round((flow.scrollWidth + GAP) / (width + GAP)));
      setBox((b) => (b.width === width && b.pages === pages ? b : { width, pages }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const host = boardEl.current?.parentElement;
    if (!host) return;
    const update = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      setStage((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const endpaper = `linear-gradient(color-mix(in srgb, var(--bs-paper) 80%, transparent), color-mix(in srgb, var(--bs-paper) 80%, transparent)), ${cloth}`;

  const total = box.pages + 2;
  const last = wide ? Math.floor(total / 2) : total - 1;
  const pos = Math.min(at, last);
  const evenOf = (s: number) => 2 * s;
  const oddOf = (s: number) => 2 * s - 1;

  const shown = useRef({ front: "", back: "", left: "", right: "" });
  const setOnce = (key: keyof typeof shown.current, el: HTMLElement | null, prop: "opacity" | "visibility", v: string) => {
    if (!el || shown.current[key] === v) return;
    shown.current[key] = v;
    el.style[prop] = v;
  };

  const deskTarget = () => {
    const { front, back } = boards.current;
    if (!wide) return 0;
    return front.θ < Math.PI / 2 ? 25 : back.θ > Math.PI / 2 ? -25 : 0;
  };

  const paintBoards = () => {
    const board = boardEl.current;
    if (!board) return;
    const { front, back } = boards.current;
    board.style.translate = `${wide ? desk.current.shift : 0}% 0`;

    const fc = Math.cos(front.θ);
    frontBoard.current!.style.transform = `rotateY(${front.θ}rad)`;
    frontOuterShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, fc))}`;
    frontInnerShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, -fc))}`;
    frontEdgeShade.current!.style.opacity = `${0.45 * (1 - Math.sin(front.θ))}`;
    frontCast.current!.style.opacity = `${Math.max(0, fc)}`;
    frontCast.current!.style.width = `${Math.max(0, fc) * 100}%`;

    if (backBoard.current) {
      const bc = Math.cos(back.θ);
      backBoard.current.style.transform = `rotateY(${back.θ}rad)`;
      backInnerShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, bc))}`;
      backOuterShade.current!.style.opacity = `${0.32 * (1 - Math.max(0, -bc))}`;
      backEdgeShade.current!.style.opacity = `${0.45 * (1 - Math.sin(back.θ))}`;
      backCast.current!.style.opacity = `${Math.max(0, -bc)}`;
      backCast.current!.style.width = `${Math.max(0, -bc) * 100}%`;
    }

    const frontFlat = front.θ > Math.PI - 1e-3;
    const backFlat = back.θ < 1e-3;
    setOnce("front", frontBoard.current, "opacity", frontFlat ? "0" : "1");
    setOnce("left", leftHalf.current, "visibility", backFlat ? "visible" : "hidden");
    setOnce("back", backBoard.current, "opacity", backFlat ? "0" : "1");
    setOnce("right", rightHalf.current, "visibility", frontFlat ? "visible" : "hidden");
  };

  const swing = (which: Board, hand: "over" | "home" | null) => {
    cancelAnimationFrame(boardFrame.current);
    const b0 = boards.current[which];
    const lift = hand === "over" ? Math.PI / 2 + 0.4 : Math.PI / 2 - 0.4;
    let holding = hand === "over" ? b0.θ < Math.PI / 2 : hand === "home" ? b0.θ > Math.PI / 2 : false;
    if (!holding && Math.abs(b0.ω) < 0.05 && Math.abs(b0.θ - Math.PI / 2) < 0.02)
      b0.ω = b0.θ >= Math.PI / 2 ? 0.1 : -0.1;
    let prev = performance.now();
    const step = (now: number) => {
      if (!boardEl.current) return;
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const b = boards.current[which];
      const h = dt / 8;
      for (let i = 0; i < 8; i++) {
        let α = -GRAVITY * Math.cos(b.θ) - HINGE_FRICTION * b.ω;
        if (holding) {
          α += HAND_K * (lift - b.θ) - damp(HAND_K) * b.ω;
          if (hand === "over" ? b.θ >= Math.PI / 2 : b.θ <= Math.PI / 2) holding = false;
        }
        b.ω += α * h;
        b.θ += b.ω * h;
        if (b.θ >= Math.PI) {
          b.θ = Math.PI;
          b.ω = Math.abs(b.ω) * RESTITUTION < 0.4 ? 0 : -Math.abs(b.ω) * RESTITUTION;
        } else if (b.θ <= 0) {
          b.θ = 0;
          b.ω = Math.abs(b.ω) * RESTITUTION < 0.4 ? 0 : Math.abs(b.ω) * RESTITUTION;
        }
      }
      const d = desk.current;
      const target = deskTarget();
      d.v += (-SHIFT_K * (d.shift - target) - damp(SHIFT_K) * d.v) * dt;
      d.shift += d.v * dt;
      const down = b.ω === 0 && (b.θ === 0 || b.θ === Math.PI);
      const resting = down && Math.abs(d.shift - target) < 0.05;
      if (resting) Object.assign(d, { shift: target, v: 0 });
      paintBoards();
      if (down) {
        const then = afterRest.current;
        afterRest.current = null;
        then?.();
      }
      if (resting) {
        const { front, back } = boards.current;
        setOpen(front.θ === Math.PI && back.θ === 0);
      } else boardFrame.current = requestAnimationFrame(step);
    };
    boardFrame.current = requestAnimationFrame(step);
  };

  useLayoutEffect(() => {
    shown.current = { front: "", back: "", left: "", right: "" };
    paintBoards();
  }, [wide]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      boards.current.front.θ = Math.PI;
      desk.current.shift = 0;
      paintBoards();
      setOpen(true);
      return;
    }
    const id = setTimeout(() => swing("front", "over"), 650);
    return () => clearTimeout(id);
  }, []);
  useEffect(
    () => () => {
      cancelAnimationFrame(boardFrame.current);
      cancelAnimationFrame(leafFrame.current);
      cancelAnimationFrame(moveFrame.current);
    },
    [],
  );
  useEffect(() => {
    if (!focusOnOpen) return;
    boardEl.current?.focus({ preventScroll: true });
  }, [focusOnOpen]);

  const plan = (dir: "next" | "prev", cy: number): Turn | null => {
    const to = pos + (dir === "next" ? 1 : -1);
    const rect = rightPage.current?.getBoundingClientRect();
    if (to < 0 || to > last || !rect) return null;
    const base = { to, cy: cy * rect.height, W: rect.width, H: rect.height, reverse: false };
    if (wide)
      return dir === "next"
        ? { ...base, geo: "left", front: evenOf(pos), back: oddOf(to), under: [evenOf(to), oddOf(pos)] }
        : { ...base, geo: "right", front: oddOf(pos), back: evenOf(to), under: [evenOf(pos), oddOf(to)] };
    return dir === "next"
      ? { ...base, geo: "left", front: pos, back: BLANK, under: [-2, to] }
      : { ...base, geo: "left", front: to, back: BLANK, under: [-2, pos], reverse: true };
  };

  const draw = (t: Turn, pull: Pt) => {
    if (!frontEl.current || !backEl.current) return pull;
    const { W, H } = t;
    const f = fold(W, H, t.cy, pull);
    const mirror = t.geo === "left";
    const frontLocal = (p: Pt) => (mirror ? { x: W - p.x, y: p.y } : p);
    const frontVec = (p: Pt) => (mirror ? { x: -p.x, y: p.y } : p);
    const backLocal = (p: Pt) => (mirror ? p : { x: W - p.x, y: p.y });
    const backVec = (p: Pt) => (mirror ? p : { x: -p.x, y: p.y });
    const world = (p: Pt) => (mirror ? { x: -p.x, y: p.y } : p);

    const image = (u: number, v: number) => world(f.reflect(backLocal({ x: u, y: v })));
    const o = image(0, 0);
    const ex = image(1, 0);
    const ey = image(0, 1);

    const lift = Math.sin(Math.PI * f.progress);
    const away = { x: -f.n.x, y: -f.n.y };

    frontEl.current!.style.clipPath = polygon(f.flat.map(frontLocal));
    frontShade.current!.style.background = ramp(frontVec(f.n), frontLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.16 * lift})`, 0],
      ["rgb(0 0 0/0)", 36],
    ]);
    castEl.current!.style.clipPath = polygon(f.flap.map(frontLocal));
    castEl.current!.style.background = ramp(frontVec(away), frontLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.1 + 0.3 * lift})`, 0],
      ["rgb(0 0 0/0)", 24 + 90 * lift],
    ]);
    backEl.current!.style.transform = `matrix(${ex.x - o.x}, ${ex.y - o.y}, ${ey.x - o.x}, ${ey.y - o.y}, ${o.x}, ${o.y})`;
    backEl.current!.style.clipPath = polygon(f.flap.map(backLocal));
    backShade.current!.style.background = ramp(backVec(away), backLocal(f.m), W, H, [
      [`rgb(0 0 0/${0.22 * lift})`, 0],
      [`rgb(255 255 255/${0.28 * lift})`, 10 + 10 * lift],
      ["rgb(255 255 255/0)", 30 + 40 * lift],
    ]);
    return f.M;
  };

  const release = (t: Turn, target: Pt, turned: boolean) => {
    cancelAnimationFrame(leafFrame.current);
    let prev = performance.now();
    const step = (now: number) => {
      if (!backEl.current) return;
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const { M, v } = leaf.current;
      v.x += (-LEAF_K * (M.x - target.x) - damp(LEAF_K) * v.x) * dt;
      v.y += (-LEAF_K * (M.y - target.y) - damp(LEAF_K) * v.y) * dt;
      leaf.current.M = draw(t, { x: M.x + v.x * dt, y: M.y + v.y * dt });
      if (Math.hypot(M.x - target.x, M.y - target.y) < 0.75 && Math.hypot(v.x, v.y) < 20) {
        if (turned) setAt(t.to);
        setTurn(null);
        return;
      }
      leafFrame.current = requestAnimationFrame(step);
    };
    leafFrame.current = requestAnimationFrame(step);
  };

  const start = (t: Turn, then: () => void) => {
    afterLayout.current = then;
    setTurn(t);
  };

  useLayoutEffect(() => {
    if (!turn) return;
    leaf.current.M = draw(turn, leaf.current.M);
    afterLayout.current?.();
    afterLayout.current = null;
  }, [turn]);

  const putAway = () => {
    const backUp = boards.current.back.θ > Math.PI / 2;
    const half = (backUp ? rightHalf.current : leftHalf.current) ?? boardEl.current;
    if (half) onClose?.(half.getBoundingClientRect(), backUp);
  };

  const flip = (dir: "next" | "prev" | "close" | "shelve") => {
    if (turn || grab.current) return;
    const { front, back } = boards.current;
    if (dir === "shelve") {
      const shut = (front.θ === 0 && front.ω === 0) || (back.θ === Math.PI && back.ω === 0);
      if (shut) return putAway();
      if (!open) return;
      afterRest.current = putAway;
      return flip("close");
    }
    if (front.θ < Math.PI / 2) return dir === "next" && swing("front", "over");
    if (back.θ > Math.PI / 2) return dir === "prev" && swing("back", "home");
    if (!open) return;
    const backShut = wide && pos === last && (dir === "close" || dir === "next");
    if (backShut || dir === "close" || (dir === "prev" && pos === 0)) {
      setOpen(false);
      return swing(backShut ? "back" : "front", backShut ? "over" : "home");
    }
    const t = plan(dir, 1);
    if (!t) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setAt(t.to);
    const home = { x: t.W, y: t.cy };
    const away = { x: -t.W, y: t.cy };
    const from = t.reverse ? away : home;
    const to = t.reverse ? home : away;
    leaf.current = { M: from, v: { x: (to.x - from.x) * 2.4, y: -t.H * 0.35 } };
    start(t, () => release(t, to, true));
  };

  const flipRef = useRef(flip);
  const overBookRef = useRef<(clientX: number) => boolean>(() => true);
  useEffect(() => {
    flipRef.current = flip;
    overBookRef.current = overBook;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      if (e.key === "Escape") {
        flipRef.current("shelve");
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (!boardEl.current || !boardEl.current.contains(document.activeElement)) return;
      e.preventDefault();
      flipRef.current(e.key === "ArrowRight" ? "next" : "prev");
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      if (boardEl.current?.contains(e.target) && overBookRef.current(e.clientX)) return;
      if (e.target.closest("a, button, input, textarea, nav")) return;
      flipRef.current("shelve");
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const spineAt = () => {
    const half = (wide ? leftHalf : rightHalf).current!.getBoundingClientRect();
    const spine = wide ? half.right : half.right - 10;
    return { half, spine, W: spine - half.left };
  };

  const overBook = (clientX: number) => {
    const { spine, W } = spineAt();
    const x = spine - clientX;
    const reach = W + 12;
    if (!wide) return x >= -12 && x <= reach;
    const { front, back } = boards.current;
    if (front.θ < Math.PI / 2) return x >= 0 && x <= reach;
    if (back.θ > Math.PI / 2) return x <= 0 && x >= -reach;
    return x >= -reach && x <= reach;
  };

  const hit = (clientX: number): { board: Board } | { dir: "next" | "prev" } | null => {
    if (!overBook(clientX)) return null;
    const { spine, W } = spineAt();
    const x = spine - clientX;
    const { front, back } = boards.current;
    if (front.θ !== Math.PI) return { board: "front" };
    if (back.θ !== 0) return { board: "back" };
    if (pos === 0 && (wide ? x < -W / 2 : x < W * 0.3)) return { board: "front" };
    if (pos > 0 && wide && x < -(W - 24)) return { board: "front" };
    if (wide && pos === last && x > W / 2) return { board: "back" };
    if (!open) return null;
    if (x >= 0) {
      if (x > W / 2) return pos < last ? { dir: "next" } : null;
      return !wide && pos > 0 ? { dir: "prev" } : null;
    }
    return wide && -x > W / 2 && pos > 0 ? { dir: "prev" } : null;
  };

  const setCursor = (c: string) => {
    if (cursor.current === c || !boardEl.current) return;
    cursor.current = c;
    boardEl.current.style.cursor = c;
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (turn || e.button !== 0 || (e.target as Element).closest("a, button, input, label, form")) return;
    const h = hit(e.clientX);
    if (!h) return;
    afterRest.current = null;
    setCursor("grabbing");
    const { half, spine } = spineAt();

    if ("board" in h) {
      cancelAnimationFrame(boardFrame.current);
      const θ = boards.current[h.board].θ;
      const reach = Math.max(40, Math.abs(spine - e.clientX) / Math.max(0.25, Math.abs(Math.cos(θ))));
      grab.current = { kind: "cover", board: h.board, spine, reach, x: e.clientX, t: performance.now(), moved: false };
      setOpen(false);
    } else {
      const top = half.top + 10;
      grab.current = {
        kind: "page",
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        dir: h.dir,
        cy: e.clientY - top < (half.height - 20) / 2 ? 0 : 1,
        dragging: false,
      };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) {
      const onControl = (e.target as Element).closest("a, button, input, label, form");
      return setCursor(!turn && !onControl && hit(e.clientX) ? "grab" : "");
    }
    pending.current = { x: e.clientX, y: e.clientY };
    if (moveFrame.current) return;
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = 0;
      if (!boardEl.current) return;
      const p = pending.current!;
      const now = performance.now();

      if (g.kind === "cover") {
        if (!g.moved && Math.abs(p.x - g.x) < 5) return;
        g.moved = true;
        const b = boards.current[g.board];
        const θ = Math.acos(Math.min(1, Math.max(-1, (g.spine - p.x) / g.reach)));
        const dt = Math.max(0.001, (now - g.t) / 1000);
        b.ω = 0.7 * ((θ - b.θ) / dt) + 0.3 * b.ω;
        b.θ = θ;
        g.t = now;
        paintBoards();
        return;
      }

      if (!g.dragging) {
        if (Math.hypot(p.x - g.x, p.y - g.y) < 6 || (!wide && g.dir === "prev")) return;
        const t = plan(g.dir, g.cy);
        if (!t) return;
        g.dragging = true;
        g.t = now;
        leaf.current = { M: { x: t.W, y: t.cy }, v: { x: 0, y: 0 } };
        start(t, () => {});
        return;
      }
      if (!turn) return;
      const sign = turn.geo === "left" ? -1 : 1;
      const pull = { x: turn.W + sign * (p.x - g.x), y: turn.cy + (p.y - g.y) };
      const prevM = leaf.current.M;
      const M = draw(turn, pull);
      const dt = Math.max(0.001, (now - g.t) / 1000);
      leaf.current = {
        M,
        v: {
          x: 0.7 * ((M.x - prevM.x) / dt) + 0.3 * leaf.current.v.x,
          y: 0.7 * ((M.y - prevM.y) / dt) + 0.3 * leaf.current.v.y,
        },
      };
      g.t = now;
    });
  };

  const onPointerUp = () => {
    const g = grab.current;
    grab.current = null;
    setCursor("");
    cancelAnimationFrame(moveFrame.current);
    moveFrame.current = 0;
    if (!g) return;

    if (g.kind === "cover") {
      if (g.moved) return swing(g.board, null);
      return swing(g.board, boards.current[g.board].θ < Math.PI / 2 ? "over" : "home");
    }
    if (!g.dragging) return flip(g.dir);
    if (!turn) return;
    const { M, v } = leaf.current;
    const over = turn.reverse ? M.x < 0 : M.x < 0 || v.x < -900;
    release(turn, { x: over ? -turn.W : turn.W, y: turn.cy }, over);
  };

  const onPointerCancel = () => {
    const g = grab.current;
    grab.current = null;
    setCursor("");
    cancelAnimationFrame(moveFrame.current);
    moveFrame.current = 0;
    if (!g) return;

    if (g.kind === "cover") {
      if (g.moved) swing(g.board, null);
      return;
    }
    if (!g.dragging || !turn) return;
    release(turn, { x: turn.W, y: turn.cy }, false);
  };

  const page = (i: number, side: Side, quiet = false) => {
    if (i === BLANK) return <Frame side={side} />;
    if (i < 0 || i >= total)
      return (
        <div
          className={`h-full ${
            side === "left"
              ? "rounded-l-[3px] shadow-[inset_-28px_0_28px_-24px_rgb(0_0_0/.35)]"
              : "rounded-r-[3px] shadow-[inset_28px_0_28px_-24px_rgb(0_0_0/.35)]"
          }`}
          style={{ background: endpaper }}
        />
      );
    if (i === 0) return <Frame side={side}>{front}</Frame>;
    if (i === total - 1) return <Frame side={side} folio={i + 1}>{back}</Frame>;
    return (
      <Frame side={side} folio={i + 1} head={side === "left" ? runningHead : series}>
        <div
          aria-hidden={quiet || undefined}
          className="h-full text-base leading-7 [column-count:1] [column-fill:auto]"
          style={{ columnGap: GAP, translate: `${(i - 1) * (box.width + GAP)}px 0` }}
        >
          {children}
        </div>
      </Frame>
    );
  };

  const under = turn?.under ?? (wide ? [evenOf(pos), oddOf(pos)] : [-2, pos]);
  const spread = wide ? 1.4 : 1 / 1.43;
  const fittedH = stage.w > 0 && stage.h > 0 ? Math.min(stage.h, stage.w / spread) : 0;
  const fittedW = fittedH * spread;
  const ear = "absolute bottom-2.5 size-16 cursor-pointer";
  const earFold =
    "absolute bottom-0 size-6 bg-[var(--bs-fold)] shadow-[0_0_4px_rgb(0_0_0/.2)] transition-[width,height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover/ear:size-10";

  return (
    <div
      ref={boardEl}
      style={{
        perspective: EYE,
        ...(fittedW > 0 ? { width: Math.round(fittedW), height: Math.round(fittedH) } : null),
      }}
      role="group"
      tabIndex={0}
      aria-label={`کتابِ «${title}» نوشتهٔ ${author}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`bookshelf bookshelf-rise relative mx-auto flex w-full max-w-full flex-row-reverse touch-pan-y select-none outline-none [will-change:translate] focus-visible:ring-2 focus-visible:ring-current ${
        fittedW > 0
          ? ""
          : wide
            ? "h-[min(640px,calc(100svh_-_160px))] md:h-[calc(min(720px,100svh_-_200px)+20px)] md:w-[calc(min(720px,100svh_-_200px)*1.4+20px)]"
            :
              "aspect-[1/1.43] max-h-[min(640px,calc(100svh_-_160px))]"
      }`}
    >
      {wide && (
        <div
          ref={leftHalf}
          className="invisible h-full min-w-0 flex-1 rounded-l-md p-2.5 pr-0"
          style={{ background: cloth }}
        >
          <div className="relative h-full">
            {page(under[0], "left")}
            <span
              ref={backCast}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 bg-[linear-gradient(270deg,rgb(0_0_0/.28),rgb(0_0_0/.12)_60%,rgb(0_0_0/0))] opacity-0"
            />
          </div>
        </div>
      )}
      <div
        ref={rightHalf}
        className={`h-full min-w-0 flex-1 p-2.5 ${wide ? "rounded-r-md pl-0" : "rounded-md"}`}
        style={{ background: cloth }}
      >
        <div ref={rightPage} className="relative h-full">
          {page(under[1], "right", wide)}
          <span
            ref={frontCast}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgb(0_0_0/.28),rgb(0_0_0/.12)_60%,rgb(0_0_0/0))] opacity-0"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none invisible absolute top-2.5 right-2.5 bottom-2.5 w-[calc(100%-20px)] md:w-[calc(50%-10px)]"
      >
        <Frame side="right" contentRef={measure}>
          <div className="h-full text-base leading-7 [column-count:1] [column-fill:auto]" style={{ columnGap: GAP }}>
            {children}
          </div>
        </Frame>
      </div>

      {turn && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-2.5"
          style={wide ? { left: "50%" } : { right: 10 }}
        >
          <div
            ref={frontEl}
            className="absolute top-0 will-change-[clip-path]"
            style={{ left: turn.geo === "left" ? -turn.W : 0, width: turn.W, height: turn.H }}
          >
            {page(turn.front, turn.geo)}
            <span ref={frontShade} className="absolute inset-0" />
          </div>
          <span
            ref={castEl}
            className="absolute top-0"
            style={{ left: turn.geo === "left" ? -turn.W : 0, width: turn.W, height: turn.H }}
          />
          <div
            ref={backEl}
            className="absolute top-0 left-0 origin-top-left will-change-transform"
            style={{ width: turn.W, height: turn.H }}
          >
            {page(turn.back, turn.geo === "left" ? "right" : "left")}
            <span ref={backShade} className="absolute inset-0" />
          </div>
        </div>
      )}

      {open && pos < last && (
        <button type="button" aria-label="صفحهٔ بعد" onClick={() => flip("next")} className={`group/ear left-2.5 ${ear}`}>
          <span className={`left-0 ${earFold} [clip-path:polygon(0_0,100%_100%,0_100%)]`} />
        </button>
      )}
      {open && pos > 0 && (
        <button type="button" aria-label="صفحهٔ قبل" onClick={() => flip("prev")} className={`group/ear right-2.5 ${ear}`}>
          <span className={`right-0 ${earFold} [clip-path:polygon(0_100%,100%_0,100%_100%)]`} />
        </button>
      )}

      {wide && (
        <div
          ref={backBoard}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-0 [transform-style:preserve-3d] will-change-transform"
          style={{ transformOrigin: "right center" }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div className="absolute inset-0 rounded-l-md p-2.5 pr-0" style={{ background: cloth }}>
              {page(evenOf(pos), "left")}
            </div>
            <span ref={backInnerShade} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-r-md px-14 text-center [backface-visibility:hidden]"
            style={{
              background: spineLight("90deg", cloth),
              color: foil,
              transform: `rotateY(180deg) translateZ(${THICKNESS}px)`,
            }}
          >
            <p className="max-w-[28ch] font-display text-xl leading-8 text-balance">{blurb}</p>
            <span className="h-px w-16 bg-current opacity-60" />
            <p className="text-[10px] opacity-80">{series}</p>
            <span ref={backOuterShade} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
          </div>
          <div
            className="absolute top-0 right-full h-full origin-right rounded-[1px]"
            style={{
              width: THICKNESS,
              transform: "rotateY(-90deg)",
              background: `linear-gradient(90deg, rgb(0 0 0/.3), rgb(0 0 0/.12)), ${cloth}`,
            }}
          >
            <span ref={backEdgeShade} className="absolute inset-0 bg-black opacity-0" />
          </div>
        </div>
      )}

      <div
        ref={frontBoard}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-full [transform-style:preserve-3d] will-change-transform md:w-1/2"
        style={{ transformOrigin: "right center" }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-l-md px-12 text-center [backface-visibility:hidden]"
          style={{ background: spineLight("270deg", cloth), color: foil, transform: `translateZ(${THICKNESS}px)` }}
        >
          <span className="h-px w-24 bg-current opacity-60" />
          <p className="font-display text-4xl leading-[1.4] text-balance">{title}</p>
          <span className="h-px w-24 bg-current opacity-60" />
          <p className="text-[10px] opacity-80">{author}</p>
          <span ref={frontOuterShade} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
          <div className="absolute inset-0 rounded-r-md p-2.5 pl-0" style={{ background: cloth }}>
            {page(wide ? oddOf(pos) : -1, "right")}
          </div>
          <span ref={frontInnerShade} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
        </div>
        <div
          className="absolute top-0 right-full h-full origin-right rounded-[1px]"
          style={{
            width: THICKNESS,
            transform: "rotateY(90deg)",
            background: `linear-gradient(90deg, rgb(0 0 0/.3), rgb(0 0 0/.12)), ${cloth}`,
          }}
        >
          <span ref={frontEdgeShade} className="absolute inset-0 bg-black opacity-0" />
        </div>
      </div>
    </div>
  );
}

export type ShelfBook = {
  id: string;
  title: string;
  author: string;
  cloth: string;
  foil: string;
  height?: number;
  width?: number;
  label?: string;
  blurb: string;
  content: ReactNode;
};

const spineShade =
  "linear-gradient(90deg, rgb(0 0 0/.38), rgb(255 255 255/.14) 14%, rgb(255 255 255/0) 34%, rgb(0 0 0/0) 70%, rgb(0 0 0/.32))";
const ease = "ease-[cubic-bezier(0.2,0,0,1)]";
const SPINE_W = 52;
const SPINE_H = 320;
const foreEdge =
  "linear-gradient(90deg, rgb(0 0 0/.24), rgb(0 0 0/0) 45%, rgb(0 0 0/.14)), repeating-linear-gradient(90deg, var(--bs-fold) 0 1px, var(--bs-paper) 1px 3px)";

function fit(book: ShelfBook, from: { width: number; height: number }) {
  const shrink = (book.height ?? SPINE_H) / from.height;
  return { shrink, depth: (book.width ?? SPINE_W) / shrink };
}

function localRect(r: { width: number; height: number }, scale: number) {
  return { width: r.width / scale, height: r.height / scale };
}

function viewScale(el: HTMLElement) {
  return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
}

function Bands() {
  return (
    <span className="flex w-full flex-col gap-[3px] px-2 opacity-60">
      <span className="h-px bg-current" />
      <span className="h-px bg-current" />
    </span>
  );
}

const FLIGHT = 480;

function homeward(from: Pt, to: Pt, lift: number) {
  const apex = Math.min(from.y, to.y) - lift;
  return `path("M ${from.x} ${from.y} C ${from.x} ${apex}, ${to.x} ${apex}, ${to.x} ${to.y}")`;
}

const caption = `text-[10px] ${faint}`;

export function Bookshelf({
  books = DEFAULT_BOOKS,
  series = "اتاقِ مطالعه",
  autoOpen = false,
  count,
}: {
  books?: ShelfBook[];
  series?: string;
  autoOpen?: boolean;
  count?: number;
}) {
  const shelf = count && count > 0 ? books.slice(0, count) : books;
  const [picked, setPicked] = useState<string | null>(null);
  const [reading, setReading] = useState<ShelfBook | null>(null);
  const [flying, setFlying] = useState<{
    book: ShelfBook;
    from: DOMRect;
    backUp: boolean;
    scale: number;
  } | null>(null);
  const [shelved, setShelved] = useState<string | null>(null);
  const slots = useRef(new Map<string, HTMLButtonElement>());
  const restoreFocus = useRef<string | null>(null);
  const openedByUser = useRef(false);
  const flier = useRef<HTMLDivElement>(null);
  const readingWrap = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const dimFront = useRef<HTMLSpanElement>(null);
  const dimBack = useRef<HTMLSpanElement>(null);
  const dimSpine = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!autoOpen || reading || flying) return;
    const id = setTimeout(() => {
      openedByUser.current = false;
      setReading((current) => current ?? shelf[0] ?? null);
    }, 900);
    return () => clearTimeout(id);
  }, [autoOpen]);

  useLayoutEffect(() => {
    const id = restoreFocus.current;
    if (!id || reading || flying) return;
    restoreFocus.current = null;
    slots.current.get(id)?.focus({ preventScroll: true });
  }, [reading, flying]);

  useLayoutEffect(() => {
    if (!flying) return;
    const { from } = flying;
    const { shrink } = fit(flying.book, localRect(from, flying.scale));
    const target = slots.current.get(flying.book.id);
    if (!target) {
      setShelved(flying.book.id);
      setFlying(null);
      return;
    }
    const to = target.getBoundingClientRect();
    const centre = (r: DOMRect) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
    const climb = "cubic-bezier(0.15, 0.45, 0.45, 0.8)";
    const fall = "cubic-bezier(0.4, 0.15, 0.7, 0.85)";
    const timing = { duration: FLIGHT, fill: "forwards" as const };
    const high = shrink + (1 - shrink) * 0.26;
    const spin = flying.backUp ? 180 : 0;
    const land = flying.backUp ? 270 : -90;
    const mid = spin + (land - spin) * 0.38;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const shade = (deg: number, facing: 1 | -1) => `${0.5 * (1 - Math.max(0, facing * Math.cos(rad(deg))))}`;
    const spineShade_ = (deg: number) => `${0.5 * (1 - Math.max(0, -Math.sin(rad(deg))))}`;

    flier.current!.style.offsetPath = homeward(centre(from), centre(to), Math.max(210, Math.abs(to.x - from.x) * 0.5));
    flier.current!.animate(
      [
        { offsetDistance: "0%", easing: climb },
        { offsetDistance: "52%", easing: fall },
        { offsetDistance: "100%" },
      ],
      timing,
    );
    const run = solid.current!.animate(
      [
        { transform: `scale(1) rotateY(${spin}deg)`, easing: climb },
        { transform: `scale(${high}) rotateY(${mid}deg)`, easing: fall },
        { transform: `scale(${shrink}) rotateY(${land}deg)` },
      ],
      timing,
    );
    for (const [el, lit] of [
      [dimFront.current!, (deg: number) => shade(deg, 1)],
      [dimBack.current!, (deg: number) => shade(deg, -1)],
      [dimSpine.current!, spineShade_],
    ] as const)
      el.animate(
        [
          { opacity: lit(spin), easing: climb },
          { opacity: lit(mid), easing: fall },
          { opacity: lit(land) },
        ],
        timing,
      );
    run.onfinish = () => {
      setShelved(flying.book.id);
      setFlying(null);
    };
    return () => run.cancel();
  }, [flying]);

  if (reading)
    return (
      <div
        ref={readingWrap}
        className="flex h-[min(720px,calc(100svh_-_170px))] max-h-full w-full items-center justify-center overflow-x-clip px-1 sm:px-3"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <Book
          cloth={reading.cloth}
          foil={reading.foil}
          title={reading.title}
          author={reading.author}
          series={series}
          blurb={reading.blurb}
          runningHead={reading.title}
          focusOnOpen={openedByUser.current}
          onClose={(from, backUp) => {
            restoreFocus.current = reading.id;
            if (matchMedia("(prefers-reduced-motion: reduce)").matches) setShelved(reading.id);
            else {
              const host = readingWrap.current;
              setFlying({ book: reading, from, backUp, scale: host ? viewScale(host) : 1 });
            }
            setReading(null);
          }}
          front={
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className={caption}>{series}</p>
              <p className="font-display text-3xl leading-[1.4] text-balance text-[var(--bs-ink-strong)]">{reading.title}</p>
              <span className="h-px w-12 bg-[var(--bs-ink-soft)]" />
              <p className="font-display">{reading.author}</p>
            </div>
          }
          back={
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-xl">پایان.</p>
              <p className={caption}>با Esc یا کلیک بیرون از کتاب، سرِ قفسه میرود</p>
            </div>
          }
        >
          {reading.content}
        </Book>
        </div>
      </div>
    );

  const depth = flying ? fit(flying.book, localRect(flying.from, flying.scale)).depth * flying.scale : 0;

  return (
    <div
      className="bookshelf flex h-full w-full max-w-3xl flex-col justify-center px-2 py-1"
      onPointerLeave={() => setPicked(null)}
    >
      <div className="flex h-[400px] shrink-0 items-end justify-center gap-[3px] px-2 drop-shadow-[0_6px_6px_rgb(0_0_0/.25)]">
        {shelf.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label={`خواندنِ «${b.title}» نوشتهٔ ${b.author}`}
            onPointerEnter={() => setPicked(b.id)}
            onFocus={() => setPicked(b.id)}
            onBlur={() => setPicked(null)}
            onClick={() => {
              openedByUser.current = true;
              setShelved(null);
              setReading(b);
            }}
            ref={(el) => {
              if (el) slots.current.set(b.id, el);
              else slots.current.delete(b.id);
            }}
            style={{
              width: b.width ?? SPINE_W,
              height: b.height ?? SPINE_H,
              color: b.foil,
              background: `${spineShade}, ${b.cloth}`,
              visibility: flying?.book.id === b.id ? "hidden" : undefined,
            }}
            className={`flex shrink-0 origin-bottom cursor-pointer flex-col items-center justify-between rounded-[2px] py-3 transition-[translate,rotate] duration-500 outline-none focus-visible:ring-2 focus-visible:ring-current ${ease} ${
              b.id === picked ? "-translate-y-5" : ""
            } ${b.id === shelved ? "bookshelf-settle" : ""}`}
          >
            <Bands />
            <span className="line-clamp-2 max-h-[220px] text-center font-display text-[13px] leading-[19px] [writing-mode:vertical-rl]">
              {b.title}
            </span>
            <span className="flex w-full flex-col items-center gap-2">
              {b.label && (
                <span className="text-[9px] opacity-75 [writing-mode:vertical-rl]">{b.label}</span>
              )}
              <Bands />
            </span>
          </button>
        ))}
      </div>
      <div className="h-2 rounded-t-[2px] bg-[linear-gradient(var(--bs-wood-top),color-mix(in_srgb,var(--bs-wood-top)_86%,#000))]" />
      <div className="h-3 rounded-b-[3px] bg-[linear-gradient(var(--bs-wood-bottom),color-mix(in_srgb,var(--bs-wood-bottom)_88%,#000))] shadow-[0_14px_24px_-12px_rgb(0_0_0/.5)]" />

      {flying &&
        createPortal(
          <div
            ref={flier}
            aria-hidden
            className="bookshelf pointer-events-none fixed top-0 left-0 z-50 [will-change:offset-distance]"
            style={{
              width: flying.from.width,
              height: flying.from.height,
              perspective: EYE / 2,
              offsetRotate: "0deg",
            }}
          >
            <div ref={solid} className="relative h-full w-full [transform-style:preserve-3d] [will-change:transform]">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-r-md px-14 text-center"
                style={{
                  transform: `translateZ(${-depth / 2}px) rotateY(180deg)`,
                  background: spineLight("90deg", flying.book.cloth),
                  color: flying.book.foil,
                }}
              >
                <p className="max-w-[28ch] font-display text-xl leading-8 text-balance">{flying.book.blurb}</p>
                <span className="h-px w-16 bg-current opacity-60" />
                <p className="text-[10px] opacity-80">{series}</p>
                <span ref={dimBack} className="absolute inset-0 rounded-r-md bg-black opacity-0" />
              </div>
            <div
                className="absolute top-0 right-full h-full origin-right rounded-l-[2px]"
                style={{ width: depth, transform: `translateZ(${-depth / 2}px) rotateY(90deg)`, background: foreEdge }}
              />
              <div
                className="absolute top-0 right-0 flex h-full origin-right flex-col justify-between rounded-l-[2px] py-3"
                style={{
                  width: depth,
                  transform: `translateZ(${-depth / 2}px) rotateY(90deg)`,
                  background: `${spineShade}, ${flying.book.cloth}`,
                  color: flying.book.foil,
                }}
              >
                <Bands />
                <Bands />
                <span ref={dimSpine} className="absolute inset-0 rounded-l-[2px] bg-black opacity-0" />
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-l-md px-12 text-center shadow-[0_24px_40px_-16px_rgb(0_0_0/.45)]"
                style={{
                  transform: `translateZ(${depth / 2}px)`,
                  background: spineLight("270deg", flying.book.cloth),
                  color: flying.book.foil,
                }}
              >
                <span className="h-px w-24 bg-current opacity-60" />
                <p className="font-display text-4xl leading-[1.4] text-balance">{flying.book.title}</p>
                <span className="h-px w-24 bg-current opacity-60" />
                <p className="text-[10px] opacity-80">{flying.book.author}</p>
                <span ref={dimFront} className="absolute inset-0 rounded-l-md bg-black opacity-0" />
              </div>
              </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

const P = ({ children, first }: { children: ReactNode; first?: boolean }) => (
  <p
    className={`mt-4 first:mt-0 ${
      first
        ? "first-letter:float-right first-letter:mt-1 first-letter:ml-2 first-letter:font-display first-letter:text-[44px] first-letter:leading-[1.4] first-letter:text-[var(--bs-ink-strong)]"
        : ""
    }`}
  >
    {children}
  </p>
);
const H = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-8 font-display text-xl leading-7 text-[var(--bs-ink-strong)] [break-after:avoid]">{children}</h2>
);

export const DEFAULT_BOOKS: ShelfBook[] = [
  {
    id: "small-hours",
    title: "ساعاتِ کوچک",
    author: "نرگس آذری",
    label: "جستارها",
    cloth: "#6f2d2a",
    foil: "#ead6a4",
    height: 336,
    width: 60,
    blurb: "از کارهایی که فقط بعد از این که بقیه سرِ کارشان رفتند، انجام میشوند.",
    content: (
      <>
        <P first>
          آرامشی خاص هست که کمی پس از نیمهشب میآید. خیابان از دعوا با خودش میافتد، تلفن ساکت میشود و انگار اتاق
          خم میشود سمتِ تو. بیشترِ هرچه در زندگی تمام کردهام، در همان آرامش تمام کردهام.
        </P>
        <P>
          ماجرا این نیست که شب معجزه میکند. ماجرا این است که شب از کسی حرفی ندارد. روز صفی از درخواستهای کوچک است،
          هر کدام بهجایی، هر کدام دزدیِ کوچکی از وقتِ تو. شب صف ندارد؛ فقط دارد همان چیزی را که جلویِ توست، و
          سؤالِ اینکه آیا آنقدر به آن نگاه میکنی که تمام شود.
        </P>
        <H>ساعتِ اول</H>
        <P>
          ساعتِ اول همیشه هدر میرود و من دیگر دلگیرِ آن نمیشوم. همان ساعتی است که روز خالی میشود: پاسخهای
          نیمهنوشته، زبانههای بازِ مرورگر، حرفی که یکی ظهر زده. نمیشود از آن پرید؛ فقط میشود با نجنگیدن با آن،
          کوتاهش کرد.
        </P>
        <P>
          بعد، معمولاً بی خبر، کار بلندترین چیزِ اتاق میشود. آن لحظه را باید پناه گرفت. در را ببند، صفحه را از هر
          چیزی که خودش نور میدارد برگردان، و ادامه بده.
        </P>
        <H>ساعتِ آخر</H>
        <P>
          ساعتِ آخر برای گذاشتنِ یک یادداشت برای صبح است. نه برنامه — یک جمله: کجا ایستادی و داشتی چه را امتحان
          میکردی. آدمی که فردا صبح بیدار میشود غریبه است، و غریبه راه نیاز دارد.
        </P>
        <P>کتاب را ببند. بگذارش روی قفسه. فردا شب همانجاست.</P>
      </>
    ),
  },
  {
    id: "field-notes",
    title: "یادداشتهای کارگاه",
    author: "بابک صادقی",
    label: "دستِ ساز",
    cloth: "#29463b",
    foil: "#e6d9b2",
    height: 304,
    width: 48,
    blurb: "یادداشتهای کوتاهی از یک کارگاه: دربارهٔ ابزار، صبر، و دانستنِ لحظهٔ دست کشیدن.",
    content: (
      <>
        <P first>
          ابزارِ خوب غیب میشود. رنده را وقتی میبینی که کُند شده، قلم را وقتی که میپَرد. بهترین رابطها هم همینطورند:
          از کارِی که با آنها کردی یادت میماند، نه از کلیکهایی که کردی.
        </P>
        <H>دربارهٔ صبر</H>
        <P>
          چسب یک ساعت میخواهد، رنگ یک روز. بیشترِ کارهای خرابشده را کسی خراب کرده که زودتر از موعد سراغشان رفته.
          سختترین مهارتِ هر کارگاهی، دست نزدن است؛ گذاشتنِ یک چیز تا بشود آنچه باید بشود.
        </P>
        <H>دربارهٔ دست کشیدن</H>
        <P>
          همیشه یک دورِ دیگر هست که میتوانی بزنی. هنر این است که ببینی کدام دور دیگر بیشتر از آنچه میدهد هزینه
          دارد. «تمام» یک تصمیم است، نه یک کشف.
        </P>
        <P>کفِ کارگاه را جارو کن. ابزارها را جایی بگذار که پیدایشان کنی. فردا با میزِ تمیز شروع میشود.</P>
      </>
    ),
  },
  {
    id: "linen",
    title: "یک سال نامه",
    author: "شیرین مدنی",
    label: "نامهها",
    cloth: "#e4d9c1",
    foil: "#3b3026",
    height: 352,
    width: 56,
    blurb: "پنجاه و دو نامه به دوستی آن سویِ دریا، یکی برای هر هفتهٔ یک سالِ دراز.",
    content: (
      <>
        <P first>
          عزیزِ من، ادارهٔ پستِ اینجا پستی روی درش آویزان است که دو بار میزند؛ یک بار وقتی میروی تو و یک بار وقتی
          میآیی، انگار میخواهد مطمئن شود جدی بودی. من تصمیم گرفتم هر یکشنبه جدی باشم.
        </P>
        <P>
          پرسیدی این شهر چه شکلی است. شبیه شهری است که هیچوقت عجله نداشته. نانوا وقتی نان تمام میشود میبندد. کشتی
          وقتی پر شد میرود. من دارد یاد میگیرم به چیزهایی سرِ وقت برسم که خودشان با وقتِ کسی کاری ندارند.
        </P>
        <H>هفتهٔ دوم</H>
        <P>
          شش روز باران آمد. من چهار کتاب خواندم و سه نامه به تو نوشتم که یکی را میفرستم. آن دو تای دیگر بیشترِ
          حرفش دربارهٔ باران بود.
        </P>
        <P>جواب بده. یک چیزِ کوچک برایم بنویس. از آنِ تو، ش.</P>
      </>
    ),
  },
  {
    id: "navy",
    title: "نقشههای جاهای آرام",
    author: "رها کیانی",
    label: "سفرنامه",
    cloth: "#253755",
    foil: "#e9d7a8",
    height: 320,
    width: 44,
    blurb: "راهنمای یک پیادهرو برای کتابخانهها، فانوسهای دریایی و اتاقهایی که برای شنیدن ساخته شدهاند.",
    content: (
      <>
        <P first>
          هر شهری اتاقی دارد که آدمها برای آرامبودنِ با هم میروند. روزِ اول پیدایش کن؛ شهر زودتر سر در میآورد.
        </P>
        <H>کتابخانهها</H>
        <P>
          نزدیکِ پنجره بنشین، نه میانِ قفسهها. تماشا کن کی اولِ صبح میآید؛ همانها کسانیاند که ساختمان را از همه
          بهتر میشناسند.
        </P>
        <H>فانوسهای دریایی</H>
        <P>
          غروب بالا برو. نگهبان — اگر هنوز یکی مانده باشد — میگوید نور هیچوقت برایِ کشتیهایی نبود که رسیده بودند؛
          برایِ آنهایی بود که هنوز داشتند تصمیم میگرفتند امتحان کنند.
        </P>
      </>
    ),
  },
  {
    id: "mustard",
    title: "صبحهای آهسته",
    author: "مینا فرهمند",
    label: "یادداشت",
    cloth: "#a87a3a",
    foil: "#2c2116",
    height: 296,
    width: 40,
    blurb: "آیینهای کوچک برای ساعتِ اولِ روز.",
    content: (
      <>
        <P first>
          آب را بجوشان، قبل از آنکه به هر چیزی با صفحه نگاه کنی. چهار دقیقه طول میکشد. مالِ خودت است.
        </P>
        <P>
          پنجره را باز کن، حتی در زمستان. بگذار اتاق بفهمد روز شروع شده. بعد — و فقط بعد — تصمیم بگیر امروز برای
          چیست.
        </P>
      </>
    ),
  },
];

export default Bookshelf;
