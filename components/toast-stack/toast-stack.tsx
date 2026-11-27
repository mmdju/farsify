"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CircleCheck, CircleX, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";

import "./toast-stack.css";

type Kind = "success" | "info" | "error" | "warning";
type Toast = { id: number; kind: Kind; title: string; body: string; action?: string };

const ICON: Record<Kind, LucideIcon> = {
  success: CircleCheck,
  info: Info,
  error: CircleX,
  warning: TriangleAlert,
};

const POOL: Omit<Toast, "id">[] = [
  { kind: "error", title: "پرداخت انجام نشد", body: "با یک کارت دیگه امتحان کن.", action: "دوباره" },
  { kind: "info", title: "رها به تیمت اضافه شد", body: "می‌تونه کامنت بذاره و کپی کنه." },
  { kind: "success", title: "brand-kit.zip آپلود شد", body: "توی «هفته لانچ» ذخیره شد." },
  { kind: "warning", title: "حجم ذخیره‌سازی ۹۲٪ پره", body: "بالای سقف، خروجی گرفتن متوقف می‌شه." },
  { kind: "success", title: "بلوک ذخیره شد", body: "دسته سواپ رفت توی موردعلاقه‌ها." },
];

const W = 300;
const H = 64;
const SHOWN = 3;
const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 1 } as const;

export interface ToastStackProps {
  peek?: number;
  gap?: number;
  corner?: number;
  surfaceColor?: string;
  textColor?: string;
  bodyColor?: string;
  successColor?: string;
  infoColor?: string;
  warningColor?: string;
  errorColor?: string;
  ariaLabel?: string;
  className?: string;
  autoPreview?: boolean;
}

export function ToastStack({
  peek = 14,
  gap = 10,
  corner = 20,
  surfaceColor = "#232323",
  textColor = "#fafafa",
  bodyColor = "#a3a3a7",
  successColor = "#22c55e",
  infoColor = "#7aa7ff",
  warningColor = "#f5b544",
  errorColor = "#e5484d",
  ariaLabel = "اعلان‌ها",
  className,
  autoPreview = false,
}: ToastStackProps) {
  const next = useRef(SHOWN);
  const [stack, setStack] = useState<Toast[]>(() =>
    POOL.slice(0, SHOWN).map((t, i) => ({ ...t, id: i })),
  );
  const [leaving, setLeaving] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const listH = SHOWN * H + (SHOWN - 1) * gap;
  const stackH = H + (SHOWN - 1) * peek;
  const FH = listH;

  const place = (k: number) => {
    if (open) {
      const top = (FH - listH) / 2;
      return { y: top + (SHOWN - 1 - k) * (H + gap), scale: 1 };
    }
    const top = (FH - stackH) / 2;
    const d = Math.min(k, SHOWN - 1);
    return { y: top + (SHOWN - 1 - d) * peek, scale: 1 - d * 0.05 };
  };

  const dismiss = (id: number) => {
    if (leaving !== null) return;
    setLeaving(id);
    window.setTimeout(() => {
      setStack((s) => {
        const rest = s.filter((t) => t.id !== id);
        const n = next.current++;
        const fresh = { ...POOL[n % POOL.length], id: n };
        return [fresh, ...rest];
      });
      setLeaving(null);
    }, 220);
  };

  const retry = (id: number) => {
    setStack((s) =>
      s.map((t) =>
        t.id === id
          ? {
              ...t,
              kind: "success",
              title: "پرداخت انجام شد",
              body: "مبلغ از کارتت کم شد.",
              action: undefined,
            }
          : t,
      ),
    );
  };

  const call = useRef({ dismiss, front: stack[0]?.id });
  call.current = { dismiss, front: stack[0]?.id };
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
      setOpen(true);
      at(1500, () => {
        const id = call.current.front;
        if (id !== undefined) call.current.dismiss(id);
      });
      at(3400, () => setOpen(false));
      at(4400, cycle);
    };
    at(600, cycle);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPreview]);

  return (
    <div
      ref={root}
      className={className ? `tst ${className}` : "tst"}
      role="region"
      aria-label={ariaLabel}
      data-open={open || undefined}
      style={
        {
          width: W,
          height: FH,
          "--tst-r": `${corner}px`,
          "--tst-surface": surfaceColor,
          "--tst-ink": textColor,
          "--tst-body": bodyColor,
          "--tst-success": successColor,
          "--tst-info": infoColor,
          "--tst-warning": warningColor,
          "--tst-error": errorColor,
        } as CSSProperties
      }
      onPointerOver={() => setOpen(true)}
      onPointerOut={(e) => {
        const to = e.relatedTarget as Node | null;
        if (!to || !root.current?.contains(to)) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      {stack.map((t, k) => {
        const Icon = ICON[t.kind];
        const out = leaving === t.id;
        const p = place(k);
        const front = k === 0;
        return (
          <motion.div
            key={t.id}
            className="tst-toast"
            data-kind={t.kind}
            data-front={front || undefined}
            style={{ height: H, zIndex: SHOWN - k }}
            initial={{ y: place(0).y + 24, scale: 1, opacity: 0, x: 0 }}
            animate={
              out
                ? { y: p.y, scale: p.scale, opacity: 0, x: -60 }
                : { y: p.y, scale: p.scale, opacity: 1, x: 0 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : out
                  ? { duration: 0.22, ease: [0.4, 0, 1, 1] }
                  : SPRING
            }
            aria-hidden={!open && !front ? true : undefined}
          >
            <span className="tst-icon">
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="tst-text">
              <b>{t.title}</b>
              <span>{t.body}</span>
            </span>
            {t.action && (
              <button
                type="button"
                className="tst-act"
                tabIndex={open || front ? 0 : -1}
                onClick={() => retry(t.id)}
              >
                {t.action}
              </button>
            )}
            <button
              type="button"
              className="tst-x"
              aria-label={`بستن اعلان ${t.title}`}
              tabIndex={open || front ? 0 : -1}
              onClick={() => dismiss(t.id)}
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ToastStack;
