"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";

import PracticeCard from "@/components/composites/PracticeCard";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { cn } from "@/lib/utils";

export interface PracticeCloudProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  practices: {
    iconName?: string;
    title: string;
    description: string;
    href?: string;
    cta?: string;
    variant?: "rose" | "ink";
  }[];
  className?: string;
}

/**
 * Dramatic dark practice section with pointer-tracked aurora and offset specialty cards.
 * Child PracticeCards provide their own pointer sheen variables.
 */
export function PracticeCloud({
  eyebrow = "The practice",
  heading,
  intro,
  practices,
  className,
}: PracticeCloudProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--mx",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--my",
      `${event.clientY - rect.top}px`,
    );
  }

  function handleMouseLeave(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    event.currentTarget.style.setProperty("--mx", "50%");
    event.currentTarget.style.setProperty("--my", "40%");
  }

  const cardTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="practice-cloud-heading"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative isolate overflow-hidden bg-ink-aurora px-container py-section text-white",
        className,
      )}
    >
      <AuroraBackground
        className="absolute inset-0 h-full min-h-full bg-transparent text-white opacity-60"
        showRadialGradient={false}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={
            {
              background:
                "radial-gradient(620px circle at var(--mx,50%) var(--my,20%), rgba(244,212,212,0.34), transparent 64%)",
            } as CSSProperties
          }
        />
      </AuroraBackground>

      <LazyMotion strict features={domAnimation}>
        <div className="relative z-10 mx-auto max-w-content-max">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-100">
              {eyebrow}
            </p>
            <h2
              id="practice-cloud-heading"
              className="mt-4 font-cormorant text-display-2 font-medium leading-none"
            >
              {heading}
            </h2>
            {intro ? (
              <p className="mt-5 font-inter text-lead text-white/72">{intro}</p>
            ) : null}
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {practices.map((practice, index) => (
              <div
                key={`${practice.title}-${index}`}
                className={cn(
                  index % 3 === 1 && "lg:translate-y-10",
                  index % 3 === 2 && "lg:-translate-y-4",
                  practices.length % 3 === 2 &&
                    index >= practices.length - 2 &&
                    "lg:translate-x-1/2",
                )}
              >
                <m.div
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 24, scale: 0.96 }
                  }
                  animate={
                    prefersReducedMotion || isInView
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 24, scale: 0.96 }
                  }
                  transition={{
                    ...cardTransition,
                    delay: prefersReducedMotion ? 0 : index * 0.08,
                  }}
                  className="h-full"
                >
                  <PracticeCard
                    {...practice}
                    variant={practice.variant ?? "rose"}
                    className="min-h-[300px] bg-press-tile"
                  />
                </m.div>
              </div>
            ))}
          </div>
        </div>
      </LazyMotion>
    </section>
  );
}

export default PracticeCloud;
