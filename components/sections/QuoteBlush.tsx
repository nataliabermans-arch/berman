"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export interface QuoteBlushProps {
  quote: string;
  attribution?: string;
  attributionTitle?: string;
  variant?: "blush" | "ink";
  className?: string;
}

/**
 * Centered editorial pull quote with oversized decorative quote glyphs.
 * Supports blush and dark ink aurora variants.
 */
export function QuoteBlush({
  quote,
  attribution,
  attributionTitle,
  variant = "blush",
  className,
}: QuoteBlushProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.5,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const isInk = variant === "ink";
  const glyphAnimation = prefersReducedMotion
    ? undefined
    : { opacity: [0.3, 0.5, 0.3] };
  const glyphTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 4, ease: [0.65, 0, 0.35, 1] as const, repeat: Infinity };

  return (
    <section
      ref={sectionRef}
      aria-label="Featured quote"
      className={cn(
        "relative isolate overflow-hidden px-container py-section text-center",
        isInk ? "bg-ink-aurora text-white" : "bg-rose-soft text-ink",
        className,
      )}
    >
      <Spotlight
        fill={isInk ? "#f4d4d4" : "#8a3a44"}
        className="left-1/4 top-0 opacity-15"
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.span
          aria-hidden="true"
          className={cn(
            "absolute -left-5 -top-16 font-cormorant text-[8rem] italic leading-none",
            isInk ? "text-rose-300/18" : "text-rose-300/70",
          )}
          animate={glyphAnimation}
          transition={glyphTransition}
        >
          “
        </motion.span>
        <motion.span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-20 -right-3 font-cormorant text-[8rem] italic leading-none",
            isInk ? "text-rose-300/18" : "text-rose-300/70",
          )}
          animate={glyphAnimation}
          transition={glyphTransition}
        >
          ”
        </motion.span>
        <motion.blockquote
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={
            prefersReducedMotion || isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 16 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative font-cormorant text-display-2 font-normal italic leading-[1.04]"
        >
          {quote}
        </motion.blockquote>
        {attribution ? (
          <p
            className={cn(
              "mt-8 font-dm-mono text-[0.7rem] uppercase tracking-[0.2em]",
              isInk ? "text-white/62" : "text-text-tertiary",
            )}
          >
            {attribution}
            {attributionTitle ? (
              <span className="block pt-2">{attributionTitle}</span>
            ) : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default QuoteBlush;
