"use client";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { cn } from "@/lib/utils";

export interface ServiceCtaProps {
  eyebrow?: string;
  heading: string;
  sub?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "blush" | "ink";
  className?: string;
}

/**
 * Compact mid-page consultation CTA card.
 * Keeps CTAs prominent without taking over the full viewport.
 */
export function ServiceCta({
  eyebrow,
  heading,
  sub,
  primaryCta,
  secondaryCta,
  variant = "blush",
  className,
}: ServiceCtaProps) {
  const isInk = variant === "ink";

  return (
    <section
      aria-labelledby="service-cta-heading"
      className={cn("bg-white px-container py-section-tight", className)}
    >
      <div
        className={cn(
          "mx-auto flex min-h-[30vh] max-w-content flex-col items-center justify-center rounded-2xl px-6 py-14 text-center shadow-card md:px-12",
          isInk
            ? "bg-ink-aurora text-text-inverse"
            : "bg-card-tinted text-text-primary",
        )}
      >
        {eyebrow ? (
          <p
            className={cn(
              "mb-4 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em]",
              isInk ? "text-rose-100" : "text-rose-700",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id="service-cta-heading"
          className="max-w-3xl font-cormorant text-display-3 font-medium leading-tight"
        >
          {heading}
        </h2>
        {sub ? (
          <p
            className={cn(
              "mt-5 max-w-2xl font-inter text-base leading-7",
              isInk ? "text-white/75" : "text-text-secondary",
            )}
          >
            {sub}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GlowCtaButton href={primaryCta.href} variant="primary">
            {primaryCta.label}
          </GlowCtaButton>
          {secondaryCta ? (
            <GlowCtaButton
              href={secondaryCta.href}
              variant={isInk ? "secondary" : "ghost"}
            >
              {secondaryCta.label}
            </GlowCtaButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ServiceCta;
