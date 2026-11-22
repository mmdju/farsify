"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import "./accordion-os.css";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toFaDigits(input: string | number) {
  return String(input).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
}

export interface AccordionItem {
  id?: string | number;
  title: string;
  badge?: string;
  claim: string;
  image: string;
  alt?: string;
}

export interface AccordionOSProps {
  items?: AccordionItem[];
  staticImage?: string;
  defaultActiveIndex?: number | null;
  className?: string;
  containerHeight?: number | string;
  containerWidth?: number | string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  onItemChange?: (index: number | null) => void;
}

const artwork = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='hsl(${hue},16%,24%)'/%3E%3Cstop offset='1' stop-color='hsl(${hue},18%,38%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3C/svg%3E`;

const DEFAULT_ITEMS: AccordionItem[] = [
  {
    id: 1,
    title: "مرکز‌یابی",
    badge: "01",
    claim:
      "گِل رو ببر دقیقاً وسطِ چرخ. تا وقتی لرزشش راه نیفتاده، هیچ کاری که بعدش بکنی دوام نمیاره.",
    image: artwork(18),
    alt: "مرکزآوردن گِل خیس روی چرخ سفالگری",
  },
  {
    id: 2,
    title: "کشیدن دیواره",
    badge: "02",
    claim:
      "دو انگشت داخل، یکی بیرون. آروم و یکنواخت بکش؛ دیواره یا بلند می‌شه یا فرو می‌ریزه.",
    image: artwork(30),
    alt: "کشیدن دیوارهٔ کاسه روی چرخ",
  },
  {
    id: 3,
    title: "آماده‌سازی لعاب",
    badge: "03",
    claim:
      "اکسیدها رو توی کاسه‌های کوچیک ترکیب کن و روی خرده‌کاشی تست بزن. آخرِ کار کوره‌ست که نظر نهایی رو میده.",
    image: artwork(190),
    alt: "کاسه‌های لعاب رنگی روی میز استودیو",
  },
  {
    id: 4,
    title: "تراش‌کاری",
    badge: "04",
    claim:
      "حلقهٔ پایه رو وقتی کاسه هنوز چرم‌سفتی داره برش بزن. یه برشِ عمیقِ اضافه، ماه‌ها کار رو می‌فرسته توی حلب.",
    image: artwork(45),
    alt: "تراش کاسهٔ سرامیکی پهن در استودیو",
  },
  {
    id: 5,
    title: "کار نهایی",
    badge: "05",
    claim:
      "صدای ترکِ موقع خنک‌شدن، درهایی که جا می‌شینن و دسته‌هایی که برای چایِ داغ کلفتِ کافی‌ان. کوره امضاش رو زده.",
    image: artwork(210),
    alt: "کاسه و گلدان‌های دست‌ساز سرامیکی در ویترین",
  },
];

const DEFAULT_STATIC_IMAGE = artwork(25);

const springPhysics: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 32,
  mass: 0.9,
};

const softSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export default function AccordionOS({
  items = DEFAULT_ITEMS,
  staticImage = DEFAULT_STATIC_IMAGE,
  defaultActiveIndex = 0,
  className = "",
  containerHeight = 520,
  containerWidth = 840,
  autoPlay = true,
  autoPlayInterval = 3500,
  pauseOnHover = true,
  onItemChange,
}: AccordionOSProps) {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex);
  const [isHovered, setIsHovered] = useState(false);
  const spring: Transition = reduce ? { duration: 0 } : springPhysics;
  const soft: Transition = reduce ? { duration: 0 } : softSpring;

  const handleToggle = useCallback(
    (index: number) => {
      const next = activeIndex === index ? null : index;
      setActiveIndex(next);
      onItemChange?.(next);
    },
    [activeIndex, onItemChange],
  );

  const handlePrev = useCallback(() => {
    const next =
      activeIndex === null ? 0 : activeIndex > 0 ? activeIndex - 1 : items.length - 1;
    setActiveIndex(next);
    onItemChange?.(next);
  }, [activeIndex, items.length, onItemChange]);

  const handleNext = useCallback(() => {
    const next =
      activeIndex === null ? 0 : activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(next);
    onItemChange?.(next);
  }, [activeIndex, items.length, onItemChange]);

  useEffect(() => {
    if (!autoPlay || reduce || (pauseOnHover && isHovered)) return;

    const interval = setInterval(() => {
      handleNext();
    }, Math.max(500, autoPlayInterval));

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, pauseOnHover, isHovered, handleNext, reduce]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveIndex(null);
        onItemChange?.(null);
      } else if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const num = parseInt(e.key, 10) - 1;
        if (num < items.length) {
          e.preventDefault();
          setActiveIndex(num);
          onItemChange?.(num);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleNext, handlePrev, items.length, onItemChange]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`accordion-os-root ${className}`}
      style={{
        width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
        maxWidth: "100%",
      }}
    >
      <motion.div
        className="accordion-os-card"
        style={{
          height: typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight,
        }}
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="accordion-os-sidebar">
          <div className="accordion-os-items-stack">
            {items.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <motion.div
                  key={item.id ?? index}
                  animate={{ width: isOpen ? 290 : "auto" }}
                  transition={spring}
                  onClick={() => handleToggle(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggle(index);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                  whileHover={{ scale: isOpen ? 1.005 : 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className={`accordion-os-pill ${isOpen ? "accordion-os-pill-open" : "accordion-os-pill-closed"}`}
                >
                  <div className="accordion-os-title-stack">
                    <motion.div
                      className="accordion-os-icon-btn"
                      animate={{
                        backgroundColor: isOpen ? "rgba(2, 2, 2, 0.9)" : "rgba(255, 255, 255, 0.8)",
                        color: isOpen ? "#ffffff" : "rgb(2, 2, 2)",
                        borderColor: isOpen ? "rgba(0, 0, 0, 0.8)" : "rgba(2, 2, 2, 0.2)",
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      transition={soft}
                    >
                      <motion.svg
                        viewBox="0 0 24 24"
                        className="accordion-os-svg-icon"
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={soft}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </motion.svg>
                    </motion.div>

                    <div className="accordion-os-title-wrapper">
                      <span className="accordion-os-title-text">{item.title}</span>
                      {isOpen && item.badge ? (
                        <span className="accordion-os-pill-badge accordion-os-pill-badge-active">
                          {toFaDigits(item.badge)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="claim-content"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: 12,
                          transition: {
                            height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.22, delay: 0.04 },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          marginTop: 0,
                          transition: {
                            height: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.18 },
                          },
                        }}
                        className="accordion-os-claim-container"
                      >
                        <p className="accordion-os-claim-text">{item.claim}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="accordion-os-visual-wrapper">
          <motion.div
            className="accordion-os-image-layer"
            initial={false}
            animate={{
              opacity: activeIndex === null ? 1 : 0,
              zIndex: activeIndex === null ? 2 : 1,
            }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
          >
            <img
              src={staticImage}
              alt="سفال‌های دست‌ساز روی قفسهٔ استودیو"
              className="accordion-os-image"
              loading="eager"
              decoding="async"
            />
          </motion.div>

          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <motion.div
                key={item.id ?? idx}
                className="accordion-os-image-layer"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 3 : 1,
                }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  className="accordion-os-image"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            );
          })}
        </div>

        <div className="accordion-os-bottom-deck">
          <AnimatePresence>
            {activeIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={soft}
                className="accordion-os-nav-stack"
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="قبلی"
                  className="accordion-os-nav-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="accordion-os-nav-svg">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>

                <div className="accordion-os-counter">
                  <span>{toFaDigits(String((activeIndex ?? 0) + 1).padStart(2, "0"))}</span>
                  <span className="accordion-os-counter-divider">/</span>
                  <span>{toFaDigits(String(items.length).padStart(2, "0"))}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="بعدی"
                  className="accordion-os-nav-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="accordion-os-nav-svg">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
