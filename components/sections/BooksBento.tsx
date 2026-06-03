"use client";

import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";

import BookCard from "@/components/atoms/BookCard";
import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { MovingBorder } from "@/components/ui/moving-border";
import { cn } from "@/lib/utils";

export interface BooksBentoProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  books: {
    coverSrc?: string;
    title: string;
    subtitle?: string;
    year?: string;
    badge?: string;
    href?: string;
  }[];
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Bento-style book authority section with a featured 2x card and smaller supporting titles.
 * BookCard handles missing cover placeholders.
 */
export function BooksBento({
  eyebrow = "Books by Dr. Berman",
  heading,
  intro,
  books,
  cta,
  className,
}: BooksBentoProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const itemTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="books-bento-heading"
      className={cn(
        "overflow-hidden bg-card-tinted px-container py-section",
        className,
      )}
    >
      <div className="mx-auto max-w-content-max">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-700">
              {eyebrow}
            </p>
            <h2
              id="books-bento-heading"
              className="mt-4 font-cormorant text-display-2 font-medium leading-none text-ink"
            >
              {heading}
            </h2>
          </div>
          {intro ? (
            <p className="font-inter text-lead leading-relaxed text-text-secondary lg:pb-2">
              {intro}
            </p>
          ) : null}
        </div>

        <LazyMotion strict features={domAnimation}>
          <div className="relative mt-10 rounded-lg border border-white/70 bg-white/55 p-4 shadow-lift backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg opacity-50">
              <MovingBorder duration={5200} rx="1.25%" ry="1.25%">
                <div className="size-28 rounded-full bg-rose-300/70 blur-xl" />
              </MovingBorder>
            </div>
            <div className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr">
              {books.map((book, index) => (
                <m.div
                  key={`${book.title}-${index}`}
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
                    ...itemTransition,
                    delay: prefersReducedMotion ? 0 : index * 0.1,
                  }}
                  className={cn(
                    "h-full",
                    index === 0 && "md:col-span-2 lg:col-span-2 lg:row-span-2",
                    index > 0 && "lg:min-h-[300px]",
                  )}
                >
                  <BookCard {...book} className="h-full" />
                </m.div>
              ))}
            </div>
          </div>
        </LazyMotion>

        {cta ? (
          <div className="mt-8 flex justify-center">
            <GlowCtaButton href={cta.href}>{cta.label}</GlowCtaButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default BooksBento;
