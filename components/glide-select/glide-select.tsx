"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import "./glide-select.css";

const SIZES = {
  sm: { chip: 28, row: 26, font: 12 },
  md: { chip: 32, row: 30, font: 13 },
  lg: { chip: 44, row: 40, font: 14 },
} as const;

const PAD = 4;
const GAP = 1;
const MENU_GAP = 6;
const DEFAULT_OPTIONS = ["One", "Two", "Three"];

const ARROW_DOWN_ICON = [
  "M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9",
] as const;

const TICK_ICON = ["M5 14L8.5 17.5L19 6.5"] as const;

type Glyph = readonly string[];

function HugeIcon({
  glyph,
  size = 20,
  strokeWidth = 2,
}: {
  glyph: Glyph;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export type GlideSelectSize = keyof typeof SIZES;
export type GlideSelectSide = "top" | "bottom";
export type GlideSelectAlign = "left" | "right";

export interface GlideSelectOption {
  value: string;
  label: string;
  tag?: string;
}

const norm = (
  o: string | GlideSelectOption,
): GlideSelectOption => (typeof o === "string" ? { value: o, label: o } : o);

const textOf = (it: GlideSelectOption) =>
  typeof it.label === "string" ? it.label : it.value;

const typeaheadIndex = (
  items: GlideSelectOption[],
  from: number,
  ch: string,
) => {
  const c = ch.toLowerCase();
  const n = items.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (textOf(items[i]).toLowerCase().startsWith(c)) return i;
  }
  return from;
};

export interface GlideSelectProps {
  options?: Array<string | GlideSelectOption>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: GlideSelectOption) => void;
  placeholder?: string;
  showTags?: boolean;
  accentColor?: string;
  surfaceColor?: string;
  highlightColor?: string;
  textColor?: string;
  size?: GlideSelectSize;
  radius?: number;
  menuWidth?: number;
  placement?: GlideSelectSide;
  align?: GlideSelectAlign;
  popDuration?: number;
  glideDuration?: number;
  rememberPosition?: boolean;
  disabled?: boolean;
  autoPreview?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function GlideSelect({
  options = DEFAULT_OPTIONS,
  value,
  defaultValue,
  onChange,
  placeholder = "انتخاب کن…",
  showTags = true,
  accentColor = "#fafafa",
  surfaceColor = "#232323",
  highlightColor = "#3a3a3a",
  textColor = "#fafafa",
  size = "md",
  radius = 10,
  menuWidth = 176,
  placement = "bottom",
  align = "left",
  popDuration = 180,
  glideDuration = 220,
  rememberPosition = true,
  disabled = false,
  autoPreview = false,
  ariaLabel = "انتخاب",
  className = "",
}: GlideSelectProps) {
  const items = options.map(norm);
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = value ?? inner;
  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);
  const selected = items.findIndex((it) => it.value === current);
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [active, setActive] = useState<number | null>(null);
  const [side, setSide] = useState<GlideSelectSide>(placement);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const instant = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrub = useRef<{ id: number; top: number } | null>(null);
  const id = useId();
  const S = SIZES[size] ?? SIZES.md;
  const step = S.row + GAP;
  const popOut = Math.round((popDuration * 2) / 3);

  const [rtl, setRtl] = useState(false);
  useLayoutEffect(() => {
    if (rootRef.current) {
      setRtl(getComputedStyle(rootRef.current).direction === "rtl");
    }
  }, []);
  const resolvedAlign: GlideSelectAlign = rtl
    ? align === "left"
      ? "right"
      : "left"
    : align;

  useLayoutEffect(() => {
    if (phase !== "open") return;
    const el = menuRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    const r = root.getBoundingClientRect();
    const need = el.offsetHeight + MENU_GAP;
    setSide(
      placement === "bottom" && r.bottom + need > window.innerHeight
        ? "top"
        : placement === "top" && r.top - need < 0
          ? "bottom"
          : placement,
    );
    el.style.transitionDuration = instant.current ? "0ms" : "";
    el.dataset.state = "closed";
    void el.offsetHeight;
    el.dataset.state = "open";
    const p = pillRef.current;
    if (p) {
      p.style.transition = "none";
      p.style.transform = `translateY(${Math.max(0, selected) * step}px)`;
      p.style.opacity = "0";
      void p.offsetHeight;
      p.style.transition = "";
    }
  }, [phase]);

  useLayoutEffect(() => {
    const p = pillRef.current;
    if (!p || phase !== "open") return;
    if (active === null) {
      p.style.opacity = "0";
      return;
    }
    const jump = instant.current || p.style.opacity !== "1";
    p.style.transitionDuration = jump ? "0ms, 150ms" : "";
    p.style.transform = `translateY(${active * step}px)`;
    p.style.opacity = "1";
    instant.current = false;
  }, [active, phase, step]);

  const open = (viaKey: boolean) => {
    if (disabled) return;
    clearTimeout(closeTimer.current);
    instant.current = true;
    setActive(selected >= 0 ? selected : viaKey ? 0 : null);
    setPhase("open");
  };

  const close = (mode: "instant" | "pop") => {
    setActive(null);
    clearTimeout(closeTimer.current);
    const el = menuRef.current;
    if (mode === "instant" || !el) {
      setPhase("closed");
      return;
    }
    el.style.transitionDuration = "";
    el.dataset.state = "closed";
    setPhase("closing");
    closeTimer.current = setTimeout(() => setPhase("closed"), popOut + 20);
  };

  const pick = (i: number, viaKey: boolean, focusTrigger = true) => {
    const it = items[i];
    if (!it) {
      close("instant");
      return;
    }
    if (it.value !== current) {
      if (value === undefined) setInner(it.value);
      onChange?.(it.value, it);
      if (!viaKey && rootRef.current) rootRef.current.dataset.swap = "";
    }
    close("instant");
    if (focusTrigger) triggerRef.current?.focus({ preventScroll: true });
  };

  const onTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const k = e.key;
    const n = items.length;
    const cur = active ?? Math.max(0, selected);
    if (phase !== "open") {
      if (k === "Enter" || k === " " || k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        open(true);
      }
      return;
    }
    const go = (i: number) => {
      e.preventDefault();
      instant.current = true;
      setActive(Math.min(n - 1, Math.max(0, i)));
    };
    if (k === "ArrowDown" || k === "ArrowUp") {
      go(active === null ? cur : cur + (k === "ArrowDown" ? 1 : -1));
    } else if (k === "Home" || k === "End") {
      go(k === "Home" ? 0 : n - 1);
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      pick(cur, true);
    } else if (k === "Escape" || k === "Tab") {
      if (k === "Escape") e.preventDefault();
      close("instant");
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      go(typeaheadIndex(items, cur, k));
    }
  };

  useEffect(() => {
    if (phase === "closed") return undefined;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close("pop");
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [phase]);

  useEffect(() => {
    if (disabled && phase !== "closed") close("instant");
  }, [disabled]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const listKey = items.map((it) => it.value).join("|");
  useEffect(() => {
    if (!autoPreview || disabled) return undefined;
    if (items.length < 2) return undefined;

    const OPEN_MS = popOut + 260;
    const GLIDE_MS = Math.max(320, glideDuration + 120);
    const CLOSED_MS = 900;

    let alive = true;
    let opened = false;
    let cursor = selected >= 0 ? selected : 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      if (!alive) return;
      const next = (cursor + 1) % items.length;
      opened = true;
      open(false);
      timer = setTimeout(() => {
        if (!alive) return;
        setActive(next);
        timer = setTimeout(() => {
          if (!alive) return;
          cursor = next;
          opened = false;
          pick(next, false, false);
          timer = setTimeout(cycle, CLOSED_MS);
        }, GLIDE_MS);
      }, OPEN_MS);
    };

    timer = setTimeout(cycle, CLOSED_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
      if (opened) close("instant");
    };
  }, [autoPreview, disabled, listKey, glideDuration, popOut]);

  const rowAt = (y: number) => {
    const s = scrub.current;
    if (!s) return null;
    const i = Math.floor((y - s.top - PAD) / step);
    return i >= 0 && i < items.length ? i : null;
  };

  const onListDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrub.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    scrub.current = {
      id: e.pointerId,
      top: e.currentTarget.getBoundingClientRect().top,
    };
    instant.current = true;
    setActive(rowAt(e.clientY));
  };

  const onListMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrub.current || scrub.current.id !== e.pointerId) return;
    const i = rowAt(e.clientY);
    if (i !== active) setActive(i);
  };

  const onListUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrub.current || scrub.current.id !== e.pointerId) return;
    const i = e.type === "pointerup" ? rowAt(e.clientY) : null;
    scrub.current = null;
    if (i !== null) pick(i, false);
    else if (!rememberPosition) setActive(null);
  };

  const onListOver = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || scrub.current) return;
    const row = (e.target as HTMLElement).closest("[data-index]");
    if (!row) return;
    const i = Number((row as HTMLElement).dataset.index);
    if (i !== active) setActive(i);
  };

  const origin = `${side === "bottom" ? "top" : "bottom"} ${resolvedAlign}`;

  return (
    <div
      ref={rootRef}
      className={`glide-select${className ? ` ${className}` : ""}`}
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      style={
        {
          "--gs-accent": accentColor,
          "--gs-surface": surfaceColor,
          "--gs-highlight": highlightColor,
          "--gs-text": textColor,
          "--gs-radius": `${radius}px`,
          "--gs-inner-radius": `${Math.max(3, radius - 4)}px`,
          "--gs-chip": `${S.chip}px`,
          "--gs-row": `${S.row}px`,
          "--gs-font": `${S.font}px`,
          "--gs-menu-w": `${menuWidth}px`,
          "--gs-pop": `${popDuration}ms`,
          "--gs-pop-out": `${popOut}ms`,
          "--gs-glide": `${glideDuration}ms`,
          "--gs-origin": origin,
        } as React.CSSProperties
      }
      onAnimationEnd={(e) => {
        if (e.animationName === "gs-swap" && rootRef.current) {
          delete rootRef.current.dataset.swap;
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={phase === "open"}
        aria-controls={`${id}-list`}
        aria-activedescendant={active !== null ? `${id}-${active}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className="glide-select__trigger"
        onPointerDown={(e) => {
          if (e.button !== 0 || disabled) return;
          e.currentTarget.focus({ preventScroll: true });
          if (phase === "open") close("pop");
          else open(false);
        }}
        onKeyDown={onTriggerKey}
      >
        <span
          className="glide-select__label"
          key={current}
          data-empty={selected < 0 ? "" : undefined}
        >
          {selected >= 0 ? items[selected].label : placeholder}
        </span>
        <span className="glide-select__chevron" aria-hidden="true">
          <HugeIcon glyph={ARROW_DOWN_ICON} size={12} strokeWidth={2.5} />
        </span>
      </button>
      {phase !== "closed" ? (
        <div
          ref={menuRef}
          className="glide-select__menu"
          data-state="open"
          data-side={side}
          data-align={resolvedAlign}
        >
          <div
            id={`${id}-list`}
            role="listbox"
            aria-label={ariaLabel}
            className="glide-select__list"
            data-live={active !== null ? "" : undefined}
            onPointerOver={onListOver}
            onPointerLeave={() => {
              if (!scrub.current && !rememberPosition) setActive(null);
            }}
            onPointerDown={onListDown}
            onPointerMove={onListMove}
            onPointerUp={onListUp}
            onPointerCancel={onListUp}
            onLostPointerCapture={onListUp}
          >
            <span ref={pillRef} className="glide-select__pill" aria-hidden="true" />
            {items.map((it, i) => (
              <div
                key={it.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === selected}
                data-index={i}
                className="glide-select__option"
              >
                <span className="glide-select__name">{it.label}</span>
                {showTags && it.tag ? (
                  <span className="glide-select__tag">{it.tag}</span>
                ) : null}
                <span
                  className="glide-select__check"
                  data-on={i === selected ? "" : undefined}
                  aria-hidden="true"
                >
                  <HugeIcon glyph={TICK_ICON} size={13} strokeWidth={2.5} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { GlideSelect };
