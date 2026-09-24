"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, animate } from "framer-motion";

/** Counts up to `value` on mount/update. Falls back to the plain final value
 * immediately when the visitor has requested reduced motion. Non-numeric
 * values (e.g. "24/7") are rendered as-is, unanimated. */
export function AnimatedCounter({ value }: { value: number | string }) {
  const reduceMotion = useReducedMotion();
  const numeric = typeof value === "number" ? value : Number(value);
  const isNumeric = typeof value === "number" || (Number.isFinite(numeric) && String(value).trim() !== "");

  const spanRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!isNumeric || !spanRef.current) return;
    if (reduceMotion) {
      spanRef.current.textContent = String(numeric);
      return;
    }
    const controls = animate(motionValue, numeric, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (spanRef.current) spanRef.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, isNumeric, reduceMotion]);

  if (!isNumeric) return <>{value}</>;
  return <span ref={spanRef}>0</span>;
}
