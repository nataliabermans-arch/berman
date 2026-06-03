"use client";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ServiceFinalCtaProps {
  eyebrow?: string;
  headline: string;
  sub?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  urgencyBadge?: string;
  backgroundSrc?: string;
  className?: string;
}

function renderAccentHeadline(headline: string) {
  const words = headline.trim().split(/\s+/);

  if (words.length < 2) {
    return <em className="font-normal italic">{headline}</em>;
  }

  const last = words.pop();

  return (
    <>
      {words.join(" ")}{" "}
      <em className="bg-rose-text bg-clip-text font-normal italic text-transparent">
        {last}
      </em>
    </>
  );
}

/**
 * Full-bleed dark final CTA for service detail pages.
 * Optional background image sits under an ink aurora overlay.
 */
export function ServiceFinalCta({
  eyebrow,
  headline,
  sub,
  primaryCta,
  secondaryCta,
  urgencyBadge,
  backgroundSrc,
  className,
}: ServiceFinalCtaProps) {
  return (
    <section
      aria-labelledby="service-final-cta-heading"
      className={cn(
        "relative isolate min-h-[60vh] overflow-hidden bg-ink-aurora px-container py-section text-text-inverse",
        className,
      )}
    >
      {backgroundSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundSrc}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover opacity-35"
        />
      ) : (
        <div
          data-needs-asset="cta-background"
          className="absolute inset-0 -z-20 bg-ink-aurora"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink-aurora opacity-90"
      />

      <div className="mx-auto flex min-h-[42vh] max-w-4xl flex-col items-center justify-center text-center">
        {urgencyBadge ? (
          <Badge className="mb-5 h-auto rounded-full bg-rose-700 px-4 py-2 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-white">
            {urgencyBadge}
          </Badge>
        ) : null}
        {eyebrow ? (
          <p className="mb-4 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em] text-rose-100">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id="service-final-cta-heading"
          className="font-cormorant text-display-2 font-medium leading-[0.98] text-balance"
        >
          {renderAccentHeadline(headline)}
        </h2>
        {sub ? (
          <p className="mt-6 max-w-2xl font-inter text-lg leading-8 text-white/75">
            {sub}
          </p>
        ) : null}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GlowCtaButton href={primaryCta.href} variant="primary" size="lg">
            {primaryCta.label}
          </GlowCtaButton>
          {secondaryCta ? (
            <GlowCtaButton
              href={secondaryCta.href}
              variant="secondary"
              size="lg"
            >
              {secondaryCta.label}
            </GlowCtaButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ServiceFinalCta;
