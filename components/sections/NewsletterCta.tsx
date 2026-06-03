"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NewsletterCtaProps {
  eyebrow?: string;
  heading: string;
  blurb?: string;
  placeholder?: string;
  ctaLabel?: string;
  action?: string;
  className?: string;
}

/**
 * Centered newsletter CTA card with inline email signup and privacy note.
 * Form posts to the supplied action or a placeholder hash.
 */
export function NewsletterCta({
  eyebrow = "The Berman Brief",
  heading,
  blurb,
  placeholder = "your@email.com",
  ctaLabel = "Subscribe",
  action = "#",
  className,
}: NewsletterCtaProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.5,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      aria-labelledby="newsletter-cta-heading"
      className={cn("bg-rose-soft px-container py-section-tight", className)}
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={
          prefersReducedMotion || isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
        className="mx-auto max-w-2xl"
      >
        <Card className="rounded-lg border border-line bg-white/82 p-6 text-center shadow-card backdrop-blur-sm md:p-9">
          <p className="font-dm-mono text-[0.72rem] uppercase tracking-[0.22em] text-rose-700">
            {eyebrow}
          </p>
          <h2
            id="newsletter-cta-heading"
            className="mt-4 font-cormorant text-display-3 font-medium leading-tight text-ink md:text-display-2"
          >
            {heading}
          </h2>
          {blurb ? (
            <p className="mx-auto mt-4 max-w-xl font-inter text-base leading-7 text-text-secondary">
              {blurb}
            </p>
          ) : null}

          <form
            action={action}
            className="mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-[1fr_auto]"
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder={placeholder}
              className="h-12 rounded-full border-line bg-white px-5"
            />
            <GlowCtaButton
              href={action}
              variant="primary"
              size="sm"
              className="justify-center"
            >
              {ctaLabel}
            </GlowCtaButton>
          </form>
          <p className="mt-4 font-inter text-xs text-text-tertiary">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </Card>
      </motion.div>
    </section>
  );
}

export default NewsletterCta;
