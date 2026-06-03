"use client";

import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { cn } from "@/lib/utils";

export interface ReadyCtaProps {
  eyebrow?: string;
  heading: string;
  sub?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundSrc?: string;
  className?: string;
}

/**
 * Full-bleed final CTA with optional background image and dark aurora overlay.
 * Missing backgrounds render a marked placeholder beneath the overlay.
 */
export function ReadyCta({
  eyebrow = "Ready when you are",
  heading,
  sub,
  primaryCta,
  secondaryCta,
  backgroundSrc,
  className,
}: ReadyCtaProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.4,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const enterTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ready-cta-heading"
      className={cn(
        "relative isolate flex min-h-[50vh] items-center overflow-hidden bg-ink text-white",
        className,
      )}
    >
      <LazyMotion strict features={domAnimation}>
        {backgroundSrc ? (
          <m.img
            src={backgroundSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-x-0 -inset-y-12 size-full h-[calc(100%+6rem)] object-cover"
            style={{ y: prefersReducedMotion ? 0 : backgroundY }}
          />
        ) : (
          <m.div
            data-needs-asset="cta-background"
            aria-hidden="true"
            className="absolute inset-x-0 -inset-y-12 h-[calc(100%+6rem)] bg-rose-mesh"
            style={{ y: prefersReducedMotion ? 0 : backgroundY }}
          />
        )}
        <div
          className="absolute inset-0 bg-ink-aurora opacity-70"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-container py-section text-center">
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={
              prefersReducedMotion || isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{ ...enterTransition, delay: 0 }}
            className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-100"
          >
            {eyebrow}
          </m.p>
          <m.h2
            id="ready-cta-heading"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={
              prefersReducedMotion || isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{
              ...enterTransition,
              delay: prefersReducedMotion ? 0 : 0.1,
            }}
            className="mt-4 font-cormorant text-display-2 font-medium leading-none"
          >
            {heading}
          </m.h2>
          {sub ? (
            <m.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={
                prefersReducedMotion || isInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16 }
              }
              transition={{
                ...enterTransition,
                delay: prefersReducedMotion ? 0 : 0.2,
              }}
              className="mx-auto mt-5 max-w-2xl font-inter text-lead text-white/75"
            >
              {sub}
            </m.p>
          ) : null}
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={
              prefersReducedMotion || isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{
              ...enterTransition,
              delay: prefersReducedMotion ? 0 : 0.3,
            }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <GlowCtaButton href={primaryCta.href} variant="primary" size="lg">
              {primaryCta.label}
            </GlowCtaButton>
            {secondaryCta ? (
              <GlowCtaButton
                href={secondaryCta.href}
                variant="ghost"
                size="lg"
                className="text-white hover:text-rose-100"
              >
                {secondaryCta.label}
              </GlowCtaButton>
            ) : null}
          </m.div>
        </div>
      </LazyMotion>
    </section>
  );
}

export default ReadyCta;
