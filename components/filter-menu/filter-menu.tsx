"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Bell,
  CalendarClock,
  Check,
  ListTodo,
  MapPin,
  PartyPopper,
  SlidersHorizontal,
  Video,
} from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FilterMenuItem = {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

export interface FilterMenuProps {
  items?: FilterMenuItem[];
  active?: string;
  defaultActive?: string;
  onChange?: (id: string) => void;
  accent?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DEFAULT_ITEMS: FilterMenuItem[] = [
  { id: "tasks", label: "کارها", icon: ListTodo },
  { id: "events", label: "رویدادها", icon: MapPin },
  { id: "reminders", label: "یادآورها", icon: Bell },
  { id: "appointments", label: "قرارها", icon: CalendarClock },
  { id: "meetings", label: "جلسه‌ها", icon: Video },
  { id: "celebrations", label: "جشن‌ها", icon: PartyPopper },
];

const SIZES = {
  sm: { circle: 64, panel: 256, icon: 26, row: 44 },
  md: { circle: 80, panel: 288, icon: 32, row: 48 },
  lg: { circle: 96, panel: 320, icon: 40, row: 52 },
} as const;

const SPRING = { type: "spring" as const, duration: 0.7, bounce: 0.3 };

export default function FilterMenu({
  items = DEFAULT_ITEMS,
  active,
  defaultActive,
  onChange,
  accent = "var(--foreground)",
  size = "md",
  className,
}: FilterMenuProps) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState(() => defaultActive ?? items[0]?.id ?? "");
  const current = active ?? inner;
  const selected = items.find((item) => item.id === current) ?? items[0];
  const SelectedIcon = selected?.icon;
  const scale = SIZES[size];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) listRef.current?.focus();
    else if (wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const panelHeight =
    items.length * scale.row + Math.max(items.length - 1, 0) * 2 + 8;

  const pick = (id: string) => {
    if (active === undefined) setInner(id);
    onChange?.(id);
    setOpen(false);
  };

  return (
    <div
      role="group"
      aria-label="فیلترها"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) setOpen(false);
      }}
      className={cn("flex items-center", className)}
    >
      <motion.div
        initial={false}
        animate={{
          width: open ? scale.panel : scale.circle,
          height: open ? panelHeight : scale.circle,
          borderRadius: open ? 20 : scale.circle / 2,
        }}
        transition={reduce ? { duration: 0 } : SPRING}
        className="relative z-10 shrink-0 overflow-hidden border border-border bg-accent shadow-md"
      >
        {open ? (
          <ul
            ref={listRef}
            tabIndex={-1}
            role="listbox"
            aria-label="انتخاب فیلتر"
            className="flex flex-col gap-0.5 p-1 outline-none"
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = item.id === current;
              return (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: reduce ? 0 : index * 0.03 }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => pick(item.id)}
                    style={{ height: scale.row }}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 text-start text-[14px] font-medium text-foreground transition-colors duration-100 hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex items-center gap-2.5">
                      {Icon && <Icon size={scale.icon} className="shrink-0 text-foreground" />}
                      <span className="leading-[1.4]">{item.label}</span>
                    </span>
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border",
                        isSelected && "border-transparent",
                      )}
                      style={
                        isSelected
                          ? { backgroundColor: accent, color: "var(--background)" }
                          : undefined
                      }
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            aria-label="انتخاب فیلتر"
            aria-haspopup="listbox"
            onClick={() => setOpen(true)}
            className="flex size-full items-center justify-center text-foreground focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary"
          >
            <SlidersHorizontal size={scale.icon} />
          </button>
        )}
      </motion.div>

      <div
        aria-hidden="true"
        style={{ width: scale.circle, height: scale.circle }}
        className="-ms-3 flex shrink-0 items-center justify-center rounded-full border border-border bg-accent text-foreground shadow-md"
      >
        {SelectedIcon && <SelectedIcon size={scale.icon} />}
      </div>
    </div>
  );
}
