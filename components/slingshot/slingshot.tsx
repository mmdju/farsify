"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUp } from "lucide-react";

import "./slingshot.css";

const W = 360;
const H = 260;
const R = 29;
const SOCKET = 38;
const REST = { x: W / 2, y: H / 2 };
const PULL = 118;
const FREE = 0.6;
const SHAKE = 0.7;
const TENSION = 13;
const GRAVITY = 700;
const POOL = 36;
const FLOOR = H - R;
const ARROWS: Record<string, number> = {
  ArrowRight: 0,
  ArrowDown: Math.PI / 2,
  ArrowLeft: Math.PI,
  ArrowUp: -Math.PI / 2,
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const give = (u: number) =>
  u <= FREE ? u : FREE + (1 - FREE) * Math.tanh(((u - FREE) / (1 - FREE)) * 0.7);

const strainOf = (m: number) => clamp((m - 0.9) / 0.08, 0, 1);

const hull = (ax: number, ay: number, ra: number, bx: number, by: number, rb: number) => {
  const d = Math.hypot(bx - ax, by - ay);
  const circle = `M${ax - ra},${ay}a${ra},${ra} 0 1,0 ${ra * 2},0a${ra},${ra} 0 1,0 ${-ra * 2},0Z`;
  if (d <= Math.abs(ra - rb) + 0.5) return circle;
  const th = Math.atan2(by - ay, bx - ax);
  const ph = Math.acos(clamp((ra - rb) / d, -1, 1));
  const P = (cx: number, cy: number, r: number, t: number) =>
    `${(cx + r * Math.cos(t)).toFixed(2)},${(cy + r * Math.sin(t)).toFixed(2)}`;
  return (
    `M${P(ax, ay, ra, th + ph)}L${P(bx, by, rb, th + ph)}` +
    `A${rb},${rb} 0 0,0 ${P(bx, by, rb, th - ph)}` +
    `L${P(ax, ay, ra, th - ph)}` +
    `A${ra},${ra} 0 1,0 ${P(ax, ay, ra, th + ph)}Z`
  );
};

type Speck = { x: number; y: number; vx: number; vy: number; t: number; life: number; r: number };
type Phase = "rest" | "held" | "fly" | "gone";

export interface SlingshotProps {
  power?: number;
  bounce?: number;
  socketColor?: string;
  ballColor?: string;
  markColor?: string;
  ariaLabel?: string;
  className?: string;
  autoPreview?: boolean;
}

export function Slingshot({
  power = 100,
  bounce = 30,
  socketColor,
  ballColor,
  markColor,
  ariaLabel = "توپ رو بکش و رها کن؛ با کلیدهای جهت‌دار نشونه بگیر و با کلید فاصله پرتش کن",
  className,
  autoPreview = false,
}: SlingshotProps) {
  const box = useRef<HTMLDivElement | null>(null);
  const ball = useRef<HTMLSpanElement | null>(null);
  const band = useRef<SVGPathElement | null>(null);
  const arrow = useRef<SVGSVGElement | null>(null);
  const dust = useRef<SVGGElement | null>(null);
  const quiet = useRef(false);
  const unhook = useRef(() => {});
  const knobs = useRef({ power, bounce });
  knobs.current = { power, bounce };

  const state = useRef({
    x: REST.x,
    y: REST.y,
    vx: 0,
    vy: 0,
    phase: "rest" as Phase,
    bx: REST.x,
    by: REST.y,
    bvx: 0,
    bvy: 0,
    still: 0,
    raf: 0,
    timer: 0,
    last: 0,
    appear: 1,
    jx: 0,
    jy: 0,
    grip: null as null | { id: number; real: boolean; dx: number; dy: number },
    strain: 0,
    specks: [] as Speck[],
    pull: 0,
    fired: true,
  });

  const launch = (x: number, y: number) => {
    const u = clamp(Math.hypot(REST.x - x, REST.y - y) / PULL, 0, 1);
    const k = TENSION * (knobs.current.power / 100) * (0.7 + 1.1 * u * u);
    return { vx: (REST.x - x) * k, vy: (REST.y - y) * k };
  };

  const puff = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    n: number,
    speed: number,
    spread: number,
  ) => {
    if (quiet.current) return;
    const s = state.current;
    const aim = Math.atan2(dy, dx);
    for (let i = 0; i < n; i++) {
      const a = aim + (Math.random() - 0.5) * spread;
      const v = speed * (0.45 + Math.random() * 0.9);
      s.specks.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        t: 0,
        life: 0.35 + Math.random() * 0.35,
        r: 1.1 + Math.random() * 0.9,
      });
    }
    if (s.specks.length > POOL) s.specks.splice(0, s.specks.length - POOL);
  };

  const paint = () => {
    const s = state.current;
    const b = ball.current;
    if (b) {
      const sp = Math.hypot(s.vx, s.vy);
      const st = s.phase === "fly" ? clamp(sp / 2400, 0, 0.22) : 0;
      const ang = Math.atan2(s.vy, s.vx);
      const j = s.phase === "held" && !quiet.current ? s.strain * SHAKE : 0;
      const t = performance.now() / 1000;
      s.jx = j * Math.sin(t * 60);
      s.jy = j * Math.cos(t * 49);
      b.style.transform =
        `translate(${(s.x + s.jx - R).toFixed(2)}px, ${(s.y + s.jy - R).toFixed(2)}px) ` +
        `rotate(${ang}rad) scale(${(1 + st) * s.appear}, ${(1 - st * 0.7) * s.appear}) rotate(${-ang}rad)`;
      b.style.opacity = s.phase === "gone" ? "0" : "1";
    }
    const a = arrow.current;
    if (a) {
      const dir =
        s.phase === "fly"
          ? Math.atan2(s.vy, s.vx)
          : s.phase === "held" && Math.hypot(REST.x - s.x, REST.y - s.y) > 4
            ? Math.atan2(REST.y - s.y, REST.x - s.x)
            : -Math.PI / 4;
      a.style.transform = `rotate(${dir + Math.PI / 2}rad)`;
    }
    const g = dust.current;
    if (g) {
      const cs = g.children;
      for (let i = 0; i < cs.length; i++) {
        const c = cs[i] as SVGLineElement;
        const p = s.specks[i];
        if (!p) {
          c.setAttribute("opacity", "0");
          continue;
        }
        const k = p.t / p.life;
        const v = Math.hypot(p.vx, p.vy) || 1;
        const len = clamp(v * 0.028, 1.5, 12);
        c.setAttribute("x1", p.x.toFixed(1));
        c.setAttribute("y1", p.y.toFixed(1));
        c.setAttribute("x2", (p.x - (p.vx / v) * len).toFixed(1));
        c.setAttribute("y2", (p.y - (p.vy / v) * len).toFixed(1));
        c.setAttribute("stroke-width", p.r.toFixed(2));
        c.setAttribute("opacity", (0.6 * (1 - k) ** 1.4).toFixed(3));
      }
    }
    const l = band.current;
    if (l) {
      l.setAttribute(
        "d",
        hull(
          REST.x,
          REST.y,
          SOCKET,
          s.bx + (s.phase === "held" ? s.jx : 0),
          s.by + (s.phase === "held" ? s.jy : 0),
          R + 6,
        ),
      );
    }
  };

  const respawn = () => {
    const s = state.current;
    s.timer = 0;
    s.phase = "rest";
    s.x = REST.x;
    s.y = REST.y;
    s.vx = 0;
    s.vy = 0;
    s.appear = 0;
    wake();
  };

  const step = (dt: number) => {
    const s = state.current;
    if (s.appear < 1) s.appear = Math.min(1, s.appear + dt * 5);
    let banding = false;
    if (s.phase === "held") {
      s.bx = s.x;
      s.by = s.y;
      s.bvx = s.bvy = 0;
    } else {
      const k = 900;
      const c = 2 * Math.sqrt(k) * 0.32;
      s.bvx += (-k * (s.bx - REST.x) - c * s.bvx) * dt;
      s.bvy += (-k * (s.by - REST.y) - c * s.bvy) * dt;
      s.bx += s.bvx * dt;
      s.by += s.bvy * dt;
      banding =
        Math.abs(s.bx - REST.x) +
          Math.abs(s.by - REST.y) +
          Math.abs(s.bvx) * 0.01 +
          Math.abs(s.bvy) * 0.01 >
        0.05;
      if (!banding) {
        s.bx = REST.x;
        s.by = REST.y;
        s.bvx = s.bvy = 0;
      }
    }
    if (s.specks.length) {
      const drag = Math.exp(-4 * dt);
      for (const p of s.specks) {
        p.t += dt;
        p.vx *= drag;
        p.vy = p.vy * drag + 60 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      s.specks = s.specks.filter((p) => p.t < p.life);
    }
    const dusty = s.specks.length > 0;
    if (s.phase !== "fly") return s.appear < 1 || banding || dusty;
    if (!s.fired && (s.x - REST.x) * s.vx + (s.y - REST.y) * s.vy >= 0) {
      s.fired = true;
      const sp = Math.hypot(s.vx, s.vy) || 1;
      const ux = s.vx / sp;
      const uy = s.vy / sp;
      puff(
        REST.x + ux * SOCKET,
        REST.y + uy * SOCKET,
        ux,
        uy,
        Math.round(12 + s.pull * 10),
        150 + s.pull * 170,
        1.7,
      );
    }
    const e = 0.2 + (knobs.current.bounce / 100) * 0.6;
    s.vy += GRAVITY * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const m = R * (1 + clamp(Math.hypot(s.vx, s.vy) / 2400, 0, 0.22));
    if (s.x < m) {
      s.x = m;
      s.vx = Math.abs(s.vx) * e;
    }
    if (s.x > W - m) {
      s.x = W - m;
      s.vx = -Math.abs(s.vx) * e;
    }
    if (s.y < m) {
      s.y = m;
      s.vy = Math.abs(s.vy) * e;
    }
    if (s.y > FLOOR) {
      s.y = FLOOR;
      s.vy = -Math.abs(s.vy) * e;
      s.vx *= 0.8;
      if (Math.abs(s.vy) < 40) s.vy = 0;
    }
    if (s.y >= FLOOR - 0.5 && Math.abs(s.vx) < 12 && Math.abs(s.vy) < 1) {
      s.still += dt;
      if (s.still > 0.5) {
        s.still = 0;
        s.phase = "gone";
        s.timer = window.setTimeout(respawn, 200);
      }
    } else s.still = 0;
    return true;
  };

  const wake = () => {
    const s = state.current;
    if (s.raf) return;
    s.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - s.last) / 1000);
      s.last = now;
      let busy = false;
      for (let i = 0; i < 3; i++) busy = step(dt / 3) || busy;
      paint();
      if (!busy && s.phase !== "held") {
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  };

  useEffect(() => {
    quiet.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    paint();
    const s = state.current;
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      window.clearTimeout(s.timer);
      s.timer = 0;
      unhook.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoPreview) return undefined;
    const s = state.current;
    let alive = true;
    let timer = 0;
    let frame = 0;

    const pull = () => {
      if (s.grip) {
        timer = window.setTimeout(pull, 600);
        return;
      }
      const aim = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      const reach = give(0.62 + Math.random() * 0.33) * PULL;
      const tx = REST.x - Math.cos(aim) * reach;
      const ty = REST.y - Math.sin(aim) * reach;
      const x0 = REST.x;
      const y0 = REST.y;
      const started = performance.now();
      s.phase = "held";
      s.strain = 0;
      const ease = (now: number) => {
        if (!alive) return;
        if (s.grip) {
          timer = window.setTimeout(back, 400);
          return;
        }
        const t = quiet.current ? 1 : Math.min(1, (now - started) / 520);
        const k = 1 - (1 - t) ** 3;
        s.x = x0 + (tx - x0) * k;
        s.y = y0 + (ty - y0) * k;
        s.strain = strainOf(Math.hypot(REST.x - s.x, REST.y - s.y) / PULL);
        wake();
        if (t < 1) frame = requestAnimationFrame(ease);
        else timer = window.setTimeout(release, 340);
      };
      frame = requestAnimationFrame(ease);
    };

    const release = () => {
      if (!alive) return;
      if (s.grip) {
        timer = window.setTimeout(back, 400);
        return;
      }
      fire();
      timer = window.setTimeout(back, 700);
    };

    const back = () => {
      if (!alive) return;
      if (s.phase === "rest" && !s.grip) timer = window.setTimeout(pull, 900);
      else timer = window.setTimeout(back, 250);
    };

    timer = window.setTimeout(pull, 700);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      if (!s.grip && s.phase === "held") settle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPreview]);

  const local = (x: number, y: number) => {
    const o = box.current!.getBoundingClientRect();
    const k = o.width / W || 1;
    return { x: (x - o.left) / k, y: (y - o.top) / k };
  };

  const settle = () => {
    const s = state.current;
    if (s.grip || s.phase === "fly" || s.phase === "gone") return;
    s.phase = "rest";
    s.x = REST.x;
    s.y = REST.y;
    s.strain = 0;
    wake();
  };

  const fire = () => {
    const s = state.current;
    s.strain = 0;
    const pulled = Math.hypot(REST.x - s.x, REST.y - s.y);
    if (pulled < 8) {
      settle();
      return;
    }
    const v = launch(s.x, s.y);
    s.vx = v.vx;
    s.vy = v.vy;
    s.phase = "fly";
    s.pull = clamp(pulled / PULL, 0, 1);
    s.fired = false;
    wake();
  };

  const key = (e: ReactKeyboardEvent) => {
    const s = state.current;
    if (s.grip || s.phase === "fly" || s.phase === "gone") return;
    if (e.key === "Escape") {
      settle();
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (s.phase === "held") fire();
      return;
    }
    const dir = ARROWS[e.key];
    if (dir === undefined) return;
    e.preventDefault();
    const d = give(0.78) * PULL;
    s.x = REST.x - Math.cos(dir) * d;
    s.y = REST.y - Math.sin(dir) * d;
    s.phase = "held";
    s.strain = strainOf(0.78);
    wake();
  };

  const down = (e: ReactPointerEvent) => {
    const s = state.current;
    if (e.button !== 0 || s.phase === "fly" || s.phase === "gone") return;
    if (s.grip && e.nativeEvent.isTrusted && !s.grip.real) {
      s.grip = null;
      unhook.current();
    }
    if (s.grip) return;
    if (s.phase === "held") settle();
    const p = local(e.clientX, e.clientY);
    if (Math.hypot(p.x - s.x, p.y - s.y) > R + 14) return;
    e.preventDefault();
    s.grip = { id: e.pointerId, real: e.nativeEvent.isTrusted, dx: s.x - p.x, dy: s.y - p.y };
    s.phase = "held";
    const mv = (ev: PointerEvent) => {
      const g = s.grip;
      if (!g || ev.pointerId !== g.id || ev.isTrusted !== g.real) return;
      const q = local(ev.clientX, ev.clientY);
      let dx = q.x + g.dx - REST.x;
      let dy = q.y + g.dy - REST.y;
      const d = Math.hypot(dx, dy);
      const m = give(d / PULL);
      if (d > 0) {
        dx *= (m * PULL) / d;
        dy *= (m * PULL) / d;
      }
      s.x = REST.x + dx;
      s.y = REST.y + dy;
      s.strain = strainOf(m);
      wake();
    };
    const up = (ev: PointerEvent) => {
      const g = s.grip;
      if (!g || ev.pointerId !== g.id || ev.isTrusted !== g.real) return;
      s.grip = null;
      unhook.current();
      fire();
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    unhook.current = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      unhook.current = () => {};
    };
    wake();
  };

  return (
    <div
      ref={box}
      className={className ? `slingshot ${className}` : "slingshot"}
      style={
        {
          width: W,
          height: H,
          ...(socketColor ? { "--sl-socket": socketColor } : null),
          ...(ballColor ? { "--sl-ink": ballColor } : null),
          ...(markColor ? { "--sl-mark": markColor } : null),
        } as CSSProperties
      }
      onPointerDown={down}
      onKeyDown={key}
    >
      <svg
        className="slingshot__svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        <path
          ref={band}
          className="slingshot__band"
          d={hull(REST.x, REST.y, SOCKET, REST.x, REST.y, R + 6)}
        />
        <g ref={dust} className="slingshot__dust">
          {Array.from({ length: POOL }, (_, i) => (
            <line key={i} opacity="0" />
          ))}
        </g>
      </svg>
      <span
        ref={ball}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        className="slingshot__ball"
        style={{ width: R * 2, height: R * 2 }}
        onBlur={settle}
      >
        <ArrowUp
          ref={arrow}
          className="slingshot__arrow"
          size={28}
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
    </div>
  );
}

export default Slingshot;
